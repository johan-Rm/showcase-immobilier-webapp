import type { App } from '#shared/types/app'
import type { LocaleCode } from '#shared/types/i18n'
import type { ComputedRef, Ref } from 'vue'

import { computed } from 'vue'

/**
 * Contrat public du composable `useApp`.
 *
 * Il expose la locale courante, la donnée `app` réactive et les helpers utiles
 * pour charger ou relire la configuration globale déjà hydratée dans le store.
 */
type UseAppReturn = {
  locale: Ref<LocaleCode>
  appData: ComputedRef<App | null>
  loadApp: () => Promise<void>
  getApp: () => App | null
  isLandingShellVisible: ComputedRef<boolean>
  preloadDashboard: () => void
}

/**
 * Expose l'accès réactif à la donnée `app` chargée dans le store metadata.
 *
 * Responsabilités :
 * - relayer la locale courante utilisée par les loaders de contenu
 * - charger le document `app` via le pipeline metadata existant
 * - fournir un accès réactif unique à la configuration globale du site
 * - calculer la visibilité du shell de démarrage (`AppBootShell`)
 *
 * @returns API réactive orientée `app` pour les pages et composables métier.
 *
 * @example
 * const { appData, loadApp } = useApp()
 * await loadApp()
 * const app = appData.value
 */
export const useApp = (): UseAppReturn => {
  const { localeSetting } = useLang()
  const { loadApp } = useMetadata()
  const store = useMetadataStore()
  const locale = computed(() => localeSetting.value)
  const appData = computed<App | null>(() => store.getApp)

  const { initCoreDataStatus } = useNuxtServerInit()

  // Partagé avec FullImage.vue : signal que l'image hero est prête à être affichée.
  const isHeroImageReady = useState<boolean>(
    'screen.real-estate-full-image.hero-ready',
    () => false,
  )
  // Partagé avec app.vue : persiste la fin de vie du shell pour la session courante.
  const hasLandingShellCompleted = useState<boolean>('app.boot-shell.completed', () => false)

  // Chaîne de gardes ordonnées : chaque early return représente un état où
  // le shell n'a pas de raison d'être visible.
  const isLandingShellVisible = computed<boolean>(() => {
    // Le shell a déjà terminé son cycle de vie : ne plus l'afficher.
    if (hasLandingShellCompleted.value) return false
    // Init en attente ou en cours : le shell reste visible pour masquer un contenu incomplet.
    const status = initCoreDataStatus.value
    if (status === 'idle' || status === 'loading') return true

    // État terminal (ready ou error) : le shell attend que l'image hero soit prête.
    // En cas d'erreur, le contenu SSR/cache est déjà affiché — on laisse l'image décider.
    return !isHeroImageReady.value
  })

  /**
   * Initialise le préchargement client-side de la première image visible du dashboard.
   *
   * À appeler une seule fois pendant le setup du composant racine.
   * Sans effet si l'utilisateur n'est pas connecté ou si aucune image n'est disponible.
   */
  const preloadDashboard = (): void => {
    const { loggedIn } = useUserSession()
    const dashboardHeroImageUrl = useState<string>('dashboard.hero-image.url', () => '')

    useImageWarmup(dashboardHeroImageUrl, {
      stateKey: 'dashboard-hero',
      warmupEnabled: loggedIn,
      preset: 'heroFullScreen',
    })
  }

  /**
   * Retourne la donnée `app` actuellement disponible dans le store.
   *
   * @returns Configuration globale localisée ou `null` si elle n'est pas chargée.
   */
  const getApp = (): App | null => appData.value

  return {
    locale,
    appData,
    loadApp,
    getApp,
    isLandingShellVisible,
    preloadDashboard,
  }
}
