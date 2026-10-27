-- Exécuté automatiquement au PREMIER démarrage (volume vide).
-- Après une modification : docker compose -f backend/docker-compose.yml down -v puis up -d.
-- Montants en centimes (INT), dates de dépense en DATE.

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(50) NOT NULL,
  color   CHAR(7) NOT NULL DEFAULT '#888888',
  user_id INT UNSIGNED NULL,          -- NULL = catégorie par défaut
  UNIQUE KEY uq_category_user (name, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  label        VARCHAR(100) NOT NULL,
  amount_cents INT NOT NULL CHECK (amount_cents > 0),
  spent_on     DATE NOT NULL,
  category_id  INT UNSIGNED NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO categories (name, color) VALUES
  ('Alimentation', '#e67e22'), ('Logement', '#3498db'), ('Transport', '#9b59b6'),
  ('Loisirs', '#2ecc71'), ('Études', '#f1c40f');
