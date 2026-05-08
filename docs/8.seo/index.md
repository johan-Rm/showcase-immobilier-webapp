# SEO

- Role: documenter les conventions SEO transverses du projet.

Cette section couvre l'architecture du système SEO, les métadonnées, les données structurées JSON-LD, le sitemap et le multilingue.

## Sous-sections

- [1. Architecture SEO](1.architecture.md) — rôles de `usePageSeo` et `services/seo/schema.ts`, flux de données
- [2. Métadonnées et balises sociales](2.meta-et-social.md) — title, canonical, Open Graph, Twitter Card, indexation
- [3. Données structurées JSON-LD](3.donnees-structurees.md) — graphe Schema.org, nœuds, conventions `@id`
- [4. Sitemap et multilingue](4.sitemap-multilingue.md) — `@nuxtjs/sitemap`, hreflang, robots.txt

## Principes transverses

- Toute métadonnée dynamique passe par `usePageSeo()` — jamais directement dans une page.
- Les transformations SEO pures vivent dans `services/seo/schema.ts`, jamais dans le composable.
- `SITE_URL` et `SITE_NAME` sont les seules sources d'URLs absolues et de noms de site.
- `APP_ENV=prod` + runtime de production est la seule combinaison qui active l'indexation.
- En mode `nuxt dev`, l'indexation reste forcée à `noindex, nofollow` même si `APP_ENV=prod`.
