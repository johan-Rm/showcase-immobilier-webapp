import type { ResourceKey } from '#shared/types/content'

export const CONTENT_RESOURCES = [
  'app',
  'web-pages',
  'articles',
  'travels',
  'real-estate-listing',
  'accommodation-category',
  'category-code',
  'accommodation-place',
  'person',
  'media-object',
  'accommodations',
] as const satisfies readonly ResourceKey[]

export const isResourceKey = (value: string): value is ResourceKey =>
  CONTENT_RESOURCES.includes(value as ResourceKey)
