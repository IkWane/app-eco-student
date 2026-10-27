import { describe, it, expect } from 'vitest';
import { loginSchema } from '../src/index.js';

const validLogin = {
  email: 'etudiant@example.com',
  password: 'motdepasse',
};

// Renvoie les chemins des champs en erreur, ex. ['email'].
const errorPaths = (result) => result.error.issues.map((issue) => issue.path.join('.'));

describe('loginSchema', () => {
  it('accepte des identifiants valides', () => {
    const result = loginSchema.safeParse(validLogin);

    expect(result.success).toBe(true);
  });

  it('refuse un email invalide', () => {
    const result = loginSchema.safeParse({ ...validLogin, email: 'pas-un-email' });

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toEqual(['email']);
  });

  it('refuse un mot de passe de 7 caractères', () => {
    const result = loginSchema.safeParse({ ...validLogin, password: '1234567' });

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toEqual(['password']);
  });
});
