<template>
  <div class="flex min-h-0 flex-col">
    <!-- Barre outils -->
    <div class="flex shrink-0 items-center gap-2 border-b border-white/5 px-4 py-2.5">
      <div class="flex min-w-0 flex-1 items-center gap-2 rounded bg-white/5 px-2.5 py-1.5">
        <UIcon name="i-lucide-search" class="shrink-0 text-xs text-white/30" aria-hidden="true" />
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher…"
          class="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/25"
          aria-label="Rechercher une image"
        />
      </div>
      <button
        type="button"
        class="flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-xs transition-colors"
        style="background-color: rgba(107, 122, 74, 0.15); color: #6b7a4a"
        @click="isUploadOpen = true"
      >
        <UIcon name="i-lucide-upload-cloud" class="text-xs" aria-hidden="true" />
        Upload
      </button>
    </div>

    <!-- Compteurs -->
    <div class="shrink-0 border-b border-white/5 px-4 py-1.5">
      <p class="text-[0.6rem] text-white/25">
        {{ allImages.length }} dans le projet · {{ imageIdentifiers.length }} associée{{
          imageIdentifiers.length !== 1 ? 's' : ''
        }}
        <template v-if="search">
          · {{ filteredImages.length }} résultat{{
            filteredImages.length !== 1 ? 's' : ''
          }}</template
        >
      </p>
    </div>

    <!-- Grille -->
    <div
      ref="scrollContainerRef"
      class="relative min-h-0 flex-1 overflow-y-auto"
      @scroll="onScroll"
    >
      <div v-if="!filteredImages.length" class="flex flex-col items-center py-12 text-center">
        <UIcon name="i-lucide-image-off" class="text-2xl text-white/15" aria-hidden="true" />
        <p class="mt-2 text-xs text-white/25">
          {{ allImages.length ? 'Aucun résultat' : 'Aucune image dans le projet' }}
        </p>
      </div>

      <div v-else class="p-4">
        <p class="mb-3 text-[0.6rem] font-semibold tracking-widest text-white/25 uppercase">
          Catalogue ({{ filteredImages.length }})
        </p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="item in filteredImages"
            :key="item.identifier"
            type="button"
            class="group overflow-hidden rounded transition-all focus:outline-none"
            :class="
              isAssociated(item.identifier)
                ? 'ring-2 ring-[#6B7A4A]'
                : 'ring-1 ring-white/5 hover:ring-white/20'
            "
            :aria-label="
              isAssociated(item.identifier)
                ? `Retirer ${item.name || item.identifier}`
                : `Associer ${item.name || item.identifier}`
            "
            @click="toggleAssociation(item.identifier)"
          >
            <!-- Miniature carrée -->
            <div class="relative aspect-square overflow-hidden bg-white/5">
              <AppImage
                v-if="item.url"
                :src="item.url"
                :alt="item.name"
                class="h-full w-full object-cover"
                v-bind="IMAGE_PRESETS.thumbnail"
              />
              <div v-else class="flex h-full w-full items-center justify-center">
                <UIcon name="i-lucide-image" class="text-xl text-white/20" aria-hidden="true" />
              </div>

              <!-- Overlay hover -->
              <div
                class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 transition-opacity group-hover:opacity-100"
                :class="isAssociated(item.identifier) ? 'opacity-60' : 'opacity-0'"
              >
                <UIcon
                  :name="isAssociated(item.identifier) ? 'i-lucide-unlink' : 'i-lucide-plus-circle'"
                  class="text-lg text-white/85"
                  aria-hidden="true"
                />
                <span class="text-[0.55rem] text-white/70">{{
                  isAssociated(item.identifier) ? 'Retirer' : 'Associer'
                }}</span>
              </div>

              <!-- Badge principale -->
              <div
                v-if="getAssocMeta(item.identifier)?.representativeOfPage"
                class="absolute top-1 left-1 rounded px-1 py-0.5 text-[0.5rem] font-bold tracking-wide text-white uppercase"
                style="background-color: rgba(107, 122, 74, 0.85)"
              >
                Principale
              </div>

              <!-- Badge référence (associées uniquement) -->
              <div
                v-if="isAssociated(item.identifier) && item.reference"
                class="absolute top-1 right-1 rounded px-1 py-0.5 font-mono text-[0.45rem] font-semibold tracking-wider text-white/80"
                style="background-color: rgba(0, 0, 0, 0.55)"
              >
                {{ item.reference }}
              </div>

              <!-- Caption en bas de l'image -->
              <div
                class="absolute inset-x-0 bottom-0 px-1.5 py-1.5"
                :class="isAssociated(item.identifier) ? 'bg-[#6B7A4A]/80' : 'bg-black/60'"
              >
                <p
                  class="line-clamp-2 text-[0.55rem] leading-snug"
                  :class="isAssociated(item.identifier) ? 'text-white/90' : 'text-white/60'"
                >
                  {{ item.name }}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Bouton scroll to top -->
      <Transition
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <button
          v-if="showScrollTop"
          type="button"
          class="sticky bottom-4 left-full mr-4 flex h-7 w-7 -translate-x-full items-center justify-center rounded-full shadow-lg transition-colors"
          style="background-color: rgba(107, 122, 74, 0.85)"
          aria-label="Retour en haut"
          @click="scrollToTop"
        >
          <UIcon name="i-lucide-chevron-up" class="text-sm text-white" aria-hidden="true" />
        </button>
      </Transition>
    </div>
  </div>

  <!-- Modal upload -->
  <DashboardPropertyMediaPickerModal v-model:open="isUploadOpen" @uploaded="onUploaded" />
</template>

<script setup lang="ts">
import type { MediaObject } from '@schemas/interfaces'

type AssocItem = {
  image: string
  caption: string
  keywords: string[]
  representativeOfPage: boolean
}

type ResolvedImage = {
  identifier: string
  url: string
  name: string
  reference: string
}

defineOptions({ name: 'DashboardPropertyMediaGallery' })

const props = defineProps<{
  associatedMedia: DashboardEditableValue
}>()

const emit = defineEmits<{
  'update:associatedMedia': [value: DashboardEditableValue]
}>()

const metadataStore = useMetadataStore()

const search = ref('')
const isUploadOpen = ref(false)
const scrollContainerRef = ref<HTMLDivElement | null>(null)
const showScrollTop = ref(false)

const onScroll = (): void => {
  showScrollTop.value = (scrollContainerRef.value?.scrollTop ?? 0) > 200
}

const scrollToTop = (): void => {
  scrollContainerRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

const parsedAssocMedia = computed<AssocItem[]>(() => {
  if (!Array.isArray(props.associatedMedia)) return []
  return props.associatedMedia.flatMap((entry) => {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return []
    const obj = entry as Record<string, DashboardEditableValue>
    return [
      {
        image: typeof obj.image === 'string' ? obj.image : '',
        caption: typeof obj.caption === 'string' ? obj.caption : '',
        keywords: Array.isArray(obj.keywords)
          ? obj.keywords.filter((k): k is string => typeof k === 'string')
          : [],
        representativeOfPage: obj.representativeOfPage === true,
      },
    ]
  })
})

const imageIdentifiers = computed<string[]>(() =>
  parsedAssocMedia.value.map((a) => a.image).filter(Boolean),
)

const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const deriveReference = (mainEntity: string, identifier: string): string => {
  if (mainEntity && mainEntity !== 'ImageObject') return mainEntity
  if (uuidRe.test(identifier)) return ''
  return (identifier.split('-')[0] ?? '').toUpperCase()
}

const allImages = computed<ResolvedImage[]>(() =>
  metadataStore.getImageObjects
    .map((img) => ({
      identifier: img.identifier,
      url: img.url,
      name: img.caption || img.identifier,
      reference: deriveReference(img.mainEntity, img.identifier),
    }))
    .sort((a, b) => a.name.localeCompare(b.name)),
)

const filteredImages = computed<ResolvedImage[]>(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return allImages.value
  return allImages.value.filter(
    (img) =>
      img.reference.toLowerCase().includes(q) ||
      img.identifier.toLowerCase().includes(q) ||
      img.name.toLowerCase().includes(q),
  )
})

const getAssocMeta = (identifier: string): AssocItem | undefined =>
  parsedAssocMedia.value.find((a) => a.image === identifier)

const isAssociated = (identifier: string): boolean => imageIdentifiers.value.includes(identifier)

const emitAssocMedia = (items: AssocItem[]): void => {
  emit('update:associatedMedia', items)
}

const associate = (identifier: string): void => {
  if (imageIdentifiers.value.includes(identifier)) return
  emitAssocMedia([
    ...parsedAssocMedia.value,
    { image: identifier, caption: '', keywords: [], representativeOfPage: false },
  ])
}

const dissociate = (identifier: string): void => {
  emitAssocMedia(parsedAssocMedia.value.filter((a) => a.image !== identifier))
}

const toggleAssociation = (identifier: string): void => {
  if (isAssociated(identifier)) {
    dissociate(identifier)
  } else {
    associate(identifier)
  }
}

const onUploaded = (mediaObjects: MediaObject[]): void => {
  for (const mediaObject of mediaObjects) {
    associate(mediaObject.identifier)
  }
}
</script>
