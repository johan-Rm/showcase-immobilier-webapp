import type { DashboardAccommodationTranslationsResponse } from '#shared/types/dashboardAccommodation'

import { getSymfonyServiceToken } from '../../../../utils/dashboard/symfonyAuth'
import { extractTranslations } from '../../../../utils/dashboard/translationNormalizer'

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw createError({ statusCode: 500, statusMessage: 'SYMFONY_API_URL manquant' })
  if (!projectId)
    throw createError({ statusCode: 500, statusMessage: 'SYMFONY_PROJECT_ID manquant' })
  return { apiUrl, projectId }
}

export default defineEventHandler(
  async (event): Promise<DashboardAccommodationTranslationsResponse> => {
    await requireUserSession(event)

    const identifier = getRouterParam(event, 'identifier')
    if (!identifier) {
      throw createError({ statusCode: 400, statusMessage: 'Missing accommodation identifier' })
    }

    const { apiUrl, projectId } = getApiBase()
    const token = await getSymfonyServiceToken()
    const response = await $fetch<unknown>(
      `${apiUrl}/api/projects/${projectId}/accommodations/${encodeURIComponent(
        identifier,
      )}/translations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    )

    return { translations: extractTranslations(response) }
  },
)
