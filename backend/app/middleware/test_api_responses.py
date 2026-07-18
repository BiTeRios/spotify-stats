from typing import Any

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import settings


ERROR_MESSAGES = {
    "401": "Test response: authentication required.",
    "403": "Test response: Spotify denied access.",
    "429": "Test response: Spotify rate limit reached.",
    "500": "Test response: internal server error.",
}


def get_target_path() -> str | None:
    target_paths = {
        "me": f"{settings.api_prefix}/me",
        "top-artists": (
            f"{settings.api_prefix}/stats/top-artists"
        ),
        "top-tracks": (
            f"{settings.api_prefix}/stats/top-tracks"
        ),
        "history": (
            f"{settings.api_prefix}/history/recent"
        ),
        "player": (
            f"{settings.api_prefix}/player/current"
        ),
    }

    return target_paths.get(settings.test_api_target)


def get_query_limit(
    request: Request,
    default: int,
    maximum: int,
) -> int:
    raw_limit = request.query_params.get("limit")

    if raw_limit is None:
        return default

    try:
        parsed_limit = int(raw_limit)
    except ValueError:
        return default

    return max(
        1,
        min(parsed_limit, maximum),
    )


def build_empty_response(
    request: Request,
) -> dict[str, Any]:
    if settings.test_api_target == "me":
        return {
            "spotify_account_id": "test-account",
            "display_name": None,
            "avatar_url": None,
            "spotify_url": None,
            "subscription": None,
        }

    if settings.test_api_target == "top-artists":
        return {
            "time_range": request.query_params.get(
                "time_range",
                "medium_term",
            ),
            "limit": get_query_limit(
                request=request,
                default=20,
                maximum=50,
            ),
            "total": 0,
            "items": [],
        }

    if settings.test_api_target == "top-tracks":
        return {
            "time_range": request.query_params.get(
                "time_range",
                "medium_term",
            ),
            "limit": get_query_limit(
                request=request,
                default=20,
                maximum=5000,
            ),
            "total": 0,
            "items": [],
        }

    if settings.test_api_target == "history":
        return {
            "limit": get_query_limit(
                request=request,
                default=50,
                maximum=50,
            ),
            "items": [],
        }

    return {
        "is_active": False,
        "is_playing": False,
        "progress_ms": None,
        "track": None,
    }


class TestApiResponseMiddleware(
    BaseHTTPMiddleware,
):
    async def dispatch(
        self,
        request: Request,
        call_next,
    ):
        scenario = settings.test_api_scenario
        target_path = get_target_path()

        testing_is_disabled = (
            settings.app_environment != "testing"
            or settings.test_api_target == "none"
            or scenario == "none"
        )

        if (
            testing_is_disabled
            or request.method != "GET"
            or request.url.path != target_path
        ):
            return await call_next(request)

        if scenario == "empty":
            return JSONResponse(
                status_code=200,
                content=build_empty_response(request),
            )

        status_code = int(scenario)

        return JSONResponse(
            status_code=status_code,
            content={
                "detail": ERROR_MESSAGES.get(
                    scenario,
                    "Test error response.",
                ),
            },
        )