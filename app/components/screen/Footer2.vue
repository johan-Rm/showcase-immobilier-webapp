<template>
  <div class="screen-footer bg-background text-foreground relative h-full w-full overflow-hidden">
    <AppImage
      :src="backgroundImage.url"
      :alt="backgroundImage.alt"
      class="screen-footer__image absolute inset-0 h-full w-full object-cover object-center"
      :loading="props.imageLoading ?? 'lazy'"
      fetchpriority="low"
      :placeholder="false"
      fit="cover"
    />
  </div>
</template>

<script setup lang="ts">
import type { ScreenColumnTemplate } from '#shared/types/screenNavigator'
import type { CreativeWork, MediaObject } from '@schemas/interfaces'

type FooterScreenProps = {
  data?: CreativeWork
  imageLoading?: 'lazy' | 'eager'
}

type RawImageObject = {
  url?: string
  alt?: string
  caption?: string
}

const props = defineProps<FooterScreenProps>()
const { setScreenMeta } = useScreenSystem()
const columnTemplate: ScreenColumnTemplate = 'single'
const bgImageUrl = '/images/essaouira-navigation-hero.jpg'

const backgroundImage = computed<{ url: string; alt: string }>(() => {
  const image = props.data?.image

  if (typeof image === 'string' && image.trim().length > 0) {
    return {
      url: image,
      alt: 'My Little Kasbah',
    }
  }

  if (image && typeof image === 'object' && 'url' in image && typeof image.url === 'string') {
    const rawImage = image as MediaObject | RawImageObject
    const url = image.url.trim()

    if (url.length > 0) {
      const alt =
        ('alt' in rawImage && typeof rawImage.alt === 'string' && rawImage.alt.trim().length > 0
          ? rawImage.alt
          : undefined) ??
        ('caption' in rawImage &&
        typeof rawImage.caption === 'string' &&
        rawImage.caption.trim().length > 0
          ? rawImage.caption
          : undefined) ??
        'My Little Kasbah'

      return {
        url,
        alt,
      }
    }
  }

  return {
    url: bgImageUrl,
    alt: 'My Little Kasbah',
  }
})

onMounted(() => {
  setScreenMeta('screen-footer', {
    type: 'standard',
    logo: {
      visible: true,
    },
    socialNetwork: {
      visible: true,
      backgroundTone: 'black',
    },
    layout: {
      column: columnTemplate,
      contentZone: 'full',
      imageZone: 'none',
      hasBackgroundImage: false,
    },
  })
})
</script>
