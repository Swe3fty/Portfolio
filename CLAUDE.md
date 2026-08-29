# Portfolio de Gaspard — contexte du projet

## Projet

Portfolio personnel de Gaspard Vieujean (étudiant ingénieur, ISEN Brest — Data & IA). Stack : **HTML5 / CSS3 / JavaScript vanilla**, avec **Bootstrap 5** (CDN, grille + reboot uniquement, pas de bundle JS) et **FontAwesome**. Le skill `ui-ux-pro-max` peut être utilisé comme aide à l'intelligence de design (palettes, patterns UI) si besoin.

Repo GitHub : `Swe3fty/Portfolio`, tout se passe sur `main`.

## Objectif : reconstruction pédagogique, pas refonte visuelle

Gaspard a déjà eu une version fonctionnelle du site dont il aimait le rendu, mais qu'il n'avait pas écrite lui-même et qu'il avait du mal à comprendre en profondeur. Plutôt que de continuer à relire du code fini, il reconstruit maintenant **le site de zéro, section par section, en l'écrivant lui-même**, avec Claude comme guide.

**Design cible** (identique à l'ancienne version, archivée dans `reference/`) :
- Ultra-minimalisme clair : fond `#FAFAFA`, texte `#09090B`, accent unique `#2563EB`, police Inter (300–900), whitespace massif, titres géants.
- Header en `mix-blend-mode: difference`.
- Curseur custom avec lerp + magnétisme (`pointer: fine` uniquement).
- Loader terminal au chargement.
- Sections : 01 À propos → 02 Compétences → 03 Projets → 04 Contact.

## `reference/`

Contient l'ancienne implémentation complète et figée (`reference/index.html`, `reference/assets/css/style.css`, `reference/assets/js/app.js`, `reference/assets/img/`), autonome et ouvrable directement dans un navigateur. **Rôle unique : retrouver une valeur précise** (une couleur exacte, un texte de projet, un timing d'animation) — jamais à copier-coller telle quelle dans le nouveau site. Le contenu détaillé des décisions passées (contenu des projets, ordre imposé, pièges rencontrés) reste dans la mémoire long-terme de Claude, pas dupliqué ici.

## Mode de travail

- **C'est Gaspard qui écrit le code.** Claude explique le mécanisme avant/pendant, relit et corrige, mais ne pousse pas de gros blocs de code tout faits à sa place.
- On avance **une étape à la fois** (voir feuille de route ci-dessous) — jamais un fichier entier d'un coup.
- **Git** : Claude propose un commit avec un message clair à chaque étape importante terminée ; Gaspard valide avant que Claude committe. Jamais de commit ou push silencieux.
- **Environnement Windows** — pièges connus :
  - `python`/`py` dans le PATH sont des stubs Microsoft Store cassés → utiliser `C:\Users\gaspa\AppData\Local\Python\pythoncore-3.14-64\python.exe`.
  - Chrome réel dans `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe` (pas Program Files) ; headless clampe la largeur ~500px (encapsuler dans un iframe pour tester du mobile).
  - Ne jamais éditer `index.html` via PowerShell 5.1 `Get-Content`/`Set-Content` (mojibake UTF-8→ANSI) — utiliser Bash/sed ou l'outil Edit.

## Feuille de route

1. [x] Réorganisation (`reference/` + fichiers de départ) + `CLAUDE.md`
2. [ ] Squelette HTML sémantique complet (head, header, hero, à propos, compétences, projets, contact, footer) — sans style
3. [ ] Fondations CSS : reset, custom properties (couleurs/espacements/typo), intégration grille Bootstrap
4. [ ] CSS section par section : hero → à propos → compétences → projets → contact
5. [ ] JS progressif : reveal au scroll, curseur custom + magnétisme, loader terminal
6. [ ] JS avancé : fetch GitHub des projets, ticker rAF partagé
7. [ ] Contenu réel + accessibilité (alt, ARIA, meta/OG) + responsive + `prefers-reduced-motion`
