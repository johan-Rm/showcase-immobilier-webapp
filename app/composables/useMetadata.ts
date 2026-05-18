import type { AccommodationForm } from '#shared/types/accommodationForm'
import type { App } from '#shared/types/app'
import type {
  AccommodationCategory,
  AccommodationPlace,
  CategoryCode,
  MediaObject,
  Person,
  RealEstateListing,
} from '@schemas/interfaces'

import { useMetadataStore } from '~/stores/metadata'
import { loadContentResource } from '~/utils/loadContentResource'

type UseMetadataReturn = {
  loadApp: () => Promise<void>
  loadAccommodationForm: () => Promise<void>
  loadAllMetadata: () => Promise<void>
  loadRealEstateListings: () => Promise<void>
  loadAccommodationCategories: () => Promise<void>
  loadCategoryCodes: () => Promise<void>
  loadAccommodationPlaces: () => Promise<void>
  loadPeople: () => Promise<void>
  loadMediaObjects: () => Promise<void>
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

  const loadPeople = async (): Promise<void> => {
    const peopleItems = await loadContentResource<Person[]>('person', localeSetting.value)

    store.setPeople(peopleItems)
  }

  const loadMediaObjects = async (): Promise<void> => {
    const mediaObjectItems = await loadContentResource<MediaObject[]>(
      'media-object',
      localeSetting.value,
    )

    store.setMediaObjects(mediaObjectItems)
  }

  const loadAllMetadata = async (): Promise<void> => {
    await Promise.all([
      loadApp(),
      loadRealEstateListings(),
      loadAccommodationCategories(),
      loadCategoryCodes(),
      loadAccommodationPlaces(),
      loadPeople(),
      loadMediaObjects(),
    ])
  }

  return {
    loadApp,
    loadAccommodationForm,
    loadAllMetadata,
    loadRealEstateListings,
    loadAccommodationCategories,
    loadCategoryCodes,
    loadAccommodationPlaces,
    loadPeople,
    loadMediaObjects,
  }
}
