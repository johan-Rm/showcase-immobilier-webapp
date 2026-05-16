export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch } = useUserSession()

  if (!loggedIn.value) {
    await fetch()
  }

  if (loggedIn.value) return

  return navigateTo(`/auth/google?state=${encodeURIComponent(to.fullPath)}`, {
    external: true,
  })
})
