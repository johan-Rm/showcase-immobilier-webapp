import type { DashboardAccommodation } from '#shared/types/dashboardAccommodation'

import { mapToApiPlatform } from '../../../utils/dashboard/accommodationMapper'
import { exportToMarkdown } from '../../../utils/dashboard/markdownExporter'
import { getSymfonyServiceToken } from '../../../utils/dashboard/symfonyAuth'
import {
  getCategoryCodeMap,
  getAccommodationUuidMap,
  invalidateSymfonyCache,
} from '../../../utils/dashboard/symfonyCache'

const DEFAULT_LOCALE = 'fr'

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

export default defineEventHandler(
  async (event): Promise<{ success: true; uuid: string; markdownUpdated: boolean }> => {
    await requireUserSession(event)

    const identifier = getRouterParam(event, 'identifier')
    if (!identifier) {
      throw createError({ statusCode: 400, statusMessage: 'Missing accommodation identifier' })
    }

    const query = getQuery(event)
    const locale =
      typeof query.locale === 'string' && query.locale.length > 0 ? query.locale : DEFAULT_LOCALE

    const accommodation = await readBody<DashboardAccommodation>(event)
    if (!accommodation?.frontmatter) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid accommodation payload' })
    }

    const { apiUrl, projectId } = getApiBase()
    const [token, codeMap, uuidMap] = await Promise.all([
      getSymfonyServiceToken(),
      getCategoryCodeMap(),
      getAccommodationUuidMap(),
    ])

    const payload = await mapToApiPlatform(accommodation, locale, codeMap)

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/ld+json',
      Accept: 'application/ld+json',
    }

    const existingUuid = uuidMap[identifier] ?? null

    let uuid: string

    if (existingUuid) {
      await $fetch(
        `${apiUrl}/api/projects/${projectId}/accommodations/${existingUuid}?locale=${locale}`,
        { method: 'PUT', headers, body: payload },
      )
      uuid = existingUuid
    } else {
      const created = await $fetch<{ '@id': string }>(
        `${apiUrl}/api/projects/${projectId}/accommodations?locale=${locale}`,
        { method: 'POST', headers, body: payload },
      )
      const newUuid = created['@id'].split('/').at(-1)
      if (!newUuid) {
        throw createError({ statusCode: 502, statusMessage: 'Symfony response missing @id' })
      }
      uuid = newUuid
      invalidateSymfonyCache()
    }

    let markdownUpdated = false
    try {
      const result = await exportToMarkdown(accommodation)
      markdownUpdated = result.updated
    } catch (err) {
      console.error('[markdown-export] Échec write fichier :', err)
    }

    return { success: true, uuid, markdownUpdated }
  },
)
