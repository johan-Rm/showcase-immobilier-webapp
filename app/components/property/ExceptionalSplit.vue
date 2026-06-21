<template>
  <!-- SCREEN_04 — Split 50/50 : moitié image + moitié panneau texte sur fond `background`.
       `screen.reverse` permute les deux moitiés sur desktop. Mobile : image en haut (42%). -->
  <div class="flex h-full w-full flex-col md:flex-row">
    <div
      class="relative order-first h-[42%] md:h-full md:w-1/2"
      :class="screen.reverse ? 'md:order-2' : 'md:order-1'"
    >
      <AppImage
        :src="screen.media[0]?.src ?? ''"
        :alt="screen.media[0]?.alt ?? ''"
        class="absolute inset-0 size-full object-cover"
        sizes="xs:100vw md:50vw"
        :loading="eager ? 'eager' : 'lazy'"
        :preload="eager"
        :fetchpriority="eager ? 'high' : 'auto'"
      />
      <div
        v-if="displayImageOverlayClass"
        class="pointer-events-none absolute inset-0"
        :class="displayImageOverlayClass"
        aria-hidden="true"
      />
    </div>
    <div
      class="bg-background text-foreground flex flex-1 flex-col justify-center px-6 py-10 md:w-1/2 md:px-16"
      :class="screen.reverse ? 'md:order-1' : 'md:order-2'"
    >
      <p :class="BACKGROUND_LABEL_CLASS">— {{ screen.eyebrow }}</p>
      <h2 class="text-4xl leading-tight font-light text-balance md:text-5xl">
        <span
          v-for="(part, partIndex) in parts"
          :key="partIndex"
          :class="part.accent ? BACKGROUND_ACCENT_CLASS : ''"
          >{{ part.text }}</span
        >
      </h2>
      <p class="text-foreground mt-5 max-w-md text-base leading-relaxed">{{ screen.text }}</p>
      <ul
        v-if="screen.specs"
        class="text-foreground/70 mt-7 flex flex-wrap gap-x-4 gap-y-2 text-xs tracking-wide"
      >
        <li v-for="spec in screen.specs" :key="spec">{{ spec }}</li>
      </ul>
      <button
        v-if="screen.cta"
        type="button"
        class="border-foreground/50 mt-8 inline-flex w-fit items-center gap-2 border-b pb-1 text-base transition-opacity hover:opacity-70"
        @click="emit('go-next')"
      >
        {{ screen.cta }} <span aria-hidden="true">→</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import type { ExceptionalScreen } from '#shared/types/exceptional'

import {
  BACKGROUND_ACCENT_CLASS,
  BACKGROUND_LABEL_CLASS,
  imageOverlayClass,
  titleParts,
} from './exceptional.helpers'

// 2. Types et constantes statiques

// 3. Props et emits
const props = defineProps<{ screen: ExceptionalScreen; eager?: boolean }>()
const emit = defineEmits<{ 'go-next': [] }>()

// 8. Computed UI-ready
const parts = computed(() => titleParts(props.screen))
const displayImageOverlayClass = computed(() => imageOverlayClass(props.screen))
</script>
