from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.profile import UserProfileResponse
from app.services.auth_service import get_spotify_token_for_user
from app.services.exceptions import (
    AuthenticationPersistenceError,
    SpotifyServiceError,
)
from app.services.profile_service import build_user_profile_response
from app.services.spotify_api import get_current_spotify_profile


router = APIRouter(
    tags=["Profile"],
)


@router.get(
    "/me",
    response_model=UserProfileResponse,
)
async def get_my_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserProfileResponse:
    try:
        spotify_token = await get_spotify_token_for_user(
            db=db,
            user_id=current_user.id,
        )
    except AuthenticationPersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=exc.message,
        ) from exc

    if spotify_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Spotify authorization is missing.",
        )

    try:
        spotify_profile = await get_current_spotify_profile(
            access_token=spotify_token.access_token,
        )
    except SpotifyServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        ) from exc

    return build_user_profile_response(spotify_profile)