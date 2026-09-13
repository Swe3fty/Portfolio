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

/* Avance de 16 % du chemin restant entre `a` et `b` : mouvement fluide */
function lerp(a, b) {
  return a + (b - a) * (REDUCED_MOTION ? 1 : 0.16);
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
  { repo: 'projet_dev_web_s6',    title: 'Borneo',                 stack: 'Html/Css · JavaScript · MySQL · Python' },
  { repo: 'Route-Planner',        title: 'Planifieur de routes',   stack: 'C++ · MySQL' },
  { repo: 'solar-pannel',         title: 'Gestion photovoltaïque', stack: 'Html/Css · PHP · JavaScript' },
  { repo: 'graph_theory_project', title: 'Théorie des graphes',    stack: 'Python' },
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
        </a>`;
    }

    if (html) list.innerHTML = html;
  } catch (error) {
    // Hors ligne, quota API dépassé… : on garde la liste HTML telle quelle
    console.warn('Projets : API GitHub indisponible, liste statique conservée.', error);
  }
}

/* ═══ Lancement ═════════════════════════════════════════════════ */

initReveal();
initCursor();
initProjects();
