from pydantic import BaseModel, Field


class CurrentTrackResponse(BaseModel):
    spotify_id: str
    name: str
    artist_names: list[str] = Field(
        default_factory=list,
    )
    album_name: str
    album_image_url: str | None = None
    duration_ms: int
    spotify_url: str | None = None


class CurrentPlaybackResponse(BaseModel):
    is_active: bool
    is_playing: bool
    progress_ms: int | None = None
    track: CurrentTrackResponse | None = None