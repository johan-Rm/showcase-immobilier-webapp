import type { ProjectLocalesConfig } from '#shared/types/i18n'

import { isLocaleCode, resolveSourceLocale } from '#shared/utils/locale'

import { getSymfonyServiceToken } from './dashboard/symfonyAuth'

/**
 * Resolution des locales activees du projet API courant.
 *
 * Lit `sourceLocale` et `enabledLocales` sur le projet Symfony et les met en
 * cache (memoire process). Sert de source de verite runtime cote serveur :
 * routes BFF, route publique `/api/project-config` et garde-fous de locale.
 */

type SymfonyProject = {
  sourceLocale?: string
  enabledLocales?: string[]
}

type Cache = {
  data: ProjectLocalesConfig
  expiresAt: number
}

const CACHE_TTL_MS = 300_000

let cache: Cache | null = null

function getApiBase(): { apiUrl: string; projectId: string } {
  const { apiUrl, projectId } = useRuntimeConfig().symfony
  if (!apiUrl) throw new Error('SYMFONY_API_URL manquant')
  if (!projectId) throw new Error('SYMFONY_PROJECT_ID manquant')
  return { apiUrl, projectId }
}

async function fetchProjectLocales(): Promise<ProjectLocalesConfig> {
  const { apiUrl, projectId } = getApiBase()
  const token = await getSymfonyServiceToken()

  const project = await $fetch<SymfonyProject>(`${apiUrl}/api/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/ld+json' },
  })

  const sourceLocale = resolveSourceLocale(project.sourceLocale)
  const enabledLocales = (project.enabledLocales ?? []).filter(isLocaleCode)

  return {
    sourceLocale,
    // Garantit au moins la locale source meme si l'API renvoie une liste vide.
    enabledLocales: enabledLocales.length > 0 ? enabledLocales : [sourceLocale],
  }
}

/**
 * Retourne les locales activees du projet (avec cache process).
 * @param force ignore le cache et refait l'appel API.
 */
export async function getProjectLocales(force = false): Promise<ProjectLocalesConfig> {
  const now = Date.now()
  if (!force && cache && cache.expiresAt > now) return cache.data

  const data = await fetchProjectLocales()
  cache = { data, expiresAt: now + CACHE_TTL_MS }
  return data
}

export function invalidateProjectLocalesCache(): void {
  cache = null
}
