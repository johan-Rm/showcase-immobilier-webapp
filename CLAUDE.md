# CLAUDE — Contexte projet : mlk-my-little-kasbah

Fichier de gouvernance local. Complète le socle global `~/.agents/.claude/CLAUDE.md` sans le
répéter. Les profils, principes et skills sont définis dans le global.

## Projet

Webapp immobilière éditoriale pour Essaouira et sa région. Interface calme, crédible,
orientée exploration puis contact. SEO-first, SSR, mobile-first, Core Web Vitals prioritaires.

## Stack

- Framework : Nuxt 4, Vue 3, TypeScript strict
- UI : Nuxt UI v4, Tailwind CSS
- Contenu : Nuxt Content (Markdown + YAML)
- État : Pinia
- Internationalisation : @nuxtjs/i18n
- Images : @nuxt/image
- Runtime : Bun
- Lint/format : ESLint (config flat), Prettier

## Architecture — lecture obligatoire avant d'agir

`docs/2.architecture/` est la source de vérité. 13 standards à lire selon le périmètre :

1. `1.application-architecture.md` — couches et responsabilités
2. `2.data-flow.md` — chemin des données source → rendu
3. `3.page-layout-screen-model.md` — modèle de composition des routes
4. `4.ssr-safety.md` — garde-fous serveur/client
5. `5.responsibility-boundaries.md` — frontières entre couches
6. `6.script-setup-standard.md` — structure attendue des SFC
7. `7.auto-imports-and-aliases.md` — imports automatiques et alias
8. `8.composables-standard.md` — conventions composables
9. `9.types-placement.md` — placement des types TypeScript
10. `10.services-standard.md` — organisation de `services/`
11. `11.stores-standard.md` — conventions Pinia
12. `12.content-model.md` — organisation de `content/`
13. `13.routing-and-middleware.md` — routes, middlewares, navigation

## Frontières de responsabilité

```
app/pages/        orchestre la route, le contexte, les meta
app/components/   affichage et composition visuelle uniquement
app/composables/  passerelle reactive UI / logique applicative
app/stores/       état global partagé (Pinia)
services/         logique métier pure — framework-agnostic
server/           routes et traitements Nitro
shared/           utilitaires et contrats partageables
schemas/          contrats de types et artefacts de build
content/          contenu Markdown + YAML (source éditoriale)
```

## Modèle de navigation

Les pages pilotent une navigation par **screens plein viewport** (`data-screen`, ancres,
transitions x ou y). Ce n'est pas un routing classique — lire `3.page-layout-screen-model.md`
avant toute modification de page ou de layout.

## Commandes courantes

```bash
bun run dev               # développement local
bun run build             # build production
bun run type-check        # vue-tsc --noEmit
bun run lint:check        # ESLint sans warnings
bun run format:check      # Prettier check
bun run quality:check     # lint + format + type-check

# Scripts de vérification architecture
bun run check:app:types             # placement des types
bun run check:app:soc               # separation of concerns composants
bun run check:app:script-setup-standard
bun run check:app:no-business-logic # pas de logique métier dans les composants
```

## Workflow de développement

1. spec dans `dev-book/` (si feature structurante)
2. tâche dans `dev-book/tasks/`
3. branche dédiée depuis `develop`
4. PR vers `develop`

## Points de vigilance spécifiques

- hydratation serveur/client — toujours vérifier SSR safety
- `services/` ne doit jamais importer depuis Vue, Nuxt ou Pinia
- Nuxt UI couvre la majorité des composants UI — vérifier avant d'écrire du HTML brut
- les images passent par `@nuxt/image` — pas de `<img>` natif sans justification
- i18n actif — tout texte visible passe par les clés de traduction
