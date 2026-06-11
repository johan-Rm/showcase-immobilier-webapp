# Fixtures de démo — biens d'exception (parcours immersif)

Source de vérité **versionnée** des biens d'exemple **fictifs** créés pour la tâche
[033](../../tasks/033-villas-exemples-parcours-immersif.md).

## Pourquoi ce dossier

`content/*/accommodations/` est **gitignoré** et **purgé** par `make dev-content-sync`
(pull-only depuis l'API Symfony). Les fixtures de démo n'y survivraient pas. On les
versionne donc ici, et on les **repose** dans `content/fr/accommodations/` au besoin.

## Reposer les fixtures après un sync

```bash
cp dev-book/fixtures/accommodations/villa-*.md content/fr/accommodations/
```

Les images correspondantes vivent dans `public/poc/<slug>/` (suivies par Git, non purgées).

## Anonymisation

Données **fictives** : noms, références et textes réécrits, inspirés de listings réels
sans copie verbatim. Caractéristiques factuelles génériques uniquement (surfaces, nombre
de chambres, piscine, localisation régionale). Images : usage démo/POC interne.

## Fixtures

| Slug | `category` | Type | Localisation (fictive) |
| ---- | ---------- | ---- | ---------------------- |
| `villa-des-alizes` | `villa-golf` | villa de plain-pied (POC d'origine) | Essaouira |
| `villa-lumiere-mogador` | `villa-golf` | villa contemporaine de plain-pied | Mogador |
| `villa-najma-mogador` | `villa-golf` | villa contemporaine | Mogador |
| `villa-saadia-essaouira` | `villa-golf` | demeure d'inspiration marocaine | campagne (Ida Ougourd) |
| `villa-soleil-essaouira` | `villa-golf` | propriété de prestige (tennis, golf) | campagne d'Essaouira |
| `villa-dunes-essaouira` | `villa-golf` | villa de pierre épurée | campagne |
| `domaine-tilila-essaouira` | `domaine` | domaine contemporain (10 ch.) | campagne (zone rurale) |
| `maison-amani-essaouira` | `maison-de-campagne` | maison de campagne aux galeries d'arches | Ghazoua |
| `riad-assala-essaouira` | `riad` | riad d'exception (zelliges, spa) | Ounagha |
| `kasbah-tigmi-essaouira` | `kasbah` | kasbah de terre berbère | Had Draa |
| `dar-zahra-essaouira` | `dar` | demeure ocre aux patios fleuris | campagne d'Essaouira |

Tous en `realEstateListing: bien-a-vendre`. Route
`/properties/bien-a-vendre/<category>/<slug>` → activation de la fiche bien d'exception
(`isExceptionalProperty`, cf. `services/mapper/exceptional.ts`). La fiche se résout **par slug**,
indépendamment de la catégorie de route ; l'activation immersive ne dépend que du bloc `hasPart`.
