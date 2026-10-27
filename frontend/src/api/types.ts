import type { z } from 'zod'
import type { expenseSchema } from '@eco/shared'

// Corps d'une création / modification de dépense, typé depuis le schéma partagé.
export type ExpenseInput = z.infer<typeof expenseSchema>

// Dépense renvoyée par l'API : montant en euros, date au format YYYY-MM-DD.
export type Expense = ExpenseInput & { id: number }

export type Category = {
  id: number
  name: string
  color: string
  // true = catégorie par défaut, commune à tous et non supprimable.
  isDefault: boolean
}
