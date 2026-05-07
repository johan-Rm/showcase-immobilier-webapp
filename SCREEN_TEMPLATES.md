# SCREEN_TEMPLATES

## Template 1

| Contexte         | Breakpoint / orientation    | Structure globale       | Zone image             | Zone contenu          | Grille des cartes              |
| ---------------- | --------------------------- | ----------------------- | ---------------------- | --------------------- | ------------------------------ |
| Mobile portrait  | `< 640px portrait`          | `1 colonne`, `1 ligne`  | masquee                | seule, pleine surface | `1 colonne`                    |
| Mobile landscape | `< 850px landscape`         | `1 colonne`, `1 ligne`  | masquee                | seule, pleine surface | `2 colonnes`                   |
| Tablet portrait  | `640px -> 1023px portrait`  | `1 colonne`, `2 lignes` | visible en haut, `45%` | en bas, `1fr`         | `2 colonnes`                   |
| Tablet landscape | `850px -> 1023px landscape` | `2 colonnes`, `67/33`   | a droite               | a gauche              | `2 colonnes`                   |
| Desktop          | `>= 1024px`                 | `2 colonnes`, `67/33`   | a droite               | a gauche              | `2 colonnes`                   |
| Desktop wide     | `>= 1280px`                 | `2 colonnes`, `67/33`   | a droite               | a gauche              | `2 colonnes`, gaps plus larges |

## Template 2

| Contexte         | Breakpoint / orientation    | Structure globale       | Zone image             | Zone contenu          | Grille des cartes |
| ---------------- | --------------------------- | ----------------------- | ---------------------- | --------------------- | ----------------- |
| Mobile portrait  | `< 640px portrait`          | `1 colonne`, `1 ligne`  | non chargee            | seule, pleine surface | a definir         |
| Mobile landscape | `< 850px landscape`         | `1 colonne`, `1 ligne`  | non chargee            | seule, pleine surface | a definir         |
| Tablet portrait  | `640px -> 1023px portrait`  | `1 colonne`, `2 lignes` | visible en haut, `45%` | en bas, `1fr`         | a definir         |
| Tablet landscape | `850px -> 1023px landscape` | `2 colonnes`            | a droite               | a gauche              | a definir         |
| Desktop          | `>= 1024px`                 | `2 colonnes`            | a droite               | a gauche              | a definir         |
| Desktop wide     | `>= 1280px`                 | `2 colonnes`            | a droite               | a gauche              | a definir         |
