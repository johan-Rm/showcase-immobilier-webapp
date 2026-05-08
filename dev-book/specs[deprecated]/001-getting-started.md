# 🎯 Spec : Getting Started Nuxt 4 (Bun)

## 🔖 Métadonnées

- **ID** : SPEC-001
- **Statut** : Terminé (socle Nuxt 4 + blueprints copiés)
- **Décisions structurantes** : Aucune à ce stade. Formaliser une note dédiée si un choix d’outil ou d’architecture évolue.
- **Objectif principal** : Disposer d’un projet Nuxt 4 initialisé avec Bun, modules clés et arborescence prête.

---

## 1. Description rapide

Installer Bun, créer un projet Nuxt 4, ajouter les modules essentiels (Tailwind, Pinia, Sass) et les modules Nuxt officiels pour contenu, médias, scripts et QA, préparer l’arborescence standard (app/, content/, schemas/, services/, server/, shared/) à l’aide du blueprint disponible dans `BLUEPRINTS_PATH`, puis copier chaque README de blueprint dans les dossiers clés (pas de symlinks Git) depuis `BLUEPRINTS_PATH/directory-structure` en indiquant la provenance.

---

## 2. User Stories (essentielles)

- **US1 (P1)** : En tant que dev, je peux initialiser un projet Nuxt 4 avec Bun et les modules requis pour démarrer immédiatement.
- **US2 (P2)** : En tant que dev, je dispose du blueprint accessible via `BLUEPRINTS_PATH` (README + configs) qui fournit un socle minimal de configuration et d’architecture pour initier un projet Nuxt 4 moderne.
- **US3 (P1)** : En tant que dev, dans le blueprint je dispose d’une arborescence standardisée (app/, schemas/, services/, shared/, etc.) ainsi que des READMEs définissant responsabilités, bonnes pratiques et conventions, prêts à l’emploi.
- **US4 (P2)** : En tant que dev, je dispose des configurations essentielles fournies par le blueprint (`tsconfig.json`, `tailwind.config.ts`, `postcss.config.ts`, `.env.example`, `.gitignore`) pour démarrer le projet.

---

## 3. Critères d’acceptation (succès)

- **CA1** : Le projet Nuxt 4 est créé avec Bun (`bun create nuxt@latest my-app`, `bun install`).
- **CA2** : Modules ajoutés via Bun : `bun add -D sass`; `bun add -D @nuxtjs/tailwindcss tailwindcss postcss autoprefixer`; `bun add pinia`; `bun add -D @pinia/nuxt`; `bun add -D vite-plugin-yaml` (si retenu) + modules officiels Nuxt : `@nuxt/hints`, `@nuxt/image`, `@nuxt/scripts`, `@nuxt/test-utils`, `@nuxt/typescript-runtime`, `@nuxt/typescript-build`, `@nuxt/icon`, `@nuxt/ui`.
- **CA3** : Arborescence présente : `app/{assets,components,composables,layouts,middleware,pages,plugins,stores,utils}`, `content`, `schemas/{types,dtos,payloads}`, `services/{api,handlers,mappers}`, `server`, `shared`.
- **CA4** : Les READMEs du blueprint sont présents dans le repo (copiés depuis `"$BLUEPRINTS_PATH/directory-structure"` sans symlink) pour : `app` (et sous-dossiers `assets`, `components`, `composables`, `layouts`, `middleware`, `pages`, `plugins`, `stores`, `utils`), `content`, `schemas`, `services`, `server`, `shared`, `public`, `scripts`. Chaque fichier inclut une mention de provenance (ex : en-tête indiquant la source blueprint et éventuellement le commit de référence).
- **CA5** : Le `.gitignore` issu du blueprint (`$BLUEPRINTS_PATH/.gitignore`) est présent à la racine du projet.
- **CA6** : Les configs essentielles du blueprint (`tsconfig.json`, `tailwind.config.ts`, `postcss.config.ts`, `.env.example`) sont disponibles dans le projet (copiées depuis `BLUEPRINTS_PATH`, pas de symlinks).
- **CA7** : Le mode strict TypeScript est activé `typescript: { strict: true }` dans `nuxt.config.ts`.
- **CA8 (optionnel)** : Le README du blueprint racine (`$BLUEPRINTS_PATH/README.md`) a été consulté pour valider l’alignement sur les conventions.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Bun est disponible sur la machine (`curl -fsSL https://bun.sh/install | bash`).
- HYP-002 : `BLUEPRINTS_PATH` pointe sur la racine des blueprints Nuxt (ex. `/home/johan/www/graines-digitales/docs/blueprints/modern-webapp-nuxt`) et est accessible en lecture.
- HYP-003 : Les ressources du blueprint sont présentes : READMEs dans `"$BLUEPRINTS_PATH/directory-structure"`, configs (`tsconfig.json`, `tailwind.config.ts`, `postcss.config.ts`, `.env.example`) et `.gitignore` à la racine.

### Contraintes techniques (TECH)

- TECH-001 : Utiliser Bun pour init/install/ajout de deps.
- TECH-002 : Respecter l’arborescence cible et copier les READMEs du blueprint (pas de symlinks) depuis `"$BLUEPRINTS_PATH/directory-structure"`.
- TECH-003 : Réutiliser les fichiers de config et `.gitignore` depuis le blueprint (copie).
- TECH-004 : TypeScript strict obligatoire, activé dans `nuxt.config.ts` (`typescript: { strict: true }`.

---

## 5. Plan d’implémentation (ultra-synthétique)

- Installer Bun puis créer le projet Nuxt 4 (`bun create nuxt@latest my-app`).
- Ajouter les modules : Sass, Tailwind (`@nuxtjs/tailwindcss`, `tailwindcss`, `postcss`, `autoprefixer`), Pinia (`pinia`, `@pinia/nuxt`), plugin YAML si nécessaire **+ modules officiels Nuxt** (`@nuxt/hints`, `@nuxt/image`, `@nuxt/scripts`, `@nuxt/test-utils`, `@nuxt/typescript-runtime`, `@nuxt/typescript-build`, `@nuxt/icon`, `@nuxt/ui`).
- Consulter le README du blueprint (`"$BLUEPRINTS_PATH/README.md"`) pour s’aligner sur les conventions avant finalisation.
- Copier les configs essentielles depuis `"$BLUEPRINTS_PATH"` vers le projet (`tsconfig.json`, `tailwind.config.ts`, `postcss.config.ts`, `.env.example`).
- Activer TypeScript strict : ajouter `typescript: { strict: true }` (nuxt.config).
- Configurer `nuxt.config.ts` : CSS global (`~/assets/main.scss`), `ssr: true`, transition `fade`, modules `@nuxtjs/tailwindcss`, `@pinia/nuxt`, `@nuxt/hints`, `@nuxt/image`, `@nuxt/scripts`, `@nuxt/icon`, `@nuxt/ui`, plugin ViteYaml (obligatoire). Exemple attendu :

```ts
// nuxt.config.ts
import { resolve } from 'path'
import ViteYaml from '@modyfi/vite-plugin-yaml'

export default defineNuxtConfig({
  ssr: true,
  css: ['~/assets/main.scss'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/icon',
    '@nuxt/ui',
  ],
  typescript: {
    strict: true,
  },
  vite: {
    plugins: [ViteYaml()],
  },
})
```

- Créer l’arborescence dossiers (app/_, content, schemas/_, services/\*, server, shared) et le fichier `app/assets/main.scss` (même vide).
- Copier les README blueprint listés en utilisant `"$BLUEPRINTS_PATH/directory-structure"` (pas de symlinks), en ajoutant une mention de provenance dans chaque fichier.
- Récupérer à la fin le `.gitignore` situé à la racine de `"$BLUEPRINTS_PATH"` et le placer à la racine du projet.

---

## 6. Tâches à réaliser

- [x] **T1 – Setup Bun & projet** : Installer Bun ; `bun create nuxt@latest my-app` ; `cd my-app` ; `bun install`.
- [x] **T2 – Modules** : `bun add -D sass`; `bun add -D @nuxtjs/tailwindcss tailwindcss postcss autoprefixer`; `bun add pinia`; `bun add -D @pinia/nuxt`; `bun add -D vite-plugin-yaml` (obligatoire) + `@nuxt/hints`, `@nuxt/image`, `@nuxt/scripts`, `@nuxt/test-utils`, `@nuxt/typescript-runtime`, `@nuxt/typescript-build`, `@nuxt/icon`.
- [x] **T3 – Configs blueprint** : Copier depuis `"$BLUEPRINTS_PATH"` vers le projet : `tsconfig.json`, `tailwind.config.ts`, `postcss.config.ts`, `.env.example`.
- [x] **T4 – TypeScript strict** : Activer `typescript: { strict: true }` dans `nuxt.config.ts`.
- [x] **T5 – Arborescence** : `mkdir -p app/{assets/scss,components,composables,layouts,middleware,pages,plugins,stores,utils} content schemas/{types,dtos,payloads} services/{api,handlers,mappers} server shared` ; créer `touch app/assets/main.scss`; init Tailwind/PostCSS si nécessaire (`npx tailwindcss init -p`).
- [x] **T6 – Config Nuxt** : Mettre à jour `nuxt.config.ts` selon l’exemple fourni (CSS globale, `ssr: true`, transition `fade`, modules `@nuxtjs/tailwindcss`, `@pinia/nuxt`, `@nuxt/hints`, `@nuxt/image`, `@nuxt/scripts`, `@nuxt/icon`, `@nuxt/ui`, plugin `ViteYaml()`).
- [x] **T7 – READMEs blueprint (copie)** : Vérifier `BLUEPRINTS_PATH` et `directory-structure` (`test -d "$BLUEPRINTS_PATH/directory-structure"`), puis copier les READMEs disponibles : `"$BLUEPRINTS_PATH/directory-structure/app/README.md"` et ceux de ses sous-dossiers (`assets`, `components`, `composables`, `layouts`, `middleware`, `pages`, `plugins`, `stores`, `utils`), ainsi que `content`, `server`, `services`, `schemas`, `shared`, `public`, `scripts` vers les emplacements du projet. Ajouter une mention de provenance (source blueprint + éventuellement commit/horodatage) dans chaque fichier.
- [x] **T8 – .gitignore** : Copier le `.gitignore` situé dans `"$BLUEPRINTS_PATH/.gitignore"` vers la racine du projet.
- [x] **T9 – Vérifs** : Contrôler modules installés, configs copiées, arborescence créée, READMEs présents (pas de symlinks), fichiers Tailwind/PostCSS, strict activé ; lire `"$BLUEPRINTS_PATH/README.md"` pour valider l’alignement archi ; mettre à jour la doc si besoin.
- [x] **T10 – Commande de vérif** : Ajouter dans `package.json` le script `"check:spec001": "bash scripts/check-spec-001.sh"` pour exécuter la validation automatique des CA de la spec.

---

> Formaliser une note de décision dédiée si un choix de modules ou d’architecture évolue par rapport à cette base.
