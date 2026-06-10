<template>
  <!-- RÉGION F — Panneau d'infos du bien (drawer gauche). Ouvert depuis la synthèse fixe.
       Voile cliquable (ferme) + drawer (nom, localisation, badges, référence, CTA visite). -->
  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div v-if="open" class="fixed inset-0 z-[70] bg-black/55" @click.self="emit('close')" />
  </Transition>

  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-200 ease-in"
    enter-from-class="-translate-x-full"
    leave-to-class="-translate-x-full"
  >
    <aside
      v-if="open"
      class="bg-background text-foreground fixed inset-y-0 left-0 z-[71] flex h-dvh w-[min(88vw,24rem)] flex-col overflow-y-auto px-6 py-8 shadow-2xl md:px-8 md:py-10"
      role="dialog"
      aria-modal="true"
      aria-label="Informations du bien"
    >
      <button
        type="button"
        class="text-foreground/60 hover:text-foreground focus-visible:outline-foreground absolute top-4 right-4 flex size-11 items-center justify-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2"
        aria-label="Fermer les informations"
        @click="emit('close')"
      >
        <UIcon name="i-heroicons-x-mark" class="text-2xl" aria-hidden="true" />
      </button>

      <span class="bg-foreground/70 block h-px w-12 rounded-full" aria-hidden="true" />
      <h2 class="mt-4 text-2xl font-bold tracking-[0.04em] uppercase">{{ summary.name }}</h2>
      <p class="text-foreground/60 mt-1 text-sm">{{ summary.location }}</p>

      <ul class="mt-8 flex flex-wrap gap-2">
        <li
          v-for="badge in badges"
          :key="badge.full"
          class="border-foreground/15 bg-foreground/5 rounded-md border px-3 py-1.5 text-xs font-bold tracking-[0.04em]"
        >
          {{ badge.full }}
        </li>
      </ul>

      <dl class="text-foreground/70 mt-8 text-sm">
        <dt class="text-foreground/45 text-xs tracking-[0.18em] uppercase">
          {{ labels.reference }}
        </dt>
        <dd class="mt-1 font-medium">{{ summary.reference }}</dd>
      </dl>

      <button
        type="button"
        class="border-foreground/50 hover:bg-foreground hover:text-background focus-visible:outline-foreground mt-auto inline-flex items-center justify-center gap-2 rounded-md border px-5 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2"
        @click="emit('request-visit')"
      >
        {{ labels.requestVisit }} <span aria-hidden="true">→</span>
      </button>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
// 1. Imports
import type {
  ExceptionalPropertyBadge,
  ExceptionalPropertySummary,
} from '#shared/types/exceptional'

// 3. Props et emits
defineProps<{
  open: boolean
  summary: ExceptionalPropertySummary
  badges: readonly ExceptionalPropertyBadge[]
  labels: { reference: string; requestVisit: string }
}>()
const emit = defineEmits<{ close: []; 'request-visit': [] }>()
</script>
