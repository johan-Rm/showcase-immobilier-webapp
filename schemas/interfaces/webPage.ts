import type { CategoryCode } from './categoryCode'

import type { MediaObject } from './mediaObject'

export type PropertyValue = Record<string, unknown>

export interface WebPage {
  slug: string
  headline: string
  alternativeHeadline?: string
  datePublished: string
  dateCreated: string
  /**
   * ex-createdAt
   */
  dateModified: string
  /**
   * ex-category
   */
  articleSection?: CategoryCode
  /**
   * ex-tags
   */
  keywords?: CategoryCode[]
  /**
   * ex-propertyValues + champs techniques (alignPrimaryImage, isLocked, isEnabled, isIndexed, structuredData, translatable, pushForward)
   */
  additionalProperty?: PropertyValue[]
  video?: MediaObject
  /**
   * ex-primaryImage / secondaryImage / icon
   */
  associatedMedia?: MediaObject[]
  /**
   * ex-slug
   */
  identifier?: string
  /**
   * ex-locale
   */
  inLanguage?: string
  name?: string
  alternateName?: string
  description?: string
  url?: string
  mainEntityOfPage?: string
  /**
   * ex-components / sections de page (blocs de contenu generiques)
   */
  hasPart?: Record<string, unknown>[]
  text?: string
  body?: string
  /**
   * ex-textResume
   */
  abstract?: string
  /**
   * ex-expire
   */
  expires?: string
  metaTitle: string
  metaDescription: string
}