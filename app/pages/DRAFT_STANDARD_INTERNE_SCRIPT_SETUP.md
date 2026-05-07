# Draft - Standard interne `script setup`

## Statut

Ce document est un brouillon de standard interne pour les composants Vue et Nuxt en
`<script setup lang="ts">`.

Il sert a harmoniser la structure des fichiers et a reduire les variations inutiles.
Il ne remplace pas l architecture officielle du projet ni les regles documentees dans
`docs/2.architecture/` et `app/pages/README.md`.

## Objectif

- rendre les composants lisibles rapidement
- separer clairement data, UI et orchestration
- limiter la logique metier dans la couche d affichage
- garder des composants SSR-safe et maintenables
- fournir un ordre de lecture et de redaction stable

## Portee

Ce standard s applique en priorite aux composants Vue en `script setup`.

Adaptation par couche :

- `pages/` : orchestration de route, chargement de donnees, etats de page, bridge avec le layout
- `components/` : rendu et interactions locales
- `composables/` : logique reactive et orchestration reutilisable
- `services/` : logique metier pure, transformations, acces externes

Une page ne suit pas exactement les memes contraintes qu un composant d affichage simple.
La structure reste la meme, mais le poids relatif de chaque bloc change selon la couche.

## Principes

- un fichier doit avoir une responsabilite dominante
- le template consomme des valeurs deja preparees
- la logique metier ne doit pas fuir dans le rendu
- les effets de bord doivent etre regroupes et explicites
- les acces aux donnees doivent etre lisibles et faciles a tracer
- toute exception a la structure doit etre volontaire et justifiable

## Ordre recommande des blocs

L ordre ci-dessous est le standard par defaut. Il peut etre allege si certains blocs sont inutiles.

```vue
<script setup lang="ts">
// 1. Imports
// 2. Types et constantes statiques
// 3. Props et emits
// 4. Composables, stores, routeur
// 5. Etat local
// 6. Data inputs
// 7. Validation et helpers purs
// 8. Computed UI-ready
// 9. Actions et handlers
// 10. Watch et watchEffect
// 11. Metadonnees ecran ou page
// 12. Lifecycle
</script>
```

## Detail des blocs

### 1. Imports

- commencer par les imports `type`
- regrouper ensuite les imports runtime
- eviter les imports inutilises et les chemins relatifs profonds si un alias projet existe

### 2. Types et constantes statiques

- declarer ici les types locaux, interfaces simples et constantes stables
- les constantes de configuration locale doivent rester petites et evidentes
- une constante qui porte de la logique metier partagee doit plutot vivre hors du composant

### 3. Props et emits

- definir les props au plus haut du fichier
- typer explicitement les contrats utiles
- garder les defaults simples et previsibles

### 4. Composables, stores, routeur

- declarer ici `useRoute`, `useRouter`, stores, i18n et composables de contexte
- ne pas melanger cette couche avec des calculs UI
- si un composable devient la source d une logique metier importante, verifier si un service est plus adapte

### 5. Etat local

- reserver `ref` et `reactive` a l etat reellement local au composant
- ne pas dupliquer dans l etat local une valeur qui peut rester un `computed`
- preferer des noms explicites : `isOpen`, `selectedId`, `activeTab`

### 6. Data inputs

Ce bloc regroupe les entrees brutes consommees par le composant :

- donnees venant du store
- metadata ou config
- params de route
- contenu i18n deja resolu si necessaire

Ces valeurs sont encore proches de la source. Elles ne sont pas obligatoirement pretes pour le template.

### 7. Validation et helpers purs

- centraliser ici les verifications necessaires aux champs obligatoires
- garder des helpers purs, sans acces DOM ni effet de bord
- les messages d erreur doivent etre clairs et actionnables
- si la validation est partagee, la sortir dans un utilitaire ou un service

Regle de prudence :

- eviter `throw` par defaut dans un composant public tant que l impact SSR et UX n est pas clarifie
- preferer une politique explicite par contexte : erreur bloquante, fallback controle ou non-rendu assume

### 8. Computed UI-ready

Le template doit consommer en priorite des valeurs deja preparees :

- labels finalises
- booleens `hasX`, `isX`, `canX`
- URLs, listes, variantes d affichage
- objets de presentation prets a iterer

Un `computed` doit idealement avoir une intention unique. Si un derive fait trop de choses, il faut le scinder ou remonter une partie de la logique.

### 9. Actions et handlers

- regrouper les handlers utilisateur au meme endroit
- preferer des noms d intention : `handleSubmit`, `openGallery`, `closePanel`
- si un handler grossit, extraire la logique dans un helper, un composable ou un service

### 10. Watch et watchEffect

- utiliser `watch` quand la source doit etre explicite
- utiliser `watchEffect` seulement si les dependances implicites sont acceptables et lisibles
- regrouper les watchers pour eviter les effets disperses
- un watcher doit correspondre a une intention identifiable

### 11. Metadonnees ecran ou page

Dans ce projet, ce bloc concerne surtout :

- `definePageMeta`
- synchronisation avec un layout ou un systeme de screen meta
- metadonnees dependantes d une donnee reactive

Les objets de meta doivent rester simples. Les calculs lourds ou les transformations doivent rester en amont.

### 12. Lifecycle

- garder `onMounted`, `onBeforeUnmount` et assimilés en fin de fichier
- reserver le lifecycle a l orchestration
- ne pas y cacher une logique metier qui devrait vivre dans un helper, un service ou un `watch`

## Discipline du template

Le template doit rester une couche de rendu.

A eviter dans le template :

- acces direct au store quand une valeur preparee suffit
- logique metier
- conditions complexes imbriquees
- transformations non triviales de donnees

Acceptable dans le template :

- conditions simples de rendu
- iteration sur des donnees deja preparees
- branchements UI elementaires

## Nommage recommande

| Type               | Convention                              |
| ------------------ | --------------------------------------- |
| booleen            | `hasX`, `isX`, `canX`                   |
| identifiant        | `xId`, `xIdentifier`                    |
| config brute       | `xConfig`, `xContent`                   |
| derive d affichage | `displayX`, `uiX`                       |
| handler            | `handleX`, `openX`, `closeX`, `toggleX` |

Ces conventions servent a rendre l intention lisible, pas a imposer un formalisme rigide.

## Points de vigilance Nuxt

- rester SSR-safe par defaut
- ne pas introduire de dependance au DOM sans garde explicite
- ne pas charger de logique metier dans `pages/` si elle doit vivre dans `services/` ou `stores/`
- utiliser les primitives Nuxt adaptees pour le chargement de donnees quand la route le justifie
- garder une frontiere nette entre orchestration de page et affichage de composant

## Exceptions autorisees

Ce standard n est pas absolu.

Des ecarts peuvent etre acceptes si :

- ils simplifient clairement le fichier
- ils evitent une abstraction artificielle
- ils respectent mieux la responsabilite reelle du composant
- ils n affaiblissent ni la lisibilite ni la stabilite SSR

## Exemple minimal

```vue
<script setup lang="ts">
import type { PropertyCardViewModeListl } from '@shared/models/property'

const props = defineProps<{
  item: PropertyCardViewModeListl
}>()

const isFeatured = computed(() => props.item.badges.includes('featured'))
const displayTitle = computed(() => props.item.title)
const displayPrice = computed(() => props.item.priceLabel)

function handleClick() {
  navigateTo(props.item.href)
}
</script>
```

## Resume operatoire

Un bon fichier `script setup` permet de comprendre rapidement :

1. d ou viennent les donnees
2. ce qui est valide ou transforme
3. ce que le template consomme
4. quels effets de bord existent
5. quelle est la responsabilite exacte du composant
