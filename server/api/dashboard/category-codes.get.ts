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
