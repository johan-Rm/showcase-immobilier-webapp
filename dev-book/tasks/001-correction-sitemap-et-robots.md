---
status: Todo
spec: 023-socle-seo-complet-par-page
---

# 001 Correction sitemap et robots.txt

## Intention

Corriger les lacunes du sitemap XML et du fichier `robots.txt` identifiées lors de l'audit SEO,
afin que le crawl des moteurs soit complet, multilingue et sans dépendance fragile à l'environnement local.

## Périmètre

- corriger l'URL hardcodée `localhost:3000` dans le handler sitemap
- générer les entrées sitemap pour tous les locales actifs
- ajouter les pages de listing et de catégorie dans les URLs custom
- créer la route `server/routes/robots.txt.ts` avec règles conditionnelles selon `APP_ENV`

## Hors périmètre

- modification du contenu éditorial ou des routes applicatives
- enrichissement Schema.org (couvert par la spec 024)

## Étapes

### 1. Corriger l'URL interne dans `server/api/__sitemap__/urls.get.ts`

Remplacer les appels `$fetch('http://localhost:3000/api/...')` par des appels internes Nitro
sans hôte : `$fetch('/api/...')`.

En contexte SSR Nitro, un appel sans hôte est résolu localement sans dépendance réseau.

### 2. Générer les URLs pour tous les locales

Pour chaque URL produite, dupliquer l'entrée pour chaque locale actif déclaré dans `AVAILABLES_LOCALES`,
en appliquant le bon préfixe de locale et le chemin localisé si le segment est traduit.

Exemple attendu pour une fiche bien :

```ts
[
  { loc: '/fr/biens/domaine/categorie/slug', ... },
  { loc: '/en/properties/domaine/categorie/slug', ... },
  { loc: '/es/propiedades/domaine/categorie/slug', ... },
]
```

### 3. Ajouter les pages de listing et de catégorie

Les pages intermédiaires ne sont pas couvertes par le handler custom.
Les ajouter en itérant sur les données disponibles :

- `/[locale]/[listing-path]/[realEstateListing]` pour chaque domaine actif
- `/[locale]/[listing-path]/[realEstateListing]/[category]` pour chaque catégorie active

### 4. Créer `server/routes/robots.txt.ts`

Produire un `robots.txt` conditionnel selon `APP_ENV` :

- `APP_ENV=prod` + runtime production → `Allow: /` + `Sitemap: {siteUrl}/sitemap.xml`
- tout autre contexte → `Disallow: /`

La meta `robots` par page reste le mécanisme de contrôle fin ; `robots.txt` est la règle globale de crawl.

## Critères d'acceptation

- aucune référence à `localhost` dans le handler sitemap
- le sitemap contient des entrées pour les locales `fr`, `en` et `es`
- les pages de listing et de catégorie apparaissent dans le sitemap
- `robots.txt` est servi dynamiquement et bloque le crawl hors prod
- les URLs du sitemap sont valides et accessibles en environnement de développement
