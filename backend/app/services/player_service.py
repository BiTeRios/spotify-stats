from app.schemas.player import (
    CurrentPlaybackResponse,
    CurrentTrackResponse,
)
from app.schemas.spotify import (
    SpotifyCurrentlyPlayingResponse,
)


def build_current_playback_response(
    spotify_response: SpotifyCurrentlyPlayingResponse | None,
) -> CurrentPlaybackResponse:
    if (
        spotify_response is None
        or spotify_response.item is None
        or spotify_response.currently_playing_type != "track"
    ):
        return CurrentPlaybackResponse(
            is_active=False,
            is_playing=False,
            progress_ms=None,
            track=None,
        )

    track = spotify_response.item

    return CurrentPlaybackResponse(
        is_active=True,
        is_playing=spotify_response.is_playing,
        progress_ms=spotify_response.progress_ms,
        track=CurrentTrackResponse(
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
        ),
    )