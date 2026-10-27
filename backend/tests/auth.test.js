import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { db } from '../src/config/db.js';

// Chaque test crée son propre utilisateur avec un email unique :
// les tests ne dépendent ni de leur ordre, ni des données déjà en base.
const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@eco.fr`;
const PASSWORD = 'motdepasse123';

// Ferme le pool MySQL pour que Vitest se termine proprement.
afterAll(async () => {
  await db.end();
});

describe('Auth API', () => {
  it('POST /api/auth/register renvoie 201, un token et jamais le mot de passe', async () => {
    const email = uniqueEmail();

    const res = await request(app).post('/api/auth/register').send({ email, password: PASSWORD });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: expect.any(Number), email });
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  it('POST /api/auth/login avec un mauvais mot de passe renvoie 401', async () => {
    const email = uniqueEmail();
    await request(app).post('/api/auth/register').send({ email, password: PASSWORD }).expect(201);

    const res = await request(app).post('/api/auth/login').send({ email, password: 'mauvais-mdp' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toEqual(expect.any(String));
    expect(res.body.token).toBeUndefined();
  });

  it('GET /api/auth/me sans token renvoie 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error.message).toEqual(expect.any(String));
  });
});
