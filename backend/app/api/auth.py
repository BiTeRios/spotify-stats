from typing import Annotated

from fastapi import APIRouter, Depends, Request, Response, status
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import generate_oauth_state, oauth_states_match
from app.database import get_db
from app.services.auth_service import (
    complete_spotify_login,
    get_user_from_session_token,
    revoke_session,
)
from app.services.exceptions import (
    AuthenticationPersistenceError,
    SpotifyServiceError,
)
from app.services.spotify_api import get_current_spotify_profile
from app.services.spotify_auth import (
    build_spotify_authorization_url,
    exchange_code_for_tokens,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


def delete_oauth_state_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.oauth_state_cookie_name,
        path=f"{settings.api_prefix}/auth",
    )


def delete_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.session_cookie_name,
        path=settings.api_prefix,
        secure=settings.cookie_secure,
        httponly=True,
        samesite="lax",
    )


def create_callback_error_response(
    message: str,
    status_code: int = status.HTTP_400_BAD_REQUEST,
) -> JSONResponse:
    response = JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
        },
    )

    delete_oauth_state_cookie(response)

    return response


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


@router.get("/callback")
async def spotify_callback(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
) -> JSONResponse:
    stored_state = request.cookies.get(
        settings.oauth_state_cookie_name,
    )

    if not oauth_states_match(
        received_state=state,
        stored_state=stored_state,
    ):
        return create_callback_error_response(
            message="Invalid or expired OAuth state.",
        )

    if error is not None:
        if error == "access_denied":
            message = "Spotify authorization was cancelled."
        else:
            message = "Spotify authorization failed."

        return create_callback_error_response(
            message=message,
        )

    if code is None:
        return create_callback_error_response(
            message="Spotify authorization code is missing.",
        )

    try:
        tokens = await exchange_code_for_tokens(
            code=code,
        )

        profile = await get_current_spotify_profile(
            access_token=tokens.access_token,
        )

        completed_login = await complete_spotify_login(
            db=db,
            profile=profile,
            tokens=tokens,
        )

    except SpotifyServiceError as exc:
        return create_callback_error_response(
            message=exc.message,
            status_code=exc.status_code,
        )

    except AuthenticationPersistenceError as exc:
        return create_callback_error_response(
            message=exc.message,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    avatar_url = (
        profile.images[0].url
        if profile.images
        else None
    )

    spotify_profile_url = profile.external_urls.spotify

    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "success": True,
            "message": "Spotify authorization completed successfully.",
            "user": {
                "id": completed_login.user.id,
                "spotify_account_id": (
                    completed_login.user.spotify_account_id
                ),
                "display_name": completed_login.user.display_name,
                "avatar_url": avatar_url,
                "spotify_url": spotify_profile_url,
            },
        },
    )

    response.set_cookie(
        key=settings.session_cookie_name,
        value=completed_login.session_token,
        max_age=settings.session_cookie_max_age,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path=settings.api_prefix,
    )

    delete_oauth_state_cookie(response)

    return response


@router.get("/session")
async def get_auth_session(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> JSONResponse:
    session_token = request.cookies.get(
        settings.session_cookie_name,
    )

    if not session_token:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "authenticated": False,
                "message": "Authentication required.",
            },
        )

    try:
        user = await get_user_from_session_token(
            db=db,
            session_token=session_token,
        )

    except AuthenticationPersistenceError as exc:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "authenticated": False,
                "message": exc.message,
            },
        )

    if user is None:
        response = JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "authenticated": False,
                "message": "Authentication session is invalid or expired.",
            },
        )

        delete_session_cookie(response)

        return response

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "authenticated": True,
            "user": {
                "id": user.id,
                "spotify_account_id": user.spotify_account_id,
                "display_name": user.display_name,
                "avatar_url": user.avatar_url,
            },
        },
    )

@router.post("/logout")
async def logout(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> JSONResponse:
    session_token = request.cookies.get(
        settings.session_cookie_name,
    )

    try:
        await revoke_session(
            db=db,
            session_token=session_token,
        )

    except AuthenticationPersistenceError as exc:
        response = JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": exc.message,
            },
        )

        delete_session_cookie(response)

        return response

    response = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "success": True,
            "message": "Logged out successfully.",
        },
    )

    delete_session_cookie(response)

    return response