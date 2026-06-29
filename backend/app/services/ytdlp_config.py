from __future__ import annotations

import base64
import hashlib
from pathlib import Path
from typing import Any

from app.config import get_settings

_COOKIE_PATH: Path | None = None


def _cookie_dir() -> Path:
    cookie_dir = get_settings().temp_dir.parent
    cookie_dir.mkdir(parents=True, exist_ok=True)
    return cookie_dir


def _write_cookiefile_from_base64(raw: str, *, suffix: str = "") -> Path:
    content = base64.b64decode(raw.strip(), validate=True)
    if not content.strip():
        raise ValueError("YouTube cookies payload decoded to an empty file")

    digest = hashlib.sha256(content).hexdigest()[:16]
    path = _cookie_dir() / f"youtube_cookies{suffix}_{digest}.txt"
    if not path.exists():
        path.write_bytes(content)
    return path


def _write_env_cookiefile() -> Path | None:
    global _COOKIE_PATH

    settings = get_settings()
    raw = settings.youtube_cookies_base64.strip() if settings.youtube_cookies_base64 else ""
    if not raw:
        _COOKIE_PATH = None
        return None

    try:
        _COOKIE_PATH = _write_cookiefile_from_base64(raw, suffix="_env")
    except Exception as exc:
        raise ValueError("YOUTUBE_COOKIES_BASE64 is not valid base64") from exc

    return _COOKIE_PATH


def youtube_cookies_configured() -> bool:
    settings = get_settings()
    return bool(settings.youtube_cookies_base64 and settings.youtube_cookies_base64.strip())


def cookiefile_path(cookies_base64: str | None = None) -> Path | None:
    global _COOKIE_PATH

    if cookies_base64 and cookies_base64.strip():
        try:
            return _write_cookiefile_from_base64(cookies_base64)
        except Exception as exc:
            raise ValueError("Invalid YouTube cookies payload") from exc

    if not youtube_cookies_configured():
        return None

    if _COOKIE_PATH is None or not _COOKIE_PATH.exists():
        return _write_env_cookiefile()

    return _COOKIE_PATH


def build_ydl_opts(
    extra: dict[str, Any] | None = None,
    cookies_base64: str | None = None,
) -> dict[str, Any]:
    opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "extractor_args": {
            "youtube": {
                # web first when cookies are present; android helps on some networks.
                "player_client": ["web", "android", "tv_embedded"],
            }
        },
    }

    cookie_path = cookiefile_path(cookies_base64)
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


def is_bot_check_error(message: str) -> bool:
    lowered = message.lower()
    return "not a bot" in lowered or "sign in to confirm" in lowered


def cookies_source(cookies_base64: str | None = None) -> str:
    """Report which cookie source applies to a request: 'request', 'server', or 'none'."""
    if cookies_base64 and cookies_base64.strip():
        return "request"
    if youtube_cookies_configured():
        return "server"
    return "none"


def bot_check_message(cookies_base64: str | None = None) -> str:
    """Build a bot-check error message that states whether cookies were applied."""
    source = cookies_source(cookies_base64)
    if source == "request":
        return (
            "YouTube blocked this request (bot check) even though your uploaded cookies "
            "were applied. That points at the server's IP being flagged by YouTube rather "
            "than a cookie problem. Try re-exporting fresh cookies while signed in; if it "
            "still fails, the server needs a PO token or a non-datacenter IP."
        )
    if source == "server":
        return (
            "YouTube blocked this request (bot check) even though server cookies "
            "(YOUTUBE_COOKIES_BASE64) were applied. The server's IP is likely flagged by "
            "YouTube. Re-export fresh cookies, or add a PO token / non-datacenter IP."
        )
    return (
        "YouTube blocked this request (bot check). No YouTube cookies were sent with this "
        "request. Add YouTube cookies in DgLabs Settings, or set YOUTUBE_COOKIES_BASE64 on "
        "Railway."
    )
