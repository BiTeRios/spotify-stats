import secrets


OAUTH_STATE_ENTROPY_BYTES = 32


def generate_oauth_state() -> str:
    return secrets.token_urlsafe(OAUTH_STATE_ENTROPY_BYTES)


def oauth_states_match(
    received_state: str | None,
    stored_state: str | None,
) -> bool:
    if not received_state or not stored_state:
        return False

    return secrets.compare_digest(
        received_state,
        stored_state,
    )