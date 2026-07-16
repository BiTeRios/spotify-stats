import type { TopTrack } from '../api/stats'

interface TrackItemProps {
  track: TopTrack
}

function TrackItem({ track }: TrackItemProps) {
  const artistLabel = track.artist_names.length > 0
    ? track.artist_names.join(', ')
    : 'Unknown artist'

  return (
    <article className="track-item">
      <div className="track-image-frame">
        {track.album_image_url ? (
          <img
            className="track-image"
            src={track.album_image_url}
            alt=""
          />
        ) : (
          <div
            className="track-image-fallback"
            aria-hidden="true"
          >
            ♪
          </div>
        )}
      </div>

      <div className="track-item-content">
        <h3>{track.name}</h3>

        <p className="track-artists">
          {artistLabel}
        </p>

        <p className="track-album">
          {track.album_name}
        </p>
      </div>
    </article>
  )
}

export default TrackItem