from __future__ import annotations

import re
import shutil
from pathlib import Path
from typing import Any

import yt_dlp

from app.models.analyze import AnalyzeResponse, TrackEntry

_TITLE_SUFFIX_RE = re.compile(
    r"\s*[\(\[](?:official\s*(?:music\s*)?video|audio|lyric(?:s)?\s*video|visualizer|mv|4k|hd|remaster(?:ed)?|prod\.?|ft\.?|feat\.?)[\)\]]\s*$",
    re.IGNORECASE,
)
_TITLE_SEPARATORS = (" - ", " – ", " — ", " | ", ": ")


def _sanitize_filename(value: str) -> str:
    cleaned = re.sub(r'[<>:"/\\|?*]', "", value).strip()
    return cleaned or "Unknown"


def _strip_video_suffix(title: str) -> str:
    previous = None
    current = title.strip()
    while current != previous:
        previous = current
        current = _TITLE_SUFFIX_RE.sub("", current).strip()
    return current or title


def _channel_name(info: dict[str, Any]) -> str | None:
    for key in ("artist", "creator", "album_artist", "uploader", "channel"):
        value = info.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


def resolve_artist_title(info: dict[str, Any]) -> tuple[str, str]:
    raw_title = info.get("title") or info.get("track") or "Untitled"
    channel = _channel_name(info)

    for separator in _TITLE_SEPARATORS:
        if separator not in raw_title:
            continue
        left, right = raw_title.split(separator, 1)
        artist = left.strip()
        title = _strip_video_suffix(right.strip())
        if artist and title:
            return artist, title

    title = _strip_video_suffix(raw_title.strip())
    if channel:
        return channel, title
    return "Unknown Artist", title


def best_thumbnail_url(info: dict[str, Any]) -> str | None:
    thumbnail = info.get("thumbnail")
    if isinstance(thumbnail, str) and thumbnail.strip():
        return thumbnail

    thumbnails = info.get("thumbnails") or []
    if thumbnails:
        best = max(thumbnails, key=lambda item: item.get("height") or item.get("width") or 0)
        url = best.get("url")
        if isinstance(url, str) and url.strip():
            return url

    video_id = info.get("id")
    if isinstance(video_id, str) and video_id.strip():
        return f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    return None


def _entry_from_info(info: dict[str, Any], album: str | None, index: int | None) -> TrackEntry:
    artist, title = resolve_artist_title(info)
    return TrackEntry(
        id=info.get("id", ""),
        title=title,
        artist=artist,
        duration=info.get("duration"),
        thumbnail=best_thumbnail_url(info),
        track_number=info.get("playlist_index") or index,
    )


def analyze_url(url: str) -> AnalyzeResponse:
    ydl_opts: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": "in_playlist",
        "skip_download": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    if info is None:
        raise ValueError("Could not extract information from URL")

    if info.get("_type") == "playlist" or info.get("entries"):
        entries_raw = info.get("entries") or []
        album = info.get("title")
        entries: list[TrackEntry] = []
        for idx, entry in enumerate(entries_raw, start=1):
            if entry is None:
                continue
            if entry.get("url") is None and entry.get("id"):
                entry = {**entry, "url": f"https://www.youtube.com/watch?v={entry['id']}"}
            if entry.get("_type") == "url" and not entry.get("title"):
                with yt_dlp.YoutubeDL({"quiet": True, "skip_download": True}) as ydl:
                    entry = ydl.extract_info(entry["url"], download=False) or entry
            entries.append(_entry_from_info(entry, album, idx))

        return AnalyzeResponse(
            type="playlist",
            title=info.get("title") or "Playlist",
            album=album,
            entries=entries,
        )

    return AnalyzeResponse(
        type="video",
        title=info.get("title") or "Video",
        album=info.get("album") or info.get("playlist_title"),
        entries=[_entry_from_info(info, info.get("playlist_title"), info.get("playlist_index"))],
    )


def download_audio(
    url: str,
    output_dir: Path,
    progress_hook: Any | None = None,
) -> tuple[Path, dict[str, Any]]:
    output_dir.mkdir(parents=True, exist_ok=True)
    outtmpl = str(output_dir / "audio.%(ext)s")

    ydl_opts: dict[str, Any] = {
        "format": "bestaudio/best/b",
        "outtmpl": outtmpl,
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
    }
    if progress_hook:
        ydl_opts["progress_hooks"] = [progress_hook]

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    if info is None:
        raise ValueError("Download failed")

    candidates = list(output_dir.glob("audio.*"))
    if not candidates:
        raise FileNotFoundError("Downloaded audio file not found")

    return candidates[0], info


def get_ytdlp_version() -> str:
    try:
        return yt_dlp.version.__version__
    except Exception:
        return "unknown"


def cleanup_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path, ignore_errors=True)
