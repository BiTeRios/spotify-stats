import Skeleton from './Skeleton'

function HistoryItemSkeleton() {
  return (
    <article
      className="
        history-item
        history-item-skeleton
      "
      aria-hidden="true"
    >
      <Skeleton
        className="
          history-image-frame
          skeleton-history-image
        "
      />

      <div
        className="
          history-item-content
          skeleton-history-content
        "
      >
        <Skeleton className="skeleton-history-title" />
        <Skeleton className="skeleton-history-artist" />
        <Skeleton className="skeleton-history-album" />
      </div>

      <div
        className="
          history-played-at
          skeleton-history-played-at
        "
      >
        <Skeleton className="skeleton-history-date" />
        <Skeleton className="skeleton-history-time" />
      </div>

      <div className="history-actions">
        <Skeleton className="skeleton-history-action" />
      </div>
    </article>
  )
}

export default HistoryItemSkeleton