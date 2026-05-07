## 🧩 Définition d’un Modèle de Page (Template)

<!-- on pourrait bien modifier le mot "Page" par "Espace" -->

Dans le cadre du projet **Modern Website**, un **modèle de page** (ou _Template_) représente la structure de base d’une page web.
Chaque modèle détermine **l’organisation visuelle**, **les comportements interactifs** et **les composants réutilisables** qui constituent une expérience cohérente et immersive en **plein écran (full screen)**.

---

### **1. Layout**

<!-- le terme "Layout" pourrait lui aussi etre changer par "Espace" justement? -->

Le **layout** définit les **éléments globaux** et les **fonctionnalités structurelles** propres à une page donnée.
Il agit comme le cadre général du template.

**Exemples d’éléments inclus :**

- Navigation principale ou menu latéral (visible ou caché)
- En-tête / pied de page persistants
- Popups, modales, overlays
- Zones de contenu dynamiques ou interactives

---

### **2. Screens**

<!-- chaque screen peux etre composer d'un layout réutilisable aussi -->

Chaque modèle de page est composé **d’un ou plusieurs _screens_**.
Un **screen** correspond à **un affichage en plein écran**, représentant une section indépendante de la page.

**Caractéristiques :**

- Transition fluide entre les screens (scroll, swipe, fade, etc.)
- Contenu centré sur une intention précise (ex : accueil, présentation, galerie, contact)
- Adapté au format responsive tout en conservant la logique full screen

---

### **3. Components / UI Elements**

Chaque **screen** est construit à partir de **components**, qui se répartissent en deux catégories :

- **Components de section** : blocs structurants (ex : hero, liste de produits, témoignages)
- **UI Elements** : éléments d’interface plus fins (ex : boutons, icônes, sliders, formulaires)

Ces composants sont **réutilisables et modulaires**, afin d’assurer la cohérence du design system et la maintenance du site.
