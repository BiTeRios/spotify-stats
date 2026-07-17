import type { RecentPlay } from '../api/history'
import { formatPlayedAt } from '../utils/formatPlayedAt'

interface HistoryItemProps {
  item: RecentPlay
  timeZone: string
}

function HistoryItem({
  item,
  timeZone,
}: HistoryItemProps) {
  const artistLabel = item.artist_names.length > 0
    ? item.artist_names.join(', ')
    : 'Unknown artist'

  const formattedPlayedAt = formatPlayedAt(
    item.played_at,
    timeZone,
  )

  return (
    <article className="history-item">
      <div className="history-image-frame">
        {item.album_image_url ? (
          <img
            className="history-image"
            src={item.album_image_url}
            alt=""
          />
        ) : (
          <div
            className="history-image-fallback"
            aria-hidden="true"
          >
            ♪
          </div>
        )}
      </div>

      <div className="history-item-content">
        <h3>{item.name}</h3>

        <p className="history-artists">
          {artistLabel}
        </p>

        <p className="history-album">
          {item.album_name}
        </p>
      </div>

      <div className="history-played-at">
        <span>{formattedPlayedAt.date}</span>

        <time dateTime={item.played_at}>
          {formattedPlayedAt.time}
        </time>
      </div>

      <div className="history-actions">
        {item.spotify_url && (
          <a
            className="track-spotify-link"
            href={item.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              `Open ${item.name} by ${artistLabel} in Spotify`
            }
          >
            <span className="track-spotify-link-text">
              Spotify
            </span>

            <span aria-hidden="true">
              ↗
            </span>
          </a>
        )}
      </div>
    </article>
  )
}

export default HistoryItem