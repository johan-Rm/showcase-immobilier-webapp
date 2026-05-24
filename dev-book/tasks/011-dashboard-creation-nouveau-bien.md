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
le flux UX de creation : formulaire vide, validation, slug auto-genere, creation
en BDD via Symfony et generation du fichier Markdown initial.

## Perimetre pressenti

- bouton "Nouveau bien" dans la sidebar ou la topbar dashboard
- formulaire de creation avec champs obligatoires minimaux :
  - identifier (genere ou saisi manuellement)
  - name
  - category (select parmi les codes disponibles)
  - realEstateListing
  - place
- slug auto-genere depuis le name + identifier
- POST vers Symfony via la route Nitro existante (circuit task 008)
- creation du fichier Markdown initial (circuit task 009)
- redirection vers le bien cree dans l editeur

## Hors perimetre

- validation metier avancee (doublons identifier, regles metier complexes)
- formulaire complet (l editeur existant prend le relai apres creation)
- creation de biens en masse

## Points a affiner

- identifier : genere automatiquement ou saisi manuellement ?
- quels champs sont vraiment obligatoires pour un POST valide cote Symfony ?
- comportement si l identifier existe deja en BDD
