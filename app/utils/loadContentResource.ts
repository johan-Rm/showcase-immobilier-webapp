import type { ResourceKey } from '#shared/types/content'

/**
 * Adapter client de chargement de contenu via l'API Nitro.
 *
 * La lecture fichier reste strictement côté serveur ; le front consomme
 * uniquement l'endpoint `/api/content/:resource`.
 */
export const loadContentResource = async <T>(resource: ResourceKey, locale: string): Promise<T> => {
  const normalizedLocale = normalizeLocale(locale)

  return $fetch(`/api/content/${resource}` as string, {
    query: { locale: normalizedLocale },
  }) as unknown as T
}
