from functools import lru_cache
import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    temp_dir: Path = Path(os.environ.get("TEMP_DIR", "/tmp/tunefetch/jobs"))
    youtube_cookies_base64: str | None = None
    pot_provider_base_url: str | None = None
    max_tracks_per_job: int = 50
    max_concurrent_jobs_per_ip: int = 3
    job_ttl_seconds: int = 3600
    api_prefix: str = "/api/v1"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
