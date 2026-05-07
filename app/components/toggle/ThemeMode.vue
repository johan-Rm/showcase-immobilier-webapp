<template>
  <div class="flex flex-col items-center gap-2">
    <div
      class="border-border/20 bg-surface/20 pointer-events-auto inline-flex gap-1 rounded-[18px] border p-1 backdrop-blur"
      role="group"
      aria-label="Choisir une ambiance"
    >
      <button
        class="hover:bg-background/10 text-foreground grid h-9 w-9 place-items-center rounded-[16px] transition hover:-translate-y-0.5"
        :class="props.modelValue === 'light' ? '!text-secondary' : ''"
        type="button"
        title="Ambiance: light"
        aria-label="Ambiance: light"
        :aria-pressed="props.modelValue === 'light'"
        @click="setMode('light')"
      >
        <UIcon name="i-lucide-sun" class="h-4.5 w-4.5" />
      </button>

      <button
        class="hover:bg-background/10 text-foreground grid h-9 w-9 place-items-center rounded-[16px] transition hover:-translate-y-0.5"
        :class="props.modelValue === 'dark' ? '!text-secondary' : ''"
        type="button"
        title="Ambiance: dark"
        aria-label="Ambiance: dark"
        :aria-pressed="props.modelValue === 'dark'"
        @click="setMode('dark')"
      >
        <UIcon name="i-lucide-moon" class="h-4.5 w-4.5" />
      </button>

      <button
        class="hover:bg-background/10 text-foreground grid h-9 w-9 place-items-center rounded-[16px] transition hover:-translate-y-0.5"
        :class="props.modelValue === 'kasbah' ? '!text-secondary' : ''"
        type="button"
        title="Ambiance: kasbah"
        aria-label="Ambiance: kasbah"
        :aria-pressed="props.modelValue === 'kasbah'"
        @click="setMode('kasbah')"
      >
        <UIcon name="i-lucide-flame" class="h-4.5 w-4.5" />
      </button>
    </div>

    <p class="text-foreground text-center text-xs font-medium">
      {{ selectedLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ThemeMode } from '#shared/types/ui'

import { computed } from 'vue'

type Props = {
  modelValue: ThemeMode
}

type Emits = {
  'update:modelValue': [ThemeMode]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const setMode = (mode: ThemeMode): void => {
  emit('update:modelValue', mode)
}

const selectedLabel = computed(() => {
  if (props.modelValue === 'dark') return 'Sombre'
  if (props.modelValue === 'kasbah') return 'Kasbah'
  return 'Clair'
})
</script>
