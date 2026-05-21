---
status: A faire
source: brief dashboard re-export markdown
dependances: 008-dashboard-sauvegarde-biens-api-symfony.md
---

# 009 Dashboard — Re-export Markdown apres sauvegarde

## Intention

Apres qu un bien est sauvegarde en base via l API Symfony (task 008), le site public
continue de lire depuis `content/fr/accommodations/*.md`. Pour que les modifications
du dashboard soient visibles sur le site sans changer le circuit de lecture public,
la route Nitro de sauvegarde doit aussi regenerer le fichier Markdown correspondant.

Le Markdown reste ainsi la source de verite pour le site public. La base PostgreSQL
devient la source de verite pour le CMS. Les deux restent synchronises a chaque Save.

## Perimetre

- apres un Save reussi dans Symfony, regenerer le fichier `.md` du bien dans
  `content/fr/accommodations/`
- reconstruire le frontmatter YAML a partir des donnees confirmees par Symfony (reponse PUT/POST)
- conserver le body Markdown existant (ou utiliser le body envoye dans le payload)
- ne pas modifier les biens dont `additionalProperty.dataSource = fixture`
- garantir l atomicite : si le write fichier echoue, retourner une erreur claire sans
  laisser la BDD et le fichier dans des etats incoherents

## Hors perimetre

- re-export des traductions EN/ES (V1 = locale FR uniquement)
- commit Git automatique apres write (hors perimetre V1)
- notification ou invalidation du cache Nuxt Content apres write
- creation ou suppression physique de fichiers Markdown
- migration du site public vers la lecture API (task future)

## Contraintes

- le write fichier se fait cote Nitro (acces direct au filesystem `content/`)
- SSR-safe : la regeneration ne se fait que cote serveur, jamais dans le navigateur
- le fichier existant est ecrase uniquement si le Save Symfony a reussi (HTTP 200/201)
- le format YAML du frontmatter regenere doit rester parseable par le loader Nuxt Content
  existant — ne pas modifier la structure, les cles ou l ordre des champs attendus

## Architecture

### Flux complet (task 008 + task 009)

```
Save click
  └─ Nitro PUT /api/dashboard/accommodations/[identifier]
       ├─ 1. requireUserSession
       ├─ 2. getSymfonyServiceToken()
       ├─ 3. getCategoryCodeMap() + getAccommodationUuidMap()   ← cache
       ├─ 4. mapToApiPlatform(payload, locale, cache)
       ├─ 5. POST ou PUT Symfony → reponse confirme les donnees persistees
       ├─ 6. mapToMarkdown(symfonyResponse, body)               ← TASK 009
       │       └─ writeFile content/fr/accommodations/[slug].md
       └─ 7. retourne { success, markdownUpdated, data, error }
```

### Mapper retour (server/utils/dashboard/markdownExporter.ts)

`exportToMarkdown(symfonyAccommodation, body, filePath)` :

- reconstruit le frontmatter YAML depuis la reponse Symfony normalisee
- inverse les IRIs CategoryCode vers leurs codes (`/api/.../uuid` → `code`)
  en utilisant le cache referentiels deja charge
- recompose le bloc `offer` (`offerPrice`, `offerPriceCurrency`, `offerPriceSpecification`)
- preserve les champs non mappables en Symfony (`additionalProperty`, `image[]`)
  en les lisant depuis le fichier existant avant d ecraser
- ecrit le body Markdown tel que recu (issu de Tiptap)
- utilise `js-yaml` (deja present via Nuxt Content) pour serialiser le frontmatter

### Preservation des champs non geres par Symfony

Avant d ecrire, lire le fichier existant et recuperer :

- `additionalProperty` (non present en BDD)
- `image[]` (non gere en task 008)
- tout champ present dans le fichier mais absent du mapper

Ces champs sont reinjectes tels quels dans le nouveau frontmatter.

### Gestion des erreurs

Si le write fichier echoue apres un Save Symfony reussi :

- logger l erreur cote serveur
- retourner `{ success: true, markdownUpdated: false, error: 'markdown_write_failed' }`
- ne pas rollback le Save Symfony (la BDD est la source de verite)
- afficher un avertissement dans l UI : "Sauvegarde BDD reussie — fichier local non mis a jour"

## Etapes

### 1. Utilitaire markdownExporter (server/utils/dashboard/markdownExporter.ts)

- implementer `exportToMarkdown(symfonyData, body, existingFilePath)`
- inverser les IRIs en codes via le cache referentiels
- reconstruire le frontmatter en respectant l ordre des cles du fichier source
- preserver les champs absents de Symfony (lus depuis le fichier existant)
- ecrire le fichier via `node:fs/promises`

### 2. Integration dans la route Nitro PUT

- apres le PUT/POST Symfony reussi, appeler `exportToMarkdown`
- ne pas bloquer la reponse si le write echoue — retourner `markdownUpdated: false`

### 3. Invalidation du cache et refresh dashboard

Apres le write fichier reussi :

- appeler `GET /api/dashboard/accommodations?refresh=1` pour invalider le cache Nitro 30s
- le composable `useDashboardAccommodations` recharge la liste — le dashboard affiche
  les donnees a jour sans rechargement de page

Le site public (SSR) relit les Markdown a chaque requete HTTP — il n a pas besoin
d invalidation explicite. Les modifications sont visibles des la prochaine visite.

### 5. Gestion du retour UI

- `useDashboardSave` expose `markdownUpdated` en plus de `saving/error/lastSavedAt`
- si `markdownUpdated: false`, afficher un avertissement discret en plus du succes BDD

### 6. Valider

- verifier que le fichier regenere est parseable par Nuxt Content
- verifier que les champs `additionalProperty` et `image[]` sont preserves
- verifier le comportement si le fichier n existe pas encore (nouveau bien)
- verifier type-check et lint sur les fichiers touches

## Criteres d acceptation

- apres un Save dashboard, le fichier `.md` du bien est mis a jour dans `content/`
- le frontmatter regenere est valide YAML et parseable par le loader existant
- les champs non geres par Symfony (`additionalProperty`, `image[]`) sont preserves
- si le write fichier echoue, la BDD reste coherente et l UI indique l anomalie
- les biens fixtures (`dataSource = fixture`) ne sont pas touches
- le site public affiche les modifications apres un rechargement (sans rebuild)

## Points de vigilance

- **Ordre des cles YAML** : Nuxt Content n impose pas d ordre, mais les humains lisent
  les fichiers — conserver un ordre stable et lisible (identifier, name, category, place,
  offer, surfaces, media, tags, meta, body).
- **Encodage** : s assurer que l export UTF-8 est correct pour les caracteres accentues
  des labels et descriptions.
- **Atomicite partielle** : il n y a pas de transaction fichier/BDD. La BDD prime.
  Documenter cette limite clairement dans le retour API.
- **Nouveau bien** : si le bien n existe pas encore en fichier (cree depuis le dashboard),
  creer le fichier avec un nom derive du slug Symfony.
- **js-yaml vs serialisation manuelle** : preferer `js-yaml` pour garantir le format YAML
  valide, en particulier pour les chaines avec caracteres speciaux.
