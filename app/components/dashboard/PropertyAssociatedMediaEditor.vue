<template>
  <div>
    <!-- Liste des images associées -->
    <div v-if="resolvedItems.length" class="mb-3">
      <div
        v-for="(item, index) in resolvedItems"
        :key="item.identifier"
        class="flex min-h-14 gap-3 border-b border-white/5 py-2.5 last:border-0"
      >
        <!-- Vignette -->
        <div class="shrink-0">
          <div class="relative h-14 w-18 overflow-hidden rounded bg-white/5">
            <AppImage
              v-if="item.url"
              :src="item.url"
              :alt="item.name"
              class="h-full w-full object-cover"
              v-bind="IMAGE_PRESETS.thumbnail"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <UIcon name="i-lucide-image" class="text-sm text-white/20" aria-hidden="true" />
            </div>
          </div>
        </div>

        <!-- Texte alt -->
        <div class="min-w-0 flex-1">
          <span
            class="text-[0.55rem] font-semibold tracking-widest uppercase"
            style="color: #6b7a4a"
            >Texte alt</span
          >
          <input
            v-if="editingAlt === item.identifier"
            :ref="setAltInputRef"
            type="text"
            :value="getCaptionFor(item.identifier)"
            placeholder="Description de l'image pour les lecteurs d'écran et le SEO"
            class="mt-0.5 w-full border-b border-white/20 bg-transparent pb-0.5 text-xs text-white/90 caret-white outline-none placeholder:text-white/20"
            :aria-label="`Texte alternatif pour ${item.identifier}`"
            @input="updateCaption(item.identifier, ($event.target as HTMLInputElement).value)"
            @blur="editingAlt = null"
            @keydown.enter="editingAlt = null"
            @keydown.escape="editingAlt = null"
          />
          <button
            v-else
            type="button"
            class="mt-0.5 w-full text-left text-xs transition-colors"
            :class="
              getCaptionFor(item.identifier)
                ? 'text-white/55 hover:text-white/75'
                : 'text-white/20 italic hover:text-white/40'
            "
            :aria-label="`Modifier le texte alt de ${item.identifier}`"
            @click="startEditAlt(item.identifier)"
          >
            {{ getCaptionFor(item.identifier) || 'Ajouter un texte alt…' }}
          </button>
        </div>

        <!-- Actions -->
        <div class="flex shrink-0 flex-col items-end justify-between">
          <!-- Ligne ordre + supprimer -->
          <div class="flex items-center gap-0.5">
            <button
              type="button"
              :disabled="index === 0"
              class="rounded p-0.5 text-white/20 transition-colors hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-20"
              aria-label="Monter"
              @click="moveUp(index)"
            >
              <UIcon name="i-lucide-chevron-up" class="text-xs" aria-hidden="true" />
            </button>
            <button
              type="button"
              :disabled="index === resolvedItems.length - 1"
              class="rounded p-0.5 text-white/20 transition-colors hover:text-white/60 disabled:cursor-not-allowed disabled:opacity-20"
              aria-label="Descendre"
              @click="moveDown(index)"
            >
              <UIcon name="i-lucide-chevron-down" class="text-xs" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="rounded p-0.5 text-white/20 transition-colors hover:text-red-400"
              aria-label="Retirer cette image"
              @click="removeIdentifier(item.identifier)"
            >
              <UIcon name="i-lucide-x" class="text-xs" aria-hidden="true" />
            </button>
          </div>
          <!-- Principale -->
          <button
            type="button"
            :aria-label="`Définir ${item.identifier} comme image principale`"
            :aria-pressed="item.representativeOfPage"
            class="flex items-center gap-1 rounded p-0.5 transition-colors"
            :class="
              item.representativeOfPage ? 'text-[#6B7A4A]' : 'text-white/20 hover:text-white/50'
            "
            @click="setRepresentative(item.identifier)"
          >
            <UIcon
              name="i-lucide-star"
              class="text-sm"
              :class="item.representativeOfPage ? 'fill-[#6B7A4A]' : ''"
              aria-hidden="true"
            />
            <span class="text-[0.55rem] font-semibold">Principale</span>
          </button>
        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="mb-3 flex flex-col items-center py-6 text-center">
      <UIcon name="i-lucide-image-off" class="text-xl text-white/15" aria-hidden="true" />
      <p class="mt-2 text-xs text-white/25">Aucune image associée</p>
    </div>

    <!-- Bouton ajouter -->
    <button
      type="button"
      class="flex w-full items-center justify-center gap-2 rounded border border-dashed border-white/10 py-2 text-xs text-white/35 transition-colors hover:border-white/20 hover:text-white/60"
      @click="isPickerOpen = true"
    >
      <UIcon name="i-lucide-plus" class="text-xs" aria-hidden="true" />
      Ajouter une image
    </button>

    <!-- Modal upload -->
    <DashboardPropertyMediaPickerModal v-model:open="isPickerOpen" @uploaded="onUploaded" />
  </div>
</template>

<script setup lang="ts">
import type { MediaObject } from '@schemas/interfaces'
import type { ComponentPublicInstance } from 'vue'

type AssocItem = {
  image: string
  caption: string
  keywords: string[]
  representativeOfPage: boolean
}

type ResolvedItem = {
  identifier: string
  url: string
  name: string
  representativeOfPage: boolean
}

defineOptions({ name: 'DashboardPropertyAssociatedMediaEditor' })

const props = defineProps<{
  associatedMedia: DashboardEditableValue
}>()

const emit = defineEmits<{
  'update:associatedMedia': [value: DashboardEditableValue]
}>()

const metadataStore = useMetadataStore()
const isPickerOpen = ref(false)
const editingAlt = ref<string | null>(null)
const altInputRef = ref<HTMLInputElement | null>(null)

const setAltInputRef = (el: Element | ComponentPublicInstance | null): void => {
  altInputRef.value = el instanceof HTMLInputElement ? el : null
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

const resolvedItems = computed<ResolvedItem[]>(() => {
  const byIdentifier = metadataStore.getImageObjectsByIdentifier
  return imageIdentifiers.value.map((identifier) => {
    const mediaObj = byIdentifier.get(identifier)
    const assoc = parsedAssocMedia.value.find((a) => a.image === identifier)
    return {
      identifier,
      url: mediaObj?.url ?? '',
      name: mediaObj?.caption ?? identifier,
      representativeOfPage: assoc?.representativeOfPage ?? false,
    }
  })
})

const getCaptionFor = (identifier: string): string =>
  parsedAssocMedia.value.find((a) => a.image === identifier)?.caption ?? ''

const startEditAlt = async (identifier: string): Promise<void> => {
  editingAlt.value = identifier
  await nextTick()
  altInputRef.value?.focus()
}

const setRepresentative = (identifier: string): void => {
  emitAssocMedia(
    parsedAssocMedia.value.map((a) => ({
      ...a,
      representativeOfPage: a.image === identifier,
    })),
  )
}

const updateCaption = (identifier: string, caption: string): void => {
  const current = parsedAssocMedia.value
  const idx = current.findIndex((a) => a.image === identifier)
  const updated: AssocItem[] =
    idx >= 0
      ? current.map((item, i) => (i === idx ? { ...item, caption } : item))
      : [...current, { image: identifier, caption, keywords: [], representativeOfPage: false }]
  emitAssocMedia(updated)
}

const emitAssocMedia = (items: AssocItem[]): void => {
  emit('update:associatedMedia', items)
}

const addIdentifier = (identifier: string): void => {
  if (imageIdentifiers.value.includes(identifier)) return
  emitAssocMedia([
    ...parsedAssocMedia.value,
    { image: identifier, caption: '', keywords: [], representativeOfPage: false },
  ])
}

const removeIdentifier = (identifier: string): void => {
  emitAssocMedia(parsedAssocMedia.value.filter((a) => a.image !== identifier))
}

const swapItems = <T,>(items: T[], fromIndex: number, toIndex: number): T[] => {
  const fromItem = items[fromIndex]
  const toItem = items[toIndex]
  if (fromItem === undefined || toItem === undefined) return items

  const next = [...items]
  next[fromIndex] = toItem
  next[toIndex] = fromItem
  return next
}

const moveUp = (index: number): void => {
  if (index <= 0) return
  emitAssocMedia(swapItems(parsedAssocMedia.value, index - 1, index))
}

const moveDown = (index: number): void => {
  if (index >= imageIdentifiers.value.length - 1) return
  emitAssocMedia(swapItems(parsedAssocMedia.value, index, index + 1))
}

const onUploaded = (mediaObjects: MediaObject[]): void => {
  for (const mediaObject of mediaObjects) {
    addIdentifier(mediaObject.identifier)
  }
}
</script>
