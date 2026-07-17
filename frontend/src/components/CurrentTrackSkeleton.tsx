import Skeleton from './Skeleton'

function CurrentTrackSkeleton() {
  return (
    <article
      className="
        current-track-card
        current-track-card-skeleton
      "
      aria-hidden="true"
    >
      <Skeleton
        className="
          current-track-image-frame
          skeleton-current-track-image
        "
      />

      <div className="current-track-content">
        <div className="current-track-title-row">
          <div className="skeleton-current-track-text">
            <Skeleton className="skeleton-current-track-title" />
            <Skeleton className="skeleton-current-track-artist" />
            <Skeleton className="skeleton-current-track-album" />
          </div>

          <Skeleton className="skeleton-playback-status" />
        </div>

        <div className="current-track-progress-group">
          <Skeleton className="skeleton-current-progress" />

          <div className="current-track-time">
            <Skeleton className="skeleton-current-time" />
            <Skeleton className="skeleton-current-time" />
          </div>
        </div>
      </div>

      <Skeleton
        className="
          current-track-link
          skeleton-current-link
        "
      />
    </article>
  )
}

export default CurrentTrackSkeleton