---
status: Todo
---

# 022 Script `content-sync` — pull API → fichiers content

## Intention

Fournir une commande `make content-sync` qui récupère les données de l'API Symfony et les écrit
dans les fichiers content du projet (`accommodations/` et `metadata/`), pour toutes les locales
disponibles. Ce script est **pull-only** et coexiste avec l'actuel `import-accommodations.ts`
(qui reste le canal push, content → API).

## Contexte

Aujourd'hui, les fichiers `content/{locale}/` sont la source éditoriale locale :

- `accommodations/` — fiches bien au format Markdown + frontmatter YAML
- `metadata/category-code.yaml` — référentiel des codes catégorie (CategoryCode)
- `metadata/media-object.yaml` — référentiel des médias (MediaObject)

L'API Symfony est la source de vérité applicative. Après une modification faite depuis le dashboard
ou l'API directement, les fichiers locaux deviennent obsolètes. `content-sync` les remet à jour.

Le script `scripts/import-accommodations.ts` fait l'inverse (push) : il envoie les données des
fichiers Markdown vers l'API. Les deux coexistent — ils ont des périmètres opposés.

## Objectif

Créer `scripts/content-sync.ts` qui :

1. Lit la configuration depuis `.env` (variables `SYMFONY_*`)
2. S'authentifie via JWT (`/api/auth/login`)
3. Pour chaque locale disponible (`fr`, `en`, `es` depuis `shared/i18n/config.ts`) :
   - Tire les accommodations `GET /api/projects/{id}/accommodations?locale={locale}&pagination=false`
     → écrit ou remplace les `.md` dans `content/{locale}/accommodations/`
   - Tire les category-codes `GET /api/projects/{id}/category-codes?pagination=false`
     → écrit `content/{locale}/metadata/category-code.yaml`
   - Tire les media-objects `GET /api/projects/{id}/media-objects?pagination=false`
     → écrit `content/{locale}/metadata/media-object.yaml`

Ajouter la target `content-sync` (et variante `content-sync-dry`) dans le Makefile.

## Périmètre

**Inclus**

- `scripts/content-sync.ts` (nouveau fichier standalone, pas de dépendance Vue/Nuxt/Pinia)
- Mapper API response → frontmatter YAML + body Markdown pour les accommodations
- Mapper API response → items YAML pour category-code et media-object
- Support de toutes les locales de `shared/i18n/config.ts` — boucle sur les clés
- Flag `--dry-run` : affiche ce qui serait écrit sans toucher le disque
- Flag `--locale=fr` : restreindre la sync à une locale
- Targets Makefile : `content-sync` + `content-sync-dry`
- Entrée dans l'aide `make help`

**Exclu**

- `web-pages/` — contenu éditorial non géré par l'API
- `ui/` — configuration UI locale, hors sync
- Push vers l'API — géré par `import-accommodations.ts`
- Création de nouveaux media-objects via upload
- Traitement des fixtures — les fixtures sont locales, l'API ne les connaît pas

## Contraintes

- Script standalone : lire `.env` via `dotenv`, pas de `useRuntimeConfig()`
- Zéro import depuis `app/`, `server/`, composables ou stores Nuxt
- Les types utilisables : `schemas/interfaces/` (types partagés framework-agnostic)
- La liste des locales doit être importée depuis `shared/i18n/config.ts` (pas hardcodée)
- Comportement idempotent : relancer la sync produit le même résultat
- Écriture atomique : ne pas laisser de fichier partiellement écrit

## Mapping API → content

### accommodations → `{slug}.md`

Format cible identique aux fichiers existants dans `content/fr/accommodations/`.
Mapping vérifié sur une vraie réponse API.

| Champ API (GET response)                               | Frontmatter content                                               |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| `identifier`                                           | `identifier`                                                      |
| `slug`                                                 | `slug`                                                            |
| `name`                                                 | `name`                                                            |
| `label`                                                | `label` (si non null)                                             |
| `highlight`                                            | `highlight` (si non null)                                         |
| `category` (string codeValue)                          | `category: "local-commercial"` — direct, pas d'objet              |
| `realEstateListing` (string codeValue)                 | `realEstateListing: "bien-a-vendre"` — direct                     |
| `place` (string codeValue)                             | `place: "nouvelle-ville"` — direct                                |
| `amenityFeature[]` (string[] codeValues)               | `amenityFeature: ["alarme", ...]` — direct                        |
| `tags[]` (string[] codeValues)                         | `tags: ["commerce", ...]` — direct                                |
| `offer.price`, `.priceCurrency`, `.priceSpecification` | `offer: { price, priceCurrency, priceSpecification }`             |
| `floorSize`, `landArea`, `areaSize`, `areaTerrace`     | identiques (string ou null)                                       |
| `yearBuilt`, `numberOfRooms`, `numberOfBedrooms`, etc. | identiques (integer ou null)                                      |
| `associatedMedia[].mediaObject` (UUID string) ⚠️       | `associatedMedia[].image: "filename-sans-extension"`              |
| `associatedMedia[].caption`, `.keywords`               | identiques                                                        |
| `associatedMedia[].position`                           | ordre de la liste (tri par `position` croissant)                  |
| `status` (`published`/`draft`/`archived`)              | `isActive: true` si `status === "published"`, sinon `false`       |
| `createdAt`                                            | `dateCreated`                                                     |
| `updatedAt`                                            | `dateModified`                                                    |
| `body` (HTML depuis l'API)                             | corps après le frontmatter — écrire tel quel (HTML valide en MDC) |
| `metaTitle`, `metaDescription`                         | identiques (si non null)                                          |
| `review`                                               | `review` (si non null)                                            |
| `locationDescription`                                  | `locationDescription` (si non null)                               |

**Locale** : appel avec `?locale={locale}`, les champs translatables (`slug`, `name`, etc.) sont
déjà dans la bonne langue dans la réponse principale. Ne pas parser `translations[]`.

**`category`, `place`, `realEstateListing`, `amenityFeature[]`, `tags[]`** : l'API retourne
directement des strings (codeValues), pas des objets. Copie directe, aucune extraction.

**`offer`** : objet `{ price, priceCurrency, priceSpecification }` dans la réponse (le schéma
OpenAPI montrait `array` par erreur). Copie directe.

**`associatedMedia[].mediaObject` ⚠️** : l'API retourne un UUID string (ex:
`"019e6a67-81eb-7b58-aad4-4cf68406f298"`), pas un objet. Mais le content file attend le
`originalFilename` sans extension (ex: `"media-bavlc001-local-commercial-01"`). Il faut donc
construire une map `UUID → originalFilename` depuis l'endpoint media-objects **avant** de mapper
les accommodations, puis effectuer la résolution. Si le UUID n'est pas dans la map, loguer un
warn et omettre l'entrée.

**`isActive`** : absent de la réponse API. Le dériver du champ `status` :
`isActive = status === "published"`.

**`body`** : l'API retourne du HTML (`<p>...</p>`). Nuxt Content/MDC accepte du HTML dans les
fichiers `.md`. Écrire tel quel sans conversion.

### category-codes → `category-code.yaml`

Schéma source : `CategoryCode.jsonld-read`.

```yaml
items:
  - codeValue: <codeValue> # clé machine
    name: <label> # label traduit (champ "label" de l'API, pas "name")
    inCodeSet: <inCodeSet>
```

Le champ `text` (description longue) n'est pas exposé par l'API — l'omettre.

### media-objects → `media-object.yaml`

Schéma source : `MediaObject.jsonld-read`.

```yaml
items:
  - identifier: <id> # UUID Symfony (champ "id")
    caption: <caption>
    url: <contentUrl> # URL publique du fichier
    mainEntity: ImageObject # valeur fixe ou champ "mainEntity" si présent
```

## Architecture du script

Calquer la structure de `scripts/import-accommodations.ts` :

```
scripts/content-sync.ts
├── Config (dotenv + CLI flags)
├── Types (réponses Hydra, pas de dépendance Nuxt)
├── Auth (fetchToken)
├── Fetchers (accommodations, categoryCode, mediaObjects)
├── Mappers (API response → frontmatter object + body string)
├── Writers (markdown serializer, YAML serializer)
└── main()
```

La sérialisation Markdown utilise `YAML.stringify(frontmatter)` comme dans
`server/utils/dashboard/markdownExporter.ts`.

## Makefile

Ajouter dans `Makefile.dev` :

```makefile
content-sync:
	bun scripts/content-sync.ts

content-sync-dry:
	bun scripts/content-sync.ts --dry-run
```

Ajouter les entrées correspondantes dans `make help` (Makefile principal).

## Points de vigilance

- **Résolution mediaObject UUID** : `associatedMedia[].mediaObject` est un UUID string. La map
  UUID → originalFilename doit être construite en amont depuis l'endpoint media-objects. Si un
  UUID est absent de la map, loguer un warn et sauter l'entrée (ne pas bloquer le script).
- **`isActive` dérivé** : absent de la réponse, à dériver de `status === "published"`.
- **`body` HTML** : Nuxt Content/MDC accepte le HTML dans les `.md`. Ne pas convertir en Markdown.
- **Pagination** : `?pagination=false` sur tous les endpoints. Si la collection est vide alors
  qu'elle ne devrait pas l'être, logguer un warn (potentielle erreur de config PROJECT_ID).
- **Ordre des clés YAML** : utiliser un objet ordonné explicite dans le mapper (pas l'ordre
  d'arrivée de l'API) pour un diff git minimal.
- **Nom du fichier `.md`** : `{slug}.md`. Fallback sur `{identifier.toLowerCase()}.md`.
- **Caractères spéciaux** : `YAML.stringify` gère l'échappement.
- **Écriture safe** : `writeFile` (node:fs/promises), pas `writeFileSync`.

## Étapes suggérées

1. Alimenter l'API avec `bun scripts/import-accommodations.ts` pour avoir des données réelles
   à inspecter (la base était vide lors de l'analyse swagger)
2. Vérifier une vraie réponse GET pour confirmer le champ `offer` (flat fields ou objet)
3. Créer `scripts/content-sync.ts` avec l'architecture décrite
4. Implémenter les fetchers + mappers pour les 3 types de ressources
5. Tester en `--dry-run` sur `fr` uniquement avant d'écrire sur le disque
6. Comparer un fichier écrit par la sync avec le fichier existant (diff git attendu minimal)
7. Itérer sur les autres locales (`en`, `es`)
8. Ajouter les targets Makefile et l'entrée `make help`
