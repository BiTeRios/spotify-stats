import type { ReactNode } from 'react'

import MainNavigation from '../components/MainNavigation'

interface AppLayoutProps {
  children: ReactNode
  showNavigation?: boolean
}

function AppLayout({
  children,
  showNavigation = false,
}: AppLayoutProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a
            className="brand"
            href={showNavigation ? '#overview' : '/'}
            aria-label="StatsClever home"
          >
            <span
              className="brand-mark"
              aria-hidden="true"
            >
              <span />
              <span />
              <span />
            </span>

            <span className="brand-text">
              StatsClever
            </span>
          </a>

          {showNavigation && <MainNavigation />}
        </div>
      </header>

      <main className="app-main">
        {children}
      </main>
    </div>
  )
}

export default AppLayout