from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.database import get_db
from app.models import User
from app.schemas.stats import (
    TopArtistsResponse,
    TopItemsTimeRange,
    TopTracksResponse,
)
from app.services.auth_service import (
    get_valid_spotify_access_token,
)
from app.services.exceptions import (
    AuthenticationPersistenceError,
    SpotifyServiceError,
)
from app.services.spotify_api import (
    get_top_spotify_artists,
    get_top_spotify_tracks,
)
from app.services.stats_service import (
    build_top_artists_response,
    build_top_tracks_response,
)


router = APIRouter(
    prefix="/stats",
    tags=["Statistics"],
)

MAX_TOP_TRACKS_LIMIT = 5000


@router.get(
    "/top-artists",
    response_model=TopArtistsResponse,
)
async def get_top_artists(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        AsyncSession,
        Depends(get_db),
    ],
    time_range: Annotated[
        TopItemsTimeRange,
        Query(
            description="Spotify affinity time range.",
        ),
    ] = "medium_term",
    limit: Annotated[
        int,
        Query(
            ge=1,
            le=50,
            description="Number of artists to return.",
        ),
    ] = 20,
) -> TopArtistsResponse:
    try:
        access_token = await get_valid_spotify_access_token(
            db=db,
            user_id=current_user.id,
        )

        spotify_response = await get_top_spotify_artists(
            access_token=access_token,
            time_range=time_range,
            limit=limit,
        )
    except AuthenticationPersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=exc.message,
        ) from exc
    except SpotifyServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        ) from exc

    return build_top_artists_response(
        spotify_response=spotify_response,
        time_range=time_range,
    )

@router.get(
    "/top-tracks",
    response_model=TopTracksResponse,
)
async def get_top_tracks(
    current_user: Annotated[
        User,
        Depends(get_current_user),
    ],
    db: Annotated[
        AsyncSession,
        Depends(get_db),
    ],
    time_range: Annotated[
        TopItemsTimeRange,
        Query(
            description="Spotify affinity time range.",
        ),
    ] = "medium_term",
    limit: Annotated[
        int,
        Query(
            ge=1,
            le=MAX_TOP_TRACKS_LIMIT,
            description=(
                "Total number of tracks to return. "
                "Spotify pages are loaded in batches of 50."
            ),
        ),
    ] = 20,
) -> TopTracksResponse:
    try:
        access_token = await get_valid_spotify_access_token(
            db=db,
            user_id=current_user.id,
        )

        spotify_response = await get_top_spotify_tracks(
            access_token=access_token,
            time_range=time_range,
            limit=limit,
        )
    except AuthenticationPersistenceError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=exc.message,
        ) from exc
    except SpotifyServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        ) from exc

    return build_top_tracks_response(
        spotify_response=spotify_response,
        time_range=time_range,
    )