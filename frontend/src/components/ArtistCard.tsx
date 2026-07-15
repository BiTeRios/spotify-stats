import type { TopArtist } from '../api/stats'

interface ArtistCardProps {
  artist: TopArtist
}

function ArtistCard({ artist }: ArtistCardProps) {
  const visibleGenres = artist.genres.slice(0, 3)

  return (
    <article className="artist-card">
      <span className="artist-rank">
        #{artist.rank}
      </span>

      <div className="artist-image-frame">
        {artist.image_url ? (
          <img
            className="artist-image"
            src={artist.image_url}
            alt=""
          />
        ) : (
          <div
            className="artist-image-fallback"
            aria-hidden="true"
          >
            {artist.name.charAt(0).toUpperCase() || 'A'}
          </div>
        )}
      </div>

      <div className="artist-card-content">
        <h3>{artist.name}</h3>

        <p className="artist-genres">
          {visibleGenres.length > 0
            ? visibleGenres.join(' • ')
            : 'Genres not available'}
        </p>

        {artist.spotify_url && (
          <a
            className="artist-link"
            href={artist.spotify_url}
            target="_blank"
            rel="noreferrer"
          >
            View on Spotify
          </a>
        )}
      </div>
    </article>
  )
}

export default ArtistCard