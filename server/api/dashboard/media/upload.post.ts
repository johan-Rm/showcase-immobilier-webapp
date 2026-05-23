import type { MediaObject } from '@schemas/interfaces'

import { getSymfonyServiceToken } from '../../../utils/dashboard/symfonyAuth'

type SymfonyMediaResponse = {
  identifier: string
  name: string
  url?: string
  contentUrl?: string
  caption?: string
  source?: string
  sourceUrl?: string
  mainEntity?: string
}

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw createError({ statusCode: 500, statusMessage: 'SYMFONY_API_URL manquant' })
  if (!projectId) throw createError({ statusCode: 500, statusMessage: 'SYMFONY_PROJECT_ID manquant' })
  return { apiUrl, projectId }
}

export default defineEventHandler(async (event): Promise<MediaObject> => {
  await requireUserSession(event)

  const form = await readFormData(event)
  const file = form.get('file') as File | null

  if (!file || file.size === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Fichier manquant ou vide' })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  if (!allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Type de fichier non supporté' })
  }

  const { apiUrl } = getApiBase()
  const token = await getSymfonyServiceToken()

  const symfonyForm = new FormData()
  symfonyForm.append('file', file, file.name)

  const raw = await $fetch<SymfonyMediaResponse>(`${apiUrl}/api/media-objects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: symfonyForm,
  })

  return {
    identifier: raw.identifier,
    name: raw.name,
    url: raw.url ?? raw.contentUrl ?? '',
    caption: raw.caption ?? '',
    source: raw.source ?? '',
    sourceUrl: raw.sourceUrl ?? raw.url ?? raw.contentUrl ?? '',
    mainEntity: raw.mainEntity ?? '',
  }
})
