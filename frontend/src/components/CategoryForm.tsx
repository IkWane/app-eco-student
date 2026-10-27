import { useState, type FormEvent } from 'react'
import { categorySchema } from '@eco/shared'
import { ApiError } from '../api/client.ts'
import { createCategory } from '../api/categories.ts'
import { apiErrors, zodErrors, type FieldErrors } from '../lib/form.ts'
import { useFormState } from '../lib/useFormState.ts'
import { Field } from './Field.tsx'
import { Notice } from './Notice.tsx'

// Couleurs proposées : lisibles sur fond clair et sombre. Le sélecteur natif permet d'en choisir une autre.
const SWATCHES = ['#2867b2', '#a06c00', '#2e8540', '#b0468f', '#c94c14', '#0f7f93', '#6b4fbb', '#74766d']

type FormValues = { name: string; color: string }

const INITIAL: FormValues = { name: '', color: SWATCHES[0] }

// Même schéma Zod que l'API (@eco/shared).
const validate = (values: FormValues): FieldErrors => {
  const result = categorySchema.safeParse(values)
  return result.success ? {} : zodErrors(result.error)
}

type CategoryFormProps = {
  onCreated: () => void
}

export function CategoryForm({ onCreated }: CategoryFormProps) {
  // `key` remet le formulaire à zéro après une création réussie.
  const [resetKey, setResetKey] = useState(0)
  return <CategoryFormInner key={resetKey} onCreated={() => { setResetKey((k) => k + 1); onCreated() }} />
}

function CategoryFormInner({ onCreated }: CategoryFormProps) {
  const form = useFormState<FormValues>(INITIAL, validate)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!form.submit()) return

    setSubmitting(true)
    try {
      await createCategory(categorySchema.parse(form.values))
      onCreated()
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // Nom déjà pris (par une catégorie par défaut ou une des tiennes) : affiché sous le champ.
        form.setServerErrors({ name: error.message })
      } else if (error instanceof ApiError && error.details.length > 0) {
        form.setServerErrors(apiErrors(error.details))
      } else {
        setFormError(error instanceof Error ? error.message : 'Impossible de créer la catégorie.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const colorError = form.errors.color

  return (
    <form className="bu-card category-form" onSubmit={handleSubmit} noValidate aria-labelledby="category-form-title">
      <h2 className="bu-card-title" id="category-form-title">
        Nouvelle catégorie
      </h2>
      {formError ? (
        <Notice tone="danger" title="Création impossible">
          {formError}
        </Notice>
      ) : null}

      <Field
        id="category-name"
        label="Nom"
        maxLength={50}
        value={form.values.name}
        onChange={(value) => form.setValue('name', value)}
        error={form.errors.name}
      />

      <fieldset className="bu-field category-colors">
        <legend className="bu-label">Couleur</legend>
        <div className="category-swatches">
          {SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              className="category-swatch"
              style={{ background: color }}
              aria-label={`Couleur ${color}`}
              aria-pressed={form.values.color === color}
              onClick={() => form.setValue('color', color)}
            />
          ))}
          <label className="category-custom">
            <input
              type="color"
              value={form.values.color}
              aria-invalid={colorError ? true : undefined}
              onChange={(event) => form.setValue('color', event.target.value)}
            />
            Autre
          </label>
        </div>
        {colorError ? <p className="bu-error">{colorError}</p> : null}
      </fieldset>

      <div className="expense-form-actions">
        <button type="submit" className="bu-btn bu-btn-primary" disabled={submitting}>
          Créer la catégorie
        </button>
      </div>
    </form>
  )
}
