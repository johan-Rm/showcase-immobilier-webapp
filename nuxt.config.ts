import { join, resolve } from 'node:path'

import ViteYaml from '@modyfi/vite-plugin-yaml'

import { runSchemaHook } from './services/hooks/schema'
import { FALLBACK_LOCALE, AVAILABLES_LOCALES } from './shared/i18n/config'

const appEnv = process.env.APP_ENV?.trim().toLowerCase() === 'prod' ? 'prod' : 'dev'
const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase()
const isDevRuntime = nodeEnv !== 'production'
const nitroContentCacheMaxAge = isDevRuntime ? 0 : 300
const siteUrl = process.env.SITE_URL?.trim() || 'http://localhost:3000'

const nitroContentCacheHeaders =
  nitroContentCacheMaxAge > 0
    ? {
        'Cache-Control': `public, s-maxage=${nitroContentCacheMaxAge}, stale-while-revalidate=86400`,
      }
    : {}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: false },

  typescript: {
    strict: true,
  },

  ssr: true,

  css: ['~/assets/transitions.css', '~/assets/main.css'],

  app: {
    pageTransition: {
      name: 'zoom-in',
      mode: 'out-in',
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in',
    },
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  ui: {
    fonts: false,
    colorMode: true,
  },

  fonts: {
    providers: {
      fontsource: false,
    },
  },

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    resendFromEmail:
      process.env.RESEND_FROM_EMAIL ?? 'MLK - My Little Kasbah <contact@mlk-my-little-kasbah.immo>',
    contactToEmail: process.env.CONTACT_TO_EMAIL ?? 'contact@mlk-my-little-kasbah.immo',
    contactBccEmails: process.env.CONTACT_BCC_EMAILS ?? 'developer@graines-digitales.online',
    contactReplyToEmail: process.env.CONTACT_REPLY_TO_EMAIL ?? 'contact@mlk-my-little-kasbah.immo',
    contactSubmissionsPath:
      process.env.CONTACT_SUBMISSIONS_PATH ??
      join(process.cwd(), '.data', 'contact-submissions.csv'),

    public: {
      appEnv,
      siteName: process.env.SITE_NAME?.trim() || 'MLK My Little Kasbah',
      siteUrl,
      isIndexable: appEnv === 'prod' && !isDevRuntime,
      webVitalsEnabled: process.env.WEB_VITALS_ENABLED === 'true',
    },
  },

  sitemap: {
    // @ts-expect-error siteUrl is a valid but untyped option in this version
    siteUrl,
    autoLastmod: true,
    gzip: true,

    includeAppSources: true,

    sources: ['/api/__sitemap__/urls'],
  },

  routeRules: {
    ...(nitroContentCacheMaxAge > 0
      ? {
          '/themes.json': {
            swr: nitroContentCacheMaxAge,
            headers: nitroContentCacheHeaders,
          },
          '/themes.css': {
            swr: nitroContentCacheMaxAge,
            headers: nitroContentCacheHeaders,
          },
        }
      : {}),
  },

  alias: {
    '@schemas': resolve(__dirname, 'schemas'),
    '@services': resolve(__dirname, 'services'),
    '@utils': resolve(__dirname, 'app/utils'),
    '@locales': resolve(__dirname, 'i18n/locales'),
    '@content': resolve(__dirname, 'content'),
    ...(process.env.DIGITAL_ORCHESTRATION_CORE_PATH?.trim()
      ? {
          '@DigitalOrchestrationCore': resolve(process.env.DIGITAL_ORCHESTRATION_CORE_PATH.trim()),
        }
      : {}),
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxtjs/device',
    '@nuxtjs/mdc',
    '@vueuse/nuxt',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
  ],

  mdc: {
    headings: {
      anchorLinks: {
        h1: false,
        h2: false,
        h3: false,
        h4: false,
        h5: false,
        h6: false,
      },
    },
  },

  i18n: {
    defaultLocale: FALLBACK_LOCALE,
    locales: Object.values(AVAILABLES_LOCALES).map((locale) => ({
      code: locale.code,
      language: locale.iso,
      name: locale.name,
      file: resolve(__dirname, `content/${locale.code}/messages.ts`),
      dir: locale.dir,
    })),
    langDir: 'content',
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    pages: {
      'properties/[realEstateListing]/index': {
        fr: '/biens/[realEstateListing]',
        en: '/properties/[realEstateListing]',
        es: '/propiedades/[realEstateListing]',
      },
    },
  },

  hooks: {
    'build:before': runSchemaHook,
  },

  build: {
    analyze: {
      template: 'treemap',
      filename: '.nuxt/analyze/report.html',
    },
  },

  vite: {
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            if (id.includes('/vue-i18n/') || id.includes('/@intlify/')) {
              return 'vendor-i18n'
            }

            if (id.includes('/@vueuse/')) {
              return 'vendor-vueuse'
            }

            if (id.includes('/gsap/')) {
              return 'vendor-gsap'
            }

            if (id.includes('/embla-carousel')) {
              return 'vendor-embla'
            }
          },
        },
      },
    },
    plugins: [ViteYaml(), (await import('vite-svg-loader')).default()],
  },
})
