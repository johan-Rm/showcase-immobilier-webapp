---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/app/composables/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier `composables`

## 1. Rôle et responsabilités

- Fonctions de composition Vue réutilisables pour extraire la logique UI.
- Gestion d’état/réactivité et partage de code entre composants.
- Point d’auto-import Nuxt (`camelCase` du fichier) utilisable en `.js/.ts/.vue`.
- Pas de dépendance aux composants : rester léger, stateless côté composable.
- Vérifier l’existence dans [VueUse](https://vueuse.org/functions.html) avant de créer.
- Types générés via `.nuxt/imports.d.ts` (lancer `nuxt dev/build/prepare`).

---

## 2. Bonnes pratiques

- Un composable = une responsabilité ; exports nommés explicites.
- Rester pur autant que possible ; pas de side-effects inattendus.
- Documenter brièvement les cas limites dans le fichier concerné.

## 3. Conventions de nommage

- Fichiers en `camelCase.ts`.
- Préfixe obligatoire « use » + nom descriptif (`useFoo`, `useFeatureToggle`).

## 4. Performance

- Fonctions courtes, sans I/O bloquantes.
- Éviter les allocations inutiles et la duplication de logique.

## 5. Structure et organisation

- Nuxt scanne uniquement le premier niveau de `app/composables/`.
- Pour les sous-dossiers, re-exporter via `app/composables/index.ts` ou configurer `imports.dirs`.

---

### Ex. : Structure de template

```ts
// app/composables/useFoo.ts
export const useFoo = () => useState('foo', () => 'bar')
```
