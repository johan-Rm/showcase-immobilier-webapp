# Dossier `components`

## Role et responsabilites

- `app/components/` porte l affichage et la composition visuelle locale.
- Les composants consomment des donnees deja preparees par les pages, composables ou stores.
- Les composants de ce projet sont organises par responsabilite visuelle : `screen/`, `navigation/`, `Markdown/`, `Logo/`, `Toggle/`, `form/`, etc.

Voir `docs/2.architecture/1.application-architecture.md` pour le partage global des couches.
Voir `docs/2.architecture/3.page-layout-screen-model.md` pour le modele `page -> layout -> screen -> component`.
Voir `docs/2.architecture/6.script-setup-standard.md` pour la structure recommandee des fichiers Vue.

## Conventions locales

- `screen/` contient les sections editoriales ou plein viewport assemblees par les pages.
- Les composants hors `screen/` restent des briques de presentation reutilisables ou des fragments d interface.
- Un composant n appelle pas directement un loader de contenu si un composable ou un store porte deja cette responsabilite.
- Les composants adresses par une page editoriale doivent accepter un contrat de donnees stable plutot que reparsing le contenu localement.

## Points d entree utiles

- `screen/` : sections principales des routes editoriales
- `navigation/` : menus, quick actions, liens de parcours
- `Markdown/` : rendu MDC et panneaux editoriaux
- `form/` : formulaires UI

## Points de vigilance

- garder les composants SSR-safe
- limiter la logique metier dans l affichage
- preserver accessibilite clavier, labels, alt et semantique
- ne pas dupliquer la logique de resolution des links, slugs ou screens deja centralisee ailleurs
