<template>
  <div class="col-span-2 border-l-2 border-l-transparent py-1.5 pl-2">
    <div v-for="(quality, index) in qualities" :key="index" class="mb-3 last:mb-0">
      <div class="mb-1.5 flex items-center gap-2">
        <input
          type="text"
          class="min-w-0 flex-1 bg-transparent text-[0.7rem] font-semibold tracking-widest text-white/50 uppercase caret-white outline-none placeholder:text-white/20"
          :value="quality.name"
          placeholder="Nom"
          @input="updateName(index, ($event.target as HTMLInputElement).value)"
        />
        <span class="shrink-0 text-[0.65rem] text-white/30 tabular-nums">
          {{ quality.value }}
        </span>
      </div>
      <USlider
        :model-value="quality.value"
        :min="0"
        :max="100"
        :step="1"
        :ui="{
          track: 'bg-white/10',
          range: 'bg-[#6B7A4A]',
          thumb: 'ring-[#6B7A4A] bg-[#6B7A4A]',
        }"
        @update:model-value="updateValue(index, $event as number)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DashboardQualitiesEditor' })

type Quality = { name: string; value: number }

const props = defineProps<{
  modelValue: DashboardEditableValue
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DashboardEditableValue]
}>()

const DEFAULT_QUALITIES: Quality[] = [
  { name: 'Confort', value: 0 },
  { name: 'Architecture', value: 0 },
  { name: 'Intérieur', value: 0 },
]

const qualities = computed<Quality[]>(() => {
  const incoming = Array.isArray(props.modelValue)
    ? props.modelValue.flatMap((item) => {
        if (item === null || typeof item !== 'object' || Array.isArray(item)) return []
        const name = typeof item.name === 'string' ? item.name : ''
        const value = typeof item.value === 'number' ? item.value : 0
        return [{ name, value }]
      })
    : []

  return DEFAULT_QUALITIES.map(({ name }) => {
    const found = incoming.find((q) => q.name === name)
    return found ?? { name, value: 0 }
  })
})

const emitUpdate = (next: Quality[]): void => {
  emit('update:modelValue', next)
}

const updateName = (index: number, name: string): void => {
  const next = qualities.value.map((q, i) => (i === index ? { ...q, name } : q))
  emitUpdate(next)
}

const updateValue = (index: number, value: number): void => {
  const next = qualities.value.map((q, i) => (i === index ? { ...q, value } : q))
  emitUpdate(next)
}
</script>
