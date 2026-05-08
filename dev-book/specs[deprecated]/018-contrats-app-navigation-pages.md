# Spec : Normalisation des contrats app, navigation et pages editoriales

## Metadonnees

- ID : SPEC-018
- Statut : En cours
- Objectif principal : aligner les contrats applicatifs, la navigation globale, les pages editoriales et les contenus localises sur un modele plus stable, plus explicite et plus facilement typable

---

## Description rapide

Le projet a converge vers un chantier transverse qui depasse une simple refonte de page.
Le diff courant montre une normalisation simultanee de plusieurs couches :

- le contrat `App` et ses usages frontend
- les menus et la navigation globale
- le mapping des contenus `WebPage` et `Accommodation`
- les slugs editoriaux partages entre locales
- la generation des artefacts de schemas et DTO
- la documentation d architecture et de conventions frontend

L enjeu principal est de reduire les conventions implicites, de stabiliser les contrats entre contenu, services, stores et UI, et de simplifier les points d entree des pages `home` et `contact`.

---

## Probleme ou besoin observe

Avant ce chantier, plusieurs fragilites coexistaient :

- la navigation melangeait configuration applicative, contenu et conventions de menus
- certains contrats utilisaient encore des champs heterogenes (`label` / `to`, slugs localises, references image incompletes)
- les pages editoriales embarquaient des logiques de resolution trop proches du contenu
- la distinction entre interfaces de schemas et DTO n etait pas clairement formalisee dans le hook de generation
- la documentation ne decrivait pas encore correctement l etat reel du systeme

Ces ecarts compliquaient :

- le typage strict
- la lisibilite des mappings
- la maintenance du contenu multi-langue
- la stabilite SSR et la comprehension du flux de donnees

---

## Perimetre

Dans le scope de cette spec :

- normaliser le contrat `schemas/app.ts`
- deplacer la structure des menus techniques vers `app/app.config.ts`
- conserver dans `content/*/app.yaml` les donnees editoriales et localisees
- unifier la forme des items de navigation autour de `name` et `url`
- introduire un composable `useApp()` pour acceder au contrat `app`
- simplifier `useAppNavigation`, `useAppFooter`, `useWebPage` et leurs consommateurs
- faire converger `home` et `contact` vers des slugs stables entre locales
- enrichir les mappings `WebPage` et `Accommodation` avec des contrats plus explicites
- generer a la fois des `interfaces` et des `dtos` depuis le hook de schemas
- mettre a jour la documentation d architecture, de specs et de dossier impactee

Hors scope :

- refonte visuelle globale des pages
- ajout de nouvelles routes produit hors besoin du diff courant
- changement du mode de chargement principal des contenus
- internationalisation exhaustive de tous les contenus non touches par ce chantier

---

## Contraintes

- rester SSR-safe par defaut
- ne pas reintroduire de logique metier dans les composants d affichage
- garder une separation nette entre config applicative, contenu editorial et mapping de donnees
- conserver un typage strict sans `any`
- eviter les slugs speciaux dependants de la locale pour `home` et `contact`
- traiter les artefacts `schemas/interfaces` et `schemas/dtos` comme des sorties generees
- maintenir une documentation alignee sur l implementation reelle

---

## Criteres d acceptation

- le contrat `App` expose une navigation coherente avec des items bases sur `name` et `url`
- la definition des groupes de menu globaux est centralisee dans `app/app.config.ts`
- `content/*/app.yaml` ne porte plus la structure technique complete des menus globaux mais uniquement les donnees editoriales localisees utiles
- `useApp()` fournit un point d acces reactif unique a la donnee `app`
- `useAppNavigation()` resolve les groupes de menus a partir de `app.config` et des donnees chargees
- `useWebPage()` expose des helpers de resolution de composants de page par `identifier`
- `app/pages/index.vue` ne reimplemente plus la recherche des blocs `hasPart`
- `app/pages/contact.vue` repose sur un slug stable `contact`
- les pages d accueil localisees convergent vers un slug stable `home`
- `services/mapper/webPage.ts` mappe les DTO vers des `WebPage` homogenes avec medias, categories et liens resolus
- `services/mapper/accommodation.ts` retourne des objets media et categories normalises au lieu de valeurs heterogenes
- `services/hooks/schema.ts` genere les artefacts d interfaces et de DTO depuis des dossiers resolus explicitement
- la documentation de `docs/2.architecture/`, `schemas/README.md`, `README.md` et des specs impactees reflete l etat reel du systeme

---

## Plan d execution utile

1. stabiliser les contrats sources :
   - mettre a jour `schemas/app.ts`
   - ajouter les guards utilitaires necessaires
   - adapter les resolvers de chemins de schemas et DTO

2. aligner la generation et le mapping de donnees :
   - faire evoluer `generateArtifacts`
   - mettre a jour `runSchemaHook`
   - adapter les mappers `webPage` et `accommodation`

3. recentrer les entry points frontend :
   - introduire `useApp()`
   - simplifier `useAppNavigation`, `useAppFooter`, `useMetadata`, `useWebPage`
   - mettre a jour les pages `index` et `contact`

4. aligner le contenu et la documentation :
   - normaliser les fichiers `content/*/app.yaml`
   - faire converger les slugs `home` et `contact`
   - documenter le standard `script setup`
   - mettre a jour les documents d architecture et de gouvernance touches

---

## Points de vigilance

- coherence entre `app/app.config.ts` et `content/*/app.yaml`
- absence de regression SEO lors du renommage des slugs editoriaux
- compatibilite des mappings avec des contenus partiellement renseignes
- distinction claire entre interfaces generees, DTO et contrats applicatifs manuels
- risque de fichiers documentaires brouillons ou temporaires a exclure du commit final si non normatifs
