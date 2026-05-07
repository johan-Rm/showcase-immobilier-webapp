---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/app/utils/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier `app/utils`

## 1. Rôle et responsabilités

- Héberger des fonctions utilitaires auto-importées pour la partie Vue (JS/TS/Vue).
- Séparer les helpers génériques des composables (`app/composables`).
- Fournir des utilitaires légers, purs et réutilisables dans l’app.

---

## 2. Bonnes pratiques

- Un fichier = une responsabilité ; exports nommés explicites ou export par défaut.
- Pas de dépendance au contexte Nuxt (pas de route/store) : rester pur/stateless.
- Typage clair et validation minimale quand nécessaire.

## 3. Conventions de nommage

- Fichiers en `kebab-case.ts` ou `camelCase.ts` ; nom auto-importé en camelCase.
- Fonctions utilitaires descriptives (`formatNumber`, `randomEntry`, etc.).
- Garder les noms courts et liés à l’action fournie.

## 4. Performance

- Fonctions rapides, sans I/O ni effets de bord.
- Éviter les allocations inutiles ; favoriser les constantes réutilisées.

## 5. Structure et organisation

- Racine `app/utils/` : auto-importée par Nuxt (niveau direct).
- Sous-dossiers possibles si volumineux, mais penser à l’auto-import (ajouter aux dirs si besoin).

---

### Ex. : Structure de template

```ts
// app/utils/random-entry.ts
export default function randomEntry<T>(arr: T[]): T | undefined {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined
}
```
