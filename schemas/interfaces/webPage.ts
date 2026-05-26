import type { CategoryCode } from './categoryCode'

import type { MediaObject } from './mediaObject'
import type { MenuItem } from './menuItem'

export type CreativeWork = {
  [key: string]: unknown
  headline?: string
  alternativeHeadline?: string
  text?: string
  name?: string
  additionalType?: string
  url?: string
  image?: MediaObject | string | MediaObject[]
  links?: MenuItem[]
  hasPart?: CreativeWork[]
}

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
   * ex-components / sections de page
   */
  hasPart?: CreativeWork[]
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