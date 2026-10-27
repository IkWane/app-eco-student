import { pool } from "../config/db.js";
import { lastMonths, monthlyTotals, totalsByCategory } from "../services/stats.service.js";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const badRequest = (res, path, message) =>
  res.status(400).json({ error: { message: "Paramètres invalides", details: [{ path, message }] } });

// DATE_FORMAT évite que mysql2 renvoie un objet Date (et les décalages de fuseau)
const EXPENSE_COLUMNS =
  "amount_cents AS amountCents, DATE_FORMAT(spent_on, '%Y-%m-%d') AS spentOn, category_id AS categoryId";

// GET /api/stats/monthly?months=6
export async function getMonthly(req, res, next) {
  try {
    const months = req.query.months === undefined ? 6 : Number(req.query.months);
    if (!Number.isInteger(months) || months < 1 || months > 24) {
      return badRequest(res, ["months"], "months doit être un entier entre 1 et 24");
    }
    const today = new Date();
    const from = `${lastMonths(months, today)[0]}-01`;
    const [rows] = await pool.query(
      `SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE user_id = ? AND spent_on >= ?`,
      [req.user.id, from],
    );
    res.json(monthlyTotals(rows, months, today));
  } catch (err) {
    next(err);
  }
}

// GET /api/stats/by-category?month=YYYY-MM
export async function getByCategory(req, res, next) {
  try {
    const month = req.query.month ?? new Date().toISOString().slice(0, 7);
    if (!MONTH_RE.test(month)) {
      return badRequest(res, ["month"], "month doit être au format YYYY-MM");
    }
    const start = `${month}-01`;
    const [expenses] = await pool.query(
      `SELECT ${EXPENSE_COLUMNS} FROM expenses
       WHERE user_id = ? AND spent_on >= ? AND spent_on < DATE_ADD(?, INTERVAL 1 MONTH)`,
      [req.user.id, start, start],
    );
    const [categories] = await pool.query(
      "SELECT id, name, color FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY name",
      [req.user.id],
    );
    res.json(totalsByCategory(expenses, categories));
  } catch (err) {
    next(err);
  }
}
