from __future__ import annotations

from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field


class DownloadMode(str, Enum):
    individual = "individual"
    zip = "zip"


class JobStage(str, Enum):
    queued = "queued"
    downloading = "downloading"
    converting = "converting"
    tagging = "tagging"
    delivering = "delivering"
    done = "done"
    error = "error"
    cancelled = "cancelled"


class CreateJobRequest(BaseModel):
    url: str = Field(..., min_length=10)
    entry_ids: Optional[list[str]] = None
    mode: DownloadMode = DownloadMode.individual


class CreateJobResponse(BaseModel):
    job_id: str


class TrackStatus(BaseModel):
    index: int
    entry_id: str
    title: str
    artist: str
    stage: JobStage = JobStage.queued
    percent: int = 0
    message: str = ""
    file_name: Optional[str] = None
    error: Optional[str] = None


class JobSnapshot(BaseModel):
    job_id: str
    status: Literal["pending", "running", "complete", "error", "cancelled"]
    mode: DownloadMode
    total_tracks: int
    completed_tracks: int
    tracks: list[TrackStatus]
    zip_ready: bool = False
