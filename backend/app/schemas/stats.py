from typing import Literal

from pydantic import BaseModel, Field


TopItemsTimeRange = Literal[
    "short_term",
    "medium_term",
    "long_term",
]


class TopArtistResponse(BaseModel):
    rank: int
    spotify_id: str
    name: str
    image_url: str | None = None
    genres: list[str] = Field(default_factory=list)
    spotify_url: str | None = None


class TopArtistsResponse(BaseModel):
    time_range: TopItemsTimeRange
    limit: int
    total: int
    items: list[TopArtistResponse] = Field(default_factory=list)