import { useState } from 'react'
import type { FieldErrors } from './form.ts'

// État d'un formulaire : on valide à la soumission, puis à chaque frappe une fois l'erreur affichée.
export function useFormState<V extends object>(initial: V, validate: (values: V) => FieldErrors) {
  const [values, setValues] = useState<V>(initial)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [showErrors, setShowErrors] = useState(false)

  const setValue = <K extends keyof V>(name: K, value: V[K]) => {
    const next = { ...values, [name]: value }
    setValues(next)
    if (showErrors) setErrors(validate(next))
  }

  // Renvoie true si le formulaire est valide ; sinon affiche les erreurs.
  const submit = (): boolean => {
    const found = validate(values)
    setErrors(found)
    setShowErrors(true)
    return Object.keys(found).length === 0
  }

  const setServerErrors = (found: FieldErrors) => {
    setErrors(found)
    setShowErrors(true)
  }

  return { values, errors, setValue, submit, setServerErrors }
}
