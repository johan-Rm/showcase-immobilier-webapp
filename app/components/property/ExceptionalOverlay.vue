<template>
  <!-- SCREEN_02 — Full image + overlay translucide : image plein écran, panneau semi-opaque
       (desktop) portant le texte. `overlayMode` (dark/light) pilote contraste et accent. -->
  <AppImage
    :src="screen.media[0]?.src ?? ''"
    :alt="screen.media[0]?.alt ?? ''"
    class="absolute inset-0 size-full object-cover"
    sizes="sm:100vw md:100vw lg:100vw xl:100vw 2xl:100vw"
    :loading="eager ? 'eager' : 'lazy'"
    :preload="eager"
    :fetchpriority="eager ? 'high' : 'auto'"
  />
  <div class="bg-foreground/45 md:bg-foreground/20 absolute inset-0" />
  <div
    class="absolute inset-y-0 hidden w-1/2 md:block"
    :class="[screen.reverse ? 'right-0' : 'left-0', overlayPanelClass(screen)]"
  />
  <div
    class="absolute top-1/2 right-6 left-6 z-10 -translate-y-1/2 md:top-[55%] md:w-[40%]"
    :class="screen.reverse ? 'md:right-[5%] md:left-auto' : 'md:left-[5%]'"
  >
    <p :class="overlayLabelClass(screen)">— {{ screen.eyebrow }}</p>
    <h2
      class="text-4xl leading-tight font-light text-balance md:text-5xl"
      :class="overlayTextClass(screen)"
    >
      <span
        v-for="(part, partIndex) in parts"
        :key="partIndex"
        :class="part.accent ? overlayAccentClass(screen) : ''"
        >{{ part.text }}</span
      >
    </h2>
    <p class="mt-5 max-w-md text-base leading-relaxed" :class="overlayTextClass(screen)">
      {{ screen.text }}
    </p>
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import type { ExceptionalScreen } from '#shared/types/exceptional'

import {
  overlayAccentClass,
  overlayLabelClass,
  overlayPanelClass,
  overlayTextClass,
  titleParts,
} from './exceptional.helpers'

// 3. Props et emits
const props = defineProps<{ screen: ExceptionalScreen; eager?: boolean }>()

// 8. Computed UI-ready
const parts = computed(() => titleParts(props.screen))
</script>
