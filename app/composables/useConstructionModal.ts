export const useConstructionModal = () => {
  const isConstructionEnabled = useState<boolean>('is-construction-enabled', () => false)
  const isOpen = useState<boolean>('construction-modal-open', () => false)

  const open = (): void => {
    isOpen.value = true
  }

  const close = (): void => {
    isOpen.value = false
  }

  const toggleConstructionMode = (value: boolean): void => {
    isConstructionEnabled.value = value
  }

  return {
    isConstructionEnabled,
    isOpen,
    open,
    close,
    toggleConstructionMode,
  }
}
