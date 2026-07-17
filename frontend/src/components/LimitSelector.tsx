import {
  useEffect,
  useId,
  useState,
  type FormEvent,
} from 'react'

interface LimitSelectorProps {
  value: number
  label: string
  ariaLabel: string
  min?: number
  max?: number
  onChange: (value: number) => void
}

function LimitSelector({
  value,
  label,
  ariaLabel,
  min = 1,
  max = 50,
  onChange,
}: LimitSelectorProps) {
  const inputId = useId()

  const [draftValue, setDraftValue] = useState(
    String(value),
  )

  useEffect(() => {
    setDraftValue(String(value))
  }, [value])

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const parsedValue = Number(draftValue)

    if (!Number.isInteger(parsedValue)) {
      setDraftValue(String(value))
      return
    }

    const normalizedValue = Math.min(
      max,
      Math.max(min, parsedValue),
    )

    setDraftValue(String(normalizedValue))

    if (normalizedValue !== value) {
      onChange(normalizedValue)
    }
  }

  return (
    <form
      className="limit-selector"
      onSubmit={handleSubmit}
    >
      <label htmlFor={inputId}>
        {label}
      </label>

      <div className="limit-selector-control">
        <input
          id={inputId}
          type="number"
          min={min}
          max={max}
          step={1}
          inputMode="numeric"
          value={draftValue}
          aria-label={ariaLabel}
          onChange={(event) => {
            setDraftValue(event.target.value)
          }}
        />

        <button type="submit">
          Apply
        </button>
      </div>

      <span className="limit-selector-hint">
        Enter a value from {min} to {max}
      </span>
    </form>
  )
}

export default LimitSelector