from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

from fastapi import FastAPI

import app.models  # noqa: F401
from app.database import Base, engine
from app.api import auth, health, me, stats
from app.core.config import settings

@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as connection:
        await connection.run_sync(
            Base.metadata.create_all,
        )

    yield

    await engine.dispose()

app = FastAPI(
    title=settings.app_name,
    description="Backend API for the Spotify Stats application",
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    health.router,
    prefix=settings.api_prefix,
)

app.include_router(
    auth.router,
    prefix=settings.api_prefix,
)

app.include_router(
    me.router,
    prefix=settings.api_prefix,
)

app.include_router(
    stats.router,
    prefix=settings.api_prefix,
)

@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": f"{settings.app_name} is running",
        "environment": settings.app_environment,
    }