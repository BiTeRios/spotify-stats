from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.player import CurrentPlaybackResponse
from app.services.auth_service import (
    get_valid_spotify_access_token,
)
from app.services.exceptions import (
    AuthenticationPersistenceError,
    SpotifyServiceError,
)
from app.services.player_service import (
    build_current_playback_response,
)
from app.services.spotify_api import (
    get_currently_playing_spotify_track,
)


router = APIRouter(
    prefix="/player",
    tags=["Player"],
)


@router.get(
    "/current",
    response_model=CurrentPlaybackResponse,
)
async def get_current_playback(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        AsyncSession,
        Depends(get_db),
    ],
) -> CurrentPlaybackResponse:
    try:
        access_token = (
            await get_valid_spotify_access_token(
                db=db,
                user_id=current_user.id,
            )
        )

        spotify_response = (
            await get_currently_playing_spotify_track(
                access_token=access_token,
            )
        )
    except AuthenticationPersistenceError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=exc.message,
        ) from exc
    except SpotifyServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        ) from exc

    return build_current_playback_response(
        spotify_response=spotify_response,
    )