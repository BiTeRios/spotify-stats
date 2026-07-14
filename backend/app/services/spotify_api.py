import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.spotify import SpotifyProfileResponse
from app.services.exceptions import SpotifyServiceError


SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"


async def get_current_spotify_profile(
    access_token: str,
) -> SpotifyProfileResponse:
    try:
        async with httpx.AsyncClient(
            base_url=SPOTIFY_API_BASE_URL,
            timeout=settings.spotify_request_timeout_seconds,
        ) as client:
            response = await client.get(
                "/me",
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

    if response.status_code == 429:
        raise SpotifyServiceError(
            message="Spotify request limit was reached. Try again later.",
            status_code=503,
        )

    if response.is_error:
        raise SpotifyServiceError(
            message="Spotify profile request failed.",
            status_code=502,
        )

    try:
        response_data = response.json()

        return SpotifyProfileResponse(**response_data)
    except (ValueError, ValidationError) as exc:
        raise SpotifyServiceError(
            message="Spotify returned an invalid profile response.",
            status_code=502,
        ) from exc