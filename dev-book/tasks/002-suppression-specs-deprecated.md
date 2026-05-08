---
status: Todo
---

# 002 Suppression du dossier specs[deprecated]

## Intention

Supprimer le dossier `dev-book/specs[deprecated]/` une fois que les informations utiles qu'il
contient auront été intégrées dans la documentation du projet (`docs/`).

Ce dossier est conservé temporairement pour ne pas perdre le contexte accumulé pendant les
phases de bootstrapping et d'exploration du projet. Il ne doit plus être alimenté.

## Contexte

Les fichiers `specs[deprecated]/001` à `specs[deprecated]/028` ont servi de support de cadrage
pendant la construction initiale du projet. Leur rôle est terminé.

À terme, ce projet ne conserve pas de notion de "specs" dans son arbre de fichiers :

- les décisions d'architecture vivent dans `docs/`
- les tâches à réaliser vivent dans `dev-book/tasks/`
- les procédures opérationnelles vivent dans `dev-book/runbooks/`

## Étapes

### 1. Auditer les specs restantes

Pour chaque fichier dans `dev-book/specs[deprecated]/`, évaluer si le contenu :

- est déjà couvert par un fichier dans `docs/` → rien à faire
- contient une information utile non documentée → la porter dans `docs/` avant suppression
- est entièrement obsolète → supprimer sans reporter

### 2. Supprimer le dossier

Une fois l'audit terminé et les informations utiles portées dans `docs/`, supprimer le dossier
`dev-book/specs[deprecated]/` en totalité.

## Critères d'acceptation

- le dossier `dev-book/specs[deprecated]/` n'existe plus
- aucune information utile n'a été perdue : tout ce qui méritait d'être conservé est dans `docs/`
- aucune référence dans le code ou la documentation ne pointe encore vers `specs[deprecated]/`
