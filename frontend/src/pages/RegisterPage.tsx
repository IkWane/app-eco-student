import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { registerSchema } from '@eco/shared'
import { ApiError } from '../api/client.ts'
import { useAuth } from '../auth/useAuth.ts'
import { Field } from '../components/Field.tsx'
import { Notice } from '../components/Notice.tsx'
import { apiErrors, zodErrors, type FieldErrors } from '../lib/form.ts'
import { useFormState } from '../lib/useFormState.ts'
import type { RegisterValues } from '../auth/auth-context.ts'

const validate = (values: RegisterValues): FieldErrors => {
  const result = registerSchema.safeParse(values)
  return result.success ? {} : zodErrors(result.error)
}

export function RegisterPage() {
  const { token, register } = useAuth()
  const navigate = useNavigate()
  const form = useFormState<RegisterValues>({ email: '', password: '' }, validate)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (token) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!form.submit()) return

    setSubmitting(true)
    try {
      await register(registerSchema.parse(form.values))
      navigate('/', { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.details.length > 0) {
        form.setServerErrors(apiErrors(error.details))
      } else if (error instanceof ApiError && error.status === 409) {
        form.setServerErrors({ email: error.message })
      } else {
        setFormError(error instanceof Error ? error.message : 'Inscription impossible.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="bu-card auth-card">
        <h1 className="title-lg">Inscription</h1>
        {formError ? <Notice tone="danger" title="Inscription impossible">{formError}</Notice> : null}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field
            id="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.values.email}
            onChange={(value) => form.setValue('email', value)}
            error={form.errors.email}
          />
          <Field
            id="password"
            label="Mot de passe"
            type="password"
            autoComplete="new-password"
            value={form.values.password}
            onChange={(value) => form.setValue('password', value)}
            hint="8 caractères minimum"
            error={form.errors.password}
          />
          <button type="submit" className="bu-btn bu-btn-primary" disabled={submitting}>
            {submitting ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>
        <p className="body-sm bu-muted">
          Déjà inscrit ? <Link to="/login">Connecte-toi</Link>
        </p>
      </section>
    </div>
  )
}
