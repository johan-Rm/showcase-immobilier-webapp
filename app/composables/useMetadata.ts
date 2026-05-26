import type { AccommodationForm } from '#shared/types/accommodationForm'
import type { App, AppAccommodation } from '#shared/types/app'
import type { DashboardContent } from '#shared/types/dashboard'
import type {
  AccommodationCategory,
  AccommodationPlace,
  CategoryCode,
  MediaObject,
  RealEstateListing,
} from '@schemas/interfaces'

import { useMetadataStore } from '~/stores/metadata'
import { loadContentResource } from '~/utils/loadContentResource'

type UseMetadataReturn = {
  loadApp: () => Promise<void>
  loadAccommodationForm: () => Promise<void>
  loadDashboardContent: () => Promise<void>
  loadAccommodationUi: () => Promise<void>
  loadAllMetadata: () => Promise<void>
  loadRealEstateListings: () => Promise<void>
  loadAccommodationCategories: () => Promise<void>
  loadCategoryCodes: () => Promise<void>
  loadAccommodationPlaces: () => Promise<void>
  loadMediaObjects: () => Promise<void>
  loadDashboardCategoryCodes: () => Promise<void>
}

export const useMetadata = (): UseMetadataReturn => {
  const { localeSetting } = useLang()
  const store = useMetadataStore()

  const loadApp = async (): Promise<void> => {
    const appData = await loadContentResource<App>('app', localeSetting.value)
    store.setApp(appData)
  }

  const loadAccommodationForm = async (): Promise<void> => {
    const formData = await loadContentResource<AccommodationForm>(
      'forms/accommodation',
      localeSetting.value,
    )
    store.setAccommodationForm(formData)
  }

  const loadDashboardContent = async (): Promise<void> => {
    const data = await loadContentResource<DashboardContent>('dashboard', localeSetting.value)
    store.setDashboardContent(data)
  }

  const loadAccommodationUi = async (): Promise<void> => {
    const data = await loadContentResource<AppAccommodation>('ui/accommodation', localeSetting.value)
    store.setAccommodationUi(data)
  }

  const loadRealEstateListings = async (): Promise<void> => {
    const realEstateListingItems = await loadContentResource<RealEstateListing[]>(
      'real-estate-listing',
      localeSetting.value,
    )
    store.setAccommodationRealEstateListings(realEstateListingItems)
  }

  const loadAccommodationCategories = async (): Promise<void> => {
    const accommodationCategoryItems = await loadContentResource<AccommodationCategory[]>(
      'accommodation-category',
      localeSetting.value,
    )

    store.setAccommodationCategories(accommodationCategoryItems)
  }

  const loadCategoryCodes = async (): Promise<void> => {
    const categoryCodeItems = await loadContentResource<CategoryCode[]>(
      'category-code',
      localeSetting.value,
    )

    store.setCategoryCodes(categoryCodeItems)
  }

  const loadAccommodationPlaces = async (): Promise<void> => {
    const accommodationPlaceItems = await loadContentResource<AccommodationPlace[]>(
      'accommodation-place',
      localeSetting.value,
    )

    store.setAccommodationPlaces(accommodationPlaceItems)
  }

  const loadMediaObjects = async (): Promise<void> => {
    const mediaObjectItems = await loadContentResource<MediaObject[]>(
      'media-object',
      localeSetting.value,
    )

    store.setMediaObjects(mediaObjectItems)
  }

  const loadDashboardCategoryCodes = async (): Promise<void> => {
    const items = await $fetch<Array<{ iri: string; code: string; inCodeSet: string }>>(
      '/api/dashboard/category-codes',
    )
    store.setIrisMap(items)
  }

  const loadAllMetadata = async (): Promise<void> => {
    await Promise.all([
      loadApp(),
      loadAccommodationUi(),
      loadRealEstateListings(),
      loadAccommodationCategories(),
      loadCategoryCodes(),
      loadAccommodationPlaces(),
      loadMediaObjects(),
    ])
  }

  return {
    loadApp,
    loadAccommodationForm,
    loadDashboardContent,
    loadAccommodationUi,
    loadAllMetadata,
    loadRealEstateListings,
    loadAccommodationCategories,
    loadCategoryCodes,
    loadAccommodationPlaces,
    loadMediaObjects,
    loadDashboardCategoryCodes,
  }
}
