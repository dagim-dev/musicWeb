from fastapi import APIRouter

from app.services.converter import ffmpeg_version
from app.services.youtube import get_ytdlp_version

router = APIRouter()


@router.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "ffmpeg": ffmpeg_version(),
        "ytdlp_version": get_ytdlp_version(),
    }
