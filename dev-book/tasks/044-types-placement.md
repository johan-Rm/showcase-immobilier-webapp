---
status: Terminé
source: demande utilisateur — corriger les 14 violations de conventions
---

# 044 — Placement des types et contrats générés

## Intention

Corriger les 14 signalements sans modifier manuellement les contrats générés.

## Livré

- Déclarer les dossiers générés dans la règle YAML de placement des types.
- Conserver le contrôle des doublons et imports sur les types manuels.
- Placer les types Echo inférés de Zod et le résultat Markdown dans shared/types.
- Mettre à jour les imports et les README concernés.

## Tests

Tests de non-régression du validateur : contrats générés autorisés, types manuels
contrôlés et dossiers voisins non exemptés. Contrôles Make de conventions et de
qualité, tests unitaires dans Docker.

## Vérification du 5 octobre 2026

- Contrôle `check:app:types` exécuté via `make quality-conventions-check` :
  `Types placement OK`, les 14 violations sont résolues.
- `make quality-check` : lint, format et vérification TypeScript réussis.
- Tests unitaires dans Docker : 51 tests passent, dont quatre tests du validateur
  et trois tests du contrat Echo (normalisation, requête invalide, réponse invalide).
- Les types inférés restent liés aux schémas Zod ; aucune duplication manuelle.
- Les contrats générés et leurs sources YAML n’ont pas été modifiés.

## Hors périmètre

La suite des conventions s’arrête désormais sur trois signalements d’images
préexistants : une qualité en dur dans `ExceptionalLightbox.vue` et deux balises
`img` dans `villa-des-alizes.vue`. Ces fichiers ne sont pas modifiés par cette tâche.
La correction est préparée sur `fix/types-placement`. Sa fusion et sa publication
sur `develop` et `master` sont autorisées par l’utilisateur le 5 octobre 2026.
