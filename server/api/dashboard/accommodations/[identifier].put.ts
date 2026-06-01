import type { DashboardAccommodationSavePayload } from '#shared/types/dashboardAccommodation'

import { mapToApiPlatform } from '../../../utils/dashboard/accommodationMapper'
import { exportToMarkdown } from '../../../utils/dashboard/markdownExporter'
import { getSymfonyServiceToken } from '../../../utils/dashboard/symfonyAuth'
import { invalidateSymfonyCache } from '../../../utils/dashboard/symfonyCache'

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

type SymfonyAccommodationResponse = {
  '@id'?: string
  id?: string
  identifier?: string
}

type SymfonyFetchError = {
  response?: { status?: number; statusCode?: number; _data?: unknown }
  status?: number
  statusCode?: number
  message?: string
}

const getSymfonyErrorStatus = (error: unknown): number =>
  (error as SymfonyFetchError).response?.status ??
  (error as SymfonyFetchError).response?.statusCode ??
  (error as SymfonyFetchError).status ??
  (error as SymfonyFetchError).statusCode ??
  502

const getSymfonyErrorMessage = (error: unknown): string => {
  const fetchErr = error as SymfonyFetchError
  const data = fetchErr.response?._data
  if (typeof data === 'object' && data !== null) return JSON.stringify(data)
  return fetchErr.message ?? 'Symfony error'
}

const resolveSymfonyIdentifier = (
  response: SymfonyAccommodationResponse,
  fallbackIdentifier: string,
): string =>
  response.id ?? response.identifier ?? response['@id']?.split('/').at(-1) ?? fallbackIdentifier

export default defineEventHandler(
  async (
    event,
  ): Promise<{
    success: true
    uuid: string
    markdownUpdated: boolean
    data: SymfonyAccommodationResponse
  }> => {
    await requireUserSession(event)

    const identifier = getRouterParam(event, 'identifier')
    if (!identifier) {
      throw createError({ statusCode: 400, statusMessage: 'Missing accommodation identifier' })
    }

    const accommodation = await readBody<DashboardAccommodationSavePayload>(event)
    if (!accommodation?.frontmatter) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid accommodation payload' })
    }

    const { apiUrl, projectId } = getApiBase()
    const query = getQuery(event)
    const locale = typeof query.locale === 'string' && query.locale.length > 0 ? query.locale : 'fr'
    const token = await getSymfonyServiceToken()

    let payload: Awaited<ReturnType<typeof mapToApiPlatform>>
    try {
      payload = await mapToApiPlatform(accommodation)
    } catch (error) {
      throw createError({ statusCode: 400, statusMessage: (error as Error).message })
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    let uuid: string
    let savedData: SymfonyAccommodationResponse

    const callSymfony = async (
      url: string,
      method: 'PUT' | 'POST',
    ): Promise<SymfonyAccommodationResponse> =>
      await $fetch<SymfonyAccommodationResponse>(url, {
        method,
        headers,
        query: { locale },
        body: payload,
      })

    try {
      const updated = await callSymfony(
        `${apiUrl}/api/projects/${projectId}/accommodations/${identifier}/translations`,
        'PUT',
      )
      savedData = updated
      uuid = resolveSymfonyIdentifier(updated, identifier)
    } catch (updateError: unknown) {
      if (getSymfonyErrorStatus(updateError) !== 404) {
        throw createError({
          statusCode: getSymfonyErrorStatus(updateError),
          statusMessage: getSymfonyErrorMessage(updateError),
        })
      }

      try {
        const created = await callSymfony(
          `${apiUrl}/api/projects/${projectId}/accommodations/translations`,
          'POST',
        )
        savedData = created
        uuid = resolveSymfonyIdentifier(created, identifier)
        invalidateSymfonyCache()
      } catch (createErrorResponse: unknown) {
        throw createError({
          statusCode: getSymfonyErrorStatus(createErrorResponse),
          statusMessage: getSymfonyErrorMessage(createErrorResponse),
        })
      }
    }

    let markdownUpdated = false
    try {
      const result = await exportToMarkdown(accommodation)
      markdownUpdated = result.updated
    } catch (err) {
      console.error('[markdown-export] Échec write fichier :', err)
    }

    return { success: true, uuid, markdownUpdated, data: savedData }
  },
)
