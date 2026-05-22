---
status: A planifier
dependances: 008-dashboard-sauvegarde-biens-api-symfony.md
---

# 015 — Bootstrap pré-prod

## Intention

Fournir un jeu de scripts Bash permettant d initialiser un environnement Symfony MLK
vierge avant la mise en production : creation de l organisation, du projet, des deux
utilisateurs, seed des CategoryCodes, import des biens reels et upload des images.

Le script `scripts/import-accommodations.ts` suppose que l org, le projet et les
utilisateurs existent deja. Ce bootstrap couvre les etapes amont.

## Perimetre

1. Creation de l organisation `MLK - My Little Kasbah`
2. Creation du projet `MLK - Modern Site Web` rattache a l organisation
3. Ajout de 2 utilisateurs au projet (Johan owner/admin, Caroline admin/user)
4. Seed des CategoryCodes depuis un fichier de reference YAML
5. Import des 7 biens reels non-fixtures (reuse de `scripts/import-accommodations.ts`)
6. Upload des images depuis `public/images/accommodations/` en batch de 20

## Hors perimetre

- liaison images ↔ accommodations (`associatedMedia`, `image[]`) — task 012
- import des biens fixtures
- recadrage ou traitement d images
- gestion multi-environnement (dev vs prod)

## Architecture

### Structure des fichiers

```
scripts/bootstrap-data/
├── .state                          # gitignored — ORG_ID, PROJECT_ID
├── 01-create-org.sh
├── 02-create-project.sh
├── 03-create-users.sh
├── 04-seed-category-codes.sh
├── 05-import-accommodations.sh     # wrapper vers bun scripts/import-accommodations.ts
├── 06-upload-images.sh
├── category-codes.yaml             # source de verite des codes a seeder
└── README.md
```

### Variables d environnement requises (`.env`)

```env
SYMFONY_API_URL=http://localhost:18080

# Compte admin plateforme (ROLE_SUPER_ADMIN) — meme compte que import-accommodations.ts
SYMFONY_SERVICE_EMAIL=<admin-email>
SYMFONY_SERVICE_PASSWORD=<admin-password>

# Passwords des membres crees a l etape 03
BOOTSTRAP_JOHAN_PASSWORD=<password>
BOOTSTRAP_CAROLINE_PASSWORD=<password>
```

`SYMFONY_PROJECT_ID` n est pas requis au demarrage — genere dynamiquement par l etape 02
et stocke dans `.state`.

### Passage d etat entre scripts

Chaque script :
1. source `.env` pour les variables de connexion
2. lit `scripts/bootstrap-data/.state` pour les IDs generes (ORG_ID, PROJECT_ID)
3. ecrit dans `.state` apres creation reussie

Le fichier `.state` est gitignored. Le supprimer pour repartir de zero.

### Idempotence

En cas d existence detectee (HTTP 409 ou slug deja pris), le script lit l ID existant
et continue sans erreur. Toutes les etapes sont rejouables apres interruption.

## Detail des etapes

### 01 — Creation organisation

```
POST {SYMFONY_API_URL}/api/organizations
{ "name": "MLK - My Little Kasbah" }
```

Ecrit `ORG_ID` dans `.state`.

### 02 — Creation projet

```
POST {SYMFONY_API_URL}/api/projects
{
  "organization": "/api/organizations/{ORG_ID}",
  "name": "MLK - Modern Site Web",
  "sourceLocale": "fr",
  "enabledLocales": ["fr", "en"]
}
```

Ecrit `PROJECT_ID` dans `.state`.

### 03 — Ajout des utilisateurs

```
POST {SYMFONY_API_URL}/api/projects/{PROJECT_ID}/members
{ "email": "johan.remy@graines-digitales.online", "password": "$BOOTSTRAP_JOHAN_PASSWORD",
  "projectRole": "owner", "roles": ["ROLE_ADMIN"] }

POST {SYMFONY_API_URL}/api/projects/{PROJECT_ID}/members
{ "email": "buzac@mlk-my-little-kasbah.immo", "password": "$BOOTSTRAP_CAROLINE_PASSWORD",
  "projectRole": "admin", "roles": ["ROLE_USER"] }
```

### 04 — Seed CategoryCodes

Fichier `category-codes.yaml` (source de verite) — a completer a l implementation en
scannant les champs `category`, `place`, `realEstateListing`, `amenityFeature` et `tags`
de tous les fichiers `content/fr/accommodations/*.md` :

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

Le script utilise `yq` pour iterer sur le YAML et POSTer chaque code. Les codes deja
existants (HTTP 409) sont ignores.

### 05 — Import accommodations

```bash
SYMFONY_PROJECT_ID="$PROJECT_ID" bun scripts/import-accommodations.ts
```

Pas de duplication de logique : tout le mapping frontmatter → payload reste dans le .ts.

### 06 — Upload images

Lecture de `public/images/accommodations/`, upload par batch de 20 via :

```
POST {SYMFONY_API_URL}/api/projects/{PROJECT_ID}/media-objects/bulk
Content-Type: multipart/form-data
files[]: <fichier1>  ...  files[]: <fichier20>
```

Log du nombre d images uploadees et des erreurs eventuelles.

## README du dossier

Documenter les prerequis (`yq`, `bun`, `.env` configure), l ordre d execution, comment
relancer une etape isolee et comment repartir de zero (supprimer `.state`).

## Contraintes

- aucun secret hardcode dans les scripts
- tous les passwords passent par des variables d env
- `.state` gitignore
- dry-run non requis (bootstrap one-shot, idempotent par design)
- compatible avec `set -euo pipefail`
