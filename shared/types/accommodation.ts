export type PropertyItem = {
  categorySlug: string
  city: string
  title: string
  price: string
  meta: string
  tags: string[]
  image: string
  href: string
  numberOfBedrooms?: number
  floorSize?: string
  identifier?: string
  place?: string
}

export type ViewModeList = 'single' | 'quad' | 'row4'
