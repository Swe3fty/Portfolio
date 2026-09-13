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

/* ═══ Lancement ═════════════════════════════════════════════════ */

initReveal();
