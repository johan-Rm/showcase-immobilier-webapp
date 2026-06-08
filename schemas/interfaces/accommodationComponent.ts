import type { MediaObject } from './mediaObject'

export type AccommodationComponentType = Record<string, unknown>

export interface AccommodationComponent {
  /**
   * Type d'écran (gabarit de rendu)
   */
  additionalType: AccommodationComponentType
  /**
   * Désignation du bloc — localisé
   */
  name?: string
  /**
   * Titre du bloc — localisé
   */
  headline?: string
  /**
   * Paragraphe du bloc — localisé
   */
  text?: string
  /**
   * Ordre du bloc dans la fiche (ascendant)
   */
  position?: number
  /**
   * Médias référencés par le bloc (ordonnés)
   */
  associatedMedia?: MediaObject[]
  /**
   * Options d'affichage du bloc (objet JSON libre, forme non contrainte),
   * partagées entre langues. Ex. courants : reverse (bool), overlayMode (string).
   */
  meta?: Record<string, unknown>
}