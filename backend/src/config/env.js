import 'dotenv/config';

// Lit une variable obligatoire : l'API refuse de démarrer si elle manque,
// plutôt que de planter plus tard sur une requête.
const required = (name) => {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Variable d'environnement manquante : ${name} (voir backend/.env.example)`);
  }
  return value;
};

// Lit un port (avec une valeur par défaut) et vérifie que c'est un entier valide.
const port = (name, fallback) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`Variable d'environnement invalide : ${name} doit être un port (1-65535)`);
  }
  return value;
};

const JWT_SECRET = required('JWT_SECRET');
if (JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET doit contenir au moins 32 caractères');
}

export const env = Object.freeze({
  PORT: port('PORT', 3000),
  JWT_SECRET,
  CORS_ORIGIN: required('CORS_ORIGIN'),
  MYSQL_HOST: process.env.MYSQL_HOST ?? 'localhost',
  MYSQL_PORT: port('MYSQL_PORT', 3306),
  MYSQL_DATABASE: required('MYSQL_DATABASE'),
  MYSQL_USER: required('MYSQL_USER'),
  MYSQL_PASSWORD: required('MYSQL_PASSWORD'),
});
