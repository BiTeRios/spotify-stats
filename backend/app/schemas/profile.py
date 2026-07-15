from pydantic import BaseModel


class UserProfileResponse(BaseModel):
    spotify_account_id: str
    display_name: str | None = None
    avatar_url: str | None = None
    spotify_url: str | None = None
    subscription: str | None = None