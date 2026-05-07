<template>
  <div
    class="absolute inset-0 bg-black"
    :style="{ opacity: normalizedOpacity }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    percentage?: number
  }>(),
  {
    percentage: 35,
  },
)

const normalizedOpacity = computed(() => {
  const safeValue = Number.isFinite(props.percentage) ? props.percentage : 0
  return Math.min(100, Math.max(0, safeValue)) / 100
})
</script>
