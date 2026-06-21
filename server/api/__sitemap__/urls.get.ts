import { loadContentFromFiles } from '../../utils/content/loaders'

export default defineEventHandler(async () => {
  const [accommodations, pages] = await Promise.all([
    loadContentFromFiles<Record<string, unknown>[]>('accommodations', 'fr'),
    loadContentFromFiles<Record<string, unknown>[]>('web-pages', 'fr'),
  ])

  const propertyUrls = accommodations
    .filter((item) => item.isActive !== false)
    .map((item) => ({
      loc: `/fr/properties/${item.realEstateListing}/${item.category}/${item.slug}`,
      lastmod: item.dateModified,
      changefreq: 'weekly',
      priority: 0.8,
    }))

  const pageUrls = pages.map((page) => ({
    loc: page.slug === 'home' ? '/fr' : `/fr/${page.slug}`,
    lastmod: page.dateModified,
    changefreq: 'monthly',
    priority: page.slug === 'home' ? 1 : 0.7,
  }))

  return [...pageUrls, ...propertyUrls]
})
