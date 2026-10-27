import { Router } from 'express';
import authRoutes from './auth.routes.js';
import statsRoutes from './stats.routes.js';
import categoriesRoutes from './categories.routes.js';
import expensesRoutes from './expenses.routes.js';

// Routeur racine monté sous /api dans app.js.
// Chaque ticket y branche ses routes, par exemple : router.use('/auth', authRoutes);
const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/categories', categoriesRoutes);
router.use('/expenses', expensesRoutes);
router.use('/stats', statsRoutes);

export default router;