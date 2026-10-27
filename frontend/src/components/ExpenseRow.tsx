import type { Category, Expense } from '../api/types.ts'
import { formatDay, formatEuro } from '../lib/format.ts'
import { Icon, type IconName } from './Icon.tsx'

// Icône de chaque catégorie par défaut ; une catégorie perso affiche son initiale.
const CATEGORY_ICONS: Record<string, IconName> = {
  Logement: 'home',
  Alimentation: 'cart',
  Transport: 'bus',
  Études: 'book',
  Loisirs: 'ticket',
  Santé: 'heart',
  Autre: 'tag',
}

type ExpenseRowProps = {
  expense: Expense
  category?: Category
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

// Tuile plate : toucher la tuile modifie, la poubelle ouvre la confirmation.
export function ExpenseRow({ expense, category, onEdit, onDelete }: ExpenseRowProps) {
  const categoryName = category?.name ?? 'Sans catégorie'
  const iconName = CATEGORY_ICONS[categoryName]
  const amount = formatEuro(expense.amount)

  return (
    <li className="bu-row is-editable" style={{ '--chip': category?.color ?? 'var(--cat-autre)' } as React.CSSProperties}>
      <button
        type="button"
        className="bu-row-hit"
        aria-label={`Modifier « ${expense.label} », ${amount}`}
        onClick={() => onEdit(expense)}
      >
        <span className="bu-row-icon" aria-hidden="true">
          {iconName ? <Icon name={iconName} /> : categoryName.charAt(0).toUpperCase()}
        </span>
        <span className="bu-row-main">
          <span className="bu-row-label">{expense.label}</span>
          <span className="bu-row-meta">
            {categoryName} · {formatDay(expense.spentOn)}
          </span>
        </span>
        <span className="bu-row-amount">{amount}</span>
      </button>
      <button
        type="button"
        className="bu-btn bu-btn-ghost bu-btn-sm bu-btn-icon bu-row-del"
        aria-label={`Supprimer « ${expense.label} »`}
        onClick={() => onDelete(expense)}
      >
        <Icon name="trash" size={18} />
      </button>
    </li>
  )
}
