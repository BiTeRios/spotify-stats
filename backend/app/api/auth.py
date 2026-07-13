from fastapi import APIRouter, status
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.core.security import generate_oauth_state
from app.services.spotify_auth import build_spotify_authorization_url


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.get("/login")
def login_with_spotify() -> RedirectResponse:
    state = generate_oauth_state()

    authorization_url = build_spotify_authorization_url(
        state=state,
    )

    response = RedirectResponse(
        url=authorization_url,
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    )

    response.set_cookie(
        key=settings.oauth_state_cookie_name,
        value=state,
        max_age=settings.oauth_state_cookie_max_age,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path=f"{settings.api_prefix}/auth",
    )

    return response