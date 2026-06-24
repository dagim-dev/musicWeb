from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from socketio import ASGIApp

from app.api.routes import analyze, download, health
from app.config import get_settings
from app.services.job_manager import job_manager
from app.sockets.events import sio


async def _ttl_cleanup_loop() -> None:
    while True:
        await asyncio.sleep(300)
        await job_manager.cleanup_expired_jobs()


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    settings.temp_dir.mkdir(parents=True, exist_ok=True)
    cleanup_task = asyncio.create_task(_ttl_cleanup_loop())
    yield
    cleanup_task.cancel()
    with suppress(asyncio.CancelledError):
        await cleanup_task


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="DgLabs API", version="0.1.0", lifespan=lifespan)

    app.state.limiter = analyze.limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    prefix = settings.api_prefix
    app.include_router(health.router, prefix=prefix, tags=["health"])
    app.include_router(analyze.router, prefix=prefix, tags=["analyze"])
    app.include_router(download.router, prefix=prefix, tags=["jobs"])

    return app


fastapi_app = create_app()
app = ASGIApp(sio, fastapi_app, socketio_path="/socket.io")
