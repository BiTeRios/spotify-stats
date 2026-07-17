from datetime import datetime

from pydantic import BaseModel, Field


class RecentPlayResponse(BaseModel):
    spotify_id: str
    name: str
    artist_names: list[str] = Field(
        default_factory=list,
    )
    album_name: str
    album_image_url: str | None = None
    duration_ms: int
    spotify_url: str | None = None
    played_at: datetime


class RecentHistoryResponse(BaseModel):
    limit: int
    items: list[RecentPlayResponse] = Field(
        default_factory=list,
    )