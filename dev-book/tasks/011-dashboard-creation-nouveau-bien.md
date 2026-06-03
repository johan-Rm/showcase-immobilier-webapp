---
status: A planifier
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
- le bien est cree avec `isActive: false`
- la publication devient disponible quand la fiche contient au minimum :
  - un nom
  - un lieu
  - au moins une image
  - une image avec `representativeOfPage = true`
  - un prix ou l option `prix sur demande`
  - `floorSize` ou `areaSize`
- le passage a `isActive: true` doit etre explicite et accompagne d un message positif
- apres creation reussie, le dashboard bascule automatiquement vers le process `edit` du bien cree

## Sous-tache active — DashboardPropertyCreatorPanel

### Intention

Créer un composant `DashboardPropertyCreatorPanel` dédié au process de création d un bien,
indépendant du process de modification existant.

Le panel doit fonctionner comme un onboarding, pas comme un formulaire backoffice. L utilisateur
cible n etant pas a l aise avec l informatique, chaque step doit guider une seule intention
metier avec peu de champs visibles et des actions explicites.

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
   - proposition de publication si la fiche est complete

### Navigation entre steps

- l utilisateur peut revenir sur un step deja visite
- les steps futurs restent verrouilles tant que les prerequis obligatoires ne sont pas remplis
- les steps optionnels peuvent etre ignores puis repris plus tard
- le resume final n est accessible que si les steps obligatoires sont valides
- les etats utiles sont : `locked`, `current`, `completed`, `skipped`, `invalid`

### Topbar creator

- aucune topbar technique avant le premier POST : l utilisateur commence par une experience
  onboarding simple
- une fois le premier POST reussi, le backend retourne l `identifier`
- a partir de ce moment, `DashboardPropertyCreatorPanel` affiche sa propre topbar
- cette topbar affiche :
  - la ref generee par le back
  - le nom du bien si renseigne
  - un fallback lisible tant que le nom n est pas renseigne
- cette topbar reste propre au process de creation et ne reutilise pas celle de
  `DashboardPropertyEditorPanel`

### Etat initial et publication

- le bien est cree avec `isActive: false`
- si le client remplit suffisamment de champs, le panel felicite l utilisateur et debloque une
  action explicite de publication
- ne pas passer `isActive` a `true` silencieusement : demander une confirmation via bouton
  dedie, par exemple `Publier le bien`
- apres creation reussie, basculer automatiquement vers le process `edit` du bien cree

### Medias et image representative

- la section medias du creator doit s inspirer de la section Media du process de modification
- si une seule image est ajoutee, elle devient automatiquement `representativeOfPage = true`
- si plusieurs images sont ajoutees, l utilisateur doit pouvoir choisir simplement l image
  representative depuis la liste / galerie
- le choix doit rester visible et explicite avant publication
- l image representative est obligatoire pour proposer la publication

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
- `identifier` et `slug` ne sont jamais saisis ni generes cote front
- le bien est cree inactif par defaut
- le bouton `Nouveau bien` est prevu dans `DashboardPropertySidebar`, sous la liste des biens
  filtres
- une fiche ne peut proposer la publication que si elle a au moins une image representative, un
  prix ou `prix sur demande`, et `floorSize` ou `areaSize`
- apres le premier POST, la topbar du creator affiche la ref generee et le nom du bien
- le choix de l image representative reprend les conventions de la section Media du process de
  modification
- le composant de création peut évoluer sans modifier le composant de modification
- lint et format ciblés passent sur les fichiers modifiés
