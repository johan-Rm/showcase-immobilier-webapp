# CLAUDE — Contexte projet : blueprint-immobilier

Fichier de gouvernance local. Complète le socle global `~/.agents/.claude/CLAUDE.md` sans le
répéter. Les profils, principes et skills sont définis dans le global.

## Projet

Webapp immobilière éditoriale pour Essaouira et sa région. Interface calme, crédible,
orientée exploration puis contact. SEO-first, SSR, mobile-first, Core Web Vitals prioritaires.

## Stack

- Framework : Nuxt 4, Vue 3, TypeScript strict
- UI : Nuxt UI v4, Tailwind CSS
- Contenu : Nuxt Content (Markdown + YAML)
- État : Pinia
- Internationalisation : @nuxtjs/i18n
- Images : @nuxt/image
- Runtime : Bun
- Lint/format : ESLint (config flat), Prettier

## Architecture — lecture obligatoire avant d'agir

`docs/2.architecture/` est la source de vérité. 13 standards à lire selon le périmètre :

1. `1.application-architecture.md` — couches et responsabilités
2. `2.data-flow.md` — chemin des données source → rendu
3. `3.page-layout-screen-model.md` — modèle de composition des routes
4. `4.ssr-safety.md` — garde-fous serveur/client
5. `5.responsibility-boundaries.md` — frontières entre couches
6. `6.script-setup-standard.md` — structure attendue des SFC
7. `7.auto-imports-and-aliases.md` — imports automatiques et alias
8. `8.composables-standard.md` — conventions composables
9. `9.types-placement.md` — placement des types TypeScript
10. `10.services-standard.md` — organisation de `services/`
11. `11.stores-standard.md` — conventions Pinia
12. `12.content-model.md` — organisation de `content/`
13. `13.routing-and-middleware.md` — routes, middlewares, navigation

## Frontières de responsabilité

```
app/pages/        orchestre la route, le contexte, les meta
app/components/   affichage et composition visuelle uniquement
app/composables/  passerelle reactive UI / logique applicative
app/stores/       état global partagé (Pinia)
services/         logique métier pure — framework-agnostic
server/           routes et traitements Nitro (BFF + auth + sitemap)
shared/           utilitaires et contrats partageables
schemas/          contrats de types et artefacts de build
content/          contenu Markdown + YAML (source éditoriale)
```

## Détail services/ (framework-agnostic, zéro import Vue/Nuxt/Pinia)

```
services/api/             appels clients vers l'API Symfony (echo)
services/content/         utilitaires MDC / Nuxt Content
services/converter/schema génération d'artefacts TypeScript depuis les schémas YAML
services/infra/resolver/  résolution de chemins pour les schémas
services/mapper/          mapping API → types UI (accommodation, webPage)
services/seo/             génération de données structurées Schema.org
services/utils/           utilitaires CLI et système de fichiers
```

## Détail server/ (Nitro — BFF entre le frontend et l'API Symfony)

```
server/api/__sitemap__/   génération dynamique du sitemap
server/api/content/       proxy Nuxt Content (route catch-all)
server/api/dashboard/     routes BFF backoffice → API Symfony
  accommodations.get      liste des biens
  accommodations/[id].put mise à jour d'un bien
  category-codes.post     création de code catégorie
  media/upload.post       upload de média via Symfony
  symfony-status.get      ping statut API Symfony
server/api/contact.post   formulaire de contact
server/routes/auth/       OAuth Google (login dashboard)
server/routes/robots.txt  robots.txt dynamique
server/routes/themes.*    thème CSS/JSON dynamique
server/utils/auth/        liste des emails autorisés (dashboard)
server/utils/content/     loaders Nuxt Content
server/utils/dashboard/   mappers, auth Symfony, cache, export Markdown
```

## Pages et routing

```
index.vue                                              homepage (screens plein viewport)
contact.vue                                            formulaire de contact
[...page].vue                                          catch-all contenu Nuxt Content
properties/[realEstateListing]/index.vue               liste par type d'annonce
properties/[realEstateListing]/[category]/index.vue    liste par catégorie
properties/[realEstateListing]/[category]/[slug].vue   fiche de bien
dashboard/login.vue                                    login OAuth Google
dashboard/index.vue                                    backoffice (liste + édition biens)
echo.vue                                               debug/echo
```

## Modèle de navigation

Les pages pilotent une navigation par **screens plein viewport** (`data-screen`, ancres,
transitions x ou y). Ce n'est pas un routing classique — lire `3.page-layout-screen-model.md`
avant toute modification de page ou de layout.

## Commandes courantes

Toutes les commandes passent par `make`. Consulter le `Makefile` pour la liste complète.

## Workflow de développement

1. spec dans `dev-book/` (si feature structurante)
2. tâche dans `dev-book/tasks/`
3. branche dédiée depuis `develop`
4. PR vers `develop`

## Points de vigilance spécifiques

- hydratation serveur/client — toujours vérifier SSR safety
- `services/` ne doit jamais importer depuis Vue, Nuxt ou Pinia
- Nuxt UI couvre la majorité des composants UI — vérifier avant d'écrire du HTML brut
- les images passent par `@nuxt/image` — pas de `<img>` natif sans justification
- i18n actif — tout texte visible passe par les clés de traduction
