import { loginSchema, registerSchema } from '@eco/shared';
import { signToken } from '../config/jwt.js';
import { createUser, findUserById, verifyCredentials } from '../services/auth.service.js';
import { HttpError } from '../utils/http-error.js';

// Validation temporaire en attendant le middleware validate() de T9 (P3).
// Même format de 400 que T9 : details = [{ path, message }].
const parseBody = (schema, body) => {
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw new HttpError(400, 'Données invalides', details);
  }
  return result.data;
};

// POST /api/auth/register → 201 { token, user } ou 409
export const register = async (req, res) => {
  const data = parseBody(registerSchema, req.body);
  const user = await createUser(data);
  res.status(201).json({ token: signToken(user), user });
};

// POST /api/auth/login → 200 { token, user } ou 401
export const login = async (req, res) => {
  const data = parseBody(loginSchema, req.body);
  const user = await verifyCredentials(data);
  res.json({ token: signToken(user), user });
};

// GET /api/auth/me → 200 { user }. req.user vient de requireAuth.
// On relit la base : si le compte a été supprimé, le token ne vaut plus rien.
export const me = async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) {
    throw new HttpError(401, 'Utilisateur introuvable');
  }
  res.json({ user });
};
