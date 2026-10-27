import { db } from '../config/db.js';
import { lastMonths, monthlyTotals, totalsByCategory } from '../services/stats.service.js';
import { HttpError } from '../utils/http-error.js';

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// Même format de 400 que validate() (T9) : details = [{ path, message }].
const invalid = (path, message) => new HttpError(400, 'Données invalides', [{ path, message }]);

// spent_on arrive déjà en chaîne 'YYYY-MM-DD' grâce à dateStrings dans config/db.js.
const EXPENSE_COLUMNS = 'amount_cents AS amountCents, spent_on AS spentOn, category_id AS categoryId';

// GET /api/stats/monthly?months=6 → [{ month: 'YYYY-MM', total }] du plus ancien au plus récent
export const getMonthly = async (req, res) => {
  const months = req.query.months === undefined ? 6 : Number(req.query.months);
  if (!Number.isInteger(months) || months < 1 || months > 24) {
    throw invalid('months', 'months doit être un entier entre 1 et 24');
  }

  const today = new Date();
  const from = `${lastMonths(months, today)[0]}-01`;
  const [expenses] = await db.query(
    `SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE user_id = ? AND spent_on >= ?`,
    [req.user.id, from],
  );

  res.json(monthlyTotals(expenses, months, today));
};

// GET /api/stats/by-category?month=YYYY-MM → [{ categoryId, name, color, total }]
export const getByCategory = async (req, res) => {
  const month = req.query.month ?? lastMonths(1, new Date())[0];
  if (!MONTH_RE.test(month)) {
    throw invalid('month', 'month doit être au format YYYY-MM');
  }

  const start = `${month}-01`;
  const [expenses] = await db.query(
    `SELECT ${EXPENSE_COLUMNS} FROM expenses
     WHERE user_id = ? AND spent_on >= ? AND spent_on < DATE_ADD(?, INTERVAL 1 MONTH)`,
    [req.user.id, start, start],
  );
  const [categories] = await db.query(
    'SELECT id, name, color FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY name',
    [req.user.id],
  );

  res.json(totalsByCategory(expenses, categories));
};
