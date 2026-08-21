from __future__ import annotations

from __future__ import annotations

import socketio

from app.config import get_settings

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=get_settings().cors_origin_list,
)


def job_room(job_id: str) -> str:
    return f"job:{job_id}"


@sio.event
async def connect(sid, environ, auth):  # type: ignore[no-untyped-def]
    return True


@sio.event
async def join_job(sid, data):  # type: ignore[no-untyped-def]
    job_id = (data or {}).get("job_id")
    if job_id:
        await sio.enter_room(sid, job_room(job_id))


async def emit_job_started(job_id: str, total_tracks: int) -> None:
    await sio.emit("job:started", {"total_tracks": total_tracks}, room=job_room(job_id))


async def emit_track_progress(
    job_id: str,
    index: int,
    stage: str,
    percent: int,
    message: str,
) -> None:
    await sio.emit(
        "track:progress",
        {"index": index, "stage": stage, "percent": percent, "message": message},
        room=job_room(job_id),
    )


async def emit_track_complete(
    job_id: str,
    index: int,
    file_name: str,
    download_url: str,
    artist: str,
    title: str,
) -> None:
    await sio.emit(
        "track:complete",
        {
            "index": index,
            "file_name": file_name,
            "download_url": download_url,
            "artist": artist,
            "title": title,
        },
        room=job_room(job_id),
    )


async def emit_track_error(job_id: str, index: int, error: str) -> None:
    await sio.emit("track:error", {"index": index, "error": error}, room=job_room(job_id))


async def emit_job_complete(job_id: str, zip_url: str | None) -> None:
    await sio.emit("job:complete", {"zip_url": zip_url}, room=job_room(job_id))
