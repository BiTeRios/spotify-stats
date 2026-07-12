from fastapi import APIRouter

from app.core.config import settings


router = APIRouter(
    tags=["Health"],
)


@router.get(
    "/health",
    summary="Check API health",
)
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.app_environment,
    }