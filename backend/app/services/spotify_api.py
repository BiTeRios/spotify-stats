from typing import Any

import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.spotify import (
    SpotifyCurrentlyPlayingResponse,
    SpotifyProfileResponse,
    SpotifyRecentlyPlayedResponse,
    SpotifyTopArtistsResponse,
    SpotifyTopTracksResponse,
)
from app.services.exceptions import SpotifyServiceError


SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"


async def get_spotify_api_response(
    access_token: str,
    endpoint: str,
    params: dict[str, str | int] | None = None,
) -> httpx.Response:
    try:
        async with httpx.AsyncClient(
            base_url=SPOTIFY_API_BASE_URL,
            timeout=settings.spotify_request_timeout_seconds,
        ) as client:
            response = await client.get(
                endpoint,
                params=params,
                headers={
                    "Authorization": f"Bearer {access_token}",
                },
            )
    except httpx.RequestError as exc:
        raise SpotifyServiceError(
            message="Could not connect to Spotify Web API.",
            status_code=502,
        ) from exc

    if response.status_code == 401:
        raise SpotifyServiceError(
            message="Spotify rejected the access token.",
            status_code=502,
        )

    if response.status_code == 403:
        raise SpotifyServiceError(
            message="Spotify did not allow access to this resource.",
            status_code=403,
        )

    if response.status_code == 429:
        raise SpotifyServiceError(
            message=(
                "Spotify request limit was reached. "
                "Try again later."
            ),
            status_code=503,
        )

    if response.is_error:
        raise SpotifyServiceError(
            message="Spotify Web API request failed.",
            status_code=502,
        )

    return response


async def get_spotify_api_data(
    access_token: str,
    endpoint: str,
    params: dict[str, str | int] | None = None,
) -> dict[str, Any]:
    response = await get_spotify_api_response(
        access_token=access_token,
        endpoint=endpoint,
        params=params,
    )

    try:
        response_data = response.json()
    except ValueError as exc:
        raise SpotifyServiceError(
            message="Spotify returned an invalid JSON response.",
            status_code=502,
        ) from exc

    if not isinstance(response_data, dict):
        raise SpotifyServiceError(
            message=(
                "Spotify returned an unexpected "
                "response format."
            ),
            status_code=502,
        )

    return response_data


async def get_current_spotify_profile(
    access_token: str,
) -> SpotifyProfileResponse:
    response_data = await get_spotify_api_data(
        access_token=access_token,
        endpoint="/me",
    )

    try:
        return SpotifyProfileResponse(**response_data)
    except ValidationError as exc:
        raise SpotifyServiceError(
            message="Spotify returned an invalid profile response.",
            status_code=502,
        ) from exc


async def get_top_spotify_artists(
    access_token: str,
    time_range: str = "medium_term",
    limit: int = 20,
) -> SpotifyTopArtistsResponse:
    response_data = await get_spotify_api_data(
        access_token=access_token,
        endpoint="/me/top/artists",
        params={
            "time_range": time_range,
            "limit": limit,
        },
    )

    try:
        return SpotifyTopArtistsResponse(**response_data)
    except ValidationError as exc:
        raise SpotifyServiceError(
            message="Spotify returned an invalid top artists response.",
            status_code=502,
        ) from exc
    
SPOTIFY_TOP_ITEMS_PAGE_SIZE = 50


async def get_top_spotify_tracks_page(
    access_token: str,
    time_range: str,
    limit: int,
    offset: int,
) -> SpotifyTopTracksResponse:
    response_data = await get_spotify_api_data(
        access_token=access_token,
        endpoint="/me/top/tracks",
        params={
            "time_range": time_range,
            "limit": limit,
            "offset": offset,
        },
    )

    try:
        return SpotifyTopTracksResponse(**response_data)
    except ValidationError as exc:
        raise SpotifyServiceError(
            message="Spotify returned an invalid top tracks response.",
            status_code=502,
        ) from exc


async def get_top_spotify_tracks(
    access_token: str,
    time_range: str = "medium_term",
    limit: int = 20,
) -> SpotifyTopTracksResponse:
    collected_tracks = []
    offset = 0
    total = 0

    while len(collected_tracks) < limit:
        remaining_tracks = limit - len(collected_tracks)

        page_limit = min(
            SPOTIFY_TOP_ITEMS_PAGE_SIZE,
            remaining_tracks,
        )

        page = await get_top_spotify_tracks_page(
            access_token=access_token,
            time_range=time_range,
            limit=page_limit,
            offset=offset,
        )

        if offset == 0:
            total = page.total

        if not page.items:
            break

        collected_tracks.extend(page.items)
        offset += len(page.items)

        if page.next is None:
            break

        if offset >= total:
            break

    requested_tracks = collected_tracks[:limit]

    return SpotifyTopTracksResponse(
        items=requested_tracks,
        total=total,
        limit=len(requested_tracks),
        offset=0,
        next=None,
        previous=None,
    )

async def get_recently_played_spotify_tracks(
    access_token: str,
    limit: int = 50,
) -> SpotifyRecentlyPlayedResponse:
    response_data = await get_spotify_api_data(
        access_token=access_token,
        endpoint="/me/player/recently-played",
        params={
            "limit": limit,
        },
    )

    try:
        return SpotifyRecentlyPlayedResponse(
            **response_data,
        )
    except ValidationError as exc:
        raise SpotifyServiceError(
            message=(
                "Spotify returned an invalid "
                "recently played response."
            ),
            status_code=502,
        ) from exc
    
async def get_currently_playing_spotify_track(
    access_token: str,
) -> SpotifyCurrentlyPlayingResponse | None:
    response = await get_spotify_api_response(
        access_token=access_token,
        endpoint="/me/player/currently-playing",
    )

    if response.status_code == 204 or not response.content:
        return None

    try:
        response_data = response.json()
    except ValueError as exc:
        raise SpotifyServiceError(
            message=(
                "Spotify returned an invalid "
                "currently playing response."
            ),
            status_code=502,
        ) from exc

    if not isinstance(response_data, dict):
        raise SpotifyServiceError(
            message=(
                "Spotify returned an unexpected "
                "currently playing response format."
            ),
            status_code=502,
        )

    try:
        return SpotifyCurrentlyPlayingResponse(
            **response_data,
        )
    except ValidationError as exc:
        raise SpotifyServiceError(
            message=(
                "Spotify returned an invalid "
                "currently playing response."
            ),
            status_code=502,
        ) from exc