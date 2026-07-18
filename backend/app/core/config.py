from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "StatsClever API"
    app_version: str = "0.1.0"
    app_environment: Literal["development", "testing", "production"] = (
        "development"
    )
    debug: bool = False
    api_prefix: str = "/api"
    test_api_target: Literal[
        "none",
        "me",
        "top-artists",
        "top-tracks",
        "history",
        "player",
    ] = "none"

    test_api_scenario: Literal[
        "none",
        "empty",
        "401",
        "403",
        "429",
        "500",
    ] = "none"
    
    frontend_url: str = "http://127.0.0.1:5173"
    database_url: str = "sqlite+aiosqlite:///./spotify_stats.db"

    spotify_client_id: str
    spotify_client_secret: str
    spotify_redirect_uri: str
    spotify_request_timeout_seconds: float = 10.0
    spotify_access_token_refresh_leeway_seconds: int = 60
    spotify_refresh_token_lifetime_days: int = 180

    oauth_state_cookie_name: str = "spotify_oauth_state"
    oauth_state_cookie_max_age: int = 600

    session_cookie_name: str = "spotify_stats_session"
    session_cookie_max_age: int = 2_592_000
    
    cookie_secure: bool = False # For production put true

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()