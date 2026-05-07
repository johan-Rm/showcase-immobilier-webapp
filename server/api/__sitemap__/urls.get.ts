export default defineEventHandler(async () => {
  const [accommodations, pages] = await Promise.all([
    $fetch<Record<string, unknown>[]>('http://localhost:3000/api/content/accommodations'),
    $fetch<Record<string, unknown>[]>('http://localhost:3000/api/content/web-pages'),
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
