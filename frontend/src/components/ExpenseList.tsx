import type { ReactNode } from 'react'
import type { Category, Expense } from '../api/types.ts'
import { ExpenseRow } from './ExpenseRow.tsx'
import { Icon } from './Icon.tsx'

type ExpenseListProps = {
  title: string
  expenses: Expense[]
  categories: Category[]
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
  // Affiché à la place de la liste quand elle est vide.
  empty: ReactNode
}

// Bac creusé des dépenses, triées par date décroissante (tri fait par l'API), sans regroupement.
export function ExpenseList({ title, expenses, categories, onEdit, onDelete, empty }: ExpenseListProps) {
  const categoriesById = new Map(categories.map((category) => [category.id, category]))

  return (
    <section className="bu-list" aria-label={title}>
      <header className="bu-list-head">
        <h2 className="bu-list-title">
          <span className="bu-list-badge">
            <Icon name="receipt" size={18} />
          </span>
          {title}
          <span className="bu-list-count" aria-label={`${expenses.length} dépenses`}>
            {expenses.length}
          </span>
        </h2>
        <span className="bu-list-hint">les plus récentes d&apos;abord</span>
      </header>
      {expenses.length === 0 ? (
        empty
      ) : (
        <ul className="bu-list-items">
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              category={categoriesById.get(expense.categoryId)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
