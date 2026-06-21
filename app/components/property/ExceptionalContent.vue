<template>
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
</template>

<script setup lang="ts">
// 1. Imports
import type { ExceptionalScreen } from '#shared/types/exceptional'

import { IMAGE_ACCENT_CLASS, IMAGE_LABEL_CLASS, titleParts } from './exceptional.helpers'

// 3. Props et emits
const props = defineProps<{ screen: ExceptionalScreen; isFirst?: boolean }>()

// 8. Computed UI-ready
const parts = computed(() => titleParts(props.screen))
</script>
