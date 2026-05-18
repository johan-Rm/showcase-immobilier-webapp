<template>
  <div>
    <div v-if="!resolvedItems.length" class="flex flex-col items-center py-10 text-center">
      <UIcon name="i-lucide-image-off" class="text-2xl text-white/15" aria-hidden="true" />
      <p class="mt-2 text-xs text-white/25">Aucune image définie</p>
      <p class="mt-1 text-[0.65rem] text-white/15">
        Ajoutez des identifiants dans le champ <code class="font-mono">image</code> du frontmatter
      </p>
    </div>

    <div
      v-for="item in resolvedItems"
      :key="item.identifier"
      class="flex gap-3 border-b border-white/5 px-4 py-3 last:border-0"
    >
      <!-- Vignette -->
      <div class="relative h-16 w-20 shrink-0 overflow-hidden rounded bg-white/5">
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

        <!-- Badge image principale -->
        <div
          v-if="item.meta.representativeOfPage"
          class="absolute right-0.5 bottom-0.5 rounded px-1 py-0.5 text-[0.5rem] font-bold tracking-wide text-white uppercase"
          style="background-color: rgba(107, 122, 74, 0.85)"
        >
          Principale
        </div>
      </div>

      <!-- Champs éditables -->
      <div class="min-w-0 flex-1">
        <!-- Identifiant -->
        <p class="mb-1.5 truncate text-[0.6rem] font-medium tracking-wide text-white/20">
          {{ item.identifier }}
        </p>

        <!-- Caption -->
        <div class="mb-2">
          <p class="mb-0.5 text-[0.55rem] font-semibold tracking-widest text-white/20 uppercase">
            Caption
          </p>
          <button
            v-if="activeEdit?.identifier !== item.identifier || activeEdit.field !== 'caption'"
            type="button"
            class="w-full text-left text-xs text-white/50 transition-colors hover:text-white/70"
            @click="startEdit(item.identifier, 'caption')"
          >
            {{ item.meta.caption || '—' }}
          </button>
          <input
            v-else
            ref="captionInputRef"
            type="text"
            :value="item.meta.caption"
            class="w-full border-b border-white/20 bg-transparent pb-0.5 text-xs text-white/90 caret-white outline-none"
            @input="
              updateMeta(item.identifier, 'caption', ($event.target as HTMLInputElement).value)
            "
            @blur="stopEdit"
            @keydown.enter="stopEdit"
            @keydown.escape="stopEdit"
          />
        </div>

        <!-- Mots-clés -->
        <div class="mb-2">
          <p class="mb-0.5 text-[0.55rem] font-semibold tracking-widest text-white/20 uppercase">
            Mots-clés
          </p>
          <div
            v-if="activeEdit?.identifier !== item.identifier || activeEdit.field !== 'keywords'"
            class="flex flex-wrap gap-1"
            @click="startEdit(item.identifier, 'keywords')"
          >
            <span
              v-for="kw in item.meta.keywords"
              :key="kw"
              class="cursor-pointer rounded bg-white/5 px-1.5 py-0.5 text-[0.6rem] text-white/45 transition-colors hover:bg-white/10"
            >
              {{ kw }}
            </span>
            <span
              v-if="!item.meta.keywords.length"
              class="cursor-pointer text-xs text-white/25 hover:text-white/40"
            >
              —
            </span>
          </div>
          <textarea
            v-else
            ref="keywordsInputRef"
            :value="item.meta.keywords.join('\n')"
            rows="3"
            placeholder="Un mot-clé par ligne"
            class="w-full resize-none border-b border-white/20 bg-transparent font-mono text-xs text-white/90 caret-white outline-none placeholder:text-white/20"
            @input="updateKeywords(item.identifier, ($event.target as HTMLTextAreaElement).value)"
            @blur="stopEdit"
            @keydown.escape="stopEdit"
          />
        </div>

        <!-- Image principale -->
        <button
          type="button"
          class="flex items-center gap-1.5 transition-colors"
          :class="
            item.meta.representativeOfPage ? 'text-[#6B7A4A]' : 'text-white/25 hover:text-white/40'
          "
          @click="toggleRepresentative(item.identifier)"
        >
          <UIcon
            :name="item.meta.representativeOfPage ? 'i-lucide-star' : 'i-lucide-star'"
            class="text-xs"
            :class="item.meta.representativeOfPage ? 'fill-current' : ''"
            aria-hidden="true"
          />
          <span class="text-[0.6rem] font-medium">Image principale</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  meta: AssocItem
}

defineOptions({ name: 'DashboardPropertyMediaGallery' })

const props = defineProps<{
  images: DashboardEditableValue
  associatedMedia: DashboardEditableValue
}>()

const emit = defineEmits<{
  'update:associatedMedia': [value: DashboardEditableValue]
}>()

// 4. Composables, stores, routeur
const metadataStore = useMetadataStore()

// 5. Etat local

// Champ actuellement en cours d édition : identifiant + nom du champ.
const activeEdit = ref<{ identifier: string; field: string } | null>(null)
const captionInputRef = ref<HTMLInputElement | null>(null)
const keywordsInputRef = ref<HTMLTextAreaElement | null>(null)

// 8. Computed UI-ready

const imageIdentifiers = computed<string[]>(() => {
  if (!Array.isArray(props.images)) return []
  return props.images.filter((v): v is string => typeof v === 'string')
})

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

const resolvedItems = computed<ResolvedItem[]>(() => {
  const byIdentifier = metadataStore.getImageObjectsByIdentifier
  return imageIdentifiers.value.map((identifier) => {
    const mediaObj = byIdentifier.get(identifier)
    const meta = parsedAssocMedia.value.find((a) => a.image === identifier) ?? {
      image: identifier,
      caption: '',
      keywords: [],
      representativeOfPage: false,
    }
    return {
      identifier,
      url: mediaObj?.url ?? '',
      name: mediaObj?.name ?? identifier,
      meta,
    }
  })
})

// 9. Actions et handlers

const emitUpdate = (identifier: string, patch: Partial<AssocItem>): void => {
  const current = parsedAssocMedia.value
  const idx = current.findIndex((a) => a.image === identifier)
  const updated: AssocItem[] =
    idx >= 0
      ? current.map((item, i) => (i === idx ? { ...item, ...patch } : item))
      : [
          ...current,
          { image: identifier, caption: '', keywords: [], representativeOfPage: false, ...patch },
        ]
  emit('update:associatedMedia', updated)
}

const updateMeta = (identifier: string, field: 'caption', value: string): void => {
  emitUpdate(identifier, { [field]: value })
}

const updateKeywords = (identifier: string, raw: string): void => {
  const keywords = raw
    .split('\n')
    .map((k) => k.trim())
    .filter(Boolean)
  emitUpdate(identifier, { keywords })
}

const toggleRepresentative = (identifier: string): void => {
  const current = parsedAssocMedia.value.find((a) => a.image === identifier)
  emitUpdate(identifier, { representativeOfPage: !current?.representativeOfPage })
}

const startEdit = async (identifier: string, field: string): Promise<void> => {
  activeEdit.value = { identifier, field }
  await nextTick()
  if (field === 'caption') captionInputRef.value?.focus()
  if (field === 'keywords') keywordsInputRef.value?.focus()
}

const stopEdit = (): void => {
  activeEdit.value = null
}
</script>
