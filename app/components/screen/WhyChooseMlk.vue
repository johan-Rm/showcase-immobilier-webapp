<template>
  <div class="screen-why-choose-mlk bg-background text-foreground" :class="rootGridClass">
    <div :class="contentColumnClass">
      <div class="relative h-full min-h-0 w-full min-w-0 px-4 pt-20 pb-10 2xl:pt-32 2xl:pb-20">
        <div :class="contentBodyClass">
          <LazyHeadingH2Screen :to="agencyPageLink">
            {{ heading }}
          </LazyHeadingH2Screen>

          <div :class="contentGridClass">
            <LazyParagraphArticles :items="values" />
          </div>
        </div>
      </div>
    </div>

    <div :class="visualColumnClass">
      <LazyAppImage
        v-if="visualImage"
        :src="visualImage.url"
        :alt="visualImage.alt"
        :width="VISUAL_IMAGE_WIDTH"
        class="h-full w-full object-cover"
        fetchpriority="low"
        :placeholder="false"
        decoding="async"
        fit="cover"
        @loaded="onVisualImageLoaded"
      />

      <LazyAppOverlay :percentage="50" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScreenColumnTemplate } from '#shared/types/screenNavigator'
import type { CreativeWork, MediaObject } from '@schemas/interfaces'

import { useAppNavigation } from '~/composables/useAppNavigation'
import { useDeviceDetect } from '~/composables/useDeviceDetect'

type ValueItem = {
  title: string
  accent: string
  description: string
}

type WhyChooseMlkProps = {
  data?: CreativeWork
}

type RawImageObject = {
  url?: string
  alt?: string
  caption?: string
}

const props = defineProps<WhyChooseMlkProps>()

const logger = useLogger({ module: 'screen-why-choose-mlk' })
const { setScreenMeta } = useScreenSystem()
const { IMAGE_DIMENSIONS } = useAppImage()
const localePath = useLocalePath()
const columnTemplate: ScreenColumnTemplate = 'split-67-33'
const VISUAL_IMAGE_WIDTH = IMAGE_DIMENSIONS.vertical3col.width
const { isMobileLandscape, segment, isPhoneDevice, isTabletPortrait } = useDeviceDetect()
const { warmQuickActionTarget } = useQuickActionWarmup()

const { getMenuItemByIdentifier } = useAppNavigation()

let hasWarmedAgencyPageTarget = false

const agencyPageLink = computed<string>(() => {
  const agencyItem = getMenuItemByIdentifier('agency')
  return localePath(agencyItem?.url ?? '/')
})

const heading = computed<string>(() => props.data?.headline?.trim() ?? '')

const values = computed<ValueItem[]>(() => {
  const parts = props.data?.hasPart ?? []

  return parts
    .map((part) => {
      const title = part.headline?.trim()
      const accent = part.alternativeHeadline?.trim()
      const description = part.text?.trim()

      if (!title || !accent || !description) {
        return null
      }

      return {
        title,
        accent,
        description,
      }
    })
    .filter((value): value is ValueItem => value !== null)
})

const visualImage = computed<{ url: string; alt: string } | null>(() => {
  const image = props.data?.image

  if (typeof image === 'string' && image.trim().length > 0) {
    return {
      url: image,
      alt: '',
    }
  }

  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    const rawImage = image as MediaObject | RawImageObject
    const url = image.url.trim()

    if (url.length === 0) {
      return null
    }

    const alt =
      ('alt' in rawImage && typeof rawImage.alt === 'string' && rawImage.alt.trim().length > 0
        ? rawImage.alt
        : undefined) ??
      ('caption' in rawImage &&
      typeof rawImage.caption === 'string' &&
      rawImage.caption.trim().length > 0
        ? rawImage.caption
        : undefined) ??
      ''

    return {
      url,
      alt,
    }
  }

  return null
})

const rootGridClass = computed<string>(() => {
  const baseClass = 'grid min-h-0'

  switch (segment.value) {
    case 'tablet-portrait':
      return `${baseClass} h-screen grid-cols-1 grid-rows-[45%_1fr]`
    case 'tablet-landscape':
    case 'desktop':
    case 'desktop-wide':
      return `${baseClass} h-full grid-cols-[66.67%_33.33%] grid-rows-1`
    case 'mobile-landscape':
    case 'mobile-portrait':
    default:
      return `${baseClass} h-screen grid-cols-1 grid-rows-1`
  }
})

const contentColumnClass = computed<string>(() => {
  const baseClass = 'relative flex h-full'

  return segment.value === 'tablet-portrait'
    ? `${baseClass} row-start-2`
    : `${baseClass} row-start-1`
})

const visualColumnClass = computed<string>(() => {
  const baseClass = 'relative h-full min-h-0 min-w-0 overflow-hidden'

  switch (segment.value) {
    case 'tablet-portrait':
    case 'tablet-landscape':
    case 'desktop':
    case 'desktop-wide':
      return `${baseClass} row-start-1 block`
    case 'mobile-landscape':
    case 'mobile-portrait':
    default:
      return `${baseClass} hidden`
  }
})

const contentBodyClass = computed<string>(() => {
  const baseClass = 'flex h-full min-h-0 flex-1 items-center justify-center'

  return segment.value === 'mobile-landscape' ? baseClass : `${baseClass} py-8 pb-12`
})

const contentGridClass = computed<string>(() => {
  const baseClass = 'grid h-full w-full place-items-center gap-0 text-center sm:grid-cols-2'

  return isMobileLandscape.value ? baseClass : `${baseClass} md:gap-6 lg:gap-10`
})

const warmAgencyPageTarget = (): void => {
  if (hasWarmedAgencyPageTarget) return

  const to = agencyPageLink.value
  if (!to || to === '/') return

  hasWarmedAgencyPageTarget = true

  warmQuickActionTarget({
    id: `why-choose-mlk:${to}`,
    to,
  })

  logger.info('Warm agency page target', {
    screenId: 'screen-why-choose-mlk',
    target: to,
  })
}

const onVisualImageLoaded = (payload: { src: string; time: number }) => {
  logger.info('Visual image loaded', {
    screenId: 'screen-why-choose-mlk',
    src: payload.src,
    time: payload.time,
  })
}

onMounted(() => {
  logger.info('Mounted screen', {
    screenId: 'screen-why-choose-mlk',
    hasVisualImage: Boolean(visualImage.value?.url),
    valuesCount: values.value.length,
  })

  setScreenMeta('screen-why-choose-mlk', {
    type: 'standard',
    logo: {
      visible: true,
    },
    layout: {
      column: columnTemplate,
      contentZone: isPhoneDevice.value || isTabletPortrait.value ? 'top' : 'left',
      imageZone: isPhoneDevice.value || isTabletPortrait.value ? 'none' : 'right',
    },
  })

  warmAgencyPageTarget()
})

onUnmounted(() => {
  logger.info('Unmounted screen', {
    screenId: 'screen-why-choose-mlk',
  })
})
</script>
