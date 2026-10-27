import bcrypt from 'bcrypt';
import { db } from '../config/db.js';
import { HttpError } from '../utils/http-error.js';

// Coût du hachage : 10 = environ 50 à 100 ms par hash, bon compromis sécurité / rapidité.
const SALT_ROUNDS = 10;

// Hash de secours pour un email inconnu : on fait quand même un bcrypt.compare,
// pour que la réponse prenne le même temps et ne révèle pas si l'email existe.
const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', SALT_ROUNDS);

// Un même email, quelle que soit la casse ou les espaces autour.
const normalizeEmail = (email) => email.trim().toLowerCase();

// Ce qui sort du service : jamais le password_hash.
const toPublicUser = (row) => ({ id: row.id, email: row.email });

// Crée un utilisateur. Renvoie { id, email }, ou lève 409 si l'email est déjà pris.
export const createUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [normalizedEmail, passwordHash],
    );
    return { id: result.insertId, email: normalizedEmail };
  } catch (err) {
    // La contrainte UNIQUE sur email fait le contrôle : pas de SELECT préalable,
    // donc pas de course entre deux inscriptions simultanées.
    if (err.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'Cet email est déjà utilisé');
    }
    throw err;
  }
};

// Vérifie email + mot de passe. Renvoie { id, email }, ou lève 401.
// Même message dans les deux cas d'échec, pour ne pas dire lequel des deux est faux.
export const verifyCredentials = async ({ email, password }) => {
  const [rows] = await db.query(
    'SELECT id, email, password_hash FROM users WHERE email = ?',
    [normalizeEmail(email)],
  );
  const user = rows[0];
  const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !passwordOk) {
    throw new HttpError(401, 'Email ou mot de passe incorrect');
  }
  return toPublicUser(user);
};

// Retrouve un utilisateur par son id (pour GET /me). Renvoie null s'il n'existe plus.
export const findUserById = async (id) => {
  const [rows] = await db.query('SELECT id, email FROM users WHERE id = ?', [id]);
  return rows[0] ? toPublicUser(rows[0]) : null;
};
