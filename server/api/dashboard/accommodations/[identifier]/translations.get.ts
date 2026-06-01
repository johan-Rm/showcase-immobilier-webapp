import type {
  DashboardAccommodationTranslationPayload,
  DashboardAccommodationTranslationsResponse,
  DashboardLocalizedAccommodationField,
} from '#shared/types/dashboardAccommodation'

import { getSymfonyServiceToken } from '../../../../utils/dashboard/symfonyAuth'

import { isLocaleCode } from '#shared/i18n/config'
import { DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS } from '#shared/types/dashboardAccommodation'

type UnknownRecord = Record<string, unknown>

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw createError({ statusCode: 500, statusMessage: 'SYMFONY_API_URL manquant' })
  if (!projectId)
    throw createError({ statusCode: 500, statusMessage: 'SYMFONY_PROJECT_ID manquant' })
  return { apiUrl, projectId }
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const getTranslationRecords = (response: unknown): UnknownRecord[] => {
  if (Array.isArray(response)) return response.filter(isRecord)
  if (!isRecord(response)) return []

  const translations = response.translations
  if (Array.isArray(translations)) return translations.filter(isRecord)

  const hydraMembers = response['hydra:member']
  if (Array.isArray(hydraMembers)) return hydraMembers.filter(isRecord)

  const members = response.member
  if (Array.isArray(members)) return members.filter(isRecord)

  return []
}

const normalizeTranslation = (
  item: UnknownRecord,
): DashboardAccommodationTranslationPayload | null => {
  const locale = item.locale
  if (typeof locale !== 'string' || !isLocaleCode(locale)) return null

  const translation: DashboardAccommodationTranslationPayload = { locale }

  DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS.forEach(
    (field: DashboardLocalizedAccommodationField) => {
      if (!Object.hasOwn(item, field)) return
      const value = item[field]
      translation[field] = typeof value === 'string' ? value : null
    },
  )

  return translation
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

    return {
      translations: getTranslationRecords(response)
        .map(normalizeTranslation)
        .filter((translation): translation is DashboardAccommodationTranslationPayload =>
          Boolean(translation),
        ),
    }
  },
)
