export interface WebPageDto {
  id?: number
  slug?: string
  inLanguage?: string
  metaTitle?: string
  metaDescription?: string
  image?: string[]
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