---
blueprint_source: /app/docs/blueprints/modern-webapp-nuxt/directory-structure/app/assets/README.md
blueprint_copied_at: 2026-01-22T13:03:48+00:00
---

# Dossier `app/assets`

## 1. Rôle et responsabilités

- Héberger les assets traités par l’outillage de build (Vite/Nuxt).
- Contenir les styles globaux (CSS/SCSS) et les images transformées.
- Servir de source pour les imports bundlés (fingerprinting, optimisation).

---

## 2. Bonnes pratiques

- Placer ici ce qui doit être transformé/optimisé ; sinon utiliser `public/`.
- Organiser par type (styles, images) et éviter les doublons.
- Préférer des assets légers/optimisés pour limiter la taille du bundle.

## 3. Conventions de nommage

- Fichiers en kebab-case (`main.scss`, `brand-colors.scss`).
- Images avec nom explicite et suffixe densité si besoin (`logo@2x.png`).

## 4. Performance

- Limiter le poids des images (SVG privilégié, compression).
- Grouper les imports SCSS et utiliser des variables/mixins partagés.
- Nettoyer les assets non utilisés pour éviter du bundle inutile.

## 5. Structure et organisation

- `app/assets/scss/` : styles globaux, variables, mixins.
- `app/assets/images/` : visuels nécessitant transformation/bundling.
- Pour des fichiers servis bruts et stables, préférer `public/`.

---

### Ex. : Structure de template

```bash
app/assets/
├─ scss/
│  ├─ main.scss
│  └─ _variables.scss
└─ images/
   └─ logo.svg
```
