interface ArtistLimitSelectorProps {
  value: number
  onChange: (value: number) => void
}

const ARTIST_LIMIT_OPTIONS = Array.from(
  { length: 50 },
  (_, index) => index + 1,
)

function ArtistLimitSelector({
  value,
  onChange,
}: ArtistLimitSelectorProps) {
  return (
    <label className="artist-limit-selector">
      <span>Artists</span>

      <select
        value={value}
        aria-label="Number of artists to display"
        onChange={(event) => {
          onChange(Number(event.target.value))
        }}
      >
        {ARTIST_LIMIT_OPTIONS.map((limit) => (
          <option
            key={limit}
            value={limit}
          >
            {limit}
          </option>
        ))}
      </select>
    </label>
  )
}

export default ArtistLimitSelector