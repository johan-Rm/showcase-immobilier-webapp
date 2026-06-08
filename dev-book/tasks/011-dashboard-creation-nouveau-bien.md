---
status: En cours
dependances: 008-dashboard-sauvegarde-biens-api-symfony.md
  009-dashboard-reexport-markdown-apres-sauvegarde.md
---

# 011 Dashboard — Creation d un nouveau bien immobilier

## Intention

Permettre a l utilisateur du dashboard de creer un nouveau bien immobilier depuis
l interface, sans passer par un fichier Markdown cree manuellement.

La task 008 pose le circuit d ecriture (API Symfony + Markdown). Cette task ajoute
le flux UX de creation : onboarding guide, validation progressive, creation en BDD
via Symfony et generation du fichier Markdown initial.

## Perimetre pressenti

- bouton "Nouveau bien" dans la sidebar ou la topbar dashboard
- emplacement valide : `DashboardPropertySidebar`, sous le compteur / la liste des biens filtres
- onboarding de creation par steps
- premiere creation technique depuis :
  - category (select parmi les codes disponibles)
  - realEstateListing
  - place
- completion progressive avec :
  - name
  - prix
  - images
  - surface totale ou habitable
- identifier genere cote backend depuis `realEstateListing + category`
- slug genere cote backend depuis `identifier + name/fallback + place`
- POST vers Symfony via une route Nitro dediee au creator
- creation du fichier Markdown initial (circuit task 009)
- redirection vers le bien cree dans l editeur

## Hors perimetre

- validation metier avancee (doublons identifier, regles metier complexes)
- formulaire complet (l editeur existant prend le relai apres creation)
- creation de biens en masse

## Contrat backend confirme

Sources backend :

- `/home/johan/www/graines-digitales/api/symfony-8-api-platform/docs/04-domain-model/accommodations.md`
- `/home/johan/www/graines-digitales/api/symfony-8-api-platform/dev-book/tasks/019-slug-mecanique-accommodation.md`
- `/home/johan/www/graines-digitales/api/symfony-8-api-platform/dev-book/tasks/021-mecanique-identifier-accommodation.md`
- `/home/johan/www/graines-digitales/api/symfony-8-api-platform/src/Entity/Accommodation.php`
- `/home/johan/www/graines-digitales/api/symfony-8-api-platform/src/State/ProjectScopedAccommodationCreateWithTranslationsProcessor.php`

### Identifier

`identifier` est genere cote backend et n est jamais editable par le client.

Format :

```txt
INITIALS(realEstateListing.code) + INITIALS(category.code) + compteur sur 3 chiffres
```

Exemple :

```txt
bien-a-vendre + maison-de-campagne -> BAVMDC001
```

### Slug

`slug` est genere cote backend et n est jamais envoye par le front.

Format backend :

```txt
slug = slugify(identifier + " " + name + " " + place)
slug = slugify(identifier + " " + category + " " + place) si name absent
```

### Endpoint Symfony disponible

Creation avec traductions :

```txt
POST /api/projects/{projectId}/accommodations/translations
```

Payload minimal techniquement confirme par test backend :

```json
{
  "category": "/api/projects/{projectId}/category-codes/{categoryId}",
  "realEstateListing": "/api/projects/{projectId}/category-codes/{listingId}",
  "place": "/api/projects/{projectId}/category-codes/{placeId}",
  "offer": {
    "price": "500000"
  },
  "translations": [
    {
      "locale": "fr",
      "name": "Local commercial avec traductions",
      "body": "<p>Corps en français.</p>"
    }
  ]
}
```

Point d architecture Nuxt : le front dashboard ne doit pas appeler Symfony directement. Il
faut ajouter une route Nitro qui garde le JWT Symfony cote serveur et relaie ce POST.

## Regles metier confirmees pour le creator

- le premier POST doit attendre `realEstateListing + category + place`
- `identifier` est retourne par le back apres creation
- `slug` est calcule par le back apres `identifier + name/fallback + place`
- le bien est cree avec `isActive: true`
- l enregistrement final devient disponible quand la fiche contient au minimum :
  - un nom
  - un lieu
  - au moins une image
  - une image avec `representativeOfPage = true`
  - un prix ou l option `prix sur demande`
  - `floorSize` ou `areaSize`
- le bien est actif par defaut des sa creation
- apres creation reussie, le dashboard bascule automatiquement vers le process `edit` du bien cree

## Sous-tache active — DashboardPropertyCreatorPanel

### Intention

Créer un composant `DashboardPropertyCreatorPanel` dédié au process de création d un bien,
indépendant du process de modification existant.

Le panel doit fonctionner comme un onboarding, pas comme un formulaire backoffice. L utilisateur
cible n etant pas a l aise avec l informatique, chaque step doit guider une seule intention
metier avec peu de champs visibles et des actions explicites.

Le rendu doit donner l impression qu un assistant intelligent accompagne la creation du bien.
L interface ne doit pas seulement afficher un formulaire decoupe en slides : elle doit parler a
l utilisateur, le rassurer, expliquer ce qui est attendu et lui donner le sentiment que le
systeme prend en charge la complexite technique.

Le slideover dashboard doit contenir deux process séparés :

- `edit` : modification d un bien existant via `DashboardPropertyEditorPanel`
- `create` : création d un nouveau bien via `DashboardPropertyCreatorPanel`

Ces deux process ne doivent partager ni topbar, ni bouton de sauvegarde, ni état de formulaire.
Le partage accepté se limite au conteneur `DashboardPropertyEditorSlideover` et à l ouverture /
fermeture globale du slideover.

### Périmètre V1

- créer `app/components/dashboard/PropertyCreatorPanel.vue`
- afficher ce composant dans la section `data-property-editor-process="create"` du slideover
- garder `DashboardPropertyEditorPanel` comme seul composant visible de la section `edit`
- prévoir dans `DashboardPropertyCreatorPanel` une structure autonome :
  - topbar propre au mode création
  - navigation entre steps
  - zone de formulaire propre a chaque step
  - zone d actions propre au mode création
- centrer horizontalement et verticalement le contenu principal de chaque step
- afficher le stepper en haut de la zone de contenu, sans titre technique visible
- ajouter un bouton d acces au resume depuis la topbar creator
- utiliser un effet typing pour les messages ou phrases adressees directement au client
- ne pas réutiliser la topbar, le switch actif, les messages ou le bouton save de
  `DashboardPropertyEditorPanel`
- préparer des props/emits distincts pour la création, même si la logique métier n est pas encore
  branchée
- conserver un rendu SSR-safe et sans accès DOM direct

### Flow creator cible

1. Step classification :
   - `realEstateListing`
   - `category`
   - `place`
   - action de pre-creation
   - affichage de l `identifier` retourne par le back
   - apparition de la topbar creator une fois le premier POST reussi
2. Step nom :
   - `name`
   - le slug reste invisible ou en lecture seule informative apres retour backend
3. Step prix :
   - prix
   - devise
   - option `prix sur demande`
   - specification prix si utile
4. Step medias :
   - selection ou upload d images
   - au moins une image pour rendre la fiche publiable
   - une image doit etre marquee `representativeOfPage = true`
5. Step details :
   - `floorSize` ou `areaSize`
   - autres champs simples selon le type de bien
6. Steps optionnels skippables :
   - `review`
   - `qualities`
   - description courte / body
7. Step resume :
   - recapitulatif humain
   - creation/finalisation
   - proposition d enregistrement si la fiche est complete

### Navigation entre steps

- l utilisateur peut revenir sur un step deja visite
- les steps futurs restent verrouilles tant que les prerequis obligatoires ne sont pas remplis
- les steps optionnels peuvent etre ignores puis repris plus tard
- le resume final n est accessible que si les steps obligatoires sont valides
- les etats utiles sont : `locked`, `current`, `completed`, `skipped`, `invalid`
- les transitions entre steps doivent etre directionnelles :
  - avance : slide vers l avant
  - retour : slide inverse

### Rendu onboarding assistant

- le contenu de chaque step doit etre centre horizontalement et verticalement dans la zone utile
- la zone ne doit pas donner l impression d un formulaire administratif classique
- chaque step doit commencer par une phrase d assistant courte, adressee directement au client
- cette phrase utilise un effet typing pour renforcer l impression d accompagnement intelligent
- les textes doivent eviter le vocabulaire technique visible comme `slug`, `payload`, `back` ou
  `POST`
- les champs visibles restent peu nombreux et contextualises par une intention claire
- les actions principales doivent rester simples : `Continuer`, `Retour`, `Ignorer`, `Résumé`
- le resume sert de point de controle humain et peut etre consulte depuis la topbar
- l effet typing ne doit pas bloquer la navigation ni provoquer de decalage de layout important

### Topbar creator

- la topbar creator est propre au process de creation
- une fois le premier POST reussi, le backend retourne l `identifier`
- cette topbar affiche :
  - la ref generee par le back
  - le nom du bien si renseigne
  - un fallback lisible tant que le nom n est pas renseigne
- avant que la ref soit connue, la topbar peut afficher un badge temporaire non technique, par
  exemple `REF`
- la topbar contient aussi :
  - un bouton pour voir le resume
  - un bouton de fermeture
- cette topbar reste propre au process de creation et ne reutilise pas celle de
  `DashboardPropertyEditorPanel`

### Etat initial et enregistrement

- le bien est cree avec `isActive: true`
- si le client remplit suffisamment de champs, le panel felicite l utilisateur et debloque
  l enregistrement final
- apres creation reussie, basculer automatiquement vers le process `edit` du bien cree

### Medias et image representative

- la section medias du creator doit s inspirer de la section Media du process de modification
- si une seule image est ajoutee, elle devient automatiquement `representativeOfPage = true`
- si plusieurs images sont ajoutees, l utilisateur doit pouvoir choisir simplement l image
  representative depuis la liste / galerie
- le choix doit rester visible et explicite avant enregistrement
- l image representative est obligatoire pour proposer l enregistrement

### Contrat UI attendu

`DashboardPropertyEditorSlideover.vue` orchestre seulement le choix du process visible :

```vue
<section data-property-editor-process="edit">
  <DashboardPropertyEditorPanel />
</section>

<section data-property-editor-process="create">
  <DashboardPropertyCreatorPanel />
</section>
```

`DashboardPropertyCreatorPanel` porte son propre cycle UI :

- titre / contexte de création
- champs requis de création
- validation locale de création
- bouton de création
- messages d erreur / succès de création

### Hors périmètre de cette sous-tâche

- POST réel vers Symfony
- génération définitive du fichier Markdown
- validation avancée des doublons
- traduction automatique
- réutilisation du formulaire complet de modification
- mutualisation prématurée entre création et modification

### Points de décision avant implémentation métier

- le bouton `Nouveau bien` ouvre-t-il le meme slideover en mode `create`, ou un autre
  declencheur dedie ?
- comment representer visuellement `prix sur demande` dans le resume et dans le payload final ?

### Critères d acceptation

- la section `edit` ne contient visuellement que `DashboardPropertyEditorPanel`
- la section `create` contient visuellement `DashboardPropertyCreatorPanel`
- aucun bouton save, message ou topbar n est partagé entre les deux panels
- le creator fonctionne en steps navigables avec steps optionnels skippables
- le contenu de chaque step est centre horizontalement et verticalement
- le stepper est affiche en haut de la zone de contenu, sans libelle technique de step
- les phrases d accompagnement adressees au client utilisent un effet typing
- l interface donne une impression d assistant de creation, pas de formulaire backoffice
- `identifier` et `slug` ne sont jamais saisis ni generes cote front
- le bien est cree actif par defaut
- le bouton `Nouveau bien` est prevu dans `DashboardPropertySidebar`, sous la liste des biens
  filtres
- une fiche ne peut proposer l enregistrement que si elle a au moins une image representative, un
  prix ou `prix sur demande`, et `floorSize` ou `areaSize`
- apres le premier POST, la topbar du creator affiche la ref generee et le nom du bien
- la topbar du creator propose un acces au resume
- le choix de l image representative reprend les conventions de la section Media du process de
  modification
- le composant de création peut évoluer sans modifier le composant de modification
- lint et format ciblés passent sur les fichiers modifiés

## Etat d avancement (2026-06-04)

Branche : `feat/dashboard-property-creator-panel`.

### Fait — squelette UI / onboarding + pre-creation (≈ 90 %)

- `DashboardPropertyCreatorPanel` créé et autonome (topbar, steps, actions, typing propres)
- slideover orchestre les deux process `edit` / `create` sans partage de topbar ni de save
- bouton `Nouveau bien` dans `DashboardPropertySidebar` -> `openCreator` (process `create`)
- steps navigables avec etats `locked/current/completed/skipped/invalid`
- contenu structure en trois zones, stepper en haut, messages assistant et transitions directionnelles
- effet typing sur les phrases d assistant
- image representative auto si une seule image, regles `canFinalizeDraft` calculees
- `identifier` / `slug` jamais saisis cote front, bien cree `isActive: true`
- pre-creation apres le step classification via route Nitro dediee
  `/api/dashboard/accommodations/creator`
- affichage de l `identifier` backend dans la topbar des que le premier POST reussit
- fermeture du creator confirmee si un brouillon backend a deja ete cree, avec conservation du
  brouillon pour reprise plus tard

### Fait — branchement metier (2026-06-05)

1. ✅ Sauvegarde des steps (nom, prix, medias, details) sur le brouillon a la finalisation, en
   un seul PUT via la route existante `PUT /api/dashboard/accommodations/{identifier}`
   (`useDashboardSave.saveMultilingual`). Choix : sauvegarde groupee a la finalisation (V1).
2. ✅ Finalisation du brouillon branchee : a l etape `summary`, l action primaire
   `Valider et enregistrer` enregistre le brouillon puis emet `created` (ex-`ready`), ecoute par
   le slideover.
3. ✅ Publication separee retiree du dernier step : pas de bouton `Publier le bien`, pas de
   confirmation supplementaire. Le creator enregistre un bien actif par defaut.
4. ✅ Bascule automatique vers le process `edit` du bien cree : le creator emet `created`, le
   slideover relaie au workspace qui recharge la liste, selectionne le bien et passe en `edit`.

### Decisions actees (2026-06-05)

- **Brouillons abandonnes** : suppression explicite. A la fermeture d un brouillon non finalise,
  confirmation puis `DELETE /api/dashboard/accommodations/{identifier}` (route Nitro dediee ->
  `Delete` API Platform Symfony). Le bien n est purge que s il n a pas ete finalise.
- **Mapping `createPayload` -> contrat** : le frontmatter plat est passe a `mapToApiPlatform`, qui
  construit la `translation` de la locale courante (name/body/review) et resout les IRIs
  (`category`/`realEstateListing`/`place`) cote client via `resolveIris`.
- **Relations en codes au premier POST** : le creator envoie `category`/`realEstateListing`/`place`
  en **codes** (codeValue), pas en IRIs. Le backend les resout via
  `ProjectScopedRelationDenormalizer`. Envoyer un IRI declenche `getResourceFromIri` ->
  `LocaleResolver` qui exige une locale valide.
- **Locale transmise au backend** : les routes Nitro de creation (`creator.post`) et de
  sauvegarde (`[identifier].put`) passent `?locale=<locale>` a Symfony. `LocaleResolver` lit
  `?locale=` en priorite ; sans ca, la resolution des relations traduisibles peut echouer
  (« Unsupported locale »).
- **`prix sur demande`** : `offer.priceSpecification: 'prix-sur-demande'` sans `price` (le mapper
  n emet alors pas de prix).

### Fait — homogeneisation des textes + champ designation (2026-06-06)

**Patron de texte assistant en 3 temps** (applique aux 8 steps, dans `buildConversation` ET
`assistantMessage`) :

1. **Notre action** — imperatif « nous » (jamais « on »), ex. « Commencons tranquillement. »
2. **Ce que doit faire le user** — imperatif « tu », nomme le champ, ex. « Choisis le type… »
3. _(saut de ligne)_ **Ce que va faire l app** — voix « je », ex. « Je m occupe de preparer la reference. »

Rendu unifie : le template « structure » generique affiche 2 lignes de titre (temps 1 + 2) puis
l engagement en support (comme la classification, sans les accents). Les templates dedies
`name` / `price` redondants ont ete supprimes.

Textes par step :

| Step           | 1. Notre action              | 2. Consigne                                   | 3. Engagement app                                                        |
| -------------- | ---------------------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| Classification | Commencons tranquillement.   | Choisis le type, la categorie et le lieu.     | Je m occupe de preparer la reference.                                    |
| Designation    | Poursuivons tranquillement.  | Donne au bien une designation courte.         | Je m en sers comme repere et je m occupe du SEO.                         |
| Prix           | Passons au prix.             | Indique le prix du bien si tu l as.           | Sinon je l affiche en « prix sur demande », sans bloquer la creation.    |
| Medias         | Occupons-nous des images.    | Ajoute une ou plusieurs images du bien.       | Je m occupe de l affichage et de la mise en avant de l image principale. |
| Textes alt     | Soignons les descriptions.   | Decris brievement chaque image.               | Je m en sers pour l accessibilite et le referencement de la fiche.       |
| Details        | Precisons quelques details.  | Renseigne au moins une surface.               | Je te laisse completer le reste plus tard dans l editeur.                |
| Avis           | Ajoutons une touche en plus. | Partage le regard de l agence sur ce bien.    | Je le mets en valeur sur la fiche.                                       |
| Resume         | Faisons le point ensemble.   | Jette un dernier coup d œil au recapitulatif. | Je m occupe de creer le bien des que tu valides.                         |

**Champ designation** :

- saisie minimaliste : fond transparent, bordure basse olive `#6B7A4A` (pleine au focus), caret
  olive — plus de cadre.
- placeholder **rotatif et contextuel** via le composable `app/composables/dashboard/useDesignationPlaceholder.ts`
  (helper pur `buildDesignationSuggestions` teste) : suggestions generiques, ou gabarits remplis
  avec le lieu choisi (`{lieu}`) recupere via `metadataStore.getOptionsForCodeSet('accommodation-place')`.
- transition **slide vertical** entre suggestions : overlay `<span>` + `<Transition>` (le
  placeholder natif ne s anime pas), rotation suspendue des la saisie, `prefers-reduced-motion`
  respecte (pas de rotation, pas d animation).

### Reste optionnel (hors V1)

- auto-save incremental par step (actuellement : sauvegarde groupee a la finalisation).
- navigation entre steps verrouillee apres finalisation (stepper inerte) : suffisant en V1.

## Iteration 2 — enrichissement du creator (2026-06-06)

Steps passes de 8 a 12. Les nouveaux steps sont **optionnels** (skippables) **sauf Description**
qui est requise (elle alimente le `metaDescription` SEO). Patron de
texte 3 temps respecte (amorce nous / consigne tu / engagement app je), accent olive sur les
titres, effet typing une seule fois par step.

### Steps ajoutes / modifies

1. **Details (step 6) — etendu et optionnel.** Surface habitable + totale visibles ; les autres
   details (`landArea`, `areaTerrace`, `numberOfRooms`, `numberOfBedrooms`,
   `numberOfBathroomsTotal`, `numberOfGarages`, `occupancy`, `yearBuilt`) sont **masques** et
   reveles via « Ajouter plus de details ». Step rendu **optionnel** + message « rien ne presse ».
2. **Description (`body`)** — nouveau step **requis** (alimente le `metaDescription` SEO),
   **textarea** simple (Tiptap reporte). Ajoute a `canFinalizeDraft`.
3. **Confort (`amenityFeature`)** — nouveau step, `DashboardCategoryCodeSelect` en `multiple`
   (set `amenity-feature`). Ignorable.
4. **Qualites (`qualities`)** — nouveau step, `DashboardQualitiesEditor` (sliders 0-100).
   **Mapping serveur ajoute** dans `accommodationMapper.mapToApiPlatform` (`qualities` n'etait pas
   persiste avant).
5. **SEO (`metaTitle` / `metaDescription`)** — nouveau step. Pre-remplissage **auto** depuis la
   designation (`metaTitle`) et le corps (`metaDescription`, tronquee ~157 car.), modifiable.

### Alt auto (#7)

`DashboardPropertyMediaGallery.onUploaded` reprend desormais le `caption` auto-genere du
`MediaObject` renvoye a l'upload (au lieu d'une chaine vide) → le step « Textes alt » apparait
deja pre-rempli.

### Decisions actees (iteration 2)

- details supplementaires **ignorables** (rien ne presse) ; surface mini toujours requise pour
  **enregistrer** (`canFinalizeDraft`).
- confort **ignorable** mais incite a un minimum (pas de minimum bloquant).
- description : **textarea** d'abord, Tiptap plus tard.
- SEO : **auto** depuis designation + body, modifiable.

### Reste a definir

- zone de selection des medias trop petite (refonte UX) — a traiter separement.
- details contextuels selon le type de bien (afficher seulement les champs pertinents).
- regroupement eventuel Confort + Qualites si le parcours parait trop long.
