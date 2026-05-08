<template>
  <div class="screen-real-estate-full-image relative" :class="screenColumnTemplate[column].value">
    <AppImage
      v-if="hasBackgroundImage && !usePortraitHeroImage"
      :src="bgImageUrl"
      :alt="heroImageAlt"
      v-bind="IMAGE_PRESETS.heroFullScreen"
      loading="eager"
      :placeholder="false"
      fetchpriority="high"
      decoding="async"
      :preload="true"
      class="absolute inset-0 h-full w-full object-cover"
      @loaded="handleHeroImageLoad"
      @error="handleHeroImageError"
    />

    <AppImage
      v-if="usePortraitHeroImage"
      :src="bgImagePortraitUrl"
      :alt="heroImageAlt"
      v-bind="IMAGE_PRESETS.heroMobile"
      loading="eager"
      :placeholder="false"
      fetchpriority="high"
      decoding="async"
      :preload="true"
      class="absolute inset-0 h-full w-full object-cover"
      @loaded="handleHeroImageLoad"
      @error="handleHeroImageError"
    />

    <AppOverlay :percentage="40" />

    <div class="relative z-10 h-full w-full">
      <div
        class="flex h-full w-full -translate-y-24 flex-col items-center justify-center text-white md:translate-y-0"
      >
        <LogoMlkFull
          size="5xl"
          :force-visible="true"
          color-class="text-white/90"
          :aria-label="logoAriaLabel ?? accessibleTitle ?? 'Accueil'"
        />
      </div>

      <nav
        aria-label="Navigation principale"
        class="pointer-events-none absolute bottom-10 left-1/2 flex w-full max-w-[92vw] -translate-x-1/2 flex-col items-stretch justify-center gap-2 px-4 sm:max-w-2xl sm:gap-3 md:flex-row md:items-stretch lg:bottom-18 lg:gap-3 lg:px-0 2xl:bottom-36 2xl:max-w-7xl 2xl:gap-6"
      >
        <LinkHeroNav
          v-for="item in menuItemsWithAvailability"
          :key="`${item.url}:${item.name}`"
          :to="item.disabled ? undefined : localePath(item.url ?? '/')"
          :disabled="item.disabled"
        >
          <span>{{ item.name }}</span>

          <span v-if="item.text" class="sr-only">
            {{ item.text }}
          </span>
        </LinkHeroNav>
      </nav>

      <div
        class="pointer-events-none absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center text-white/70 md:bottom-6"
        aria-hidden="true"
      >
        <UButton
          aria-label="Aller au screen suivant"
          variant="ghost"
          color="neutral"
          class="group pointer-events-auto inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border-0 bg-transparent p-3 text-white/88 shadow-none ring-0 transition-transform duration-200 hover:-translate-y-1 hover:bg-transparent hover:text-white"
          :ui="{
            base: 'cursor-pointer rounded-full border-0 bg-transparent shadow-none ring-0',
          }"
          @click="emit('next-screen')"
        >
          <UIcon name="i-heroicons-arrow-down" class="animate-bounce text-2xl opacity-80" />
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import type { ScreenColumnTemplate } from '#shared/types/screenNavigator'
import type { CreativeWork, MediaObject, MenuItem } from '@schemas/interfaces'

import { IMAGE_PRESETS } from '~/composables/useAppImage'
import { useDeviceDetect } from '~/composables/useDeviceDetect'

// 2. Types et constantes statiques
type FullImageScreenProps = {
  data?: CreativeWork
}

type MenuItemWithAvailability = MenuItem & {
  count: number
  disabled: boolean
  text?: string
}

const SCREEN_ID = 'screen-real-estate-full-image'
const column: ScreenColumnTemplate = 'single'
const MOBILE_PORTRAIT_BACKGROUND_TYPE = 'mobile-portrait-background'
const PORTRAIT_HERO_MEDIA_QUERY =
  '(max-width: 767px), (min-width: 768px) and (max-width: 1023px) and (orientation: portrait)'
const HERO_IMAGE_READY_STATE_KEY = 'screen.real-estate-full-image.hero-ready'

// 3. Props et emits
const props = defineProps<FullImageScreenProps>()
const emit = defineEmits<{ 'next-screen': [] }>()

// 4. Composables, stores, routeur
const logger = useLogger({ module: 'screen-real-estate-full-image' })
const { warmQuickActionTarget } = useQuickActionWarmup()
const { getItemsByRealEstateListing } = useAccommodation()
const { isPhoneDevice, isTabletPortrait } = useDeviceDetect()
const metadataStore = useMetadataStore()
const appConfig = useAppConfig()
const localePath = useLocalePath()
const { setScreenMeta, screenColumnTemplate } = useScreenSystem()
const isHeroImageReady = useState<boolean>(HERO_IMAGE_READY_STATE_KEY, () => false)

// 5. Etat local
const isPortraitHeroViewport = ref(isPhoneDevice.value || isTabletPortrait.value)

let portraitHeroMediaQuery: MediaQueryList | null = null
let hasWarmedHeroNavigationTargets = false

// 6. Data inputs
const menuItems = computed<MenuItem[]>(() => props.data?.links ?? [])

// 7. Validation et helpers purs
const getListingSlugFromUrl = (url?: string): string => {
  if (!url) return ''
  return url.split('/').filter(Boolean).at(-1) ?? ''
}

// 8. Computed UI-ready
const menuItemsWithAvailability = computed<MenuItemWithAvailability[]>(() =>
  menuItems.value.map((item) => {
    const listingSlug = getListingSlugFromUrl(item.url)
    const count = getItemsByRealEstateListing(listingSlug).value.length

    return {
      ...item,
      count,
      disabled: count === 0,
    }
  }),
)

const backgroundImage = computed<MediaObject | null>(() => {
  const image = props.data?.image
  return image && typeof image === 'object' && !Array.isArray(image) ? image : null
})

const srOnlyTitle = computed<string | undefined>(() => props.data?.headline)

const logoAriaLabel = computed<string | undefined>(
  () => metadataStore.getApp?.components?.logo?.ariaLabel,
)

const portraitBackgroundImage = computed<MediaObject | null>(() => {
  const portraitPart = (props.data?.hasPart ?? []).find(
    (part) => part.additionalType === MOBILE_PORTRAIT_BACKGROUND_TYPE,
  )
  const image = portraitPart?.image

  return image && typeof image === 'object' && !Array.isArray(image) ? image : null
})

const accessibleTitle = computed<string | undefined>(
  () => srOnlyTitle.value ?? appConfig.organization.fullName,
)

const bgImageUrl = computed<string>(() => backgroundImage.value?.url ?? '')
const bgImageAlt = computed<string>(() => backgroundImage.value?.caption ?? '')
const hasBackgroundImage = computed<boolean>(() => bgImageUrl.value.trim().length > 0)
const bgImagePortraitUrl = computed<string>(() => portraitBackgroundImage.value?.url ?? '')
const bgImagePortraitAlt = computed<string>(
  () => portraitBackgroundImage.value?.caption ?? bgImageAlt.value,
)
const hasPortraitBackgroundImage = computed<boolean>(
  () => bgImagePortraitUrl.value.trim().length > 0,
)

const hasHeroImage = computed<boolean>(() => {
  return hasBackgroundImage.value || hasPortraitBackgroundImage.value
})

const usePortraitHeroImage = computed<boolean>(
  () => hasPortraitBackgroundImage.value && isPortraitHeroViewport.value,
)

const heroImageAlt = computed<string>(() => {
  return usePortraitHeroImage.value
    ? bgImagePortraitAlt.value
    : bgImageAlt.value || bgImagePortraitAlt.value
})

// 9. Actions et handlers
const syncPortraitHeroViewport = (): void => {
  isPortraitHeroViewport.value = portraitHeroMediaQuery?.matches ?? false
}

const handleHeroImageLoad = (): void => {
  isHeroImageReady.value = true
}

const handleHeroImageError = (): void => {
  isHeroImageReady.value = true
}

const warmHeroNavigationTargets = (): void => {
  if (hasWarmedHeroNavigationTargets) return

  const targets = menuItemsWithAvailability.value
    .filter((item) => !item.disabled)
    .map((item) => item.url)
    .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
    .map((url) => localePath(url))

  if (targets.length === 0) return

  hasWarmedHeroNavigationTargets = true

  targets.forEach((to) => {
    warmQuickActionTarget({
      id: `full-image:${to}`,
      to,
    })
  })

  logger.info('Warm hero navigation targets', {
    screenId: SCREEN_ID,
    targets,
  })
}

// 10. Watch et watchEffect
watch(
  () => hasHeroImage.value,
  (hasImage) => {
    if (!hasImage) {
      isHeroImageReady.value = true
    }
  },
  { immediate: true },
)

// 11. Metadonnees ecran ou page

// 12. Lifecycle
onMounted(() => {
  if (!hasHeroImage.value) {
    isHeroImageReady.value = true
  }

  logger.info('Mounted screen', {
    screenId: SCREEN_ID,
    hasBackgroundImage: hasBackgroundImage.value,
    hasPortraitBackgroundImage: hasPortraitBackgroundImage.value,
    menuItemsCount: menuItems.value.length,
  })

  setScreenMeta('screen-landing', {
    type: 'landing',
    logo: {
      visible: false,
    },
    layout: {
      column,
      contentZone: 'none',
      imageZone: 'background',
      hasBackgroundImage: hasBackgroundImage.value,
      backgroundImage: bgImageUrl.value,
    },
  })

  warmHeroNavigationTargets()

  portraitHeroMediaQuery = window.matchMedia(PORTRAIT_HERO_MEDIA_QUERY)
  syncPortraitHeroViewport()
  portraitHeroMediaQuery.addEventListener('change', syncPortraitHeroViewport)
})

onUnmounted(() => {
  logger.info('Unmounted screen', {
    screenId: SCREEN_ID,
    isHeroImageReady: isHeroImageReady.value,
  })

  portraitHeroMediaQuery?.removeEventListener('change', syncPortraitHeroViewport)
  portraitHeroMediaQuery = null
})
</script>
