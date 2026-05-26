export type PropertyValue = Record<string, unknown>

export type uuid = Record<string, unknown>

export interface AccommodationDtoAssociatedMedia {
  mediaObject?: uuid
  position?: number
  caption?: string
  keywords?: string[]
}

export interface AccommodationDtoOffer {
  price?: string
  priceCurrency?: string
  priceSpecification?: string
  availability?: string
}

export interface AccommodationDto {
  label?: string
  identifier?: string
  name?: string
  body?: string
  category?: uuid
  offer?: AccommodationDtoOffer
  yearBuilt?: number
  place?: uuid
  floorSize?: number
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
  realEstateListing?: uuid
  areaSize?: number
  areaTerrace?: number
  isActive?: boolean
  tags?: uuid[]
  metaTitle?: string
  metaDescription?: string
  slug?: string
  review?: string
  highlight?: string
}