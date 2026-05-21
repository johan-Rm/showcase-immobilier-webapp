import type { DashboardAccommodation } from '#shared/types/dashboardAccommodation'

import { toValue } from 'vue'

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export const useDashboardSave = () => {
  const { localeSetting } = useLang()

  const status = ref<SaveStatus>('idle')
  const errorMessage = ref<string | null>(null)
  const markdownUpdated = ref<boolean | null>(null)

  const save = async (accommodation: DashboardAccommodation): Promise<boolean> => {
    status.value = 'saving'
    errorMessage.value = null
    markdownUpdated.value = null

    try {
      const locale = toValue(localeSetting)
      const result = await $fetch<{ success: true; uuid: string; markdownUpdated: boolean }>(
        `/api/dashboard/accommodations/${accommodation.identifier}`,
        { method: 'PUT', query: { locale }, body: accommodation },
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

  const reset = () => {
    status.value = 'idle'
    errorMessage.value = null
    markdownUpdated.value = null
  }

  return { status, errorMessage, markdownUpdated, save, reset }
}
