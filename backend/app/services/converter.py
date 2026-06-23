from __future__ import annotations

from __future__ import annotations

import asyncio
import re
import shutil
from collections.abc import Awaitable, Callable
from pathlib import Path
from typing import Optional, Union

ProgressCallback = Callable[[int, str], Optional[Union[Awaitable[None], None]]]


def _ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


def _parse_duration(stderr_line: str) -> float | None:
    match = re.search(r"Duration: (\d{2}):(\d{2}):(\d{2}\.\d+)", stderr_line)
    if not match:
        return None
    hours, minutes, seconds = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


def _parse_time(stderr_line: str) -> float | None:
    match = re.search(r"time=(\d{2}):(\d{2}):(\d{2}\.\d+)", stderr_line)
    if not match:
        return None
    hours, minutes, seconds = match.groups()
    return int(hours) * 3600 + int(minutes) * 60 + float(seconds)


async def convert_to_mp3(
    input_path: Path,
    output_path: Path,
    on_progress: ProgressCallback | None = None,
) -> Path:
    if not _ffmpeg_available():
        raise RuntimeError("FFmpeg is not installed")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_path),
        "-vn",
        "-codec:a",
        "libmp3lame",
        "-b:a",
        "320k",
        "-map_metadata",
        "-1",
        str(output_path),
    ]

    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    duration: float | None = None
    assert process.stderr is not None

    while True:
        line_bytes = await process.stderr.readline()
        if not line_bytes:
            break
        line = line_bytes.decode("utf-8", errors="ignore")
        if duration is None:
            duration = _parse_duration(line)
        current = _parse_time(line)
        if on_progress and duration and current:
            percent = min(99, int((current / duration) * 100))
            result = on_progress(percent, f"Converting {percent}%")
            if asyncio.iscoroutine(result):
                await result

    return_code = await process.wait()
    if return_code != 0:
        raise RuntimeError(f"FFmpeg failed with exit code {return_code}")

    if on_progress:
        result = on_progress(100, "Conversion complete")
        if asyncio.iscoroutine(result):
            await result

    return output_path


def ffmpeg_version() -> str | None:
    if not _ffmpeg_available():
        return None
    import subprocess

    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            text=True,
            check=False,
        )
        first_line = result.stdout.splitlines()[0] if result.stdout else ""
        return first_line.replace("ffmpeg version ", "").split(" ")[0] or None
    except Exception:
        return None
