class SpotifyServiceError(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 502,
    ) -> None:
        super().__init__(message)

        self.message = message
        self.status_code = status_code


class AuthenticationPersistenceError(Exception):
    def __init__(
        self,
        message: str = "Could not save authentication data.",
    ) -> None:
        super().__init__(message)

        self.message = message