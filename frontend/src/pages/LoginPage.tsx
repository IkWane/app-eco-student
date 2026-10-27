import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { loginSchema } from '@eco/shared'
import { ApiError } from '../api/client.ts'
import { useAuth } from '../auth/useAuth.ts'
import { Field } from '../components/Field.tsx'
import { Notice } from '../components/Notice.tsx'
import { apiErrors, zodErrors, type FieldErrors } from '../lib/form.ts'
import { useFormState } from '../lib/useFormState.ts'
import type { LoginValues } from '../auth/auth-context.ts'

const validate = (values: LoginValues): FieldErrors => {
  const result = loginSchema.safeParse(values)
  return result.success ? {} : zodErrors(result.error)
}

export function LoginPage() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const form = useFormState<LoginValues>({ email: '', password: '' }, validate)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  if (token) {
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!form.submit()) return

    setSubmitting(true)
    try {
      await login(loginSchema.parse(form.values))
      navigate(redirectTo, { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.details.length > 0) {
        form.setServerErrors(apiErrors(error.details))
      } else {
        setFormError(error instanceof Error ? error.message : 'Connexion impossible.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="bu-card auth-card">
        <h1 className="title-lg">Connexion</h1>
        {formError ? <Notice tone="danger" title="Connexion impossible">{formError}</Notice> : null}
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
            autoComplete="current-password"
            value={form.values.password}
            onChange={(value) => form.setValue('password', value)}
            error={form.errors.password}
          />
          <button type="submit" className="bu-btn bu-btn-primary" disabled={submitting}>
            {submitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="body-sm bu-muted">
          Pas encore de compte ? <Link to="/register">Crée ton compte</Link>
        </p>
      </section>
    </div>
  )
}
