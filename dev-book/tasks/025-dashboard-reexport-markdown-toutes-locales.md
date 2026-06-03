---
status: A faire
dependances:
  - 009-dashboard-reexport-markdown-apres-sauvegarde.md
  - 013-traduction-automatique-biens.md
---

# 025 Dashboard — Re-export Markdown pour toutes les locales disponibles

## Intention

La task 009 ecrit uniquement le fichier `content/fr/accommodations/*.md` apres un Save
dashboard. Depuis la task 013, le payload de sauvegarde contient un tableau `translations[]`
avec les champs localises pour toutes les locales (FR, EN, ES).

L objectif est d etendre `exportToMarkdown` pour ecrire un fichier Markdown par locale
presente dans `translations[]`, en reconstituant un frontmatter coherent pour chaque locale.

Le site public lit `content/{locale}/accommodations/*.md`. Toutes les locales doivent
rester synchronisees apres chaque Save dashboard.

## Perimetre

- apres un Save Symfony reussi, ecrire un fichier `.md` par locale disponible dans
  `translations[]` : `content/fr/`, `content/en/`, `content/es/`
- pour chaque locale, fusionner les champs globaux (frontmatter commun) avec les champs
  localises issus de la traduction correspondante
- utiliser le `slug` de la traduction comme nom de fichier si disponible, sinon fallback
  sur l `identifier`
- ne pas modifier les biens dont `additionalProperty.dataSource = fixture`
- si une locale ne contient que des champs vides ou absents, ne pas ecrire le fichier
  pour cette locale (eviter des fichiers vides ou inutilisables)

## Hors perimetre

- commit Git automatique apres write
- invalidation du cache Nuxt Content
- creation ou suppression de fichiers pour des locales inconnues
- traduction automatique des champs manquants (responsabilite de l API Symfony — task 013)

## Champs localises (par locale)

Definis dans `DASHBOARD_LOCALIZED_ACCOMMODATION_FIELDS` :

- `slug`
- `name`
- `label`
- `highlight`
- `body`
- `review`
- `metaTitle`
- `metaDescription`

Les autres champs du frontmatter (category, realEstateListing, place, offer, surfaces,
image[], additionalProperty, etc.) sont globaux et identiques dans tous les fichiers.

## Architecture

### Flux etendu

```
Save click
  └─ Nitro PUT /api/dashboard/accommodations/[identifier]
       ├─ ...
       ├─ 5. PUT/POST Symfony → reponse confirmee
       ├─ 6. exportAllLocales(accommodation)              ← TASK 025
       │       ├─ pour chaque locale dans translations[]
       │       │     ├─ fusionner frontmatter global + champs localises
       │       │     └─ writeFile content/{locale}/accommodations/{slug}.md
       └─ 7. retourne { success, markdownResults, data, error }
```

### Signature cible (server/utils/dashboard/markdownExporter.ts)

```ts
export type LocaleMarkdownResult =
  | { locale: string; updated: true; filePath: string }
  | { locale: string; updated: false; reason: string }

export async function exportAllLocales(
  accommodation: DashboardAccommodationSavePayload,
): Promise<LocaleMarkdownResult[]>
```

- `exportToMarkdown` existante peut rester pour la locale principale (retrocompatibilite)
- `exportAllLocales` itere sur `translations[]`, fusionne frontmatter + champs localises,
  appelle une fonction interne `writeLocaleFile(locale, frontmatter, body, filePath)`

### Fusion frontmatter par locale

Pour chaque `translation` dans `translations[]` :

1. copier le frontmatter global (`accommodation.frontmatter`) — champs non localises
2. ecraser les champs localises avec les valeurs de la traduction (`name`, `slug`, etc.)
3. utiliser `translation.body` comme body Markdown si present, sinon `accommodation.body`
4. deriver le `fileName` depuis `translation.slug` si non vide, sinon depuis `accommodation.fileName`

### Gestion des locales vides

Ne pas ecrire le fichier si :

- la traduction n a aucun champ non vide (tous `null`, `undefined` ou `""`)
- le `slug` est absent et l `identifier` ne permet pas de deriver un nom de fichier valide

Retourner `{ locale, updated: false, reason: 'empty_translation_skipped' }`.

### Retour route Nitro

```ts
{
  success: true,
  uuid: string,
  markdownResults: LocaleMarkdownResult[],
  data: SymfonyAccommodationResponse
}
```

`markdownUpdated: boolean` (task 009) est remplace par `markdownResults[]`.
Adapter `useDashboardSave` en consequence.

### Gestion des erreurs

- une erreur d ecriture sur une locale n empeche pas les autres locales d etre ecrites
- logguer chaque echec cote serveur avec la locale concernee
- retourner `{ locale, updated: false, reason: 'write_error' }` pour la locale en echec
- ne jamais bloquer la reponse HTTP pour un echec d ecriture fichier

## Etapes

- [ ] Etudier `markdownExporter.ts` et `[identifier].put.ts` pour comprendre l etat actuel.
- [ ] Definir le type `LocaleMarkdownResult` dans `markdownExporter.ts`.
- [ ] Implementer `exportAllLocales(accommodation)` :
  - iterer sur `translations[]`
  - fusionner frontmatter global + champs localises
  - ecrire chaque fichier via `writeLocaleFile`
- [ ] Adapter la route Nitro `PUT /api/dashboard/accommodations/[identifier]` :
  - remplacer `exportToMarkdown` par `exportAllLocales`
  - adapter le retour (`markdownResults` au lieu de `markdownUpdated`)
- [ ] Adapter `useDashboardSave` pour consommer `markdownResults[]`.
- [ ] Ajouter des tests unitaires sur `exportAllLocales` (fusion frontmatter, locale vide, fixture).
- [ ] Valider que les fichiers EN et ES generes sont parseables par Nuxt Content.
- [ ] Valider `make quality:check`.

## Criteres d acceptation

- apres un Save dashboard avec translations[] renseignees, les fichiers `.md` FR, EN et ES
  sont mis a jour dans `content/{locale}/accommodations/`
- les champs globaux sont identiques dans les trois fichiers
- les champs localises (`name`, `slug`, `body`, etc.) varient selon la locale
- une locale avec traduction vide ne produit pas de fichier vide ou corrompu
- les biens fixtures ne sont jamais touches
- si l ecriture d une locale echoue, les autres locales sont quand meme ecrites

## Points de vigilance

- **fileName par locale** : le slug EN/ES peut differer du slug FR — deriver le nom de
  fichier depuis `translation.slug` et non depuis `accommodation.fileName`.
- **Champs absents** : si un champ localise est `null` ou absent dans la traduction,
  ne pas l inclure dans le frontmatter (eviter les `null` explicites en YAML).
- **Body** : le body Markdown peut etre vide pour EN/ES en V1 — l ecrire quand meme si
  la traduction est non vide (Nuxt Content tolere un body vide).
- **Retrocompatibilite** : `exportToMarkdown` peut rester appelee pour la locale principale
  si `translations[]` est absent du payload (anciens saves mono-locale).
