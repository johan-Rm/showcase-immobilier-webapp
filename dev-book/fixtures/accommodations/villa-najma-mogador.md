---
# ──────────────────────────────────────────────────────────────────────────
# FIXTURE DE DÉMO — POC parcours immersif (tâche 033). Données FICTIVES,
# anonymisées, inspirées d'un listing réel (textes réécrits, nom/réf fictifs).
# content/*/accommodations/ est gitignoré ET purgé par `make dev-content-sync`.
# Source de vérité versionnée : ce fichier. Pour (ré)activer la fiche :
#   cp dev-book/fixtures/accommodations/villa-najma-mogador.md \
#      content/fr/accommodations/villa-najma-mogador.md
# ──────────────────────────────────────────────────────────────────────────
identifier: FBAVVA003
slug: villa-najma-mogador
name: Villa Najma
dateCreated: 2026-06-10T00:00:00+00:00
dateModified: 2026-06-10T00:00:00+00:00
category: villa-golf
realEstateListing: bien-a-vendre
place: golf-mogador
offer:
  price: 11200000
  priceCurrency: MAD
  priceSpecification: À la vente
floorSize: 240
numberOfRooms: 8
numberOfBedrooms: 4
numberOfBathroomsTotal: 4
occupancy: 9
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
metaTitle: Villa Najma — Visite immersive | Mogador, Essaouira
metaDescription: Découvrez la Villa Najma, villa contemporaine ouverte sur le golf de Mogador, à travers un parcours immersif espace après espace.

# Parcours immersif horizontal — un bloc hasPart = un écran (cf. deriveScreens).
# additionalType → gabarit, headline avec **accent**, meta.reverse / meta.overlayMode.
hasPart:
  - additionalType: SCREEN_ACCOMMODATION_FULL
    position: 1
    name: Vue d'ensemble
    headline: Une architecture contemporaine **face au green**
    text: Lignes nettes, pierre claire et grandes ouvertures pour une villa résolument moderne, posée au cœur d'un domaine de golf.
    associatedMedia:
      - url: /poc/villa-najma-mogador/villa-najma-vue-ensemble-01.jpg
        caption: Façade contemporaine ouverte sur la pelouse

  - additionalType: SCREEN_ACCOMMODATION_SPLIT
    position: 2
    name: Les séjours
    headline: Un volume **traversant**
    text: Séjour et salle à manger réunis dans un même volume lumineux, ouvert de part en part sur le jardin.
    meta:
      reverse: true
    associatedMedia:
      - url: /poc/villa-najma-mogador/villa-najma-salon-01.jpg
        caption: Séjour et salle à manger en enfilade

  - additionalType: SCREEN_ACCOMMODATION_TRYPTIQUE
    position: 3
    name: Les extérieurs
    headline: Une piscine **à débordement**
    text: Piscine chauffée ouverte sur le plan d'eau et les fairways, terrasses ombragées et coins repas au grand air.
    associatedMedia:
      - url: /poc/villa-najma-mogador/villa-najma-exterieur-01.jpg
        caption: Jardin et piscine ouverts sur le plan d'eau
      - url: /poc/villa-najma-mogador/villa-najma-piscine-01.jpg
        caption: Piscine à débordement face au golf
      - url: /poc/villa-najma-mogador/villa-najma-terrasse-01.jpg
        caption: Terrasse repas ombragée sous parasol

  - additionalType: SCREEN_ACCOMMODATION_CAROUSEL
    position: 4
    name: Les chambres
    headline: Quatre chambres **avec salle d'eau**
    text: Quatre chambres aux teintes douces, chacune avec sa salle d'eau privative et sa vue sur le jardin.
    associatedMedia:
      - url: /poc/villa-najma-mogador/villa-najma-chambre-01.jpg
        caption: Chambre lumineuse ouverte sur le jardin
      - url: /poc/villa-najma-mogador/villa-najma-chambre-02.jpg
        caption: Chambre aux accents bleus

  - additionalType: SCREEN_ACCOMMODATION_OVERLAY
    position: 5
    name: Le salon TV
    headline: Un coin **cocooning**
    text: Un second salon avec cheminée et télévision, pensé pour les soirées au calme.
    meta:
      overlayMode: dark
    associatedMedia:
      - url: /poc/villa-najma-mogador/villa-najma-salon-02.jpg
        caption: Salon TV avec assises profondes

  - additionalType: SCREEN_ACCOMMODATION_SPLIT
    position: 6
    name: Le toit-terrasse
    headline: Le panorama, **plein ciel**
    text: Un toit-terrasse aménagé en lounge, ouvert sur le golf et l'arrière-pays jusqu'à l'horizon.
    associatedMedia:
      - url: /poc/villa-najma-mogador/villa-najma-terrasse-02.jpg
        caption: Toit-terrasse lounge avec vue panoramique

  - additionalType: SCREEN_ACCOMMODATION_DUO
    position: 7
    name: Les salles d'eau
    headline: Le bois et **l'eau claire**
    text: Travertin et bois clair composent des salles d'eau apaisantes, baignées de lumière naturelle.
    associatedMedia:
      - url: /poc/villa-najma-mogador/villa-najma-salle-de-bains-01.jpg
        caption: Douche à l'italienne et plan vasque en bois
      - url: /poc/villa-najma-mogador/villa-najma-salle-de-bains-02.jpg
        caption: Double vasque ouverte sur le jardin

  - additionalType: SCREEN_ACCOMMODATION_CONTACT
    position: 8
    name: Dernière étape
    headline: Intéressé ?
    text: "Vous venez de visiter la Villa Najma. Laissez-nous vos coordonnées pour organiser une visite privée."
    associatedMedia: []
---

## Villa Najma

Villa contemporaine au cœur du golf de Mogador, quatre chambres avec salle d'eau et piscine à débordement. Parcours immersif espace après espace, de la vue d'ensemble au contact.
