# Budget étudiant

Application web de suivi de budget pour étudiants : on crée un compte, on saisit ses dépenses, on les range par catégorie et on visualise où part son argent chaque mois.

Projet fil rouge du module *Gestion des versions de développement* (B3, 2026-2027). Le cahier des charges complet est dans [`backend/cdc.md`](backend/cdc.md).

## Fonctionnalités (MVP)

| Bloc | Ce que ça fait |
| --- | --- |
| Authentification | Inscription, connexion, déconnexion, routes protégées par JWT |
| Catégories | 5 catégories par défaut + catégories perso avec une couleur |
| Dépenses | Ajout, modification, suppression ; liste filtrable par mois et par catégorie |
| Tableau de bord | Total du mois, répartition par catégorie, graphique des 6 derniers mois |

Les montants sont stockés en centimes (entiers) côté base et échangés en euros avec l'API.

## Stack

| Couche | Choix |
| --- | --- |
| Monorepo | npm workspaces : `shared`, `backend`, `frontend` |
| Front | React 19, Vite, TypeScript, React Router |
| Back | Express 5 (JavaScript, ESM), mysql2, jsonwebtoken, bcrypt |
| Base de données | MySQL 8.4 via Docker Compose |
| Validation | Zod, schémas partagés dans `@eco/shared` (front et back) |
| Tests et lint | Vitest, Supertest, oxlint |
| CI | GitHub Actions : lint, tests avec service MySQL, build du front |

## Prérequis

- [Node.js](https://nodejs.org/) 22 ou plus récent (npm inclus)
- [Docker](https://www.docker.com/) avec Docker Compose (pour MySQL)
- [Git](https://git-scm.com/)

## Installation

```bash
git clone git@github.com:IkWane/app-eco-student.git
cd app-eco-student

# Installe les dépendances des trois workspaces d'un coup
npm install
```

### Variables d'environnement

Chaque partie a son fichier d'exemple. Copie-les, puis adapte les valeurs si besoin (ne commite jamais un vrai `.env`).

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

| Fichier | Variable | Rôle |
| --- | --- | --- |
| `backend/.env` | `PORT` | Port de l'API (3000 par défaut) |
| | `JWT_SECRET` | Secret de signature des tokens, 32 caractères minimum |
| | `CORS_ORIGIN` | URL du front autorisée par CORS (`http://localhost:5173`) |
| | `MYSQL_*` | Hôte, port, base, utilisateur et mots de passe MySQL (lus aussi par Docker Compose) |
| `frontend/.env.local` | `VITE_API_URL` | URL de l'API (`http://localhost:3000/api`) |

### Base de données

```bash
docker compose -f backend/docker-compose.yml up -d
```

Les scripts de `backend/db/init/` ne s'exécutent qu'au **premier** démarrage, sur un volume vide. Après une modification du schéma, recrée la base :

```bash
docker compose -f backend/docker-compose.yml down -v
docker compose -f backend/docker-compose.yml up -d
```

### Lancer l'application

```bash
npm run dev
```

Le backend (`http://localhost:3000`) et le frontend (`http://localhost:5173`) démarrent en parallèle. Vérifie l'API avec `http://localhost:3000/api/health`.

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Lance backend et frontend en parallèle |
| `npm run lint` | oxlint sur tout le dépôt |
| `npm test` | Tests de tous les workspaces (Vitest ; l'API a besoin de la base MySQL) |
| `npm run build -w frontend` | Vérifie les types (`tsc -b`) et construit le front dans `frontend/dist` |
| `npm run dev -w backend` | Backend seul, avec rechargement (`node --watch`) |
| `npm run dev -w frontend` | Frontend seul (Vite) |

## Arborescence

```text
app-eco-student/
├── .github/                  # CI, Dependabot, modèles de PR et d'issue
├── shared/                   # @eco/shared : schémas Zod (JavaScript)
│   ├── src/schemas/          # auth, category, expense
│   └── tests/
├── backend/                  # API Express
│   ├── src/
│   │   ├── config/           # env, db (pool mysql2), jwt
│   │   ├── routes/           # routeur monté sous /api
│   │   ├── controllers/      # lit la requête, appelle le service, répond
│   │   ├── services/         # logique métier et requêtes SQL
│   │   ├── middlewares/      # auth, validation Zod, erreurs
│   │   ├── app.js            # crée et exporte l'app, sans listen()
│   │   └── index.js          # lance listen()
│   ├── db/init/01-schema.sql # schéma appliqué au premier démarrage de MySQL
│   ├── docker-compose.yml
│   └── .env.example
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/              # client fetch et appels par ressource
│   │   ├── auth/             # AuthContext, ProtectedRoute
│   │   ├── components/       # composants du design system
│   │   ├── lib/              # formats, validation de formulaires
│   │   ├── pages/            # Login, Register, Dashboard, Expenses, Categories
│   │   └── styles/           # tokens et composants CSS
│   └── .env.example
├── package.json              # workspaces : shared, backend, frontend
└── README.md
```

Le même schéma Zod valide le formulaire côté front et la requête côté back : le front l'importe grâce à `"allowJs": true` dans `frontend/tsconfig.app.json` et en tire les types avec `z.infer<typeof expenseSchema>`.

## Contrat d'API

Toutes les routes sont sous `/api`. Sauf `health`, `register` et `login`, elles exigent `Authorization: Bearer <token>`.

| Méthode | Route | Corps / paramètres | Réponse |
| --- | --- | --- | --- |
| GET | `/api/health` | | 200 `{ status: "ok" }` |
| POST | `/api/auth/register` | `{ email, password }` | 201 `{ token, user }`, 409 si l'email est pris |
| POST | `/api/auth/login` | `{ email, password }` | 200 `{ token, user }`, 401 sinon |
| GET | `/api/auth/me` | | 200 `{ user }` |
| GET | `/api/categories` | | 200, catégories par défaut et perso |
| POST | `/api/categories` | `{ name, color }` | 201 |
| DELETE | `/api/categories/:id` | | 204, 403 si par défaut, 409 si utilisée |
| GET | `/api/expenses` | `?month=2026-10&categoryId=3` | 200, triées par date décroissante |
| POST | `/api/expenses` | `{ label, amount, spentOn, categoryId }` | 201 |
| PUT | `/api/expenses/:id` | même corps | 200 |
| DELETE | `/api/expenses/:id` | | 204 |
| GET | `/api/stats/monthly` | `?months=6` | 200 `[{ month, total }]` |
| GET | `/api/stats/by-category` | `?month=2026-10` | 200 `[{ categoryId, name, color, total }]` |

- Montants en **euros** dans l'API (`amount: 12.5`), dates au format `YYYY-MM-DD` (`spentOn`).
- Erreurs : `{ "error": { "message", "details" } }` ; `400` pour un corps ou une query invalide (`details` : liste de `{ path, message }`), `401` sans token valide, `404` pour une ressource absente ou appartenant à un autre utilisateur.

## Workflow Git

GitHub Flow : un ticket = une branche = une Pull Request relue, et `main` reste toujours fonctionnelle.

1. Prendre son ticket dans le Kanban et le passer en « En cours ».
2. `git switch main && git pull`, puis `git switch -c feature/12-expenses-crud`. Préfixes : `feature/`, `fix/`, `docs/`, `chore/`, `test/`, `ci/` ; numéro de l'issue ; minuscules et tirets.
3. Commiter petit et souvent, un commit = une intention, au format [Conventional Commits](https://www.conventionalcommits.org/fr/) à l'impératif : `feat(expenses): ajoute la route POST /expenses`.
4. Avant la PR : `git fetch && git rebase origin/main` sur sa propre branche, puis `git push --force-with-lease`.
5. Ouvrir la PR avec le modèle du dépôt : titre au format commit, quoi / pourquoi / comment tester, `Closes #12`, moins de 400 lignes.
6. Un relecteur lit tout le diff et approuve ou demande des changements ; la CI doit être verte.
7. Fusion par l'auteur après approbation, puis suppression de la branche.

Interdit : pousser sur `main`, pousser un vrai secret (seul `.env.example` est commité), réécrire l'historique de `main`, fusionner sans relecture. Pour annuler un changement déjà fusionné, on utilise `git revert` dans une PR.

## Équipe

| Rôle | Membre | Périmètre |
| --- | --- | --- |
| P1 | [@YusufByn](https://github.com/YusufByn) | Monorepo, schémas partagés, CI |
| P2 | [@IkWane](https://github.com/IkWane) | Schéma MySQL, socle backend, authentification, release |
| P3 | [@Tom0204](https://github.com/Tom0204) | Validation, catégories, dépenses (API) |
| P4 | [@aymanmechal](https://github.com/aymanmechal) | Frontend : socle, authentification, page Dépenses, README |
| P5 | [@Nilus-001](https://github.com/Nilus-001) | Statistiques, tableau de bord, page Catégories |
