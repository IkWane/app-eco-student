import express from 'express';
import cors from 'cors';

// Crée et configure l'application Express, sans la démarrer.
// Le listen() est dans src/index.js : les tests (Supertest) importent l'app directement.
const app = express();

// Autorise le front à appeler l'API (l'origine sera restreinte via env.CORS_ORIGIN à l'étape 3).
app.use(cors());

// Parse les corps JSON : req.body est disponible dans les routes.
app.use(express.json());

// À venir : routeur monté sous /api (étape 6), puis middleware d'erreur en dernier (étape 5).

export default app;
