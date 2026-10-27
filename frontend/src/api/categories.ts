import { api } from './client.ts'
import type { Category } from './types.ts'

// La liste (GET /categories) est déjà dans api/expenses.ts : listCategories.

// POST /api/categories → 201, ou 409 si le nom existe déjà.
export const createCategory = (input: { name: string; color: string }) =>
  api<Category>('/categories', { method: 'POST', body: input })

// DELETE /api/categories/:id → 204 ; 403 catégorie par défaut, 409 catégorie utilisée.
export const deleteCategory = (id: number) => api<void>(`/categories/${id}`, { method: 'DELETE' })
