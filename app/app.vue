<template>
  <UApp>
    <NuxtLoadingIndicator color="rgb(var(--color-surface) / 1)" :height="4" />
    <NuxtRouteAnnouncer />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ConstructionModal />

    <!-- v-if: maintenu en DOM jusqu'à completion pour permettre la transition CSS avant démontage -->
    <AppBootShell v-if="shouldMountLandingShell" />
  </UApp>
</template>

<script lang="ts" setup>
// 4. Composables, stores, routeur

const logger = useLogger({ module: 'app' })
// Locale active utilisée pour synchroniser lang HTML et forcer un re-init des données.
const { localeSetting } = useLang()
// Statut et données critiques de l'application (web pages, métadonnées).
const { initCoreData, isInitCoreDataReady, loadBackgroundData } = useNuxtServerInit()

// Résolus en setup (contexte Nuxt valide) : useRuntimeConfig() ne peut pas être appelé
// dans le getter de useHead, qui est évalué par unhead hors contexte Vue côté SSR.
const faviconSvgHref = assetUrl('favicon.svg')
const faviconIcoHref = assetUrl('favicon.ico')
const themesCssHref = assetUrl('themes.css')

// 5. Etat local

// Verrou de déduplication : évite les appels concurrents à initCoreData.
let initPromise: Promise<boolean> | null = null
// Garde contre les ré-initialisations non demandées lors de re-renders ou changements de locale.
let hasInitializedOnce = false

// Persiste l'état de fin de vie du shell pour éviter qu'il remonte après sa sortie.
// Réinitialisé uniquement à chaque rechargement complet de la page.
const hasLandingShellCompleted = useState<boolean>('app.boot-shell.completed', () => false)

// 8. Computed UI-ready

// Contrôle le montage DOM du shell, indépendamment de sa visibilité CSS.
// Le shell reste monté le temps que la transition de sortie s'exécute,
// puis est retiré du DOM une fois hasLandingShellCompleted passé à true.
const shouldMountLandingShell = computed<boolean>(() => !hasLandingShellCompleted.value)

// 9. Actions et handlers

/**
 * Déclenche l'initialisation des données critiques de l'application.
 *
 * Protège contre les appels concurrents en mémorisant la promesse en cours.
 * Un second appel pendant l'init en cours attend la résolution de la première.
 *
 * @param forceRefresh Si `true`, relance l'init même si elle a déjà été effectuée
 *   (ex : changement de locale nécessitant un rechargement des données traduites).
 */
const runInit = async (forceRefresh = false): Promise<void> => {
  if ((hasInitializedOnce || isInitCoreDataReady.value) && !forceRefresh) {
    return
  }

  if (initPromise) {
    await initPromise
    return
  }

  const currentInitPromise = initCoreData()
  initPromise = currentInitPromise

  try {
    await currentInitPromise
    hasInitializedOnce = true
  } finally {
    if (initPromise === currentInitPromise) {
      initPromise = null
    }
  }
}

// 10. Watch et watchEffect

// Recharge les données critiques quand la locale change pour refléter la bonne langue.
// forceRefresh: true permet de contourner la garde hasInitializedOnce.
watch(
  () => localeSetting.value,
  async (nextLocale, previousLocale) => {
    if (nextLocale === previousLocale) return

    try {
      await runInit(true)
    } catch (error) {
      logger.error('app:init-core-data-refresh-failed', {
        message: error instanceof Error ? error.message : String(error),
      })
    }
  },
)

// 11. Metadonnees ecran ou page

useHead(() => ({
  title: 'MLK - My Little Kasbah',
  htmlAttrs: {
    // Synchronise l'attribut lang du document HTML avec la locale active.
    lang: localeSetting.value,
  },
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [
    {
      key: 'app-favicon-svg',
      rel: 'icon',
      type: 'image/svg+xml',
      href: faviconSvgHref,
    },
    {
      key: 'app-favicon-ico',
      rel: 'icon',
      type: 'image/x-icon',
      href: faviconIcoHref,
    },
    {
      key: 'app-themes-stylesheet',
      rel: 'stylesheet',
      href: themesCssHref,
    },
  ],
}))

// 12. Lifecycle

onErrorCaptured((error, instance, info) => {
  const typedError = error as Error

  logger.error('app:error-captured', {
    message: typedError?.message ?? String(error),
    stack: typedError?.stack,
    info,
    component: instance?.$?.type?.name,
  })

  // Empêche Vue de remonter l'erreur et d'afficher son boundary par défaut.
  return false
})

// Déclenche l'init si le plugin n'a pas pu la compléter (ex : SSR raté, locale forcée).
// Lance ensuite les données d'arrière-plan non critiques (accommodations).
onNuxtReady(async () => {
  try {
    await runInit()
  } catch (error: unknown) {
    logger.error('app:init-core-data-failed', {
      message: error instanceof Error ? error.message : String(error),
    })
  }

  void loadBackgroundData()
})
</script>
