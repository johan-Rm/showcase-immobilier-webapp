<template>
  <!-- Topbar mobile (lg:hidden) -->
  <div class="fixed top-0 right-0 left-0 z-20 flex flex-col bg-[#212121] lg:hidden">
    <div class="h-0.5 w-full shrink-0 bg-[#6B7A4A]" />

    <div class="flex shrink-0 items-center gap-3 px-4 py-2.5">
      <p class="flex-1 text-[0.6rem] font-semibold tracking-[0.22em] text-white/40 uppercase">
        Dashboard
      </p>
      <span class="text-[0.7rem] text-white/35">
        {{ filteredCount }} bien{{ filteredCount > 1 ? 's' : '' }}
      </span>
      <button
        type="button"
        class="rounded p-1 text-white/35 transition-colors hover:text-white/70"
        :aria-label="isTopbarOpen ? 'Réduire' : 'Développer'"
        @click="isTopbarOpen = !isTopbarOpen"
      >
        <UIcon
          :name="isTopbarOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="text-sm"
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        class="rounded p-1 text-white/35 transition-colors hover:text-white/70"
        aria-label="Se déconnecter"
        @click="emit('logout')"
      >
        <UIcon name="i-lucide-log-out" class="text-sm" aria-hidden="true" />
      </button>
    </div>

    <div v-if="isTopbarOpen" class="flex max-h-[70dvh] flex-col border-t border-white/10">
      <div class="shrink-0 px-4 pt-1">
        <DashboardSidebarFilters
          variant="inline"
          :listing-options="listingOptions"
          :category-options="categoryOptions"
          :selected-listing="selectedListing"
          :selected-category="selectedCategory"
          :identifier-search="identifierSearch"
          @update:selected-listing="emit('update:selectedListing', $event)"
          @update:selected-category="emit('update:selectedCategory', $event)"
          @update:identifier-search="emit('update:identifierSearch', $event)"
        />
      </div>

      <div class="mx-4 h-px shrink-0 bg-white/5" />

      <!-- Compteur -->
      <div class="flex shrink-0 justify-end px-4 py-1.5">
        <span class="text-xs font-semibold text-white/60">
          {{ filteredCount }} bien{{ filteredCount > 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Liste scrollable -->
      <ul v-if="filteredItems.length" class="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
        <li v-for="(item, index) in filteredItems" :key="item.slug">
          <button
            :ref="(el) => setItemRef(mobileItemEls, el, index)"
            type="button"
            class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-white/5"
            :class="index === activeIndex ? 'bg-white/10' : ''"
            @click="selectItem(index)"
          >
            <span
              class="shrink-0 font-mono text-[0.6rem] leading-none"
              :class="index !== activeIndex ? 'text-white/35' : ''"
              :style="index === activeIndex ? 'color: #6B7A4A' : ''"
            >
              {{ item.identifier }}
            </span>
            <span class="min-w-0 truncate text-xs text-white/60">
              {{ item.preview.title }}
            </span>
          </button>
        </li>
      </ul>

      <div class="mx-4 h-px shrink-0 bg-white/5" />

      <div class="shrink-0 px-4 py-2">
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded border border-[#6B7A4A]/35 px-3 py-2 text-xs font-semibold text-[#6B7A4A] transition-colors hover:bg-[#6B7A4A]/10"
          @click="createProperty"
        >
          <UIcon name="i-lucide-plus" class="text-sm" aria-hidden="true" />
          Nouveau bien
        </button>
      </div>

      <div class="shrink-0 px-4 py-3">
        <DashboardSidebarUserCard :user="user" size="sm" />
      </div>
    </div>
  </div>

  <!-- Sidebar droite (desktop uniquement) -->
  <div class="h-0.5 w-full shrink-0 bg-[#6B7A4A]" />

  <div class="flex shrink-0 items-center justify-between px-5 pt-5 pb-4">
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <LogoGd class="h-8 w-auto shrink-0 text-[#6B7A4A]" aria-hidden="true" />
      <div>
        <span
          class="block text-[0.6rem] leading-none font-semibold tracking-[0.28em] whitespace-nowrap text-white/40 uppercase"
        >
          Dashboard
        </span>
        <span
          class="mt-1 block font-[rationale] text-lg leading-none font-medium tracking-wider whitespace-nowrap text-[#6B7A4A]/70 uppercase"
        >
          Graines Digitales
        </span>
      </div>
    </div>
    <UButton
      type="button"
      icon="i-lucide-log-out"
      color="neutral"
      variant="ghost"
      size="xs"
      aria-label="Se déconnecter"
      class="text-white/40 hover:bg-white/10 hover:text-white"
      @click="emit('logout')"
    />
  </div>

  <div class="mx-5 h-0.5 shrink-0 bg-[#6B7A4A]/50" />

  <DashboardSidebarFilters
    variant="dropdown"
    :listing-options="listingOptions"
    :category-options="categoryOptions"
    :selected-listing="selectedListing"
    :selected-category="selectedCategory"
    :identifier-search="identifierSearch"
    @update:selected-listing="emit('update:selectedListing', $event)"
    @update:selected-category="emit('update:selectedCategory', $event)"
    @update:identifier-search="emit('update:identifierSearch', $event)"
  />

  <!-- Compteur -->
  <div class="flex shrink-0 justify-end px-5 py-2">
    <span class="text-xs font-semibold text-white/60">
      {{ filteredCount }} bien{{ filteredCount > 1 ? 's' : '' }}
    </span>
  </div>

  <div class="mx-5 h-px shrink-0 bg-white/5" />

  <!-- Liste des biens : seule zone scrollable -->
  <div class="min-h-0 flex-1 overflow-y-auto">
    <ul v-if="filteredItems.length" class="space-y-0.5 px-5 py-2">
      <li v-for="(item, index) in filteredItems" :key="item.slug">
        <button
          :ref="(el) => setItemRef(desktopItemEls, el, index)"
          type="button"
          class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-white/5"
          :class="index === activeIndex ? 'bg-white/10' : ''"
          @click="emit('select', index)"
        >
          <span
            class="shrink-0 font-mono text-[0.6rem] leading-none"
            :class="index !== activeIndex ? 'text-white/35' : ''"
            :style="index === activeIndex ? 'color: #6B7A4A' : ''"
          >
            {{ item.identifier }}
          </span>
          <span class="min-w-0 truncate text-xs text-white/60">
            {{ item.preview.title }}
          </span>
        </button>
      </li>
    </ul>
  </div>

  <div class="px-5 py-3">
    <button
      type="button"
      class="flex w-full items-center justify-center gap-2 rounded border border-[#6B7A4A]/35 px-3 py-2 text-xs font-semibold text-[#6B7A4A] transition-colors hover:bg-[#6B7A4A]/10"
      @click="emit('create')"
    >
      <UIcon name="i-lucide-plus" class="text-sm" aria-hidden="true" />
      Nouveau bien
    </button>
  </div>

  <div class="mx-5 h-0.5 shrink-0 bg-[#6B7A4A]/50" />

  <div class="px-5 py-5">
    <DashboardSidebarUserCard :user="user" size="md" />
  </div>
</template>

<script setup lang="ts">
// 1. Imports
import type { ComponentPublicInstance } from 'vue'

import LogoGd from '~/assets/logo/logo_gd.svg'

// 2. Types et constantes statiques
type WorkspaceUser = {
  id?: string
  name?: string
  email?: string
  picture?: string
} | null

type SelectOption = { label: string; value: string }

// 3. Props et emits
const props = defineProps<{
  user?: WorkspaceUser
  listingOptions: SelectOption[]
  categoryOptions: SelectOption[]
  selectedListing: string
  selectedCategory: string
  identifierSearch: string
  filteredCount: number
  activeIndex: number
  filteredItems: DashboardAccommodation[]
}>()

const emit = defineEmits<{
  refresh: []
  logout: []
  prev: []
  next: []
  create: []
  select: [index: number]
  'update:selectedListing': [value: string]
  'update:selectedCategory': [value: string]
  'update:identifierSearch': [value: string]
}>()

// 5. Etat local
const isTopbarOpen = ref(false)
const desktopItemEls = new Map<number, HTMLElement>()
const mobileItemEls = new Map<number, HTMLElement>()

// 9. Actions et handlers
const setItemRef = (
  store: Map<number, HTMLElement>,
  el: Element | ComponentPublicInstance | null,
  index: number,
): void => {
  if (el instanceof HTMLElement) store.set(index, el)
  else store.delete(index)
}

const scrollActiveIntoView = async (index: number): Promise<void> => {
  await nextTick()
  desktopItemEls.get(index)?.scrollIntoView({ block: 'nearest' })
  mobileItemEls.get(index)?.scrollIntoView({ block: 'nearest' })
}

const selectItem = (index: number): void => {
  emit('select', index)
  isTopbarOpen.value = false
}

const createProperty = (): void => {
  emit('create')
  isTopbarOpen.value = false
}

// 10. Watch et watchEffect
watch(() => props.activeIndex, scrollActiveIntoView)
</script>
