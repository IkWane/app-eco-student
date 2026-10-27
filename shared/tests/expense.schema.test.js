import { describe, it, expect } from 'vitest';
import { expenseSchema } from '../src/index.js';

const validExpense = {
  label: 'Courses',
  amount: 12.5,
  spentOn: '2026-10-27',
  categoryId: 3,
};

// Renvoie les chemins des champs en erreur, ex. ['amount'].
const errorPaths = (result) => result.error.issues.map((issue) => issue.path.join('.'));

describe('expenseSchema', () => {
  it('accepte une dépense valide', () => {
    const result = expenseSchema.safeParse(validExpense);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validExpense);
  });

  it.each([-5, 0])('refuse un montant négatif ou nul (%s)', (amount) => {
    const result = expenseSchema.safeParse({ ...validExpense, amount });

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toEqual(['amount']);
  });

  it('refuse une date qui n’existe pas (2026-13-01)', () => {
    const result = expenseSchema.safeParse({ ...validExpense, spentOn: '2026-13-01' });

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toEqual(['spentOn']);
  });

  it('refuse un montant avec 3 décimales', () => {
    const result = expenseSchema.safeParse({ ...validExpense, amount: 12.345 });

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toEqual(['amount']);
  });
});
