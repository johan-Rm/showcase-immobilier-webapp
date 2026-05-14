<template>
  <UApp>
    <NuxtLoadingIndicator color="rgb(var(--color-surface) / 1)" :height="4" />
    <NuxtRouteAnnouncer />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ConstructionModal />

    <!-- v-if: maintenu en DOM jusqu'à completion pour permettre la transition CSS avant démontage -->
    <AppBootShell
      v-if="shouldMountLandingShell"
      :overlay-class="landingShellOverlayClass"
      :logo-class="landingShellLogoClass"
    />
  </UApp>
</template>

<script lang="ts" setup>
import { joinURL } from 'ufo'

const normalizePath = (value: string): string => (value !== '/' ? value.replace(/\/+$/, '') : '/')

const logger = useLogger({ module: 'app' })
const { localeSetting } = useLang()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const localePath = useLocalePath()
const { isConstructionEnabled } = useConstructionModal()

const baseAssetUrl = runtimeConfig.app.baseURL || '/'
const LANDING_SHELL_EXIT_DURATION_MS = 500

let initPromise: Promise<boolean> | null = null
let hasInitializedOnce = false
let landingShellCompletionTimer: ReturnType<typeof setTimeout> | null = null

const { initCoreData, initCoreDataStatus, isInitCoreDataReady } = useNuxtServerInit()

const isHeroImageReady = useState<boolean>('screen.real-estate-full-image.hero-ready', () => false)

const hasLandingShellCompleted = useState<boolean>('app.boot-shell.completed', () => false)

const isHomeRoute = computed<boolean>(() => {
  return normalizePath(route.path) === normalizePath(localePath('/'))
})

const isLandingShellVisible = computed<boolean>(() => {
  if (isConstructionEnabled.value) return false
  if (hasLandingShellCompleted.value) return false
  if (initCoreDataStatus.value === 'error') return false
  if (!isInitCoreDataReady.value) return true
  if (!isHomeRoute.value) return false

  return !isHeroImageReady.value
})

const shouldMountLandingShell = computed<boolean>(() => {
  return !hasLandingShellCompleted.value
})

const landingShellOverlayClass = computed<string>(() => {
  return isLandingShellVisible.value
    ? 'z-[100] opacity-100'
    : 'z-[100] pointer-events-none opacity-0'
})

const landingShellLogoClass = computed<string>(() => {
  return isLandingShellVisible.value ? 'opacity-100' : 'opacity-0'
})

const runInit = async (forceRefresh = false): Promise<void> => {
  if (hasInitializedOnce && !forceRefresh) {
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

useHead(() => ({
  title: 'MLK - My Little Kasbah',
  htmlAttrs: {
    lang: localeSetting.value,
  },
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [
    {
      key: 'app-favicon-svg',
      rel: 'icon',
      type: 'image/svg+xml',
      href: joinURL(baseAssetUrl, 'favicon.svg'),
    },
    {
      key: 'app-favicon-ico',
      rel: 'icon',
      type: 'image/x-icon',
      href: joinURL(baseAssetUrl, 'favicon.ico'),
    },
    {
      key: 'app-themes-stylesheet',
      rel: 'stylesheet',
      href: joinURL(baseAssetUrl, 'themes.css'),
    },
  ],
}))

onNuxtReady(() => {
  runInit().catch((error: unknown) => {
    logger.error('app:init-core-data-failed', {
      message: error instanceof Error ? error.message : String(error),
    })
  })
})

watch(
  isLandingShellVisible,
  async (visible) => {
    if (import.meta.server) return
    if (landingShellCompletionTimer) {
      clearTimeout(landingShellCompletionTimer)
      landingShellCompletionTimer = null
    }

    if (visible || initCoreDataStatus.value === 'loading') return

    await nextTick()

    if (!isLandingShellVisible.value) {
      landingShellCompletionTimer = setTimeout(() => {
        if (!isLandingShellVisible.value) {
          hasLandingShellCompleted.value = true
        }

        landingShellCompletionTimer = null
      }, LANDING_SHELL_EXIT_DURATION_MS)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (landingShellCompletionTimer) {
    clearTimeout(landingShellCompletionTimer)
    landingShellCompletionTimer = null
  }
})

watch(
  () => localeSetting.value,
  async (nextLocale, previousLocale) => {
    if (nextLocale === previousLocale) return

    try {
      await runInit(true) // forceRefresh: re-init même si déjà initialisé
    } catch (error) {
      logger.error('app:init-core-data-refresh-failed', {
        message: error instanceof Error ? error.message : String(error),
      })
    }
  },
)
</script>
