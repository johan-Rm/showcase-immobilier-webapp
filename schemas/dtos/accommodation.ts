export type PropertyValue = Record<string, unknown>

export type uuid = Record<string, unknown>

export interface AccommodationDtoAssociatedMedia {
  mediaObject?: uuid
  position?: number
  caption?: string
  keywords?: string[]
}

export interface AccommodationDtoHasPart {
  additionalType?: string
  name?: string
  headline?: string
  text?: string
  position?: number
  associatedMedia?: uuid[]
  meta?: Record<string, unknown>
}

export interface AccommodationDtoOffer {
  price?: string
  priceCurrency?: string
  priceSpecification?: string
  availability?: string
}

export interface AccommodationDtoRealEstateListing {
  slug?: string
  name?: string
  text?: string
  isEnabled?: boolean
}

export interface AccommodationDto {
  label?: string
  id?: uuid
  name?: string
  body?: string
  category?: uuid
  offer?: AccommodationDtoOffer
  yearBuilt?: number
  place?: uuid
  floorSize?: string
  numberOfRooms?: number
  landArea?: string
  numberOfGarages?: number
  numberOfBedrooms?: number
  numberOfBathroomsTotal?: number
  level?: number
  occupancy?: number
  amenityFeature?: uuid[]
  qualities?: PropertyValue[]
  associatedMedia?: AccommodationDtoAssociatedMedia[]
  realEstateListing?: AccommodationDtoRealEstateListing
  areaSize?: string
  areaTerrace?: string
  isActive?: boolean
  tags?: uuid[]
  metaTitle?: string
  metaDescription?: string
  slug?: string
  review?: string
  highlight?: string
  hasPart?: AccommodationDtoHasPart[]
}