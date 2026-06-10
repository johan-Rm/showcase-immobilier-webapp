---
status: À faire
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

| # | Bien source (réel) | Infos | Photos | Slug fictif cible |
| - | ------------------ | ----- | ------ | ----------------- |
| 1 | Villa Lucia (Mogador Golf Club) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/mogador-golf-club/villa-lucia-mogador | …/villa-lucia-mogador/photos | _à définir (ex. villa-lumiere-mogador)_ |
| 2 | Villa Mamouna (Mogador Golf Club) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/mogador-golf-club/villa-mamouna | …/villa-mamouna/photos | _à définir (ex. villa-najma-mogador)_ |
| 3 | Villa Betty (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/villa-betty | …/villa-betty/photos | _à définir (ex. villa-saadia-essaouira)_ |
| 4 | Villa Sunny Baraka (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/villa-sunny-baraka | …/villa-sunny-baraka/photos | _à définir (ex. villa-soleil-essaouira)_ |
| 5 | Villa DL (en dehors d'Essaouira) | https://www.villanovo.fr/location-villas/afrique/maroc/essaouira/en-dehors-dessaouira/villa-dl | …/villa-dl/photos | _à définir (ex. villa-dunes-essaouira)_ |
| … | _liens suivants fournis par l'utilisateur_ | | | |

---

## Procédure par bien

### 1. Récupérer les infos

- [ ] `WebFetch` sur la page infos → caractéristiques factuelles (surface habitable, surface
  terrain, chambres, salles de bains, pièces, capacité, piscine, localisation, équipements) et
  liste des **espaces** (vue d'ensemble, entrée, salons, cuisine, extérieur, chambres, eau/bien-être).
- [ ] **Réécrire** des textes d'ambiance courts et originaux par espace (1 idée forte / écran).

### 2. Télécharger les images

- [ ] ⚠️ La page `/photos` de villanovo est **rendue en JS** : un `curl` simple ne renvoie pas
  les URLs d'images (lazy-load / data-attributes). Prévoir : inspection des URLs réelles
  (DevTools réseau / `data-src` / JSON d'hydratation), ou rendu navigateur, puis téléchargement
  des fichiers (`curl`/`wget`).
- [ ] Télécharger dans `public/poc/<slug>/`.
- [ ] **Renommer proprement** : `<slug>-<espace>-NN.jpg` (ex. `villa-lumiere-salon-01.jpg`),
  cohérent avec `public/poc/villa-des-alizes/`.
- [ ] Optimiser si besoin (poids raisonnable, format jpg/webp).

### 3. Créer le contenu avec parcours

- [ ] `content/fr/accommodations/<slug>.md` : frontmatter (identifier fictif, slug, name fictif,
  category `villa-golf`, realEstateListing `bien-a-vendre`, place Essaouira, surfaces, nb pièces/
  chambres/sdb, offer fictive) **+** bloc `hasPart` selon le modèle `villa-des-alizes.md` :
  - alterner les templates `SCREEN_ACCOMMODATION_{FULL,SPLIT,TRYPTIQUE,CAROUSEL,OVERLAY,DUO}`
    pour créer du rythme ;
  - `position`, `name` (désignation), `headline` (avec `**accent**`), `text`, `associatedMedia`
    (`url` vers `/poc/<slug>/...`), `meta` (`reverse`/`overlayMode`) si pertinent ;
  - un bloc final `SCREEN_ACCOMMODATION_CONTACT` (auto-rendu).
- [ ] (Optionnel) versions `en`/`es` si le multilingue est requis pour la démo.

### 4. Vérifier

- [ ] La fiche `/properties/bien-a-vendre/villa-golf/<slug>` affiche le parcours immersif (031).
- [ ] Images résolues (pas d'image blanche : éviter `sizes` `xs:` seul), parcours fluide.

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
