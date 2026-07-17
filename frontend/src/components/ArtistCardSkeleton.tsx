import Skeleton from './Skeleton'

function ArtistCardSkeleton() {
  return (
    <article
      className="artist-card artist-card-skeleton"
      aria-hidden="true"
    >
      <Skeleton className="skeleton-artist-image" />

      <div className="artist-card-content">
        <Skeleton className="skeleton-artist-name" />

        <Skeleton className="skeleton-artist-genres" />

        <Skeleton className="skeleton-artist-link" />
      </div>
    </article>
  )
}

export default ArtistCardSkeleton