<template>
  <!-- Zone centrée : infos du bien actif -->
  <div class="grid min-h-0 flex-1 place-items-center px-5 py-10 text-center sm:px-8">
    <div v-if="accommodation" class="w-full max-w-3xl">
      <div v-if="!accommodation.preview.isActive" class="mx-auto mb-4 flex justify-center">
        <UBadge color="warning" variant="soft" icon="i-lucide-eye-off">Inactif</UBadge>
      </div>

      <div
        class="bg-background/90 mb-6 flex w-full items-center justify-center gap-1.5 rounded-lg px-5 py-1.5 text-sm font-semibold tracking-[0.16em] text-white uppercase"
      >
        <UIcon name="i-lucide-map-pin" class="shrink-0" aria-hidden="true" />
        <span class="truncate">{{ accommodation.preview.placeLabel || 'Lieu non renseigné' }}</span>
      </div>

      <h3
        class="font-heading mt-2 font-black text-white uppercase [--h3-size:clamp(1.8rem,9vw,2.8rem)] md:[--h3-size:clamp(2.4rem,3.5vw,4.6rem)]"
      >
        {{ accommodation.preview.title }}
      </h3>

      <div
        class="text-background/90 mt-3 flex flex-col items-center gap-3 px-4 font-black sm:px-6 md:flex-row md:items-end md:justify-between md:gap-6 2xl:mt-5 2xl:px-10"
      >
        <div
          class="flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 uppercase sm:gap-x-5 md:justify-start md:gap-x-6 2xl:gap-x-8"
        >
          <p class="flex items-center gap-1.5 whitespace-nowrap 2xl:gap-2">
            <UIcon
              name="i-lucide-hash"
              class="text-xs md:text-base 2xl:text-lg"
              aria-hidden="true"
            />
            <span class="text-sm md:text-lg 2xl:text-2xl">
              {{ accommodation.preview.identifier || '—' }}
            </span>
          </p>

          <p class="flex items-center gap-1.5 whitespace-nowrap 2xl:gap-2">
            <UIcon
              name="i-lucide-expand"
              class="text-xs md:text-base 2xl:text-lg"
              aria-hidden="true"
            />
            <span class="text-sm md:text-lg 2xl:text-2xl">
              {{ accommodation.preview.floorSize ? `${accommodation.preview.floorSize} m²` : '—' }}
            </span>
          </p>

          <p class="flex items-center gap-1.5 whitespace-nowrap 2xl:gap-2">
            <UIcon
              name="i-lucide-bed-double"
              class="text-xs md:text-base 2xl:text-lg"
              aria-hidden="true"
            />
            <span class="text-sm md:text-lg 2xl:text-2xl">
              {{ accommodation.preview.numberOfBedrooms ?? '—' }}
            </span>
          </p>
        </div>

        <span
          class="max-w-full text-center text-[clamp(1.5rem,5vw,2.5rem)] leading-none font-black uppercase md:shrink-0 md:text-right md:text-[clamp(1.8rem,2.5vw,3rem)] 2xl:text-5xl"
        >
          {{ formattedPrice }}
        </span>
      </div>
    </div>

    <div v-else class="max-w-xl text-white">
      <p class="text-sm font-semibold tracking-[0.18em] uppercase">Aucun bien</p>
      <p class="mt-3 text-white/70">Aucun bien ne correspond aux filtres actuels.</p>
    </div>
  </div>

  <!-- Barre de contrôle centrale : ← Edit → -->
  <div
    v-if="accommodation"
    class="pointer-events-auto absolute bottom-20 left-1/2 z-20 -translate-x-1/2 lg:bottom-10"
  >
    <div
      class="flex items-center gap-1 rounded-xl p-1.5"
      style="background-color: rgba(33, 33, 33, 0.82)"
    >
      <button
        type="button"
        class="flex items-center rounded-lg px-3 py-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25"
        :disabled="filteredCount <= 1"
        aria-label="Bien précédent"
        @click="emit('prev')"
      >
        <span
          aria-hidden="true"
          class="block h-4 w-0.5 rounded-full bg-white/50 transition-colors duration-200 group-hover:bg-white lg:h-8"
        />
        <UIcon name="i-lucide-chevron-left" class="text-2xl leading-none" aria-hidden="true" />
      </button>

      <button
        type="button"
        class="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-opacity"
        aria-label="Éditer le bien"
        style="background-color: #6b7a4a"
        @click="emit('edit')"
      >
        Modifier le bien
      </button>

      <button
        type="button"
        class="flex items-center rounded-lg px-3 py-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-25"
        :disabled="filteredCount <= 1"
        aria-label="Bien suivant"
        @click="emit('next')"
      >
        <UIcon name="i-lucide-chevron-right" class="text-2xl leading-none" aria-hidden="true" />
        <span
          aria-hidden="true"
          class="block h-4 w-0.5 rounded-full bg-white/50 transition-colors duration-200 group-hover:bg-white lg:h-8"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import type { DashboardAccommodation } from '#shared/types/dashboardAccommodation'

// 2. Types et constantes statiques

// 3. Props et emits
const props = defineProps<{
  accommodation: DashboardAccommodation | null
  filteredCount: number
}>()

const emit = defineEmits<{
  prev: []
  next: []
  edit: []
}>()

// 4. Composables, stores, routeur

// 5. Etat local

// 6. Data inputs

// 7. Validation et helpers purs

// 8. Computed UI-ready
const formattedPrice = computed<string>(() => {
  const preview = props.accommodation?.preview
  if (!preview) return ''
  if (!preview.price) return preview.priceSpecification || 'Prix sur demande'

  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: preview.priceCurrency || 'EUR',
      maximumFractionDigits: 0,
    }).format(preview.price)
  } catch {
    return `${preview.price} ${preview.priceCurrency}`
  }
})

// 9. Actions et handlers

// 10. Watch et watchEffect

// 11. Metadonnees ecran ou page

// 12. Lifecycle
</script>
