import type { TopItemsTimeRange } from '../api/stats'

interface TimeRangeSwitcherProps {
  value: TopItemsTimeRange
  onChange: (value: TopItemsTimeRange) => void
}

const TIME_RANGE_OPTIONS: Array<{
  value: TopItemsTimeRange
  label: string
}> = [
  {
    value: 'short_term',
    label: '4 weeks',
  },
  {
    value: 'medium_term',
    label: '6 months',
  },
  {
    value: 'long_term',
    label: '1 year',
  },
]

function TimeRangeSwitcher({
  value,
  onChange,
}: TimeRangeSwitcherProps) {
  return (
    <div
      className="time-range-switcher"
      role="group"
      aria-label="Top artists time range"
    >
      {TIME_RANGE_OPTIONS.map((option) => {
        const isSelected = option.value === value

        return (
          <button
            className={
              isSelected
                ? 'time-range-button time-range-button-active'
                : 'time-range-button'
            }
            type="button"
            key={option.value}
            aria-pressed={isSelected}
            onClick={() => {
              if (!isSelected) {
                onChange(option.value)
              }
            }}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default TimeRangeSwitcher