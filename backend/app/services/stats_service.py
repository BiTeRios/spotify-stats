from app.schemas.spotify import (
    SpotifyTopArtistsResponse,
    SpotifyTopTracksResponse,
)
from app.schemas.stats import (
    TopArtistResponse,
    TopArtistsResponse,
    TopItemsTimeRange,
    TopTrackResponse,
    TopTracksResponse,
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

def build_top_tracks_response(
    spotify_response: SpotifyTopTracksResponse,
    time_range: TopItemsTimeRange,
) -> TopTracksResponse:
    tracks = [
        TopTrackResponse(
            rank=spotify_response.offset + index,
            spotify_id=track.id,
            name=track.name,
            artist_names=[
                artist.name
                for artist in track.artists
            ],
            album_name=track.album.name,
            album_image_url=(
                track.album.images[0].url
                if track.album.images
                else None
            ),
            duration_ms=track.duration_ms,
            spotify_url=track.external_urls.spotify,
        )
        for index, track in enumerate(
            spotify_response.items,
            start=1,
        )
    ]

    return TopTracksResponse(
        time_range=time_range,
        limit=spotify_response.limit,
        total=spotify_response.total,
        items=tracks,
    )