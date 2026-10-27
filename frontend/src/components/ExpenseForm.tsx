import { useState, type FormEvent } from 'react'
import { expenseSchema } from '@eco/shared'
import { createExpense, updateExpense } from '../api/expenses.ts'
import { ApiError } from '../api/client.ts'
import type { Category, Expense } from '../api/types.ts'
import { apiErrors, zodErrors, type FieldErrors } from '../lib/form.ts'
import { parseAmount, todayIso } from '../lib/format.ts'
import { useFormState } from '../lib/useFormState.ts'
import { Field } from './Field.tsx'
import { Notice } from './Notice.tsx'
import { SelectField } from './SelectField.tsx'

const AMOUNT_MESSAGE = 'Saisis un montant supérieur à 0, avec 2 décimales maximum.'

// Valeurs du formulaire : tout est en chaîne, la conversion se fait avant la validation.
type FormValues = { amount: string; spentOn: string; categoryId: string; label: string }

const toInput = (values: FormValues) => ({
  label: values.label,
  amount: parseAmount(values.amount),
  spentOn: values.spentOn,
  categoryId: Number(values.categoryId),
})

// Même schéma Zod que l'API (@eco/shared), avec les messages du design system.
const validate = (values: FormValues): FieldErrors => {
  const result = expenseSchema.safeParse(toInput(values))
  if (result.success) return {}
  const errors = zodErrors(result.error)
  if (errors.amount) errors.amount = AMOUNT_MESSAGE
  if (errors.categoryId) errors.categoryId = 'Choisis une catégorie.'
  return errors
}

const initialValues = (expense: Expense | undefined, categories: Category[]): FormValues =>
  expense
    ? {
        amount: String(expense.amount).replace('.', ','),
        spentOn: expense.spentOn,
        categoryId: String(expense.categoryId),
        label: expense.label,
      }
    : { amount: '', spentOn: todayIso(), categoryId: String(categories[0]?.id ?? ''), label: '' }

type ExpenseFormProps = {
  categories: Category[]
  // Absent = création ; présent = modification (formulaire prérempli).
  expense?: Expense
  onSaved: () => void
  onCancel: () => void
}

export function ExpenseForm({ categories, expense, onSaved, onCancel }: ExpenseFormProps) {
  const form = useFormState<FormValues>(initialValues(expense, categories), validate)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    if (!form.submit()) return

    const input = expenseSchema.parse(toInput(form.values))
    setSubmitting(true)
    try {
      await (expense ? updateExpense(expense.id, input) : createExpense(input))
      onSaved()
    } catch (error) {
      if (error instanceof ApiError && error.details.length > 0) {
        form.setServerErrors(apiErrors(error.details))
      } else {
        setFormError(error instanceof Error ? error.message : "Impossible d'enregistrer la dépense.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="bu-card expense-form" onSubmit={handleSubmit} noValidate aria-labelledby="expense-form-title">
      <h2 className="bu-card-title" id="expense-form-title">
        {expense ? 'Modifier la dépense' : 'Nouvelle dépense'}
      </h2>
      {formError ? (
        <Notice tone="danger" title="Enregistrement impossible">
          {formError}
        </Notice>
      ) : null}
      <div className="expense-form-grid">
        <Field
          id="expense-amount"
          label="Montant"
          inputMode="decimal"
          suffix="€"
          value={form.values.amount}
          onChange={(value) => form.setValue('amount', value)}
          hint="2 décimales maximum"
          error={form.errors.amount}
        />
        <Field
          id="expense-date"
          label="Date"
          type="date"
          value={form.values.spentOn}
          onChange={(value) => form.setValue('spentOn', value)}
          error={form.errors.spentOn}
        />
        <SelectField
          id="expense-category"
          label="Catégorie"
          value={form.values.categoryId}
          placeholder="Choisis une catégorie"
          options={categories.map((category) => ({ value: String(category.id), label: category.name }))}
          onChange={(value) => form.setValue('categoryId', value)}
          error={form.errors.categoryId}
        />
        <Field
          id="expense-label"
          label="Libellé"
          maxLength={100}
          value={form.values.label}
          onChange={(value) => form.setValue('label', value)}
          error={form.errors.label}
        />
      </div>
      <div className="expense-form-actions">
        <button type="button" className="bu-btn bu-btn-secondary" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="bu-btn bu-btn-primary" disabled={submitting}>
          {expense ? 'Enregistrer' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}
