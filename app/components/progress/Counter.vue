<template>
  <div
    class="pointer-events-none font-mono text-sm font-semibold text-white 2xl:text-4xl"
    aria-label="Position dans la progression"
  >
    <span class="text-background">{{ String(current).padStart(2, '0') }}</span>
    <span class="opacity-70">/</span>
    <span>{{ String(total).padStart(2, '0') }}</span>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'

const props = defineProps<{ current: number; total: number }>()
const { current, total } = toRefs(props)
</script>
