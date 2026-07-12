import './App.css'

import { env } from './config/env'


function App() {
  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Spotify Stats</p>

        <h1>Your personal Spotify statistics</h1>

        <p className="description">
          Explore your favorite artists, top tracks, recent listening
          activity, and personal music preferences.
        </p>

        <p className="status">
          Frontend configured successfully
        </p>

        <p className="description">
          API base URL: <code>{env.apiBaseUrl}</code>
        </p>
      </section>
    </main>
  )
}

export default App