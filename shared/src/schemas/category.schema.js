import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string('Nom requis')
    .trim()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
  color: z
    .string('Couleur requise')
    .regex(/^#[0-9a-fA-F]{6}$/, 'La couleur doit être au format #rrggbb'),
});
