/* ═══════════════════════════════════════════════════════════════
   Portfolio — Gaspard Vieujean
   JavaScript vanilla,
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* Réglages globaux (lus une seule fois au chargement) */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ═══ 1. Reveal au scroll ═══════════════════════════════════════
   Chaque élément .reveal démarre invisible (voir CSS). Quand il entre
   dans l'écran, on lui ajoute .is-visible et le CSS fait la transition.
   IntersectionObserver = le navigateur nous prévient lui-même quand un
   élément devient visible, sans écouter le scroll en continu. */

function initReveal() {
  const items = document.querySelectorAll('.reveal');

  // Sans observer (vieux navigateur) ou si l'utilisateur refuse les
  // animations : on affiche tout, tout de suite.
  if (!('IntersectionObserver' in window) || REDUCED_MOTION) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }


  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // une seule apparition, on arrête de surveiller
      }
    });
  }, {
    threshold: 0.15,                 // déclenche quand 15 % de l'élément est visible
    rootMargin: '0px 0px -8% 0px',   // oui et un peu avant le bord bas de l'écran
  });

  items.forEach((el) => observer.observe(el));
}


/* ═══ 2. Curseur custom ═════════════════════════════════════════
   Un rond blanc suit la souris avec un léger retard et grossit sur les
   liens. Sur un élément .magnetic, le rond se colle à son centre et
   l'élément glisse vers la souris. Souris/trackpad uniquement. */

/* Avance d'une fraction du chemin restant entre `a` et `b` (16 % par défaut) */
function lerp(a, b, speed = 0.16) {
  return a + (b - a) * (REDUCED_MOTION ? 1 : speed);
}

function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor || !window.matchMedia('(pointer: fine)').matches) return;

  document.documentElement.classList.add('has-custom-cursor');

  const mouse = { x: 0, y: 0 };   // vraie position de la souris
  const pos = { x: 0, y: 0 };     // position affichée du rond (en retard)
  let scale = 0.3;                // taille actuelle (0.3 = petit, 1 = gros)
  let targetScale = 0.3;
  let magnetEl = null;            // l'élément .magnetic survolé, sinon null

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Survol d'un lien : le rond grossit ; si le lien est .magnetic, on le retient
  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest('a, button');
    if (!link) return;
    targetScale = 1;
    if (link.classList.contains('magnetic')) magnetEl = link;
  });

  // Sortie du lien : retour à la normale
  document.addEventListener('mouseout', (e) => {
    const link = e.target.closest('a, button');
    if (!link) return;
    targetScale = 0.3;
    if (magnetEl) magnetEl.style.transform = '';
    magnetEl = null;
  });

  // Appelée ~60 fois par seconde par le navigateur
  function frame() {
    let targetX = mouse.x;
    let targetY = mouse.y;

    // Aimantation : le rond vise le centre de l'élément,
    // et l'élément est poussé de 30 % vers la souris
    if (magnetEl) {
      const r = magnetEl.getBoundingClientRect();
      targetX = r.left + r.width / 2;
      targetY = r.top + r.height / 2;
      magnetEl.style.transform =
        `translate(${(mouse.x - targetX) * 0.3}px, ${(mouse.y - targetY) * 0.3}px)`;
    }

    pos.x = lerp(pos.x, targetX);
    pos.y = lerp(pos.y, targetY);
    scale = lerp(scale, targetScale);

    cursor.style.transform =
      `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(${scale})`;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* ═══ 3. Projets GitHub ═════════════════════════════════════════
   La liste écrite dans le HTML sert de secours : visible sans JS, ou si
   l'API GitHub ne répond pas. Le JS la reconstruit avec les infos à jour
   (lien, année du dernier push). Titres et stack sont décrits ici, car
   l'API ne connaît qu'un seul langage par dépôt. */

const GH_USER = 'Swe3fty';

const PROJECTS = [
  {
    repo: 'projet_dev_web_s6',
    title: 'Borneo',
    stack: 'Html/Css · JavaScript · MySQL · Python',
    description: "Plateforme d'analyse des bornes de recharge électrique en France&nbsp;: carte interactive, statistiques par département et prédictions par IA (clustering, Random Forest).",
  },
  {
    repo: 'Route-Planner',
    title: 'Planifieur de routes',
    stack: 'C++ · MySQL',
    description: "Application Qt en C++ qui calcule le plus court chemin entre deux villes de l'ouest de la France, avec carte interactive et fiches Wikipédia.",
  },
  {
    repo: 'solar-pannel',
    title: 'Gestion photovoltaïque',
    stack: 'Html/Css · PHP · JavaScript',
    description: "Application web de gestion des installations photovoltaïques chez les particuliers&nbsp;: suivi des données, back-office PHP et base MariaDB.",
  },
  {
    repo: 'graph_theory_project',
    title: 'Théorie des graphes',
    stack: 'Python',
    description: "Génération d'un terrain 2D sur grille hexagonale et résolution de problèmes de déplacement par algorithmes de graphes, en Python.",
  },
];

/* async/await : on peut écrire "attends la réponse" sans bloquer la page.
   Pendant l'attente, le navigateur continue à tourner normalement. */
async function initProjects() {
  const list = document.getElementById('projects-list');
  if (!list) return;

  try {
    const response = await fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100`);
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const repos = await response.json(); // tableau d'objets, un par dépôt

    let html = '';
    let index = 0;

    for (const project of PROJECTS) {
      const repo = repos.find((r) => r.name === project.repo);
      if (!repo) continue; // dépôt renommé ou supprimé : on le saute

      index += 1;
      const year = new Date(repo.pushed_at).getFullYear();
      html += `
        <a class="project-item" href="${repo.html_url}" target="_blank" rel="noopener">
          <span class="project-index">${String(index).padStart(2, '0')}</span>
          <h3 class="project-title">${project.title}</h3>
          <span class="project-meta">${project.stack} · ${year}</span>
          <p class="project-desc">${project.description}</p>
        </a>`;
    }

    if (html) list.innerHTML = html;
  } catch (error) {
    // Hors ligne, quota API dépassé… : on garde la liste HTML telle quelle
    console.warn('Projets : API GitHub indisponible, liste statique conservée.', error);
  }
}

/* ═══ 4. Miniature des projets ══════════════════════════════════
   Au survol d'un projet, sa capture d'écran (assets/img/projects/<dépôt>.png)
   suit la souris avec un retard plus marqué que le curseur, et penche
   légèrement dans le sens du mouvement. Souris/trackpad uniquement.
   Si la capture n'existe pas, la miniature reste cachée. */

function initPreview() {
  const wrap = document.getElementById('project-preview');
  const list = document.getElementById('projects-list');
  if (!wrap || !list || !window.matchMedia('(pointer: fine)').matches) return;

  const img = wrap.querySelector('img');
  const mouse = { x: 0, y: 0 };
  const pos = { x: 0, y: 0 };
  let currentUrl = '';

  // Lien https://github.com/Swe3fty/<dépôt> → assets/img/projects/<dépôt>.png
  function imageUrl(link) {
    const repo = new URL(link.href).pathname.split('/').pop();
    return `assets/img/projects/${repo}.png`;
  }

  // Préchargement : les captures sont prêtes avant le premier survol
  list.querySelectorAll('.project-item').forEach((link) => {
    new Image().src = imageUrl(link);
  });

  // C'est le chargement de l'image qui décide de l'affichage
  img.addEventListener('load', () => wrap.classList.add('is-visible'));
  img.addEventListener('error', () => wrap.classList.remove('is-visible'));

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  list.addEventListener('mouseover', (e) => {
    const link = e.target.closest('.project-item');
    if (!link) return;

    // Première apparition : on place la miniature sous la souris directement
    if (!wrap.classList.contains('is-visible')) {
      pos.x = e.clientX;
      pos.y = e.clientY;
    }

    const url = imageUrl(link);
    if (url !== currentUrl) {
      currentUrl = url;
      img.src = url; // déclenche load (→ visible) ou error (→ cachée)
    } else if (img.naturalWidth > 0) {
      wrap.classList.add('is-visible'); // même image, déjà chargée
    }
  });

  list.addEventListener('mouseleave', () => {
    wrap.classList.remove('is-visible');
  });

  function frame() {
    const previousX = pos.x;
    pos.x = lerp(pos.x, mouse.x, 0.09);
    pos.y = lerp(pos.y, mouse.y, 0.09);

    // Inclinaison proportionnelle à la vitesse horizontale, bornée à ±10°
    let tilt = (pos.x - previousX) * 0.55;
    tilt = Math.max(-10, Math.min(10, tilt));
    if (REDUCED_MOTION) tilt = 0;

    wrap.style.transform =
      `translate(${pos.x}px, ${pos.y}px) translate(-50%, -58%) rotate(${tilt}deg)`;

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* ═══ Lancement ═════════════════════════════════════════════════ */

initReveal();
initCursor();
initProjects();
initPreview();
