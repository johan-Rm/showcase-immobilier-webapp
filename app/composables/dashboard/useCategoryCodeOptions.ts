type CategoryCodeMap = Record<string, Record<string, string>>
type CodeOption = { label: string; value: string }

export const useCategoryCodeOptions = () => {
  const { data: map, status, error, refresh } = useAsyncData<CategoryCodeMap>(
    'dashboard:category-codes',
    () => $fetch<CategoryCodeMap>('/api/dashboard/category-codes'),
    { server: false, lazy: true },
  )

  const optionsFor = (inCodeSet: string): CodeOption[] => {
    const group = map.value?.[inCodeSet]
    if (!group) return []
    return Object.keys(group).map((code) => ({ label: code, value: code }))
  }

  const createCode = async (inCodeSet: string, code: string): Promise<void> => {
    await $fetch('/api/dashboard/category-codes', {
      method: 'POST',
      body: { code, inCodeSet },
    })
    await refresh()
  }

  return {
    loading: computed(() => status.value === 'pending'),
    loadError: computed(() => (error.value ? 'Erreur chargement des codes' : null)),
    optionsFor,
    createCode,
  }
}
