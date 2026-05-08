# Spec : Remediation globale prettier et lint

## Metadonnees

- ID : SPEC-019
- Statut : Propose
- Objectif principal : remettre le repository dans un etat propre vis-a-vis de Prettier et d ESLint, avec un diff maitrise, verifiable et sans regression fonctionnelle

---

## Description rapide

Le projet dispose deja d un socle de verification (`lint:check`, `format:check`, `type-check`, `quality:check`) et de commandes de correction automatique (`lint:fix`, `format:fix`, `quality:fix`).

Le besoin porte ici sur un chantier transverse de remise en conformite du code existant a l echelle du repository, afin de :

- supprimer les ecarts de formatage accumules
- corriger les violations lint fixables automatiquement ou localement
- retrouver un socle de qualite stable pour les prochains chantiers
- reduire le bruit des futurs diffs et reviews

Cette spec ne redefinit pas le tooling : elle cadre un passage global de correction sur l existant.

---

## Probleme ou besoin observe

Le repository est outille pour controler le formatage et le lint, mais un chantier de rattrapage global reste necessaire pour fiabiliser la base courante.

Sans ce passage :

- les quality gates peuvent rester rouges ou fragiles selon les zones du code touchees
- les prochains changements melangent corrections de fond et bruit de formatage
- les reviews perdent en lisibilite
- le risque de corriger a la volée des problemes transverses augmente a chaque feature

---

## Perimetre

Dans le scope de cette spec :

- executer un formatage global du repository avec la configuration Prettier en place
- corriger les erreurs ESLint fixables automatiquement sur l ensemble du projet
- traiter manuellement les erreurs lint residuelles necessaires pour retrouver un etat propre
- verifier que les fichiers generes, de build ou hors perimetre sont correctement exclus si besoin
- mettre a jour la documentation impactee si une commande, une consigne ou un perimetre d application doit etre clarifie
- valider le resultat avec les quality gates applicables

Hors scope :

- refactor d architecture non impose par un probleme lint ou format
- changement fonctionnel produit non requis pour passer les quality gates
- ajout de nouvelles dependances sauf blocage outillage documente
- redefinition du style guide du projet

---

## Contraintes

- conserver un diff minimal et intentionnel malgre le caractere transverse du chantier
- rester SSR-safe et ne pas introduire de changement de comportement implicite
- ne pas modifier manuellement les artefacts generes qui doivent l etre par hook ou build
- ne pas masquer une erreur reelle par une desactivation de regle sans justification explicite
- limiter les corrections manuelles aux cas necessaires pour faire passer le lint
- maintenir la lisibilite editoriale, l accessibilite et la structure semantique des templates touches

---

## Criteres d acceptation

- `bun run format:check` passe a l echelle du repository
- `bun run lint:check` passe sans warning ni erreur
- `bun run type-check` reste vert apres les corrections lint et format
- les corrections manuelles residuelles restent locales, lisibles et sans refactor parasite
- aucun `console.log` de production, `any` injustifie ou desactivation de regle opportuniste n est introduit
- la documentation impactee reste alignee avec les commandes et le perimetre reel du chantier

---

## Plan d execution utile

1. etablir l etat initial :
   - executer `bun run format:check`
   - executer `bun run lint:check`
   - relever les familles d erreurs et identifier ce qui est auto-fixable

2. corriger automatiquement le plus gros du diff :
   - executer `bun run format:fix`
   - executer `bun run lint:fix`
   - recontroler les erreurs restantes

3. traiter les residus manuels :
   - corriger les cas non auto-fixables fichier par fichier
   - verifier les zones sensibles SSR, typage, accessibilite et templates Vue

4. valider et cadrer le resultat :
   - executer `bun run quality:check`
   - mettre a jour la documentation utile si une regle ou un perimetre devait etre clarifie
   - preparer un diff relisible pour review

---

## Points de vigilance

- risque de diff massif sur les fichiers Vue, config et documentation
- risque de toucher des fichiers generes, snapshots ou artefacts qui devraient plutot etre ignores
- risque de corrections lint qui changent subtilement un comportement si elles sont appliquees sans relecture
- risque de reveiller des erreurs TypeScript apres nettoyage d imports ou resserrage de types
- risque de conflits de merge eleves si le chantier reste ouvert trop longtemps
