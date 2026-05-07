# Documentation Governance

- Role: definir la hierarchie documentaire du projet et les regles de redaction, de non-duplication et de liens croises.
- Audience: mainteneurs, developpeurs, reviewers et agents IA qui lisent ou modifient le repository.
- Scope: documents racine, `docs/`, `./**/README.md`, commentaires et JSDoc.
- Does not cover: architecture applicative detaillee, perimetres fonctionnels de specs, details d implementation d une feature.
- Source of truth: ce document pour la gouvernance documentaire ; `docs/2.architecture/` pour l architecture globale du systeme.

## 1. Ordre de lecture recommande

Lire les documents dans cet ordre :

1. `README.md`
2. `DOCS_GUIDELINES.md`
3. `docs/2.architecture/`
4. `docs/`
5. `./**/README.md`
6. commentaires et JSDoc dans le code

## 2. Hierarchie documentaire

Ordre d autorite documentaire :

1. `docs/2.architecture/`
2. `docs/`
3. `./**/README.md`
4. commentaires et JSDoc

`README.md` est un point d entree. Il oriente la lecture, mais n a pas vocation a devenir la source de verite detaillee.

## 3. Role de chaque niveau

### `README.md`

Rôle :

- presenter le projet
- expliquer comment le lancer
- indiquer les portes d entree documentaires

Doit contenir :

- presentation courte du projet
- setup minimum
- quality gates
- carte rapide des documents importants

Ne doit pas contenir :

- toute l architecture detaillee
- toutes les conventions transverses
- la documentation exhaustive des sous-systemes

### `docs/`

Role :

- porter la documentation transverse de reference
- expliciter les conventions durables par theme

Doit contenir :

- guides et conventions transverses
- architecture globale du systeme
- documentation stable par sujet
- cadrages qui concernent plusieurs dossiers

Ne doit pas contenir :

- duplication des README locaux
- plan d execution d une spec

### `./**/README.md`

Role :

- documenter un dossier precis au plus pres du code

Doit contenir :

- role du dossier
- points d entree
- conventions locales
- pieges, limites et usages courants

Ne doit pas contenir :

- reexplication de l architecture globale
- recopie de conventions transverses deja portees dans `docs/`

### Commentaires et JSDoc

Role :

- documenter l intention locale du code
- expliquer les comportements non evidents
- relier le code a sa documentation de reference

Doivent contenir :

- une explication locale courte
- les contraintes ou invariants utiles a la comprehension
- un ou plusieurs `@see` vers la documentation du repo quand la cible est publique ou structurante

Ne doivent pas contenir :

- une documentation systeme longue
- une duplication complete de `docs/` ou des README

## 4. Regle de propriete documentaire

Chaque information doit avoir un proprietaire principal.

Exemples :

- architecture des couches -> `docs/2.architecture/`
- conventions SEO, i18n, design system, schemas -> `docs/`
- conventions propres a un dossier -> `README.md` du dossier
- raison d un guard, d un mapping ou d un choix d implementation local -> commentaire ou JSDoc

Les autres documents :

- referencent la source de verite
- la resument en une phrase si necessaire
- ne la recopient pas integralement

## 5. Regle de non-duplication

Quand une information existe deja a un niveau superieur :

- ne pas la recopier integralement a un niveau inferieur
- ajouter un lien vers la source de verite
- ne documenter localement que l adaptation ou la declinaison utile

Formulations recommandees :

- `Voir docs/2.architecture/ pour le modele global.`
- `Voir docs/... pour la convention transverse.`
- `Ce README ne couvre que les regles locales du dossier.`

## 6. Liens croises obligatoires

### `README.md` doit pointer vers :

- `DOCS_GUIDELINES.md`
- les sections majeures de `docs/`

### `docs/` doit pointer vers :

- `docs/2.architecture/` quand une convention depend d un invariant global
- les `README` locaux quand un theme a une declinaison de dossier

### `./**/README.md` doivent pointer vers :

- `docs/2.architecture/`
- la section `docs/` transverse correspondante
- les fichiers majeurs du dossier si necessaire

### La JSDoc doit pointer vers :

- `docs/` si la regle est transverse
- un `README.md` local si la regle est propre au dossier
- `docs/2.architecture/` si elle depend d un invariant structurel

## 7. Regle JSDoc

Toute JSDoc sur une API publique, semi-publique ou structurante doit inclure au moins un `@see` vers une documentation du repository.

Format minimal recommande :

```ts
/**
 * Resume court du role.
 *
 * @see ../README.md
 * @see ../../docs/3.application/5.composables-and-stores.md
 */
```

Regle de choix :

- convention transverse -> lien vers `docs/`
- convention locale de dossier -> lien vers `README.md`
- invariant global -> lien vers `docs/2.architecture/`

## 8. Test de placement

Avant d ecrire un document, poser la question a laquelle il doit repondre :

- `Comment demarrer dans le projet ?` -> `README.md`
- `Comment le systeme est structure ?` -> `docs/2.architecture/`
- `Quelle convention transverse s applique ?` -> `docs/`
- `Comment fonctionne ce dossier ?` -> `README.md` du dossier
- `Pourquoi ce code agit ainsi ?` -> commentaire ou JSDoc

## 9. Regles editoriales

- un document = une responsabilite principale
- privilegier des documents courts et cibles
- utiliser des titres explicites
- preferer un lien vers la source de verite a une recopie
- mettre a jour la documentation impactee dans le meme scope que le code

## 10. Application au projet

Repartition cible :

- `README.md`
  - entree projet, setup, quality gates, carte documentaire
- `DOCS_GUIDELINES.md`
  - hierarchie documentaire, regles de redaction, liens croises, place de la JSDoc
- `docs/`
  - documentation transverse de reference par sujet, y compris l architecture globale
- `./**/README.md`
  - documentation locale au plus pres du code
- JSDoc et commentaires
  - contexte local et liens vers la documentation ecrite
