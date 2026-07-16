interface LimitSelectorProps {
  value: number
  label: string
  ariaLabel: string
  onChange: (value: number) => void
}

const LIMIT_OPTIONS = Array.from(
  { length: 50 },
  (_, index) => index + 1,
)

function LimitSelector({
  value,
  label,
  ariaLabel,
  onChange,
}: LimitSelectorProps) {
  return (
    <label className="limit-selector">
      <span>{label}</span>

      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => {
          onChange(Number(event.target.value))
        }}
      >
        {LIMIT_OPTIONS.map((limit) => (
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

export default LimitSelector