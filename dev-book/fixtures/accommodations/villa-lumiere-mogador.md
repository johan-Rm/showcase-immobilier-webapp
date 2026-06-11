---
# ──────────────────────────────────────────────────────────────────────────
# FIXTURE DE DÉMO — POC parcours immersif (tâche 033). Données FICTIVES,
# anonymisées, inspirées d'un listing réel (textes réécrits, nom/réf fictifs).
# content/*/accommodations/ est gitignoré ET purgé par `make dev-content-sync`.
# Source de vérité versionnée : ce fichier. Pour (ré)activer la fiche :
#   cp dev-book/fixtures/accommodations/villa-lumiere-mogador.md \
#      content/fr/accommodations/villa-lumiere-mogador.md
# ──────────────────────────────────────────────────────────────────────────
identifier: FBAVVA002
slug: villa-lumiere-mogador
name: Villa Lumière
dateCreated: 2026-06-10T00:00:00+00:00
dateModified: 2026-06-10T00:00:00+00:00
category: villa-golf
realEstateListing: bien-a-vendre
place: golf-mogador
offer:
  price: 9800000
  priceCurrency: MAD
  priceSpecification: À la vente
floorSize: 200
numberOfRooms: 9
numberOfBedrooms: 5
numberOfBathroomsTotal: 4
occupancy: 10
yearBuilt: null
landArea: null
areaSize: null
areaTerrace: null
numberOfGarages: null
amenityFeature: []
additionalProperty: []
associatedMedia: []
realEstateAgent: null
highlight: null
review: null
isActive: true
metaTitle: Villa Lumière — Visite immersive | Mogador, Essaouira
metaDescription: Découvrez la Villa Lumière, villa de plain-pied de cinq chambres ouverte sur le golf de Mogador, à travers un parcours immersif espace après espace.

# Parcours immersif horizontal — un bloc hasPart = un écran (cf. deriveScreens).
# additionalType → gabarit, headline avec **accent**, meta.reverse / meta.overlayMode.
hasPart:
  - additionalType: SCREEN_ACCOMMODATION_FULL
    position: 1
    name: Vue d'ensemble
    headline: Une villa de plain-pied **au bord du golf**
    text: Posée entre fairways et grands arbres, une villa lumineuse de cinq chambres, pensée pour la lumière et la vie au rez-de-jardin.
    associatedMedia:
      - url: /poc/villa-lumiere-mogador/villa-lumiere-vue-ensemble-01.jpg
        caption: La villa et sa piscine privée ouvertes sur le jardin

  - additionalType: SCREEN_ACCOMMODATION_SPLIT
    position: 2
    name: Les salons
    headline: Vivre **en grand**, baies ouvertes
    text: Un vaste salon ouvert sur le jardin par de hautes baies vitrées, prolongé par un mur de pierre et des assises profondes.
    meta:
      reverse: true
    associatedMedia:
      - url: /poc/villa-lumiere-mogador/villa-lumiere-salon-01.jpg
        caption: Salon ouvert sur le jardin par de larges baies

  - additionalType: SCREEN_ACCOMMODATION_TRYPTIQUE
    position: 3
    name: Les extérieurs
    headline: Le jardin, prolongé **jusqu'aux fairways**
    text: Terrasses ombragées, table de plein air et piscine privée composent un dehors généreux ouvert sur le golf.
    associatedMedia:
      - url: /poc/villa-lumiere-mogador/villa-lumiere-exterieur-01.jpg
        caption: Terrasse et piscine bordées de grandes jarres
      - url: /poc/villa-lumiere-mogador/villa-lumiere-exterieur-02.jpg
        caption: Pergola ombragée au cœur du jardin
      - url: /poc/villa-lumiere-mogador/villa-lumiere-exterieur-03.jpg
        caption: Grande table conviviale sous les arbres

  - additionalType: SCREEN_ACCOMMODATION_CAROUSEL
    position: 4
    name: Les chambres
    headline: Cinq chambres **de plain-pied**
    text: Cinq chambres ouvertes sur le jardin, des suites parentales aux chambres familiales, toutes baignées de lumière.
    associatedMedia:
      - url: /poc/villa-lumiere-mogador/villa-lumiere-chambre-01.jpg
        caption: Chambre double aux teintes claires
      - url: /poc/villa-lumiere-mogador/villa-lumiere-chambre-02.jpg
        caption: Chambre en bois ouverte sur la terrasse
      - url: /poc/villa-lumiere-mogador/villa-lumiere-chambre-03.jpg
        caption: Chambre lumineuse aux rideaux chaleureux
      - url: /poc/villa-lumiere-mogador/villa-lumiere-chambre-04.jpg
        caption: Chambre avec moustiquaire et coin salon

  - additionalType: SCREEN_ACCOMMODATION_OVERLAY
    position: 5
    name: La cuisine
    headline: L'art de **recevoir**
    text: Une cuisine entièrement équipée, ouverte sur les pièces de vie et tournée vers le jardin.
    meta:
      overlayMode: dark
    associatedMedia:
      - url: /poc/villa-lumiere-mogador/villa-lumiere-cuisine-01.jpg
        caption: Cuisine ouverte sur les espaces de vie

  - additionalType: SCREEN_ACCOMMODATION_DUO
    position: 6
    name: Les salles d'eau
    headline: Une **parenthèse** d'eau claire
    text: Double vasque, baignoire et douche composent des salles d'eau douces, en prise directe avec la lumière.
    associatedMedia:
      - url: /poc/villa-lumiere-mogador/villa-lumiere-salle-de-bains-01.jpg
        caption: Double vasque et baignoire
      - url: /poc/villa-lumiere-mogador/villa-lumiere-salle-de-bains-02.jpg
        caption: Salle d'eau habillée de bois

  - additionalType: SCREEN_ACCOMMODATION_CAROUSEL
    position: 7
    name: Les espaces de vie
    headline: Des pièces **baignées de soleil**
    text: Du second salon à la salle à manger jusqu'aux terrasses lounge, chaque pièce s'ouvre sur le dehors.
    associatedMedia:
      - url: /poc/villa-lumiere-mogador/villa-lumiere-salon-02.jpg
        caption: Second salon ouvert et lumineux
      - url: /poc/villa-lumiere-mogador/villa-lumiere-salle-a-manger-01.jpg
        caption: Salle à manger autour d'une grande table
      - url: /poc/villa-lumiere-mogador/villa-lumiere-terrasse-01.jpg
        caption: Terrasse lounge ouverte sur le jardin
      - url: /poc/villa-lumiere-mogador/villa-lumiere-salon-03.jpg
        caption: Salon de réception aux tons clairs

  - additionalType: SCREEN_ACCOMMODATION_CONTACT
    position: 8
    name: Dernière étape
    headline: Intéressé ?
    text: "Vous venez de visiter la Villa Lumière. Laissez-nous vos coordonnées pour organiser une visite privée."
    associatedMedia: []
---

## Villa Lumière

Villa contemporaine de plain-pied, cinq chambres ouvertes sur le jardin et le golf de Mogador. Parcours immersif espace après espace, de la vue d'ensemble au contact.
