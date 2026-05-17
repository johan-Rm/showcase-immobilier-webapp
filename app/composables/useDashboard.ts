import type { Ref } from 'vue'

interface ModalItem {
  visible: boolean
}

interface Modals {
  example1: ModalItem
}

interface SidePanelItem {
  visible: boolean
}
interface SidePanels {
  designControls: SidePanelItem
  mainMenu: SidePanelItem
}

type UseDashboardReturn = {
  isCommandPaletteOpen: Ref<boolean>
  openCommandPalette: () => void
  closeCommandPalette: () => void
  toggleCommandPalette: () => void
  isCommandPropertyOpen: Ref<boolean>
  openCommandProperty: () => void
  closeCommandProperty: () => void
  toggleCommandProperty: () => void
  sidePanels: Ref<SidePanels>
  openSidePanel: (key: keyof SidePanels) => void
  closeSidePanel: (key: keyof SidePanels) => void
  toggleSidePanel: (key: keyof SidePanels) => void
  hideSidePanelsItems: () => void
}

const _useDashboard = (): UseDashboardReturn => {
  const route = useRoute()
  const isCommandPaletteOpen = useState<boolean>('ui.commandPalette.open', () => false)

  const openCommandPalette = (): void => {
    isCommandPaletteOpen.value = true
  }

  const closeCommandPalette = (): void => {
    isCommandPaletteOpen.value = false
  }

  const toggleCommandPalette = (): void => {
    isCommandPaletteOpen.value = !isCommandPaletteOpen.value
  }

  const isCommandPropertyOpen = useState<boolean>('ui.commandProperty.open', () => false)

  const openCommandProperty = (): void => {
    isCommandPropertyOpen.value = true
  }

  const closeCommandProperty = (): void => {
    isCommandPropertyOpen.value = false
  }

  const toggleCommandProperty = (): void => {
    isCommandPropertyOpen.value = !isCommandPropertyOpen.value
  }

  const sidePanels = ref<SidePanels>({
    designControls: { visible: false },
    mainMenu: { visible: false },
  })

  const modals = ref<Modals>({
    example1: { visible: false },
  })

  const hideModalsItems = (): void => {
    const keys = Object.keys(modals.value) as Array<keyof Modals>
    keys.forEach((item) => {
      modals.value[item].visible = false
    })
  }

  const hideSidePanelsItems = (): void => {
    Object.keys(sidePanels.value).forEach((item) => {
      sidePanels.value[item as keyof SidePanels].visible = false
    })
  }

  const openSidePanel = (key: keyof SidePanels): void => {
    hideSidePanelsItems()
    sidePanels.value[key].visible = true
  }

  const closeSidePanel = (key: keyof SidePanels): void => {
    sidePanels.value[key].visible = false
  }

  const toggleSidePanel = (key: keyof SidePanels): void => {
    if (sidePanels.value[key].visible) {
      sidePanels.value[key].visible = false
      return
    }
    hideSidePanelsItems()
    sidePanels.value[key].visible = true
  }

  if (import.meta.client) {
    defineShortcuts({
      meta_k: {
        usingInput: true,
        handler: () => {
          toggleCommandPalette()
        },
      },
      escape: {
        usingInput: true,
        handler: () => {
          if (!isCommandPaletteOpen.value) return
          closeCommandPalette()
        },
      },
      meta_q: {
        usingInput: true,
        handler: () => {
          toggleSidePanel('designControls')
        },
      },
      ctrl_m: {
        usingInput: true,
        handler: () => {
          toggleSidePanel('mainMenu')
        },
      },
      ctrl_s: {
        usingInput: false,
        handler: () => {
          toggleCommandProperty()
        },
      },
      ctrl_d: {
        usingInput: false,
        handler: () => {
          navigateTo('/dashboard')
        },
      },
    })
  }
  watch(
    () => route.fullPath,
    () => {
      hideModalsItems()
      hideSidePanelsItems()
      // showLogostate()
    },
  )

  return {
    isCommandPaletteOpen,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
    isCommandPropertyOpen,
    openCommandProperty,
    closeCommandProperty,
    toggleCommandProperty,
    sidePanels,
    openSidePanel,
    closeSidePanel,
    toggleSidePanel,
    hideSidePanelsItems,
  }
}

export const useDashboard = createSharedComposable(_useDashboard)
