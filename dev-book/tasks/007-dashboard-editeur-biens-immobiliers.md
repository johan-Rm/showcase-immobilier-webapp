---
status: In Progress
source: brief dashboard editeur de biens
---

# 007 Dashboard editeur de biens immobiliers

## Intention

Construire une premiere experience dashboard pour consulter et preparer l edition des biens
immobiliers existants, sans CRUD classique et sans sauvegarde serveur en V1.

Le dashboard doit reprendre l experience immersive du site public : l utilisateur arrive sur un
bien en plein ecran, navigue entre les biens avec les filtres existants, puis ouvre une couche
d edition via un bouton flottant `Edit`.

Cette V1 sert a valider l UX, le modele de formulaire et le futur contrat de donnees avant le
branchement sur le CMS SaaS multi-client / multi-projet base sur Symfony 8 et API Platform.

## Perimetre

- lire les biens depuis `content/fr/accommodations/*.md`
- exposer les donnees via une API interne Nuxt read-only reservee au dashboard
- afficher le dashboard en plein ecran avec une experience proche des screens publics de biens
- reutiliser les briques visuelles existantes lorsque leur couplage le permet
- conserver les filtres de navigation immobiliere existants
- ajouter une recherche rapide par `identifier`
- ajouter un bouton flottant `Edit` en bas a gauche
- ouvrir un slideover d edition a gauche
- organiser le slideover avec :
  - tabs `Contenu` / `Media` a gauche
  - switcher langue `FR` / `EN` / `ES` a droite
  - formulaire d edition des champs front matter
  - placeholder propre pour l edition du body via le futur module Nuxt Tiptap editor
- rendre editable en UI l ensemble des champs connus, metadonnees comprises
- preparer un payload local compatible avec une future API d ecriture

## Hors perimetre

- sauvegarde des modifications
- upload de medias
- suppression ou creation reelle de fichiers Markdown
- persistance de brouillon local
- notion de dernier bien edite
- integration Symfony 8 / API Platform
- generation automatique de traductions
- gestion multi-client ou multi-projet
- roles avances au-dela de l acces dashboard deja protege par Google

## Contraintes produit et techniques

- le dashboard n est pas un backoffice CRUD classique
- l experience principale reste la preview immobiliere plein ecran
- le site public ne doit pas etre modifie ou regresse par l implementation dashboard
- les composants publics peuvent etre reutilises uniquement si cela ne les rend pas dependants du dashboard
- si `PropertyList.vue` est trop couple au parcours public, creer une orchestration dashboard dediee
- la lecture des Markdown reste read-only
- aucun secret, token ou contenu prive ne doit etre expose dans le client
- l UI doit rester SSR-safe
- l absence de sauvegarde doit etre claire dans l interface sans creer de faux parcours

## UX cible

### Entree dashboard

- `/fr/dashboard` affiche directement un bien en plein ecran
- pas de tableau ni liste CRUD en premiere vue
- selection initiale simple :
  - premier bien disponible dans la liste normalisee
  - ou premier bien actif si le tri le permet sans complexite

### Navigation biens

- navigation immersive similaire au site public
- filtres de type d offre et categorie conserves
- fleches / gestures conserves lorsque possible
- quick search par `identifier` pour atteindre rapidement une fiche precise
- la recherche ne remplace pas les filtres, elle sert d acces rapide

### Edition

- bouton flottant `Edit` en bas a gauche, inspire de Nuxt Studio
- le bouton ouvre un slideover gauche
- le slideover ne doit pas masquer definitivement la preview : l utilisateur edite en contexte
- fermeture simple par bouton ou touche echap si le composant le permet

### Slideover

Top bar :

- a gauche : tabs `Contenu` / `Media`
- a droite : switcher langue `FR` / `EN` / `ES`

Zone `Contenu` :

- champs principaux du front matter
- champs offre / prix / devise
- champs surface, chambres, salles de bain, capacite, garage
- champs SEO
- champs editoriaux enrichis (`highlight`, `review`, `blockquote`, `locationDescription`, etc.)
- champs techniques utiles (`identifier`, `slug`, `isActive`, `dateCreated`, `dateModified`)
- body Markdown editable via Tiptap (WYSIWYG, lecture/ecriture Markdown)

Zone `Media` :

- liste des references `image` / `associatedMedia`
- captions editables en UI
- keywords editables en UI
- `representativeOfPage` editable en UI
- aucun upload
- aucune suppression physique de media

Langues :

- l UI anticipe `FR`, `EN`, `ES`
- la V1 peut initialiser les tabs avec les donnees FR lorsque les traductions ne sont pas
  disponibles
- le futur comportement sera : traduction automatique si la traduction cible est vide ou si la
  fiche est nouvelle
- aucune traduction automatique n est implementee dans cette task

## Architecture proposee

### API interne read-only

Creer une couche serveur dediee au dashboard :

- `server/api/dashboard/accommodations.get.ts`
- `server/api/dashboard/accommodations/[slug].get.ts`

Responsabilites :

- lire les fichiers Markdown
- parser le front matter et le body
- retourner des DTO dashboard normalises
- ne jamais ecrire sur disque
- proteger l acces via la session dashboard

### Couche service front

Creer une couche service/composable dediee au dashboard, par exemple :

- `app/services/dashboard/accommodations`
- ou `app/composables/dashboard/useDashboardAccommodations.ts`

Responsabilites :

- charger la liste read-only
- charger le detail d un bien si necessaire
- exposer un etat UI-ready
- isoler le futur remplacement par API Platform

### Composants dashboard

Prevoir des composants dedies, par exemple :

- `DashboardPropertyWorkspace`
- `DashboardPropertyEditButton`
- `DashboardPropertyEditorSlideover`
- `DashboardPropertyContentForm`
- `DashboardPropertyMediaForm`
- `DashboardPropertyLanguageSwitcher`
- `DashboardPropertyQuickSearch`

Les noms exacts peuvent suivre les conventions locales au moment de l implementation.

## Evolutions apportees en cours d implementation

### Sidebar droite : `DashboardPropertySidebar`

Le brief initial ne separait pas explicitement la sidebar du workspace. En implementation,
la sidebar droite a ete extraite dans un composant dedie `DashboardPropertySidebar.vue`.

Contenu :

- bande olive `#6B7A4A` en haut
- label `Dashboard` + bouton deconnexion
- recherche rapide par identifier (UInput pleine largeur)
- filtres type d offre et categorie (USelect pleine largeur)
- compteur de biens filtres et position active
- boutons de navigation prev / next
- avatar utilisateur (image reelle via `referrerpolicy="no-referrer"` ou initiales) + nom + email

Contrainte couleur : seulement `#212121` (fond) et `#6B7A4A` (olive) — aucune autre couleur.
Textes en `text-white/X` explicites pour eviter l heritage des variables de theme du projet.

### Composant `DashboardPropertyPreview` extrait du workspace

La zone centrale (infos du bien actif + navigation mobile) a ete sortie de `PropertyWorkspace`
dans un composant dedie `DashboardPropertyPreview.vue`.
Props : `accommodation`, `filteredCount`. Emits : `prev`, `next`.
Le `formattedPrice` computed a ete deplace dans ce composant.

### Layout mobile : topbar + bottom bar expandables

Architecture responsive validee apres iteration sur le brief initial :

**Topbar mobile** (`PropertySidebar.vue`, `lg:hidden`) :

- Barre fixe `fixed top-0` avec bande olive, label Dashboard, compteur, refresh, chevron, logout
- `isTopbarOpen` ref locale — se déplie vers le bas pour reveler filtres, recherche, nav, profil
- Remplace l ancien header `lg:hidden` inline dans `PropertyWorkspace`

**Bottom bar mobile** (`PropertyEditorSlideover.vue`, `lg:hidden`) :

- Persistante : toujours visible quand `accommodation` existe (`v-if="accommodation"`)
- Handle en bas : icone edit + titre du bien + chevron — tap pour expand / collapse
- Contenu éditeur (`v-if="isOpen"`) au-dessus du handle : meme blocs que desktop (`max-h-[78vh]`)
- `isDesktopOpen = isOpen && !isMobile` protege le `USlideover` contre une ouverture sur mobile
- `isMobile` detecte via `window.matchMedia('(max-width: 1023px)')` dans `onMounted` (SSR-safe)
- Bouton Edit flottant passe a `hidden lg:flex` : remplace par la bottom bar sur mobile
- Workspace : suppression du header mobile, ajout `pt-12 lg:pt-0` pour laisser place a la topbar

### Sidebar gauche (editeur) : abandon du formulaire plat, pivot vers design bloc

L approche initiale (formulaire plat avec `PropertyFieldEditor` liste en continu) a ete remplacee
par une interface inspiree de Nuxt Studio apres validation UX avec le commanditaire.

Nouveau modele :

- **Barre superieure** : `UTabs variant="link" color="neutral"` avec `content: false`
  (sections Contenu / Media), indicateur actif olive via `:ui`, slot `#list-trailing` pour
  le switcher FR / EN / ES et le bouton fermeture
- **Ligne contexte** : badge `identifier` style olive + titre tronque du bien + menu `⋮`
- **Corps en blocs** : chaque section de la fiche est un item de liste (icone + label + chevron
  - menu `⋮` actions), cliquable pour deplier / replier le contenu en accordeon
  * Bloc `Body` : en premier, ouvert par defaut — editeur Tiptap WYSIWYG
  * Bloc `Frontmatter` : contient tous les champs `PropertyFieldEditor`
  * Onglet Media : bloc `Images` + bloc `Medias associes`
  * Extensible a d autres blocs sans restructurer le composant
- **Pied** : avertissement discret "Edition locale — sauvegarde non disponible"
- **Couleurs** : `bg-[#212121]`, olive sur indicateur actif et locale active, tout le reste en
  `text-white/X`

Raison du pivot : l interface bloc est plus proche de l experience d edition en contexte voulue,
anticipe mieux l ajout futur de sections (SEO, medias, traductions) sans refactoring.

### Sidebar droite : refonte UI — filtres click-to-edit et dropdowns flottants

Les `UInput` / `USelect` initiaux ont ete remplaces par un pattern texte cliquable avec
dropdowns absolus pour eviter le decalage du contenu scrollable.

- Filtres (`identifier`, type de listing, categorie) affiches comme texte simple par defaut
- Clic sur un filtre ouvre une liste flottante (`position: absolute`) en dehors du scroll
- Dropdown fermé automatiquement lorsqu un autre filtre est ouvert
- `stripCount` retire le comptage `(n)` du label selectionne pour gagner de la place
- Compteur aligné à droite sans label redondant
- Email du profil en olive avec opacite adaptee

### Sidebar droite : header avec logo SVG et identite Graines Digitales

- Logo SVG `showcase-picto.svg` integre inline dans le template (import Vite ne retournait pas d URL)
- Texte deux lignes : `DASHBOARD` (tracking large, white/40) / `GRAINES DIGITALES` (tres petit,
  tracking serré, white/25)
- Separateurs olive `h-0.5 bg-[#6B7A4A]` avant et apres la zone filtres (desktop)

### `DashboardPropertyFieldEditor` : refonte in-place editing

Le composant initial utilisait les primitives Nuxt UI (`UFormField`, `UInput`, `UTextarea`,
`USwitch`) qui apportaient un style formulaire clair, inadapte a l environnement dark du dashboard.

Nouveau comportement :

- **Label** : `text-[0.65rem] font-semibold tracking-[0.1em] text-white/35 uppercase` — coherent
  avec la sidebar et les filtres
- **Boolean** : toggle inline au clic — valeur affichee "Oui" en olive `#6B7A4A` / "Non" en `text-white/30`
- **Number / String** : bouton affichant la valeur (`text-white/65` si remplie, `—` si vide) →
  `input` ou `textarea` natif transparent au clic, focus automatique via `nextTick`, fermeture
  par `blur` ou `Escape`, `Enter` pour les champs mono-ligne
- **Array scalaire** : chips de preview (max 5, `+N` si plus) → textarea une ligne par item au clic
- **Array complexe / Object** : chevron + textarea JSON monospace expandable
- **Separation entre champs** : `PropertyEditorSlideover` passe de `space-y-4` a
  `divide-y divide-white/5` pour les separateurs fins entre champs (desktop + mobile)

Raison du pivot : aligner visuellement le formulaire d edition avec le design click-to-edit deja
etabli dans la sidebar (filtres) — pattern UX coherent sur toute l interface dashboard.

### Performance API : cache serveur 30s

- `server/utils/dashboard/accommodations.ts` : cache module-level `Map<string, CacheEntry>`
  avec TTL 30 secondes par locale
- Refresh manuel via `?refresh=1` dans le composable `useDashboardAccommodations`
- Evite la re-lecture des 54 fichiers Markdown a chaque navigation

### Tiptap : installation et composant editeur

- `nuxt-tiptap-editor` installe comme module Nuxt (auto-import composants et composables)
- `@tiptap/markdown` installe pour la serialisation markdown native (pas de conversion HTML intermediaire)
- `DashboardTiptapEditor.vue` cree avec :
  - Toolbar : gras, italique, barre | H2, H3 | liste a puces, liste ordonnee, citation | undo/redo
  - Theme dark adapte au dashboard (ProseMirror style, olive sur actif)
  - `immediatelyRender: false` pour SSR-safe
  - Entree / sortie markdown transparente via `editor.storage.markdown.getMarkdown()`
- Bloc `Body` dans le slideover remplace `UTextarea` par `DashboardTiptapEditor`

## Etapes

### 1. Analyser les donnees existantes

- inventorier les champs presents dans `content/fr/accommodations/*.md`
- identifier les champs communs et les champs optionnels
- reperer les variations entre riad, villa, terrain, local commercial, chambre d hotes, etc.
- definir un DTO dashboard tolerant aux champs absents

### 2. Creer l API Nuxt read-only

- exposer la liste des biens
- exposer le detail d un bien par `slug`
- parser proprement front matter et body
- retourner les erreurs serveur lisibles
- proteger les endpoints avec la session dashboard

### 3. Construire le workspace plein ecran

- remplacer la page dashboard minimale par l experience immersive
- afficher un bien par defaut
- conserver une surface plein ecran
- ne pas reprendre le layout public complet
- ne pas remonter `AppBootShell` sur dashboard

### 4. Reprendre la navigation immobiliere

- reutiliser les briques visuelles existantes si elles restent decouplees
- conserver filtres et navigation proche du site
- ajouter la quick search par `identifier`
- garantir clavier et mobile autant que possible en V1

### 5. Ajouter le bouton `Edit`

- bouton flottant bas gauche
- label accessible explicite
- style discret et compatible plein ecran
- ne pas entrer en conflit avec les controles de navigation existants

### 6. Ajouter le slideover d edition

- slideover gauche
- top bar avec tabs et langue
- sections `Contenu` et `Media`
- formulaire local editable
- aucun appel de sauvegarde
- indiquer clairement que la sauvegarde n est pas disponible

### 7. ✅ Installer et integrer Tiptap pour l edition du body

- ~~reserver l emplacement du futur module Nuxt Tiptap editor~~ ✅ installe
- `nuxt-tiptap-editor` + `@tiptap/markdown` installes et configures
- `DashboardTiptapEditor.vue` cree avec toolbar, theme dark et serialisation markdown
- Bloc `Body` ouvert par defaut et place en premier dans l accordeon

### 8. Valider et documenter

- verifier SSR, type-check, lint et formatage sur les fichiers touches
- documenter les limites V1 si necessaire
- ne pas modifier les parcours publics

## Criteres d acceptation

- `/fr/dashboard` affiche une preview plein ecran d un bien immobilier
- le dashboard reste accessible uniquement apres authentification Google
- l utilisateur peut naviguer entre les biens depuis le dashboard
- les filtres immobiliers existants sont disponibles ou reproduits dans l experience dashboard
- la recherche rapide par `identifier` permet d atteindre un bien connu
- le bouton `Edit` est visible en bas a gauche
- le slideover gauche s ouvre et se ferme correctement
- le slideover propose les tabs `Contenu` / `Media`
- le slideover propose le switcher langue `FR` / `EN` / `ES`
- les champs front matter principaux sont editables en UI
- les metadonnees et medias sont editables en UI
- le body Markdown est editable via Tiptap WYSIWYG (bloc Body ouvert par defaut)
- aucune sauvegarde serveur n est effectuee
- aucun upload media n est propose
- le site public conserve son comportement actuel
- les checks projet passent au minimum sur le scope touche :
  - `bun run type-check`
  - lint cible ou `bun run lint:check` si les erreurs preexistantes sont resolues
  - format cible ou `bun run format:check` si les erreurs preexistantes sont resolues

## Points de vigilance

- Architecture : ne pas coupler les composants publics au dashboard.
- UX : eviter une table CRUD ou un formulaire plein ecran hors contexte.
- Securite : proteger les endpoints dashboard read-only cote serveur.
- SSR : les donnees initiales doivent fonctionner sans acces direct a `window`.
- Performance : ne pas charger inutilement tous les details lourds si une liste suffit.
- Donnees : parser le YAML avec une approche robuste, pas avec des manipulations de chaines fragiles.
- Internationalisation : anticiper les tabs langues sans inventer de persistance.
- Future API : garder une frontiere service claire pour remplacer la lecture Markdown par API Platform.
- YAGNI : ne pas installer media manager ou persistence locale sans validation explicite.
- Tiptap : installe et integre — serialisation markdown validee, pas de conversion HTML intermediaire.

### Reorganisation de l onglet Media et deplacement de `associatedMedia`

**Decision validee** : l onglet `Media` du slideover doit devenir la galerie des images du bien
(`frontmatter.image`), pas une bibliotheque projet globale ni un simple champ brut.

Raison : un onglet Media globalisant tous les assets du projet serait deconnecte du contexte
de la fiche en cours d edition. La galerie par bien est plus coherente avec le modele "j edite
ce bien precisement".

La bibliotheque media projet (tous les assets) reste hors perimetre de cette task — elle
constituerait une section dediee a part dans le dashboard (non encore planifiee).

**`associatedMedia` deplace dans l onglet `Contenu`** : ce champ est une relation de contenu
(quels objets media sont associes semantiquement a ce bien), pas une action de gestion de
fichiers. Sa place est dans le bloc frontmatter au meme titre que les autres champs.

**Perimetre Media V1 cible :**

- grille de vignettes des images du bien (`frontmatter.image`)
- edition inline par image : `caption`, `keywords`, `representativeOfPage`
- reordering (drag & drop ou fleches)
- aucun upload, aucune suppression physique

**Question ouverte** : la source des images (`frontmatter.image`) contient des chemins locaux
(`/images/...`), des UUIDs Directus, ou un melange des deux — a clarifier avant l implementation
des vignettes pour savoir comment resoudre les URLs d apercu.
