<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <UTabs
      :model-value="activeSection"
      :items="sectionTabs"
      :content="false"
      variant="link"
      color="neutral"
      :ui="{
        root: 'w-full gap-0',
        list: 'border-white/10 px-2',
        indicator: 'bg-[#6B7A4A]',
        trigger:
          'data-[state=inactive]:text-white/40 hover:data-[state=inactive]:text-white/60 data-[state=active]:text-white',
      }"
      @update:model-value="emit('update:activeSection', $event as EditorSection)"
    >
      <template #list-trailing>
        <div class="ml-auto flex items-center gap-0.5 self-stretch pr-1">
          <button
            v-for="locale in localeTabs"
            :key="locale"
            type="button"
            class="rounded px-2 py-1 text-[0.65rem] font-bold uppercase transition-colors"
            :class="activeLocale === locale ? 'text-white' : 'text-white/30 hover:text-white/60'"
            :style="activeLocale === locale ? 'background-color:#6B7A4A' : ''"
            :aria-label="`Locale ${locale}`"
            @click="emit('update:activeLocale', locale)"
          >
            {{ locale }}
          </button>
          <button
            v-if="showClose"
            type="button"
            class="ml-1 rounded p-1 text-white/30 transition-colors hover:text-white/70"
            aria-label="Fermer l'editeur"
            @click="emit('close')"
          >
            <UIcon name="i-lucide-x" class="text-sm" aria-hidden="true" />
          </button>
        </div>
      </template>
    </UTabs>

    <div class="flex shrink-0 items-center gap-2 border-b border-white/10 py-2.5 pr-3 pl-4">
      <span
        v-if="accommodation?.identifier"
        class="shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wider"
        style="color: #6b7a4a; background-color: rgba(255, 255, 255, 0.07)"
        >{{ accommodation.identifier }}</span
      >
      <input
        v-if="isEditingTitle"
        ref="titleInputRef"
        type="text"
        class="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white/90 caret-white outline-none"
        :value="titleValue"
        aria-label="Modifier le nom du bien"
        @input="emit('update-field', 'name', ($event.target as HTMLInputElement).value)"
        @blur="isEditingTitle = false"
        @keydown.enter="isEditingTitle = false"
        @keydown.escape="isEditingTitle = false"
      />
      <button
        v-else
        type="button"
        class="min-w-0 flex-1 truncate text-left text-sm font-semibold text-white/70 transition-colors hover:text-white/90"
        aria-label="Modifier le nom du bien"
        @click="activateTitle"
      >
        {{ titleValue }}
      </button>
      <UDropdownMenu :items="propertyMenuItems">
        <button
          type="button"
          class="rounded p-1 text-white/30 transition-colors hover:text-white/70"
          aria-label="Actions sur le bien"
        >
          <UIcon name="i-lucide-more-vertical" class="text-sm" aria-hidden="true" />
        </button>
      </UDropdownMenu>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <template v-if="activeDraft">
        <DashboardPropertyContentEditor
          v-if="activeSection === 'content'"
          :active-draft="activeDraft"
          :expanded-blocks="expandedBlocks"
          :associated-media-value="associatedMediaValue"
          @toggle-block="emit('toggle-block', $event)"
          @update-field="(path, value) => emit('update-field', path, value)"
          @update-body="emit('update-body', $event)"
          @update-associated-media="emit('update-associated-media', $event)"
        />

        <template v-else>
          <DashboardPropertyMediaGallery
            :associated-media="associatedMediaValue"
            @update:associated-media="emit('update-associated-media', $event)"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  DashboardAccommodation,
  DashboardEditableRecord,
  DashboardEditableValue,
} from '#shared/types/dashboardAccommodation'

type DashboardLocale = 'fr' | 'en' | 'es'
type EditorSection = 'content' | 'media'
type DashboardDraft = { frontmatter: DashboardEditableRecord; body: string }
type BlockMenuItem = { label: string; icon?: string; onSelect?: () => void }
defineOptions({ name: 'DashboardPropertyEditorPanel' })

defineProps<{
  activeSection: EditorSection
  activeLocale: DashboardLocale
  activeDraft: DashboardDraft | null
  accommodation?: DashboardAccommodation | null
  expandedBlocks: Set<string>
  titleValue: string
  associatedMediaValue: DashboardEditableValue
  propertyMenuItems: BlockMenuItem[][]
  showClose?: boolean
}>()

const emit = defineEmits<{
  'update:activeSection': [value: EditorSection]
  'update:activeLocale': [value: DashboardLocale]
  close: []
  'toggle-block': [id: string]
  'update-field': [path: string, value: DashboardEditableValue]
  'update-body': [value: string]
  'update-associated-media': [value: DashboardEditableValue]
}>()

const localeTabs: DashboardLocale[] = ['fr', 'en', 'es']
const sectionTabs: Array<{ value: EditorSection; label: string; icon: string }> = [
  { value: 'content', label: 'Contenu', icon: 'i-lucide-file-text' },
  { value: 'media', label: 'Media', icon: 'i-lucide-images' },
]

const isEditingTitle = ref(false)
const titleInputRef = ref<HTMLInputElement | null>(null)

const activateTitle = async (): Promise<void> => {
  isEditingTitle.value = true
  await nextTick()
  titleInputRef.value?.focus()
  titleInputRef.value?.select()
}
</script>
