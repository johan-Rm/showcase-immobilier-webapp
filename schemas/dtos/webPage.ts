export type uuid = Record<string, unknown>

export interface WebPageDto {
  identifier?: number | string
  slug?: string
  inLanguage?: string
  metaTitle?: string
  metaDescription?: string
  associatedMedia?: uuid[]
  headline?: string
  alternativeHeadline?: string
  highlight?: string
  articleSection?: string
  keywords?: string[]
  datePublished?: string
  dateCreated?: string
  dateModified?: string
  body?: string
}