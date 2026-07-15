from app.schemas.profile import UserProfileResponse
from app.schemas.spotify import SpotifyProfileResponse


def build_user_profile_response(
    spotify_profile: SpotifyProfileResponse,
) -> UserProfileResponse:
    avatar_url = (
        spotify_profile.images[0].url
        if spotify_profile.images
        else None
    )

    return UserProfileResponse(
        spotify_account_id=(
            spotify_profile.account_id
            or spotify_profile.id
        ),
        display_name=spotify_profile.display_name,
        avatar_url=avatar_url,
        spotify_url=spotify_profile.external_urls.spotify,
        subscription=spotify_profile.product,
    )