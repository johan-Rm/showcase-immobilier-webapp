type AppImagePreset = {
  width: number
  height?: number
  format: 'webp'
  quality: 80
  fit: 'cover'
  sizes: string
}

const createImagePreset = (width: number, height: number, sizes: string): AppImagePreset => ({
  width,
  height,
  format: 'webp',
  quality: 80,
  fit: 'cover',
  sizes,
})

const createResponsiveImagePreset = (width: number, sizes: string): AppImagePreset => ({
  width,
  format: 'webp',
  quality: 80,
  fit: 'cover',
  sizes,
})

export const IMAGE_PRESETS = {
  heroMaster: createImagePreset(2560, 1440, '2560px'),
  heroFullScreen: createResponsiveImagePreset(1920, '1920px'),
  heroOptimized: createImagePreset(1600, 900, '1600px'),
  sectionBanner: createImagePreset(1280, 720, '1280px'),
  realEstateCard: createImagePreset(800, 600, '800px'),
  compactCard: createImagePreset(600, 600, '600px'),
  galleryLightbox: createImagePreset(1200, 900, '1200px'),
  galleryColumn: createImagePreset(600, 900, '600px'),
  thumbnail: createImagePreset(300, 300, '300px'),
  heroMobile: createResponsiveImagePreset(800, '800px'),
  cardMobile: createImagePreset(600, 450, '600px'),
  thumbnailMobile: createImagePreset(200, 200, '200px'),
  fullscreenCover: createResponsiveImagePreset(2048, '2048px'),
  vertical3col: createResponsiveImagePreset(852, '852px'),
} as const

type AppImagePresetName = keyof typeof IMAGE_PRESETS

export const IMAGE_DIMENSIONS = Object.fromEntries(
  Object.entries(IMAGE_PRESETS).map(([name, preset]) => [
    name,
    {
      width: preset.width,
      height: preset.height,
    },
  ]),
) as {
  readonly [Name in AppImagePresetName]: Pick<(typeof IMAGE_PRESETS)[Name], 'width' | 'height'>
}

export const useAppImage = () => {
  return {
    IMAGE_DIMENSIONS,
    IMAGE_PRESETS,
  }
}
