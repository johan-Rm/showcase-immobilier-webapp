<template>
  <USelectMenu
    :model-value="modelValue"
    :items="items"
    value-key="value"
    label-key="label"
    :search-input="false"
    placeholder="Type d'écran"
    :ui="{
      base: 'bg-transparent border-0 border-b border-[#6B7A4A]/60 rounded-none text-white/85 hover:bg-white/5',
    }"
    @update:model-value="(value: string) => emit('update:modelValue', value)"
  />
</template>

<script setup lang="ts">
// 1. Imports
import { DASHBOARD_SCREEN_TEMPLATES } from '#shared/types/dashboardAccommodation'

defineOptions({ name: 'DashboardScreenTemplateSelect' })

// 3. Props et emits
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// 2. Types et constantes statiques
// Items du select (les objets Nuxt UI portent nativement `icon`). `value` élargi en string
// pour rester aligné sur le model-value (additionalType libre).
const items: { value: string; label: string; icon: string }[] = DASHBOARD_SCREEN_TEMPLATES.map(
  (template) => ({ value: template.value, label: template.label, icon: template.icon }),
)
</script>
