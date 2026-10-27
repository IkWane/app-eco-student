// Fonctions pures : elles reçoivent des dépenses déjà chargées, sans accès à la base.
// expense : { amountCents, spentOn: "YYYY-MM-DD", categoryId }

const toEuros = (cents) => cents / 100;

/**
 * Clés "YYYY-MM" des N derniers mois (mois de `today` inclus), du plus ancien au plus récent.
 * On part toujours du 1er du mois pour éviter le piège du 31 (31 oct - 1 mois ≠ 1er oct).
 */
export function lastMonths(months, today) {
  const keys = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getFullYear(), today.getMonth() - i, 1));
    keys.push(d.toISOString().slice(0, 7));
  }
  return keys;
}

/** Totaux des N derniers mois, mois vides à 0, montants en euros. */
export function monthlyTotals(expenses, months, today) {
  const totals = new Map(lastMonths(months, today).map((key) => [key, 0]));
  for (const { amountCents, spentOn } of expenses) {
    const key = spentOn.slice(0, 7);
    if (totals.has(key)) totals.set(key, totals.get(key) + amountCents);
  }
  return [...totals].map(([month, cents]) => ({ month, total: toEuros(cents) }));
}

/** Totaux par catégorie (toutes les catégories, 0 si aucune dépense), montants en euros. */
export function totalsByCategory(expenses, categories) {
  const sums = new Map();
  for (const { amountCents, categoryId } of expenses) {
    sums.set(categoryId, (sums.get(categoryId) ?? 0) + amountCents);
  }
  return categories.map((c) => ({
    categoryId: c.id,
    name: c.name,
    color: c.color,
    total: toEuros(sums.get(c.id) ?? 0),
  }));
}
