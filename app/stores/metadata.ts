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

import { defineStore } from 'pinia'

type MetadataState = {
  app: App | null
  accommodationForm: AccommodationForm | null
  realEstateListings: RealEstateListing[]
  accommodationCategories: AccommodationCategory[]
  categoryCodes: CategoryCode[]
  accommodationPlaces: AccommodationPlace[]
  amenityFeatures: CategoryCode[]
  tags: CategoryCode[]
  people: Person[]
  imageObjects: MediaObject[]
  irisMap: Record<string, Record<string, string>>
}

export const useMetadataStore = defineStore('metadata', {
  state: (): MetadataState => ({
    app: null,
    accommodationForm: null,
    realEstateListings: [],
    accommodationCategories: [],
    categoryCodes: [],
    accommodationPlaces: [],
    amenityFeatures: [],
    tags: [],
    people: [],
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
     * Retourne la liste des personnes (agents, contacts) chargées.
     *
     * @param state État contenant `people`.
     *
     * @returns Tableau de `Person` disponibles.
     */
    getPeople(state: MetadataState): Person[] {
      return state.people
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
        switch (inCodeSet) {
          case 'accommodation-type':
            return state.accommodationCategories.map((c) => ({ label: c.name, value: c.slug }))
          case 'accommodation-place':
            return state.accommodationPlaces.map((c) => ({ label: c.name, value: c.slug }))
          case 'real-estate-listing':
            return state.realEstateListings
              .filter((c) => c.isActive !== false)
              .map((c) => ({ label: c.name, value: c.slug }))
          case 'amenity-feature':
            return state.amenityFeatures.map((c) => ({
              label: c.name || c.codeValue,
              value: c.codeValue,
            }))
          case 'tag':
            return state.tags.map((c) => ({ label: c.name || c.codeValue, value: c.codeValue }))
          default:
            return state.categoryCodes
              .filter((c) => c.inCodeSet === inCodeSet)
              .map((c) => ({ label: c.name || c.codeValue, value: c.codeValue }))
        }
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

    setAccommodationRealEstateListings(items: RealEstateListing[]): void {
      this.realEstateListings = Array.isArray(items) ? items : []
    },

    /**
     * Remplace la liste des catégories d’hébergements.
     *
     * @param items Liste de catégories à stocker.
     *
     * @returns `void`.
     */
    setAccommodationCategories(items: AccommodationCategory[]): void {
      this.accommodationCategories = Array.isArray(items) ? items : []
    },

    /**
     * Stocke les codes de catégories fournis ou vide si invalides.
     *
     * @param items Codes à enregistrer.
     *
     * @returns `void`.
     */
    setCategoryCodes(items: CategoryCode[]): void {
      this.categoryCodes = Array.isArray(items) ? items : []
    },

    /**
     * Met à jour la collection de lieux référencés.
     *
     * @param items Lieux à conserver dans l’état.
     *
     * @returns `void`.
     */
    setAccommodationPlaces(items: AccommodationPlace[]): void {
      this.accommodationPlaces = Array.isArray(items) ? items : []
    },

    /**
     * Charge les `amenityFeature` du backend.
     *
     * @param items Services à exposer dans le store.
     *
     * @returns `void`.
     */
    setAmenityFeatures(items: CategoryCode[]): void {
      this.amenityFeatures = Array.isArray(items) ? items : []
    },

    /**
     * Met à jour les tags métier utilisés en front.
     *
     * @param items Tags à stocker.
     *
     * @returns `void`.
     */
    setTags(items: CategoryCode[]): void {
      this.tags = Array.isArray(items) ? items : []
    },

    /**
     * Charge la liste des personnes du metadata (agents, contacts).
     *
     * @param items Personnes à mémoriser.
     *
     * @returns `void`.
     */
    setPeople(items: Person[]): void {
      this.people = Array.isArray(items) ? items : []
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

    reset(): void {
      this.app = null
      this.accommodationForm = null
      this.realEstateListings = []
      this.accommodationCategories = []
      this.categoryCodes = []
      this.accommodationPlaces = []
      this.amenityFeatures = []
      this.tags = []
      this.people = []
      this.imageObjects = []
      this.irisMap = {}
    },
  },
})
