---
status: Fait
dependances: []
---

# 019 — Types TS pour les enums depuis les schémas YAML

## Intention

Les 5 enums PHP (`AccommodationQuality`, `AiReviewStatus`, `ContentStatus`, `MediaStatus`,
`ProjectRole`) n'ont aucun équivalent TypeScript dans mlk.

Une fois les enums YAML créés côté DGDOC (TASK-DGDOC-002), cette tâche génère ou déclare
les types TS correspondants dans mlk pour permettre un typage explicite des champs
qui consomment ces valeurs.

## Dépendance

Cette tâche suppose que `schemas/enums/` dans DGDOC contient les 5 fichiers YAML corrects
(résultat de TASK-DGDOC-002).

## Approche à évaluer

### Option A — Génération depuis YAML (préférable)

Étendre `services/converter/schema/generateArtifacts.ts` ou créer un générateur dédié
pour lire `schemas/enums/*.yaml` et produire des types union TS :

```ts
// schemas/enums/contentStatus.ts (généré)
export type ContentStatus = 'draft' | 'published' | 'archived'
```

Avantages : source de vérité unique, régénération automatique, cohérence garantie.

### Option B — Déclaration manuelle dans shared/types/

Si l'extension du générateur est trop coûteuse à court terme :

```ts
// shared/types/enums.ts (manuel)
export type ContentStatus = 'draft' | 'published' | 'archived'
export type MediaStatus = 'pending_analysis' | 'ready' | 'archived'
export type AccommodationQuality = 'Confort' | 'Architecture' | 'Intérieur'
export type AiReviewStatus = 'not_requested' | 'pending' | 'suggested' | 'approved' | 'rejected'
export type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer'
```

Risque : dérive manuelle si les valeurs PHP changent. À documenter explicitement.

## Consommateurs potentiels

Une fois les types disponibles, les utiliser dans :

- `shared/types/dashboardAccommodation.ts` — champs `isActive` (boolean OK), statuts éventuels
- `server/utils/dashboard/accommodationMapper.ts` — payload Symfony avec statuts
- `services/mapper/accommodation.ts` — si des champs portent un statut typé

## Validation

```bash
bun run type-check
bun run lint:check
```

- Les 5 types union sont accessibles via import dans mlk
- Aucun `string` générique ne remplace un type enum là où c'est exploitable
- Les valeurs correspondent exactement aux enums PHP (vérifier avec `schemas/enums/*.yaml`)
