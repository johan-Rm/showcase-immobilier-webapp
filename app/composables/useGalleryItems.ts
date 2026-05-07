import type { CreativeWork, MediaObject } from '@schemas/interfaces'
import type { ComputedRef } from 'vue'

export type GalleryItem = {
  id: string
  title: string
  alternateName: string
  src: string
  sourceIndex: number
}

function extractImageSrc(image: MediaObject | MediaObject[] | string | undefined): string {
  if (typeof image === 'string') return image.trim()
  if (Array.isArray(image)) return image[0]?.url?.trim() ?? ''
  return image?.url?.trim() ?? ''
}

export function useGalleryItems(hasPart: ComputedRef<CreativeWork[] | undefined>): {
  galleryItems: ComputedRef<GalleryItem[]>
} {
  const metadataStore = useMetadataStore()

  const galleryItems = computed<GalleryItem[]>(() =>
    (hasPart.value ?? [])
      .map((part, index) => {
        const src = extractImageSrc(part.image)
        if (!src) return null

        const imageMeta = metadataStore.imageObjects.find((item) => item.url === src)
        const title = imageMeta?.name ?? `Visuel ${index + 1}`

        return {
          id: `img-${index + 1}`,
          title,
          alternateName: title,
          src,
          sourceIndex: index,
        }
      })
      .filter((item): item is GalleryItem => item !== null),
  )

  return { galleryItems }
}
