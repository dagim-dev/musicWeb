from __future__ import annotations

from collections.abc import Iterator
from pathlib import Path

from zipstream import ZIP_DEFLATED, ZipStream


def iter_zip_stream(files: list[tuple[str, Path]]) -> Iterator[bytes]:
    archive = ZipStream(compress_type=ZIP_DEFLATED)
    for archive_name, file_path in files:
        archive.add_path(str(file_path), arcname=archive_name)
    yield from archive
