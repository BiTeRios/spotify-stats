import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  getCurrentPlayback,
  type CurrentPlaybackResponse,
} from '../api/player'

import {
  useNotifications,
} from '../contexts/NotificationContext'

import {
  getUserFacingError,
} from '../utils/getUserFacingError'

import { ApiRequestError } from '../api/client'
import { formatDuration } from '../utils/formatDuration'
import CurrentTrackSkeleton from './CurrentTrackSkeleton'

const POLL_INTERVAL_MS = 2_000
const ERROR_RETRY_INTERVAL_MS = 60_000
const MIN_REFRESH_INTERVAL_MS = 2_000

type CurrentPlaybackState =
  | {
      status: 'loading'
    }
  | {
      status: 'ready'
      data: CurrentPlaybackResponse
    }
  | {
      status: 'empty'
    }
  | {
      status: 'error'
      message: string
    }

interface CurrentTrackCardProps {
  onUnauthorized: () => void
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    && error.name === 'AbortError'
}

function CurrentTrackCard({
  onUnauthorized,
}: CurrentTrackCardProps) {
  const {
    showNotification,
  } = useNotifications()

  const hasShownPlaybackError = useRef(false)

  const [playbackState, setPlaybackState] =
    useState<CurrentPlaybackState>({
      status: 'loading',
    })

  useEffect(() => {
    let isDisposed = false
    let shouldStopPolling = false
    let isRequestInFlight = false
    let lastRequestStartedAt = 0
    let timeoutId: number | undefined
    let activeController: AbortController | null = null

    function clearScheduledRefresh() {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
        timeoutId = undefined
      }
    }

    function scheduleRefresh(delayMs: number) {
      clearScheduledRefresh()

      if (
        isDisposed
        || shouldStopPolling
        || document.visibilityState !== 'visible'
      ) {
        return
      }

      timeoutId = window.setTimeout(() => {
        void loadCurrentPlayback()
      }, delayMs)
    }

    async function loadCurrentPlayback() {
      if (
        isDisposed
        || shouldStopPolling
        || isRequestInFlight
        || document.visibilityState !== 'visible'
      ) {
        return
      }

      isRequestInFlight = true
      lastRequestStartedAt = Date.now()
      activeController = new AbortController()

      let nextRefreshDelay = POLL_INTERVAL_MS

      try {
        const playback = await getCurrentPlayback(
          activeController.signal,
        )

        if (isDisposed) {
          return
        }

        hasShownPlaybackError.current = false

        if (!playback.is_active || !playback.track) {
          setPlaybackState({
            status: 'empty',
          })

          return
        }

        setPlaybackState({
          status: 'ready',
          data: playback,
        })
      } catch (requestError) {
        if (isDisposed || isAbortError(requestError)) {
          return
        }

        if (
          requestError instanceof ApiRequestError
          && requestError.status === 401
        ) {
          shouldStopPolling = true
          onUnauthorized()
          return
        }

        nextRefreshDelay = ERROR_RETRY_INTERVAL_MS

        const message = getUserFacingError(
          requestError,
          'Could not load the current track.',
        )

        if (!hasShownPlaybackError.current) {
          showNotification({
            kind: 'error',
            title: 'Could not update current track',
            message:
              'Automatic updates will continue in the background.',
            dedupeKey: 'current-playback-error',
          })

          hasShownPlaybackError.current = true
        }

        setPlaybackState({
          status: 'error',
          message,
        })
      } finally {
        isRequestInFlight = false
        activeController = null

        if (!isDisposed && !shouldStopPolling) {
          scheduleRefresh(nextRefreshDelay)
        }
      }
    }

    function handleVisibilityChange() {
      clearScheduledRefresh()

      if (
        document.visibilityState !== 'visible'
        || isDisposed
        || shouldStopPolling
        || isRequestInFlight
      ) {
        return
      }

      const timeSinceLastRequest =
        Date.now() - lastRequestStartedAt

      const remainingMinimumDelay = Math.max(
        0,
        MIN_REFRESH_INTERVAL_MS - timeSinceLastRequest,
      )

      scheduleRefresh(remainingMinimumDelay)
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    )

    void loadCurrentPlayback()

    return () => {
      isDisposed = true
      clearScheduledRefresh()
      activeController?.abort()

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      )
    }
  }, [
    onUnauthorized,
    showNotification,
  ])

  return (
    <section
      id="now-playing"
      className="current-track-section dashboard-anchor"
      aria-labelledby="current-track-title"
      aria-busy={playbackState.status === 'loading'}
    >
      <div className="current-track-heading">
        <div>
          <p className="eyebrow">
            Live from Spotify
          </p>

          <h2 id="current-track-title">
            Now playing
          </h2>
        </div>

        <p>
          Automatically updated every 2 seconds while
          this tab is visible.
        </p>
      </div>

      {playbackState.status === 'loading' && (
        <>
          <p
            className="sr-only"
            aria-live="polite"
          >
            Checking your Spotify player.
          </p>

          <CurrentTrackSkeleton />
        </>
      )}

      {playbackState.status === 'empty' && (
        <div className="current-track-feedback">
          <span
            className="current-track-idle-icon"
            aria-hidden="true"
          >
            ♪
          </span>

          <div>
            <h3>
              Nothing is playing right now.
            </h3>

            <p>
              Start a track in Spotify and this card will
              update automatically.
            </p>
          </div>
        </div>
      )}

      {playbackState.status === 'error' && (
        <div
          className="
            current-track-feedback
            current-track-error
          "
          role="alert"
        >
          <span
            className="current-track-idle-icon"
            aria-hidden="true"
          >
            !
          </span>

          <div>
            <h3>
              Could not update the current track.
            </h3>

            <p>{playbackState.message}</p>

            <p className="current-track-retry-note">
              The app will try again automatically.
            </p>
          </div>
        </div>
      )}

      {playbackState.status === 'ready' && (
        <CurrentTrackContent
          playback={playbackState.data}
        />
      )}
    </section>
  )
}

interface CurrentTrackContentProps {
  playback: CurrentPlaybackResponse
}

function CurrentTrackContent({
  playback,
}: CurrentTrackContentProps) {
  const track = playback.track

  const [displayProgressMs, setDisplayProgressMs] =
    useState(playback.progress_ms ?? 0)

  useEffect(() => {
    setDisplayProgressMs(playback.progress_ms ?? 0)
  }, [
    playback.progress_ms,
    track?.spotify_id,
  ])

  useEffect(() => {
    if (!playback.is_playing || !track) {
      return
    }

    const progressTimerId = window.setInterval(() => {
      setDisplayProgressMs((currentProgress) =>
        Math.min(
          currentProgress + 1000,
          track.duration_ms,
        ),
      )
    }, 1000)

    return () => {
      window.clearInterval(progressTimerId)
    }
  }, [
    playback.is_playing,
    track,
  ])

  if (!track) {
    return null
  }

  const artistLabel = track.artist_names.length > 0
    ? track.artist_names.join(', ')
    : 'Unknown artist'

  const safeProgressMs = Math.min(
    Math.max(displayProgressMs, 0),
    track.duration_ms,
  )

  const progressPercent = track.duration_ms > 0
    ? (safeProgressMs / track.duration_ms) * 100
    : 0

  return (
    <article className="current-track-card">
      <div className="current-track-image-frame">
        {track.album_image_url ? (
          <img
            className="current-track-image"
            src={track.album_image_url}
            alt=""
          />
        ) : (
          <div
            className="current-track-image-fallback"
            aria-hidden="true"
          >
            ♪
          </div>
        )}
      </div>

      <div className="current-track-content">
        <div className="current-track-title-row">
          <div>
            <h3>{track.name}</h3>

            <p className="current-track-artists">
              {artistLabel}
            </p>

            <p className="current-track-album">
              {track.album_name}
            </p>
          </div>

          <span
            className={
              playback.is_playing
                ? 'playback-status is-playing'
                : 'playback-status'
            }
          >
            <span aria-hidden="true" />

            {
              playback.is_playing
                ? 'Playing'
                : 'Paused'
            }
          </span>
        </div>

        <div className="current-track-progress-group">
          <div
            className="current-track-progress"
            role="progressbar"
            aria-label={
              `Playback progress for ${track.name}`
            }
            aria-valuemin={0}
            aria-valuemax={track.duration_ms}
            aria-valuenow={safeProgressMs}
          >
            <span
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>

          <div className="current-track-time">
            <span>
              {formatDuration(safeProgressMs)}
            </span>

            <span>
              {formatDuration(track.duration_ms)}
            </span>
          </div>
        </div>
      </div>

      {track.spotify_url && (
        <a
          className="current-track-link"
          href={track.spotify_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            `Open ${track.name} by ${artistLabel} in Spotify`
          }
        >
          Open in Spotify

          <span aria-hidden="true">
            ↗
          </span>
        </a>
      )}
    </article>
  )
}

export default CurrentTrackCard