import { Icon } from './Icon.tsx'

type SelectFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  error?: string
}

export function SelectField({ id, label, value, onChange, options, placeholder, error }: SelectFieldProps) {
  const messageId = `${id}-message`

  return (
    <div className="bu-field">
      <div className="bu-field-top">
        <label className="bu-label" htmlFor={id}>
          {label}
        </label>
      </div>
      <select
        id={id}
        className="bu-input bu-select"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? messageId : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="bu-error" id={messageId}>
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  )
}
