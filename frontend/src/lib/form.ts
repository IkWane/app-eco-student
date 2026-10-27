import type { z } from 'zod'
import type { ApiErrorDetail } from '../api/client.ts'

// Un message d'erreur par champ, indexé par le nom du champ.
export type FieldErrors = Record<string, string>

// Garde le premier message de chaque champ d'une erreur Zod.
export function zodErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '')
    if (key && !(key in errors)) errors[key] = issue.message
  }
  return errors
}

// Même chose pour les `details` d'un 400 renvoyé par l'API.
export function apiErrors(details: ApiErrorDetail[]): FieldErrors {
  const errors: FieldErrors = {}
  for (const { path, message } of details) {
    const key = path.split('.')[0]
    if (key && !(key in errors)) errors[key] = message
  }
  return errors
}
