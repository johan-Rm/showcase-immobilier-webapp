---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/app/stores/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier `app/stores`

## 1. Rôle et responsabilités

- Gérer l’état global (Pinia) et le partager entre pages/composants.
- Orchestrer les appels aux services métier ; jamais de logique d’UI.
- Centraliser les mutations d’état dérivées des actions utilisateur ou des API.
- Exposer un contrat typé (state, actions, getters) pour l’UI et les composables.
- Rester sérialisable pour le SSR/hydratation : pas d’objets non clonables dans le state.

---

### 🔹 Quand utiliser le Store

- `Partage de données entre plusieurs composants` : Si plusieurs composants de votre application ont besoin d'accéder aux mêmes données, il est préférable d'utiliser le Store pour éviter de passer ces données par des props ou des events entre les composants.

- `Gestion des états complexes` : Si votre application comporte des états complexes ou des logiques métiers (par exemple, une gestion de panier pour un site e-commerce), le Store est la meilleure solution pour organiser et structurer ces données de manière propre et maintenable.

- `Réactivité et synchronisation` : Les données stockées dans le Store sont réactives, ce qui signifie que toute modification est immédiatement reflétée dans l'interface utilisateur. Cela est essentiel pour les applications où l'interface utilisateur doit rester synchronisée avec l'état de l'application.

## 2. Bonnes pratiques

- Un store = un domaine fonctionnel ; éviter les “god stores”.
- Actions orchestrent les services ; pas d’I/O réseau dans les composants/composables.
- State minimal, dérivés via getters ; éviter la duplication de données.
- Manipuler l’état via actions ; isoler les effets (I/O) dans les services.
- Tester les stores en mockant les services ; garder les actions synchrones quand possible.
- Sérialiser ce qui est persisté (pas de refs/composants dans le state) pour éviter les soucis SSR.
- Préférer les setters explicites (`setX`) pour les mutations d’état critiques.
- Dans `app/stores/`, ne pas importer explicitement les APIs déjà auto-importées par Nuxt quand elles sont disponibles. Exemple courant : `defineStore` et les autres stores via leurs `useXxxStore()`.

## 3. Conventions de nommage

- Fichiers en `camelCase.ts` (ex. `useCartStore.ts`).
- Nom de store avec préfixe `use` et suffixe `Store` (`useUserStore`).
- Clés de state/getters/actions en camelCase descriptif.

## 4. Performance

- Ne pas surcharger le state ; privilégier le calcul à la demande via getters.
- Éviter les mutations fréquentes sur de gros objets ; normaliser si nécessaire.
- Déclencher les appels réseau depuis les actions et gérer les erreurs explicitement.
- Utiliser des flags (`loading`, `error`) simples et réinitialiser proprement.

## 5. Structure et organisation

- Racine `app/stores/` : un fichier par store Pinia.
- Les services consommés doivent être importés depuis `services/` (ou `shared/` côté client) sans dépendance au framework.
- Pas d’accès direct aux composables ou à l’UI depuis un store.
- Optionnel : fichier d’index si vous exposez des helpers partagés (facultatif).

---

### 🔹 Architecture d'un module

| Type de Fichier | Description                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| index.js        | Assemble les modules et exporte le Store                                           |
| state.js        | Contient l'état des données                                                        |
| actions.js      | Effectue des opérations et gère la logique métier ; **modifie directement l’état** |
| getters.js      | Obtient un état dérivé des données                                                 |

---

### 🔹 Structure recommandée

```
/stores/
  cart/
    index.ts
    state.ts
    actions.ts
    getters.ts
```

---

### 🔹 Quand découper un module

- Garder un seul fichier tant que le store reste simple et lisible.
- Découper si le store dépasse ~200-300 lignes ou si les responsabilités se multiplient.
- Découper si les getters/actions deviennent complexes ou si les tests gagnent à être isolés.
- Découper si vous voulez réutiliser `state`, `actions` ou `getters` séparément.

---

### 🔹 Fichier : Actions

Dans Pinia, les actions :

- n’utilisent plus `commit()`
- n’ont plus besoin de mutations
- modifient directement le state via `this`
- acceptent des paramètres simples (plus de payload structuré obligatoire)

```js
/**
 * Action Pinia pour effectuer une opération spécifique.
 *
 * @param {any} params1 - Premier paramètre requis.
 * @param {any} params2 - Deuxième paramètre requis.
 * @param {any} params3 - Troisième paramètre requis.
 */
myAction(params1, params2, params3) {
  // Exemple de modification directe du state
  this.items.push(params1)
}
```

---

### 🔹 Fichier : Getters

Les `getters` exposent un état dérivé, déterministe et réutilisable à partir du state brut. Ils permettent de centraliser les transformations, filtrages et enrichissements nécessaires à l’UI sans dupliquer les données.
Quand la transformation devient non triviale, déléguez-la à un service de `transform` basé sur des DTOs stables. Le getter orchestre alors l’appel et reste lisible, testable et prévisible.

```js
getters: {
  affordableElectronics: (state) => {
    return state.products.filter(
      (product) => product.category === 'Electronics' && product.price < 150 && product.inStock,
    )
  }
}
```

## 6. En complément : quand utiliser le Local Storage <a id="local-storage"></a>

> Le Local Storage est une API Web qui permet de stocker des données persistantes directement dans le navigateur de l'utilisateur. Les données stockées restent après fermeture du navigateur.

- `Persistance des données entre les sessions`
  Exemple : préférences utilisateur, dernier onglet, token, etc.
- `Stockage de petites quantités de données`
  5–10 Mo max selon les navigateurs.
- `Données non réactives`
  Si la donnée ne doit pas mettre à jour l’UI en temps réel, le Local Storage est une bonne option.
