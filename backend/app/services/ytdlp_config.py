from __future__ import annotations

import base64
from pathlib import Path
from typing import Any

from app.config import get_settings

_COOKIE_PATH: Path | None = None


def _write_cookiefile() -> Path | None:
    global _COOKIE_PATH

    settings = get_settings()
    raw = settings.youtube_cookies_base64.strip() if settings.youtube_cookies_base64 else ""
    if not raw:
        _COOKIE_PATH = None
        return None

    cookie_dir = settings.temp_dir.parent
    cookie_dir.mkdir(parents=True, exist_ok=True)
    path = cookie_dir / "youtube_cookies.txt"

    try:
        content = base64.b64decode(raw, validate=True)
    except Exception as exc:
        raise ValueError("YOUTUBE_COOKIES_BASE64 is not valid base64") from exc

    if not content.strip():
        raise ValueError("YOUTUBE_COOKIES_BASE64 decoded to an empty file")

    path.write_bytes(content)
    _COOKIE_PATH = path
    return path


def youtube_cookies_configured() -> bool:
    settings = get_settings()
    return bool(settings.youtube_cookies_base64 and settings.youtube_cookies_base64.strip())


def cookiefile_path() -> Path | None:
    global _COOKIE_PATH

    if not youtube_cookies_configured():
        return None

    if _COOKIE_PATH is None or not _COOKIE_PATH.exists():
        return _write_cookiefile()

    return _COOKIE_PATH


def build_ydl_opts(extra: dict[str, Any] | None = None) -> dict[str, Any]:
    opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "extractor_args": {
            "youtube": {
                # Helps on some networks; cookies are still required on cloud IPs.
                "player_client": ["android", "web"],
            }
        },
    }

    cookie_path = cookiefile_path()
    if cookie_path is not None:
        opts["cookiefile"] = str(cookie_path)

    if extra:
        opts.update(extra)
        if "extractor_args" in extra:
            opts["extractor_args"] = {
                **opts.get("extractor_args", {}),
                **extra["extractor_args"],
            }

    return opts
