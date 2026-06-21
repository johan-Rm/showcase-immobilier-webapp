# 038 — Suppression reelle des medias depuis le dashboard

## Contexte

L onglet media du dashboard permet aujourd hui de **dissocier** une image d un bien, mais
jamais de la **supprimer** reellement.

- `PropertyAssociatedMediaEditor.vue` : le bouton croix appelle `removeIdentifier`, qui retire
  seulement l image de `associatedMedia` du bien.
- `PropertyMediaGallery.vue` : `toggleAssociation` / `dissociate` font la meme chose (Associer /
  Retirer).
- Cote serveur, `server/api/dashboard/media/` n expose que `index.get.ts` (liste) et
  `upload.post.ts` (upload). Aucun endpoint de suppression.

Resultat : une image dissociee reste dans la bibliotheque du projet et ne peut jamais etre
retiree definitivement. La bibliotheque grossit sans moyen de nettoyage.

## Contrat cible

- Le dashboard distingue clairement deux actions :
  - **Retirer** : dissocie l image du bien courant (comportement actuel, inchange).
  - **Supprimer** : retire definitivement l image du projet (BDD + projection content).
- Symfony reste le modele d ecriture durable ; la suppression passe par le BFF puis par l API.
- La projection content est mise a jour de facon coherente apres suppression (cf. tache 037).

## Travaux

1. Ajouter `server/api/dashboard/media/[id].delete.ts` : appel DELETE vers l API Symfony,
   resolution UUID / IRI cote BFF.
2. Retirer le media des projections `content/` des locales activees apres suppression reussie.
3. Ajouter au store metadata une action `removeMediaObject` pour refleter la suppression cote
   client.
4. Ajouter dans `PropertyMediaGallery.vue` une action **Supprimer** distincte de **Retirer**,
   avec confirmation explicite (action irreversible).
5. Garder un resultat explicite si Symfony est a jour mais que la projection content echoue.

## Points de vigilance

- Une image peut etre **associee a plusieurs biens** : avant suppression, avertir ou bloquer si
  elle est encore referencee ailleurs.
- Distinguer visuellement et semantiquement Retirer (dissociation, reversible) de Supprimer
  (definitif) pour eviter toute confusion utilisateur.
- Accessibilite : la confirmation doit etre operable au clavier et annoncee.

## Invariants

- Retirer ne supprime jamais le fichier ni l entree en base.
- Supprimer ne reussit cote client qu apres confirmation serveur.
- La suppression d un media encore reference par un bien est explicitement geree, jamais
  silencieuse.

## Validation

- Une image supprimee disparait de la galerie apres rechargement depuis `content/`.
- La dissociation conserve l image dans la bibliotheque (non regressee).
- La suppression d un media partage est bloquee ou avertie selon la decision retenue.
- Les quality gates du projet passent avant commit.
