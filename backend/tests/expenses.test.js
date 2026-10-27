import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import app from '../src/app.js';
import { db } from '../src/config/db.js';

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@eco.fr`;
const PASSWORD = 'motdepasse123';

afterAll(async () => {
  await db.end();
});

const registerUser = async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: uniqueEmail(), password: PASSWORD })
    .expect(201);
  return { Authorization: `Bearer ${res.body.token}` };
};

const defaultCategoryId = async (auth) => {
  const res = await request(app).get('/api/categories').set(auth).expect(200);
  return res.body.find((category) => category.isDefault).id;
};

const expensePayload = (categoryId, overrides = {}) => ({
  label: 'Courses',
  amount: 12.5,
  spentOn: '2026-10-15',
  categoryId,
  ...overrides,
});

describe('Expenses API', () => {
  it('POST /api/expenses valide renvoie 201 et le montant en euros', async () => {
    const auth = await registerUser();
    const categoryId = await defaultCategoryId(auth);

    const res = await request(app)
      .post('/api/expenses')
      .set(auth)
      .send(expensePayload(categoryId));

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: expect.any(Number),
      label: 'Courses',
      amount: 12.5,
      spentOn: '2026-10-15',
      categoryId,
    });
  });

  it('POST /api/expenses avec un montant négatif renvoie 400', async () => {
    const auth = await registerUser();
    const categoryId = await defaultCategoryId(auth);

    const res = await request(app)
      .post('/api/expenses')
      .set(auth)
      .send(expensePayload(categoryId, { amount: -5 }));

    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([
      { path: 'amount', message: expect.any(String) },
    ]);
  });

  it('GET /api/expenses?month= ne renvoie que les dépenses du mois', async () => {
    const auth = await registerUser();
    const categoryId = await defaultCategoryId(auth);

    await request(app)
      .post('/api/expenses')
      .set(auth)
      .send(expensePayload(categoryId, { label: 'Octobre', spentOn: '2026-10-15' }))
      .expect(201);
    await request(app)
      .post('/api/expenses')
      .set(auth)
      .send(expensePayload(categoryId, { label: 'Septembre', spentOn: '2026-09-15' }))
      .expect(201);

    const res = await request(app).get('/api/expenses?month=2026-10').set(auth);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].label).toBe('Octobre');
  });

  it("DELETE /api/expenses/:id d'une dépense d'un autre utilisateur renvoie 404", async () => {
    const owner = await registerUser();
    const intruder = await registerUser();
    const categoryId = await defaultCategoryId(owner);

    const created = await request(app)
      .post('/api/expenses')
      .set(owner)
      .send(expensePayload(categoryId))
      .expect(201);

    const res = await request(app).delete(`/api/expenses/${created.body.id}`).set(intruder);

    expect(res.status).toBe(404);

    const list = await request(app).get('/api/expenses').set(owner).expect(200);
    expect(list.body).toHaveLength(1);
  });
});