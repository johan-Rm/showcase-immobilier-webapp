# MLK My Little Kasbah

Webapp immobiliere moderne pour Essaouira et sa region, construite avec Nuxt 4, SSR par defaut, multi-langue, avec une exigence forte sur la lisibilite editoriale, le SEO, les performances et la credibilite produit.

## Overview

Le projet suit une gouvernance documentaire et de delivery `IA Spec Driven`.

Priorites produit :

- clarte pour l utilisateur final
- lisibilite du contenu
- performance et sobriete
- maintenabilite du code
- parcours oriente exploration puis contact

Socle technique principal :

- Nuxt 4, Vue 3 et TypeScript strict
- Nuxt UI, Nuxt Content, Nuxt i18n, Pinia
- rendu SSR avec pipeline de generation de schemas au build

Portes d entree documentaires :

- `docs/` : gouvernance documentaire et conventions transverses du projet
- `docs/2.architecture/` : source de verite de l architecture applicative
- `dev-book/tasks/` : taches d implementation actives rattachees aux changements en cours
- `app/**/README.md` et `server/README.md` : conventions locales au plus pres du code

## Setup

Prerequis minimaux :

- Bun
- Node.js compatible avec le projet Nuxt
- un dossier de schemas YAML accessible via `SCHEMAS_PATH`

Initialisation locale :

```bash
bun install
cp .env.example .env
```

Variables d environnement importantes :

- `SCHEMAS_PATH` : obligatoire, chemin des schemas YAML utilises au build
- `BLUEPRINTS_PATH` : chemin des blueprints de structure et de documentation
- `DIGITAL_ORCHESTRATION_CORE_PATH` : chemin d integration local si utilise
- `APP_ENV` : `dev` ou `prod` (pilotage global de l indexabilite SEO hors mode dev: `dev` = noindex, `prod` autorise l indexation de la home uniquement)
- `ENABLE_MONITORING`, `SENTRY_DSN_PUBLIC`, `SENTRY_DSN` : monitoring Sentry
- `WEB_VITALS_ENABLED` : active la collecte client des Core Web Vitals
- `NUXT_SESSION_PASSWORD`, `NUXT_OAUTH_GOOGLE_CLIENT_ID`,
  `NUXT_OAUTH_GOOGLE_CLIENT_SECRET`, `NUXT_OAUTH_GOOGLE_REDIRECT_URL`,
  `AUTHORIZED_CLIENT_EMAILS` : configuration de l authentification Google pour
  le dashboard limite aux emails autorises
- `SYMFONY_API_URL` : URL de base de l API Symfony
- `SYMFONY_API_DOCS_URL` : endpoint OpenAPI Symfony consomme par Scalar
- `DASHBOARD_SAVE_DEBUG` : active les logs serveur du payload de sauvegarde dashboard
  vers Symfony quand la valeur vaut `1` (debug local uniquement)
- `SCALAR_API_DOCS_ENABLED` : force l interface Scalar hors serveur dev local si necessaire

Pour le detail complet des variables, voir [`.env.example`](./.env.example).

## Quality Gates

Commandes de reference :

```bash
bun run lint:check
bun run format:check
bun run test
bun run test:dashboard
bun run type-check
bun run quality:check
```

`bun run test:dashboard` cible les tests Vitest dashboard purs (`*.vitest.ts`) sans
lancer les anciennes suites Bun ni de tests composants Nuxt.

Corrections automatiques disponibles :

```bash
bun run lint:fix
bun run format:fix
bun run quality:fix
```

## Development

Demarrage local simple :

```bash
bun run dev
```

Documentation API locale :

- `http://localhost:3000/api-docs` : interface Scalar
- `http://localhost:3000/api/openapi` : proxy Nitro du document OpenAPI
- source Symfony par defaut : `http://localhost:18080/api/docs`

La route Scalar est `noindex` et rendue cote client uniquement, car l interface de
documentation API n est pas une page SEO du site public. Elle est chargee par defaut
uniquement sur le serveur dev local afin de ne pas alourdir le build SSR public.

Autres commandes utiles :

```bash
bun run build
bun run preview
bun run generate
```

Profil Docker SSR :

```bash
WEB_VITALS_ENABLED=false make dev-webapp-ssr BUILD=1
./scripts/lighthouse-mobile.sh http://mlk-my-little-kasbah-nuxt-ssr.localhost:8080/fr ./lighthouse.mobile.json
```

Cette variante force un rebuild du SSR Docker avec `WEB_VITALS_ENABLED=false` pour mesurer le SSR sans emission des metriques client, via le vhost Nginx local expose sur `http://mlk-my-little-kasbah-nuxt-ssr.localhost:8080`.

En runtime SSR `production`, Nitro applique aussi un cache `SWR` de `300s` sur :

- `/api/content/**`
- `/themes.json`
- `/themes.css`

Le HTML SSR n est pas cache via Nitro a ce stade, afin de limiter les effets de bord sur le rendu, la locale et le debug local.

Mise en prod via `make` :

```bash
make prod-build
make prod-up
make prod-deploy
make prod-logs
make prod-down
```

Ces cibles reutilisent le compose SSR existant en forcant `APP_ENV=prod`, avec un nom de projet Docker dedie (`mlk-webapp-prod`) et des identifiants reseau/alias distincts de la preprod.

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Conventions techniques

> Ces conventions s appliquent a l ensemble de la base de code : `app/`, `server/`, `services/`, `shared/`.
> Elles sont verifiees automatiquement via des scripts CI/CD declares en YAML dans `scripts/ci/app/`.
> Pour le detail du modele, voir [docs/3.application/ci-conventions-validation.md](./docs/3.application/ci-conventions-validation.md).

### Code commente

Le code commente est du code mort. Il doit etre supprime ou converti en commentaire
explicatif si le contexte le justifie.

Les lignes commencant par `// const`, `// function`, `// return`, `// if`, `// for`,
`// let`, `// type`, `// interface` signalent du code commente a traiter.

Règle YAML : `app-no-commented-code`

### Ternaires imbriques

Un ternaire imbrique (`condition ? a ? b : c : d`) est presque toujours un `if/else`
deguise. Utiliser une variable intermediaire nommee ou un bloc conditionnel explicite.

Règle YAML : `app-no-nested-ternary`

### Niveaux d imbrication

La logique dans les fichiers `.ts` et les blocs `<script>` des fichiers `.vue` ne doit
pas depasser 3 niveaux d imbrication consecutifs.

Un niveau d imbrication profond signale une complexite excessive : extraire une fonction,
appliquer early return ou inverser la condition.

Règle YAML : `app-deep-nesting`

### Types et interfaces larges

Une interface ou un type avec plus de 8 champs signale un possible probleme
d Interface Segregation (ISP).

Verifier si le type peut etre decoupe en types plus petits et plus cohesifs.

Règle YAML : `app-large-type`

### Dettes techniques

Les commentaires `TODO`, `FIXME`, `HACK` et `XXX` sont toleres temporairement mais doivent
rester tracables. Chaque occurrence doit etre assumee ou soldee activement.

Règle YAML : `app-todo-fixme`

## Docker Production

- Les metas de page sont declarees avec `useSeoMeta`.
- Le head global est centralise dans `app/app.vue`.
- Les metas de page et le JSON-LD sont geres par les composables SEO du projet.
- `robots.txt` est servi par une route serveur locale.
- `SITE_URL` et `SITE_NAME` alimentent les URLs absolues et les metas sociales.
- En environnement indexable, seule la page d accueil est exposee en `index, follow`; les autres routes restent en `noindex, nofollow`.
- En mode `bun run dev`, l indexation reste forcee a `noindex` meme si `APP_ENV=prod`.
