from pydantic import BaseModel, Field


class SpotifyTokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: str | None = None
    scope: str = ""


class SpotifyImage(BaseModel):
    url: str
    height: int | None = None
    width: int | None = None


class SpotifyExternalUrls(BaseModel):
    spotify: str | None = None


class SpotifyProfileResponse(BaseModel):
    account_id: str | None = None
    id: str
    display_name: str | None = None
    images: list[SpotifyImage] = Field(default_factory=list)
    external_urls: SpotifyExternalUrls = Field(
        default_factory=SpotifyExternalUrls,
    )
    product: str | None = None


class SpotifyArtist(BaseModel):
    id: str
    name: str
    images: list[SpotifyImage] = Field(default_factory=list)
    genres: list[str] = Field(default_factory=list)
    external_urls: SpotifyExternalUrls = Field(
        default_factory=SpotifyExternalUrls,
    )


class SpotifyTopArtistsResponse(BaseModel):
    items: list[SpotifyArtist] = Field(default_factory=list)
    total: int
    limit: int
    offset: int
    next: str | None = None
    previous: str | None = None


class SpotifySimplifiedArtist(BaseModel):
    id: str
    name: str


class SpotifyAlbum(BaseModel):
    id: str
    name: str
    images: list[SpotifyImage] = Field(default_factory=list)


class SpotifyTrack(BaseModel):
    id: str
    name: str
    artists: list[SpotifySimplifiedArtist] = Field(
        default_factory=list,
    )
    album: SpotifyAlbum
    duration_ms: int
    external_urls: SpotifyExternalUrls = Field(
        default_factory=SpotifyExternalUrls,
    )


class SpotifyTopTracksResponse(BaseModel):
    items: list[SpotifyTrack] = Field(default_factory=list)
    total: int
    limit: int
    offset: int
    next: str | None = None
    previous: str | None = None