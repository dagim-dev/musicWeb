from fastapi import Request

from app.config import get_settings

COOKIES_HEADER = "x-youtube-cookies-base64"


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def get_youtube_cookies_base64(request: Request) -> str | None:
    header = request.headers.get(COOKIES_HEADER)
    if header and header.strip():
        return header.strip()

    settings = get_settings()
    if settings.youtube_cookies_base64 and settings.youtube_cookies_base64.strip():
        return settings.youtube_cookies_base64.strip()

    return None
