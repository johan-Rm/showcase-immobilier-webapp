---
status: Fait
dependances: [031, 032]
---

# 033 — Villas d'exemple avec parcours immersif (données fictives)

> **Pour les agents:** tâche de contenu/données, pas de code applicatif. À exécuter avec
> l'utilisateur (il fournit les liens source un par un).

**Goal:** Doter **chaque villa du projet** d'un parcours immersif (blocs `hasPart`) afin
d'activer la **fiche bien d'exception** (031). Créer des biens d'exemple **fictifs** inspirés
de listings réels, avec leurs images téléchargées, renommées et rangées.

**Important — anonymisation :** ce sont des **données fictives pour une démo**. Ne pas copier
les textes verbatim ni réutiliser les noms/identité réels :

- nom de villa **fictif** (pas « Villa Lucia ») ;
- référence interne fictive ;
- descriptions **réécrites** (pas de copier-coller du site source) ;
- conserver uniquement des caractéristiques factuelles génériques (surfaces, nb de chambres,
  piscine, localisation régionale Essaouira/Mogador) qui ne sont pas des données personnelles.

**Tech / emplacements :**

- Images → `public/poc/<slug>/` (mêmes conventions que `public/poc/villa-des-alizes/`).
- Contenu → `content/fr/accommodations/<slug>.md` (cf. modèle racine `villa-des-alizes.md`).
- Taxonomie : réutiliser `realEstateListing: bien-a-vendre` et `category: villa-golf` (route
  `/properties/bien-a-vendre/villa-golf/<slug>`) pour router et déclencher
  `isExceptionalProperty`.

---

## Sources à traiter

| # | Bien source (réel) | Infos | Photos | Slug fictif cible | État |
| - | ------------------ | ----- | ------ | ----------------- | ---- |
| 1 | Villa Lucia (Mogador Golf Club) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/mogador-golf-club/villa-lucia-mogador | …/villa-lucia-mogador/photos | `villa-lumiere-mogador` | ✅ |
| 2 | Villa Mamouna (Mogador Golf Club) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/mogador-golf-club/villa-mamouna | …/villa-mamouna/photos | `villa-najma-mogador` | ✅ |
| 3 | Villa Betty (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/villa-betty | …/villa-betty/photos | `villa-saadia-essaouira` | ✅ |
| 4 | Villa Sunny Baraka (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/villa-sunny-baraka | …/villa-sunny-baraka/photos | `villa-soleil-essaouira` | ✅ |
| 5 | Villa DL (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/villa-dl | …/villa-dl/photos | `villa-dunes-essaouira` | ✅ |
| 6 | Domaine Khali Jhiane (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/domaine-khali-jhiane | …/domaine-khali-jhiane/photos | `domaine-tilila-essaouira` | ✅ |
| 7 | Maison Illi (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/maison-illi | …/maison-illi/photos | `maison-amani-essaouira` | ✅ |
| 8 | Riad Dharma (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/riad-dharma | …/riad-dharma/photos | `riad-assala-essaouira` | ✅ |
| 9 | Kasbah Mamouna (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/kasbah-mamouna | …/kasbah-mamouna/photos | `kasbah-tigmi-essaouira` | ✅ |
| 10 | Dar El Salam (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/dar-el-salam | …/dar-el-salam/photos | `dar-zahra-essaouira` | ✅ |

> **Réalisé** — 10 biens d'exemple. Fixtures versionnées dans `dev-book/fixtures/accommodations/`
> (source de vérité, repostées dans `content/fr/accommodations/` car ce dossier est gitignoré et
> purgé par `make dev-content-sync`), images dans `public/poc/<slug>/`. Les routes
> `/properties/<realEstateListing>/<category>/<slug>` rendent le parcours immersif (HTTP 200,
> `data-screen`, images servies, `srcset` non vide). Cf. `dev-book/fixtures/accommodations/README.md`.
>
> Les biens 1→5 sont en `category: villa-golf` ; les biens 6→10 reprennent leur **type réel**
> (`domaine`, `maison-de-campagne`, `riad`, `kasbah`, `dar`) — la fiche d'exception se résout par
> slug, indépendamment de la catégorie de route, donc l'activation immersive ne dépend que de `hasPart`.

---

## Procédure par bien

### 1. Récupérer les infos

- [x] `WebFetch` sur la page infos → caractéristiques factuelles (surface habitable, surface
  terrain, chambres, salles de bains, pièces, capacité, piscine, localisation, équipements) et
  liste des **espaces** (vue d'ensemble, entrée, salons, cuisine, extérieur, chambres, eau/bien-être).
- [x] **Réécrire** des textes d'ambiance courts et originaux par espace (1 idée forte / écran).

### 2. Télécharger les images

- [x] ⚠️ La page `/photos` de villanovo est **rendue en JS** : un `curl` simple ne renvoie pas
  les URLs d'images (lazy-load / data-attributes). Prévoir : inspection des URLs réelles
  (DevTools réseau / `data-src` / JSON d'hydratation), ou rendu navigateur, puis téléchargement
  des fichiers (`curl`/`wget`).
- [x] Télécharger dans `public/poc/<slug>/`.
- [x] **Renommer proprement** : `<slug>-<espace>-NN.jpg` (ex. `villa-lumiere-salon-01.jpg`),
  cohérent avec `public/poc/villa-des-alizes/`.
- [x] Optimiser si besoin (poids raisonnable, format jpg/webp).

### 3. Créer le contenu avec parcours

- [x] `content/fr/accommodations/<slug>.md` : frontmatter (identifier fictif, slug, name fictif,
  category `villa-golf`, realEstateListing `bien-a-vendre`, place Essaouira, surfaces, nb pièces/
  chambres/sdb, offer fictive) **+** bloc `hasPart` selon le modèle `villa-des-alizes.md` :
  - alterner les templates `SCREEN_ACCOMMODATION_{FULL,SPLIT,TRYPTIQUE,CAROUSEL,OVERLAY,DUO}`
    pour créer du rythme ;
  - `position`, `name` (désignation), `headline` (avec `**accent**`), `text`, `associatedMedia`
    (`url` vers `/poc/<slug>/...`), `meta` (`reverse`/`overlayMode`) si pertinent ;
  - un bloc final `SCREEN_ACCOMMODATION_CONTACT` (auto-rendu).
- [ ] (Optionnel) versions `en`/`es` si le multilingue est requis pour la démo. _(non fait — fr uniquement)_

### 4. Vérifier

- [x] La fiche `/properties/bien-a-vendre/villa-golf/<slug>` affiche le parcours immersif (031).
- [x] Images résolues (pas d'image blanche : éviter `sizes` `xs:` seul), parcours fluide.

---

## Points de vigilance

- **Anonymisation systématique** (nom, référence, textes) — données fictives de démo.
- **Droits images** : usage démo/POC interne ; ne pas publier tel quel sans vérifier les droits.
- `content/*/accommodations/` est **purgé par content-sync** : ces fixtures de démo sont des
  artefacts locaux (comme `villa-des-alizes`), à reposer après un sync ou à gérer hors pull API.
- Réutiliser la convention d'images et de structure de `villa-des-alizes` pour rester cohérent.

## Hors périmètre

- Saisie via le dashboard (couvert par 032) — ici on crée directement les fixtures de contenu.
- Persistance API Symfony des parcours (tranche 2 de 032).
