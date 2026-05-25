---
blueprint_source: none
---

# Bootstrap pré-prod MLK

Scripts d'initialisation d'un environnement Symfony MLK vierge.

## Prérequis

- `curl` disponible
- `yq` installé (étape 04 uniquement) — https://github.com/mikefarah/yq
- `bun` installé (étape 05 uniquement)
- `.env` configuré à la racine du projet (voir section Variables ci-dessous)
- Images téléchargées dans `public/images/` (étape 06 uniquement)

## Variables d'environnement requises

Ajouter dans `.env` à la racine du projet :

```env
# Déjà présentes pour le dashboard
SYMFONY_API_URL=http://localhost:18080
SYMFONY_SERVICE_EMAIL=<admin-email>
SYMFONY_SERVICE_PASSWORD=<admin-password>

# Spécifiques au bootstrap
BOOTSTRAP_JOHAN_PASSWORD=<password>
BOOTSTRAP_CAROLINE_PASSWORD=<password>
```

## Ordre d'exécution

Lancer les scripts depuis la racine du projet :

```bash
bash scripts/bootstrap-data/01-get-org.sh
bash scripts/bootstrap-data/02-create-project.sh
bash scripts/bootstrap-data/03-create-users.sh
bash scripts/bootstrap-data/04-seed-category-codes.sh
bash scripts/bootstrap-data/05-upload-images.sh
bash scripts/bootstrap-data/06-import-accommodations.sh
```

## Rejouer une étape isolée

Chaque script est idempotent. En cas d'erreur sur une étape, corriger le problème
et relancer le script concerné sans reprendre depuis le début.

Le fichier `.state` (gitignored) mémorise `ORG_ID` et `PROJECT_ID` entre les scripts.
Les étapes 03 à 06 nécessitent que `PROJECT_ID` soit présent dans `.state`.

## Repartir de zéro

```bash
rm scripts/bootstrap-data/.state
```

Puis relancer depuis l'étape 01. Les ressources déjà créées côté Symfony (org, projet,
users, codes) seront détectées comme existantes et ignorées sans erreur.

## Images manquantes

Si `public/images/` est vide, télécharger les images en premier :

```bash
bash scripts/download-accommodation-images.sh
```
