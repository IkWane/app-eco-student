import { currentMonth, formatMonth, shiftMonth } from '../lib/format.ts'
import { Icon } from './Icon.tsx'

type MonthPickerProps = {
  // Mois affiché, au format YYYY-MM.
  month: string
  onChange: (month: string) => void
}

export function MonthPicker({ month, onChange }: MonthPickerProps) {
  const canGoNext = month <= currentMonth()

  return (
    <div className="bu-month">
      <button
        type="button"
        className="bu-btn bu-btn-ghost bu-btn-icon"
        aria-label="Mois précédent"
        onClick={() => onChange(shiftMonth(month, -1))}
      >
        <Icon name="chevronLeft" />
      </button>
      <span className="bu-month-label" aria-live="polite">
        {formatMonth(month)}
      </span>
      <button
        type="button"
        className="bu-btn bu-btn-ghost bu-btn-icon"
        aria-label="Mois suivant"
        disabled={!canGoNext}
        onClick={() => onChange(shiftMonth(month, 1))}
      >
        <Icon name="chevronRight" />
      </button>
    </div>
  )
}
