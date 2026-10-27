import mysql from 'mysql2/promise';
import { env } from './env.js';

// Pool de connexions partagé par tous les services : chaque requête emprunte
// une connexion puis la rend, au lieu d'en ouvrir une nouvelle à chaque fois.
// Utilisation : const [rows] = await db.query('SELECT ... WHERE id = ?', [id]);
export const db = mysql.createPool({
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  database: env.MYSQL_DATABASE,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  // Les colonnes DATE (spent_on) restent des chaînes 'YYYY-MM-DD'. Sans ça, mysql2
  // crée un objet Date en heure locale, et le 1er du mois peut devenir le 31 la veille
  // une fois converti en UTC par JSON.stringify.
  dateStrings: ['DATE'],
  // SUM(amount_cents) renvoie un DECIMAL, que mysql2 rend en chaîne par défaut ("1250").
  // On le reçoit en nombre pour les totaux des statistiques.
  decimalNumbers: true,
});
