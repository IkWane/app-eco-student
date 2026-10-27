import {
  createCategory,
  deleteCategory,
  listCategories,
} from '../services/categories.service.js';
import { parseId } from '../utils/parse-id.js';

export const list = async (req, res) => {
  res.json(await listCategories(req.user.id));
};

export const create = async (req, res) => {
  const category = await createCategory(req.user.id, req.validatedBody);
  res.status(201).json(category);
};

export const remove = async (req, res) => {
  await deleteCategory(req.user.id, parseId(req.params.id));
  res.status(204).end();
};