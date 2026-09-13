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

/* ═══ Lancement ═════════════════════════════════════════════════ */

initReveal();
initCursor();
