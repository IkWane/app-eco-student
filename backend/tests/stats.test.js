import { describe, expect, it } from 'vitest';
import { lastMonths, monthlyTotals, totalsByCategory } from '../src/services/stats.service.js';

// Fonctions pures : aucun accès à la base, `today` est fixé pour que les tests
// donnent le même résultat quel que soit le jour où ils tournent.
const expense = (amountCents, spentOn, categoryId = 1) => ({ amountCents, spentOn, categoryId });

const CATEGORIES = [
  { id: 1, name: 'Alimentation', color: '#e67e22' },
  { id: 2, name: 'Logement', color: '#3498db' },
  { id: 3, name: 'Transport', color: '#9b59b6' },
];

describe('monthlyTotals', () => {
  it('additionne les dépenses d’un même mois, du 1er au 31', () => {
    const expenses = [expense(1250, '2026-10-01'), expense(190, '2026-10-15'), expense(560, '2026-10-31')];

    const result = monthlyTotals(expenses, 1, new Date(2026, 9, 27));

    expect(result).toEqual([{ month: '2026-10', total: 20 }]);
  });

  it('renvoie 0 pour un mois sans dépense', () => {
    const expenses = [expense(1000, '2026-08-10'), expense(2000, '2026-10-05')];

    const result = monthlyTotals(expenses, 3, new Date(2026, 9, 27));

    expect(result).toEqual([
      { month: '2026-08', total: 10 },
      { month: '2026-09', total: 0 },
      { month: '2026-10', total: 20 },
    ]);
  });

  it('additionne en centimes pour éviter les erreurs d’arrondi (0,10 € + 0,20 €)', () => {
    const result = monthlyTotals([expense(10, '2026-10-01'), expense(20, '2026-10-02')], 1, new Date(2026, 9, 1));

    expect(result[0].total).toBe(0.3);
  });

  it('ignore les dépenses hors de la période demandée', () => {
    const expenses = [expense(5000, '2026-04-30'), expense(100, '2026-05-01')];

    const result = monthlyTotals(expenses, 6, new Date(2026, 9, 27));

    expect(result.map((m) => m.total)).toEqual([1, 0, 0, 0, 0, 0]);
  });
});

describe('lastMonths', () => {
  it('ne duplique pas de mois quand on est le 31', () => {
    expect(lastMonths(3, new Date(2026, 2, 31))).toEqual(['2026-01', '2026-02', '2026-03']);
  });

  it('passe correctement à l’année précédente', () => {
    expect(lastMonths(3, new Date(2026, 0, 15))).toEqual(['2025-11', '2025-12', '2026-01']);
  });
});

describe('totalsByCategory', () => {
  it('regroupe les dépenses par catégorie', () => {
    const expenses = [expense(1250, '2026-10-01', 1), expense(750, '2026-10-12', 1), expense(190, '2026-10-31', 3)];

    const result = totalsByCategory(expenses, CATEGORIES);

    expect(result).toEqual([
      { categoryId: 1, name: 'Alimentation', color: '#e67e22', total: 20 },
      { categoryId: 2, name: 'Logement', color: '#3498db', total: 0 },
      { categoryId: 3, name: 'Transport', color: '#9b59b6', total: 1.9 },
    ]);
  });

  it('renvoie toutes les catégories à 0 sans aucune dépense', () => {
    const result = totalsByCategory([], CATEGORIES);

    expect(result.every((c) => c.total === 0)).toBe(true);
    expect(result).toHaveLength(3);
  });
});
