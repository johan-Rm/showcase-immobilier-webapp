import type { H3Event } from 'h3'

import { getQuery, sendRedirect } from 'h3'
import { withQuery } from 'ufo'

import { FALLBACK_LOCALE, isLocaleCode } from '#shared/i18n/config'

type GoogleOAuthUser = {
  sub?: string
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
}

type GoogleOAuthSuccessPayload = {
  user: unknown
}

const DASHBOARD_PATH = 'dashboard'
const AUTH_ERROR_QUERY_KEY = 'auth'

const resolveSafeRedirectPath = (state: unknown): string => {
  const value = Array.isArray(state) ? state[0] : state
  if (typeof value !== 'string') return `/${FALLBACK_LOCALE}/${DASHBOARD_PATH}`
  if (!value.startsWith('/') || value.startsWith('//'))
    return `/${FALLBACK_LOCALE}/${DASHBOARD_PATH}`
  if (value.startsWith('/auth/')) return `/${FALLBACK_LOCALE}/${DASHBOARD_PATH}`

  return value
}

const resolveLocaleFromPath = (path: string): string => {
  const code = path.match(/^\/([a-z]{2})(?:\/|$)/i)?.[1]?.toLowerCase()
  return isLocaleCode(code) ? code : FALLBACK_LOCALE
}

const resolvePublicAuthRedirectPath = (redirectPath: string, reason: string): string => {
  const locale = resolveLocaleFromPath(redirectPath)

  return withQuery(`/${locale}`, {
    [AUTH_ERROR_QUERY_KEY]: reason,
  })
}

const isVerifiedGoogleEmail = (user: GoogleOAuthUser): boolean => {
  return Boolean(user.email) && user.email_verified !== false
}

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile'],
  },
  async onSuccess(event: H3Event, { user }: GoogleOAuthSuccessPayload) {
    const googleUser = user as GoogleOAuthUser
    const runtimeConfig = useRuntimeConfig(event)
    const query = getQuery(event)
    const redirectPath = resolveSafeRedirectPath(query.state)

    if (
      !googleUser.sub ||
      !isVerifiedGoogleEmail(googleUser) ||
      !isAuthorizedClientEmail(googleUser.email, runtimeConfig.authorizedClientEmails)
    ) {
      await clearUserSession(event)
      return sendRedirect(event, resolvePublicAuthRedirectPath(redirectPath, 'unauthorized'))
    }

    await setUserSession(event, {
      user: {
        id: googleUser.sub,
        email: normalizeClientEmail(googleUser.email),
        name: googleUser.name,
        picture: googleUser.picture,
      },
      loggedInAt: Date.now(),
    })

    return sendRedirect(event, redirectPath)
  },
  onError(event: H3Event) {
    return sendRedirect(
      event,
      resolvePublicAuthRedirectPath(`/${FALLBACK_LOCALE}/${DASHBOARD_PATH}`, 'error'),
    )
  },
})
