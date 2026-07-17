from app.schemas.history import (
    RecentHistoryResponse,
    RecentPlayResponse,
)
from app.schemas.spotify import (
    SpotifyRecentlyPlayedResponse,
)


def build_recent_history_response(
    spotify_response: SpotifyRecentlyPlayedResponse,
) -> RecentHistoryResponse:
    items = [
        RecentPlayResponse(
            spotify_id=history_item.track.id,
            name=history_item.track.name,
            artist_names=[
                artist.name
                for artist in history_item.track.artists
            ],
            album_name=history_item.track.album.name,
            album_image_url=(
                history_item.track.album.images[0].url
                if history_item.track.album.images
                else None
            ),
            duration_ms=history_item.track.duration_ms,
            spotify_url=(
                history_item.track.external_urls.spotify
            ),
            played_at=history_item.played_at,
        )
        for history_item in spotify_response.items
    ]

    return RecentHistoryResponse(
        limit=spotify_response.limit,
        items=items,
    )