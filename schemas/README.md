---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/schemas/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier `schemas`

## 1. Rôle et responsabilités

Ce dossier centralise les contrats typés et artefacts liés aux schémas utilisés par l'application.

Il couvre deux besoins distincts :

- les types et constantes exploités directement par le projet pour structurer les données applicatives et éditoriales
- les artefacts générés à partir des schémas source, utilisés comme contrat stable entre les couches du projet

Deux sous-dossiers sont particulièrement sensibles :

- `interfaces/`
- `dtos/`

Ils sont générés automatiquement depuis la source de vérité unique du projet et sont ignorés par Git. Leur absence dans le suivi de version ne réduit pas leur importance : ils font partie du contrat réel utilisé par l'application.

Ce dossier ne doit pas contenir de logique UI, de composants Vue, ni de code métier couplé à Nuxt.

## 2. Structure locale

Le contenu actuel du dossier est organisé ainsi :

- `app.ts` : types applicatifs transverses construits au-dessus des interfaces de schéma
- `constants/` : constantes typées réutilisables, par exemple `priceCurrency` ou `priceSpecification`
- `interfaces/` : interfaces de schéma partagées
- `dtos/` : DTOs exportés pour les échanges et transformations de données
- `enums/` : emplacement réservé pour des enums générés ou partagés
- `types/` : emplacement réservé pour des types complémentaires générés ou partagés

## 3. Règles de contribution

- Ne pas modifier manuellement les artefacts générés dans `schemas/interfaces/`, `schemas/dtos/`, `schemas/enums/` ou `schemas/types/` quand ils proviennent du hook de génération.
- `schemas/interfaces/` et `schemas/dtos/` sont ignorés par Git mais doivent être considérés comme des sorties de génération critiques.
- Toute évolution de ces artefacts doit être faite dans les schémas source, puis régénérée via le hook prévu par le projet.
- Les constantes ou types applicatifs ajoutés ici doivent rester framework-agnostic et testables.
- Aucun `any` non justifié.
- Aucun code runtime dépendant de Vue, Nuxt ou du DOM.

## 4. Points d'attention

- `schemas/` contient des contrats et aides de typage, pas des modèles métier avec logique embarquée.
- Si un type devient spécifique à une feature UI, il doit être déplacé vers le périmètre local concerné plutôt que d'alourdir ce dossier.
- Toute modification de contrat doit être traitée comme un changement potentiellement transverse entre contenu, services, serveur et frontend.
