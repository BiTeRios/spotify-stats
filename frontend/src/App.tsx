import { useEffect, useState } from 'react'

import './App.css'

import {
  getHealth,
  type HealthResponse,
} from './api/health'


function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkBackendConnection() {
      try {
        const healthData = await getHealth()

        setHealth(healthData)
        setError(null)
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'An unknown connection error occurred'

        setError(message)
        setHealth(null)
      } finally {
        setIsLoading(false)
      }
    }

    void checkBackendConnection()
  }, [])

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Spotify Stats</p>

        <h1>Your personal Spotify statistics</h1>

        <p className="description">
          Explore your favorite artists, top tracks, recent listening
          activity, and personal music preferences.
        </p>

        {isLoading && (
          <div className="connection-card connection-card-loading">
            <span className="connection-indicator" />

            <div>
              <strong>Checking backend connection</strong>
              <p>Connecting to the Spotify Stats API...</p>
            </div>
          </div>
        )}

        {!isLoading && health && (
          <div className="connection-card connection-card-success">
            <span className="connection-indicator" />

            <div>
              <strong>Backend connection established</strong>

              <dl className="health-details">
                <div>
                  <dt>Status</dt>
                  <dd>{health.status}</dd>
                </div>

                <div>
                  <dt>Service</dt>
                  <dd>{health.service}</dd>
                </div>

                <div>
                  <dt>Environment</dt>
                  <dd>{health.environment}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="connection-card connection-card-error">
            <span className="connection-indicator" />

            <div>
              <strong>Backend connection failed</strong>

              <p>{error}</p>

              <p>
                Make sure the FastAPI server is running on port 8000.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default App