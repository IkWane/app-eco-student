# Changelog

Toutes les évolutions notables du projet Budget étudiant (app-eco-student) sont listées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versions selon [SemVer](https://semver.org/lang/fr/).
Chaque entrée renvoie à la Pull Request qui l'a introduite dans `main`, de la plus récente à la plus ancienne.

[#2]: https://github.com/IkWane/app-eco-student/pull/2
[#3]: https://github.com/IkWane/app-eco-student/pull/3
[#4]: https://github.com/IkWane/app-eco-student/pull/4
[#5]: https://github.com/IkWane/app-eco-student/pull/5
[#9]: https://github.com/IkWane/app-eco-student/pull/9
[#10]: https://github.com/IkWane/app-eco-student/pull/10
[#11]: https://github.com/IkWane/app-eco-student/pull/11
[#16]: https://github.com/IkWane/app-eco-student/pull/16
[#19]: https://github.com/IkWane/app-eco-student/pull/19
[#20]: https://github.com/IkWane/app-eco-student/pull/20
[#21]: https://github.com/IkWane/app-eco-student/pull/21
[#22]: https://github.com/IkWane/app-eco-student/pull/22
[#23]: https://github.com/IkWane/app-eco-student/pull/23
[#24]: https://github.com/IkWane/app-eco-student/pull/24
[#26]: https://github.com/IkWane/app-eco-student/pull/26
[#27]: https://github.com/IkWane/app-eco-student/pull/27
[#28]: https://github.com/IkWane/app-eco-student/pull/28
[#29]: https://github.com/IkWane/app-eco-student/pull/29
[#34]: https://github.com/IkWane/app-eco-student/pull/34
[#35]: https://github.com/IkWane/app-eco-student/pull/35
[#36]: https://github.com/IkWane/app-eco-student/pull/36
[#37]: https://github.com/IkWane/app-eco-student/pull/37

## [Unreleased]

### [#37] · feat(frontend-categories): page Catégories (T20)

#### Added
- Client API des catégories (`api/categories.ts`).
- Formulaire de création d'une catégorie (nom, couleur) validé avec `categorySchema`.
- Page Catégories : liste avec pastille de couleur, catégories par défaut marquées, suppression des catégories perso avec message clair en cas de 409.

#### Fixed
- Type `Category` du front aligné sur la réponse de l'API (`isDefault` au lieu de `userId`).

### [#36] · feat(frontend-dashboard): tableau de bord et graphique (T19)

#### Added
- Dépendance `recharts` dans le front.
- Client API des statistiques (`api/stats.ts`).
- Graphique en barres des 6 derniers mois (`MonthlyChart`) et répartition par catégorie (`CategorySplit`).
- Tableau de bord : carte « Total du mois », graphique, répartition et état vide.

### [#35] · test(stats): couvre les calculs de statistiques (T18)

#### Added
- Tests Vitest de `monthlyTotals`, `lastMonths` et `totalsByCategory` : somme d'un même mois du 1er au 31, mois sans dépense à 0, addition en centimes (0,10 € + 0,20 €), passage le 31 et à l'année précédente, regroupement par catégorie.

### [#34] · revert: annule un push direct sur `main`

#### Fixed
- Annulation par `git revert` du commit `3f07afc`, poussé directement sur `main` sans PR. Le même contenu est réintroduit proprement par [#35].

### [#29] · feat(stats): service et routes de statistiques (T17)

#### Added
- Service de statistiques en fonctions pures : `lastMonths`, `monthlyTotals`, `totalsByCategory`.
- Routes protégées `GET /api/stats/monthly?months=6` et `GET /api/stats/by-category?month=YYYY-MM`, montants en euros.

### [#28] · test(expenses): couvre les routes dépenses (T12)

#### Added
- Tests Supertest des routes dépenses : création valide (201), montant négatif (400), filtre par mois, suppression de la dépense d'un autre utilisateur (404).

### [#26] · fix(docs): commande d'installation du README

#### Fixed
- `npm install --omit=dev` remplacé par `npm install` : les outils de dev (Vite, Vitest, oxlint) n'étaient pas installés.

### [#23] · feat(frontend): authentification et page Dépenses (T14, T15)

#### Added
- `AuthProvider` et `useAuth` : utilisateur, token gardé en localStorage, `login`, `register`, `logout`.
- `ProtectedRoute` : redirection vers `/login` sans token.
- Pages Connexion et Inscription validées avec les schémas de `@eco/shared`, erreurs sous les champs.
- Bouton de déconnexion dans la barre de navigation.
- Page Dépenses : sélecteur de mois, filtre par catégorie, liste, formulaire d'ajout et de modification, confirmation de suppression, état vide et état de chargement.
- Helpers de formatage (montants, dates) et client API des dépenses.

### [#27] · feat(expenses): CRUD des dépenses avec filtres (T11)

#### Added
- Routes protégées `GET`, `POST`, `PUT /:id` et `DELETE /:id` sur `/api/expenses`, validées avec `expenseSchema` et `expenseQuerySchema`.
- Filtres `?month=YYYY-MM&categoryId=n`, tri par date décroissante.
- Conversion euros vers centimes et `spentOn` vers `spent_on` dans le service.
- Accès limité aux dépenses de l'utilisateur connecté (404 sinon).

### [#24] · feat(categories): CRUD des catégories (T10)

#### Added
- Routes protégées `GET`, `POST` et `DELETE /:id` sur `/api/categories`.
- Catégories par défaut et catégories perso, 403 sur une catégorie par défaut, 409 si elle est utilisée.
- Utilitaire `parseId` pour valider les identifiants d'URL.

### [#19] · test(auth): couvre register, login et /me (T7)

#### Added
- Vitest et Supertest dans le backend, script `npm test`.
- Tests : inscription (201, token, aucun mot de passe dans la réponse), connexion avec un mauvais mot de passe (401), `GET /api/auth/me` sans token (401).

#### Fixed
- `JWT_SECRET`, `CORS_ORIGIN` et `PORT` ajoutés au job `test` de la CI : l'API refusait de démarrer faute de variables ([#22]).

### [#21] · fix(backend): nom du middleware de validation (T9)

#### Fixed
- Fichier renommé de `validate.moddleware.js` en `validate.middleware.js`.

### [#20] · docs: README complet (T16)

#### Added
- Présentation, prérequis, installation, lancement de la base, variables d'environnement et scripts.
- Arborescence du monorepo, contrat d'API, workflow Git et membres de l'équipe.

### [#16] · feat(frontend): socle React TS (T13)

#### Added
- React Router avec les routes `/login`, `/register`, `/`, `/expenses`, `/categories`.
- Layout avec barre de navigation, thème clair et sombre, tokens et composants du design system.
- Client API (`api/client.ts`) basé sur `VITE_API_URL`, avec ajout du token et remontée des erreurs `{ error }`.
- `frontend/.env.example`.

#### Changed
- Template Vite retiré (hero, logos, CSS de démonstration).

### [#11] · feat(auth): inscription et connexion JWT (T6)

#### Added
- Dépendances `bcrypt` et `jsonwebtoken`.
- `config/jwt.js` : `signToken` et `verifyToken`, expiration 24 h, algorithme HS256 imposé.
- Service d'authentification : hash bcrypt, création d'utilisateur (409 si l'email existe), vérification des identifiants (401).
- Middleware `requireAuth` : lit `Authorization: Bearer`, place `req.user` ou renvoie 401.
- Routes `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.

### [#10] · feat(backend): middleware de validation Zod (T9)

#### Added
- Middleware `validate(schema, source)` : sortie parsée dans `req.validatedBody` ou `req.validatedQuery`, 400 avec `details` sinon.

### [#9] · feat(backend): socle Express et schéma MySQL final (T5)

#### Added
- Dépendances `express`, `cors`, `mysql2` et `dotenv`.
- `src/config/env.js` : lecture et contrôle des variables d'environnement au démarrage.
- `src/config/db.js` : pool `mysql2/promise` (dates en chaînes `YYYY-MM-DD`, sommes en nombres).
- Middleware d'erreur JSON `{ error: { message, details } }`, 404 JSON pour les routes inconnues, classe `HttpError`.
- Route `GET /api/health`, point d'entrée `src/index.js` et scripts `dev` et `start`.

#### Changed
- `backend/app.js` déplacé en `src/app.js`, sans `listen()`, pour pouvoir être testé.
- Schéma MySQL remplacé par le schéma final : table `users`, colonnes `user_id` et `color`. Relancer la base avec `down -v`.
- `.env.example` complété avec `PORT`, `JWT_SECRET`, `CORS_ORIGIN` et `MYSQL_HOST`.

#### Fixed
- Paquet `epxress` (faute de frappe, paquet vidé par npm) remplacé par `express`.

### [#5] · ci: GitHub Actions et Dependabot (T4)

#### Added
- Workflow CI : jobs `lint`, `test` (avec un service MySQL 8.4) et `build` sur chaque push et PR.
- Dependabot pour npm et GitHub Actions.
- Modèles de Pull Request et d'issue.

### [#4] · test(shared): couvre les schémas Zod (T3)

#### Added
- Vitest dans `shared` et tests de `expenseSchema` (dépense valide, date inexistante `2026-13-01`, montant à 3 décimales) et de `loginSchema` (identifiants valides, email invalide, mot de passe de 7 caractères).

### [#3] · feat(shared): schémas Zod partagés (T2)

#### Added
- Schémas `registerSchema`, `loginSchema`, `categorySchema`, `expenseSchema` et `expenseQuerySchema`.
- `@eco/shared` en dépendance du backend et du frontend, `allowJs` dans le front.
- Cahier des charges et tickets.

### [#2] · chore: monorepo npm workspaces (T1)

#### Added
- `package.json` racine avec les workspaces `shared`, `backend`, `frontend` et les scripts `dev`, `lint` et `test`.
- Paquet `@eco/shared` minimal.

#### Changed
- oxlint centralisé à la racine, un seul `package-lock.json` à la racine.
- `.gitignore` racine complété.
