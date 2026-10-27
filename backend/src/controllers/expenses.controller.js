import {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense,
} from '../services/expenses.service.js';
import { parseId } from '../utils/parse-id.js';

export const list = async (req, res) => {
  res.json(await listExpenses(req.user.id, req.validatedQuery));
};

export const create = async (req, res) => {
  const expense = await createExpense(req.user.id, req.validatedBody);
  res.status(201).json(expense);
};

export const update = async (req, res) => {
  const expense = await updateExpense(req.user.id, parseId(req.params.id), req.validatedBody);
  res.json(expense);
};

export const remove = async (req, res) => {
  await deleteExpense(req.user.id, parseId(req.params.id));
  res.status(204).end();
};