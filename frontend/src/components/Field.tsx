import type { HTMLInputTypeAttribute } from 'react'
import { Icon } from './Icon.tsx'

type FieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  inputMode?: 'text' | 'decimal' | 'email'
  hint?: string
  error?: string
  // Unité affichée à droite de la valeur (ex. « € »).
  suffix?: string
  // Longueur maximale : affiche un compteur « 12/80 ».
  maxLength?: number
}

// Champ du design system : label visible, aide ou erreur reliée par aria-describedby.
export function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  inputMode,
  hint,
  error,
  suffix,
  maxLength,
}: FieldProps) {
  const messageId = `${id}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div className="bu-field">
      <div className="bu-field-top">
        <label className="bu-label" htmlFor={id}>
          {label}
        </label>
        {maxLength ? (
          <span className="bu-counter">
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
      <div className="bu-affix">
        <input
          id={id}
          className={`bu-input${suffix ? ' bu-input-suffixed' : ''}`}
          type={type}
          value={value}
          maxLength={maxLength}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix ? (
          <span className="bu-suffix" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="bu-error" id={messageId}>
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : hint ? (
        <p className="bu-hint" id={messageId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
