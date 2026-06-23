from __future__ import annotations

from __future__ import annotations

import io
from pathlib import Path

import httpx
from mutagen.id3 import APIC, ID3, TALB, TIT2, TPE1, TRCK, ID3NoHeaderError
from PIL import Image

from app.services.youtube import _sanitize_filename


async def fetch_thumbnail(url: str | None) -> bytes | None:
    if not url:
        return None

    candidates = [url]
    if "maxresdefault" in url:
        candidates.append(url.replace("maxresdefault", "hqdefault"))
    elif "hqdefault" in url:
        candidates.append(url.replace("hqdefault", "mqdefault"))

    for candidate in candidates:
        try:
            async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
                response = await client.get(candidate)
                response.raise_for_status()
                if response.content:
                    return response.content
        except Exception:
            continue
    return None


def _resize_cover(image_bytes: bytes, size: int = 500) -> bytes:
    with Image.open(io.BytesIO(image_bytes)) as img:
        img = img.convert("RGB")
        img.thumbnail((size, size), Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=90)
        return buffer.getvalue()


def tag_mp3(
    mp3_path: Path,
    *,
    title: str,
    artist: str,
    album: str | None,
    track_number: int | None,
    cover_bytes: bytes | None,
) -> Path:
    try:
        tags = ID3(mp3_path)
    except ID3NoHeaderError:
        tags = ID3()

    tags.delall("TIT2")
    tags.delall("TPE1")
    tags.delall("TALB")
    tags.delall("TRCK")
    tags.delall("APIC")

    tags.add(TIT2(encoding=3, text=title))
    tags.add(TPE1(encoding=3, text=artist))
    if album:
        tags.add(TALB(encoding=3, text=album))
    if track_number is not None:
        tags.add(TRCK(encoding=3, text=str(track_number)))

    if cover_bytes:
        processed = _resize_cover(cover_bytes)
        tags.add(
            APIC(
                encoding=0,
                mime="image/jpeg",
                type=3,
                desc="Cover",
                data=processed,
            )
        )

    tags.save(mp3_path, v2_version=3)
    return mp3_path


def build_filename(artist: str, title: str) -> str:
    return f"{_sanitize_filename(artist)} - {_sanitize_filename(title)}.mp3"
