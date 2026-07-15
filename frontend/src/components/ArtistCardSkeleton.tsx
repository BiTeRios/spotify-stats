function ArtistCardSkeleton() {
  return (
    <article
      className="artist-card artist-card-skeleton"
      aria-hidden="true"
    >
      <div className="skeleton-block skeleton-artist-image" />

      <div className="artist-card-content">
        <div className="skeleton-block skeleton-artist-name" />

        <div className="skeleton-block skeleton-artist-genres" />

        <div className="skeleton-block skeleton-artist-link" />
      </div>
    </article>
  )
}

export default ArtistCardSkeleton