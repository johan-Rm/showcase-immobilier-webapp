export type PostalAddress = Record<string, unknown>

export type PropertyValue = Record<string, unknown>

export type QuantitativeValue = Record<string, unknown>

export interface Organization {
  name: string
  acronym?: string
  fullName?: string
  alternateName?: string
  legalName?: string
  description?: string
  url?: string
  mainEntityOfPage?: string
  location?: string
  phoneNumbers?: string[]
  email: string[]
  foundingDate?: string
  /**
   * ex-addresses
   */
  address?: PostalAddress[]
  numberOfEmployees?: QuantitativeValue
  /**
   * ex-primaryImage / secondaryImage
   */
  image: string
  /**
   * ex-slug
   */
  identifier?: string
  /**
   * ex-type, numberOfProjects, etc.
   */
  additionalProperty?: PropertyValue[]
}
