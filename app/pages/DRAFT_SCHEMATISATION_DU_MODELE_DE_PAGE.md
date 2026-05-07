# 🧩 1️⃣ Schéma — TEMPLATE (Modèle d’Expérience)

Un **Template** n’est pas une simple page.
C’est un **modèle d’expérience** qui définit la logique globale d’un espace.

```
TEMPLATE (Modèle d’Expérience)
│
├── Modèle narratif
│   ├── Défilement vertical
│   ├── Rail horizontal
│   ├── Sections à snap
│   └── Exploration libre
│
├── Stratégie de structure
│   ├── Type de navigation
│   ├── Éléments persistants
│   └── Transitions globales
│
├── Orchestration des écrans
│   ├── Ordre d’apparition
│   ├── Logique d’entrée / sortie
│   └── Règles d’animation
│
└── Intégration au Design System
    ├── Tokens (couleurs, typos, espacements)
    ├── Composants disponibles
    └── Principes de motion
```

👉 Le Template définit **comment l’expérience fonctionne**, pas seulement comment elle s’affiche.

---

# 🏗 2️⃣ Schéma — LAYOUT (Cadre Structurel)

Le **Layout** est le cadre technique et structurel d’un espace.

```
LAYOUT (Cadre Structurel)
│
├── Zones persistantes
│   ├── En-tête
│   ├── Pied de page
│   ├── Menu latéral / navigation
│   └── Couches overlay
│
├── Système de navigation
│   ├── Navigation principale
│   ├── Navigation contextuelle
│   └── Suivi de progression
│
├── Couche d’interaction
│   ├── Modales
│   ├── Popups
│   └── Gestion des transitions
│
└── Conteneur principal
    └── Zone d’injection des écrans
```

👉 Le Layout organise l’espace et garantit la cohérence structurelle.

---

# 🖥 3️⃣ Schéma — SCREEN (Unité d’Intention)

Un **Screen** est une unité immersive en plein écran.
Il correspond à un moment précis dans le parcours utilisateur.

```
SCREEN (Écran)
│
├── Intention
│   ├── Informer
│   ├── Inspirer
│   ├── Présenter
│   └── Convertir
│
├── Structure interne
│   ├── Mise en page centrée
│   ├── Split (image / texte)
│   ├── Grille
│   └── Mise en avant média
│
├── Cycle de vie
│   ├── Entrée (animation)
│   ├── État actif
│   └── Sortie
│
└── Blocs de section
    ├── Hero
    ├── Galerie
    ├── Bloc contenu
    └── Appel à action
```

👉 Un Screen est autonome, mais intégré dans une orchestration globale.

---

# 🧱 4️⃣ Schéma — COMPOSANTS

Les **Composants** construisent les écrans.

```
COMPOSANT
│
├── Structure logique
│   ├── Données
│   ├── États
│   └── Propriétés (props)
│
├── Couche visuelle
│   ├── Couleurs
│   ├── Typographie
│   └── Espacements
│
└── Sous-éléments
    ├── Bouton
    ├── Icône
    ├── Image
    └── Champ de formulaire
```

👉 On peut les classer en :

- Composants de section (blocs structurants)
- Éléments d’interface (unités atomiques)

---

# 🧠 Vue hiérarchique complète

Pour bien visualiser la logique d’ensemble :

```
TEMPLATE
   └── LAYOUT
         └── SCREENS
               └── COMPOSANTS
                     └── ÉLÉMENTS UI
```

On descend :

- de l’expérience globale
- vers la structure
- vers l’intention
- vers la matérialisation visuelle

---
