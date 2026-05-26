import type { MediaObject } from './mediaObject'

import type { MenuItem } from './menuItem'

export type PropertyValue = Record<string, unknown>

export interface CreativeWork {
  /**
   * ex-slug technique du composant
   */
  identifier?: string
  /**
   * ex-designation
   */
  name?: string
  /**
   * ex-code composant ou type métier complémentaire
   */
  additionalType?: string | string
  /**
   * ex-title
   */
  headline?: string
  /**
   * ex-subtitle
   */
  alternativeHeadline?: string
  description?: string
  /**
   * ex-content
   */
  text?: string
  /**
   * ex-primaryImage
   */
  image?: MediaObject | MediaObject[] | string
  url?: string
  /**
   * ex-liens secondaires rattachés au contenu
   */
  links?: MenuItem[]
  /**
   * ordre d'affichage dans la page
   */
  position?: number | string
  /**
   * ex-code composant, align, variations techniques
   */
  additionalProperty?: PropertyValue[]
  /**
   * ex-sous-composants si nécessaire
   */
  hasPart?: CreativeWork[]
  isPartOf?: CreativeWork | string
}