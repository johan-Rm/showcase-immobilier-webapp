---
status: À faire
dependances: []
---

# 020 — Résolution des IRIs côté client (dashboard)

> **Pour les agents:** Utiliser `superpowers:subagent-driven-development` ou
> `superpowers:executing-plans` pour exécuter ce plan tâche par tâche.

**Goal:** Le client résout les IRIs Symfony depuis le store avant d'envoyer le payload de
sauvegarde. Le BFF ne fait plus de GET Symfony pour les category codes.

**Architecture:** Un nouvel endpoint BFF `GET /api/dashboard/category-codes` expose les
IRIs Symfony. Le store metadata stocke un `irisMap`. Le composable `useDashboardSave`
enrichit le payload avec les IRIs résolues avant l'envoi. Le mapper BFF utilise ces IRIs
directement — la logique de résolution disparaît du serveur.

**Tech Stack:** Nuxt 4, Nitro, Pinia, TypeScript strict

---

## Fichiers impactés

| Fichier                                                   | Action   |
| --------------------------------------------------------- | -------- |
| `server/api/dashboard/category-codes.get.ts`              | Créer    |
| `server/api/dashboard/accommodations/[identifier].put.ts` | Modifier |
| `server/utils/dashboard/accommodationMapper.ts`           | Modifier |
| `server/utils/dashboard/symfonyCache.ts`                  | Modifier |
| `server/api/dashboard/category-codes.post.ts`             | Modifier |
| `shared/types/dashboardAccommodation.ts`                  | Modifier |
| `app/stores/metadata.ts`                                  | Modifier |
| `app/composables/useMetadata.ts`                          | Modifier |
| `app/composables/dashboard/useDashboardSave.ts`           | Modifier |
| `app/pages/dashboard/index.vue`                           | Modifier |

---

## Tâche 1 — BFF : endpoint GET category-codes

**Fichier :** `server/api/dashboard/category-codes.get.ts` (créer)

- [ ] Créer le fichier avec ce contenu :

```typescript
import { getSymfonyServiceToken } from '../../utils/dashboard/symfonyAuth'

type SymfonyCategoryCode = { '@id': string; code: string; inCodeSet: string }
type HydraCollection<T> = { 'hydra:member': T[] }

export type DashboardCategoryCodeIri = {
  iri: string
  code: string
  inCodeSet: string
}

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

export default defineEventHandler(async (event): Promise<DashboardCategoryCodeIri[]> => {
  await requireUserSession(event)

  const { apiUrl, projectId } = getApiBase()
  const token = await getSymfonyServiceToken()

  const response = await $fetch<HydraCollection<SymfonyCategoryCode>>(
    `${apiUrl}/api/projects/${projectId}/category-codes`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/ld+json',
      },
      query: { pagination: false, locale: 'fr' },
    },
  )

  return (response['hydra:member'] ?? []).map((item) => ({
    iri: item['@id'],
    code: item.code,
    inCodeSet: item.inCodeSet,
  }))
})
```

- [ ] Vérifier que l'endpoint répond (après rebuild) :

  ```
  GET /api/dashboard/category-codes
  ```

  Attendu : tableau JSON `[{ iri, code, inCodeSet }]`

- [ ] Commit :
  ```bash
  git add server/api/dashboard/category-codes.get.ts
  git commit -m "feat(dashboard): expose GET category-codes BFF endpoint with Symfony IRIs"
  ```

---

## Tâche 2 — Store : ajouter irisMap

**Fichier :** `app/stores/metadata.ts`

- [ ] Ajouter `irisMap` dans `MetadataState` :

```typescript
type MetadataState = {
  // ... champs existants ...
  irisMap: Record<string, Record<string, string>>
}
```

- [ ] Initialiser dans `state()` :

```typescript
irisMap: {},
```

- [ ] Ajouter le getter `getIri` après les getters existants :

```typescript
getIri(state: MetadataState): (inCodeSet: string, code: string) => string | null {
  return (inCodeSet: string, code: string) =>
    state.irisMap[inCodeSet]?.[code] ?? null
},
```

- [ ] Ajouter l'action `setIrisMap` après les actions existantes :

```typescript
setIrisMap(items: Array<{ iri: string; code: string; inCodeSet: string }>): void {
  const map: Record<string, Record<string, string>> = {}
  for (const item of items) {
    if (!map[item.inCodeSet]) map[item.inCodeSet] = {}
    map[item.inCodeSet]![item.code] = item.iri
  }
  this.irisMap = map
},
```

- [ ] Ajouter `irisMap: {}` dans l'action `reset()` :

```typescript
reset(): void {
  // ... champs existants ...
  this.irisMap = {}
},
```

- [ ] Commit :
  ```bash
  git add app/stores/metadata.ts
  git commit -m "feat(dashboard): add irisMap to metadata store"
  ```

---

## Tâche 3 — useMetadata : charger les IRIs depuis le BFF

**Fichier :** `app/composables/useMetadata.ts`

- [ ] Ajouter `loadDashboardCategoryCodes` au type de retour :

```typescript
type UseMetadataReturn = {
  // ... existant ...
  loadDashboardCategoryCodes: () => Promise<void>
}
```

- [ ] Ajouter la fonction avant le `return` :

```typescript
const loadDashboardCategoryCodes = async (): Promise<void> => {
  const items = await $fetch<Array<{ iri: string; code: string; inCodeSet: string }>>(
    '/api/dashboard/category-codes',
  )
  store.setIrisMap(items)
}
```

- [ ] Ajouter `loadDashboardCategoryCodes` dans le `return` :

```typescript
return {
  // ... existant ...
  loadDashboardCategoryCodes,
}
```

- [ ] Commit :
  ```bash
  git add app/composables/useMetadata.ts
  git commit -m "feat(dashboard): add loadDashboardCategoryCodes to useMetadata"
  ```

---

## Tâche 4 — Dashboard page : déclencher le chargement des IRIs

**Fichier :** `app/pages/dashboard/index.vue`

- [ ] Localiser le bloc `useMetadata` existant (ligne ~41) et ajouter `loadDashboardCategoryCodes` :

```typescript
const { loadAccommodationForm, loadDashboardCategoryCodes } = useMetadata()
```

- [ ] Appeler `loadDashboardCategoryCodes()` dans le cycle de vie (après l'auth), en parallèle du chargement existant. Chercher le `onMounted` ou `useAsyncData` existant et ajouter :

```typescript
await loadDashboardCategoryCodes()
```

- [ ] Vérifier dans le navigateur que le store `irisMap` est peuplé après chargement du dashboard.

- [ ] Commit :
  ```bash
  git add app/pages/dashboard/index.vue
  git commit -m "feat(dashboard): load Symfony IRIs map on dashboard init"
  ```

---

## Tâche 5 — Type : ajouter resolvedIris au payload de sauvegarde

**Fichier :** `shared/types/dashboardAccommodation.ts`

- [ ] Ajouter le type `DashboardAccommodationResolvedIris` avant `DashboardAccommodationSavePayload` :

```typescript
export type DashboardAccommodationResolvedIris = {
  category: string | null
  realEstateListing: string | null
  place: string | null
  amenityFeature: string[]
  tags: string[]
}
```

- [ ] Modifier `DashboardAccommodationSavePayload` :

```typescript
export type DashboardAccommodationSavePayload = DashboardAccommodation & {
  translations?: DashboardAccommodationTranslationPayload[]
  resolvedIris?: DashboardAccommodationResolvedIris
}
```

- [ ] Commit :
  ```bash
  git add shared/types/dashboardAccommodation.ts
  git commit -m "feat(dashboard): add resolvedIris to DashboardAccommodationSavePayload"
  ```

---

## Tâche 6 — useDashboardSave : résoudre les IRIs avant envoi

**Fichier :** `app/composables/dashboard/useDashboardSave.ts`

- [ ] Ajouter l'import du store et du type :

```typescript
import type { DashboardAccommodationResolvedIris } from '#shared/types/dashboardAccommodation'
import { useMetadataStore } from '~/stores/metadata'
```

- [ ] Ajouter la fonction de résolution dans le corps du composable (avant `savePayload`) :

```typescript
const metadataStore = useMetadataStore()

function resolveIris(frontmatter: Record<string, unknown>): DashboardAccommodationResolvedIris {
  const getIri = metadataStore.getIri

  const toStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

  return {
    category:
      typeof frontmatter.category === 'string'
        ? getIri('accommodation-type', frontmatter.category)
        : null,
    realEstateListing:
      typeof frontmatter.realEstateListing === 'string'
        ? getIri('real-estate-listing', frontmatter.realEstateListing)
        : null,
    place:
      typeof frontmatter.place === 'string'
        ? getIri('accommodation-place', frontmatter.place)
        : null,
    amenityFeature: toStringArray(frontmatter.amenityFeature)
      .map((code) => getIri('amenity-feature', code))
      .filter((iri): iri is string => iri !== null),
    tags: toStringArray(frontmatter.tags)
      .map((code) => getIri('tag', code))
      .filter((iri): iri is string => iri !== null),
  }
}
```

- [ ] Modifier `savePayload` pour enrichir le payload avec les IRIs résolues :

```typescript
const savePayload = async (
  accommodation: DashboardAccommodationSavePayload,
  locale: LocaleCode,
): Promise<boolean> => {
  status.value = 'saving'
  errorMessage.value = null
  markdownUpdated.value = null

  const enriched: DashboardAccommodationSavePayload = {
    ...accommodation,
    resolvedIris: resolveIris(accommodation.frontmatter as Record<string, unknown>),
  }

  try {
    const result = await $fetch<{ success: true; uuid: string; markdownUpdated: boolean }>(
      `/api/dashboard/accommodations/${accommodation.identifier}`,
      { method: 'PUT', query: { locale }, body: enriched },
    )
    // ... reste inchangé
```

- [ ] Commit :
  ```bash
  git add app/composables/dashboard/useDashboardSave.ts
  git commit -m "feat(dashboard): resolve Symfony IRIs from store before save"
  ```

---

## Tâche 7 — BFF mapper : utiliser resolvedIris au lieu de codeMap

**Fichier :** `server/utils/dashboard/accommodationMapper.ts`

- [ ] Remplacer la signature de `mapToApiPlatform` — supprimer `codeMap`, utiliser `resolvedIris` depuis le payload :

```typescript
export async function mapToApiPlatform(
  accommodation: DashboardAccommodationSavePayload,
  locale: string,
): Promise<SymfonyAccommodationPayload> {
```

- [ ] Supprimer les fonctions `resolveIri`, `resolveIriArray` et le type `CategoryCodeMap` importé.

- [ ] Remplacer le bloc IRI resolution par une lecture directe de `resolvedIris` :

```typescript
const iris = accommodation.resolvedIris
if (!iris) {
  throw new Error('resolvedIris manquant dans le payload')
}

const category = iris.category
const realEstateListing = iris.realEstateListing
const place = iris.place
const amenityFeature = iris.amenityFeature
const tags = iris.tags
```

- [ ] Supprimer l'import de `CategoryCodeMap` depuis `symfonyCache`.

- [ ] Commit :
  ```bash
  git add server/utils/dashboard/accommodationMapper.ts
  git commit -m "refactor(dashboard): use resolvedIris from payload instead of codeMap"
  ```

---

## Tâche 8 — PUT handler : supprimer getCategoryCodeMap

**Fichier :** `server/api/dashboard/accommodations/[identifier].put.ts`

- [ ] Supprimer l'import `getCategoryCodeMap` et `invalidateSymfonyCache` :

```typescript
import { getAccommodationUuidMap } from '../../../utils/dashboard/symfonyCache'
```

- [ ] Simplifier le `Promise.all` :

```typescript
const [token, uuidMap] = await Promise.all([getSymfonyServiceToken(), getAccommodationUuidMap()])
```

- [ ] Simplifier `mapToApiPlatform` (plus de `codeMap`) :

```typescript
let payload: Awaited<ReturnType<typeof mapToApiPlatform>>
try {
  payload = await mapToApiPlatform(accommodation, locale)
} catch (error) {
  throw createError({ statusCode: 400, statusMessage: (error as Error).message })
}
```

- [ ] Supprimer `DEFAULT_LOCALE`, `isMissingCategoryCodeError`, et le bloc `try/catch` de retry.

- [ ] Commit :
  ```bash
  git add server/api/dashboard/accommodations/[identifier].put.ts
  git commit -m "refactor(dashboard): remove getCategoryCodeMap from PUT handler"
  ```

---

## Tâche 9 — symfonyCache : supprimer la logique category-codes

**Fichier :** `server/utils/dashboard/symfonyCache.ts`

- [ ] Supprimer :
  - le type `CategoryCodeMap`
  - la variable `categoryCodeCache`
  - la fonction `fetchCategoryCodeMap`
  - la fonction `getCategoryCodeMap`
  - l'appel à `categoryCodeCache = null` dans `invalidateSymfonyCache`
  - l'export `getCategoryCodeMap`

- [ ] Garder intact : `AccommodationUuidMap`, `accommodationUuidCache`, `fetchAccommodationUuidMap`, `getAccommodationUuidMap`, `invalidateSymfonyCache`.

- [ ] Mettre à jour `invalidateSymfonyCache` :

```typescript
export function invalidateSymfonyCache(): void {
  accommodationUuidCache = null
}
```

- [ ] Mettre à jour `category-codes.post.ts` — supprimer l'appel à `getCategoryCodeMap(true)` (le cache n'existe plus) :

```typescript
// Supprimer cette ligne dans category-codes.post.ts :
await getCategoryCodeMap(true)
```

- [ ] Commit :
  ```bash
  git add server/utils/dashboard/symfonyCache.ts server/api/dashboard/category-codes.post.ts
  git commit -m "refactor(dashboard): remove CategoryCodeMap from symfonyCache"
  ```

---

## Tâche 10 — Vérification finale

- [ ] Lancer le build :

  ```bash
  make dev-webapp-ssr BUILD=1
  ```

- [ ] Tester la sauvegarde d'un bien dans le dashboard :
  - Ouvrir un bien (ex. BAVLC001)
  - Modifier un champ
  - Cliquer Sauvegarder
  - Attendu : succès, pas d'erreur 400 ou 500

- [ ] Vérifier dans les logs que le GET `/api/projects/.../category-codes` n'est plus appelé lors d'une sauvegarde.

- [ ] Commit final si nécessaire, puis merge dans `develop`.
