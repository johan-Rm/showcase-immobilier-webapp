import { getSymfonyServiceToken } from '../../utils/dashboard/symfonyAuth'

type SymfonyCategoryCodeTranslation = {
  locale?: string
  label?: string | null
}

type SymfonyCategoryCode = {
  '@id': string
  code?: string
  codeValue?: string
  inCodeSet: string
  label?: string | null
  name?: string | null
  translations?: SymfonyCategoryCodeTranslation[]
}
type HydraCollection<T> = { 'hydra:member'?: T[]; member?: T[] }

export type DashboardCategoryCodeIri = {
  iri: string
  code: string
  inCodeSet: string
  label: string
}

function getCollectionMembers<T>(response: HydraCollection<T>): T[] {
  return response['hydra:member'] ?? response.member ?? []
}

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

const resolveLabel = (item: SymfonyCategoryCode, code: string): string =>
  item.label ??
  item.name ??
  item.translations?.find((translation) => translation.locale === 'fr')?.label ??
  item.translations?.find((translation) => translation.label)?.label ??
  code

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

  return getCollectionMembers(response).flatMap((item) => {
    const code = item.codeValue ?? item.code
    if (!code) return []
    return [{ iri: item['@id'], code, inCodeSet: item.inCodeSet, label: resolveLabel(item, code) }]
  })
})
