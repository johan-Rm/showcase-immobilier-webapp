# Bootstrap pré-prod MLK — Design

Date : 2026-05-22

## Contexte

Script de mise en production initiale de l'environnement Symfony MLK. Permet de créer
l'organisation, le projet, les utilisateurs, de seeder les category codes, d'importer
les biens réels et d'uploader les images, dans un environnement vierge.

Le script `scripts/import-accommodations.ts` existant suppose que l'org, le projet et
les utilisateurs existent déjà. Ce bootstrap couvre les étapes amont.

## Périmètre

1. Création de l'organisation `MLK - My Little Kasbah`
2. Création du projet `MLK - Modern Site Web` rattaché à l'organisation
3. Ajout de 2 utilisateurs au projet (Johan owner/admin, Caroline admin/user)
4. Seed des CategoryCodes depuis un fichier de référence YAML
5. Import des 7 biens réels non-fixtures (reuse du script TypeScript existant)
6. Upload des images depuis `public/images/accommodations/` (batch de 20)

## Hors périmètre

- Liaison images ↔ accommodations (associatedMedia, image[]) — task 012
- Import des biens fixtures
- Recadrage ou traitement d'images
- Gestion multi-environnement (dev vs prod)

## Architecture

### Structure des fichiers

```
scripts/bootstrap-data/
├── .state                         # gitignored — ORG_ID, PROJECT_ID
├── 01-create-org.sh
├── 02-create-project.sh
├── 03-create-users.sh
├── 04-seed-category-codes.sh
├── 05-import-accommodations.sh    # wrapper vers bun scripts/import-accommodations.ts
├── 06-upload-images.sh
├── category-codes.yaml            # source de vérité des codes à seeder
└── README.md
```

### Variables d'environnement requises (dans `.env`)

```env
SYMFONY_API_URL=http://localhost:18080

# Compte admin plateforme (ROLE_SUPER_ADMIN ou ROLE_ADMIN) utilisé pour créer l'orga et le projet
SYMFONY_SERVICE_EMAIL=<admin-email>
SYMFONY_SERVICE_PASSWORD=<admin-password>

# Passwords des deux membres à créer (étape 03)
BOOTSTRAP_JOHAN_PASSWORD=<password>
BOOTSTRAP_CAROLINE_PASSWORD=<password>
```

`SYMFONY_PROJECT_ID` n'est pas requis au démarrage — il est généré dynamiquement par
l'étape 2 et stocké dans `.state`.

Le compte `SYMFONY_SERVICE_EMAIL` doit avoir les droits pour créer des organisations
et des projets au niveau plateforme. C'est le même compte de service que celui utilisé
par le script `import-accommodations.ts` pour les appels API.

### Passage d'état entre scripts

Chaque script :
1. Source `.env` pour les variables de connexion
2. Lit `scripts/bootstrap-data/.state` pour les IDs générés (ORG_ID, PROJECT_ID)
3. Écrit dans `.state` après une création réussie

Le fichier `.state` est gitignored. Il peut être supprimé pour repartir de zéro.

### Idempotence

Chaque script vérifie si la ressource existe avant de créer. En cas d'existence détectée
(HTTP 409 ou slug déjà pris), il lit l'ID existant et continue sans erreur. Cela permet
de rejouer une étape après interruption.

## Détail des étapes

### 01 — Création organisation

```
POST {SYMFONY_API_URL}/api/organizations
{ "name": "MLK - My Little Kasbah" }
```

Écrit `ORG_ID` dans `.state`.

### 02 — Création projet

```
POST {SYMFONY_API_URL}/api/projects
{
  "organization": "/api/organizations/{ORG_ID}",
  "name": "MLK - Modern Site Web",
  "sourceLocale": "fr",
  "enabledLocales": ["fr", "en"]
}
```

Écrit `PROJECT_ID` dans `.state`.

### 03 — Ajout des utilisateurs

Deux appels séquentiels :

```
POST {SYMFONY_API_URL}/api/projects/{PROJECT_ID}/members
{ "email": "johan.remy@graines-digitales.online", "password": "...",
  "projectRole": "owner", "roles": ["ROLE_ADMIN"] }

POST {SYMFONY_API_URL}/api/projects/{PROJECT_ID}/members
{ "email": "buzac@mlk-my-little-kasbah.immo", "password": "...",
  "projectRole": "admin", "roles": ["ROLE_USER"] }
```

Les passwords sont lus depuis `BOOTSTRAP_JOHAN_PASSWORD` et `BOOTSTRAP_CAROLINE_PASSWORD`
(jamais hardcodés dans les scripts).

### 04 — Seed CategoryCodes

Fichier `category-codes.yaml` (source de vérité) — la liste ci-dessous est
**illustrative**, elle sera complétée à l'implémentation en scannant tous les champs
`category`, `place`, `realEstateListing`, `amenityFeature` et `tags` des fichiers
`content/fr/accommodations/*.md` pour ne rien oublier :

```yaml
accommodation-type:
  - appartement
  - maison
  - villa
  - riad
  - local-commercial
  - terrain
accommodation-place:
  - centre-ville
  - marina
  - medina
  - corniche
  - sidi-kaouki
  - campagne
real-estate-listing:
  - location-longue-duree
  - location-saisonniere
  - vente
  - location-gerance
amenity-feature:
  - balcon
  - terrasse
  - wifi
  - climatisation
  - parking
  - piscine
  - jardin
  - ascenseur
tag:
  - centre-ville
  - marina
  - medina
  - longue-duree
  - saisonniere
  - vue-mer
```

Le script utilise `yq` pour itérer sur le YAML et POST chaque code :

```
POST {SYMFONY_API_URL}/api/projects/{PROJECT_ID}/category-codes
{ "code": "appartement", "inCodeSet": "accommodation-type" }
```

Les codes déjà existants (HTTP 409) sont ignorés.

### 05 — Import accommodations

Wrapper qui injecte `PROJECT_ID` depuis `.state` dans `SYMFONY_PROJECT_ID` puis
appelle le script TypeScript existant :

```bash
SYMFONY_PROJECT_ID="$PROJECT_ID" bun scripts/import-accommodations.ts
```

Pas de duplication de logique : tout le mapping frontmatter → payload reste dans le .ts.

### 06 — Upload images

Lit tous les fichiers de `public/images/accommodations/`. Upload par batch de 20 via
l'endpoint bulk :

```
POST {SYMFONY_API_URL}/api/projects/{PROJECT_ID}/media-objects/bulk
Content-Type: multipart/form-data
files[]: <fichier1>
files[]: <fichier2>
...
```

Log le nombre d'images uploadées et les éventuelles erreurs. La liaison
images ↔ accommodations (`associatedMedia`, `image[]`) est hors scope.

## README des scripts

Le `README.md` du dossier documente :
- les prérequis (yq, bun, .env configuré)
- l'ordre d'exécution
- comment relancer une étape isolée
- comment repartir de zéro (supprimer `.state`)

## Contraintes

- aucun secret hardcodé dans les scripts
- tous les passwords passent par des variables d'env
- `.state` gitignored
- dry-run non requis (bootstrap one-shot, idempotent par design)
- compatible avec `set -euo pipefail`
