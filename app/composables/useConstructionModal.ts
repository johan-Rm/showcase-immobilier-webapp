export const useConstructionModal = () => {
  const isConstructionEnabled = useState<boolean>('is-construction-enabled', () => false)
  const isOpen = useState<boolean>('construction-modal-open', () => false)

  const open = (): void => {
    isOpen.value = true
  }

  const close = (): void => {
    if (isConstructionEnabled.value) return

    isOpen.value = false
  }

  const toggleConstructionMode = (value: boolean): void => {
    isConstructionEnabled.value = value
    isOpen.value = value
  }

  return {
    isConstructionEnabled,
    isOpen,
    open,
    close,
    toggleConstructionMode,
  }
}
