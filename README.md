# Portfolio — Gaspard Vieujean

Portfolio personnel d'un étudiant ingénieur en 4ᵉ année à l'ISEN Brest, spécialisation **Data & IA**.

🔗 **En ligne : [swe3fty.github.io/Portfolio](https://swe3fty.github.io/Portfolio/)**

Design ultra-minimaliste clair : fond `#FAFAFA`, texte `#09090B`, un seul accent `#2563EB`, police Inter, titres géants et beaucoup de blanc.
Quatre sections : **01 À propos → 02 Compétences → 03 Projets → 04 Contact**.

## Stack

- **HTML5 / CSS3 / JavaScript vanilla** : pas de framework, pas de build, pas de `npm install`
- **Bootstrap 5.3** (CDN) : uniquement la grille et le reboot, sans le JS
- **FontAwesome 6** (CDN) et **Inter** (Google Fonts)
- Les dépendances CDN sont protégées par **SRI** (`integrity`)

## Fonctionnalités

| Fonction | Comment |
|---|---|
| Apparition au scroll | `IntersectionObserver` + animation CSS (`.reveal` → `.is-visible`) |
| Curseur personnalisé | Suivi en *lerp* + effet magnétique sur les liens `.magnetic`, souris/trackpad uniquement (`pointer: fine`) |
| Projets | Données à jour lues depuis l'**API GitHub** (cache de 6 h en `sessionStorage`) ; la liste écrite dans le HTML sert de secours |
| Miniature au survol | Capture du projet qui suit la souris et s'incline selon la vitesse |
| Header | `mix-blend-mode: difference` : il reste lisible sur fond clair comme sur fond sombre |
| Accessibilité | `prefers-reduced-motion` respecté, `:focus-visible`, ARIA, contrastes AA, cibles tactiles ≥ 44 px |
| Responsive | Mobile d'abord ; testé de 320 px à 1440 px, sans défilement horizontal |
| Statistiques | [GoatCounter](https://www.goatcounter.com/) : sans cookie, donc sans bandeau RGPD |

Le site reste entièrement lisible **sans JavaScript** : le contenu n'est masqué pour l'animation que si le JS tourne (classe `.js` posée dans le `<head>`).

## Structure

```
index.html              page unique
assets/
├── css/style.css       tokens → reset → sections → overlays → media queries
├── js/app.js           reveal · curseur · projets GitHub · miniature
├── img/
│   ├── portrait-*.jpg
│   └── projects/       une capture par dépôt : <nom-du-dépôt>.png
└── docs/Cv/            CV téléchargeable
```

## Lancer en local

Aucune installation : ouvrir `index.html` dans un navigateur suffit.
Pour tester dans des conditions proches de la mise en ligne, on peut lancer un petit serveur local :

```bash
python -m http.server 8000   # puis http://localhost:8000
```

## Mettre à jour le contenu

**Ajouter ou modifier un projet**, en trois endroits :
1. `assets/js/app.js`, tableau `PROJECTS` : `repo` (nom exact du dépôt GitHub), `title`, `stack`, `description`
2. `index.html`, liste de secours `#projects-list` : mêmes textes (elle s'affiche si l'API ne répond pas)
3. `assets/img/projects/<repo>.png` : la capture pour la miniature au survol (facultative ; sans elle, pas de miniature)

**Changer le CV** : remplacer `assets/docs/Cv/Gaspard_CV.pdf` en gardant le même nom.

## Déploiement

Le site est hébergé par **GitHub Pages**, depuis la branche `main`, dossier `/ (root)`.
Chaque `git push` sur `main` met le site en ligne à jour en une ou deux minutes.

## Statistiques de visite

Le tableau de bord est sur [gaspard504.goatcounter.com](https://gaspard504.goatcounter.com/). Il ne montre que des données anonymes : nombre de visites, provenance, pays, appareil.
Pour savoir quelle candidature a mené à une visite, ajouter `?ref=` au lien envoyé :

```
https://swe3fty.github.io/Portfolio/?ref=candidature-entreprise-a
```

La valeur apparaît comme **source** dans le tableau de bord.

---

© 2026 Gaspard Vieujean
