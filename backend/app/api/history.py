from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.history import RecentHistoryResponse
from app.services.auth_service import (
    get_valid_spotify_access_token,
)
from app.services.exceptions import (
    AuthenticationPersistenceError,
    SpotifyServiceError,
)
from app.services.history_service import (
    build_recent_history_response,
)
from app.services.spotify_api import (
    get_recently_played_spotify_tracks,
)


router = APIRouter(
    prefix="/history",
    tags=["History"],
)


@router.get(
    "/recent",
    response_model=RecentHistoryResponse,
)
async def get_recent_history(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        AsyncSession,
        Depends(get_db),
    ],
    limit: Annotated[
        int,
        Query(
            ge=1,
            le=50,
            description=(
                "Number of recently played tracks "
                "to return."
            ),
        ),
    ] = 50,
) -> RecentHistoryResponse:
    try:
        access_token = (
            await get_valid_spotify_access_token(
                db=db,
                user_id=current_user.id,
            )
        )

        spotify_response = (
            await get_recently_played_spotify_tracks(
                access_token=access_token,
                limit=limit,
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

    return build_recent_history_response(
        spotify_response=spotify_response,
    )