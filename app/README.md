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

### Ordre des blocs dans un fichier Vue

L'ordre des blocs dans un composant Vue est `<template>`, `<script setup lang="ts">`, `<style scoped>`.

Enforcement : règle ESLint `vue/block-order`.

### Images

Toute image affichée dans `app/` passe par le composant `<AppImage>`.

Les balises `<img>`, `<NuxtImg>` et `<NuxtPicture>` sont interdites en dehors de `app/components/AppImage.vue`.

`<AppImage>` doit recevoir ses paramètres via `v-bind` avec un preset nommé issu de `IMAGE_PRESETS` ou `IMAGE_WARMUP_PRESETS`. Les props `width`, `format`, `quality`, `fit`, `sizes` ne doivent pas être écrites en dur.

### Logique métier dans les composants

Un composant dans `app/components/` ne doit pas construire de donnée dérivée à partir de l'état global.

Un `computed` ne doit pas combiner une source globale (store Pinia, `appConfig`, composable sans argument) avec une transformation de données (`.map`, `.filter`, `.reduce`, `.push`).

Les données dérivées appartiennent aux getters de store ou aux composables.

### Placement des types

Un type TypeScript utilisé par plus d'un fichier doit être défini dans `shared/types/`.

Un type local non exporté reste dans le fichier qui l'utilise.
