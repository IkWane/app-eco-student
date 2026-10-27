import { Router } from 'express';
import { categorySchema } from '@eco/shared';
import { create, list, remove } from '../controllers/categories.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.post('/', validate(categorySchema), create);
router.delete('/:id', remove);

export default router;