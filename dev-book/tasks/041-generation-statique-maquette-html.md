---
status: Todo
dependances: []
doc: docs/3.application/generation-statique.md
---

# 041 — Rendre la génération statique exploitable (maquette HTML de restitution)

- **Créée le** : 2026-09-04.
- **Statut** : ⏳ en cours.
- **Type** : chore — outillage et livrable de restitution.
- **Tests** : `sans objet pour l'essentiel — la preuve attendue est une exécution réelle de
la génération, journal lu, puis l'ouverture des fichiers produits hors serveur. L'étape 2
touche le rendu applicatif et demande une vérification comparative sur le site vivant.`
- **Réf** : `nuxt.config.ts` · `app/app.vue` · `app/components/AppBootShell.vue` ·
  `app/components/AppImage.vue` · `server/routes/themes.css.ts` · `content/es/`.

## Contexte

Un engagement contractuel prévoit la remise, à la demande et sans frais, de la base de données,
des ressources associées et de « la maquette graphique, fournie au format professionnel et/ou
HTML ». Le « et/ou » rend une livraison HTML seule suffisante. Le besoin est une maquette
graphique consultable : aucune navigation ni fonctionnalité attendue, mais les pages doivent
s'ouvrir dans un navigateur sans serveur et être visuellement conformes.

Six essais de génération menés le 2026-09-04 (branche `chore/generation-statique`) ont établi :

1. **Le pré-rendu interrompt le build.** `nuxt generate` et `nuxt build --prerender` s'arrêtent
   après avoir écrit 45 pages, toujours après l'adresse `/contact`, sans jamais construire la
   sortie finale : ni `_nuxt/`, ni `images/`, ni `fonts/`. Reproduit sous Bun et sous Node, en
   tâche de fond et au premier plan. Le processus rend un code 0 trompeur — défaut connu de
   l'outil, qui ignore le drapeau d'échec (nuxt#24228). `nuxt build` seul, lui, est complet.
2. **Le contenu se charge bien au rendu serveur** pour `fr` et `en` ; seul `es` échoue, son
   dossier `content/es/metadata/` étant vide.
3. **Une seule vue sur six est rendue.** La page fabriquée ne contient qu'un `data-screen`
   (`screen-landing`) et 107 caractères de texte visible.
4. **Les couleurs ne sont pas résolues** : `themes.css` est calculé par une route serveur
   absente au build ; toutes les variables sortent vides.
5. **Les images passent par `/_ipx/`**, transformateur serveur inexistant en statique.
6. **Les chemins sont absolus**, donc inopérants à l'ouverture directe d'un fichier.

## Étapes

1. Débloquer la fin du build — écarter `/contact` du pré-rendu, sinon isoler par dichotomie.
   Preuve : `Build complete!` et présence de `_nuxt/`, `images/`, `fonts/`.
2. Faire entrer toutes les vues dans le HTML fabriqué. Preuve : autant de `data-screen` que de
   vues réelles ; texte visible à sa longueur éditoriale. Seule étape touchant le site vivant.
3. Figer les couleurs en fichier au build. Preuve : variables portant une couleur réelle.
4. Rendre les images autonomes via `AppImage.vue`. Preuve : plus aucune adresse `/_ipx/`.
5. Trancher le cas de l'espagnol — compléter ou sortir du périmètre. Décision éditoriale.
   Preuve : zéro erreur de contenu au journal.
6. Post-traitement d'autonomie : chemins relatifs, retrait des scripts. Preuve : ouverture d'un
   fichier au double-clic, hors serveur, avec habillage et images.
7. Vérification comparative page à page avec le site vivant.

## Hors périmètre

- Export de base filtré par projet — la base est mutualisée, un export brut exposerait les
  données d'autres clients. Chantier côté Symfony, préalable à toute restitution de données.
- Authentification de service Symfony (`token absent`) — n'empêche pas la fabrication.
