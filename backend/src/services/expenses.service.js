import { db } from '../config/db.js';
import { HttpError } from '../utils/http-error.js';

const SELECT_EXPENSE = 'SELECT id, label, amount_cents, spent_on, category_id FROM expenses';

const toCents = (euros) => Math.round(euros * 100);

const toExpense = (row) => ({
  id: row.id,
  label: row.label,
  amount: row.amount_cents / 100,
  spentOn: row.spent_on,
  categoryId: row.category_id,
});

const monthBounds = (month) => {
  const [year, m] = month.split('-').map(Number);
  const start = `${month}-01`;
  const end = m === 12 ? `${year + 1}-01-01` : `${year}-${String(m + 1).padStart(2, '0')}-01`;
  return { start, end };
};

const assertCategoryAccessible = async (userId, categoryId) => {
  const [rows] = await db.query(
    'SELECT id FROM categories WHERE id = ? AND (user_id IS NULL OR user_id = ?)',
    [categoryId, userId],
  );
  if (rows.length === 0) {
    throw new HttpError(400, 'Catégorie invalide', [
      { path: 'categoryId', message: 'Cette catégorie n’existe pas ou n’est pas accessible' },
    ]);
  }
};

const findOwnedExpense = async (userId, id) => {
  const [rows] = await db.query(`${SELECT_EXPENSE} WHERE id = ? AND user_id = ?`, [id, userId]);
  if (rows.length === 0) {
    throw new HttpError(404, 'Dépense introuvable');
  }
  return toExpense(rows[0]);
};

export const listExpenses = async (userId, { month, categoryId } = {}) => {
  const conditions = ['user_id = ?'];
  const params = [userId];

  if (month) {
    const { start, end } = monthBounds(month);
    conditions.push('spent_on >= ? AND spent_on < ?');
    params.push(start, end);
  }
  if (categoryId !== undefined) {
    conditions.push('category_id = ?');
    params.push(categoryId);
  }

  const [rows] = await db.query(
    `${SELECT_EXPENSE} WHERE ${conditions.join(' AND ')} ORDER BY spent_on DESC, id DESC`,
    params,
  );
  return rows.map(toExpense);
};

export const createExpense = async (userId, { label, amount, spentOn, categoryId }) => {
  await assertCategoryAccessible(userId, categoryId);

  const [result] = await db.query(
    'INSERT INTO expenses (user_id, label, amount_cents, spent_on, category_id) VALUES (?, ?, ?, ?, ?)',
    [userId, label, toCents(amount), spentOn, categoryId],
  );
  return findOwnedExpense(userId, result.insertId);
};

export const updateExpense = async (userId, id, { label, amount, spentOn, categoryId }) => {
  await findOwnedExpense(userId, id);
  await assertCategoryAccessible(userId, categoryId);

  await db.query(
    `UPDATE expenses
     SET label = ?, amount_cents = ?, spent_on = ?, category_id = ?
     WHERE id = ? AND user_id = ?`,
    [label, toCents(amount), spentOn, categoryId, id, userId],
  );
  return findOwnedExpense(userId, id);
};

export const deleteExpense = async (userId, id) => {
  await findOwnedExpense(userId, id);
  await db.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
};