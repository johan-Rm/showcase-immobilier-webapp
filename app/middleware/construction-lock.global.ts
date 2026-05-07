import { useConstructionModal } from '~/composables/useConstructionModal'

export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return

  // Allow initial render/hydration navigation.
  if (!from.matched.length) return

  // Ignore no-op navigations.
  if (to.fullPath === from.fullPath) return

  const { isConstructionEnabled, open } = useConstructionModal()
  if (!isConstructionEnabled.value) return

  open()
  return abortNavigation()
})
