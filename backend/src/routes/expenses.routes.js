import { Router } from 'express';
import { expenseQuerySchema, expenseSchema } from '@eco/shared';
import { create, list, remove, update } from '../controllers/expenses.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', validate(expenseQuerySchema, 'query'), list);
router.post('/', validate(expenseSchema), create);
router.put('/:id', validate(expenseSchema), update);
router.delete('/:id', remove);

export default router;