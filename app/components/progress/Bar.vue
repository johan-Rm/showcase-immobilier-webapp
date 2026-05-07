<template>
  <div class="bg-background/15 mx-auto h-1.5 w-full">
    <div
      class="bg-background/90 h-full origin-left"
      :style="{ transform: `scaleX(${progress})` }"
    />
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'

const props = defineProps<{ progress: number }>()
const progress = toRef(props, 'progress')
</script>
