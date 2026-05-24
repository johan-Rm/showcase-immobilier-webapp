import type { DashboardAccommodationSavePayload } from '#shared/types/dashboardAccommodation'

import { mapToApiPlatform } from '../../../utils/dashboard/accommodationMapper'
import { exportToMarkdown } from '../../../utils/dashboard/markdownExporter'
import { getSymfonyServiceToken } from '../../../utils/dashboard/symfonyAuth'
import {
  getCategoryCodeMap,
  getAccommodationUuidMap,
  invalidateSymfonyCache,
} from '../../../utils/dashboard/symfonyCache'

const DEFAULT_LOCALE = 'fr'
const MISSING_CATEGORY_CODE_MESSAGE = 'CategoryCode introuvable'

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

function isMissingCategoryCodeError(error: unknown): boolean {
  return error instanceof Error && error.message.includes(MISSING_CATEGORY_CODE_MESSAGE)
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

    const accommodation = await readBody<DashboardAccommodationSavePayload>(event)
    if (!accommodation?.frontmatter) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid accommodation payload' })
    }

    const { apiUrl, projectId } = getApiBase()
    const [token, codeMap, uuidMap] = await Promise.all([
      getSymfonyServiceToken(),
      getCategoryCodeMap(),
      getAccommodationUuidMap(),
    ])

    let payload: Awaited<ReturnType<typeof mapToApiPlatform>>
    try {
      payload = await mapToApiPlatform(accommodation, locale, codeMap)
    } catch (error) {
      if (!isMissingCategoryCodeError(error)) {
        throw error
      }

      invalidateSymfonyCache()
      const freshCodeMap = await getCategoryCodeMap(true)
      payload = await mapToApiPlatform(accommodation, locale, freshCodeMap)
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/ld+json',
      Accept: 'application/ld+json',
    }

    const existingUuid = uuidMap[identifier] ?? null

    let uuid: string

    const callSymfony = async <T = unknown>(url: string, method: 'PUT' | 'POST'): Promise<T> => {
      try {
        return await $fetch<T>(url, { method, headers, body: payload })
      } catch (err: unknown) {
        const fetchErr = err as {
          response?: { status?: number; _data?: unknown }
          message?: string
        }
        const status = fetchErr.response?.status ?? 502
        const detail =
          typeof fetchErr.response?._data === 'object' && fetchErr.response._data !== null
            ? JSON.stringify(fetchErr.response._data)
            : (fetchErr.message ?? 'Symfony error')
        throw createError({ statusCode: status, statusMessage: detail })
      }
    }

    if (existingUuid) {
      await callSymfony(
        `${apiUrl}/api/projects/${projectId}/accommodations/${identifier}`,
        'PUT',
      )
      uuid = existingUuid
    } else {
      const created = await callSymfony<{ '@id': string }>(
        `${apiUrl}/api/projects/${projectId}/accommodations`,
        'POST',
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
