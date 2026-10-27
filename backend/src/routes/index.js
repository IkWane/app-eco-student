import { Router } from 'express';
import authRoutes from './auth.routes.js';
import statsRoutes from './stats.routes.js';

// Routeur racine monté sous /api dans app.js.
// Chaque ticket y branche ses routes, par exemple : router.use('/auth', authRoutes);
const router = Router();

// Sonde de vie : permet de vérifier que l'API répond (front, CI, curl).
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/stats', statsRoutes);

export default router;
