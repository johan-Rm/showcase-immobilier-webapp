# Spec — Types placement : bonnes pratiques et script de vérification

**Date :** 2026-05-04
**Statut :** approuvé

---

## Contexte

Le projet est structuré en quatre couches : `app/` (Vue/Nuxt), `server/` (Nitro), `services/` (mappers, SEO, converters), `shared/` (code cross-couche). Les types TypeScript sont aujourd'hui définis à plusieurs endroits sans règle formelle, ce qui crée des doublons (ex : `AppLinkTarget` défini à la fois dans `AppLink.vue` et `shared/types/app.ts`).

---

## Règles (bonnes pratiques)

### Règle 1 — Local par défaut

Un type défini dans un seul fichier reste dans ce fichier, qu'il soit dans un `.vue`, un composable, un store ou un service. Aucune extraction n'est requise tant qu'il n'est pas réutilisé.

### Règle 2 — Migration obligatoire si partagé

Dès qu'un type est importé par un fichier autre que celui où il est défini, il doit être déplacé dans `shared/types/`. Cette règle s'applique quelle que soit la couche d'origine (deux composants Vue qui partagent un type → `shared/types/`).

### Règle 3 — Pas de doublon exporté

Le même nom de type exporté ne peut pas être défini dans plusieurs fichiers en dehors de `shared/types/`. Un type dans `shared/types/` est la source de vérité unique.

Les types locaux non exportés, par exemple `Props` ou `Emits` dans des composants Vue, restent autorisés tant qu'ils ne sont pas importés par un autre fichier.

---

## Script de vérification

### Localisation et commande

```
scripts/check-types-placement.ts
```

```json
"check:types": "bun scripts/check-types-placement.ts"
```

Cohérent avec le pattern `check:*` déjà en place (`check:feat001`).

### Dépendances

Utilise `@typescript-eslint/parser` (déjà installé) pour parser l'AST. Aucune nouvelle dépendance.

### Périmètre

Dossiers scannés : `app/`, `server/`, `services/`, `shared/`.
Extensions : `.ts`, `.vue` (le contenu du bloc `<script>` est extrait avant le parsing AST).
Exclusions : `node_modules/`, `.nuxt/`, `dist/`.

### Architecture en 3 phases

**Phase 1 — Collecte**

Pour chaque fichier dans le périmètre :

- Parser l'AST avec `@typescript-eslint/parser`
- Extraire les **définitions de types** : noeuds `TSTypeAliasDeclaration` et `TSInterfaceDeclaration`
- Extraire les **imports de types** : noeuds `ImportDeclaration` avec `importKind: 'type'` ou spécificateurs `importKind: 'type'`, résoudre le chemin vers le fichier source réel en gérant les alias du projet (`~/` → `app/`, `#shared/` → `shared/`, chemins relatifs)

Résultat : deux maps

- `definitions: Map<typeName, filePath[]>` — où chaque type est défini
- `usages: Map<typeName, { definedIn: string, importedBy: string[] }>` — qui importe quoi

**Phase 2 — Analyse**

Deux violations détectées :

| Code             | Condition                                                        | Message                                                                 |
| ---------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `DUPLICATE`      | Même nom exporté dans ≥2 fichiers hors `shared/types/`           | `Type "Foo" défini dans A et B → déplacer dans shared/types/`           |
| `SHOULD_MIGRATE` | Type défini hors `shared/types/` ET importé par ≥1 autre fichier | `Type "Foo" défini dans A, importé par B → déplacer dans shared/types/` |

**Phase 3 — Rapport**

- Aucune violation → `✓ Types placement OK` + `exit 0`
- Violations → liste formatée (fichier, type, règle enfreinte) + `exit 1`

### Format de sortie (exemple)

```
✗ 2 violation(s) détectée(s)

  SHOULD_MIGRATE  app/components/AppLink.vue
                  Type "AppLinkTarget" importé par app/components/screen/Footer.vue
                  → Déplacer dans shared/types/

  DUPLICATE       app/composables/useAccommodation.ts
                  Type "AccommodationStatus" aussi défini dans services/mapper/accommodation.ts
                  → Conserver une seule définition dans shared/types/
```

---

## Ce que le script ne vérifie pas

- Les types définis dans `.d.ts` globaux (hors périmètre, gérés par TypeScript)
- Les types générés dans `.nuxt/` (exclus)
- La cohérence sémantique des types (c'est le rôle de `tsc`)

---

## Évolution future

Le script est conçu pour être exécuté localement (`bun run check:types`). Une intégration CI (option b) pourrait être ajoutée ultérieurement sans modifier la logique — il suffit d'appeler la même commande dans le pipeline.
