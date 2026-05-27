import type { MediaObject } from './mediaObject'

export interface AccommodationMedia {
  image: MediaObject
  caption: string
  keywords?: string[]
}
