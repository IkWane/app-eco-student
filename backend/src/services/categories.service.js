import { db } from '../config/db.js';
import { HttpError } from '../utils/http-error.js';

const toCategory = (row) => ({
  id: row.id,
  name: row.name,
  color: row.color,
  isDefault: row.user_id === null,
});

export const listCategories = async (userId) => {
  const [rows] = await db.query(
    `SELECT id, name, color, user_id
     FROM categories
     WHERE user_id IS NULL OR user_id = ?
     ORDER BY user_id IS NOT NULL, name`,
    [userId],
  );
  return rows.map(toCategory);
};

export const createCategory = async (userId, { name, color }) => {
  const [existing] = await db.query(
    'SELECT id FROM categories WHERE name = ? AND (user_id IS NULL OR user_id = ?) LIMIT 1',
    [name, userId],
  );
  if (existing.length > 0) {
    throw new HttpError(409, 'Une catégorie portant ce nom existe déjà');
  }

  try {
    const [result] = await db.query(
      'INSERT INTO categories (name, color, user_id) VALUES (?, ?, ?)',
      [name, color, userId],
    );
    return { id: result.insertId, name, color, isDefault: false };
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'Une catégorie portant ce nom existe déjà');
    }
    throw err;
  }
};

export const deleteCategory = async (userId, id) => {
  const [rows] = await db.query('SELECT id, user_id FROM categories WHERE id = ?', [id]);
  const category = rows[0];

  if (!category) {
    throw new HttpError(404, 'Catégorie introuvable');
  }
  if (category.user_id === null) {
    throw new HttpError(403, 'Une catégorie par défaut ne peut pas être supprimée');
  }
  if (category.user_id !== userId) {
    throw new HttpError(404, 'Catégorie introuvable');
  }

  const [used] = await db.query('SELECT 1 FROM expenses WHERE category_id = ? LIMIT 1', [id]);
  if (used.length > 0) {
    throw new HttpError(409, 'Cette catégorie est utilisée par des dépenses');
  }

  try {
    await db.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new HttpError(409, 'Cette catégorie est utilisée par des dépenses');
    }
    throw err;
  }
};