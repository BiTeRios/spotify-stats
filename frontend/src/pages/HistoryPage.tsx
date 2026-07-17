import { useEffect, useState } from 'react'

import {
  getRecentHistory,
  type RecentHistoryResponse,
} from '../api/history'
import { ApiRequestError } from '../api/client'
import HistoryItem from '../components/HistoryItem'
import {
  formatTimeZoneLabel,
  getUserTimeZone,
} from '../utils/formatPlayedAt'

type HistoryState =
  | {
      status: 'loading'
    }
  | {
      status: 'ready'
      data: RecentHistoryResponse
    }
  | {
      status: 'empty'
    }
  | {
      status: 'error'
      message: string
    }

interface HistoryPageProps {
  onUnauthorized: () => void
}

function HistoryPage({
  onUnauthorized,
}: HistoryPageProps) {
  const [historyState, setHistoryState] =
    useState<HistoryState>({
      status: 'loading',
    })

  const [historyReloadKey, setHistoryReloadKey] =
    useState(0)

  const [isRefreshing, setIsRefreshing] =
    useState(false)

  const [userTimeZone] = useState(getUserTimeZone)

  useEffect(() => {
    let isCancelled = false

    async function loadRecentHistory() {
      const isManualRefresh = historyReloadKey > 0

      if (isManualRefresh) {
        setIsRefreshing(true)
      } else {
        setHistoryState({
          status: 'loading',
        })
      }

      try {
        const recentHistory = await getRecentHistory(50)

        if (isCancelled) {
          return
        }

        if (recentHistory.items.length === 0) {
          setHistoryState({
            status: 'empty',
          })

          return
        }

        setHistoryState({
          status: 'ready',
          data: recentHistory,
        })
      } catch (requestError) {
        if (isCancelled) {
          return
        }

        if (
          requestError instanceof ApiRequestError
          && requestError.status === 401
        ) {
          onUnauthorized()
          return
        }

        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Could not load your recent listening history.'

        setHistoryState({
          status: 'error',
          message,
        })
      } finally {
        if (!isCancelled) {
          setIsRefreshing(false)
        }
      }
    }

    void loadRecentHistory()

    return () => {
      isCancelled = true
    }
  }, [historyReloadKey, onUnauthorized])

  function handleRefresh() {
    setHistoryReloadKey(
      (currentKey) => currentKey + 1,
    )
  }

  return (
    <section
      className="history-section"
      aria-labelledby="recent-history-title"
      aria-busy={
        historyState.status === 'loading'
        || isRefreshing
      }
    >
      <div className="section-heading history-heading">
        <div>
          <p className="eyebrow">
            Your latest activity
          </p>

          <h2 id="recent-history-title">
            Recently played
          </h2>
        </div>

        <div className="history-heading-actions">
          <p>
            Spotify provides up to 50 recent track plays.
            Times are shown in{' '}
            <strong>
              {formatTimeZoneLabel(userTimeZone)}
            </strong>.
          </p>

          <button
            className="history-refresh-button"
            type="button"
            disabled={
              historyState.status === 'loading'
              || isRefreshing
            }
            onClick={handleRefresh}
          >
            <span
              className={
                isRefreshing
                  ? 'history-refresh-icon is-spinning'
                  : 'history-refresh-icon'
              }
              aria-hidden="true"
            >
              ↻
            </span>

            <span>
              {
                isRefreshing
                  ? 'Refreshing...'
                  : 'Refresh'
              }
            </span>
          </button>
        </div>
      </div>

      <p
        className="sr-only"
        aria-live="polite"
      >
        {
          historyState.status === 'loading'
            ? 'Loading recently played tracks.'
            : isRefreshing
              ? 'Refreshing recently played tracks.'
              : ''
        }
      </p>

      {historyState.status === 'loading' && (
        <div className="history-feedback">
          <span
            className="loader"
            aria-hidden="true"
          />

          <p>
            Loading your listening history...
          </p>
        </div>
      )}

      {historyState.status === 'ready' && (
        <>
          <p className="history-result-count">
            Showing {historyState.data.items.length} recent
            plays
          </p>

          <ol
            className="history-list"
            aria-label="Recently played tracks"
          >
            {historyState.data.items.map(
              (item, index) => (
                <li
                  className="history-list-item"
                  key={
                    `${item.spotify_id}-${item.played_at}-${index}`
                  }
                >
                  <HistoryItem
                    item={item}
                    timeZone={userTimeZone}
                  />
                </li>
              ),
            )}
          </ol>
        </>
      )}

      {historyState.status === 'empty' && (
        <div className="history-feedback">
          <p className="eyebrow">
            No recent activity
          </p>

          <h3>
            No recently played tracks were found.
          </h3>

          <p>
            Spotify did not return any recent track plays
            for this account.
          </p>
        </div>
      )}

      {historyState.status === 'error' && (
        <div
          className="
            history-feedback
            history-feedback-error
          "
          role="alert"
        >
          <p className="eyebrow">
            Could not load history
          </p>

          <h3>
            Your other statistics are still available.
          </h3>

          <p>{historyState.message}</p>
        </div>
      )}
    </section>
  )
}

export default HistoryPage