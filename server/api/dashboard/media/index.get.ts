import type { DashboardMediaObject } from '#shared/types/dashboardAccommodation'
import type { LocaleCode } from '#shared/types/i18n'

import { getSymfonyServiceToken } from '../../../utils/dashboard/symfonyAuth'
import { getProjectLocales } from '../../../utils/projectLocales'

import { isLocaleCode } from '#shared/utils/locale'

type SymfonyMediaObject = {
  id?: string
  identifier?: string
  caption?: string | null
  contentUrl?: string | null
  mainEntity?: string | null
  originalFilename?: string | null
  updatedAt?: string
}

type HydraCollection<TItem> = {
  'hydra:member'?: TItem[]
  member?: TItem[]
}

const getCollectionMembers = <TItem>(response: HydraCollection<TItem>): TItem[] =>
  response['hydra:member'] ?? response.member ?? []

const getApiBase = (): { apiUrl: string; projectId: string } => {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw createError({ statusCode: 500, statusMessage: 'SYMFONY_API_URL manquant' })
  if (!projectId)
    throw createError({ statusCode: 500, statusMessage: 'SYMFONY_PROJECT_ID manquant' })
  return { apiUrl, projectId }
}

const getRequestedLocale = (value: unknown, fallback: LocaleCode): LocaleCode =>
  typeof value === 'string' && isLocaleCode(value) ? value : fallback

export default defineEventHandler(async (event): Promise<DashboardMediaObject[]> => {
  await requireUserSession(event)

  const { apiUrl, projectId } = getApiBase()
  const { enabledLocales, sourceLocale } = await getProjectLocales()
  const requestedLocale = getRequestedLocale(getQuery(event).locale, sourceLocale)
  const locale = enabledLocales.includes(requestedLocale) ? requestedLocale : sourceLocale
  const token = await getSymfonyServiceToken()

  const response = await $fetch<HydraCollection<SymfonyMediaObject>>(
    `${apiUrl}/api/projects/${projectId}/media-objects`,
    {
      headers: {
        Accept: 'application/ld+json',
        'Accept-Language': locale,
        Authorization: `Bearer ${token}`,
      },
      query: { pagination: false, locale },
    },
  )

  return getCollectionMembers(response).flatMap((item) => {
    const identifier = item.identifier ?? item.id
    if (!identifier) return []

    return [
      {
        identifier,
        caption: item.caption ?? item.originalFilename ?? identifier,
        url: item.contentUrl ?? '',
        mainEntity: item.mainEntity ?? 'ImageObject',
        dateModified: item.updatedAt,
      },
    ]
  })
})
