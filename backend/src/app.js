import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';

// Crée et configure l'application Express, sans la démarrer.
// Le listen() est dans src/index.js : les tests (Supertest) importent l'app directement.
const app = express();

// Autorise uniquement le front (CORS_ORIGIN) à appeler l'API depuis le navigateur.
app.use(cors({ origin: env.CORS_ORIGIN }));

// Parse les corps JSON : req.body est disponible dans les routes.
app.use(express.json());

// À venir : routeur monté sous /api (étape 6), puis middleware d'erreur en dernier (étape 5).

export default app;
