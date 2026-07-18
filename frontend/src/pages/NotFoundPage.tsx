import {
  useEffect,
} from 'react'

import {
  Link,
  useLocation,
} from 'react-router'

import AppLayout from '../layouts/AppLayout'

function NotFoundPage() {
  const location = useLocation()

  useEffect(() => {
    const previousTitle = document.title

    document.title =
      'Page not found | StatsClever'

    return () => {
      document.title = previousTitle
    }
  }, [])

  return (
    <AppLayout showNavigation={false}>
      <section
        className="not-found-page"
        aria-labelledby="not-found-title"
      >
        <div className="not-found-card">
          <div
            className="not-found-visual"
            aria-hidden="true"
          >
            <span className="not-found-code">
              404
            </span>

            <span className="not-found-record">
              <span className="not-found-record-label" />
            </span>
          </div>

          <p className="not-found-eyebrow">
            Page not found
          </p>

          <h1 id="not-found-title">
            This track is not available
          </h1>

          <p className="not-found-description">
            The page may have been removed, renamed,
            or the address may be incorrect.
          </p>

          <p className="not-found-path">
            Requested path:
            {' '}

            <code>
              {location.pathname}
            </code>
          </p>

          <Link
            className="
              primary-button
              not-found-home-link
            "
            to="/"
          >
            Go to home
          </Link>
        </div>
      </section>
    </AppLayout>
  )
}

export default NotFoundPage