<template>
  <div class="col-span-2 border-b border-l-2 border-white/5 border-l-transparent py-1.5 pl-2">
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="amenity in AMENITIES"
        :key="amenity.codeValue"
        type="button"
        class="rounded px-2 py-0.5 text-[0.65rem] transition-colors"
        :class="
          isSelected(amenity.codeValue) ? 'text-[#6b7a4a]' : 'text-white/30 hover:text-white/50'
        "
        :style="
          isSelected(amenity.codeValue)
            ? 'background-color: rgba(107, 122, 74, 0.2)'
            : 'background-color: rgba(255, 255, 255, 0.05)'
        "
        :aria-pressed="isSelected(amenity.codeValue)"
        @click="toggle(amenity.codeValue)"
      >
        {{ amenity.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DashboardEditableValue } from '#shared/types/dashboardAccommodation'

defineOptions({ name: 'DashboardAmenitySelector' })

const AMENITIES = [
  { codeValue: 'acces-route', name: 'Accès route' },
  { codeValue: 'accessibilite', name: 'Accessibilité' },
  { codeValue: 'air-conditionne', name: 'Air conditionné' },
  { codeValue: 'alarme', name: 'Alarme' },
  { codeValue: 'chateau-d-eau', name: "Château d'eau" },
  { codeValue: 'climatisation', name: 'Climatisation' },
  { codeValue: 'climatisation-reversible', name: 'Climatisation réversible' },
  { codeValue: 'exposition-sud', name: 'Exposition Sud' },
  { codeValue: 'garage', name: 'Garage' },
  { codeValue: 'gardien', name: 'Gardien' },
  { codeValue: 'hammam', name: 'Hammam' },
  { codeValue: 'jacuzzi', name: 'Jacuzzi' },
  { codeValue: 'piscine-chauffee', name: 'Piscine chauffée' },
  { codeValue: 'room-service', name: 'Room service' },
  { codeValue: 'salle-de-bain', name: 'Salle de bain' },
  { codeValue: 'salle-de-sport', name: 'Salle de sport' },
  { codeValue: 'solarium', name: 'Solarium' },
  { codeValue: 'terrasse-attenante', name: 'Terrasse attenante' },
  { codeValue: 'vue-degagee', name: 'Vue dégagée' },
  { codeValue: 'vue-sur-mer', name: 'Vue sur mer' },
  { codeValue: 'wifi', name: 'Wifi' },
] as const

const props = defineProps<{
  modelValue: DashboardEditableValue
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DashboardEditableValue]
}>()

const selectedValues = computed<string[]>(() => {
  if (!Array.isArray(props.modelValue)) return []
  return props.modelValue.filter((v): v is string => typeof v === 'string')
})

const isSelected = (codeValue: string): boolean => selectedValues.value.includes(codeValue)

const toggle = (codeValue: string): void => {
  const current = selectedValues.value
  const next = current.includes(codeValue)
    ? current.filter((v) => v !== codeValue)
    : [...current, codeValue]
  emit('update:modelValue', next)
}
</script>
