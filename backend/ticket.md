# Budget étudiant (app-eco-student) · Tickets

20 tickets, 4 par personne. Les numéros T1 à T20 sont indicatifs : remplacez-les par les numéros d'issue GitHub à la création (l'issue #1 « test » existe déjà). Chaque ticket est prêt à coller dans une issue.

| # | Titre | Assigné | Dépend de | Créneau |
| --- | --- | --- | --- | --- |
| T1 | chore: passe le repo en monorepo npm workspaces | P1 | | Sprint 0 |
| T2 | feat(shared): ajoute les schémas Zod partagés | P1 | T1 | Sprint 0 |
| T3 | test(shared): couvre les schémas Zod | P1 | T2 | Sprint 1 |
| T4 | ci: ajoute le workflow GitHub Actions et Dependabot | P1 | T1, T5 | Sprint 1 |
| T5 | feat(backend): pose le socle Express et le schéma MySQL final | P2 | T1 | Sprint 0 |
| T6 | feat(auth): ajoute l'inscription et la connexion JWT | P2 | T2, T5 | Sprint 1 |
| T7 | test(auth): couvre register, login et /me | P2 | T6 | J2 après-midi |
| T8 | chore(release): CHANGELOG, v0.1.0 puis v1.0.0 | P2 | tous | Sprint 1 et 15 h 30 |
| T9 | feat(backend): ajoute le middleware de validation Zod | P3 | T2, T5 | Sprint 0 / 1 |
| T10 | feat(categories): ajoute le CRUD des catégories | P3 | T6, T9 | Sprint 1 |
| T11 | feat(expenses): ajoute le CRUD des dépenses avec filtres | P3 | T6, T9 | Sprint 1 |
| T12 | test(expenses): couvre les routes dépenses | P3 | T11 | J2 après-midi |
| T13 | feat(frontend): structure le socle React TS | P4 | T1 | Sprint 0 |
| T14 | feat(frontend-auth): ajoute connexion, inscription et routes protégées | P4 | T2, T13 | Sprint 1 |
| T15 | feat(frontend-expenses): ajoute la page Dépenses | P4 | T14 | J2 après-midi |
| T16 | docs: rédige le README complet | P4 | T1 | J2 après-midi |
| T17 | feat(stats): ajoute le service et les routes de statistiques | P5 | T5, T6 | Sprint 0 / 1 |
| T18 | test(stats): couvre les calculs de statistiques | P5 | T17 | J2 après-midi |
| T19 | feat(frontend-dashboard): ajoute le tableau de bord et le graphique | P5 | T13, T17 | J2 après-midi |
| T20 | feat(frontend-categories): ajoute la page Catégories | P5 | T10, T13 | J2 après-midi |

## P1 (Yusuf) · monorepo, shared, CI

### T1 · chore: passe le repo en monorepo npm workspaces
Label `chore` · branche `chore/1-monorepo-workspaces`

Brancher les dossiers existants dans un monorepo sans les déplacer. À fusionner dans les 15 premières minutes, tout le monde en dépend.

- `package.json` racine (private) avec `workspaces: ["shared", "backend", "frontend"]` et les scripts `dev` (backend + frontend en parallèle), `lint` (oxlint sur tout le repo), `test` (tous les workspaces)
- Package du front renommé `frontend`, script `test` cassé du backend retiré
- Un seul `package-lock.json`, à la racine
- `shared/` minimal : `package.json` (`@eco/shared`, ESM, `exports: ./src/index.js`, dépendance `zod`) et `src/index.js`
- `.gitignore` racine complété (node_modules, dist, coverage, *.log, .DS_Store)
- `npm install` puis `npm run lint` passent à la racine

### T2 · feat(shared): ajoute les schémas Zod partagés
Label `feature` · branche `feature/2-shared-schemas`

- `registerSchema`, `loginSchema` : email valide, mot de passe 8 caractères min
- `categorySchema` : nom 1 à 50 caractères, couleur hexadécimale `#rrggbb`
- `expenseSchema` : libellé 1 à 100 caractères, montant positif à 2 décimales max, `spentOn` au format `YYYY-MM-DD` et date réelle, `categoryId` entier positif
- `expenseQuerySchema` : `month` (`YYYY-MM`) et `categoryId` optionnels, convertis depuis les strings de query
- Tout est exporté depuis `shared/src/index.js`
- `@eco/shared` en dépendance de `backend` et `frontend`, `zod` aussi dans le front, `"allowJs": true` dans `frontend/tsconfig.app.json`
- `z.infer<typeof expenseSchema>` fonctionne côté front, `tsc -b` passe

### T3 · test(shared): couvre les schémas Zod
Label `test` · branche `test/3-shared-schemas`

- Vitest installé dans `shared`, `npm test` à la racine le lance
- Test 1 : une dépense valide passe
- Test 2 : un montant négatif ou nul est refusé
- Test 3 : une date invalide (`2026-13-01`) est refusée
- Test 4 : `loginSchema` refuse un email invalide

### T4 · ci: ajoute le workflow GitHub Actions et Dependabot
Label `ci` · branche `ci/4-github-actions`

- `.github/workflows/ci.yml` sur `push` et `pull_request`, Node 22 avec cache npm, `npm ci`
- Job `lint` : `npm run lint`
- Job `test` : service `mysql:8.4` avec healthcheck, variables reprises de `backend/.env.example`, `01-schema.sql` appliqué, puis `npm test`
- Job `build` : `npm run build -w frontend`
- `.github/dependabot.yml` (npm à la racine + github-actions, hebdomadaire)
- `pull_request_template.md` (quoi, pourquoi, comment tester, Closes #) et un template d'issue avec critères d'acceptation
- Les jobs `lint`, `test`, `build` ajoutés comme checks obligatoires dans le ruleset de `main`

## P2 · socle backend, schéma, auth, release

### T5 · feat(backend): pose le socle Express et le schéma MySQL final
Label `feature` · branche `feature/5-backend-socle`

- `backend/app.js` déplacé en `src/app.js` : crée et exporte l'app (json, cors, routes, error middleware) sans `listen()`
- `src/index.js` importe l'app et lance `listen()` sur `PORT`, script `dev` avec `node --watch`
- `config/env.js` lit et contrôle `PORT`, `JWT_SECRET`, `CORS_ORIGIN` et les variables MySQL. `.env.example` complété
- `config/db.js` : pool `mysql2/promise`
- `db/init/01-schema.sql` remplacé par le schéma final du CDC (users, user_id, color). Prévenir l'équipe de faire `down -v`
- `middlewares/error.middleware.js` renvoie `{ error: { message, details } }`
- `GET /api/health` renvoie 200 `{ status: "ok" }`

### T6 · feat(auth): ajoute l'inscription et la connexion JWT
Label `feature` · branche `feature/6-auth`

Priorité absolue au Sprint 1, les routes métier en dépendent.

- `config/jwt.js` : `signToken(user)` et `verifyToken(token)`, expiration 24 h
- `auth.service.js` : hash bcrypt, création d'utilisateur, vérification du mot de passe
- Routes `POST /register` (201 ou 409), `POST /login` (200 ou 401), `GET /me`, validées avec les schémas de `@eco/shared`
- `auth.middleware.js` lit `Authorization: Bearer`, place `req.user` ou renvoie 401
- Le mot de passe n'apparaît jamais dans une réponse

### T7 · test(auth): couvre register, login et /me
Label `test` · branche `test/7-auth`

- Vitest + Supertest sur `app` importé depuis `src/app.js`, base MySQL Docker
- Test 1 : register renvoie 201 et un token
- Test 2 : login avec un mauvais mot de passe renvoie 401
- Test 3 : `GET /api/auth/me` sans token renvoie 401

### T8 · chore(release): CHANGELOG, v0.1.0 puis v1.0.0
Label `chore` · branche `chore/8-release`

- `CHANGELOG.md` tenu à jour en sections Added, Changed, Fixed
- Fin du Sprint 1 : tag annoté `v0.1.0` et release GitHub
- J2 15 h 30 : `gh release create v1.0.0 --generate-notes`, toutes les issues de la milestone fermées, CI verte sur `main`

## P3 · validation, catégories, dépenses

### T9 · feat(backend): ajoute le middleware de validation Zod
Label `feature` · branche `feature/9-validate-middleware`

- `validate(schema, source)` avec `source` = `body` ou `query`
- Données valides : remplace `req[source]` par la sortie parsée et appelle `next()`
- Données invalides : 400 avec `details` = liste `{ path, message }` issue de Zod
- Utilisable sur n'importe quelle route : `router.post('/', validate(expenseSchema), controller.create)`

### T10 · feat(categories): ajoute le CRUD des catégories
Label `feature` · branche `feature/10-categories`

- `categories.routes.js`, `categories.controller.js`, `categories.service.js`, toutes protégées par `auth.middleware`
- `GET` renvoie les catégories par défaut + celles de l'utilisateur
- `POST` valide avec `categorySchema`, renvoie 201
- `DELETE` renvoie 204, 403 pour une catégorie par défaut, 409 si elle est utilisée, 404 si elle appartient à un autre utilisateur

### T11 · feat(expenses): ajoute le CRUD des dépenses avec filtres
Label `feature` · branche `feature/11-expenses`

- Routes `GET`, `POST`, `PUT /:id`, `DELETE /:id`, protégées et validées (`expenseSchema`, `expenseQuerySchema`)
- Conversion euros vers centimes et `spentOn` vers `spent_on` dans le service, l'inverse dans les réponses
- `GET ?month=2026-10&categoryId=3` filtre, tri par date décroissante
- Un utilisateur ne peut lire, modifier ou supprimer que ses dépenses (404 sinon)
- La catégorie envoyée doit exister et être accessible à l'utilisateur (400 sinon)

### T12 · test(expenses): couvre les routes dépenses
Label `test` · branche `test/12-expenses`

- Test 1 : `POST` valide renvoie 201 et le montant en euros
- Test 2 : `POST` avec montant négatif renvoie 400
- Test 3 : `GET ?month=` ne renvoie que les dépenses du mois
- Test 4 : `DELETE` d'une dépense d'un autre utilisateur renvoie 404

## P4 · frontend socle, auth, Dépenses, README

### T13 · feat(frontend): structure le socle React TS
Label `feature` · branche `feature/13-frontend-socle`

- Template Vite nettoyé (hero, logos, CSS de démo retirés)
- React Router avec les routes `/login`, `/register`, `/`, `/expenses`, `/categories` (pages vides)
- Layout avec barre de navigation
- `api/client.ts` : wrapper `fetch` qui utilise `VITE_API_URL`, ajoute le token et remonte les erreurs `{ error }`
- `frontend/.env.example` avec `VITE_API_URL=http://localhost:3000/api`
- `npm run build -w frontend` et `npm run lint` passent

### T14 · feat(frontend-auth): ajoute connexion, inscription et routes protégées
Label `feature` · branche `feature/14-frontend-auth`

- `AuthContext` : `user`, `token`, `login`, `register`, `logout`, token gardé en localStorage
- Pages Login et Register validées avec les schémas de `@eco/shared`, erreurs affichées sous les champs
- `ProtectedRoute` redirige vers `/login` sans token
- Bouton de déconnexion dans la navbar

### T15 · feat(frontend-expenses): ajoute la page Dépenses
Label `feature` · branche `feature/15-frontend-expenses`

- Liste des dépenses du mois courant avec sélecteur de mois et filtre par catégorie
- Formulaire d'ajout et d'édition validé avec `expenseSchema`, typé avec `z.infer`
- Suppression avec confirmation
- État vide (« Aucune dépense ce mois-ci ») et état de chargement

### T16 · docs: rédige le README complet
Label `docs` · branche `docs/16-readme`

- Présentation du projet et captures éventuelles
- Prérequis (Node 22, Docker), installation, lancement de la base, variables d'environnement, scripts (`dev`, `test`, `lint`)
- Arborescence du monorepo et contrat d'API résumé
- Workflow Git de l'équipe (branches, Conventional Commits, PR) et membres avec leur casquette

## P5 · stats, tableau de bord, Catégories

### T17 · feat(stats): ajoute le service et les routes de statistiques
Label `feature` · branche `feature/17-stats`

Le service est écrit en fonctions pures (elles reçoivent une liste de dépenses), donc démarrable au Sprint 0 sans attendre l'auth.

- `monthlyTotals(expenses, months, today)` renvoie les N derniers mois, mois vides à 0
- `totalsByCategory(expenses, categories)` renvoie `{ categoryId, name, color, total }`
- Routes protégées `GET /api/stats/monthly?months=6` et `GET /api/stats/by-category?month=YYYY-MM`
- Montants renvoyés en euros

### T18 · test(stats): couvre les calculs de statistiques
Label `test` · branche `test/18-stats`

- Test 1 : `monthlyTotals` additionne correctement les dépenses d'un même mois
- Test 2 : un mois sans dépense vaut 0
- Test 3 : `totalsByCategory` regroupe par catégorie

### T19 · feat(frontend-dashboard): ajoute le tableau de bord et le graphique
Label `feature` · branche `feature/19-dashboard`

- Carte « Total du mois »
- Répartition par catégorie (liste ou donut Recharts, couleurs des catégories)
- Graphique en barres Recharts des 6 derniers mois
- État vide pour un nouvel utilisateur

### T20 · feat(frontend-categories): ajoute la page Catégories
Label `feature` · branche `feature/20-frontend-categories`

- Liste des catégories avec leur pastille de couleur, catégories par défaut marquées
- Formulaire de création (nom, couleur) validé avec `categorySchema`
- Suppression des catégories perso, message clair si l'API renvoie 409
