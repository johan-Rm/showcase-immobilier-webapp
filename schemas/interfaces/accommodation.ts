import type { AccommodationCategory } from './accommodationCategory'

import type { AccommodationMedia } from './accommodationMedia'

import type { AccommodationPlace } from './accommodationPlace'

import type { CategoryCode } from './categoryCode'

import type { Offer } from './offer'

import type { RealEstateListing } from './realEstateListing'

export type PropertyValue = Record<string, unknown>

export interface Accommodation {
  /**
   * Identifiant unique du bien (ex: référence interne ou ID externe)
   */
  identifier: string
  /**
   * Segment d'URL lisible, utilisé pour les routes publiques (ex: villa-piscine-saint-tropez)
   */
  slug: string
  /**
   * Titre principal affiché sur la fiche bien
   */
  name: string
  /**
   * Libellé court alternatif (ex: badge, accroche courte) — optionnel
   */
  label?: string
  /**
   * Phrase d'accroche mise en avant (ex: "Vue mer exceptionnelle") — optionnel
   */
  highlight?: string
  /**
   * Contenu riche long (description étendue, markdown ou HTML) — optionnel
   * --- Catégorisation & tags ---
   */
  body?: string
  /**
   * Type de bien : maison, appartement, terrain, etc.
   */
  category: AccommodationCategory
  /**
   * Tags libres pour la navigation filtrée ou le merchandising
   * --- Localisation ---
   */
  tags?: CategoryCode[]
  /**
   * Données géographiques : commune, département, coordonnées, etc.
   * --- Caractéristiques physiques ---
   */
  place: AccommodationPlace
  /**
   * Année de construction du bien — optionnel
   */
  yearBuilt?: number
  /**
   * Surface habitable (ex: "120 m²") — optionnel
   */
  floorSize?: number
  /**
   * Surface totale en m² (numérique, pour les calculs et filtres)
   */
  areaSize?: number
  /**
   * Surface de la terrasse en m² — optionnel
   */
  areaTerrace?: number
  /**
   * Surface du terrain (ex: "500 m²") — optionnel
   */
  landArea?: number
  /**
   * Indique le nombre d'étages (ex: 0 pour une maison de plain-pied, 1 pour un appartement au 1er étage) — optionnel
   */
  level?: number
  /**
   * Nombre total de pièces — optionnel
   */
  numberOfRooms?: number
  /**
   * Nombre de chambres — optionnel
   */
  numberOfBedrooms?: number
  /**
   * Nombre total de salles de bain et salles d'eau — optionnel
   */
  numberOfBathroomsTotal?: number
  /**
   * Nombre de garages ou emplacements véhicule — optionnel
   */
  numberOfGarages?: number
  /**
   * Capacité d'accueil maximale (personnes) — optionnel
   * --- Équipements & qualités ---
   */
  occupancy?: number
  /**
   * Liste des équipements (piscine, jacuzzi, alarme…) sous forme de codes catégorie
   */
  amenityFeature?: CategoryCode[]
  /**
   * Valeurs qualitatives libres (ex: exposition, vue, standing) sous forme clé/valeur
   * --- Offre commerciale ---
   */
  qualities?: PropertyValue[]
  /**
   * Prix, devise et disponibilité du bien (vente, location, vendu…)
   */
  offer: Offer
  /**
   * Données de l'annonce : portail de diffusion, référence externe, etc.
   * --- Médias ---
   */
  realEstateListing: RealEstateListing
  /**
   * Photos, vidéos et documents associés au bien (ordonnés)
   * --- Avis & contenu éditorial ---
   */
  associatedMedia: AccommodationMedia[]
  /**
   * Avis ou coup de cœur rédigé par l'agence — optionnel
   * --- SEO ---
   */
  review?: string
  /**
   * Titre de la balise <title> pour le référencement naturel
   */
  metaTitle: string
  /**
   * Description de la balise <meta name="description"> pour le référencement naturel
   * --- Cycle de vie ---
   */
  metaDescription: string
  /**
   * Contrôle la visibilité publique du bien (false = masqué du site)
   */
  isActive: boolean
  /**
   * Date de création de la fiche dans le système — optionnel
   */
  dateCreated?: string
  /**
   * Date de dernière modification — optionnel
   */
  dateModified?: string
}