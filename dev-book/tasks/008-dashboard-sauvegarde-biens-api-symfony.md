---
status: Terminé
source: brief dashboard sauvegarde biens
---

# 008 Dashboard — Sauvegarde des biens via l API Symfony

## Intention

Brancher l editeur dashboard MLK sur l API Symfony 8 / API Platform pour persister les
modifications de biens immobiliers en base PostgreSQL.

La task 007 a produit un editeur read-only avec un payload local pret. Cette task cible
le circuit d ecriture complet : Save dans l editeur → route Nitro proxy → API Symfony → BDD.

Le site public continue de lire depuis `content/fr/accommodations/*.md`. Le dashboard
lit toujours depuis les Markdown en V1 ; seule la sauvegarde passe par Symfony.

## Perimetre

### Cote Nuxt (mlk-my-little-kasbah)

- creer un script d import `scripts/import-accommodations.ts` qui :
  - lit les 7 biens reels (filtre : absence de `additionalProperty.dataSource = fixture`)
  - extrait et cree les CategoryCodes necessaires via l API Symfony
  - cree ou met a jour les 7 biens via l API Symfony
- ajouter un bouton Save dans le slideover editeur avec retour visuel (idle / saving / success / error)
- creer un composable `useDashboardSave` qui construit le payload et appelle la route Nitro
- creer un mapper `DashboardAccommodation` → payload API Platform (creation et mise a jour)
- creer les routes Nitro serveur :
  - `PUT /api/dashboard/accommodations/[identifier]` — upsert par identifier (cree si absent)
- implementer l auth bridge cote serveur : JWT de service Symfony cache en memoire Nitro avec
  refresh automatique a expiration
- charger et cacher au premier appel les deux referentiels Symfony necessaires au mapper :
  - `CategoryCode` → map `{ inCodeSet: { code: IRI } }`
  - `Accommodation` → map `{ identifier: uuid }` pour l upsert
- exposer les variables d env serveur necessaires sans les passer au client

### Cote Symfony (api/symfony-8-api-platform)

- ajouter `locationDescription` dans `AccommodationTranslation` (champ absent mais present
  dans tous les Markdown — perte de donnee si non ajoute) et generer la migration Doctrine

## Hors perimetre

- import des biens fixtures (ceux avec `additionalProperty.dataSource = fixture`)
- upload ou modification de medias
- sauvegarde de `associatedMedia` et `image[]` (necessite des IRIs MediaObject inexistants en BDD)
- sauvegarde de `additionalProperty` (absent de l entite Symfony)
- traductions automatiques
- suppression ou creation reelle de biens depuis le dashboard
- gestion multi-projet cote UI (MLK est mono-projet sur cette task)
- changement du circuit de lecture public (toujours Markdown)
- re-export du bien sauvegarde en fichier Markdown (task 009)

## Contraintes produit et techniques

- le JWT de service Symfony ne doit jamais etre expose au client navigateur
- tous les appels vers Symfony passent par des routes Nitro protegees par `requireUserSession`
- le `projectId` Symfony est une variable d env serveur Nuxt (`SYMFONY_PROJECT_ID`)
- l absence de sauvegarde reste la situation stable si les variables d env ne sont pas
  configurees — afficher une erreur claire, pas un crash silencieux
- SSR-safe : le composable `useDashboardSave` n est actif que cote client
- aucune regression sur le site public ni sur l authentification dashboard

## Architecture

### Variables d env (serveur uniquement — jamais exposees au client)

```env
SYMFONY_API_URL=http://localhost:18080
SYMFONY_PROJECT_ID=<uuid-projet-mlk>
SYMFONY_SERVICE_EMAIL=<compte-service>
SYMFONY_SERVICE_PASSWORD=<mot-de-passe-service>
```

Ces variables doivent etre ajoutees a `.env.example` avec des valeurs placeholder.
Ne jamais les passer dans `runtimeConfig.public`.

### Script d import (scripts/import-accommodations.ts)

Script Bun one-shot a executer manuellement avant la mise en production.

**Filtre des biens a importer** : absence de `additionalProperty.dataSource = fixture`
→ 7 biens identifies : BAVLC001, BAVLC002, BAVMC001, BAVR001, BAVT001, BAVT002, BAVT003

**CategoryCodes a creer par inCodeSet** (upsert par `inCodeSet + code`) :

| inCodeSet              | codes                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| `accommodation-type`   | `local-commercial`, `maison-de-campagne`, `riad`, `terrain`            |
| `real-estate-listing`  | `bien-a-vendre`                                                        |
| `accommodation-place`  | `medina`, `nouvelle-ville`, `sidi-kaouki`, `campagne`, `campagne-d-essaouira`, `moulay-bouzerktoun` |
| `amenity-feature`      | `vue-sur-mer`, `gardien`, `chateau-d-eau`, `acces-route`, `patio`, `terrasse`, `exploitation-commerciale`, `vue-degagee` |
| `tag`                  | `medina`, `commerce`, `piscine`, `investissement`, `bien-titre`, `hotel`, `terrain`, `campagne` |

**Attention** : `bavr001` contient des entrees `image:` parasites dans `amenityFeature`
(bug de contenu). Le script doit filtrer toute entree qui n est pas une chaine simple
(format `- codeValue` vs `- image: uuid`).

**Ordre d execution** :
1. Authentification → JWT service
2. Upsert des CategoryCodes (tous les inCodeSet) → cache local `{ inCodeSet: { code: IRI } }`
3. Upsert des 7 accommodations en boucle :
   - POST si absent (lookup par identifier dans la liste courante)
   - PUT si present

Le script lit les labels depuis les YAML de contenu (`accommodation-category.yaml`,
`accommodation-place.yaml`, `real-estate-listing.yaml`, `category-code.yaml`) pour peupler
les champs de traduction des CategoryCodes.

### Flux de sauvegarde

```
Client (dashboard)
  └─ useDashboardSave.save(accommodation, locale)
       └─ PUT /api/dashboard/accommodations/[identifier]   ← Nitro route
            ├─ requireUserSession(event)                   ← session Google obligatoire
            ├─ getSymfonyServiceToken()                    ← JWT cache memoire Nitro (TTL 800s)
            ├─ getSymfonyCache()                           ← cache referentiels Nitro
            │    ├─ GET /projects/{projectId}/category-codes  → { inCodeSet: { code: IRI } }
            │    └─ GET /projects/{projectId}/accommodations  → { identifier: uuid }
            ├─ mapToApiPlatform(payload, locale, cache)    ← mapper
            ├─ si identifier absent du cache → POST ?locale={locale}
            │  si identifier present        → PUT /{uuid}  ?locale={locale}
            └─ retourne { success, data, error }
```

### JWT TTL

Symfony est configure avec `JWT_TOKEN_TTL=900` (15 min).
Le cache Nitro utilise un TTL de 800s pour eviter d appeler avec un token expire.

### Cache referentiels Nitro (server/utils/dashboard/symfonyCache.ts)

Cache module-level avec TTL configurable (defaut 300s, invalidation manuelle possible) :

- `getCategoryCodeMap(token)` : `{ [inCodeSet]: { [code]: IRI } }`
  - alimente depuis `GET /projects/{projectId}/category-codes`
- `getAccommodationUuidMap(token)` : `{ [identifier]: uuid }`
  - alimente depuis `GET /projects/{projectId}/accommodations`

Les `inCodeSet` utilises dans le mapper :

| Champ Accommodation     | inCodeSet              |
| ----------------------- | ---------------------- |
| `category`              | `accommodation-type`   |
| `realEstateListing`     | `real-estate-listing`  |
| `place`                 | `accommodation-place`  |
| `amenityFeature[]`      | `amenity-feature`      |
| `tags[]`                | `tag`                  |

### Mapper (server/utils/dashboard/accommodationMapper.ts)

`mapToApiPlatform(accommodation, locale, cache)` → payload Symfony.

Transformations non triviales :

| Champ frontmatter              | Champ Symfony               | Transformation                         |
| ------------------------------ | --------------------------- | -------------------------------------- |
| `offer.price` (number)         | `offerPrice` (string)       | `String(value)`                        |
| `floorSize` (number)           | `floorSize` (string)        | `String(value)`                        |
| `landArea` (number)            | `landArea` (string)         | `String(value)`                        |
| `category` (code)              | `category` (IRI)            | lookup `accommodation-type`            |
| `realEstateListing` (code)     | `realEstateListing` (IRI)   | lookup `real-estate-listing`           |
| `place` (code)                 | `place` (IRI)               | lookup `accommodation-place`           |
| `amenityFeature[]` (codes)     | `amenityFeature` (IRIs)     | lookup `amenity-feature`               |
| `tags[]` (codes)               | `tags` (IRIs)               | lookup `tag`                           |
| `realEstateAgent` (UUID)       | `realEstateAgentIdentifier` | direct ; autres champs via `person.yaml` |
| `slug`, `name`, `body`, etc.   | translation `?locale=fr`    | envoyes dans le body, locale en query  |
| `locationDescription`          | translation `?locale=fr`    | apres ajout du champ dans Symfony      |
| `associatedMedia`, `image[]`   | —                           | **non envoyes** (hors perimetre)       |
| `additionalProperty`           | —                           | **ignore**                             |
| `dateCreated`, `dateModified`  | audit trail Symfony         | **non envoyes** (gere par Symfony)     |

La locale est transmise via le query param `?locale=fr` sur chaque appel Symfony
(lu par `LocaleResolver` dans le backend).

### Route Nitro (server/api/dashboard/accommodations/[identifier].put.ts)

- protegee par `requireUserSession`
- lit `identifier` depuis les params de route et le body JSON
- orchestre : auth → cache → mapper → upsert Symfony
- normalise les erreurs `application/problem+json` de Symfony avant de repondre

### Composable (app/composables/dashboard/useDashboardSave.ts)

- `save(accommodation, locale)` → `{ saving, error, lastSavedAt }`
- appelle `$fetch('PUT', /api/dashboard/accommodations/${identifier}, { body: payload })`
- expose les etats reactifs utilises par le bouton Save

### Composant bouton Save

Integre dans `PropertyEditorSlideover.vue` :

- bouton `Sauvegarder` visible en pied de slideover
- spinner pendant l envoi
- badge vert "Sauvegarde" sur succes, disparaissant apres 3s
- message d erreur inline sur echec, non bloquant et dismissable

## Etapes

### 1. Symfony — ajouter locationDescription dans AccommodationTranslation

Repo : `api/symfony-8-api-platform`

Repo : `api/symfony-8-api-platform`

- ajouter le champ `locationDescription` (`text, nullable`) dans `AccommodationTranslation.php`
- ajouter le getter/setter
- generer et appliquer la migration Doctrine :
  ```bash
  docker compose exec api php bin/console doctrine:migrations:diff
  docker compose exec api php bin/console doctrine:migrations:migrate --no-interaction
  ```

### 2. Variables d env Nuxt

- ajouter `SYMFONY_API_URL`, `SYMFONY_PROJECT_ID`, `SYMFONY_SERVICE_EMAIL`,
  `SYMFONY_SERVICE_PASSWORD` dans `.env.example` avec placeholders
- ajouter dans `nuxt.config.ts` sous `runtimeConfig` (pas `runtimeConfig.public`)

### 3. Utilitaire auth JWT (server/utils/dashboard/symfonyAuth.ts)

- `getSymfonyServiceToken()` : cache module-level, TTL 800s, appel `POST /api/auth/login`
- si `SYMFONY_API_URL` absent → throw explicite

### 4. Cache referentiels (server/utils/dashboard/symfonyCache.ts)

- `getCategoryCodeMap(token)` : GET category-codes, construit la map `inCodeSet → code → IRI`
- `getAccommodationUuidMap(token)` : GET accommodations, construit la map `identifier → uuid`
- TTL 300s, invalide sur ?refresh=1

### 5. Mapper (server/utils/dashboard/accommodationMapper.ts)

- implementer toutes les transformations du tableau ci-dessus
- lookup `person.yaml` pour resoudre `realEstateAgent` UUID → champs agent
- exclure silencieusement `associatedMedia`, `image[]`, `additionalProperty`

### 6. Route Nitro PUT/upsert

- creer `server/api/dashboard/accommodations/[identifier].put.ts`
- orchestrer auth → cache → mapper → POST ou PUT Symfony selon presence dans uuid map
- retourner les erreurs normalisees

### 7. Composable useDashboardSave

- creer `app/composables/dashboard/useDashboardSave.ts`
- exposer `save`, `saving`, `error`, `lastSavedAt`

### 8. Bouton Save dans l editeur

- integrer dans `PropertyEditorSlideover.vue`
- etats visuels : idle / saving / success / error
- pas de fermeture automatique du slideover sur succes

### 8b. Stub UI traduction (preparation task 013)

- ajouter un badge de statut sur chaque tab de langue (FR / EN / ES) dans le switcher :
  - `source` : locale principale (FR), toujours remplie
  - `traduit` : traduction existante en BDD
  - `vide` : traduction absente ou inexistante
  - `modifie` : traduction editee manuellement depuis la derniere traduction automatique
- ajouter un bouton "Traduire" dans la top bar du slideover, visible mais desactive
  (`disabled`, tooltip : "Traduction automatique — disponible prochainement")
- le statut par locale est derive de la reponse Symfony (champ `translations` dans
  la reponse GET/PUT — presence et contenu de chaque `AccommodationTranslation`)
- aucun appel de traduction dans cette task — UI preparatoire uniquement

### 9. Script d import (scripts/import-accommodations.ts)

- creer le script Bun qui lit les YAML de reference + les 7 Markdown reels
- implementer l upsert CategoryCodes → upsert Accommodations
- filtrer les entrees `image:` parasites dans `amenityFeature` (bug bavr001)
- executer et verifier en environnement local :
  ```bash
  SYMFONY_API_URL=... SYMFONY_PROJECT_ID=... SYMFONY_SERVICE_EMAIL=... SYMFONY_SERVICE_PASSWORD=... \
  bun run scripts/import-accommodations.ts
  ```
- verifier les 7 biens et leurs CategoryCodes dans la BDD Symfony

### 10. Valider et documenter

- verifier type-check, lint sur les fichiers touches
- documenter les variables d env dans `.env.example`
- documenter la commande d import dans le README ou le dev-book

## Criteres d acceptation

- un clic Save dans l editeur dashboard persiste le bien en base PostgreSQL via Symfony
- la route Nitro rejette les appels sans session Google valide (401)
- le JWT de service Symfony n apparait jamais dans le code client ni dans les reponses HTTP
- l UI indique clairement l etat de sauvegarde (saving / success / error)
- un bien absent de Symfony est cree automatiquement au premier Save
- un bien existant est mis a jour au Save suivant
- le site public conserve son comportement actuel (lecture Markdown inchangee)
- `bun run type-check` passe sur les fichiers touches

## Points de vigilance

- **Securite** : JWT de service strictement serveur. Ne jamais passer `SYMFONY_*` dans
  `runtimeConfig.public`. Verifier que les routes Nitro rejettent bien les appels sans session.
- **SearchFilter inutile** : le `ProjectScopedCollectionProvider` bypasse le mecanisme de filtre
  API Platform (il fait un `findBy` brut). Ne pas ajouter `#[ApiFilter]` sur `identifier` — ca
  ne fonctionnerait pas. La resolution identifier → UUID se fait cote Nitro via le cache memoire.
- **JWT TTL = 900s** : le cache Nitro doit utiliser un TTL < 900s (800s recommande) pour eviter
  d appeler Symfony avec un token expire entre deux requetes.
- **locationDescription** : ce champ est present dans tous les Markdown mais absent de
  `AccommodationTranslation`. L etape 1 (migration Symfony) est un prerequis bloquant pour que
  la sauvegarde soit complete — ne pas coder le mapper avant que le champ existe en BDD.
- **associatedMedia / image[]** : exclus du perimetre. Le mapper les ignore silencieusement.
  Aucun message d erreur ni avertissement UI ne doit laisser croire que les medias sont sauvegardes.
- **Erreurs Symfony** : API Platform retourne du `application/problem+json`. Normaliser avant
  d exposer au client pour eviter les fuites de stack trace PHP.
- **person.yaml comme source** : la resolution `realEstateAgent UUID → champs agent` lit
  `content/fr/person.yaml` cote serveur Nitro. Ce fichier est stable mais pas en BDD — acceptable
  pour V1, a noter comme dette si le referentiel agents migre vers Symfony.
- **Cache referentiels** : si un code CategoryCode est absent du cache (nouveau code cree apres
  le dernier refresh), le mapper doit lever une erreur claire plutot que d envoyer un payload
  invalide a Symfony.
- **Bug bavr001 amenityFeature** : le fichier Markdown contient des entrees `- image: uuid`
  melangees aux codes d amenite. Le script d import ET le mapper doivent filtrer toute entree
  qui n est pas une chaine scalaire simple.
- **Script import one-shot** : le script doit etre idempotent (upsert, pas insert brut) pour
  pouvoir etre rejoue sans doublon si les donnees evoluent.
