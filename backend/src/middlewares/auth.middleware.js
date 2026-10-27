import { verifyToken } from '../config/jwt.js';
import { HttpError } from '../utils/http-error.js';

// Protège une route : lit "Authorization: Bearer <token>", vérifie le token
// et place l'utilisateur dans req.user ({ id, email }). Sinon, 401.
// Usage : router.get('/me', requireAuth, controller.me);
export const requireAuth = (req, res, next) => {
  const header = req.get('Authorization') ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Authentification requise');
  }

  try {
    req.user = verifyToken(token);
  } catch {
    // Token expiré, mal formé ou signature fausse : même réponse, sans détail.
    throw new HttpError(401, 'Token invalide ou expiré');
  }

  next();
};
