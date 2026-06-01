---
status: À faire
source: analyse i18n + demande switcher pour valider le système de traduction
---

# 024 Navigation — Switcher de langue

## Intention

Le système i18n est en place (`@nuxtjs/i18n`, strategy `prefix`, locales fr / en / es,
middleware global) mais aucun composant ne permet à l'utilisateur de changer de langue
manuellement. Sans switcher visible, il est impossible de valider que :

- le changement d'URL fonctionne (`/fr/contact` → `/en/contact`)
- la locale active est bien propagée dans `useLang`
- les clés de traduction se substituent correctement via `t()`

Cette task crée un composant `NavigationLangSwitcher.vue`, le câble dans le layout et
le menu principal, et pose les fichiers de messages minimaux pour rendre `t()` testable.

## Contexte technique

### Ce qui existe

- `shared/i18n/config.ts` : `AVAILABLES_LOCALES` avec `code`, `flag`, `name`
- `app/composables/useLang.ts` : expose `localeSetting`, `availableLocales`, `t`
- `@nuxtjs/i18n` fournit `useSwitchLocalePath()` et `useLocalePath()` (auto-importés)
- Alias `@locales` → `i18n/locales/` déclaré dans `nuxt.config.ts` mais le dossier est absent

### Ce qui manque

- Aucun fichier de messages (`fr.json`, `en.json`, `es.json`) → `t()` retourne la clé brute
- `langDir` absent dans `nuxt.config.ts` → les messages ne sont pas chargés
- Aucun composant de sélection de locale

## Périmètre

### 1. Fichiers de messages minimaux

Créer `i18n/locales/fr.json`, `i18n/locales/en.json`, `i18n/locales/es.json` avec un
namespace `nav` pour tester `t()` :

```json
// fr.json
{
  "nav": {
    "switchLang": "Changer de langue",
    "currentLang": "Langue actuelle : {lang}"
  }
}
```

```json
// en.json
{
  "nav": {
    "switchLang": "Switch language",
    "currentLang": "Current language: {lang}"
  }
}
```

```json
// es.json
{
  "nav": {
    "switchLang": "Cambiar idioma",
    "currentLang": "Idioma actual: {lang}"
  }
}
```

### 2. Activation du `langDir` dans `nuxt.config.ts`

Ajouter dans la section `i18n` :

```ts
langDir: 'i18n/locales',
lazy: true,
```

### 3. Composant `NavigationLangSwitcher.vue`

Créer `app/components/navigation/LangSwitcher.vue`.

Comportement :

- affiche les 3 locales sous forme de codes courts (`FR`, `EN`, `ES`) ou d'emojis drapeaux
- la locale active est mise en avant visuellement (opacité ou couleur)
- chaque locale inactive est un `NuxtLink` vers `switchLocalePath(code)` — navigation SSR-safe
- la locale active n'est pas un lien (pas de navigation inutile)
- accessible : `aria-label` sur le nav, `aria-current="true"` sur la locale active
- SSR-safe : pas de logique `window` dans `<script setup>` (uniquement dans les hooks clients)

Exemple de structure :

```html
<nav aria-label="t('nav.switchLang')">
  <ul class="flex gap-2">
    <li v-for="locale in availableLocales">
      <NuxtLink v-if="locale.code !== currentLocale" :to="switchLocalePath(locale.code)">
        {{ locale.flag }} {{ locale.code.toUpperCase() }}
      </NuxtLink>
      <span v-else aria-current="true">{{ locale.flag }} {{ locale.code.toUpperCase() }}</span>
    </li>
  </ul>
</nav>
```

Style : petit, discret, sobre — correspondre au style du site (texte blanc ou foreground,
uppercase, tracking, taille `xs` à `sm`).

### 4. Intégration dans le layout `default.vue`

Ajouter `<LazyNavigationLangSwitcher />` dans la zone bas-gauche du layout, en miroir de
`NavigationSocialNetwork` en bas-droite :

```html
<!-- layout default.vue -->
<div class="absolute bottom-4 left-4 z-50">
  <LazyNavigationLangSwitcher />
</div>
```

### 5. Intégration dans `NavigationMain.vue` (menu principal)

Ajouter le switcher en bas du panneau de navigation foncé (`bg-foreground`), sous la liste
des liens secondaires. Cela rend la fonctionnalité accessible même sur mobile où le bas du
layout peut être caché.

## Hors périmètre

- traduction complète de tous les textes du site
- détection automatique de la langue navigateur (déjà configurée via `detectBrowserLanguage`)
- sélecteur déroulant avec noms complets des langues
- persistance de la préférence dans un store Pinia

## Critères d'acceptance

- le switcher est visible sur toutes les pages du layout `default`
- cliquer sur `EN` depuis `/fr/contact` navigue vers `/en/contact`
- cliquer sur `ES` depuis `/en/` navigue vers `/es/`
- la locale active est clairement distinguée des autres
- `t('nav.switchLang')` retourne la chaîne traduite dans la langue courante (pas la clé brute)
- le composant est SSR-safe (pas d'erreur d'hydratation en console)
- navigation clavier et aria correct

## Dépendances

- aucune tâche préalable requise
- `@nuxtjs/i18n` déjà installé et configuré
