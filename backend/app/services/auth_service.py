from dataclasses import dataclass
from datetime import datetime, timedelta

from sqlalchemy import delete, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    generate_session_token,
    hash_session_token,
)
from app.models import AppSession, SpotifyToken, User
from app.models.auth import utc_now
from app.schemas.spotify import (
    SpotifyProfileResponse,
    SpotifyTokenResponse,
)
from app.services.exceptions import AuthenticationPersistenceError


@dataclass(slots=True)
class CompletedLogin:
    user: User
    session_token: str
    session_expires_at: datetime


async def complete_spotify_login(
    db: AsyncSession,
    profile: SpotifyProfileResponse,
    tokens: SpotifyTokenResponse,
) -> CompletedLogin:
    now = utc_now()

    spotify_account_id = profile.account_id or profile.id

    avatar_url = (
        profile.images[0].url
        if profile.images
        else None
    )

    try:
        user = await db.scalar(
            select(User).where(
                User.spotify_account_id == spotify_account_id,
            )
        )

        if user is None:
            user = User(
                spotify_account_id=spotify_account_id,
                display_name=profile.display_name,
                avatar_url=avatar_url,
                last_login_at=now,
            )

            db.add(user)
            await db.flush()
        else:
            user.display_name = profile.display_name
            user.avatar_url = avatar_url
            user.last_login_at = now
            user.updated_at = now

        spotify_token = await db.scalar(
            select(SpotifyToken).where(
                SpotifyToken.user_id == user.id,
            )
        )

        access_token_expires_at = now + timedelta(
            seconds=tokens.expires_in,
        )

        if spotify_token is None:
            spotify_token = SpotifyToken(
                user_id=user.id,
                access_token=tokens.access_token,
                refresh_token=tokens.refresh_token,
                token_type=tokens.token_type,
                scope=tokens.scope,
                expires_at=access_token_expires_at,
                authorized_at=now,
            )

            db.add(spotify_token)
        else:
            spotify_token.access_token = tokens.access_token
            spotify_token.token_type = tokens.token_type
            spotify_token.scope = tokens.scope
            spotify_token.expires_at = access_token_expires_at
            spotify_token.updated_at = now

            if tokens.refresh_token is not None:
                spotify_token.refresh_token = tokens.refresh_token
                spotify_token.authorized_at = now

        session_token = generate_session_token()
        session_token_hash = hash_session_token(
            session_token,
        )

        session_expires_at = now + timedelta(
            seconds=settings.session_cookie_max_age,
        )

        app_session = AppSession(
            user_id=user.id,
            session_token_hash=session_token_hash,
            expires_at=session_expires_at,
        )

        db.add(app_session)

        await db.commit()
        await db.refresh(user)

        return CompletedLogin(
            user=user,
            session_token=session_token,
            session_expires_at=session_expires_at,
        )

    except SQLAlchemyError as exc:
        await db.rollback()

        raise AuthenticationPersistenceError() from exc

async def get_user_from_session_token(
    db: AsyncSession,
    session_token: str | None,
) -> User | None:
    if not session_token:
        return None

    session_token_hash = hash_session_token(
        session_token,
    )

    now = utc_now()

    try:
        user = await db.scalar(
            select(User)
            .join(
                AppSession,
                AppSession.user_id == User.id,
            )
            .where(
                AppSession.session_token_hash
                == session_token_hash,
                AppSession.expires_at > now,
            )
        )

        if user is not None:
            return user

        await db.execute(
            delete(AppSession).where(
                AppSession.session_token_hash
                == session_token_hash,
            )
        )

        await db.commit()

        return None

    except SQLAlchemyError as exc:
        await db.rollback()

        raise AuthenticationPersistenceError(
            message="Could not verify the authentication session.",
        ) from exc


async def revoke_session(
    db: AsyncSession,
    session_token: str | None,
) -> None:
    if not session_token:
        return

    session_token_hash = hash_session_token(
        session_token,
    )

    try:
        await db.execute(
            delete(AppSession).where(
                AppSession.session_token_hash
                == session_token_hash,
            )
        )

        await db.commit()

    except SQLAlchemyError as exc:
        await db.rollback()

        raise AuthenticationPersistenceError(
            message="Could not remove the authentication session.",
        ) from exc