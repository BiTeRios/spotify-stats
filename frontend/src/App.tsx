import { useEffect, useState } from 'react'

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
  type TopArtistsResponse,
  type TopItemsTimeRange,
} from './api/stats'

import ArtistCard from './components/ArtistCard'
import ArtistCardSkeleton from './components/ArtistCardSkeleton'
import ProfileAvatar from './components/ProfileAvatar'
import TimeRangeSwitcher from './components/TimeRangeSwitcher'
import ArtistLimitSelector from './components/ArtistLimitSelector'

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
  const [pageState, setPageState] = useState<PageState>({
    status: 'loading',
  })

  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TopItemsTimeRange>('medium_term')

  const [selectedArtistLimit, setSelectedArtistLimit] =
    useState(20)

  const [artistsState, setArtistsState] =
    useState<ArtistsState>({
      status: 'loading',
    })

  const [artistsReloadKey, setArtistsReloadKey] =
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

        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Could not load your Spotify profile.'

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
          selectedTimeRange,
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

        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Could not load your top artists.'

        setArtistsState({
          status: 'error',
          message,
        })
      }
    }

    void loadTopArtists()

    return () => {
      isCancelled = true
    }
  }, [
    pageState.status,
    selectedTimeRange,
    selectedArtistLimit,
    artistsReloadKey,
  ])

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()

      setPageState({
        status: 'guest',
      })
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Could not log out.'

      setPageState({
        status: 'error',
        message,
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

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="/"
          aria-label="Spotify Stats home"
        >
          <span
            className="brand-mark"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </span>

          <span>Spotify Stats</span>
        </a>
      </header>

      <section className="profile-page">
        {pageState.status === 'loading' && (
          <div
            className="status-panel"
            aria-live="polite"
          >
            <span
              className="loader"
              aria-hidden="true"
            />

            <p className="status-label">
              Loading your Spotify profile
            </p>

            <p className="status-description">
              Connecting securely to your account...
            </p>
          </div>
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
            <article className="profile-card">
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

            <section
              className="artists-section"
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
                  {TIME_RANGE_DESCRIPTIONS[selectedTimeRange]}
                </p>
              </div>

              <div className="artists-controls">
                <TimeRangeSwitcher
                  value={selectedTimeRange}
                  onChange={setSelectedTimeRange}
                />

                <ArtistLimitSelector
                  value={selectedArtistLimit}
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
          </div>
        )}
      </section>
    </main>
  )
}

export default App