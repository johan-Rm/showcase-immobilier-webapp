---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/shared/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier `shared`

## 1. Rôle et responsabilités

- Partager des helpers/constantes utilisables côté app et côté Nitro.
- Fournir des fonctions pures, sans dépendance à Vue/Nuxt/Nitro (pas de DOM, route, store).
- Servir de point d’auto-import pour `shared/utils` et `shared/types` (niveau racine uniquement).

---

## 2. Bonnes pratiques

- Un fichier = une responsabilité ; exports nommés explicites.
- Valider/typer les entrées ; éviter les dépendances lourdes.
- Tester les helpers critiques si la logique est non triviale.

## 3. Conventions de nommage

- Fichiers en `kebab-case.ts` ; noms d’exports descriptifs.
- Helpers auto-importés placés à la racine de `shared/utils` et `shared/types`.
- Sous-dossiers permis ; importer alors via l’alias `#shared/...`.

## 4. Performance

- Code court, pur et tree-shakeable ; aucune I/O ni appels réseau.
- Pas d’allocations inutiles ; privilégier des constantes réutilisées.

## 5. Structure et organisation

- `shared/utils/*` : helpers auto-importés (pas de sous-dossiers scannés par défaut).
- `shared/types/*` : types auto-importés.
- Autres dossiers/fichiers : imports explicites avec `#shared`.

---

### Ex. : Structure de template

```ts
// shared/utils/capitalize.ts
export const capitalize = (input: string) =>
  input[0] ? input[0].toUpperCase() + input.slice(1) : ''
```
