<template>
  <div
    class="border-b border-l-2 border-l-transparent border-white/5 px-1 py-1.5"
    :class="multiple ? 'col-span-2' : 'col-span-1'"
  >
    <p class="mb-1 text-[0.65rem] font-semibold tracking-widest text-white/20">{{ label }}</p>

    <!-- Fallback texte libre si le chargement échoue -->
    <template v-if="loadError && !hasOptions">
      <input
        type="text"
        class="w-full bg-transparent text-sm text-white/65 caret-white outline-none"
        :value="stringModel"
        :placeholder="placeholder"
        :aria-label="label"
        @input="onFallbackInput($event as InputEvent)"
      />
    </template>

    <template v-else>
      <UInputMenu
        v-if="multiple"
        :model-value="multiModel"
        :items="options"
        :placeholder="loading ? 'Chargement…' : placeholder"
        :disabled="loading && !hasOptions"
        :loading="creating"
        multiple
        create-item
        :ui="inputMenuUi"
        @update:model-value="onMultiUpdate"
        @create="onCreateItem"
      />
      <UInputMenu
        v-else
        :model-value="singleModel"
        :items="options"
        :placeholder="loading ? 'Chargement…' : placeholder"
        :disabled="loading && !hasOptions"
        :loading="creating"
        create-item
        :ui="inputMenuUi"
        @update:model-value="onSingleUpdate"
        @create="onCreateItem"
      />
      <p v-if="createError" class="mt-1 text-[0.6rem] text-red-400">{{ createError }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DashboardEditableValue } from '#shared/types/dashboardAccommodation'

defineOptions({ name: 'DashboardCategoryCodeSelect' })

const props = defineProps<{
  inCodeSet: string
  modelValue: DashboardEditableValue
  label: string
  placeholder?: string
  multiple?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DashboardEditableValue]
}>()

const { loading, loadError, optionsFor, createCode } = useCategoryCodeOptions()

const creating = ref(false)
const createError = ref<string | null>(null)

const options = computed(() => optionsFor(props.inCodeSet))
const hasOptions = computed(() => options.value.length > 0)

const singleModel = computed<string | null>(() =>
  typeof props.modelValue === 'string' ? props.modelValue : null,
)

const multiModel = computed<string[]>(() =>
  Array.isArray(props.modelValue)
    ? (props.modelValue.filter((v) => typeof v === 'string') as string[])
    : [],
)

const stringModel = computed<string>(() => {
  if (props.multiple) return multiModel.value.join(', ')
  return singleModel.value ?? ''
})

const inputMenuUi = {
  base: 'bg-transparent text-sm text-white/65',
  input: 'text-white/65',
}

const onCreateItem = async (item: { label: string; value: string } | string): Promise<void> => {
  const code = typeof item === 'string' ? item : (item.value ?? item.label)
  if (!code || creating.value) return
  creating.value = true
  createError.value = null
  try {
    await createCode(props.inCodeSet, code)
  } catch (err) {
    createError.value = err instanceof Error ? err.message : 'Erreur lors de la création'
  } finally {
    creating.value = false
  }
}

const onSingleUpdate = (value: string | null): void => {
  emit('update:modelValue', value ?? null)
}

const onMultiUpdate = (values: string[]): void => {
  emit('update:modelValue', values)
}

const onFallbackInput = (event: InputEvent): void => {
  const value = (event.target as HTMLInputElement).value
  if (props.multiple) {
    emit(
      'update:modelValue',
      value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    )
  } else {
    emit('update:modelValue', value || null)
  }
}
</script>
