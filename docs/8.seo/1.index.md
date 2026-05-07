# SEO

- Role: documenter les conventions SEO transverses du projet.

Cette section couvre les metas, le multilingue, les donnees structurees, le sitemap, `robots.txt` et les checklists SEO.

## Conventions

- Le SEO local des pages est declare avec `useSeoMeta`.
- Le head global et les attributs `html` passent par `useHead` dans `app.vue`.
- L infrastructure SEO transverse repose sur les composables SEO du projet et des routes serveur locales.
- Le sitemap XML est genere par `@nuxtjs/sitemap` avec mapping i18n automatique active.
- `SITE_URL` et `SITE_NAME` alimentent les URLs absolues, les metas sociales et le JSON-LD.
- `APP_ENV` pilote l indexabilite globale sur les runtimes non-dev: `dev` produit `noindex, nofollow`, `prod` autorise l indexation.
- En production indexable, seule la page d accueil localisee peut sortir en `index, follow`; toutes les autres routes exposent `noindex, nofollow`.
- En mode `nuxt dev`, l indexation reste forcee a `noindex, nofollow` meme si `APP_ENV=prod`.
- `robots.txt` est servi par `server/routes/robots.txt.ts` et reste une regle globale de crawl; l exclusion des routes hors accueil repose sur la meta `robots` par page.
- Les donnees editoriales SEO des pages continuent de venir du contenu et des stores metadata.
