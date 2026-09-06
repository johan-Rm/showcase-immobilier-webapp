<template>
  <div class="inline-flex items-center justify-center" role="img" :aria-label="props.ariaLabel">
    <LogoPictoSvg
      class="w-auto shrink-0 object-contain"
      :class="[{ 'logo-bpi-picto--mono': props.mono }, props.colorClass, sizeClass]"
      :style="inlineSize"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import { computed } from 'vue'

import LogoPictoSvg from '~/assets/logo/picto.svg'

// 2. Types et constantes statiques
type PresetSize = 'xs' | 'sm' | 'md' | 'lg'

// 3. Props et emits
const props = withDefaults(
  defineProps<{
    colorClass?: string
    size?: PresetSize | number
    mono?: boolean
    ariaLabel?: string
  }>(),
  {
    colorClass: 'text-primary',
    size: 'sm',
    mono: true,
    ariaLabel: 'BPI - Blueprint Immobilier picto',
  },
)

// 4. Composables, stores, routeur

// 5. Etat local

// 6. Data inputs

// 7. Validation et helpers purs

// 8. Computed UI-ready
const sizeClass = computed(() => {
  if (typeof props.size === 'number') return ''
  const map: Record<PresetSize, string> = {
    xs: 'h-4',
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  }
  return map[props.size] ?? map.sm
})

const inlineSize = computed(() =>
  typeof props.size === 'number' ? { height: `${props.size}px` } : undefined,
)

// 9. Actions et handlers

// 10. Watch et watchEffect

// 11. Metadonnees ecran ou page

// 12. Lifecycle
</script>

<style scoped>
.logo-bpi-picto--mono :deep(path),
.logo-bpi-picto--mono :deep(rect),
.logo-bpi-picto--mono :deep(circle),
.logo-bpi-picto--mono :deep(ellipse),
.logo-bpi-picto--mono :deep(polygon),
.logo-bpi-picto--mono :deep(polyline) {
  fill: currentColor;
  stroke: currentColor;
}

.logo-bpi-picto--mono :deep([fill='white']),
.logo-bpi-picto--mono :deep([style*='fill:white']),
.logo-bpi-picto--mono :deep([style*='fill: white']) {
  fill: white;
}
</style>
