import {
  ApiRequestError,
} from '../api/client'

export function getUserFacingError(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 401) {
      return (
        'Your Spotify session has expired. '
        + 'Please sign in again.'
      )
    }

    if (error.status === 403) {
      return (
        'Spotify did not allow this request. '
        + 'Your account may need to reconnect.'
      )
    }

    if (error.status === 404) {
      return 'The requested Spotify data was not found.'
    }

    if (error.status === 429) {
      return (
        'Spotify is receiving too many requests. '
        + 'Please wait a moment and try again.'
      )
    }

    if (error.status >= 500) {
      return (
        'Spotify or the application server is '
        + 'temporarily unavailable. Please try again later.'
      )
    }

    return fallbackMessage
  }

  if (error instanceof TypeError) {
    return (
      'Could not reach the application server. '
      + 'Check your connection and try again.'
    )
  }

  return fallbackMessage
}