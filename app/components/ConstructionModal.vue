<template>
  <UModal v-if="isConstructionEnabled" v-model:open="isOpen" :close="false" :ui="modalUi">
    <template #header>
      <!-- Section Haut : Identité -->
      <div class="space-y-1 text-left">
        <h2 class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          MLK • My Little Kasbah
        </h2>
        <p class="text-sm font-medium tracking-[0.15em] text-white/70 uppercase sm:text-base">
          Agence Immobilière Essaouira
        </p>
      </div>

      <UButton
        color="neutral"
        variant="ghost"
        class="text-secondary/50 hover:text-secondary absolute top-4 right-0 inline-flex items-center justify-center !bg-transparent hover:!bg-transparent"
        aria-label="Fermer"
        @click="isOpen = false"
      >
        <UIcon name="i-lucide-x" class="cursor-pointer text-xl" />
      </UButton>
    </template>

    <template #body>
      <!-- Section Milieu : Status Construction -->
      <div class="space-y-2 text-white">
        <div class="text-secondary mx-auto flex items-center justify-center">
          <UIcon name="i-lucide-construction" class="text-5xl" />
        </div>
        <div class="space-y-4">
          <h3 class="text-secondary mb-8 text-xl font-semibold sm:text-2xl">
            Site en construction
          </h3>
          <p class="text-base leading-relaxed text-white/80">
            Nous préparons une nouvelle expérience digitale.<br />
            <span class="font-medium text-white">La navigation n'est pas encore activée</span>
            durant cette phase finale.
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <!-- Section Bas : Contact -->
      <div class="w-full space-y-4 text-white">
        <div class="grid grid-cols-1 gap-2.5">
          <a
            :href="`mailto:${EMAIL}`"
            class="inline-flex w-full items-center justify-center gap-1.5 px-2 py-1.5 text-[0.95rem] leading-tight font-semibold text-white transition sm:gap-2 sm:py-2 sm:text-base"
          >
            <UIcon name="i-lucide-mail" class="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            <span class="whitespace-nowrap sm:hidden">NOUS ECRIRE</span>
            <span class="hidden whitespace-nowrap sm:inline">{{ EMAIL }}</span>
          </a>

          <div class="grid grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-3">
            <a
              v-for="phoneEntry in phoneEntries"
              :key="phoneEntry.href"
              :href="phoneEntry.href"
              class="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-[0.95rem] leading-tight font-semibold text-white transition sm:gap-2 sm:py-2 sm:text-sm"
            >
              <UIcon name="i-lucide-phone" class="h-4 w-4 shrink-0" />
              <span class="whitespace-nowrap">{{ phoneEntry.label }} {{ phoneEntry.phone }}</span>
            </a>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
// 1. Imports
import { useConstructionModal } from '~/composables/useConstructionModal'

// 2. Types et constantes statiques
const modalUi = {
  overlay: 'bg-background/70 backdrop-blur-sm',
  content: 'bg-foreground text-background shadow-2xl overflow-hidden ring-0 sm:max-w-2xl',
  header: 'p-6',
  body: 'p-8 text-center',
  footer: 'p-6 text-center',
} as const

// 3. Props et emits

// 4. Composables, stores, routeur
const { isConstructionEnabled, isOpen } = useConstructionModal()

const appConfig = useAppConfig()

// 5. Etat local

// 6. Data inputs
const EMAIL = appConfig.organization.email

// 7. Validation et helpers purs

// 8. Computed UI-ready
const phoneEntries = computed(() =>
  getOrganizationPhoneEntries(appConfig.organization.phoneNumbers ?? []),
)

// 9. Actions et handlers

// 10. Watch et watchEffect

// 11. Metadonnees ecran ou page

// 12. Lifecycle
</script>
