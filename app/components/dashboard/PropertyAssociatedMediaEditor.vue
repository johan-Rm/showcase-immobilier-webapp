<template>
  <div>
    <!-- Liste des images associées -->
    <div v-if="resolvedItems.length" class="mb-3">
      <div
        v-for="(item, index) in resolvedItems"
        :key="item.identifier"
        class="flex gap-3 border-b border-white/5 py-2.5 last:border-0"
      >
        <!-- Vignette + radio principale -->
        <div class="flex shrink-0 flex-col items-center gap-1.5">
          <div class="relative h-14 w-18 overflow-hidden rounded bg-white/5">
            <img
              v-if="item.url"
              :src="item.url"
              :alt="item.name"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <UIcon name="i-lucide-image" class="text-sm text-white/20" aria-hidden="true" />
            </div>
          </div>
          <label class="flex cursor-pointer items-center gap-1">
            <input
              type="radio"
              :checked="item.representativeOfPage"
              class="h-3 w-3 cursor-pointer accent-[#6B7A4A]"
              :aria-label="`Définir ${item.identifier} comme image principale`"
              @change="setRepresentative(item.identifier)"
            />
            <span
              class="text-[0.55rem] transition-colors"
              :class="item.representativeOfPage ? 'font-semibold text-white/70' : 'text-white/30'"
            >
              Principale
            </span>
          </label>
        </div>

        <!-- Infos + actions -->
        <div class="min-w-0 flex-1">
          <!-- Ligne identifiant + contrôles -->
          <div class="mb-1.5 flex items-center gap-1">
            <p class="min-w-0 flex-1 truncate text-[0.6rem] font-medium tracking-wide text-white/30">
              {{ item.identifier }}
            </p>
            <!-- Ordre -->
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
            <!-- Supprimer -->
            <button
              type="button"
              class="ml-0.5 rounded p-0.5 text-white/20 transition-colors hover:text-red-400"
              aria-label="Retirer cette image"
              @click="removeIdentifier(item.identifier)"
            >
              <UIcon name="i-lucide-x" class="text-xs" aria-hidden="true" />
            </button>
          </div>

          <!-- Alt text — important SEO + accessibilité -->
          <div class="mb-2">
            <div class="mb-0.5 flex items-center gap-1">
              <UIcon name="i-lucide-accessibility" class="text-[0.55rem]" style="color:#6B7A4A" aria-hidden="true" />
              <span class="text-[0.55rem] font-semibold tracking-widest uppercase" style="color:#6B7A4A">Texte alt</span>
            </div>
            <input
              v-if="editingAlt === item.identifier"
              ref="altInputRef"
              type="text"
              :value="getCaptionFor(item.identifier)"
              placeholder="Description de l'image pour les lecteurs d'écran et le SEO"
              class="w-full border-b border-white/20 bg-transparent pb-0.5 text-xs text-white/90 caret-white outline-none placeholder:text-white/20"
              :aria-label="`Texte alternatif pour ${item.identifier}`"
              @input="updateCaption(item.identifier, ($event.target as HTMLInputElement).value)"
              @blur="editingAlt = null"
              @keydown.enter="editingAlt = null"
              @keydown.escape="editingAlt = null"
            />
            <button
              v-else
              type="button"
              class="w-full text-left text-xs transition-colors"
              :class="getCaptionFor(item.identifier) ? 'text-white/55 hover:text-white/75' : 'italic text-white/20 hover:text-white/40'"
              :aria-label="`Modifier le texte alt de ${item.identifier}`"
              @click="startEditAlt(item.identifier)"
            >
              {{ getCaptionFor(item.identifier) || 'Ajouter un texte alt…' }}
            </button>
          </div>
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
    <DashboardPropertyMediaPickerModal
      v-model:open="isPickerOpen"
      @uploaded="onUploaded"
    />
  </div>
</template>

<script setup lang="ts">
import type { MediaObject } from '@schemas/interfaces'
import type { DashboardEditableValue } from '#shared/types/dashboardAccommodation'

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
  mediaImageValue: DashboardEditableValue
  associatedMedia: DashboardEditableValue
}>()

const emit = defineEmits<{
  'update:mediaImageValue': [value: DashboardEditableValue]
  'update:associatedMedia': [value: DashboardEditableValue]
}>()

const metadataStore = useMetadataStore()
const isPickerOpen = ref(false)
const editingAlt = ref<string | null>(null)
const altInputRef = ref<HTMLInputElement | null>(null)

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

const imageIdentifiers = computed<string[]>(() => {
  if (Array.isArray(props.mediaImageValue) && props.mediaImageValue.length > 0) {
    return props.mediaImageValue.filter((v): v is string => typeof v === 'string')
  }
  // Fallback: `image` absent mais `associatedMedia` contient des entrées
  return parsedAssocMedia.value.map((a) => a.image).filter(Boolean)
})

const resolvedItems = computed<ResolvedItem[]>(() => {
  const byIdentifier = metadataStore.getImageObjectsByIdentifier
  return imageIdentifiers.value.map((identifier) => {
    const mediaObj = byIdentifier.get(identifier)
    const assoc = parsedAssocMedia.value.find((a) => a.image === identifier)
    return {
      identifier,
      url: mediaObj?.url ?? '',
      name: mediaObj?.name ?? identifier,
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

const emitIdentifiers = (identifiers: string[]): void => {
  emit('update:mediaImageValue', identifiers)
}

const emitAssocMedia = (items: AssocItem[]): void => {
  emit('update:associatedMedia', items)
}

const addIdentifier = (identifier: string): void => {
  if (imageIdentifiers.value.includes(identifier)) return
  const newIdentifiers = [...imageIdentifiers.value, identifier]
  const newAssoc: AssocItem[] = [
    ...parsedAssocMedia.value,
    { image: identifier, caption: '', keywords: [], representativeOfPage: false },
  ]
  emitIdentifiers(newIdentifiers)
  emitAssocMedia(newAssoc)
}

const removeIdentifier = (identifier: string): void => {
  emitIdentifiers(imageIdentifiers.value.filter((id) => id !== identifier))
  emitAssocMedia(parsedAssocMedia.value.filter((a) => a.image !== identifier))
}

const moveUp = (index: number): void => {
  if (index <= 0) return
  const ids = [...imageIdentifiers.value]
  ;[ids[index - 1], ids[index]] = [ids[index], ids[index - 1]]
  emitIdentifiers(ids)

  const assoc = [...parsedAssocMedia.value]
  const iA = assoc.findIndex((a) => a.image === imageIdentifiers.value[index - 1])
  const iB = assoc.findIndex((a) => a.image === imageIdentifiers.value[index])
  if (iA !== -1 && iB !== -1) [assoc[iA], assoc[iB]] = [assoc[iB], assoc[iA]]
  emitAssocMedia(assoc)
}

const moveDown = (index: number): void => {
  if (index >= imageIdentifiers.value.length - 1) return
  const ids = [...imageIdentifiers.value]
  ;[ids[index], ids[index + 1]] = [ids[index + 1], ids[index]]
  emitIdentifiers(ids)

  const assoc = [...parsedAssocMedia.value]
  const iA = assoc.findIndex((a) => a.image === imageIdentifiers.value[index])
  const iB = assoc.findIndex((a) => a.image === imageIdentifiers.value[index + 1])
  if (iA !== -1 && iB !== -1) [assoc[iA], assoc[iB]] = [assoc[iB], assoc[iA]]
  emitAssocMedia(assoc)
}

const onUploaded = (mediaObjects: MediaObject[]): void => {
  for (const mediaObject of mediaObjects) {
    addIdentifier(mediaObject.identifier)
  }
}
</script>
