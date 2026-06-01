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

import { defineStore } from 'pinia'

type MetadataState = {
  app: App | null
  accommodationForm: AccommodationForm | null
  dashboardContent: DashboardContent | null
  accommodationUi: AppAccommodation | null
  realEstateListings: RealEstateListing[]
  accommodationCategories: AccommodationCategory[]
  categoryCodes: CategoryCode[]
  accommodationPlaces: AccommodationPlace[]
  amenityFeatures: CategoryCode[]
  tags: CategoryCode[]
  imageObjects: MediaObject[]
  irisMap: Record<string, Record<string, string>>
}

export const useMetadataStore = defineStore('metadata', {
  state: (): MetadataState => ({
    app: null,
    accommodationForm: null,
    dashboardContent: null,
    accommodationUi: null,
    realEstateListings: [],
    accommodationCategories: [],
    categoryCodes: [],
    accommodationPlaces: [],
    amenityFeatures: [],
    tags: [],
    imageObjects: [],
    irisMap: {},
  }),

  getters: {
    /**
     * Retourne les contenus globaux d'application chargés.
     *
     * @param state État contenant `app`.
     *
     * @returns Objet `App` ou `null` si non chargé.
     */
    getApp(state: MetadataState): App | null {
      return state.app
    },

    /**
     * Retourne les listes d’annonces immobilières disponibles dans le store.
     *
     * @param state État contenant `realEstateListings`.
     *
     * @returns Tableau d’annonces immobilières stockées.
     */
    getAccommodationForm(state: MetadataState): AccommodationForm | null {
      return state.accommodationForm
    },

    getDashboardContent(state: MetadataState): DashboardContent | null {
      return state.dashboardContent
    },

    getAccommodationUi(state: MetadataState): AppAccommodation | null {
      return state.accommodationUi
    },

    getAccommodationRealEstateListings(state: MetadataState): RealEstateListing[] {
      return state.realEstateListings
    },

    /**
     * Renvoie les catégories d’hébergements chargées.
     *
     * @param state État contenant `accommodationCategories`.
     *
     * @returns Tableau des catégories d’hébergement.
     */
    getAccommodationCategories(state: MetadataState): AccommodationCategory[] {
      return state.accommodationCategories
    },

    /**
     * Accès aux codes de catégories utilitaires (amenities, tags, etc.).
     *
     * @param state État contenant `categoryCodes`.
     *
     * @returns Tableau des codes.
     */
    getCategoryCodes(state: MetadataState): CategoryCode[] {
      return state.categoryCodes
    },

    /**
     * Liste des lieux d’hébergement référencés.
     *
     * @param state État contenant `accommodationPlaces`.
     *
     * @returns Table des `AccommodationPlace` chargés.
     */
    getAccommodationPlaces(state: MetadataState): AccommodationPlace[] {
      return state.accommodationPlaces
    },

    /**
     * Retourne les services (`amenityFeature`) disponibles.
     *
     * @param state État contenant `amenityFeatures`.
     *
     * @returns Liste des `CategoryCode` utilisés comme services.
     */
    getAmenityFeatures(state: MetadataState): CategoryCode[] {
      return state.amenityFeatures
    },

    /**
     * Fournit les tags métier liés aux hébergements.
     *
     * @param state État contenant `tags`.
     *
     * @returns Liste des `CategoryCode` utilisés comme tags.
     */
    getTags(state: MetadataState): CategoryCode[] {
      return state.tags
    },

    /**
     * Accès aux objets médias (images, vidéos) disponibles.
     *
     * @param state État contenant `mediaObjects`.
     *
     * @returns Liste des `MediaObject` chargés.
     */
    getImageObjects(state: MetadataState): MediaObject[] {
      return state.imageObjects
    },

    /**
     * Index des `MediaObject` par `identifier`, filtré sur les entrées valides.
     *
     * @param state État contenant `imageObjects`.
     *
     * @returns Map `identifier → MediaObject`.
     */
    getImageObjectsByIdentifier(state: MetadataState): Map<string, MediaObject> {
      return new Map(
        state.imageObjects
          .filter((item): item is MediaObject & { identifier: string } => Boolean(item.identifier))
          .map((item) => [item.identifier, item] as const),
      )
    },

    getOptionsForCodeSet(
      state: MetadataState,
    ): (inCodeSet: string) => { label: string; value: string }[] {
      return (inCodeSet: string) => {
        const slugged: Record<string, Array<{ name: string; slug: string }>> = {
          'accommodation-category': state.accommodationCategories,
          'accommodation-place': state.accommodationPlaces,
          'real-estate-listing': state.realEstateListings,
        }
        if (inCodeSet in slugged) {
          return (slugged[inCodeSet] ?? []).map((c) => ({ label: c.name, value: c.slug }))
        }
        return [...state.amenityFeatures, ...state.tags, ...state.categoryCodes]
          .filter((c) => c.inCodeSet === inCodeSet)
          .map((c) => ({ label: c.name, value: c.codeValue }))
      }
    },

    getIri(state: MetadataState): (inCodeSet: string, code: string) => string | null {
      return (inCodeSet: string, code: string) => state.irisMap[inCodeSet]?.[code] ?? null
    },
  },

  actions: {
    /**
     * Met à jour le contenu global d'application.
     *
     * @param item Donnée d'application à stocker.
     *
     * @returns `void`.
     */
    setApp(item: App | null): void {
      this.app = item && typeof item === 'object' ? item : null
    },

    /**
     * Remplace les annonces immobilières par celles fournies.
     *
     * @param items Données entrantes potentiellement non tabulaires.
     *
     * @returns `void`.
     */
    setAccommodationForm(item: AccommodationForm | null): void {
      this.accommodationForm = item && typeof item === 'object' ? item : null
    },

    setDashboardContent(item: DashboardContent | null): void {
      this.dashboardContent = item && typeof item === 'object' ? item : null
    },

    setAccommodationUi(item: AppAccommodation | null): void {
      this.accommodationUi = item && typeof item === 'object' ? item : null
    },

    setCategoryCodes(items: CategoryCode[]): void {
      if (!Array.isArray(items)) return
      const SLUG_SETS = new Set([
        'accommodation-category',
        'accommodation-place',
        'real-estate-listing',
        'amenity-feature',
        'tag',
      ])
      this.accommodationCategories = items
        .filter((c) => c.inCodeSet === 'accommodation-category')
        .map(({ codeValue, name, text }) => ({ slug: codeValue, name, text }))
      this.accommodationPlaces = items
        .filter((c) => c.inCodeSet === 'accommodation-place')
        .map(({ codeValue, name, text }) => ({ slug: codeValue, name, text }))
      this.realEstateListings = items
        .filter((c) => c.inCodeSet === 'real-estate-listing')
        .map(({ codeValue, name, text }) => ({ slug: codeValue, name, text }))
      this.amenityFeatures = items.filter((c) => c.inCodeSet === 'amenity-feature')
      this.tags = items.filter((c) => c.inCodeSet === 'tag')
      this.categoryCodes = items.filter((c) => !SLUG_SETS.has(c.inCodeSet ?? ''))
    },

    /**
     * Actualise les objets médias référencés.
     *
     * @param items Médias à conserver (images, vidéos).
     *
     * @returns `void`.
     */
    setMediaObjects(items: MediaObject[]): void {
      this.imageObjects = Array.isArray(items) ? items : []
    },

    /**
     * Réinitialise tous les tableaux du store à l’état vide.
     *
     * @returns `void`.
     */
    addMediaObject(item: MediaObject): void {
      this.imageObjects = [...this.imageObjects, item]
    },

    addCategoryCode(item: CategoryCode): void {
      switch (item.inCodeSet) {
        case 'amenity-feature':
          this.amenityFeatures = [...this.amenityFeatures, item]
          break
        case 'tag':
          this.tags = [...this.tags, item]
          break
        default:
          this.categoryCodes = [...this.categoryCodes, item]
      }
    },

    setIrisMap(items: Array<{ iri: string; code: string; inCodeSet: string }>): void {
      const map: Record<string, Record<string, string>> = {}
      for (const item of items) {
        if (!map[item.inCodeSet]) map[item.inCodeSet] = {}
        map[item.inCodeSet]![item.code] = item.iri
      }
      this.irisMap = map
    },

    addIri(item: { iri: string; code: string; inCodeSet: string }): void {
      this.irisMap = {
        ...this.irisMap,
        [item.inCodeSet]: {
          ...(this.irisMap[item.inCodeSet] ?? {}),
          [item.code]: item.iri,
        },
      }
    },

    reset(): void {
      this.app = null
      this.accommodationForm = null
      this.dashboardContent = null
      this.accommodationUi = null
      this.realEstateListings = []
      this.accommodationCategories = []
      this.categoryCodes = []
      this.accommodationPlaces = []
      this.amenityFeatures = []
      this.tags = []
      this.imageObjects = []
      this.irisMap = {}
    },
  },
})
