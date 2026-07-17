import Skeleton from './Skeleton'

function TrackItemSkeleton() {
  return (
    <article
      className="
        track-item
        track-item-skeleton
      "
      aria-hidden="true"
    >
      <Skeleton className="skeleton-track-rank" />

      <Skeleton
        className="
          track-image-frame
          skeleton-track-image
        "
      />

      <div
        className="
          track-item-content
          skeleton-track-content
        "
      >
        <Skeleton className="skeleton-track-title" />
        <Skeleton className="skeleton-track-artist" />
        <Skeleton className="skeleton-track-album" />
      </div>

      <Skeleton className="skeleton-track-duration" />

      <div className="track-actions">
        <Skeleton className="skeleton-track-action" />
      </div>
    </article>
  )
}

export default TrackItemSkeleton