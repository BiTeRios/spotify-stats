from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, health
from app.core.config import settings


app = FastAPI(
    title=settings.app_name,
    description="Backend API for the Spotify Stats application",
    version=settings.app_version,
    debug=settings.debug,
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

@app.get("/")
async def root() -> dict[str, str]:
    return {
        "message": f"{settings.app_name} is running",
        "environment": settings.app_environment,
    }