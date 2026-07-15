from app.schemas.spotify import SpotifyTopArtistsResponse
from app.schemas.stats import (
    TopArtistResponse,
    TopArtistsResponse,
    TopItemsTimeRange,
)


def build_top_artists_response(
    spotify_response: SpotifyTopArtistsResponse,
    time_range: TopItemsTimeRange,
) -> TopArtistsResponse:
    artists = [
        TopArtistResponse(
            rank=spotify_response.offset + index,
            spotify_id=artist.id,
            name=artist.name,
            image_url=(
                artist.images[0].url
                if artist.images
                else None
            ),
            genres=artist.genres,
            spotify_url=artist.external_urls.spotify,
        )
        for index, artist in enumerate(
            spotify_response.items,
            start=1,
        )
    ]

    return TopArtistsResponse(
        time_range=time_range,
        limit=spotify_response.limit,
        total=spotify_response.total,
        items=artists,
    )