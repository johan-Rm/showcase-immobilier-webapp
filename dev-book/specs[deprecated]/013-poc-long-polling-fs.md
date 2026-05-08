# 🎯 Spec : POC – Long polling sans @nuxt/content (FS brut)

## 🔖 Métadonnées

- **ID** : SPEC-013
- **Statut** : Proposé
- **Décisions structurantes** : Aucune à ce stade.
- **Objectif principal** : Lire `/content/products/*.md` (front matter YAML) depuis le filesystem brut, via long polling côté serveur ou client, sans utiliser `@nuxt/content`.

---

## 1. Description rapide

Mettre en place une route ou un composable qui lit périodiquement les fichiers markdown de `/content/products`, parse le front matter YAML et retourne les données produits, sans dépendre de `@nuxt/content`. Afficher la liste et refléter les changements lors du polling.

---

## 2. User Stories (essentielles)

- **US1 (P1)** : En tant que visiteur, je vois la liste des produits issue de `/content/products/*.md` et elle se rafraîchit périodiquement.
- **US2 (P2)** : En tant que dev, je peux forcer un rafraîchissement et voir les nouvelles données sans redémarrer le serveur.
- **US3 (P2)** : En tant que dev, je peux tracer les lectures FS pour diagnostiquer la charge ou les erreurs.

---

## 3. Critères d’acceptation (succès)

- **CA1** : Une page (ex. `/poc/long-polling-fs`) affiche les produits provenant du parsing des fichiers MD (front matter).
- **CA2** : Le polling se fait sans `@nuxt/content` (lecture FS + parser YAML/front matter).
- **CA3** : Intervalle de polling configurable, arrêt propre (cleanup) et pas de fuite de timers.
- **CA4** : Gestion d’erreurs lisible (fichier manquant, YAML invalide) sans crash ni erreur console non gérée.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Les fichiers `/content/products/*.md` existent et contiennent un front matter YAML valide.
- HYP-002 : Accès FS autorisé côté serveur (Nitro) pour la lecture.

### Contraintes techniques (TECH)

- TECH-001 : Interdiction d’utiliser `@nuxt/content` pour ce POC.
- TECH-002 : Parser front matter (ex. `gray-matter` ou équivalent léger).
- TECH-003 : Nettoyage des timers ou interval côté client/serveur.

---

## 5. Plan d’implémentation (ultra-synthétique)

- Créer une API Nitro `/api/poc/products-fs` qui lit/parse les fichiers MD et renvoie JSON.
- Page `/poc/long-polling-fs` qui appelle périodiquement l’API (setInterval/composable) et affiche la liste.
- Configurable : intervalle, max retries, logs d’erreur.
- Tests manuels en modifiant un fichier MD et en observant la mise à jour.

---

## 6. Tâches à réaliser

- [ ] **T1 – Parser** : Ajouter un parser front matter (gray-matter) côté server.
- [ ] **T2 – API** : Route Nitro pour lire `/content/products/*.md` et retourner les métadonnées/contenu.
- [ ] **T3 – Client** : Page `/poc/long-polling-fs` + composable de polling configurable.
- [ ] **T4 – Erreurs/Cleanup** : Gérer erreurs YAML/IO, arrêter le polling au unmounted.
- [ ] **T5 – Vérifs** : Tester mise à jour après édition d’un MD, console clean.

---

## 7. Notes / Risques

- RISK-001 : Charge FS si intervalle trop court.
- RISK-002 : YAML invalide bloquant la liste (prévoir skip + log).
- RISK-003 : Polling client pouvant créer des requêtes inutiles (penser backoff).

> Formaliser une note de décision dédiée si un autre mécanisme (watcher FS) est préféré ou si un parser différent est adopté.
