<template>
  <!-- SCREEN_06 — Duo (2 visuels juxtaposés) + texte. Côte à côte (desktop) / empilés (mobile),
       dégradé sombre, puis bloc texte aligné à droite. -->
  <div class="absolute inset-0 grid grid-rows-2 md:grid-cols-2 md:grid-rows-1">
    <AppImage
      v-for="media in screen.media"
      :key="media.src"
      :src="media.src"
      :alt="media.alt"
      class="size-full object-cover"
      sizes="xs:100vw md:50vw"
      loading="lazy"
    />
  </div>
  <div
    v-if="displayImageOverlayClass"
    class="pointer-events-none absolute inset-0"
    :class="displayImageOverlayClass"
    aria-hidden="true"
  />
  <div
    class="absolute right-6 bottom-28 left-6 z-10 max-w-xl text-right md:right-32 md:bottom-36 md:left-auto"
  >
    <p :class="IMAGE_LABEL_CLASS">— {{ screen.eyebrow }}</p>
    <h2 class="text-4xl leading-tight font-light text-balance text-white md:text-5xl">
      <span v-for="(part, partIndex) in parts" :key="partIndex">{{ part.text }}</span>
    </h2>
    <p class="mt-4 ml-auto max-w-md text-base leading-relaxed text-white">{{ screen.text }}</p>
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import type { ExceptionalScreen } from '#shared/types/exceptional'

import { IMAGE_LABEL_CLASS, imageOverlayClass, titleParts } from './exceptional.helpers'

// 3. Props et emits
const props = defineProps<{ screen: ExceptionalScreen }>()

// 8. Computed UI-ready
const parts = computed(() => titleParts(props.screen))
const displayImageOverlayClass = computed(() =>
  imageOverlayClass(props.screen, 'bg-gradient-to-t from-black/85 via-black/25 to-black/10'),
)
</script>
