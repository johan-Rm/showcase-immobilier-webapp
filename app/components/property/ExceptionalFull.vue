<template>
  <!-- SCREEN_03 — Full image + texte (zone optionnelle). Cas `isFirst` (écran d'ouverture) :
       bloc texte aligné à droite pour ne pas concurrencer la synthèse fixe, sans accent. -->
  <AppImage
    :src="screen.media[0]?.src ?? ''"
    :alt="screen.media[0]?.alt ?? ''"
    class="absolute inset-0 size-full object-cover"
    sizes="sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw"
    :loading="eager ? 'eager' : 'lazy'"
    :preload="eager"
    :fetchpriority="eager ? 'high' : 'auto'"
  />
  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
  <div
    v-if="screen.title"
    class="absolute z-10 max-w-xl text-white"
    :class="
      isFirst
        ? 'right-6 bottom-28 left-6 text-right md:right-32 md:bottom-36 md:left-auto md:max-w-2xl'
        : 'bottom-28 left-6 md:bottom-36 md:left-16'
    "
  >
    <p :class="IMAGE_LABEL_CLASS">— {{ screen.eyebrow }}</p>
    <h2 class="text-4xl leading-tight font-light text-balance md:text-5xl">
      <span
        v-for="(part, partIndex) in parts"
        :key="partIndex"
        :class="part.accent && !isFirst ? IMAGE_ACCENT_CLASS : ''"
        >{{ part.text }}</span
      >
    </h2>
    <p
      v-if="screen.text"
      class="mt-4 max-w-md text-base leading-relaxed text-white"
      :class="isFirst ? 'ml-auto' : ''"
    >
      {{ screen.text }}
    </p>
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import type { ExceptionalScreen } from '#shared/types/exceptional'

import { IMAGE_ACCENT_CLASS, IMAGE_LABEL_CLASS, titleParts } from './exceptional.helpers'

// 3. Props et emits
const props = defineProps<{ screen: ExceptionalScreen; eager?: boolean; isFirst?: boolean }>()

// 8. Computed UI-ready
const parts = computed(() => titleParts(props.screen))
</script>
