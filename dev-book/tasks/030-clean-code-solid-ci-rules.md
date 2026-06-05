---
status: Todo
doc: docs/3.application/ci-conventions-validation.md
---

# 004 Regles Clean Code / SOLID / KISS / YAGNI / SOC en CI

## Intention

Ajouter des controles CI couvrant des principes de qualite code (Clean Code, SOLID, KISS,
YAGNI, Separation of Concerns) via le systeme de regles YAML existant dans
`scripts/ci/app/`.

Ces regles n existent pas encore en ESLint. Elles sont detectables par grep ou analyse
structurelle, et compatibles avec `requiresManualReview: true` pour les cas heuristiques.

## Perimetre

- documenter les conventions dans les README locaux concernes
- declarer les regles dans `scripts/ci/app/rules.yaml`
- ecrire les scripts de verification correspondants
- brancher les nouveaux checks dans le workflow CI/CD

## Hors perimetre

- modifier les conventions produit existantes
- corriger les violations detectees par les nouveaux checks
- introduire un moteur generique ou une nouvelle dependance

## Regles a implementer

### SOC — Separation of Concerns

**`app-no-fetch-in-components`** `requiresManualReview: true`
Detecte `$fetch(` ou `useFetch(` directement dans `app/components/`.
La donnee doit transiter par un composable ou une page, pas etre fetchee dans un composant
d affichage.

**`server-route-no-business-logic`** `requiresManualReview: true`
Detecte `.map(`, `.filter(`, `.reduce(` directement dans `server/api/`.
Les routes orchestrent, elles ne calculent pas.

### Clean Code

**`app-no-commented-code`** `requiresManualReview: true`
Detecte les lignes commentees qui ressemblent a du code (`// const`, `// function`,
`// return`, `// if`, etc.).
Du code commente est du code mort — supprimer ou garder, pas laisser.

**`app-no-nested-ternary`** `requiresManualReview: false`
Detecte les ternaires imbriques (`? ... ? ...`) dans les fichiers `.vue` et `.ts`.
Un ternaire imbrique est presque toujours un `if/else` deguise.

### SOLID

**`app-large-component`** `requiresManualReview: true`
Detecte les fichiers `.vue` dans `app/components/` depassant un seuil de lignes (200).
Un composant large fait souvent trop de choses — SRP.

**`app-large-type`** `requiresManualReview: true`
Detecte les interfaces ou types avec plus de 8 champs.
Signale un potentiel probleme d Interface Segregation — ISP.

**`app-composable-many-returns`** `requiresManualReview: true`
Detecte les composables (`use*.ts`) retournant plus de 8 valeurs dans leur `return {}`.
Un composable qui expose trop de choses fait probablement plusieurs choses — SRP.

### KISS

**`app-deep-nesting`** `requiresManualReview: true`
Detecte plus de 3 niveaux d indentation consecutifs dans les fichiers `.ts` et les blocs
`<script>` des `.vue`.
Signe de logique conditionnelle trop complexe.

### YAGNI

**`app-todo-fixme`** `requiresManualReview: true`
Detecte `TODO`, `FIXME`, `HACK`, `XXX` dans les commentaires.
Pas bloquant, mais traçable — chaque occurrence est une dette a assumer ou solder.

### SRP

**`app-no-store-write-in-components`** `requiresManualReview: true`
Detecte les mutations de store directes (`.$patch(`, `store.x =`) dans `app/components/`.
Les composants lisent, les actions ecrivent.

## Etapes

### 1. Conventions README

- documenter les regles SOC, Clean Code, SOLID, KISS, YAGNI, SRP dans `app/README.md`
  pour les regles scopees a `app/`
- documenter les regles server dans `server/README.md` pour les regles scopees a
  `server/api/`
- ajouter une section dans le README racine uniquement si une regle couvre l ensemble du
  projet

### 2. Regles YAML

- ajouter chaque regle dans `scripts/ci/app/rules.yaml`
- respecter les champs obligatoires : `name`, `requiresManualReview`, `severity`,
  `description`
- declarer les champs specifiques au moteur de chaque script : `scanDir`, `patterns`,
  `threshold`, `excluded`, etc.

### 3. Scripts CI

- creer un script par regle ou par famille logique selon la complexite
- chaque script utilise `loadValidationRule` depuis `validation-rules.ts`
- les scripts heuristiques affichent les occurrences detectees et laissent la decision
  a la revue manuelle

### 4. Workflow CI/CD

- ajouter les nouveaux checks dans le workflow conventions

## Criteres d acceptation

- chaque regle est documentee dans le README local concerne
- chaque regle est declaree dans `rules.yaml` avec `name` et `requiresManualReview`
- chaque script lit sa configuration depuis le YAML
- les regles `requiresManualReview: false` bloquent le CI en cas de detection
- les regles `requiresManualReview: true` signalent les occurrences sans bloquer
- les tests existants continuent de passer

## Points de vigilance

- Calibrer les seuils (lignes, nombre de champs, nombre de returns) a partir du code
  existant pour eviter un bruit excessif au premier run.
- Les regles heuristiques ne doivent pas bloquer le CI — elles informent.
- Ne pas creer de dependance supplementaire : grep, regex et analyse structurelle suffisent.
