import type { MediaObject } from './mediaObject'

export type CreativeWork = Record<string, unknown>

export type PropertyValue = Record<string, unknown>

export interface Article {
  datePublished?: string
  /**
   * ex-lastReview
   */
  dateModified?: string
  /**
   * ex-createdAt
   */
  dateCreated?: string
  /**
   * ex-category
   */
  articleSection?: string
  /**
   * ex-tags
   */
  keywords?: string[]
  /**
   * ex-propertyValues (metaDescription, metaTitle, translatable, alignPrimaryImage, isEnabled, isIndexed, structuredData, isLocked)
   */
  additionalProperty?: PropertyValue[]
  /**
   * ex-primaryImage / secondaryImage
   */
  image?: (MediaObject | string)[]
  /**
   * ex-slug
   */
  identifier?: string
  /**
   * ex-locale
   */
  inLanguage?: string
  headline?: string
  video?: MediaObject
  name?: string
  alternateName?: string
  description?: string
  url?: string
  mainEntityOfPage?: string
  /**
   * ex-pushForward
   */
  alternativeHeadline?: string
  /**
   * ex-textResume / articleResume
   */
  abstract?: string
  /**
   * ex-expire (pour Article, optionnel)
   */
  expires?: string
  text?: string
  articleBody?: string
  /**
   * ex-components / sections de page
   */
  hasPart?: CreativeWork[]
}
