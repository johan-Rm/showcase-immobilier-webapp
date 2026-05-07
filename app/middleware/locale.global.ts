import { FALLBACK_LOCALE, isLocaleCode } from '#shared/i18n/config'

/**
 * Extrait une locale valide depuis le path.
 *
 * Objectif : centraliser l’analyse du préfixe `/fr`, `/en`, etc. pour éviter
 * des redirections inutiles et garder la logique au même endroit.
 *
 * @param path Chemin de la route à inspecter.
 * @returns La locale si détectée et valide, sinon `null`.
 */
const getLocaleFromPath = (path: string): string | null => {
  const match = path.match(/^\/([a-z]{2})(?:\/|$)/i)
  const code = match?.[1]?.toLowerCase() ?? ''
  return isLocaleCode(code) ? code : null
}

const isApiPath = (path: string): boolean => {
  return path === '/api' || path.startsWith('/api/')
}

/**
 * Middleware global de normalisation de locale.
 *
 * But :
 * - garantir une URL préfixée par une locale (`/fr/...`)
 * - éviter que `useLang()` déclenche des side-effects dans toute l’app
 *
 * @example
 * /contact -> /fr/contact
 */
export default defineNuxtRouteMiddleware((to) => {
  if (isApiPath(to.path)) return

  const pathLocale = getLocaleFromPath(to.path)
  const paramLocale =
    typeof to.params?.locale === 'string' && isLocaleCode(to.params.locale)
      ? to.params.locale
      : null

  // Si la route porte déjà une locale (path ou param), on n’intervient pas.
  if (pathLocale || paramLocale) return

  const { localeSetting } = useLang()
  const locale = localeSetting.value || FALLBACK_LOCALE

  // Redirection vers la version localisée pour stabiliser le routing et l’init.
  return navigateTo({
    path: `/${locale}${to.path === '/' ? '' : to.path}`,
    query: to.query,
    hash: to.hash,
  })
})
