import type { DashboardAccommodation } from '#shared/types/dashboardAccommodation'

import { toValue } from 'vue'

export type SaveStatus = 'idle' | 'saving' | 'success' | 'error'

export const useDashboardSave = () => {
  const { localeSetting } = useLang()

  const status = ref<SaveStatus>('idle')
  const errorMessage = ref<string | null>(null)

  const save = async (accommodation: DashboardAccommodation): Promise<boolean> => {
    status.value = 'saving'
    errorMessage.value = null

    try {
      await $fetch(`/api/dashboard/accommodations/${accommodation.identifier}`, {
        method: 'PUT',
        query: { locale: toValue(localeSetting) },
        body: accommodation,
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
  }

  return { status, errorMessage, save, reset }
}
