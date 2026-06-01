import { getSymfonyServiceToken } from './symfonyAuth'

/** { identifier: uuid } */
export type AccommodationUuidMap = Record<string, string>

type Cache<T> = {
  data: T
  expiresAt: number
}

const CACHE_TTL_MS = 300_000

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
  'hydra:member'?: T[]
  member?: T[]
}

type SymfonyAccommodation = {
  '@id': string
  identifier: string
}

function getCollectionMembers<T>(response: HydraCollection<T>): T[] {
  return response['hydra:member'] ?? response.member ?? []
}

async function fetchAccommodationUuidMap(
  apiUrl: string,
  projectId: string,
  token: string,
): Promise<AccommodationUuidMap> {
  const response = await $fetch<HydraCollection<SymfonyAccommodation>>(
    `${apiUrl}/api/projects/${projectId}/accommodations`,
    { headers: authHeaders(token), query: { pagination: false } },
  )

  const map: AccommodationUuidMap = {}

  for (const item of getCollectionMembers(response)) {
    const uuid = item['@id'].split('/').at(-1)
    if (uuid) map[item.identifier] = uuid
  }

  return map
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
  accommodationUuidCache = null
}
