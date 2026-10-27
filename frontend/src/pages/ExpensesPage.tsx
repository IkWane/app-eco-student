import { useCallback, useEffect, useState } from 'react'
import { deleteExpense, listCategories, listExpenses } from '../api/expenses.ts'
import type { Category, Expense } from '../api/types.ts'
import { CategoryFilter } from '../components/CategoryFilter.tsx'
import { ConfirmDialog } from '../components/ConfirmDialog.tsx'
import { EmptyState } from '../components/EmptyState.tsx'
import { ExpenseForm } from '../components/ExpenseForm.tsx'
import { ExpenseList } from '../components/ExpenseList.tsx'
import { Icon } from '../components/Icon.tsx'
import { MonthPicker } from '../components/MonthPicker.tsx'
import { Notice } from '../components/Notice.tsx'
import { currentMonth, formatDay, formatEuro, formatMonth } from '../lib/format.ts'

// Formulaire fermé, ouvert en création, ou ouvert sur une dépense à modifier.
type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; expense: Expense }

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

export function ExpensesPage() {
  const [month, setMonth] = useState(currentMonth)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  // Clé de la dernière requête terminée : tant qu'elle diffère de la demande courante, on charge.
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [form, setForm] = useState<FormState>({ mode: 'closed' })
  const [toDelete, setToDelete] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const requestKey = `${month}|${categoryId ?? 'all'}|${reloadKey}`
  const loading = loadedKey !== requestKey

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  // Les catégories ne changent pas selon le mois : un seul chargement.
  useEffect(() => {
    const controller = new AbortController()
    listCategories(controller.signal)
      .then(setCategories)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(errorMessage(error, 'Impossible de charger les catégories.'))
      })
    return () => controller.abort()
  }, [])

  // Les dépenses suivent le mois, le filtre et chaque modification (reloadKey).
  useEffect(() => {
    const controller = new AbortController()
    listExpenses({ month, categoryId: categoryId ?? undefined }, controller.signal)
      .then((list) => {
        setExpenses(list)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(errorMessage(error, 'Impossible de charger les dépenses.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedKey(requestKey)
      })
    return () => controller.abort()
  }, [month, categoryId, requestKey])

  const total = expenses.reduce((sum, expense) => sum + Math.round(expense.amount * 100), 0) / 100

  const handleSaved = () => {
    setForm({ mode: 'closed' })
    reload()
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteExpense(toDelete.id)
      setToDelete(null)
      reload()
    } catch (error) {
      setDeleteError(errorMessage(error, 'Impossible de supprimer la dépense.'))
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <header className="page-head">
        <h1 className="title-lg">Mes dépenses</h1>
        <MonthPicker month={month} onChange={setMonth} />
        <button type="button" className="bu-btn bu-btn-primary" onClick={() => setForm({ mode: 'create' })}>
          <Icon name="plus" size={18} />
          Ajouter
        </button>
      </header>

      {loadError ? (
        <Notice tone="danger" title="Données indisponibles">
          {loadError}
        </Notice>
      ) : null}
      {deleteError ? (
        <Notice tone="danger" title="Suppression impossible">
          {deleteError}
        </Notice>
      ) : null}

      {form.mode !== 'closed' ? (
        <ExpenseForm
          key={form.mode === 'edit' ? form.expense.id : 'create'}
          categories={categories}
          expense={form.mode === 'edit' ? form.expense : undefined}
          onSaved={handleSaved}
          onCancel={() => setForm({ mode: 'closed' })}
        />
      ) : null}

      <CategoryFilter categories={categories} selectedId={categoryId} onSelect={setCategoryId} />

      <p className="expenses-total">
        <span className="bu-muted">Total · {formatMonth(month)}</span>
        <strong className="amount">{formatEuro(total)}</strong>
      </p>

      {loading ? (
        <p className="bu-muted expenses-loading" role="status">
          Chargement des dépenses…
        </p>
      ) : (
        <ExpenseList
          title="Dépenses"
          expenses={expenses}
          categories={categories}
          onEdit={(expense) => setForm({ mode: 'edit', expense })}
          onDelete={setToDelete}
          empty={
            <EmptyState
              title="Aucune dépense ce mois-ci"
              action={
                <button type="button" className="bu-btn bu-btn-primary" onClick={() => setForm({ mode: 'create' })}>
                  Ajoute ta première dépense
                </button>
              }
            >
              Ajoute une dépense pour suivre où part ton argent.
            </EmptyState>
          }
        />
      )}

      {toDelete ? (
        <ConfirmDialog
          title="Supprimer cette dépense ?"
          confirmLabel="Supprimer"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          « {toDelete.label} » · {formatEuro(toDelete.amount)} · {formatDay(toDelete.spentOn)}. Elle disparaîtra de la
          liste et des totaux.
        </ConfirmDialog>
      ) : null}
    </>
  )
}
