import { z } from 'zod';

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Vérifie qu'une chaîne YYYY-MM-DD correspond à une date du calendrier (rejette 2026-02-30, 2026-13-01...).
const isRealDate = (value) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

// Au plus 2 décimales, avec une tolérance pour les erreurs de virgule flottante (ex. 1.1 * 100).
const hasAtMostTwoDecimals = (value) => {
  const cents = value * 100;
  return Math.abs(cents - Math.round(cents)) < 1e-6;
};

// Les query strings arrivent en chaîne : une valeur vide équivaut à « pas de filtre ».
const emptyToUndefined = (value) => (value === '' ? undefined : value);

export const expenseSchema = z.object({
  label: z
    .string('Libellé requis')
    .trim()
    .min(1, 'Le libellé est requis')
    .max(100, 'Le libellé ne doit pas dépasser 100 caractères'),
  amount: z
    .number('Le montant doit être un nombre')
    .positive('Le montant doit être strictement positif')
    .max(1_000_000, 'Le montant ne doit pas dépasser 1 000 000 €')
    .refine(hasAtMostTwoDecimals, 'Le montant doit avoir au plus 2 décimales'),
  spentOn: z
    .string('Date requise')
    .regex(DATE_REGEX, { error: 'La date doit être au format YYYY-MM-DD', abort: true })
    .refine(isRealDate, "Cette date n'existe pas"),
  categoryId: z
    .number('Catégorie requise')
    .int('Catégorie invalide')
    .positive('Catégorie invalide'),
});

export const expenseQuerySchema = z.object({
  month: z.preprocess(
    emptyToUndefined,
    z.string().regex(MONTH_REGEX, 'Le mois doit être au format YYYY-MM').optional(),
  ),
  categoryId: z.preprocess(
    emptyToUndefined,
    z.coerce.number('Catégorie invalide').int('Catégorie invalide').positive('Catégorie invalide').optional(),
  ),
});
