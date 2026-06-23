from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from app.config import get_settings
from app.models.analyze import TrackEntry
from app.models.download import DownloadMode, JobSnapshot, JobStage, TrackStatus
from app.services.converter import convert_to_mp3
from app.services.metadata import build_filename, fetch_thumbnail, tag_mp3
from app.services.youtube import analyze_url, best_thumbnail_url, cleanup_dir, download_audio, resolve_artist_title
from app.sockets.events import emit_job_complete, emit_job_started, emit_track_complete, emit_track_error, emit_track_progress


@dataclass
class JobRecord:
    job_id: str
    url: str
    mode: DownloadMode
    entries: list[TrackEntry]
    album: str | None
    status: str = "pending"
    tracks: list[TrackStatus] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    cancelled: bool = False
    task: asyncio.Task | None = None

    @property
    def job_dir(self) -> Path:
        return get_settings().temp_dir / self.job_id

    def snapshot(self) -> JobSnapshot:
        completed = sum(1 for t in self.tracks if t.stage == JobStage.done)
        zip_ready = (
            self.mode == DownloadMode.zip
            and completed > 0
            and completed == sum(1 for t in self.tracks if t.stage in (JobStage.done, JobStage.error))
            and any(t.stage == JobStage.done for t in self.tracks)
        )
        return JobSnapshot(
            job_id=self.job_id,
            status=self.status,  # type: ignore[arg-type]
            mode=self.mode,
            total_tracks=len(self.tracks),
            completed_tracks=completed,
            tracks=self.tracks,
            zip_ready=zip_ready,
        )


class JobManager:
    def __init__(self) -> None:
        self._jobs: dict[str, JobRecord] = {}
        self._ip_jobs: dict[str, set[str]] = {}
        self._lock = asyncio.Lock()

    def get(self, job_id: str) -> JobRecord | None:
        return self._jobs.get(job_id)

    async def create_job(
        self,
        url: str,
        entry_ids: list[str] | None,
        mode: DownloadMode,
        client_ip: str,
    ) -> JobRecord:
        settings = get_settings()
        async with self._lock:
            active = self._ip_jobs.get(client_ip, set())
            if len(active) >= settings.max_concurrent_jobs_per_ip:
                raise ValueError("Too many concurrent jobs. Please wait for current downloads to finish.")

        analyzed = analyze_url(url)
        selected = analyzed.entries
        if entry_ids:
            id_set = set(entry_ids)
            selected = [e for e in analyzed.entries if e.id in id_set]

        if not selected:
            raise ValueError("No tracks selected for download")
        if len(selected) > settings.max_tracks_per_job:
            raise ValueError(f"Maximum {settings.max_tracks_per_job} tracks per job")

        job_id = str(uuid.uuid4())
        tracks = [
            TrackStatus(
                index=i,
                entry_id=entry.id,
                title=entry.title,
                artist=entry.artist,
            )
            for i, entry in enumerate(selected)
        ]

        job = JobRecord(
            job_id=job_id,
            url=url,
            mode=mode,
            entries=selected,
            album=analyzed.album or analyzed.title,
            status="pending",
            tracks=tracks,
        )
        self._jobs[job_id] = job
        async with self._lock:
            self._ip_jobs.setdefault(client_ip, set()).add(job_id)

        job.task = asyncio.create_task(self._run_job(job))
        return job

    async def cancel_job(self, job_id: str) -> bool:
        job = self._jobs.get(job_id)
        if not job:
            return False
        job.cancelled = True
        job.status = "cancelled"
        for track in job.tracks:
            if track.stage not in (JobStage.done, JobStage.error):
                track.stage = JobStage.cancelled
        if job.task and not job.task.done():
            job.task.cancel()
        cleanup_dir(job.job_dir)
        return True

    async def cleanup_expired_jobs(self) -> int:
        settings = get_settings()
        now = datetime.now(timezone.utc)
        removed = 0
        for job_id, job in list(self._jobs.items()):
            if job.status not in ("complete", "error", "cancelled"):
                continue
            age = (now - job.created_at).total_seconds()
            if age < settings.job_ttl_seconds:
                continue
            cleanup_dir(job.job_dir)
            del self._jobs[job_id]
            for ip_jobs in self._ip_jobs.values():
                ip_jobs.discard(job_id)
            removed += 1
        return removed

    async def _run_job(self, job: JobRecord) -> None:
        job.status = "running"
        await emit_job_started(job.job_id, len(job.tracks))
        completed_files: list[tuple[str, Path]] = []

        try:
            for track, entry in zip(job.tracks, job.entries):
                if job.cancelled:
                    break
                await self._process_track(job, track, entry)
                if track.stage == JobStage.done and track.file_name:
                    mp3_path = job.job_dir / str(track.index) / track.file_name
                    if mp3_path.exists():
                        completed_files.append((track.file_name, mp3_path))

            if job.cancelled:
                return

            job.status = "complete"
            zip_url = (
                f"/api/v1/jobs/{job.job_id}/zip"
                if job.mode == DownloadMode.zip and completed_files
                else None
            )
            await emit_job_complete(job.job_id, zip_url)
        except Exception as exc:
            job.status = "error"
            await emit_track_error(job.job_id, 0, str(exc))
        finally:
            for ip_jobs in self._ip_jobs.values():
                ip_jobs.discard(job.job_id)

    async def _process_track(self, job: JobRecord, track: TrackStatus, entry: TrackEntry) -> None:
        track_dir = job.job_dir / str(track.index)
        track_dir.mkdir(parents=True, exist_ok=True)
        video_url = f"https://www.youtube.com/watch?v={entry.id}"

        async def set_progress(stage: JobStage, percent: int, message: str) -> None:
            track.stage = stage
            track.percent = percent
            track.message = message
            await emit_track_progress(job.job_id, track.index, stage.value, percent, message)

        try:
            await set_progress(JobStage.downloading, 0, "Downloading audio")

            audio_path, video_info = await asyncio.to_thread(
                download_audio,
                video_url,
                track_dir,
                None,
            )

            artist, title = resolve_artist_title(video_info)
            if artist == "Unknown Artist" and entry.artist != "Unknown Artist":
                artist = entry.artist

            await set_progress(JobStage.converting, 0, "Converting to MP3")

            mp3_name = build_filename(artist, title)
            mp3_path = track_dir / mp3_name

            async def convert_progress(percent: int, message: str) -> None:
                await set_progress(JobStage.converting, percent, message)

            await convert_to_mp3(audio_path, mp3_path, on_progress=convert_progress)

            await set_progress(JobStage.tagging, 0, "Embedding metadata")
            thumbnail_url = best_thumbnail_url(video_info) or entry.thumbnail
            cover = await fetch_thumbnail(thumbnail_url)
            await asyncio.to_thread(
                tag_mp3,
                mp3_path,
                title=title,
                artist=artist,
                album=job.album,
                track_number=entry.track_number or (track.index + 1),
                cover_bytes=cover,
            )

            await set_progress(JobStage.delivering, 100, "Ready for download")
            track.file_name = mp3_name
            track.stage = JobStage.done
            track.title = title
            track.artist = artist
            download_url = f"/api/v1/jobs/{job.job_id}/tracks/{track.index}/file"
            await emit_track_complete(job.job_id, track.index, mp3_name, download_url, artist, title)
        except Exception as exc:
            track.stage = JobStage.error
            track.error = str(exc)
            await emit_track_error(job.job_id, track.index, str(exc))


job_manager = JobManager()
