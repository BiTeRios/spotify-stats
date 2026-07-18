import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import './App.css'

import {
  ApiRequestError,
  getMyProfile,
  getSpotifyLoginUrl,
  logout,
  type UserProfile,
} from './api/profile'

import {
  getTopArtists,
  getTopTracks,
  type TopArtistsResponse,
  type TopItemsTimeRange,
  type TopTracksResponse,
} from './api/stats'

import {
  useNotifications,
} from './contexts/NotificationContext'

import {
  getUserFacingError,
} from './utils/getUserFacingError'

import ArtistCard from './components/ArtistCard'
import ArtistCardSkeleton from './components/ArtistCardSkeleton'
import ProfileAvatar from './components/ProfileAvatar'
import TimeRangeSwitcher from './components/TimeRangeSwitcher'
import LimitSelector from './components/LimitSelector'
import TrackItem from './components/TrackItem'
import HistoryPage from './pages/HistoryPage'
import CurrentTrackCard from './components/CurrentTrackCard'
import AppLayout from './layouts/AppLayout'
import ProfileSkeleton from './components/ProfileSkeleton'
import TrackItemSkeleton from './components/TrackItemSkeleton'

type PageState =
  | { status: 'loading' }
  | { status: 'guest' }
  | {
      status: 'ready'
      profile: UserProfile
    }
  | {
      status: 'error'
      message: string
    }

type ArtistsState =
  | {
      status: 'loading'
    }
  | {
      status: 'ready'
      data: TopArtistsResponse
    }
  | {
      status: 'empty'
    }
  | {
      status: 'error'
      message: string
    }

type TracksState =
  | {
      status: 'loading'
    }
  | {
      status: 'ready'
      data: TopTracksResponse
    }
  | {
      status: 'empty'
    }
  | {
      status: 'error'
      message: string
    }

const TIME_RANGE_DESCRIPTIONS: Record<
  TopItemsTimeRange,
  string
> = {
  short_term:
    'Your Spotify favorites from the last 4 weeks.',

  medium_term:
    'Your Spotify favorites from the last 6 months.',

  long_term:
    'Your Spotify favorites from approximately the last year.',
}

function App() {
  const {
    showNotification,
  } = useNotifications()

  const [pageState, setPageState] = useState<PageState>({
    status: 'loading',
  })

  const [
    selectedArtistTimeRange,
    setSelectedArtistTimeRange,
  ] = useState<TopItemsTimeRange>('medium_term')

  const [selectedArtistLimit, setSelectedArtistLimit] =
    useState(20)

  const [artistsState, setArtistsState] =
    useState<ArtistsState>({
      status: 'loading',
    })

  const [artistsReloadKey, setArtistsReloadKey] =
    useState(0)

  const [
    selectedTrackTimeRange,
    setSelectedTrackTimeRange,
  ] = useState<TopItemsTimeRange>('medium_term')

  const [selectedTrackLimit, setSelectedTrackLimit] =
    useState(20)

  const [tracksState, setTracksState] =
    useState<TracksState>({
      status: 'loading',
    })

  const [tracksReloadKey, setTracksReloadKey] =
    useState(0)

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getMyProfile()

        setPageState({
          status: 'ready',
          profile,
        })
      } catch (requestError) {
        if (
          requestError instanceof ApiRequestError
          && requestError.status === 401
        ) {
          setPageState({
            status: 'guest',
          })

          return
        }

        const message = getUserFacingError(
          requestError,
          'Could not load your Spotify profile.',
        )

        setPageState({
          status: 'error',
          message,
        })
      }
    }

    void loadProfile()
  }, [])

  useEffect(() => {
    if (pageState.status !== 'ready') {
      return
    }

    let isCancelled = false

    async function loadTopArtists() {
      setArtistsState({
        status: 'loading',
      })

      try {
        const topArtists = await getTopArtists(
          selectedArtistTimeRange,
          selectedArtistLimit,
        )

        if (isCancelled) {
          return
        }

        if (topArtists.items.length === 0) {
          setArtistsState({
            status: 'empty',
          })

          return
        }

        setArtistsState({
          status: 'ready',
          data: topArtists,
        })
      } catch (requestError) {
        if (isCancelled) {
          return
        }

        if (
          requestError instanceof ApiRequestError
          && requestError.status === 401
        ) {
          setPageState({
            status: 'guest',
          })

          return
        }

        const message = getUserFacingError(
          requestError,
          'Could not load your top artists.',
        )

        setArtistsState({
          status: 'error',
          message,
        })

        showNotification({
          kind: 'error',
          title: 'Could not load top artists',
          message,
          dedupeKey: 'top-artists-error',
        })
      }
    }

    void loadTopArtists()

    return () => {
      isCancelled = true
    }
  }, [
    pageState.status,
    selectedArtistTimeRange,
    selectedArtistLimit,
    artistsReloadKey,
    showNotification,
  ])

  useEffect(() => {
    if (pageState.status !== 'ready') {
      return
    }

    let isCancelled = false

    async function loadTopTracks() {
      setTracksState({
        status: 'loading',
      })

      try {
        const topTracks = await getTopTracks(
          selectedTrackTimeRange,
          selectedTrackLimit,
        )

        if (isCancelled) {
          return
        }

        if (topTracks.items.length === 0) {
          setTracksState({
            status: 'empty',
          })

          return
        }

        setTracksState({
          status: 'ready',
          data: topTracks,
        })
      } catch (requestError) {
        if (isCancelled) {
          return
        }

        if (
          requestError instanceof ApiRequestError
          && requestError.status === 401
        ) {
          setPageState({
            status: 'guest',
          })

          return
        }

        const message = getUserFacingError(
          requestError,
          'Could not load your top tracks.',
        )

        setTracksState({
          status: 'error',
          message,
        })

        showNotification({
          kind: 'error',
          title: 'Could not load top tracks',
          message,
          dedupeKey: 'top-tracks-error',
        })
      }
    }

    void loadTopTracks()

    return () => {
      isCancelled = true
    }
  }, [
    pageState.status,
    selectedTrackTimeRange,
    selectedTrackLimit,
    tracksReloadKey,
    showNotification,
  ])

  const handleUnauthorized = useCallback(() => {
    showNotification({
      kind: 'error',
      title: 'Spotify session expired',
      message:
        'Sign in again to continue viewing your statistics.',
      durationMs: 8_000,
      dedupeKey: 'spotify-session-expired',
    })

    setPageState({
      status: 'guest',
    })
  }, [showNotification])

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()

      setPageState({
        status: 'guest',
      })
    } catch (requestError) {
    const message = getUserFacingError(
      requestError,
      'Could not log out. Please try again.',
    )

    showNotification({
      kind: 'error',
      title: 'Could not log out',
      message,
      dedupeKey: 'logout-error',
    })
  } finally {
      setIsLoggingOut(false)
    }
  }

  function handleRetryTopArtists() {
    setArtistsReloadKey(
      (currentKey) => currentKey + 1,
    )
  }

  function handleRetryTopTracks() {
    setTracksReloadKey(
      (currentKey) => currentKey + 1,
    )
  }

  return (
    <AppLayout
      showNavigation={pageState.status === 'ready'}
    >
      <section className="profile-page">
        {pageState.status === 'loading' && (
          <>
            <p
              className="sr-only"
              aria-live="polite"
            >
              Loading your Spotify profile.
            </p>

            <ProfileSkeleton />
          </>
        )}

        {pageState.status === 'guest' && (
          <div className="guest-card">
            <p className="eyebrow">
              Your music, your story
            </p>

            <h1>
              See the sound behind your Spotify account.
            </h1>

            <p className="guest-description">
              Sign in to view your profile and prepare your
              personal listening statistics dashboard.
            </p>

            <a
              className="primary-button"
              href={getSpotifyLoginUrl()}
            >
              Continue with Spotify
            </a>

            <p className="privacy-note">
              Your Spotify password is never shared with this app.
            </p>
          </div>
        )}

        {pageState.status === 'error' && (
          <div
            className="status-panel status-panel-error"
            role="alert"
          >
            <p className="eyebrow">
              Something went wrong
            </p>

            <h1>
              We could not load your profile.
            </h1>

            <p className="status-description">
              {pageState.message}
            </p>

            <button
              className="secondary-button"
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {pageState.status === 'ready' && (
          <div className="dashboard-content">
            <article
              id="overview"
              className="profile-card dashboard-anchor"
            >
              <div className="profile-hero">
                <div className="profile-avatar-frame">
                  <ProfileAvatar
                    displayName={pageState.profile.display_name}
                    avatarUrl={pageState.profile.avatar_url}
                  />
                </div>

                <div className="profile-heading">
                  <p className="eyebrow">
                    Spotify profile
                  </p>

                  <h1>
                    {
                      pageState.profile.display_name
                      ?? 'Spotify listener'
                    }
                  </h1>

                  <p className="profile-subtitle">
                    Your personal music dashboard starts here.
                  </p>
                </div>
              </div>

              <div className="profile-content">
                <section
                  className="profile-details"
                  aria-label="Profile details"
                >
                  <div className="detail-item">
                    <span>Account</span>

                    <strong>
                      {pageState.profile.spotify_account_id}
                    </strong>
                  </div>

                  <div className="detail-item">
                    <span>Subscription</span>

                    <strong className="subscription-badge">
                      {
                        pageState.profile.subscription
                        ?? 'Not available'
                      }
                    </strong>
                  </div>
                </section>

                <div className="profile-actions">
                  {pageState.profile.spotify_url && (
                    <a
                      className="primary-button"
                      href={pageState.profile.spotify_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Spotify
                    </a>
                  )}

                  <button
                    className="secondary-button"
                    type="button"
                    disabled={isLoggingOut}
                    onClick={() => void handleLogout()}
                  >
                    {
                      isLoggingOut
                        ? 'Logging out...'
                        : 'Log out'
                    }
                  </button>
                </div>
              </div>
            </article>

            <CurrentTrackCard
              onUnauthorized={handleUnauthorized}
            />

            <section
              id="top-artists"
              className="artists-section dashboard-anchor"
              aria-labelledby="top-artists-title"
              aria-busy={artistsState.status === 'loading'}
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    Your listening profile
                  </p>

                  <h2 id="top-artists-title">
                    Top artists
                  </h2>
                </div>

                <p>
                  {TIME_RANGE_DESCRIPTIONS[selectedArtistTimeRange]}
                </p>
              </div>

              <div className="stats-controls">
                <TimeRangeSwitcher
                  value={selectedArtistTimeRange}
                  ariaLabel="Top artists time range"
                  onChange={setSelectedArtistTimeRange}
                />

                <LimitSelector
                  value={selectedArtistLimit}
                  label="Artists"
                  ariaLabel="Number of artists to display"
                  min={1}
                  max={50}
                  onChange={setSelectedArtistLimit}
                />
              </div>

              <p
                className="sr-only"
                aria-live="polite"
              >
                {
                  artistsState.status === 'loading'
                    ? 'Loading top artists.'
                    : ''
                }
              </p>

              {artistsState.status === 'loading' && (
                <div className="artists-grid">
                  {
                    Array.from(
                    {
                      length: Math.min(selectedArtistLimit, 10),
                    },
                    (_, index) => (
                      <ArtistCardSkeleton key={index} />
                    ),
                  )
                  }
                </div>
              )}

              {artistsState.status === 'ready' && (
                <>
                  <p className="artists-result-count">
                    Showing {artistsState.data.items.length} of{' '}
                    {artistsState.data.total} available artists
                  </p>

                  <div className="artists-grid">
                    {artistsState.data.items.map((artist) => (
                      <ArtistCard
                        key={artist.spotify_id}
                        artist={artist}
                      />
                    ))}
                  </div>
                </>
              )}

              {artistsState.status === 'empty' && (
                <div className="artists-feedback">
                  <p className="eyebrow">
                    No data yet
                  </p>

                  <h3>
                    No top artists for this period.
                  </h3>

                  <p>
                    Spotify did not return any favorite artists
                    for the selected time range.
                  </p>
                </div>
              )}

              {artistsState.status === 'error' && (
                <div
                  className="
                    artists-feedback
                    artists-feedback-error
                  "
                  role="alert"
                >
                  <p className="eyebrow">
                    Could not load artists
                  </p>

                  <h3>
                    Your profile is still available.
                  </h3>

                  <p>
                    {artistsState.message}
                  </p>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleRetryTopArtists}
                  >
                    Try again
                  </button>
                </div>
              )}
            </section>

            <section
              id="top-tracks"
              className="tracks-section dashboard-anchor"
              aria-labelledby="top-tracks-title"
              aria-busy={tracksState.status === 'loading'}
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    Your favorite songs
                  </p>

                  <h2 id="top-tracks-title">
                    Top tracks
                  </h2>
                </div>

                <p>
                  {TIME_RANGE_DESCRIPTIONS[selectedTrackTimeRange]}
                </p>
              </div>

              <div className="stats-controls">
                <TimeRangeSwitcher
                  value={selectedTrackTimeRange}
                  ariaLabel="Top tracks time range"
                  onChange={setSelectedTrackTimeRange}
                />

                <LimitSelector
                  value={selectedTrackLimit}
                  label="Tracks"
                  ariaLabel="Number of tracks to display"
                  min={1}
                  max={5000}
                  onChange={setSelectedTrackLimit}
                />
              </div>

              <p
                className="sr-only"
                aria-live="polite"
              >
                {
                  tracksState.status === 'loading'
                    ? 'Loading top tracks.'
                    : ''
                }
              </p>

              {tracksState.status === 'loading' && (
                <ol
                  className="tracks-list"
                  aria-hidden="true"
                >
                  {Array.from(
                    {
                      length: Math.min(
                        selectedTrackLimit,
                        8,
                      ),
                    },
                    (_, index) => (
                      <li
                        className="tracks-list-item"
                        key={index}
                      >
                        <TrackItemSkeleton />
                      </li>
                    ),
                  )}
                </ol>
              )}

              {tracksState.status === 'ready' && (
                <>
                  <p className="tracks-result-count">
                    Showing {tracksState.data.items.length} of{' '}
                    {tracksState.data.total} available tracks
                  </p>

                  <ol
                    className="tracks-list"
                    aria-label="Top tracks ranking"
                  >
                    {tracksState.data.items.map((track) => (
                      <li
                        className="tracks-list-item"
                        key={track.spotify_id}
                      >
                        <TrackItem track={track} />
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {tracksState.status === 'empty' && (
                <div className="tracks-feedback">
                  <p className="eyebrow">
                    No data yet
                  </p>

                  <h3>
                    No top tracks for this period.
                  </h3>

                  <p>
                    Spotify did not return any favorite tracks
                    for the selected time range.
                  </p>
                </div>
              )}

              {tracksState.status === 'error' && (
                <div
                  className="
                    tracks-feedback
                    tracks-feedback-error
                  "
                  role="alert"
                >
                  <p className="eyebrow">
                    Could not load tracks
                  </p>

                  <h3>
                    Your other statistics are still available.
                  </h3>

                  <p>
                    {tracksState.message}
                  </p>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleRetryTopTracks}
                  >
                    Try again
                  </button>
                </div>
              )}
            </section>
            <HistoryPage
              onUnauthorized={handleUnauthorized}
            />
          </div>
        )}
      </section>
    </AppLayout>
  )
}

export default App