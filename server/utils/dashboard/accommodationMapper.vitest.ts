import type { DashboardAccommodationSavePayload } from '#shared/types/dashboardAccommodation'

import { describe, expect, it } from 'vitest'

import { mapToApiPlatform } from './accommodationMapper'

const resolvedIris = {
  category: '/api/projects/project-1/category-codes/category-riad',
  realEstateListing: '/api/projects/project-1/category-codes/listing-sale',
  place: '/api/projects/project-1/category-codes/place-medina',
  amenityFeature: ['/api/projects/project-1/category-codes/amenity-terrace'],
  tags: ['/api/projects/project-1/category-codes/tag-investment'],
}

const createAccommodation = (
  overrides: Partial<DashboardAccommodationSavePayload> = {},
): DashboardAccommodationSavePayload => ({
  locale: 'fr',
  fileName: 'riad-bavr001.md',
  slug: 'riad-boutique-renove-medina-bavr001',
  identifier: 'BAVR001',
  frontmatter: {
    identifier: 'BAVR001',
    slug: 'riad-boutique-renove-medina-bavr001',
    name: 'Riad boutique renove en medina',
    label: 'Riad medina',
    highlight: 'Un riad exploitable immediatement.',
    review: 'Notre avis en francais.',
    metaTitle: 'Riad a vendre a Essaouira',
    metaDescription: 'Riad renove a vendre en medina.',
    isActive: true,
    category: 'riad',
    realEstateListing: 'bien-a-vendre',
    place: 'medina',
    amenityFeature: ['terrasse'],
    tags: ['investissement'],
    offer: {
      price: 850000,
      priceCurrency: 'EUR',
      priceSpecification: 'Prix de vente',
    },
    floorSize: '220',
    landArea: null,
    numberOfRooms: 8,
    numberOfBedrooms: 5,
    numberOfBathroomsTotal: 4,
    associatedMedia: [{ image: 'media-bavr001-01' }],
    additionalProperty: [{ name: 'dataSource', value: 'manual' }],
  },
  body: '<p>Texte source FR.</p>',
  preview: {
    identifier: 'BAVR001',
    slug: 'riad-boutique-renove-medina-bavr001',
    title: 'Riad boutique renove en medina',
    description: 'Un riad exploitable immediatement.',
    price: 850000,
    priceCurrency: 'EUR',
    priceSpecification: 'Prix de vente',
    placeSlug: 'medina',
    placeLabel: 'Medina',
    categorySlug: 'riad',
    categoryLabel: 'Riad',
    listingSlug: 'bien-a-vendre',
    listingLabel: 'Bien a vendre',
    isActive: true,
    floorSize: '220',
    landArea: null,
    numberOfRooms: 8,
    numberOfBedrooms: 5,
    numberOfBathroomsTotal: 4,
    primaryImageUrl: '/images/riad.jpg',
    media: [],
  },
  resolvedIris,
  ...overrides,
})

const testContext = {
  apiUrl: 'http://api.example.com',
  projectId: 'project-1',
}

describe('mapToApiPlatform', () => {
  it('construit le payload Symfony avec champs globaux a la racine et translations[]', async () => {
    const payload = await mapToApiPlatform(
      createAccommodation({
        translations: [
          {
            locale: 'fr',
            slug: 'riad-boutique-renove-medina-bavr001',
            name: 'Riad boutique renove en medina',
            body: '<p>Texte source FR.</p>',
          },
          {
            locale: 'en',
            name: 'Renovated boutique riad in the medina',
            body: '',
          },
          {
            locale: 'es',
            name: '',
            body: null,
          },
        ],
      }),
      testContext,
    )

    expect(payload).toMatchObject({
      identifier: 'BAVR001',
      isActive: true,
      category: resolvedIris.category,
      realEstateListing: resolvedIris.realEstateListing,
      place: resolvedIris.place,
      amenityFeature: resolvedIris.amenityFeature,
      tags: resolvedIris.tags,
      associatedMedia: [
        {
          mediaObject:
            'http://api.example.com/api/projects/project-1/media-objects/media-bavr001-01',
          position: 1,
          caption: null,
          keywords: [],
          representativeOfPage: null,
        },
      ],
      offer: {
        price: '850000',
        priceCurrency: 'EUR',
        priceSpecification: 'Prix de vente',
      },
      floorSize: '220',
      numberOfRooms: 8,
      numberOfBedrooms: 5,
      numberOfBathroomsTotal: 4,
      translations: [
        {
          locale: 'fr',
          slug: 'riad-boutique-renove-medina-bavr001',
          name: 'Riad boutique renove en medina',
          body: '<p>Texte source FR.</p>',
        },
        {
          locale: 'en',
          name: 'Renovated boutique riad in the medina',
          body: '',
        },
        {
          locale: 'es',
          name: '',
          body: null,
        },
      ],
    })
    expect(payload).not.toHaveProperty('additionalProperty')
    expect(payload).not.toHaveProperty('slug')
    expect(payload).not.toHaveProperty('name')
    expect(payload).not.toHaveProperty('body')
  })

  it('convertit les surfaces numeriques en chaines pour Symfony', async () => {
    const payload = await mapToApiPlatform(
      createAccommodation({
        frontmatter: {
          ...createAccommodation().frontmatter,
          floorSize: 27,
          landArea: 120,
          areaSize: 140,
          areaTerrace: 18,
        },
      }),
      testContext,
    )

    expect(payload).toMatchObject({
      floorSize: '27',
      landArea: '120',
      areaSize: '140',
      areaTerrace: '18',
    })
  })

  it('cree une traduction active quand aucun champ localise dirty nest fourni', async () => {
    const payload = await mapToApiPlatform(
      createAccommodation({ translations: undefined }),
      testContext,
    )

    expect(payload.translations).toEqual([
      {
        locale: 'fr',
        slug: 'riad-boutique-renove-medina-bavr001',
        name: 'Riad boutique renove en medina',
        label: 'Riad medina',
        highlight: 'Un riad exploitable immediatement.',
        body: '<p>Texte source FR.</p>',
        review: 'Notre avis en francais.',
        metaTitle: 'Riad a vendre a Essaouira',
        metaDescription: 'Riad renove a vendre en medina.',
      },
    ])
  })

  it('rejette un payload sans resolvedIris pour eviter des relations CategoryCode invalides', async () => {
    await expect(
      mapToApiPlatform(createAccommodation({ resolvedIris: undefined }), testContext),
    ).rejects.toThrow('resolvedIris manquant dans le payload')
  })
})
