from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.deps import get_client_ip
from app.services.zip_builder import iter_zip_stream
from app.models.download import CreateJobRequest, CreateJobResponse, DownloadMode, JobSnapshot, JobStage
from app.services.job_manager import job_manager

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/jobs", response_model=CreateJobResponse)
@limiter.limit("20/minute")
async def create_job(request: Request, body: CreateJobRequest) -> CreateJobResponse:
    client_ip = get_client_ip(request)
    try:
        job = await job_manager.create_job(body.url, body.entry_ids, body.mode, client_ip)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return CreateJobResponse(job_id=job.job_id)


@router.get("/jobs/{job_id}", response_model=JobSnapshot)
async def get_job(job_id: str) -> JobSnapshot:
    job = job_manager.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job.snapshot()


@router.get("/jobs/{job_id}/tracks/{index}/file")
async def download_track_file(job_id: str, index: int) -> FileResponse:
    job = job_manager.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if index < 0 or index >= len(job.tracks):
        raise HTTPException(status_code=404, detail="Track not found")

    track = job.tracks[index]
    if not track.file_name:
        raise HTTPException(status_code=404, detail="Track file not ready")

    file_path = job.job_dir / str(index) / track.file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        media_type="audio/mpeg",
        filename=track.file_name,
    )


@router.get("/jobs/{job_id}/zip")
async def download_zip(job_id: str) -> StreamingResponse:
    job = job_manager.get(job_id)
    if not job or job.mode != DownloadMode.zip:
        raise HTTPException(status_code=404, detail="ZIP not available")

    files: list[tuple[str, Path]] = []
    for track in job.tracks:
        if track.stage != JobStage.done or not track.file_name:
            continue
        file_path = job.job_dir / str(track.index) / track.file_name
        if file_path.exists():
            files.append((track.file_name, file_path))

    if not files:
        raise HTTPException(status_code=404, detail="ZIP not available")

    return StreamingResponse(
        iter_zip_stream(files),
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="playlist.zip"'},
    )


@router.delete("/jobs/{job_id}")
async def cancel_job(job_id: str) -> dict:
    cancelled = await job_manager.cancel_job(job_id)
    if not cancelled:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "cancelled"}
