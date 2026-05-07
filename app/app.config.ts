export default defineAppConfig({
  global: {},
  organization: {
    acronym: 'MLK',
    fullName: 'MLK - My Little Kasbah',
    alternateName: 'MLK - My Little Kasbah',
    location: 'Essaouira',
    image: '/images/mlk-logo.jpg',
    email: 'contact@mlk-my-little-kasbah.immo',
    phoneNumbers: ['+33 (0)7 67 235 008', '+212 (0)7 26 403 203'],
    description:
      'MLK – My Little Kasbah accompagne vos projets immobiliers à Essaouira investissement, achat, vente et gestion locative avec une expertise locale et internationale.',
  },
  menu: {
    mainMenuCenterImageUrl: '/images/essaouira-navigation-hero.jpg',
    primaryMenuItems: ['for-sale', 'seasonal-rental', 'long-term-rental'],
    secondaryMenuItems: ['agency', 'home-staging', 'rental-management', 'investing', 'contact'],
    otherItems: ['essaouira-the-jewel'],
    accommodationTypes: [
      'apartment',
      'riad',
      'guest-house',
      'golf-villa',
      'country-house',
      'town-house',
      'land',
      'commercial-business',
      'lease-management',
      'commercial-property',
      'dar',
      'guest-room',
    ],
    services: ['home-staging', 'rental-management', 'investing'],
    meta: ['agency', 'fees', 'legal-notice'],
  },
  ui: {
    primary: 'primary',
    gray: 'surface',
    colors: {
      primary: 'primary',
      secondary: 'secondary',
      danger: 'danger',
    },
    button: {
      default: {
        color: 'primary',
        variant: 'solid',
        size: 'md',
      },
      variants: {
        solid: 'solid',
        outline: 'outline',
        ghost: 'ghost',
      },
      color: {
        primary: 'primary',
        secondary: 'secondary',
        danger: 'danger',
      },
    },
  },
})
