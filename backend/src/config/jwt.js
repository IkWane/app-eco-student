import jwt from 'jsonwebtoken';
import { env } from './env.js';

const EXPIRES_IN = '24h';
// On fixe l'algorithme à la signature ET à la vérification : un token signé
// autrement (ou avec "alg": "none") est refusé.
const ALGORITHM = 'HS256';

// Crée un token pour un utilisateur { id, email }.
// L'id va dans "sub" (le sujet du token), sous forme de chaîne comme le veut la norme JWT.
export const signToken = (user) =>
  jwt.sign({ email: user.email }, env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: EXPIRES_IN,
    algorithm: ALGORITHM,
  });

// Vérifie la signature et l'expiration, puis renvoie { id, email }.
// Lève une erreur si le token est invalide ou expiré : le middleware d'auth la transforme en 401.
export const verifyToken = (token) => {
  const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: [ALGORITHM] });
  return { id: Number(payload.sub), email: payload.email };
};
