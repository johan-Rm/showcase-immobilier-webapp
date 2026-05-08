<template>
  <!-- Navigation des actions rapides -->
  <nav aria-label="Actions rapides" class="flex h-full items-center" :class="navClass">
    <ul class="flex" :class="listClass">
      <li
        v-for="item in visibleQuickActions"
        :key="item.id"
        :ref="(element) => registerQuickActionElement(element, item)"
        class="flex min-h-0 items-center"
        @pointerenter="warmQuickActionEntry(item)"
        @pointerdown="warmQuickActionEntry(item)"
        @touchstart.passive="warmQuickActionEntry(item)"
      >
        <AppLink
          :to="getQuickActionTo(item)"
          :target="getQuickActionTarget(item)"
          :rel="getQuickActionRel(item)"
          :aria-label="item.ariaLabel"
          :label="item.label"
          :icon="item.icon"
          icon-position="right"
          :icon-class="
            [
              'transition-transform duration-200 group-hover:translate-x-0.5',
              quickActionIconClass,
              colorClass,
              iconHoverColorClass,
            ]
              .filter(Boolean)
              .join(' ')
          "
          variant="text"
          :text-class="quickActionTextClass"
          :class="[textControlClass, item.itemClass, colorClass]"
          @focus="warmQuickActionEntry(item)"
          @click="handleQuickActionClick($event, item)"
        />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
// 1. Imports
import type { MenuItem } from '@schemas/interfaces'
import type { ComponentPublicInstance } from 'vue'

import { useIntersectionObserver, useTimeoutFn } from '@vueuse/core'

import { IMAGE_PRESETS } from '~/composables/useAppImage'
import { useConstructionModal } from '~/composables/useConstructionModal'
import { prefetchImage } from '~/composables/useImageWarmup'
import { useQuickActionWarmup } from '~/composables/useQuickActionWarmup'

// 2. Types et constantes statiques
type QuickActionsContainerVariant = 'glass'

const DEFAULT_COLOR_CLASS = 'text-foreground/90'

const CONTRAST_COLOR_CLASS = 'text-white/90'

const DEFAULT_TEXT_HOVER_COLOR_CLASS = 'group-hover:text-white'

const CONTRAST_TEXT_HOVER_COLOR_CLASS = 'group-hover:text-white'

const DEFAULT_ICON_HOVER_COLOR_CLASS = 'group-hover:text-white'

const CONTRAST_ICON_HOVER_COLOR_CLASS = 'group-hover:text-white'

type QuickActionsColorClass = typeof DEFAULT_COLOR_CLASS | typeof CONTRAST_COLOR_CLASS

type QuickActionItem = {
  id: string
  label: string
  icon: string
  ariaLabel: string
  to: string
  itemClass?: string
  target?: '_blank' | '_self'
  rel?: string
  external?: boolean
  onClick?: () => void
  visible?: boolean
  navigateOnClick?: boolean
}

type QuickActionElementEntry = {
  element: HTMLElement
  item: QuickActionItem
}

const listClass = 'h-full flex-col items-end justify-start gap-1'

const quickActionIconClass = 'text-base xl:text-lg 2xl:text-[2.5rem]'

// 3. Props et emits
const props = defineProps<{
  containerVariant?: QuickActionsContainerVariant
  colorClass?: QuickActionsColorClass
}>()

// 4. Composables, stores, routeur
const { toggleSidePanel } = useDashboard()

const { isConstructionEnabled, open: openConstructionModal } = useConstructionModal()

const appConfig = useAppConfig()

const image = useImage()

const localePath = useLocalePath()

const route = useRoute()

const { appData, navigationItems } = useAppNavigation()

const { currentMeta } = useScreenSystem()

const { warmQuickActionTarget } = useQuickActionWarmup()

const observeVisibleQuickActions = (): void => {
  quickActionElements.value.forEach(({ element, item }) => {
    if (observedQuickActionElements.has(element)) return

    observedQuickActionElements.add(element)

    const { stop } = useIntersectionObserver(
      element,
      ([entry]) => {
        if (!entry?.isIntersecting) return

        warmQuickActionEntry(item)
        stop()
      },
      {
        threshold: 0.25,
      },
    )

    stopQuickActionObservers.push(stop)
  })
}

const { start: scheduleVisibleQuickActionsWarmup } = useTimeoutFn(
  () => {
    observeVisibleQuickActions()
  },
  300,
  {
    immediate: false,
  },
)

// 5. Etat local
const warmedQuickActionIds = new Set<string>()

const warmedImageUrls = new Set<string>()

const observedQuickActionElements = new WeakSet<HTMLElement>()

// 6. Data inputs
const latestEffectiveColorClass = ref<QuickActionsColorClass>(DEFAULT_COLOR_CLASS)

const stopQuickActionObservers: Array<() => void> = []

const quickActionElements = ref<QuickActionElementEntry[]>([])

// 7. Validation et helpers purs
const findMenuItemByUrl = (url: string): MenuItem | null => {
  return navigationItems.value.find((item) => item.url === url) ?? null
}

const getQuickActionTo = (item: QuickActionItem): string => {
  if (item.onClick && !item.navigateOnClick) {
    return route.fullPath
  }

  const to = item.to || '#'

  if (item.external || to.startsWith('#')) return to

  return localePath(to)
}

const getQuickActionTarget = (item: QuickActionItem) => {
  if (item.external) return '_blank'
  return item.target
}

const getQuickActionRel = (item: QuickActionItem) => {
  if (item.external) return 'noopener noreferrer'
  return item.rel
}

const shouldUseContrastColor = (contentZone?: string, imageZone?: string) => {
  return contentZone === 'none' || imageZone === 'background' || imageZone === 'right'
}

// 8. Computed UI-ready
const navigationMainContent = computed(() => appData.value?.components?.navigationMain)

const propertiesMenuItem = computed(() => findMenuItemByUrl('/properties/bien-a-vendre'))

const contactMenuItem = computed(() => findMenuItemByUrl('/contact'))

const visibleQuickActions = computed(() =>
  quickActions.value.filter((item) => item.visible !== false),
)

const textHoverColorClass = computed(() => {
  return colorClass.value === CONTRAST_COLOR_CLASS
    ? CONTRAST_TEXT_HOVER_COLOR_CLASS
    : DEFAULT_TEXT_HOVER_COLOR_CLASS
})

const iconHoverColorClass = computed(() => {
  return colorClass.value === CONTRAST_COLOR_CLASS
    ? CONTRAST_ICON_HOVER_COLOR_CLASS
    : DEFAULT_ICON_HOVER_COLOR_CLASS
})

const quickActionTextClass = computed(() => {
  return [colorClass.value, textHoverColorClass.value].join(' ')
})

const textControlClass = computed(() => {
  return [
    'relative inline-flex items-center justify-end gap-2 bg-transparent px-0 text-right text-xs font-semibold tracking-[0.12em] uppercase transition duration-300 hover:bg-transparent hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.18)] after:absolute after:right-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full backdrop-blur-none xl:text-sm xl:tracking-[0.13em] 2xl:text-[2rem] 2xl:tracking-[0.24em]',
  ].join(' ')
})

const effectiveContainerVariant = computed(() => {
  return props.containerVariant ?? currentMeta.value?.quickActions?.containerVariant
})

const navClass = computed(() => {
  if (effectiveContainerVariant.value !== 'glass') return undefined
  return 'rounded-lg bg-black/20 p-2 backdrop-blur'
})

const mainMenuCenterImageWarmupUrl = computed<string>(() => {
  const preset = IMAGE_PRESETS.galleryColumn
  const src = appConfig.menu.mainMenuCenterImageUrl
  const responsiveImage = image.getSizes(src, {
    sizes: preset.sizes,
    modifiers: {
      width: preset.width,
      height: preset.height,
      format: preset.format,
      quality: preset.quality,
      fit: preset.fit,
    },
  })

  return (
    responsiveImage.src ??
    image(src, {
      width: preset.width,
      height: preset.height,
      format: preset.format,
      quality: preset.quality,
      fit: preset.fit,
    })
  )
})

// 9. Actions et handlers
const warmImage = (src: string): void => {
  if (warmedImageUrls.has(src)) return

  warmedImageUrls.add(src)
  void prefetchImage(src)
}

const openMainMenu = () => {
  toggleSidePanel('mainMenu')
}

const handleQuickActionClick = (event: MouseEvent, item: QuickActionItem) => {
  if (item.onClick) {
    item.onClick()
    if (!item.navigateOnClick) return
  }

  if (!isConstructionEnabled.value) return

  event.preventDefault()
  openConstructionModal()
}

const quickActions = computed<QuickActionItem[]>(() => [
  {
    id: 'menu',
    label: 'menu',
    to: '#',
    icon: 'i-lucide:menu',
    ariaLabel: navigationMainContent.value?.mainMenuAriaLabel ?? 'Ouvrir le menu principal',
    visible: Boolean(navigationMainContent.value?.mainMenuAriaLabel),
    onClick: openMainMenu,
    navigateOnClick: false,
  },
  {
    id: 'properties',
    label: 'nos biens',
    to: propertiesMenuItem.value?.url ?? '/properties/bien-a-vendre',
    icon: 'i-lucide:building-2',
    ariaLabel: 'Voir nos biens immobiliers',
    visible: Boolean(propertiesMenuItem.value?.name),
  },
  {
    id: 'contact',
    label: 'contact',
    to: contactMenuItem.value?.url ?? '/contact',
    icon: 'i-lucide:mail',
    ariaLabel: 'Accéder à la page contact',
    visible: Boolean(contactMenuItem.value?.name),
  },
])

const colorClass = computed<QuickActionsColorClass>(() => {
  return props.colorClass ?? latestEffectiveColorClass.value
})

const warmQuickActionEntry = (item: QuickActionItem) => {
  if (warmedQuickActionIds.has(item.id)) return

  warmedQuickActionIds.add(item.id)
  warmQuickActionTarget(item)

  if (item.id === 'menu') {
    warmImage(mainMenuCenterImageWarmupUrl.value)
  }
}

const registerQuickActionElement = (
  element: Element | ComponentPublicInstance | null,
  item: QuickActionItem,
) => {
  if (!(element instanceof HTMLElement)) return

  const alreadyRegistered = quickActionElements.value.some((entry) => entry.element === element)

  if (alreadyRegistered) return

  quickActionElements.value.push({
    element,
    item,
  })
}

// 10. Watch et watchEffect
watch(
  () => quickActionElements.value.length,
  () => {
    scheduleVisibleQuickActionsWarmup()
  },
  { flush: 'post' },
)

watch(
  () => currentMeta.value,
  (meta) => {
    if (!meta) return
    if (props.colorClass) return

    const useContrastColor = shouldUseContrastColor(
      meta.layout?.contentZone,
      meta.layout?.imageZone,
    )

    latestEffectiveColorClass.value = useContrastColor ? CONTRAST_COLOR_CLASS : DEFAULT_COLOR_CLASS
  },
  { immediate: true },
)

// 11. Metadonnees ecran ou page

// 12. Lifecycle
onMounted(() => {
  scheduleVisibleQuickActionsWarmup()
})

onBeforeUnmount(() => {
  stopQuickActionObservers.forEach((stop) => stop())
  stopQuickActionObservers.length = 0
  quickActionElements.value = []
})
</script>
