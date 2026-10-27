-- Exécuté automatiquement au PREMIER démarrage (volume vide).
CREATE TABLE IF NOT EXISTS categories (
  id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS expenses (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  label        VARCHAR(100) NOT NULL,
  amount_cents INT NOT NULL CHECK (amount_cents > 0),
  spent_on     DATE NOT NULL,
  category_id  INT UNSIGNED NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO categories (name) VALUES
  ('Alimentation'), ('Logement'), ('Transport'), ('Loisirs'), ('Études');
