import { Router } from 'express';

// Routeur racine monté sous /api dans app.js.
// Chaque ticket y branche ses routes, par exemple : router.use('/auth', authRoutes);
const router = Router();

// Sonde de vie : permet de vérifier que l'API répond (front, CI, curl).
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;
