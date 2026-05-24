import { getSymfonyServiceToken } from './symfonyAuth'

/** { inCodeSet: { code: IRI } } */
export type CategoryCodeMap = Record<string, Record<string, string>>

/** { identifier: uuid } */
export type AccommodationUuidMap = Record<string, string>

type Cache<T> = {
  data: T
  expiresAt: number
}

const CACHE_TTL_MS = 300_000

let categoryCodeCache: Cache<CategoryCodeMap> | null = null
let accommodationUuidCache: Cache<AccommodationUuidMap> | null = null

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/ld+json',
  }
}

type HydraCollection<T> = {
  'hydra:member': T[]
}

type SymfonyCategoryCode = {
  '@id': string
  code: string
  inCodeSet: string
}

type SymfonyAccommodation = {
  '@id': string
  identifier: string
}

async function fetchCategoryCodeMap(
  apiUrl: string,
  projectId: string,
  token: string,
): Promise<CategoryCodeMap> {
  const response = await $fetch<HydraCollection<SymfonyCategoryCode>>(
    `${apiUrl}/api/projects/${projectId}/category-codes`,
    { headers: authHeaders(token), query: { pagination: false, locale: 'fr' } },
  )

  const map: CategoryCodeMap = {}

  for (const item of response['hydra:member'] ?? []) {
    const inCodeSetKey = item.inCodeSet.split('/').at(-1) ?? item.inCodeSet
    if (!map[inCodeSetKey]) map[inCodeSetKey] = {}
    map[inCodeSetKey]![item.code] = item['@id']
  }

  return map
}

async function fetchAccommodationUuidMap(
  apiUrl: string,
  projectId: string,
  token: string,
): Promise<AccommodationUuidMap> {
  const response = await $fetch<HydraCollection<SymfonyAccommodation>>(
    `${apiUrl}/api/projects/${projectId}/accommodations`,
    { headers: authHeaders(token), query: { pagination: false, locale: 'fr' } },
  )

  const map: AccommodationUuidMap = {}

  for (const item of response['hydra:member'] ?? []) {
    const uuid = item['@id'].split('/').at(-1)
    if (uuid) map[item.identifier] = uuid
  }

  return map
}

export async function getCategoryCodeMap(force = false): Promise<CategoryCodeMap> {
  const now = Date.now()

  if (!force && categoryCodeCache && categoryCodeCache.expiresAt > now) {
    return categoryCodeCache.data
  }

  const { apiUrl, projectId } = getApiBase()
  const token = await getSymfonyServiceToken()
  const data = await fetchCategoryCodeMap(apiUrl, projectId, token)

  categoryCodeCache = { data, expiresAt: now + CACHE_TTL_MS }
  return data
}

export async function getAccommodationUuidMap(force = false): Promise<AccommodationUuidMap> {
  const now = Date.now()

  if (!force && accommodationUuidCache && accommodationUuidCache.expiresAt > now) {
    return accommodationUuidCache.data
  }

  const { apiUrl, projectId } = getApiBase()
  const token = await getSymfonyServiceToken()
  const data = await fetchAccommodationUuidMap(apiUrl, projectId, token)

  accommodationUuidCache = { data, expiresAt: now + CACHE_TTL_MS }
  return data
}

export function invalidateSymfonyCache(): void {
  categoryCodeCache = null
  accommodationUuidCache = null
}
