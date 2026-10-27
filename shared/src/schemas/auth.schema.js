import { z } from 'zod';

const email = z.email('Adresse email invalide').max(255, 'Adresse email trop longue');

const password = z.string('Mot de passe requis').min(8, 'Le mot de passe doit contenir au moins 8 caractères');

export const registerSchema = z.object({
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password,
});
