---
status: In progress
doc: docs/3.application/ci-conventions-validation.md
---

# 003 Validation des conventions app par YAML

## Intention

Faire evoluer les controles `scripts/ci/app/` pour que les regles projet soient declarees
dans un fichier YAML lisible, plutot que dispersees en constantes codees en dur dans les
scripts TypeScript.

## Perimetre

- documenter le modele README local -> docs -> YAML -> script CI
- ajouter une configuration YAML pour les regles app existantes
- faire lire cette configuration par les scripts `scripts/ci/app`
- conserver le comportement actuel des controles
- ajouter le check `script setup` au workflow conventions
- documenter et appliquer le fait qu une convention technique peut contenir plusieurs regles

## Hors perimetre

- reecrire tous les scripts en moteur generique complet
- ajouter une nouvelle dependance
- modifier les conventions produit elles-memes
- corriger les violations applicatives detectees par les checks

## Etapes

### 1. Documentation

- ajouter la documentation operationnelle dans `docs/3.application/`
- referencer cette documentation depuis l index applicatif

### 2. Configuration YAML

- creer un fichier de regles pour `scripts/ci/app`
- definir pour chaque regle un `name` et `requiresManualReview`
- declarer les patterns, chemins, exceptions et severites existants
- permettre plusieurs regles pour une meme convention technique

### 3. Scripts CI

- ajouter un helper de chargement des regles YAML
- adapter les scripts app existants pour consommer la configuration
- conserver les messages et codes de sortie existants autant que possible

### 4. Workflow

- ajouter `bun run check:app:script-setup-standard` au workflow conventions

## Criteres d acceptation

- les regles app sont visibles dans un fichier YAML
- chaque regle declare `name` et `requiresManualReview`
- les scripts app lisent le YAML
- la convention images contient une regle dediee interdisant la prop `height`
- les tests existants passent
- les checks CI gardent leur comportement actuel

## Points de vigilance

- Les regles heuristiques doivent rester en warning ou signaler clairement la revue manuelle.
- Les scripts ne doivent pas devenir plus complexes que le besoin actuel.
- La violation existante de placement de type peut rester detectee : elle n appartient pas a cette task.
