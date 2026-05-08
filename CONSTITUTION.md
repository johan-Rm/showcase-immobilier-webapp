# Constitution Codex

## Preambule

Cette constitution est d application stricte.

Elle definit des principes non negociables qui doivent etre respectes par defaut dans tous les projets, sauf si une constitution locale du projet formule explicitement une regle de plus haute autorite.

Toute instruction, habitude de travail, preference personnelle, skill, prompt ou decision d execution qui contredit cette constitution doit etre ecartee.

## Raison d etre

Ce fichier definit les principes stables qui gouvernent la conception, l implementation, la verification et la livraison des projets accompagnes par Codex.

Il sert de reference de plus haut niveau pour les choix d execution, d architecture et de gouvernance. Les consignes operatoires de `AGENTS.md`, les skills et les documents projet doivent s y conformer.

## Hierarchie d autorite

En cas de conflit, l ordre d autorite est le suivant :

1. La constitution locale du projet si elle existe.
2. Cette constitution globale.
3. Le `AGENTS.md` local du projet si il existe.
4. Le `AGENTS.md` global.
5. Les documents d architecture, de doctrine et de reference du projet.
6. Les skills, prompts et instructions de tache.

## Principes directeurs

- Le besoin reel prime sur la sophistication.
- La clarte, la lisibilite et la predictibilite priment sur l ingeniosite.
- Le diff doit rester minimal et intentionnel.
- Toute solution doit pouvoir etre comprise, testee et maintenue par une equipe.
- Les conventions du projet priment sur les preferences personnelles.

## Qualite et type safety

- Le typage strict est la regle sur les frontieres importantes du systeme.
- Aucune erreur de type, de lint ou de test ne doit etre ignoree sans justification explicite.
- Les contrats entre couches et entre services doivent etre explicites, stables et verifies.
- Les abstractions doivent etre introduites uniquement lorsqu elles reduisent reellement la complexite.

## Securite

- Aucun secret ne doit etre ecrit en clair dans le code, les fixtures, les tests ou la documentation.
- Toute entree utilisateur ou externe doit etre validee aux frontieres appropriees.
- L authentification, l autorisation et les permissions doivent etre centralisees et explicites.
- Les choix de configuration reseau, cookies, headers, CORS, CSRF et XSS doivent etre defensifs par defaut.

## Performance et sobriete

- Une regression de performance est un defaut.
- Les lectures, requetes, appels reseau et traitements inutiles doivent etre evites.
- Les decisions de rendu, de chargement et d acces aux donnees doivent privilegier la sobriete.
- L observabilite utile doit etre preservee sans bruit inutile.

## Tests et verification

- Une fonctionnalite critique non testee est incomplete.
- Les tests doivent couvrir en priorite les contrats, les permissions, les regles metier et les parcours critiques.
- Les criteres d acceptation doivent pouvoir etre relies a des verifications concretes.
- Le code livre doit pouvoir passer les controles automatiques de la stack.

## Contrats et donnees

- Les reponses API doivent etre stables, coherentes et documentees.
- Les erreurs doivent etre normalisees et previsibles.
- Les valeurs metier importantes ne doivent pas dependre de chaines magiques dispersees.
- Les transformations non triviales doivent etre centralisees, explicites et testables.

## Gouvernance de delivery

- Aucun changement significatif ne doit etre engage sans perimetre clair.
- Les changements d API publique, de contrat ou de structure persistante exigent une decision explicite.
- Les refactors hors perimetre doivent etre evites.
- Toute exception a cette constitution doit etre rare, justifiee et tracee.

## Taches

- Toute fonctionnalite non triviale doit etre decrite dans `dev-book/tasks/` avant implementation.
- Chaque tache doit exprimer clairement le besoin, le perimetre, les contraintes, les criteres d acceptation et le plan d execution.
- Aucune implementation significative ne doit etre engagee sans alignement explicite entre la tache, les tests attendus et le perimetre reel du changement.
- Toute modification du perimetre, des contraintes ou des criteres d acceptation doit d abord etre repercutee dans la tache avant adaptation de l implementation.
- Les tests critiques doivent etre derives des criteres d acceptation de la tache.
