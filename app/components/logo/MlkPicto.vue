<template>
  <div class="inline-flex items-center justify-center" role="img" :aria-label="props.ariaLabel">
    <LogoPictoSvg
      class="w-auto shrink-0 object-contain"
      :class="[{ 'logo-mlk-picto--mono': props.mono }, props.colorClass, sizeClass]"
      :style="inlineSize"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import LogoPictoSvg from '~/assets/logo/picto.svg'

type PresetSize = 'xs' | 'sm' | 'md' | 'lg'

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
    ariaLabel: 'MLK - My Little Kasbah picto',
  },
)

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
</script>

<style scoped>
.logo-mlk-picto--mono :deep(path),
.logo-mlk-picto--mono :deep(rect),
.logo-mlk-picto--mono :deep(circle),
.logo-mlk-picto--mono :deep(ellipse),
.logo-mlk-picto--mono :deep(polygon),
.logo-mlk-picto--mono :deep(polyline) {
  fill: currentColor;
  stroke: currentColor;
}

.logo-mlk-picto--mono :deep([fill='white']),
.logo-mlk-picto--mono :deep([style*='fill:white']),
.logo-mlk-picto--mono :deep([style*='fill: white']) {
  fill: white;
}
</style>
