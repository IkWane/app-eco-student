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
npm install --omit=dev
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
