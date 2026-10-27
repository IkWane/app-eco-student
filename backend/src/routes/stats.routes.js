import { Router } from 'express';
import { getByCategory, getMonthly } from '../controllers/stats.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

// Monté sous /api/stats dans routes/index.js. Toutes les routes exigent un token.
const router = Router();

router.use(requireAuth);
router.get('/monthly', getMonthly);
router.get('/by-category', getByCategory);

export default router;
