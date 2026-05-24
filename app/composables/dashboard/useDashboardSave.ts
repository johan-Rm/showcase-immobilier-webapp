import type {
  DashboardAccommodation,
  DashboardAccommodationResolvedIris,
  DashboardAccommodationSavePayload,
} from '#shared/types/dashboardAccommodation'
import type { LocaleCode } from '#shared/types/i18n'

import { toValue } from 'vue'
import { useMetadataStore } from '~/stores/metadata'

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export const useDashboardSave = () => {
  const { localeSetting } = useLang()
  const metadataStore = useMetadataStore()

  const status = ref<SaveStatus>('idle')
  const errorMessage = ref<string | null>(null)
  const markdownUpdated = ref<boolean | null>(null)

  function resolveIris(
    frontmatter: Record<string, unknown>,
  ): DashboardAccommodationResolvedIris {
    const getIri = metadataStore.getIri

    const toStringArray = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []

    return {
      category:
        typeof frontmatter.category === 'string'
          ? getIri('accommodation-type', frontmatter.category)
          : null,
      realEstateListing:
        typeof frontmatter.realEstateListing === 'string'
          ? getIri('real-estate-listing', frontmatter.realEstateListing)
          : null,
      place:
        typeof frontmatter.place === 'string'
          ? getIri('accommodation-place', frontmatter.place)
          : null,
      amenityFeature: toStringArray(frontmatter.amenityFeature)
        .map((code) => getIri('amenity-feature', code))
        .filter((iri): iri is string => iri !== null),
      tags: toStringArray(frontmatter.tags)
        .map((code) => getIri('tag', code))
        .filter((iri): iri is string => iri !== null),
    }
  }

  const savePayload = async (
    accommodation: DashboardAccommodationSavePayload,
    locale: LocaleCode,
  ): Promise<boolean> => {
    status.value = 'saving'
    errorMessage.value = null
    markdownUpdated.value = null

    try {
      const enriched: DashboardAccommodationSavePayload = {
        ...accommodation,
        resolvedIris: resolveIris(accommodation.frontmatter as Record<string, unknown>),
      }

      const result = await $fetch<{ success: true; uuid: string; markdownUpdated: boolean }>(
        `/api/dashboard/accommodations/${accommodation.identifier}`,
        { method: 'PUT', query: { locale }, body: enriched },
      )

      markdownUpdated.value = result.markdownUpdated

      // Invalide le cache serveur (TTL 30s) sans bloquer l'UI
      $fetch('/api/dashboard/accommodations', {
        query: { locale, refresh: '1' },
      }).catch(() => {
        /* silencieux */
      })

      status.value = 'success'

      setTimeout(() => {
        if (status.value === 'success') status.value = 'idle'
      }, 3000)

      return true
    } catch (err: unknown) {
      status.value = 'error'
      const message = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      errorMessage.value = message
      return false
    }
  }

  const save = async (accommodation: DashboardAccommodation): Promise<boolean> => {
    return savePayload(accommodation, toValue(localeSetting))
  }

  const saveMultilingual = async (
    accommodation: DashboardAccommodationSavePayload,
    locale: LocaleCode,
  ): Promise<boolean> => {
    return savePayload(accommodation, locale)
  }

  const reset = () => {
    status.value = 'idle'
    errorMessage.value = null
    markdownUpdated.value = null
  }

  return { status, errorMessage, markdownUpdated, save, saveMultilingual, reset }
}
