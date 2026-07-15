from urllib.parse import urlencode

import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.spotify import SpotifyTokenResponse
from app.services.exceptions import (
    SpotifyReauthorizationRequiredError,
    SpotifyServiceError,
)


SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

SPOTIFY_SCOPES = (
    "user-read-private",
    "user-top-read",
    "user-read-recently-played",
    "user-read-currently-playing",
    "user-read-playback-state",
)


def build_spotify_authorization_url(state: str) -> str:
    params = {
        "client_id": settings.spotify_client_id,
        "response_type": "code",
        "redirect_uri": settings.spotify_redirect_uri,
        "scope": " ".join(SPOTIFY_SCOPES),
        "state": state,
        "show_dialog": "false",
    }

    return f"{SPOTIFY_AUTHORIZE_URL}?{urlencode(params)}"


async def request_spotify_tokens(
    request_data: dict[str, str],
) -> SpotifyTokenResponse:
    try:
        async with httpx.AsyncClient(
            timeout=settings.spotify_request_timeout_seconds,
        ) as client:
            response = await client.post(
                SPOTIFY_TOKEN_URL,
                data=request_data,
                auth=httpx.BasicAuth(
                    username=settings.spotify_client_id,
                    password=settings.spotify_client_secret,
                ),
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            )
    except httpx.RequestError as exc:
        raise SpotifyServiceError(
            message="Could not connect to Spotify token service.",
            status_code=502,
        ) from exc

    if response.status_code == 400:
        try:
            error_data = response.json()
        except ValueError:
            error_data = {}

        error_code = error_data.get("error")
        grant_type = request_data.get("grant_type")

        if (
            grant_type == "refresh_token"
            and error_code == "invalid_grant"
        ):
            raise SpotifyReauthorizationRequiredError()

        if grant_type == "authorization_code":
            raise SpotifyServiceError(
                message=(
                    "Spotify authorization code is invalid or expired."
                ),
                status_code=400,
            )

        raise SpotifyServiceError(
            message="Spotify rejected the token request.",
            status_code=400,
        )

    if response.is_error:
        raise SpotifyServiceError(
            message=(
                "Spotify token service returned an unexpected error."
            ),
            status_code=502,
        )

    try:
        response_data = response.json()

        return SpotifyTokenResponse(**response_data)
    except (ValueError, ValidationError) as exc:
        raise SpotifyServiceError(
            message="Spotify returned an invalid token response.",
            status_code=502,
        ) from exc


async def exchange_code_for_tokens(
    code: str,
) -> SpotifyTokenResponse:
    return await request_spotify_tokens(
        request_data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.spotify_redirect_uri,
        }
    )


async def refresh_spotify_access_token(
    refresh_token: str,
) -> SpotifyTokenResponse:
    return await request_spotify_tokens(
        request_data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }
    )