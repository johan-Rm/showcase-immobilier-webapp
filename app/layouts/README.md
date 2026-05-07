---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/app/layouts/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier `layouts`

## 1. Rôle et responsabilités

- Gabarits qui définissent la structure commune des pages (header/footer/nav…).
- UI globale optionnelle (modales, drawers, overlays, notifications, aides contextuelles).
- Point d’auto-import Nuxt (chargement async).
- Orchestration des slots/pages et transitions entre layouts.
- `default.vue` utilisé si aucun layout n’est spécifié.
- Si une seule mise en page, privilégier `app.vue` plutôt qu’un layout dédié.

## 2. Bonnes pratiques

- Un layout = une responsabilité claire (public, app, auth, etc.).
- Root unique obligatoire (pour transitions) et pas de `<slot />` en root.
- Spécifier le layout via `definePageMeta({ layout })` ou prop `name` sur `<NuxtLayout>`.
- Nom normalisé en kebab-case (ex. `someLayout` → `some-layout`).

## 3. Conventions de nommage

- Fichiers en `kebab-case.vue` (`default.vue`, `main.vue`, `custom.vue`).
- Noms alignés sur l’usage (ex. `auth.vue`, `public.vue`).

## 4. Performance

- Layouts chargés en async import ; garder le contenu minimal.
- Éviter d’y charger des dépendances lourdes ; déléguer aux pages/composants.
- Réserver les overlays de debug, de POCs ou de design-system aux layouts dédiés de labo plutôt qu'aux layouts publics.

## 5. Structure et organisation

- Racine `app/layouts/` scannée automatiquement ; noms basés sur le chemin.
- Un seul root par layout ; le contenu page s’affiche dans `<slot />`.
- Override global possible via `<NuxtLayout name="...">` dans `app.vue`.

---

### 🔹 Exemple de structure de template

```vue
<template>
  <div class="layout-root">
    <header class="layout-header">
      <!-- Header commun -->
    </header>

    <main class="layout-main">
      <slot />
    </main>

    <footer class="layout-footer">
      <!-- Footer commun -->
    </footer>

    <!-- UI globale optionnelle -->
    <GlobalModal />
    <NavDrawer />
    <ToastOverlay />
    <HelpPanel />
  </div>
</template>
```
