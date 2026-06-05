import { FALLBACK_LOCALE, SUPPORTED_LOCALES } from '#shared/utils/locale'

/**
 * Resout les locales activees du projet une fois en SSR et les expose via
 * `useState('project.locales')`. La valeur est serialisee dans le payload :
 * le client la rehydrate sans refaire d'appel.
 *
 * En cas d'echec API, le defaut (catalogue complet) est conserve afin de ne
 * jamais masquer une langue par erreur reseau.
 */
export default defineNuxtPlugin(async () => {
  const config = useState<ProjectLocalesConfig>('project.locales', () => ({
    sourceLocale: FALLBACK_LOCALE,
    enabledLocales: [...SUPPORTED_LOCALES],
  }))

  // Cote client, la valeur provient deja du payload SSR.
  if (import.meta.client) return

  try {
    config.value = await $fetch<ProjectLocalesConfig>('/api/project-config')
  } catch (error) {
    console.error('[project-locales] resolution SSR impossible, defaut conserve:', error)
  }
})
