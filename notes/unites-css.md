# Unités CSS — rappel

## Absolues

- **`px`** — pixel fixe, ne bouge jamais selon le contexte. Bon pour des détails qui doivent rester identiques partout (ex: `border: 1px solid`, `box-shadow`).

## Relatives à la police

- **`em`** — relatif à la taille de police de **l'élément parent** (ou de l'élément lui-même pour `font-size`). Piège : ça s'accumule si tu imbriques des éléments (un `em` dans un `em` dans un `em`...) → la taille réelle devient dure à prévoir.
- **`rem`** *(root em)* — relatif à la taille de police de `<html>` (16px par défaut). Ne s'accumule pas, valeur toujours prévisible. **C'est celui à utiliser par défaut** pour `font-size`, `padding`, `margin`, `gap`.
  - Avantage clé : si l'utilisateur change la taille de police par défaut de son navigateur (accessibilité), tout le site s'adapte proportionnellement.

## Relatives au viewport (fenêtre du navigateur)

- **`vw`** *(viewport width)* — 1vw = 1% de la largeur de la fenêtre.
- **`vh`** *(viewport height)* — 1vh = 1% de la hauteur de la fenêtre.
- **`vmin`** — 1% de la plus **petite** dimension (largeur ou hauteur). Utile pour un élément qui doit rester dans l'écran peu importe l'orientation.
- **`vmax`** — 1% de la plus **grande** dimension.

Exemple dans le projet : `--gutter: clamp(1.25rem, 4vw, 4rem)` → la marge suit 4% de la largeur d'écran, entre un plancher et un plafond en `rem`.

## Relative au parent direct

- **`%`** — relatif à la propriété équivalente du parent (largeur en % → largeur du parent ; mais `font-size` en % → taille de police du parent, comme `em`). Très utilisé pour des largeurs (`width: 50%`), moins pour du texte.

## Bonus — fonctions qui combinent des unités

- **`calc(a + b)`** — opérations entre unités différentes, ex: `calc(100% - 2rem)`.
- **`clamp(min, préféré, max)`** — valeur fluide entre deux bornes, ex: `clamp(1rem, 2vw, 3rem)` (voir explication détaillée donnée en conversation — en résumé : suit la valeur du milieu tant qu'elle reste entre min et max, sinon plafonne).

## Règle pratique pour le portfolio

| Usage | Unité à privilégier |
|---|---|
| Taille de texte, padding, margin, gap | `rem` |
| Largeur/hauteur qui doit suivre l'écran | `vw` / `vh` |
| Valeur fluide entre deux tailles (titres, gutters) | `clamp()` avec `vw` au milieu |
| Bordures, détails fins | `px` |
| Largeur d'un élément par rapport à son conteneur | `%` |
