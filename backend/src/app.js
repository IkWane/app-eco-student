import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import routes from './routes/index.js';

// Crée et configure l'application Express, sans la démarrer.
// Le listen() est dans src/index.js : les tests (Supertest) importent l'app directement.
const app = express();

// Autorise uniquement le front (CORS_ORIGIN) à appeler l'API depuis le navigateur.
app.use(cors({ origin: env.CORS_ORIGIN }));

// Parse les corps JSON : req.body est disponible dans les routes.
app.use(express.json());

// Toutes les routes de l'API sont sous /api.
app.use('/api', routes);

// Toujours en dernier : 404 pour les routes inconnues, puis gestion centralisée des erreurs.
app.use(notFound);
app.use(errorHandler);

export default app;
