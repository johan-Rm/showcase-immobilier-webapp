---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/app/pages/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier `pages`

## 1. Rôle et responsabilités

- Points d'entree de l'application ; chaque fichier cree une route.
- Definir le contexte de route, charger/prefetcher les donnees et orchestrer l'affichage.
- Structurer le HTML de la page et gerer les etats de chargement/erreur.
- Garantir un seul root element pour les transitions de page.

---

## 2. Notes importantes

- Le modele de page (Template / Layout / Screens / Composants) est defini dans `docs/2.architecture/`.
  Ce README ne fait qu'y renvoyer pour eviter les doublons.
- Le standard de structure des fichiers Vue en `script setup` est documente dans
  `docs/2.architecture/6.script-setup-standard.md`.
- Si l'application n'utilise que `app.vue`, activer le routing pages via `pages: true` ou `router.options.ts`.
- Les pages doivent rester SSR-safe (pas de logique client-only sans besoin explicite).

---

## 3. Bonnes pratiques

### 🔹 Naming conventions

- Fichiers en `kebab-case.vue` (ex. `reset-password.vue`).
- Dynamiques entre crochets `[param].vue`, optionnels `[[param]]`, catch-all `[...slug].vue`.
- Dossiers pour sections complexes ou routes imbriquees (`account/`, `project/`).
- Classes CSS racines prefixees `pages-...` (ex. `pages-project-dashboard`).

---

### 🔹 Import rules

- Les pages deleguent la logique metier aux composables/services.
- Preferer les alias globaux (`@services`, `@schemas`, `@utils`) plutot que des chemins relatifs profonds.
- Eviter les imports circulaires et les effets de bord au chargement.

---

### 🔹 Page structure

- Declarer layout/middleware/meta via `definePageMeta`.
- Utiliser `<NuxtPage />` dans `app.vue` pour rendre les pages.
- Garder les templates lisibles et limites en logique imperative.
- Centraliser `pageUi` et `pageSectionUi` via le composable `useScreenUi` pour eviter la duplication.
- Quand une page appelle un composable d orchestration transverse comme `usePageSeo`, elle doit lui passer des `ComputedRef` stricts.
- L entrypoint reste responsable de ne fournir que les donnees qui doivent vraiment etre exposees au runtime, notamment pour le JSON-LD.

---

### 🔹 Routing structure

- Racine `app/pages/` scannee ; arborescence = structure de routes.
- Routes imbriquees via sous-dossiers + `<NuxtPage />` dans le parent.
- Groupes de routes possibles via dossiers `(group)` ignores dans l'URL.

---

### 🔹 Full screen / scroll

- Le plein ecran est defini par le layout `app/layouts/default.vue` (`h-dvh w-screen overflow-hidden`).
- Les pages restent neutres : preferer `h-full w-full` sans `overflow-*` ni `min-h-*` au niveau racine.
- Les `UPageSection` qui representent un screen doivent redefinir `h-dvh w-screen` pour garantir un ecran par section.
- Le scroll interne est explicite par screen : ajouter `min-h-0` sur le parent flex/grid et `min-h-0 overflow-y-auto` sur la zone scrollable.
- Les `min-h-*` ne sont utilises que pour gerer un scroll interne ou une hauteur minimale voulue.

---

## 4. Autres considerations (optionnel)

### 🔹 Performance

- Lazy load des composants lourds.
- Prefetch des donnees avec les mecanismes Nuxt natifs.
- Limiter les dependances couteuses dans les pages.

---

### 🔹 Exemple de page

```vue
<template>
  <div class="pages-example">
    <h1>Page Title</h1>

    <section>
      <h2>Main Section</h2>
      <ComponentA />
      <ComponentB />
    </section>

    <section>
      <h2>Secondary Section</h2>
      <ComponentC />
    </section>
  </div>
</template>
```

---
