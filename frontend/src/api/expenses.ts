import { api } from './client.ts'
import type { Category, Expense, ExpenseInput } from './types.ts'

export const listCategories = (signal?: AbortSignal) => api<Category[]>('/categories', { signal })

export const listExpenses = (filters: { month: string; categoryId?: number }, signal?: AbortSignal) =>
  api<Expense[]>('/expenses', { query: filters, signal })

export const createExpense = (input: ExpenseInput) =>
  api<Expense>('/expenses', { method: 'POST', body: input })

export const updateExpense = (id: number, input: ExpenseInput) =>
  api<Expense>(`/expenses/${id}`, { method: 'PUT', body: input })

export const deleteExpense = (id: number) => api<void>(`/expenses/${id}`, { method: 'DELETE' })
