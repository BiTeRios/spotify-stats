import { useEffect, useState } from 'react'

import './App.css'

import {
  ApiRequestError,
  getMyProfile,
  getSpotifyLoginUrl,
  logout,
  type UserProfile,
} from './api/profile'
import ProfileAvatar from './components/ProfileAvatar'

type PageState =
  | { status: 'loading' }
  | { status: 'guest' }
  | { status: 'ready'; profile: UserProfile }
  | { status: 'error'; message: string }

function App() {
  const [pageState, setPageState] = useState<PageState>({
    status: 'loading',
  })

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
        )}
      </section>
    </main>
  )
}

export default App