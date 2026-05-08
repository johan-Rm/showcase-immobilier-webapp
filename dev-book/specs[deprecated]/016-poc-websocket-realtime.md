# 🎯 Spec : POC – Temps réel via WebSocket

## 🔖 Métadonnées

- **ID** : SPEC-016
- **Statut** : Proposé
- **Décisions structurantes** : Aucune à ce stade. Formaliser une note dédiée si le choix d’une librairie WebSocket spécifique devient structurant.
- **Objectif principal** : Afficher des mises à jour temps réel (ex. compteur de visiteurs) via un client WebSocket.

---

## 1. Description rapide

Mettre en place un client WebSocket qui se connecte à un endpoint de démo, reçoit des messages en continu (ex. nombre de visiteurs) et les affiche avec état de connexion et gestion des erreurs/retries.

---

## 2. User Stories (essentielles)

- **US1 (P1)** : En tant que visiteur, je vois un compteur ou une métrique mise à jour en temps réel via WebSocket.
- **US2 (P1)** : En tant que visiteur, je vois l’état de connexion (connecté/reconnecte/erreur) pour comprendre la disponibilité.
- **US3 (P2)** : En tant que dev, je peux simuler l’endpoint WS localement pour tester sans backend externe.

---

## 3. Critères d’acceptation (succès)

- **CA1** : Une page (ex. `/poc/websocket`) affiche au moins une valeur reçue via WebSocket et mise à jour sans refresh.
- **CA2** : États visibles : “connecting”, “open”, “reconnecting”, “error”, “closed”.
- **CA3** : Reconnexion automatique après déconnexion, avec backoff simple.
- **CA4** : Fallback de données mockées si l’endpoint WS est indisponible.
- **CA5** : Aucune erreur console non gérée.

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Un endpoint WS local ou mockable est disponible pour le POC.
- HYP-002 : Pas de persistance serveur requise, uniquement affichage client.

### Contraintes techniques (TECH)

- TECH-001 : Utiliser l’API WebSocket native (pas de lib lourde) sauf besoin justifié.
- TECH-002 : Gérer ouverture/fermeture proprement (cleanup on unmounted).
- TECH-003 : Pas de dépendance à @nuxt/content ; pure client-side pour ce POC.

---

## 5. Plan d’implémentation (ultra-synthétique)

- Page `/poc/websocket` avec UI simple (badge d’état + valeur en temps réel).
- Composable `useWebSocketDemo` : connect, listen, retry avec backoff, cleanup.
- Mock server simple (script node ou Nitro route) pour générer des messages.
- Fallback : timer local si WS indispo (message d’info dans l’UI).

---

## 6. Tâches à réaliser

- [ ] **T1 – Endpoint** : Créer un mock WS (Nitro ou script node) qui envoie des updates périodiques.
- [ ] **T2 – Client** : Composable WebSocket (connect/retry/cleanup) et page `/poc/websocket`.
- [ ] **T3 – UI** : Affichage valeur + badge d’état + log d’événements récents.
- [ ] **T4 – Fallback** : Basculer sur un timer local en cas d’échec, message utilisateur.
- [ ] **T5 – Vérifs** : Tests manuels déconnexion/reconnexion, absence d’erreurs console.

---

## 7. Notes / Risques

- RISK-001 : Instabilité du mock WS si déployé sans hébergement WS.
- RISK-002 : Boucles de reconnexion agressives si backoff mal configuré.
- RISK-003 : UX confuse si état de connexion n’est pas explicite.

> Formaliser une note de décision dédiée si une librairie WebSocket tierce est retenue ou si la stratégie de reconnexion devient critique.
