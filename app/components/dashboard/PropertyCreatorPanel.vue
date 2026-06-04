<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="h-0.5 w-full shrink-0 bg-[#6B7A4A]" />

    <div class="flex shrink-0 items-center gap-2 border-b border-white/10 py-2.5 pr-3 pl-4">
      <span
        class="shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-semibold tracking-wider"
        style="color: #6b7a4a; background-color: rgba(255, 255, 255, 0.07)"
        :aria-label="hasGeneratedIdentifier ? 'Référence générée' : 'Référence en attente'"
      >
        {{ creatorDraft.identifier || 'REF' }}
      </span>
      <p class="min-w-0 flex-1 truncate text-sm font-semibold text-white/70">
        {{ creatorDraft.name || 'Nouveau bien immobilier' }}
      </p>
      <button
        type="button"
        class="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs text-white/35 transition-colors hover:bg-white/5 hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-white/35"
        :disabled="!hasAnyInput"
        @click="showSummary"
      >
        <UIcon name="i-lucide-list-checks" class="text-sm" aria-hidden="true" />
        Résumé
      </button>
      <button
        type="button"
        class="rounded p-1 text-white/30 transition-colors hover:text-white/70"
        aria-label="Fermer la création"
        @click="handleClose"
      >
        <UIcon name="i-lucide-x" class="text-sm" aria-hidden="true" />
      </button>
    </div>

    <div class="min-h-0 flex-1 overflow-hidden">
      <Transition :name="stepTransitionName" mode="out-in">
        <div
          :key="activeStep"
          class="h-full overflow-y-auto px-6 py-8"
          :class="isStructuredStep ? 'flex flex-col' : 'flex items-center justify-center'"
        >
          <div
            class="w-full"
            :class="
              isStructuredStep
                ? 'creator-step-layout mx-auto grid h-full min-h-full max-w-2xl grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)]'
                : 'max-w-md'
            "
          >
            <div class="text-center" :class="isStructuredStep ? 'contents' : 'mb-8'">
              <div class="creator-step-stepper flex shrink-0 justify-center gap-1.5">
                <button
                  v-for="step in steps"
                  :key="step.id"
                  type="button"
                  class="h-1.5 rounded-full transition-all"
                  :class="stepProgressClass(step.id)"
                  :disabled="getStepState(step.id) === 'locked'"
                  :aria-label="`Aller à l'étape ${step.label}`"
                  @click="goToStep(step.id)"
                />
              </div>
              <template v-if="activeStep === 'classification'">
                <div class="creator-step-typing flex min-h-0 items-center">
                  <div class="mx-auto min-h-[6lh] w-full max-w-2xl text-left">
                    <div
                      v-for="(line, index) in classificationHeadlineParts"
                      :key="index"
                      class="text-2xl leading-tight font-light text-white/95"
                    >
                      <span>{{ line.lead }}</span>
                      <span class="text-[#8A9A5B]">{{ line.accent }}</span>
                      <span
                        v-if="classificationCaretLineIndex === index && !isTypingDone"
                        class="creator-caret"
                        aria-hidden="true"
                        >▍</span
                      >
                    </div>

                    <div
                      v-if="hasClassificationSupportLine"
                      class="mt-6 h-0.5 w-24 bg-[#8A9A5B]"
                      aria-hidden="true"
                    />

                    <div
                      v-if="hasClassificationSupportLine"
                      class="mt-6 text-sm leading-relaxed font-light text-white/55"
                    >
                      {{ classificationSupportLine
                      }}<span
                        v-if="classificationCaretLineIndex === 2 && !isTypingDone"
                        class="creator-caret"
                        aria-hidden="true"
                        >▍</span
                      >
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="activeStep === 'name'">
                <div class="creator-step-typing flex min-h-0 items-center">
                  <div class="mx-auto min-h-[6lh] w-full max-w-2xl text-left">
                    <div class="text-2xl leading-tight font-light text-white/95">
                      {{ nameHeadlineLine
                      }}<span
                        v-if="nameCaretLineIndex === 0 && !isTypingDone"
                        class="creator-caret"
                        aria-hidden="true"
                        >▍</span
                      >
                    </div>

                    <div
                      v-if="hasNameSupportLine"
                      class="mt-6 h-0.5 w-24 bg-[#8A9A5B]"
                      aria-hidden="true"
                    />

                    <div
                      v-if="hasNameSupportLine"
                      class="mt-6 text-sm leading-relaxed font-light text-white/55"
                    >
                      {{ nameSupportLine
                      }}<span
                        v-if="nameCaretLineIndex === 1 && !isTypingDone"
                        class="creator-caret"
                        aria-hidden="true"
                        >▍</span
                      >
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="activeStep === 'price'">
                <div class="creator-step-typing flex min-h-0 items-center">
                  <div class="mx-auto min-h-[6lh] w-full max-w-2xl text-left">
                    <div class="text-2xl leading-tight font-light text-white/95">
                      {{ priceHeadlineLine
                      }}<span
                        v-if="priceCaretLineIndex === 0 && !isTypingDone"
                        class="creator-caret"
                        aria-hidden="true"
                        >▍</span
                      >
                    </div>

                    <div
                      v-if="hasPriceSupportLine"
                      class="mt-6 h-0.5 w-24 bg-[#8A9A5B]"
                      aria-hidden="true"
                    />

                    <div
                      v-if="hasPriceSupportLine"
                      class="mt-6 text-sm leading-relaxed font-light text-white/55"
                    >
                      {{ priceSupportLine
                      }}<span
                        v-if="priceCaretLineIndex === 1 && !isTypingDone"
                        class="creator-caret"
                        aria-hidden="true"
                        >▍</span
                      >
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="isStructuredStep">
                <div class="creator-step-typing flex min-h-0 items-center">
                  <div class="mx-auto min-h-[6lh] w-full max-w-2xl text-left">
                    <div class="text-2xl leading-tight font-light text-white/95">
                      {{ structuredHeadlineLine
                      }}<span
                        v-if="structuredCaretLineIndex === 0 && !isTypingDone"
                        class="creator-caret"
                        aria-hidden="true"
                        >▍</span
                      >
                    </div>

                    <div
                      v-if="hasStructuredSupportLine"
                      class="mt-6 h-0.5 w-24 bg-[#8A9A5B]"
                      aria-hidden="true"
                    />

                    <div
                      v-if="hasStructuredSupportLine"
                      class="mt-6 text-sm leading-relaxed font-light text-white/55"
                    >
                      {{ structuredSupportLine
                      }}<span
                        v-if="structuredCaretLineIndex === 1 && !isTypingDone"
                        class="creator-caret"
                        aria-hidden="true"
                        >▍</span
                      >
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <section
              v-if="activeStep === 'classification'"
              class="creator-step-fields flex min-h-0 items-start pb-6 text-center"
            >
              <div class="grid w-full grid-cols-1 gap-3 text-left">
                <Transition name="creator-reveal">
                  <DashboardCategoryCodeSelect
                    v-if="revealedSelects.listing"
                    in-code-set="real-estate-listing"
                    :model-value="creatorDraft.realEstateListing"
                    label="Type de listing"
                    placeholder="Choisir le type"
                    @update:model-value="updateStringField('realEstateListing', $event)"
                  />
                </Transition>
                <Transition name="creator-reveal">
                  <DashboardCategoryCodeSelect
                    v-if="revealedSelects.category"
                    in-code-set="accommodation-type"
                    :model-value="creatorDraft.category"
                    label="Catégorie"
                    placeholder="Choisir la catégorie"
                    @update:model-value="updateStringField('category', $event)"
                  />
                </Transition>
                <Transition name="creator-reveal">
                  <DashboardCategoryCodeSelect
                    v-if="revealedSelects.place"
                    in-code-set="accommodation-place"
                    :model-value="creatorDraft.place"
                    label="Lieu"
                    placeholder="Choisir le lieu"
                    @update:model-value="updateStringField('place', $event)"
                  />
                </Transition>
              </div>
            </section>

            <section
              v-else-if="activeStep === 'name'"
              class="creator-step-fields flex min-h-0 items-start pb-6 text-center"
            >
              <Transition name="creator-reveal">
                <label v-if="revealedNameInput" class="block w-full text-left">
                  <input
                    v-model="creatorDraft.name"
                    type="text"
                    class="w-full rounded border border-white/10 bg-white/5 px-3 py-3 text-lg font-semibold text-white/85 caret-white transition-colors outline-none placeholder:text-white/20 focus:border-[#6B7A4A]/60"
                    placeholder="Ex. Riad lumineux en médina"
                  />
                </label>
              </Transition>
            </section>

            <section
              v-else-if="activeStep === 'price'"
              class="creator-step-fields flex min-h-0 items-start pb-6 text-center"
            >
              <Transition name="creator-reveal">
                <div v-if="revealedPriceFields" class="grid w-full grid-cols-1 gap-3 text-left">
                  <div class="grid grid-cols-[minmax(0,1fr)_5rem] gap-3">
                    <div class="relative">
                      <input
                        :value="creatorDraft.price ?? ''"
                        type="number"
                        step="10000"
                        :disabled="creatorDraft.priceOnRequest"
                        class="creator-price-input w-full rounded border border-white/10 bg-white/5 py-3 pr-10 pl-3 text-sm text-white/80 caret-white transition-colors outline-none placeholder:text-white/20 focus:border-[#6B7A4A]/60 disabled:text-white/20"
                        placeholder="Ex. 660000"
                        aria-label="Prix du bien"
                        @input="updatePrice"
                      />
                      <div
                        class="absolute top-1/2 right-2 flex -translate-y-1/2 flex-col"
                        aria-hidden="true"
                      >
                        <button
                          type="button"
                          tabindex="-1"
                          class="rounded px-1 text-[#8A9A5B] transition-colors hover:text-[#A4B872] disabled:text-white/15"
                          :disabled="creatorDraft.priceOnRequest"
                          @click="adjustPrice(10000)"
                        >
                          <UIcon name="i-lucide-chevron-up" class="text-sm" />
                        </button>
                        <button
                          type="button"
                          tabindex="-1"
                          class="rounded px-1 text-[#8A9A5B] transition-colors hover:text-[#A4B872] disabled:text-white/15"
                          :disabled="creatorDraft.priceOnRequest"
                          @click="adjustPrice(-10000)"
                        >
                          <UIcon name="i-lucide-chevron-down" class="text-sm" />
                        </button>
                      </div>
                    </div>

                    <input
                      :value="creatorDraft.priceCurrency"
                      type="text"
                      readonly
                      tabindex="-1"
                      class="w-full rounded border border-[#8A9A5B]/45 bg-white/[0.03] px-3 py-3 text-center text-sm font-semibold text-[#8A9A5B] outline-none"
                      aria-label="Devise fixée en dirham marocain"
                    />
                  </div>

                  <label class="flex items-center gap-3 rounded bg-white/5 px-3 py-2">
                    <input
                      v-model="creatorDraft.priceOnRequest"
                      type="checkbox"
                      class="creator-price-on-request-checkbox"
                    />
                    <span class="text-xs text-white/60">Prix sur demande</span>
                  </label>
                </div>
              </Transition>
            </section>

            <section
              v-else-if="activeStep === 'media'"
              class="creator-step-fields flex min-h-0 items-start overflow-y-auto pb-6 text-center"
            >
              <Transition name="creator-reveal">
                <DashboardPropertyMediaGallery
                  v-if="revealedMediaFields"
                  :associated-media="creatorDraft.associatedMedia"
                  @update:associated-media="updateAssociatedMedia"
                />
              </Transition>
            </section>

            <section
              v-else-if="activeStep === 'mediaAlt'"
              class="creator-step-fields flex min-h-0 items-start overflow-y-auto pb-6 text-center"
            >
              <Transition name="creator-reveal">
                <DashboardPropertyAssociatedMediaEditor
                  v-if="revealedMediaAltFields"
                  :associated-media="creatorDraft.associatedMedia"
                  full-width-items
                  hide-add-button
                  @update:associated-media="updateAssociatedMedia"
                />
              </Transition>
            </section>

            <section
              v-else-if="activeStep === 'details'"
              class="creator-step-fields flex min-h-0 items-start pb-6 text-center"
            >
              <Transition name="creator-reveal">
                <div v-if="revealedDetailsFields" class="grid w-full grid-cols-2 gap-3 text-left">
                  <input
                    v-model="creatorDraft.floorSize"
                    type="text"
                    class="w-full rounded border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80 caret-white transition-colors outline-none placeholder:text-white/20 focus:border-[#6B7A4A]/60"
                    placeholder="Surface habitable"
                    aria-label="Surface habitable"
                  />

                  <input
                    v-model="creatorDraft.areaSize"
                    type="text"
                    class="w-full rounded border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80 caret-white transition-colors outline-none placeholder:text-white/20 focus:border-[#6B7A4A]/60"
                    placeholder="Surface totale"
                    aria-label="Surface totale"
                  />
                </div>
              </Transition>
            </section>

            <section
              v-else-if="activeStep === 'optional'"
              class="creator-step-fields flex min-h-0 items-start pb-6 text-center"
            >
              <Transition name="creator-reveal">
                <textarea
                  v-if="revealedOptionalFields"
                  v-model="creatorDraft.review"
                  rows="4"
                  class="w-full resize-none rounded border border-white/10 bg-white/5 p-3 text-sm text-white/75 caret-white transition-colors outline-none placeholder:text-white/20 focus:border-[#6B7A4A]/60"
                  placeholder="Ce qui rend ce bien intéressant…"
                  aria-label="Notre avis"
                />
              </Transition>
            </section>

            <section
              v-else
              class="creator-step-fields flex min-h-0 items-start overflow-y-auto pb-6 text-center"
            >
              <div v-if="revealedSummaryContent" class="w-full space-y-6">
                <dl class="space-y-2 rounded border border-white/10 bg-white/5 p-4 text-xs">
                  <div v-for="item in summaryItems" :key="item.label" class="flex gap-3">
                    <dt class="w-28 shrink-0 text-white/30">{{ item.label }}</dt>
                    <dd class="min-w-0 flex-1 text-white/65">{{ item.value }}</dd>
                  </div>
                </dl>

                <div
                  v-if="canPublish"
                  class="rounded border border-[#6B7A4A]/35 bg-[#6B7A4A]/10 px-3 py-2 text-xs text-white/70"
                >
                  Très bien, la fiche contient assez d’informations pour proposer une publication.
                </div>
              </div>
            </section>
          </div>
        </div>
      </Transition>
    </div>

    <div class="shrink-0 border-t border-white/10 bg-[#1a1a1a] px-4 py-3">
      <p v-if="stepError" class="mb-2 text-xs text-red-400">{{ stepError }}</p>
      <p v-if="readyMessage" class="mb-2 text-xs text-[#6B7A4A]">{{ readyMessage }}</p>

      <div class="flex items-center gap-2">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          :disabled="activeStepIndex === 0"
          class="text-white/45 hover:bg-white/10 hover:text-white"
          @click="goPrevious"
        >
          Retour
        </UButton>

        <UButton
          v-if="currentStep.optional"
          type="button"
          color="neutral"
          variant="ghost"
          class="text-white/45 hover:bg-white/10 hover:text-white"
          @click="skipCurrentStep"
        >
          Ignorer
        </UButton>

        <UButton
          type="button"
          block
          class="font-medium"
          :disabled="isCreatingDraft"
          :loading="isCreatingDraft"
          :class="['bg-[#6B7A4A]! hover:bg-[#5c6940]!']"
          @click="handlePrimaryAction"
        >
          {{ primaryActionLabel }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  DashboardEditableRecord,
  DashboardEditableValue,
} from '#shared/types/dashboardAccommodation'

type CreatorStepId =
  | 'classification'
  | 'name'
  | 'price'
  | 'media'
  | 'mediaAlt'
  | 'details'
  | 'optional'
  | 'summary'
type CreatorStepState = 'locked' | 'current' | 'completed' | 'skipped' | 'invalid'

type CreatorStep = {
  id: CreatorStepId
  label: string
  icon: string
  optional?: boolean
}

type CreatorMediaItem = {
  image: string
  caption: string
  keywords: string[]
  representativeOfPage: boolean
}

type CreatorDraft = {
  identifier: string
  realEstateListing: string
  category: string
  place: string
  name: string
  price: number | null
  priceCurrency: string
  priceOnRequest: boolean
  associatedMedia: CreatorMediaItem[]
  floorSize: string
  areaSize: string
  review: string
}

type CreatorDraftResponse = {
  identifier: string
  iri: string | null
}

defineOptions({ name: 'DashboardPropertyCreatorPanel' })

const emit = defineEmits<{
  close: []
  'draft-created': [identifier: string]
  ready: [payload: DashboardEditableRecord]
}>()

const steps: CreatorStep[] = [
  { id: 'classification', label: 'Départ', icon: 'i-lucide-tags' },
  { id: 'name', label: 'Nom', icon: 'i-lucide-type' },
  { id: 'price', label: 'Prix', icon: 'i-lucide-badge-dollar-sign' },
  { id: 'media', label: 'Image', icon: 'i-lucide-image' },
  { id: 'mediaAlt', label: 'Textes alt', icon: 'i-lucide-text-cursor-input' },
  { id: 'details', label: 'Détails', icon: 'i-lucide-ruler' },
  { id: 'optional', label: 'Avis', icon: 'i-lucide-sparkles', optional: true },
  { id: 'summary', label: 'Résumé', icon: 'i-lucide-check-circle' },
]

const creatorDraft = reactive<CreatorDraft>({
  identifier: '',
  realEstateListing: '',
  category: '',
  place: '',
  name: '',
  price: null,
  priceCurrency: 'MAD',
  priceOnRequest: false,
  associatedMedia: [],
  floorSize: '',
  areaSize: '',
  review: '',
})

const activeStep = ref<CreatorStepId>('classification')
const skippedSteps = ref<Set<CreatorStepId>>(new Set())
const stepError = ref<string | null>(null)
const readyMessage = ref<string | null>(null)
const isCreatingDraft = ref(false)
const stepTransitionName = ref<'creator-step-forward' | 'creator-step-backward'>(
  'creator-step-forward',
)
const displayedAssistantMessage = ref<string>('')
const isTypingDone = ref<boolean>(false)
const revealedSelects = reactive<Record<CreatorSelectKey, boolean>>({
  listing: false,
  category: false,
  place: false,
})
const revealedNameInput = ref(false)
const revealedPriceFields = ref(false)
const revealedMediaFields = ref(false)
const revealedMediaAltFields = ref(false)
const revealedDetailsFields = ref(false)
const revealedOptionalFields = ref(false)
const revealedSummaryContent = ref(false)
let typingTimer: ReturnType<typeof setTimeout> | null = null

const activeStepIndex = computed<number>(() =>
  steps.findIndex((step) => step.id === activeStep.value),
)
const currentStep = computed<CreatorStep>(() => steps[activeStepIndex.value] ?? steps[0]!)
const metadataStore = useMetadataStore()
const { localeSetting } = useLang()
const isStructuredStep = computed<boolean>(
  () =>
    activeStep.value === 'classification' ||
    activeStep.value === 'name' ||
    activeStep.value === 'price' ||
    activeStep.value === 'media' ||
    activeStep.value === 'mediaAlt' ||
    activeStep.value === 'details' ||
    activeStep.value === 'optional' ||
    activeStep.value === 'summary',
)

const assistantMessage = computed<string>(() => {
  const messages: Record<CreatorStepId, string> = {
    classification:
      'On commence tranquillement. Choisis le type, la catégorie et le lieu, je m’occupe de préparer la référence.',
    name: 'Donne-lui un nom simple. Je garderai ce repère pour rendre la fiche facile à reconnaître.',
    price:
      'Indique le prix si tu l’as sous la main. Sinon, on peut afficher prix sur demande sans bloquer la création.',
    media:
      'Ajoute une première belle image. Si tu en mets plusieurs, on choisira ensemble celle qui représentera la fiche.',
    mediaAlt:
      'Décris les images choisies. Ces textes aident Google et les lecteurs d’écran à comprendre la fiche.',
    details:
      'Une surface suffit pour avancer. Le reste pourra être complété ensuite dans l’éditeur.',
    optional:
      'Cette étape est libre. Ajoute ton avis si tu veux donner un peu plus de caractère au bien.',
    summary:
      'Voici le point de contrôle. Tu peux vérifier, revenir corriger, ou préparer la suite quand tout est prêt.',
  }

  return messages[activeStep.value]
})

type CreatorSelectKey = 'listing' | 'category' | 'place'
type CreatorRevealKey =
  | CreatorSelectKey
  | 'nameInput'
  | 'priceFields'
  | 'mediaFields'
  | 'mediaAltFields'
  | 'detailsFields'
  | 'optionalFields'
  | 'summaryContent'

type AssistantSegment = {
  text: string
  newLine?: boolean
  delayBefore?: number
  reveal?: CreatorRevealKey
  revealDelay?: number
  pauseAfter?: number
}

const SEGMENT_PAUSE_MS = 500
const CLASSIFICATION_ACCENT_STARTS = ['tranquillement', 'le type'] as const

const buildConversation = (stepId: CreatorStepId): AssistantSegment[] => {
  if (stepId === 'classification') {
    return [
      { text: 'Ok, on commence tranquillement.' },
      {
        text: 'Choisis le type',
        newLine: true,
        delayBefore: SEGMENT_PAUSE_MS,
        reveal: 'listing',
        revealDelay: 260,
        pauseAfter: 380,
      },
      { text: ', la catégorie', reveal: 'category', revealDelay: 220, pauseAfter: 360 },
      { text: ' et le lieu.', reveal: 'place', revealDelay: 220, pauseAfter: 420 },
      { text: 'Je m’occupe de préparer la référence.', newLine: true },
    ]
  }

  if (stepId === 'name') {
    return [
      {
        text: 'Donne-lui un nom simple.',
        reveal: 'nameInput',
        revealDelay: 260,
        pauseAfter: 420,
      },
      {
        text: 'Je garderai ce repère pour rendre la fiche facile à reconnaître.',
        newLine: true,
      },
    ]
  }

  if (stepId === 'price') {
    return [
      {
        text: 'Indique le prix si tu l’as sous la main.',
        reveal: 'priceFields',
        revealDelay: 260,
        pauseAfter: 420,
      },
      {
        text: 'Sinon, on peut afficher prix sur demande sans bloquer la création.',
        newLine: true,
      },
    ]
  }

  if (stepId === 'media') {
    return [
      {
        text: 'Ajoute une première belle image.',
        reveal: 'mediaFields',
        revealDelay: 260,
        pauseAfter: 420,
      },
      {
        text: 'Si tu en mets plusieurs, on choisira celle qui représentera la fiche.',
        newLine: true,
      },
    ]
  }

  if (stepId === 'mediaAlt') {
    return [
      {
        text: 'Décris les images choisies.',
        reveal: 'mediaAltFields',
        revealDelay: 260,
        pauseAfter: 420,
      },
      {
        text: 'Ces textes aident Google et les lecteurs d’écran à comprendre la fiche.',
        newLine: true,
      },
    ]
  }

  if (stepId === 'details') {
    return [
      {
        text: 'Renseigne au moins une surface.',
        reveal: 'detailsFields',
        revealDelay: 260,
        pauseAfter: 420,
      },
      {
        text: 'Les autres détails pourront être complétés ensuite dans l’éditeur.',
        newLine: true,
      },
    ]
  }

  if (stepId === 'optional') {
    return [
      {
        text: 'Ajoute ton avis si tu veux.',
        reveal: 'optionalFields',
        revealDelay: 260,
        pauseAfter: 420,
      },
      {
        text: 'Cette étape est libre et peut aider à mettre en avant le potentiel du bien.',
        newLine: true,
      },
    ]
  }

  if (stepId === 'summary') {
    return [
      {
        text: 'Voici le point de contrôle.',
        reveal: 'summaryContent',
        revealDelay: 260,
        pauseAfter: 420,
      },
      {
        text: 'Tu peux vérifier les informations ou revenir corriger une étape.',
        newLine: true,
      },
    ]
  }

  return [{ text: assistantMessage.value }]
}

const hasGeneratedIdentifier = computed<boolean>(() => Boolean(creatorDraft.identifier.trim()))

const classificationMessageLines = computed<string[]>(() =>
  displayedAssistantMessage.value.split('\n'),
)

const classificationHeadlineParts = computed<Array<{ lead: string; accent: string }>>(() =>
  classificationMessageLines.value.slice(0, 2).map((line, index) => {
    const accentStart = CLASSIFICATION_ACCENT_STARTS[index]
    const accentIndex = accentStart ? line.indexOf(accentStart) : -1
    if (accentIndex === -1) return { lead: line, accent: '' }

    return {
      lead: line.slice(0, accentIndex),
      accent: line.slice(accentIndex),
    }
  }),
)

const hasClassificationSupportLine = computed<boolean>(
  () => classificationMessageLines.value.length > 2,
)

const classificationSupportLine = computed<string>(() => classificationMessageLines.value[2] ?? '')

const classificationCaretLineIndex = computed<number>(() =>
  Math.max(0, classificationMessageLines.value.length - 1),
)

const nameMessageLines = computed<string[]>(() => displayedAssistantMessage.value.split('\n'))

const nameHeadlineLine = computed<string>(() => nameMessageLines.value[0] ?? '')

const hasNameSupportLine = computed<boolean>(() => nameMessageLines.value.length > 1)

const nameSupportLine = computed<string>(() => nameMessageLines.value[1] ?? '')

const nameCaretLineIndex = computed<number>(() => Math.max(0, nameMessageLines.value.length - 1))

const priceMessageLines = computed<string[]>(() => displayedAssistantMessage.value.split('\n'))

const priceHeadlineLine = computed<string>(() => priceMessageLines.value[0] ?? '')

const hasPriceSupportLine = computed<boolean>(() => priceMessageLines.value.length > 1)

const priceSupportLine = computed<string>(() => priceMessageLines.value[1] ?? '')

const priceCaretLineIndex = computed<number>(() => Math.max(0, priceMessageLines.value.length - 1))

const structuredMessageLines = computed<string[]>(() => displayedAssistantMessage.value.split('\n'))

const structuredHeadlineLine = computed<string>(() => structuredMessageLines.value[0] ?? '')

const hasStructuredSupportLine = computed<boolean>(() => structuredMessageLines.value.length > 1)

const structuredSupportLine = computed<string>(() => structuredMessageLines.value[1] ?? '')

const structuredCaretLineIndex = computed<number>(() =>
  Math.max(0, structuredMessageLines.value.length - 1),
)

const hasAnyInput = computed<boolean>(() =>
  Boolean(
    creatorDraft.realEstateListing ||
    creatorDraft.category ||
    creatorDraft.place ||
    creatorDraft.name.trim() ||
    creatorDraft.priceOnRequest ||
    creatorDraft.price !== null ||
    creatorDraft.associatedMedia.length > 0 ||
    creatorDraft.floorSize.trim() ||
    creatorDraft.areaSize.trim() ||
    creatorDraft.review.trim(),
  ),
)

const hasClassification = computed<boolean>(() =>
  Boolean(creatorDraft.realEstateListing && creatorDraft.category && creatorDraft.place),
)

const hasName = computed<boolean>(() => Boolean(creatorDraft.name.trim()))

const hasPrice = computed<boolean>(() => creatorDraft.priceOnRequest || creatorDraft.price !== null)

const hasRepresentativeImage = computed<boolean>(() =>
  creatorDraft.associatedMedia.some((item) => item.representativeOfPage),
)

const hasMediaAlt = computed<boolean>(
  () =>
    creatorDraft.associatedMedia.length > 0 &&
    creatorDraft.associatedMedia.every((item) => item.caption.trim()),
)

const hasSurface = computed<boolean>(() =>
  Boolean(creatorDraft.floorSize.trim() || creatorDraft.areaSize.trim()),
)

const canPublish = computed<boolean>(
  () =>
    hasClassification.value &&
    hasName.value &&
    hasPrice.value &&
    hasRepresentativeImage.value &&
    hasMediaAlt.value &&
    hasSurface.value,
)

const primaryActionLabel = computed<string>(() =>
  activeStep.value === 'summary' ? 'Préparer le payload' : 'Continuer',
)

const summaryItems = computed<Array<{ label: string; value: string }>>(() => [
  { label: 'Type', value: creatorDraft.realEstateListing || 'À choisir' },
  { label: 'Catégorie', value: creatorDraft.category || 'À choisir' },
  { label: 'Lieu', value: creatorDraft.place || 'À choisir' },
  { label: 'Nom', value: creatorDraft.name || 'À renseigner' },
  { label: 'Prix', value: creatorDraft.priceOnRequest ? 'Prix sur demande' : formatPrice() },
  { label: 'Images', value: `${creatorDraft.associatedMedia.length} image(s)` },
  {
    label: 'Textes alt',
    value: hasMediaAlt.value ? 'Complétés' : 'À compléter',
  },
  { label: 'Surface', value: creatorDraft.floorSize || creatorDraft.areaSize || 'À renseigner' },
])

const getStepRequirement = (stepId: CreatorStepId): boolean => {
  switch (stepId) {
    case 'classification':
      return hasClassification.value
    case 'name':
      return hasName.value
    case 'price':
      return hasPrice.value
    case 'media':
      return hasRepresentativeImage.value
    case 'mediaAlt':
      return hasMediaAlt.value
    case 'details':
      return hasSurface.value
    case 'optional':
      return true
    case 'summary':
      return canPublish.value
  }
}

const canAccessStep = (stepId: CreatorStepId): boolean => {
  if (stepId === 'summary') return true

  const targetIndex = steps.findIndex((step) => step.id === stepId)
  if (targetIndex <= activeStepIndex.value) return true

  return steps.slice(0, targetIndex).every((step) => step.optional || getStepRequirement(step.id))
}

const getStepState = (stepId: CreatorStepId): CreatorStepState => {
  if (stepId === activeStep.value) return 'current'
  if (!canAccessStep(stepId)) return 'locked'
  if (skippedSteps.value.has(stepId)) return 'skipped'
  return getStepRequirement(stepId) ? 'completed' : 'invalid'
}

const stepProgressClass = (stepId: CreatorStepId): string => {
  const state = getStepState(stepId)
  if (state === 'current') return 'w-8 bg-[#6B7A4A]'
  if (state === 'completed') return 'w-4 bg-[#6B7A4A]/60'
  if (state === 'skipped') return 'w-4 bg-white/20'
  if (state === 'invalid') return 'w-4 bg-white/25 hover:bg-white/35'
  return 'w-4 cursor-not-allowed bg-white/10'
}

const formatPrice = (): string => {
  if (creatorDraft.price === null) return 'À renseigner'
  return `${creatorDraft.price.toLocaleString('fr-FR')} ${creatorDraft.priceCurrency || 'MAD'}`
}

const resolveCreatorIri = (inCodeSet: string, code: string, label: string): string => {
  const iri = metadataStore.getIri(inCodeSet, code)
  if (iri) return iri
  throw new Error(`IRI introuvable pour ${label}`)
}

const createDraftAccommodation = async (): Promise<boolean> => {
  if (hasGeneratedIdentifier.value) return true

  isCreatingDraft.value = true
  clearStepError()
  clearReadyMessage()

  try {
    const result = await $fetch<CreatorDraftResponse>('/api/dashboard/accommodations/creator', {
      method: 'POST',
      body: {
        category: resolveCreatorIri('accommodation-type', creatorDraft.category, 'la catégorie'),
        realEstateListing: resolveCreatorIri(
          'real-estate-listing',
          creatorDraft.realEstateListing,
          'le type de listing',
        ),
        place: resolveCreatorIri('accommodation-place', creatorDraft.place, 'le lieu'),
        locale: localeSetting.value,
      },
    })

    creatorDraft.identifier = result.identifier
    emit('draft-created', result.identifier)
    readyMessage.value = `Référence ${result.identifier} créée.`
    return true
  } catch (error: unknown) {
    setStepError(error instanceof Error ? error.message : 'Création de la référence impossible.')
    return false
  } finally {
    isCreatingDraft.value = false
  }
}

const createPayload = (): DashboardEditableRecord => ({
  realEstateListing: creatorDraft.realEstateListing,
  category: creatorDraft.category,
  place: creatorDraft.place,
  name: creatorDraft.name,
  isActive: false,
  offer: {
    price: creatorDraft.priceOnRequest ? null : creatorDraft.price,
    priceCurrency: creatorDraft.priceCurrency,
    priceSpecification: creatorDraft.priceOnRequest ? 'prix-sur-demande' : null,
  },
  associatedMedia: creatorDraft.associatedMedia,
  floorSize: creatorDraft.floorSize || null,
  areaSize: creatorDraft.areaSize || null,
  review: creatorDraft.review || null,
})

const setStepError = (message: string): void => {
  stepError.value = message
}

const clearStepError = (): void => {
  stepError.value = null
}

const clearReadyMessage = (): void => {
  readyMessage.value = null
}

const validateCurrentStep = (): boolean => {
  if (currentStep.value.optional) return true
  if (getStepRequirement(currentStep.value.id)) return true

  const messages: Record<CreatorStepId, string> = {
    classification: 'Choisissez un type, une catégorie et un lieu.',
    name: 'Ajoutez un nom simple pour le bien.',
    price: 'Indiquez un prix ou choisissez prix sur demande.',
    media: 'Ajoutez au moins une image principale.',
    mediaAlt: 'Complétez le texte alt de chaque image associée.',
    details: 'Renseignez la surface habitable ou la surface totale.',
    optional: '',
    summary: 'La fiche doit être complète avant création.',
  }
  setStepError(messages[currentStep.value.id])
  return false
}

const goToStep = (stepId: CreatorStepId): void => {
  if (!canAccessStep(stepId)) return
  setActiveStep(stepId)
  clearStepError()
  clearReadyMessage()
}

const goNext = (): void => {
  const nextStep = steps[activeStepIndex.value + 1]
  if (!nextStep) return
  setActiveStep(nextStep.id)
  clearStepError()
  clearReadyMessage()
}

const goPrevious = (): void => {
  const previousStep = steps[activeStepIndex.value - 1]
  if (!previousStep) return
  setActiveStep(previousStep.id)
  clearStepError()
  clearReadyMessage()
}

const skipCurrentStep = (): void => {
  skippedSteps.value = new Set([...skippedSteps.value, currentStep.value.id])
  goNext()
}

const showSummary = (): void => {
  goToStep('summary')
}

const handleClose = (): void => {
  emit('close')
}

const handlePrimaryAction = async (): Promise<void> => {
  if (!validateCurrentStep()) return
  if (activeStep.value === 'classification') {
    const created = await createDraftAccommodation()
    if (!created) return
    goNext()
    return
  }
  if (activeStep.value === 'summary') {
    emit('ready', createPayload())
    readyMessage.value = 'Le payload est prêt. Le POST Nitro reste à brancher.'
    return
  }
  goNext()
}

const setActiveStep = (stepId: CreatorStepId): void => {
  const nextIndex = steps.findIndex((step) => step.id === stepId)
  stepTransitionName.value =
    nextIndex < activeStepIndex.value ? 'creator-step-backward' : 'creator-step-forward'
  activeStep.value = stepId
}

const stopTyping = (): void => {
  if (typingTimer === null) return
  clearTimeout(typingTimer)
  typingTimer = null
}

const scheduleNextSegment = (segment: AssistantSegment, runNext: () => void): void => {
  if (!segment.reveal) {
    runNext()
    return
  }
  const revealKey = segment.reveal
  typingTimer = setTimeout(() => {
    if (revealKey === 'nameInput') {
      revealedNameInput.value = true
    } else if (revealKey === 'priceFields') {
      revealedPriceFields.value = true
    } else if (revealKey === 'mediaFields') {
      revealedMediaFields.value = true
    } else if (revealKey === 'mediaAltFields') {
      revealedMediaAltFields.value = true
    } else if (revealKey === 'detailsFields') {
      revealedDetailsFields.value = true
    } else if (revealKey === 'optionalFields') {
      revealedOptionalFields.value = true
    } else if (revealKey === 'summaryContent') {
      revealedSummaryContent.value = true
    } else {
      revealedSelects[revealKey] = true
    }
    typingTimer = setTimeout(runNext, segment.pauseAfter ?? 0)
  }, segment.revealDelay ?? 0)
}

const runConversation = (segments: AssistantSegment[], segmentIndex: number): void => {
  const segment = segments[segmentIndex]
  if (!segment) {
    typingTimer = null
    isTypingDone.value = true
    return
  }

  if (segment.newLine) displayedAssistantMessage.value += '\n'
  const base = displayedAssistantMessage.value
  const advance = (): void => runConversation(segments, segmentIndex + 1)

  const typeCharacter = (charIndex: number): void => {
    displayedAssistantMessage.value = base + segment.text.slice(0, charIndex)
    if (charIndex >= segment.text.length) {
      scheduleNextSegment(segment, advance)
      return
    }
    typingTimer = setTimeout(() => typeCharacter(charIndex + 1), 18)
  }

  if (segment.delayBefore) {
    typingTimer = setTimeout(() => typeCharacter(1), segment.delayBefore)
  } else {
    typeCharacter(1)
  }
}

const startTyping = (): void => {
  stopTyping()
  displayedAssistantMessage.value = ''
  isTypingDone.value = false
  revealedSelects.listing = false
  revealedSelects.category = false
  revealedSelects.place = false
  revealedNameInput.value = false
  revealedPriceFields.value = false
  revealedMediaFields.value = false
  revealedMediaAltFields.value = false
  revealedDetailsFields.value = false
  revealedOptionalFields.value = false
  revealedSummaryContent.value = false
  runConversation(buildConversation(activeStep.value), 0)
}

const updateStringField = (
  field: 'realEstateListing' | 'category' | 'place',
  value: DashboardEditableValue,
): void => {
  creatorDraft[field] = typeof value === 'string' ? value : ''
  clearStepError()
  clearReadyMessage()
}

const updatePrice = (event: Event): void => {
  const raw = (event.target as HTMLInputElement).value
  const parsed = Number(raw)
  creatorDraft.price = raw === '' || !Number.isFinite(parsed) ? null : parsed
  clearStepError()
  clearReadyMessage()
}

const adjustPrice = (amount: number): void => {
  const currentPrice = creatorDraft.price ?? 0
  creatorDraft.price = Math.max(0, currentPrice + amount)
  clearStepError()
  clearReadyMessage()
}

const normalizeAssociatedMedia = (items: CreatorMediaItem[]): CreatorMediaItem[] => {
  if (items.length === 0) return []
  const hasRepresentative = items.some((item) => item.representativeOfPage)
  if (hasRepresentative) return items
  return items.map((item, index) => ({ ...item, representativeOfPage: index === 0 }))
}

const updateAssociatedMedia = (value: DashboardEditableValue): void => {
  if (!Array.isArray(value)) {
    creatorDraft.associatedMedia = []
    return
  }

  const items = value.flatMap((entry): CreatorMediaItem[] => {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return []
    const record = entry as Record<string, DashboardEditableValue>
    const image = typeof record.image === 'string' ? record.image : ''
    if (!image) return []
    return [
      {
        image,
        caption: typeof record.caption === 'string' ? record.caption : '',
        keywords: Array.isArray(record.keywords)
          ? record.keywords.filter((keyword): keyword is string => typeof keyword === 'string')
          : [],
        representativeOfPage: record.representativeOfPage === true,
      },
    ]
  })

  creatorDraft.associatedMedia = normalizeAssociatedMedia(items)
  clearStepError()
  clearReadyMessage()
}

watch(activeStep, startTyping)

onMounted(startTyping)

onBeforeUnmount(stopTyping)
</script>

<style scoped>
.creator-step-forward-enter-active,
.creator-step-forward-leave-active,
.creator-step-backward-enter-active,
.creator-step-backward-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.creator-step-forward-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}

.creator-step-forward-leave-to {
  opacity: 0;
  transform: translateX(-1rem);
}

.creator-step-backward-enter-from {
  opacity: 0;
  transform: translateX(-1rem);
}

.creator-step-backward-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}

.creator-reveal-enter-active {
  transition:
    opacity 360ms ease,
    transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.creator-reveal-enter-from {
  opacity: 0;
  transform: translateY(0.85rem);
}

.creator-caret {
  display: inline-block;
  margin-left: 0.1em;
  color: #6b7a4a;
  font-weight: 400;
  animation: creator-caret-blink 900ms steps(1, end) infinite;
}

.creator-price-input {
  appearance: textfield;
}

.creator-price-input::-webkit-outer-spin-button,
.creator-price-input::-webkit-inner-spin-button {
  margin: 0;
  appearance: none;
}

.creator-price-on-request-checkbox {
  width: 1.125rem;
  height: 1.125rem;
  flex: 0 0 auto;
  border: 1px solid rgb(255 255 255 / 0.35);
  border-radius: 0.125rem;
  appearance: none;
  background-color: transparent;
  display: grid;
  place-content: center;
  cursor: pointer;
}

.creator-price-on-request-checkbox::before {
  width: 0.55rem;
  height: 0.35rem;
  border-bottom: 2px solid white;
  border-left: 2px solid white;
  content: '';
  opacity: 0;
  transform: rotate(-45deg) translateY(-0.05rem);
}

.creator-price-on-request-checkbox:checked {
  border-color: #8a9a5b;
  background-color: #8a9a5b;
}

.creator-price-on-request-checkbox:checked::before {
  opacity: 1;
}

.creator-price-on-request-checkbox:focus-visible {
  outline: 2px solid rgb(138 154 91 / 0.7);
  outline-offset: 2px;
}

@keyframes creator-caret-blink {
  0%,
  50% {
    opacity: 1;
  }
  50.01%,
  100% {
    opacity: 0;
  }
}
</style>
