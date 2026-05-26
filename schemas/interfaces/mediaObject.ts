export interface MediaObject {
  identifier: string
  name: string
  alternateName?: string
  caption: string
  url: string
  source: string
  sourceUrl: string
  mainEntity: string
  representativeOfPage?: boolean
}