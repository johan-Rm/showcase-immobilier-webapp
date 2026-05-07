---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/app/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier App

## 1. Rôle et responsabilité

Ce dossier contient l’application frontend basée sur **Nuxt 4** et tout ce qui concerne le rendu UI.

Responsabilités principales :

- point d’entrée UI (`app.vue`) et orchestration globale
- routing, layouts, middleware, plugins et composables
- rendu SSR/hydration côté client

Hors périmètre :

- backend, API, services server
- contenu statique brut ou sources de données

Nuxt gère le bootstrap automatiquement.
Le point d’entrée applicatif est :

```
app.vue
```

## 2. Notes importantes

- `app.vue` orchestre le shell de boot initial et le bootstrap global des données core.
- La normalisation de la locale est gérée par un middleware global, pas par `useLang()`.
- Les stores core (`webPage`, `accommodation`) doivent rester alignés avec l’init centrale.
- Les composants UI ne doivent pas appeler des services server directement (passer par composables).

## 3. Bonnes pratiques

### 🔹 Structure du projet

- `app/` : répertoire principal de l’application Nuxt
  - `app/assets/` : assets traités par l’outil de build (Vite/Webpack)
  - `app/components/` : composants Vue de l’application
  - `app/composables/` : composables Vue
  - `app/layouts/` : layouts qui enveloppent les pages
  - `app/middleware/` : code exécuté avant la navigation
  - `app/pages/` : routing basé sur les fichiers
  - `app/plugins/` : plugins exécutés à l’initialisation Nuxt
  - `app/utils/` : fonctions utilitaires partagées

  - `app/app.vue` : composant racine
  - `app/app.config.ts` : configuration réactive de l’application
  - `app/error.vue` : page d’erreur

- `nuxt.config.ts` : configuration globale

---

### 🔹 Organisation du code

- Garder la logique métier hors des composants UI (UI = rendu + interactions).
- Placer la logique transverse dans les composables (auth, locale, data, UI globale).
- Centraliser les intégrations globales dans les plugins (injections, config, libs).
- Préférer les alias Nuxt (`@/`, `#imports`) pour des imports stables et clairs.
- Respecter le triptyque Stores / Composables / Services pour structurer les données et l’état réactif (voir `docs/2.architecture/`).

---

### 🔹 Ordre des blocs de code principales dans un fichier Vue

L’ordre propre et recommandé dans un fichier Vue est :

```vue
<template>
  <!-- Structure HTML -->
</template>

<script setup lang="ts">
// Logique du composant
</script>

<style scoped>
/* Styles */
</style>
```

Cet ordre doit être respecté dans tous les composants pour garantir une structure homogène et lisible.

## 4. Autres considérations

### 🔹 Performance

- Distinguer le rendu initial critique du bootstrap métier: `initCoreData` ne doit pas bloquer le premier rendu visible.
- Utiliser `useAsyncData`/`useFetch` pour les données spécifiques à une page.
- Éviter les rechargements inutiles lors des changements de locale.
- Charger en lazy-loading les composants lourds ou rarement utilisés.
- Appliquer un smart-prefetch ciblé pour précharger les données “N+1” avant l’action utilisateur.
