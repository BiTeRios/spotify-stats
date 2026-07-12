from urllib.parse import urlencode

from app.core.config import settings


SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize"

SPOTIFY_SCOPES = (
    "user-read-private",
    "user-top-read",
    "user-read-recently-played",
    "user-read-currently-playing",
    "user-read-playback-state",
)


def build_spotify_authorization_url(state: str) -> str:
    query_parameters = {
        "client_id": settings.spotify_client_id,
        "response_type": "code",
        "redirect_uri": settings.spotify_redirect_uri,
        "scope": " ".join(SPOTIFY_SCOPES),
        "state": state,
        "show_dialog": "false",
    }

    return f"{SPOTIFY_AUTHORIZE_URL}?{urlencode(query_parameters)}"