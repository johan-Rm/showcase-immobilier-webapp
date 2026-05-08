# 🎯 Spec : POC – Notifications push

## 🔖 Métadonnées

- **ID** : SPEC-015
- **Statut** : Proposé
- **Décisions structurantes** : Aucune à ce stade. Formaliser une note dédiée si le choix d’un provider push devient structurant.
- **Objectif principal** : Enregistrer un service worker, demander la permission push et afficher la subscription Push API pour un POC de notifications.

---

## 1. Description rapide

Mettre en place une page de démo qui enregistre un service worker dédié aux notifications, demande la permission push à l’utilisateur, récupère et affiche l’objet de subscription (endpoint, keys) et gère les refus/erreurs.

---

## 2. User Stories (essentielles)

- **US1 (P1)** : En tant que visiteur, je peux autoriser ou refuser les notifications push et voir l’état actuel.
- **US2 (P2)** : En tant que dev, je vois la subscription (endpoint + keys) après acceptation pour la réutiliser côté serveur.
- **US3 (P2)** : En tant que dev, je peux simuler l’envoi d’une notification locale (mock) pour valider le flux.

---

## 3. Critères d’acceptation (succès)

- **CA1** : Une page (ex. `/poc/push`) propose le flux complet : register SW, demander permission, obtenir subscription, afficher l’endpoint et les clés.
- **CA2** : Gestion des refus/erreurs : message clair, aucune erreur console non gérée.
- **CA3** : Option pour simuler une notification locale (ex. `showNotification`) si le navigateur le supporte.
- **CA4** : Nettoyage : désenregistrer le SW ou annuler la subscription via un bouton (si supporté).

---

## 4. Hypothèses & Contraintes

### Hypothèses (HYP)

- HYP-001 : Le navigateur supporte Service Worker + Push API.
- HYP-002 : Une clé VAPID peut être fournie pour la subscription (même statique pour le POC).

### Contraintes techniques (TECH)

- TECH-001 : Enregistrer un SW dédié aux notifications (pas couplé à d’autres logiques).
- TECH-002 : Gérer les permissions (default/denied/granted) avec UI explicite.
- TECH-003 : Pas d’envoi réel serveur obligatoire pour le POC, mais affichage clair de ce qui manque (ex. backend push).

---

## 5. Plan d’implémentation (ultra-synthétique)

- Service worker `public/sw-push.js` (register/unregister).
- Page `/poc/push` avec boutons : register, request permission, subscribe, unsubscribe, simulate notification.
- Stockage en mémoire/locale de la subscription et affichage JSON.
- Afficher les limitations (ex. besoin d’un backend pour envoyer une vraie notif).

---

## 6. Tâches à réaliser

- [ ] **T1 – SW** : Créer le service worker push (register/unregister, showNotification mock).
- [ ] **T2 – UI** : Page `/poc/push` avec flux complet permission -> subscription -> affichage endpoints/keys.
- [ ] **T3 – Subscription** : Gestion VAPID key statique (si nécessaire) et unsubscribe.
- [ ] **T4 – Simulation** : Bouton pour déclencher `showNotification` localement (si supporté).
- [ ] **T5 – Vérifs** : Cas refus/erreur, logs propres, mention des prérequis (HTTPS/service worker scope).

---

## 7. Notes / Risques

- RISK-001 : Support navigateur limité (safari/desktop).
- RISK-002 : Besoin d’HTTPS pour les SW/push (sauf localhost).
- RISK-003 : Sans backend push, la démo reste locale (bien le signaler).

> Formaliser une note de décision dédiée si un provider push ou une stratégie clé est adoptée.
