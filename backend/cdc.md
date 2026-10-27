# Budget étudiant (app-eco-student) · Cahier des charges

Repo : https://github.com/IkWane/app-eco-student · mis à jour le 27/10/2026

## 1. Contexte et objectif

L'équipe livre une application web de suivi de budget étudiant, en release v1.0.0 fonctionnelle le J2 à 15 h 30.

Un étudiant crée un compte, saisit ses dépenses, les range par catégorie et visualise ses dépenses du mois et leur évolution sur un graphique mensuel.

- **Cadre** : module Gestion des versions de développement (B3, Sylvain Galtier), projet fil rouge en groupe de 5.
- **Ce qui est noté** : le projet (8 pts), la qualité (4 pts) et la contribution individuelle visible dans l'historique Git (4 pts). Ce qui n'est pas dans l'historique n'existe pas pour la note.
- **Exigé** : JavaScript ou TypeScript, README, au moins 5 tests automatisés, CI verte, release v1.0.0.

## 2. Périmètre fonctionnel

Le MVP tient en quatre blocs. Tout le reste est bonus, à attaquer seulement si la v1.0.0 est déjà prête.

| Bloc | Fonctionnalités MVP |
| --- | --- |
| Authentification | Inscription (email, mot de passe), connexion, déconnexion, routes protégées par JWT |
| Catégories | Catégories par défaut (Alimentation, Logement, Transport, Loisirs, Études) + création et suppression de catégories perso avec une couleur |
| Dépenses | Ajouter, modifier, supprimer une dépense (libellé, montant, date, catégorie). Liste filtrable par mois et par catégorie |
| Tableau de bord | Total du mois, répartition par catégorie, graphique en barres des 6 derniers mois |

**Bonus** (dans l'ordre) : plafond de budget mensuel avec alerte de dépassement, export CSV des dépenses, mode sombre.

**Hors périmètre** : revenus, multi-devises, partage entre utilisateurs, mot de passe oublié, déploiement obligatoire.

**Règles métier**

- Un utilisateur ne voit et ne modifie que ses propres dépenses et catégories.
- Les catégories par défaut sont visibles par tous et non supprimables.
- Une catégorie utilisée par au moins une dépense ne peut pas être supprimée (409).
- Montant strictement positif, 2 décimales max, stocké en centimes (entier) pour éviter les erreurs d'arrondi.
- Un mois sans dépense apparaît à 0 sur le graphique.

## 3. Stack et architecture

Monorepo npm workspaces construit autour des dossiers existants du repo, sans les déplacer : `shared` (schémas Zod), `backend` (API Express) et `frontend` (React TypeScript). Le même schéma Zod valide le formulaire côté front et la requête côté back.

| Couche | Choix |
| --- | --- |
| Runtime | Node 22, ESM (`"type": "module"`) partout |
| Back | Express 5 en JavaScript, mysql2, jsonwebtoken, bcrypt, dotenv, cors |
| Base de données | MySQL 8.4 via Docker Compose (`backend/docker-compose.yml`, déjà en place) |
| Validation | Zod, dans le paquet `@eco/shared` (JavaScript) |
| Front | React 19 + Vite + TypeScript (déjà en place), React Router, Recharts |
| Tests | Vitest partout, Supertest pour l'API |
| Lint | oxlint (déjà dans le front, étendu à tout le repo) |
| CI | GitHub Actions : lint, tests avec un service MySQL, build du front |

**Shared entre Node et React TS** : `@eco/shared` est écrit en JS. Le back l'importe directement. Le front l'importe grâce à `"allowJs": true` dans `frontend/tsconfig.app.json`, et récupère les types avec `z.infer<typeof expenseSchema>`. Testé : `tsc -b` et `vite build` passent.

```text
app-eco-student/
├── .github/
│   ├── workflows/ci.yml
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   └── dependabot.yml
├── shared/
│   ├── src/
│   │   ├── schemas/
│   │   │   ├── auth.schema.js
│   │   │   ├── category.schema.js
│   │   │   └── expense.schema.js
│   │   └── index.js
│   ├── tests/
│   └── package.json              # "name": "@eco/shared"
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js             # pool mysql2
│   │   │   ├── env.js            # lecture et contrôle des variables
│   │   │   └── jwt.js            # sign / verify
│   │   ├── routes/
│   │   │   ├── index.js          # monte toutes les routes sous /api
│   │   │   ├── auth.routes.js
│   │   │   ├── categories.routes.js
│   │   │   ├── expenses.routes.js
│   │   │   └── stats.routes.js
│   │   ├── controllers/          # lit req, appelle le service, répond
│   │   ├── services/             # logique métier + requêtes SQL
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── app.js                # crée et exporte l'app, sans listen()
│   │   └── index.js              # importe app et lance listen()
│   ├── db/init/01-schema.sql     # exécuté au premier démarrage du conteneur
│   ├── tests/
│   ├── docker-compose.yml
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                  # client fetch + appels par ressource
│   │   ├── components/
│   │   ├── context/              # AuthContext
│   │   ├── hooks/
│   │   ├── pages/                # Login, Register, Dashboard, Expenses, Categories
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tsconfig.app.json         # allowJs: true
│   ├── .env.example
│   └── package.json
├── package.json                  # workspaces: shared, backend, frontend
├── .gitignore
├── CHANGELOG.md
└── README.md
```

**Lancer le projet en local**

```bash
cp backend/.env.example backend/.env
docker compose -f backend/docker-compose.yml up -d
npm install
npm run dev
```

Les scripts de `backend/db/init/` ne s'exécutent qu'au premier démarrage, sur un volume vide. Après une modification du schéma, chacun relance la base avec `docker compose -f backend/docker-compose.yml down -v` puis `up -d`.

**Flux d'une requête côté back** : route, puis `auth.middleware` (si protégée), puis `validate.middleware` (schéma Zod), puis controller, puis service. Toute erreur remonte à `error.middleware`, qui renvoie `{ "error": { "message", "details" } }`.

## 4. Modèle de données

Trois tables MySQL. Les montants sont en centimes, les dates de dépense en `DATE`. Ce schéma remplace celui du repo (ajout de `users`, de `user_id` et de `color`) et est posé en une fois dans T5 pour éviter plusieurs `down -v`.

```sql
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
```

Le front envoie et reçoit des euros (`amount: 12.5`) et la date en `spentOn` (`YYYY-MM-DD`). La conversion en centimes et en `spent_on` se fait uniquement dans les services back.

## 5. Contrat d'API

Toutes les routes sont sous `/api`. Sauf `health`, `register` et `login`, elles exigent le header `Authorization: Bearer <token>`. Le front peut coder contre ce contrat avant que le back soit fini.

| Méthode | Route | Corps / paramètres | Réponse |
| --- | --- | --- | --- |
| GET | `/api/health` | | 200 `{ status: "ok" }` |
| POST | `/api/auth/register` | `{ email, password }` | 201 `{ token, user }`, 409 si email pris |
| POST | `/api/auth/login` | `{ email, password }` | 200 `{ token, user }`, 401 sinon |
| GET | `/api/auth/me` | | 200 `{ user }` |
| GET | `/api/categories` | | 200 défaut + perso |
| POST | `/api/categories` | `{ name, color }` | 201 |
| DELETE | `/api/categories/:id` | | 204, 403 si défaut, 409 si utilisée |
| GET | `/api/expenses` | `?month=2026-10&categoryId=3` | 200 liste triée par date décroissante |
| POST | `/api/expenses` | `{ label, amount, spentOn, categoryId }` | 201 |
| PUT | `/api/expenses/:id` | même corps | 200 |
| DELETE | `/api/expenses/:id` | | 204 |
| GET | `/api/stats/monthly` | `?months=6` | 200 `[{ month: "2026-10", total: 245.3 }]` |
| GET | `/api/stats/by-category` | `?month=2026-10` | 200 `[{ categoryId, name, color, total }]` |

Codes communs : 400 corps ou query invalide (détails Zod), 401 token absent ou invalide, 404 ressource absente ou appartenant à un autre utilisateur.

## 6. Workflow Git

GitHub Flow imposé : un ticket = une issue = une branche = une PR relue, et `main` toujours fonctionnelle. La branche `dev` existante n'est pas utilisée.

1. Prendre son ticket dans le Kanban, le passer en « En cours ».
2. Se mettre à jour : `git switch main && git pull`.
3. Créer sa branche : `git switch -c feature/12-expenses-crud` (préfixe `feature/`, `fix/`, `docs/`, `chore/`, `test/`, `ci/`, numéro de l'issue, minuscules et tirets).
4. Commiter petit et souvent, un commit = une intention, au format Conventional Commits à l'impératif : `feat(expenses): ajoute la route POST /expenses`.
5. Avant la PR : `git fetch && git rebase origin/main` sur sa propre branche, puis `git push --force-with-lease`.
6. Ouvrir la PR : titre au format commit, description quoi / pourquoi / comment tester, `Closes #12`, moins de 400 lignes.
7. Un relecteur lit tout le diff, commente, approuve ou demande des changements. CI verte obligatoire.
8. Fusion par l'auteur après approbation, puis suppression de la branche. Le ticket passe en « Terminé ».

**Protection de `main`** (Settings > Rules > Rulesets, à activer par le propriétaire du repo) : pas de push direct, 1 approbation minimum, checks CI obligatoires, force push interdit.

**Interdit** : pousser sur `main`, pousser un vrai secret (seul `.env.example` est commité), réécrire l'historique de `main`, fusionner sans relecture, approuver sans lire.

**Usage de l'IA** : Claude (ou toute autre IA) sert uniquement à écrire du code. Chaque membre fait lui-même ses `git add`, `git commit` et `git push`, avec son propre compte Git. Aucun commit, message ou trailer `Co-Authored-By` ne doit mentionner Claude : l'historique doit refléter la contribution de chacun, c'est elle qui est notée.

**Relectures croisées** pour équilibrer : P1 relit P2, P2 relit P3, P3 relit P4, P4 relit P5, P5 relit P1. Si le relecteur est bloqué, n'importe qui d'autre.

## 7. Tests, CI et qualité

On vise 13 tests pour 5 exigés, répartis sur 4 personnes, pour que la contribution de chacun soit visible.

| Paquet | Tests | Outil | Ticket |
| --- | --- | --- | --- |
| shared | Schéma dépense valide, montant négatif refusé, date invalide refusée | Vitest | T3 |
| backend auth | Register 201, login mauvais mot de passe 401, `/me` sans token 401 | Vitest + Supertest | T7 |
| backend expenses | POST valide 201, POST invalide 400, GET filtré par mois, DELETE d'une dépense d'un autre user 404 | Vitest + Supertest | T12 |
| backend stats | Total mensuel, regroupement par catégorie, mois sans dépense à 0 | Vitest | T18 |

Les tests d'API tournent sur la base MySQL Docker en local et, en CI, sur un service MySQL où `01-schema.sql` est appliqué avant `npm test`. Chaque test crée ses propres utilisateurs (email unique) pour ne pas dépendre de l'ordre d'exécution.

**CI** : `.github/workflows/ci.yml` lance trois jobs sur chaque push et PR : `lint` (oxlint), `test` (avec service MySQL) et `build` (front). Les trois sont rendus obligatoires dans la protection de `main`. Dependabot est activé pour npm et GitHub Actions.

**Journal qualité** : une issue « Journal qualité » est ouverte au Sprint 0. Chaque anomalie trouvée y est listée avec le SHA du commit fautif (trouvé via `git log -S`, `git blame` ou `git bisect`), puis corrigée par une PR `fix/...` ou un `git revert`. Jamais de `reset` ni de force push sur `main`.

**Definition of Done d'un ticket**

- [ ] Critères d'acceptation remplis
- [ ] Lint et tests verts en local et en CI
- [ ] PR relue et approuvée, issue fermée par `Closes #n`
- [ ] README ou `.env.example` mis à jour si besoin
- [ ] Commits faits à la main par l'auteur du ticket, aucune mention de Claude

## 8. Rôles et planning

Chaque personne a un domaine de code et une casquette. Le découpage par domaine limite les conflits : deux personnes touchent rarement le même fichier.

| Personne | Domaine | Casquette | Tickets |
| --- | --- | --- | --- |
| P1 (Yusuf) | Monorepo, `shared`, CI | Responsable CI | T1 à T4 |
| P2 | Socle back, schéma BDD, auth, release | Responsable release | T5 à T8 |
| P3 | Validation, catégories, dépenses (back) | Scribe du journal qualité | T9 à T12 |
| P4 | Socle front, auth front, page Dépenses, README | Référent README | T13 à T16 |
| P5 | Stats (back), tableau de bord, page Catégories | Gardien du Kanban | T17 à T20 |

| Créneau | Objectif | Tickets |
| --- | --- | --- |
| Sprint 0 · J1 après-midi · 45 min | T1 fusionné dans les 15 premières minutes, puis les 3 socles en parallèle. Première PR fusionnée avant 17 h. P5 crée les issues, la milestone v1.0.0 et le Kanban. P3 ouvre le journal qualité et vérifie la protection de `main` | T1, T2, T5, T13, début T9 et T17 |
| Sprint 1 · J2 matin · 1 h 15 | CI obligatoire, Dependabot, auth back et front, routes métier, au moins 10 issues fermées, tag v0.1.0 | T3, T4, T6, T9, T10, T11, T14, T17, début T8 |
| J2 après-midi · jusqu'à 15 h 30 | Tests, pages front, README, release v1.0.0 | T7, T12, T15, T16, T18, T19, T20, fin T8 |
| J2 · 15 h 40 | Revue finale : démo 3 min, qualité 4 min, historique 1 min, questions 2 min | |

Le chemin critique est T1, puis T5 (schéma + socle back), puis T6 (auth). P2 fusionne T6 en tout début de Sprint 1 : les routes de P3 et P5 en dépendent.
