# app/

Couche frontend Nuxt. Contient les pages, composants, composables, stores, layouts, middleware et plugins.

## Rôle et responsabilités

- orchestration du routing et des layouts (`pages/`, `layouts/`)
- rendu UI et composition visuelle (`components/`)
- état global réactif (`stores/`)
- logique transverse et passerelles vers les services (`composables/`)
- initialisation et plugins (`plugins/`)

## Conventions techniques

> Les conventions décrites dans cette section peuvent être vérifiées automatiquement via des scripts CI/CD.
> Les règles concrètes de validation automatisée sont déclarées en YAML dans `scripts/ci/app/`.
> Pour le détail, voir [docs/3.application/ci-conventions-validation.md](../docs/3.application/ci-conventions-validation.md).

### Ordre des blocs dans un fichier Vue

L'ordre des blocs dans un composant Vue est `<template>`, `<script setup lang="ts">`, `<style scoped>`.

Enforcement : règle ESLint `vue/block-order`.

### Structure interne de `<script setup>`

Le contenu de `<script setup lang="ts">` suit un ordre de blocs défini : imports, types et constantes, props et emits, composables et stores, état local, data inputs, helpers purs, computed UI-ready, handlers, watchers, métadonnées de page, lifecycle.

Le template consomme des valeurs déjà préparées. La logique métier ne doit pas fuir dans la couche d'affichage.

@see [docs/2.architecture/6.script-setup-standard.md](../docs/2.architecture/6.script-setup-standard.md)

Règle YAML : `app-script-setup-standard`

### Images

Toute image affichée dans `app/` passe par le composant `<AppImage>`.

Les balises `<img>`, `<NuxtImg>` et `<NuxtPicture>` sont interdites en dehors de `app/components/AppImage.vue`.

`<AppImage>` doit recevoir ses paramètres via `v-bind` avec un preset nommé issu de `IMAGE_PRESETS` ou `IMAGE_WARMUP_PRESETS`. Les props `width`, `format`, `quality`, `fit`, `sizes` ne doivent pas être écrites en dur.

Règles YAML : `app-images-use-app-image`, `app-images-no-height-prop`

### Logique métier dans les composants

Un composant dans `app/components/` ne doit pas construire de donnée dérivée à partir de l'état global.

Un `computed` ne doit pas combiner une source globale (store Pinia, `appConfig`, composable sans argument) avec une transformation de données (`.map`, `.filter`, `.reduce`, `.push`).

Les données dérivées appartiennent aux getters de store ou aux composables.

Règle YAML : `app-components-no-business-logic`

### Placement des types

Un type TypeScript utilisé par plus d'un fichier doit être défini dans `shared/types/`.

Un type local non exporté reste dans le fichier qui l'utilise.

@see [docs/2.architecture/9.types-placement.md](../docs/2.architecture/9.types-placement.md)

Règle YAML : `app-types-placement`

### Fetch dans les composants

Un composant dans `app/components/` ne doit pas appeler `$fetch`, `useFetch` ou
`useLazyFetch` directement.

Les appels réseau appartiennent aux composables ou aux pages. Un composant reçoit des
données via ses props ou via un composable dédié.

Règle YAML : `app-no-fetch-in-components`

### Mutations de store dans les composants

Un composant dans `app/components/` ne doit pas modifier l'état d'un store directement
(via `.$patch()` ou affectation directe sur un objet de store).

Les composants lisent l'état. Les mutations passent par des actions de store ou des
composables dédiés.

Règle YAML : `app-no-store-write-in-components`

### Composants larges

Un composant Vue dans `app/components/` ne doit pas dépasser 200 lignes.

Un composant qui approche ou dépasse ce seuil fait probablement plusieurs choses. Le
découper en composants de présentation plus petits.

Règle YAML : `app-large-component`

### Composables avec beaucoup de retours

Un composable (`use*.ts`) ne doit pas exposer plus de 8 valeurs dans son `return {}`.

Un composable qui retourne de nombreuses valeurs est souvent plusieurs responsabilités
agrégées. Le découper en composables spécialisés.

Règle YAML : `app-composable-many-returns`
