from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    url: str = Field(..., min_length=10)


class TrackEntry(BaseModel):
    id: str
    title: str
    artist: str
    duration: Optional[int] = None
    thumbnail: Optional[str] = None
    track_number: Optional[int] = None


class AnalyzeResponse(BaseModel):
    type: Literal["video", "playlist"]
    title: str
    album: Optional[str] = None
    entries: list[TrackEntry]
