---
status: Todo
---

# 028 Locales dynamiques pilotées par le projet API

## Intention

Aujourd'hui l'ensemble des locales `fr / en / es` est codé en dur dans le frontend, le
dashboard, les routes serveur et les scripts. Or chaque **projet** côté API Symfony définit
ses propres langues via les champs `sourceLocale` et `enabledLocales`
(ex. `blue-bay-mogador` n'a que `fr` et `en`).

Cette confusion entre **locales supportées par l'app** (catalogue de build) et **locales
réellement activées par le projet** (runtime) provoque des erreurs et une UI incohérente
dès qu'on change de `SYMFONY_PROJECT_ID` :

- `make content-sync` plante en `400 « Locale is not enabled for this project »` sur `es` ;
- le dashboard affiche un onglet `es` éditable alors que le projet ne l'accepte pas (les
  routes BFF re-déclenchent le `400` à la sauvegarde) ;
- le `LangSwitcher` du site public propose `es` → pages de contenu vides ou 404.

L'objectif est d'introduire **une seule source de vérité runtime** des locales effectives,
dérivée du projet API, et de la faire consommer partout à la place des listes en dur.

## Modèle conceptuel cible

Deux notions distinctes, à ne plus confondre :

| Notion | Locales **supportées** (build) | Locales **activées** (runtime, par projet) |
|---|---|---|
| Sens | Ce que l'app sait afficher | Ce que le projet API contient |
| Valeur | `fr, en, es` (figé) | `enabledLocales` + `sourceLocale` |
| Source | `shared/utils/locale.ts` (`AVAILABLES_LOCALES`) | API `/api/projects/{id}` |
| Change quand | on recompile l'app | on change de `SYMFONY_PROJECT_ID` |

Règle : l'ensemble effectif = `AVAILABLES_LOCALES` ∩ `enabledLocales`, avec
`sourceLocale` comme langue par défaut/source.

## Périmètre

- exposer `enabledLocales` et `sourceLocale` du projet courant au runtime (serveur + client) ;
- créer un point d'accès unique (composable + util partagé) pour les locales effectives ;
- remplacer toutes les listes `['fr','en','es']` en dur par cette source dynamique ;
- adapter `content-sync.ts` (déjà amorcé), le `LangSwitcher`, les onglets dashboard et les
  routes BFF ;
- documenter le modèle dans `docs/2.architecture/`.

## Hors périmètre

- ajouter de nouvelles langues au catalogue `AVAILABLES_LOCALES` (es reste supporté côté app) ;
- gérer la traduction automatique du contenu (voir task 013) ;
- modifier le contrat API Symfony (les champs existent déjà) ;
- refondre la stratégie de routing i18n (`strategy: 'prefix'`) au-delà du filtrage des locales.

## État des lieux (sources de locales à traiter)

### Source de vérité « build » (à conserver)

- `shared/utils/locale.ts` — `AVAILABLES_LOCALES`, `FALLBACK_LOCALE`, `isLocaleCode`,
  `normalizeLocale`
- `shared/types/i18n.ts` — `type LocaleCode = 'fr' | 'en' | 'es'`
- `nuxt.config.ts` — bloc `i18n` (dérivé de `AVAILABLES_LOCALES`) + traductions de routes
  `pages` codées en dur fr/en/es

### Listes `['fr','en','es']` en dur à remplacer

| Périmètre | Fichier |
|---|---|
| Dashboard — onglets d'édition | `app/components/dashboard/PropertyEditorSlideover.vue` |
| Dashboard — onglets d'édition | `app/components/dashboard/PropertyEditorPanel.vue` |
| Dashboard — upload média | `app/components/dashboard/PropertyMediaPickerModal.vue` |
| Dashboard — code catégorie | `app/components/dashboard/CategoryCodeSelect.vue` |
| BFF — propagation champs globaux | `server/api/dashboard/accommodations/[identifier].put.ts` |
| BFF — création code catégorie | `server/api/dashboard/category-codes.post.ts` |
| BFF — upload média | `server/api/dashboard/media/upload.post.ts` |
| BFF — texte code catégorie | `server/api/dashboard/category-codes/[code]/text.put.ts` |
| Site public — switcher | `app/components/navigation/LangSwitcher.vue` (via `AVAILABLES_LOCALES`) |
| Script | `scripts/content-sync.ts` (correction déjà amorcée) |

### Contrat API disponible

`GET /api/projects/{id}` renvoie notamment :

```json
{ "sourceLocale": "fr", "enabledLocales": ["fr", "en"], "id": "..." }
```

`SYMFONY_PROJECT_ID` est déjà présent dans `runtimeConfig.symfony.projectId` (privé, serveur).

## Étapes

### 1. Exposer les locales du projet au runtime

- ajouter une route serveur (ex. `server/api/project-config.get.ts`) qui lit le projet via
  l'API Symfony et renvoie `{ sourceLocale, enabledLocales }`, avec cache (réutiliser le
  cache dashboard existant si pertinent) ;
- côté client, hydrater une fois (plugin ou `useState`) pour éviter un fetch par composant.

### 2. Source de vérité unique des locales effectives

- ajouter dans `shared/utils/locale.ts` un util pur
  `resolveEnabledLocales(enabled: string[]): LocaleInfo[]` = intersection avec
  `AVAILABLES_LOCALES` ;
- exposer un composable `useEnabledLocales()` (liste filtrée + `sourceLocale` + helper
  `isEnabledLocale`) consommé par l'app et le dashboard.

### 3. Site public

- `LangSwitcher.vue` se construit depuis `useEnabledLocales()` au lieu de `AVAILABLES_LOCALES` ;
- vérifier le middleware `app/middleware/locale.global.ts` : rediriger une locale non activée
  vers `sourceLocale`.

### 4. Dashboard

- onglets d'édition (`PropertyEditorSlideover`, `PropertyEditorPanel`) construits depuis les
  locales effectives ; supprimer les `DashboardLocale = 'fr' | 'en' | 'es'` au profit de
  `LocaleCode` filtré ;
- `PropertyMediaPickerModal` et `CategoryCodeSelect` : normaliser sur les locales activées.

### 5. Routes serveur BFF

- remplacer les constantes `DASHBOARD_LOCALES` et le tableau passé à `propagateGlobalFields`
  par la liste activée du projet (récupérée côté serveur, avec cache) ;
- ne plus émettre de requête API sur une locale non activée.

### 6. Script content-sync

- finaliser `scripts/content-sync.ts` : lit `enabledLocales` via `fetchProject` (amorcé) ;
- valider `--locale=` contre les locales activées (skip + warning sinon).

### 7. Documentation

- documenter le modèle « supportées vs activées » et la source de vérité runtime dans
  `docs/2.architecture/` (candidat : `4.ssr-safety.md` pour l'hydratation, ou nouveau
  standard dédié i18n).

## Critères d'acceptation

- `make content-sync` réussit sur un projet à 2 locales (fr/en) sans erreur `400` ;
- le `LangSwitcher` n'affiche que les locales activées du projet courant ;
- le dashboard n'affiche pas d'onglet pour une locale non activée ;
- aucune route BFF n'émet de requête sur une locale non activée ;
- plus aucune occurrence de `['fr','en','es']` en dur hors `AVAILABLES_LOCALES` et
  `nuxt.config.ts` (catalogue de build) ;
- `bun run lint:check`, `bun run format:check`, `bun run type-check` passent ;
- SSR-safe : pas de divergence d'hydratation sur la liste des locales.

## Points de vigilance

- **SSR / hydratation** : la liste des locales doit être identique serveur et client au
  premier rendu ; passer par `useState`/payload, pas par un fetch client tardif.
- **Catalogue vs activées** : `AVAILABLES_LOCALES` reste le sur-ensemble compilé ; ne pas le
  réduire, seulement le filtrer au runtime.
- **Cache** : mutualiser le cache du projet pour éviter un appel API par requête BFF.
- **Routes i18n en dur** (`nuxt.config.ts > i18n.pages`) : restent fr/en/es au build ; une
  locale désactivée ne casse pas le build, elle est seulement masquée au runtime.
- **Fallback** : toute locale inconnue ou désactivée retombe sur `sourceLocale` (ou
  `FALLBACK_LOCALE` si le projet n'est pas joignable).

## Liens

- task 022 — content-sync pull API (script corrigé ici)
- task 024 — switcher de langue navigation
- task 025 — dashboard réexport markdown toutes locales
- task 013 — traduction automatique des biens
