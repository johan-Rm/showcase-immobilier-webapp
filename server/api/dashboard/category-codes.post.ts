import { getSymfonyServiceToken } from '../../utils/dashboard/symfonyAuth'
import { getCategoryCodeMap } from '../../utils/dashboard/symfonyCache'

type SymfonyCategoryCode = { '@id': string; code: string; inCodeSet: string }

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

export default defineEventHandler(async (event): Promise<SymfonyCategoryCode> => {
  await requireUserSession(event)

  const body = await readBody<{ code?: string; inCodeSet?: string }>(event)
  if (!body?.code || !body?.inCodeSet) {
    throw createError({ statusCode: 400, statusMessage: 'code et inCodeSet sont requis' })
  }

  const { apiUrl, projectId } = getApiBase()
  const token = await getSymfonyServiceToken()

  const created = await $fetch<SymfonyCategoryCode>(
    `${apiUrl}/api/projects/${projectId}/category-codes`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/ld+json',
        Accept: 'application/ld+json',
      },
      body: { code: body.code, inCodeSet: body.inCodeSet },
    },
  )

  await getCategoryCodeMap(true)

  return created
})
