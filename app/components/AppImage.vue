<template>
  <NuxtImg
    :src="props.src"
    :alt="props.alt"
    :width="props.width"
    :height="props.height"
    :preload="props.preload"
    :format="props.format"
    :quality="props.quality"
    :sizes="props.sizes"
    :loading="props.loading"
    :decoding="props.decoding"
    :fetchpriority="props.fetchpriority"
    :fit="props.fit"
    :placeholder="props.placeholder"
    @load="onLoad"
    @error="onError"
  />
</template>

<script setup lang="ts">
// 1. Imports

// 2. Types et constantes statiques
type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'jpg' | 'png'

type LoadingStrategy = 'lazy' | 'eager'

type DecodingStrategy = 'sync' | 'async' | 'auto'

type FetchPriority = 'high' | 'low' | 'auto'

type ObjectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'

/**
 * Recommandations de dimensions source :
 *
 * Desktop / usages principaux
 * - Hero master (HD+), ratio 16:9 : IMAGE_DIMENSIONS.heroMaster
 * - Hero full screen, ratio 16:9 : IMAGE_DIMENSIONS.heroFullScreen
 * - Hero optimise, ratio 16:9 : IMAGE_DIMENSIONS.heroOptimized
 * - Section banner, ratio 16:9 : IMAGE_DIMENSIONS.sectionBanner
 * - Card immobilier (grid), ratio 4:3 : IMAGE_DIMENSIONS.realEstateCard
 * - Card compacte, ratio 1:1 : IMAGE_DIMENSIONS.compactCard
 * - Galerie (lightbox), ratio 4:3 : IMAGE_DIMENSIONS.galleryLightbox
 * - Thumbnail, ratio 1:1 : IMAGE_DIMENSIONS.thumbnail
 *
 * Mobile / responsive
 * - Hero mobile, ratio 4:5 : IMAGE_DIMENSIONS.heroMobile
 * - Card mobile, ratio 4:3 : IMAGE_DIMENSIONS.cardMobile
 * - Thumbnail mobile, ratio 1:1 : IMAGE_DIMENSIONS.thumbnailMobile
 */
type AppImageProps = {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  preload?: boolean
  sizes?: string
  format?: ImageFormat
  quality?: number
  loading?: LoadingStrategy
  decoding?: DecodingStrategy
  fetchpriority?: FetchPriority
  fit?: ObjectFit
  placeholder?: boolean | string
}

// 3. Props et emits
const props = withDefaults(defineProps<AppImageProps>(), {
  width: undefined,
  height: undefined,
  sizes: 'xs:100vw sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw',
  format: 'webp',
  quality: 80,
  preload: false,
  loading: 'lazy',
  decoding: 'async',
  fetchpriority: 'auto',
  fit: 'cover',
  placeholder: false,
})

const emit = defineEmits<{
  loaded: [payload: { src: string; time: number }]
  error: [payload: { src: string; time: number; error: string | Event }]
}>()

// 4. Composables, stores, routeur

// 5. Etat local

// 6. Data inputs

// 7. Validation et helpers purs

// 8. Computed UI-ready

// 9. Actions et handlers
const waitForNextPaint = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

const decodeImage = async (event: string | Event): Promise<void> => {
  if (typeof event === 'string') return

  const image = event.target instanceof HTMLImageElement ? event.target : null

  if (!image?.decode) return

  try {
    await image.decode()
  } catch {
    // L'événement load reste suffisant si decode échoue sur une image déjà chargée.
  }
}

const onLoad = async (event: string | Event) => {
  await decodeImage(event)
  await waitForNextPaint()

  const payload = {
    src: props.src,
    time: performance.now(),
  }

  emit('loaded', payload)
}

const onError = (error: string | Event) => {
  emit('error', {
    src: props.src,
    time: performance.now(),
    error,
  })
}

// 10. Watch et watchEffect

// 11. Metadonnees ecran ou page

// 12. Lifecycle
</script>
