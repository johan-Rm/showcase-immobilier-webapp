---
status: À faire
dependances: 007-dashboard-editeur-biens-immobiliers.md, 008-dashboard-sauvegarde-biens-api-symfony.md, 012-dashboard-upload-medias.md, 014-dashboard-metadata-select-category-codes.md
---

# 016 — Tests dashboard — Vitest

## Intention

Mettre en place une couverture de tests automatisés pour le dashboard, à l'aide de Vitest.
Les tests sont écrits au fur et à mesure des développements fonctionnels, et non après coup.

Cette task est volontairement ouverte : le périmètre précis sera affiné une fois les
features du dashboard stabilisées. Elle sert de cadre structurant pour ne pas accumuler
de dette de test.

## Périmètre initial

### Infrastructure

- installer et configurer Vitest dans le projet Nuxt
- configurer `@nuxt/test-utils` pour les tests composants
- configurer `happy-dom` ou `jsdom` comme environnement de test
- ajouter un script `test` dans `package.json`

### Ce qui sera testé (liste évolutive)

Les cibles sont précisées au fil des features validées. À titre indicatif :

- **Composables** — logique métier isolable hors du DOM
  - `useAccommodationStore` ou équivalent pinia
  - `useCategoryCodeOptions`
  - `useSymfonyCache` ou helper de cache API
- **Utilitaires serveur** — fonctions pures Nitro
  - `symfonyCache.ts` — get/set/invalidate
  - helpers de mapping markdown ↔ accommodation
- **Endpoints Nitro** — au moins les cas nominaux et les erreurs attendues
  - `GET /api/dashboard/accommodations`
  - `PUT /api/dashboard/accommodations/[identifier]`
- **Composants Vue** — comportements critiques seulement
  - `PropertyEditorSlideover.vue` — montage, chargement, sauvegarde
  - `CategoryCodeSelect.vue` — sélection, création à la volée

## Hors périmètre (pour l'instant)

- tests E2E (Playwright ou Cypress) — task séparée si nécessaire
- couverture à 100 % — la couverture utile prime sur le chiffre
- tests des pages (trop couplées à la navigation Nuxt)

## Critères de validation

- `npm run test` passe en CI sans erreur
- les composables métier critiques sont couverts
- les endpoints Nitro principaux ont au moins un test nominal et un test d'erreur
- aucun test ne fait de vraie requête réseau (mocks systématiques pour les appels Symfony)
