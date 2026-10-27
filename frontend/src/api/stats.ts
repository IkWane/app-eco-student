import { api } from './client.ts'

// GET /api/stats/monthly : un total par mois, du plus ancien au plus récent, montants en euros.
export type MonthlyTotal = { month: string; total: number }

// GET /api/stats/by-category : toutes les catégories visibles, total à 0 si aucune dépense.
export type CategoryTotal = { categoryId: number; name: string; color: string; total: number }

export const getMonthlyTotals = (months = 6, signal?: AbortSignal) =>
  api<MonthlyTotal[]>('/stats/monthly', { query: { months }, signal })

export const getCategoryTotals = (month: string, signal?: AbortSignal) =>
  api<CategoryTotal[]>('/stats/by-category', { query: { month }, signal })
