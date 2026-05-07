import type { AppFooter } from '#shared/types/app'

import { useApp } from '~/composables/useApp'

export const useAppFooter = () => {
  const { appData } = useApp()

  const footer = computed<AppFooter | null>(() => {
    return appData.value?.footer ?? null
  })

  return {
    footer,
  }
}
