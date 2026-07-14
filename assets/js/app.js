/* ═══════════════════════════════════════════════════════════════
   Portfolio — Gaspard Vieujean
   Vanilla JS modulaire · 60fps via requestAnimationFrame + lerp
   Modules : loader terminal, curseur magnétique, hover-reveal,
             fetch GitHub, reveal au scroll
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE_POINTER = window.matchMedia('(pointer: fine)').matches;

  function lerp(a, b, n) { return a + (b - a) * n; }
  function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ─── Ticker rAF partagé (une seule boucle pour tout) ──────── */

  var ticker = (function () {
    var callbacks = [];
    var running = false;
    function loop() {
      for (var i = 0; i < callbacks.length; i++) callbacks[i]();
      requestAnimationFrame(loop);
    }
    return {
      add: function (fn) {
        callbacks.push(fn);
        if (!running) { running = true; requestAnimationFrame(loop); }
      }
    };
  })();

  /* Position souris partagée entre curseur et miniature */
  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  /* ═══ 1. Loader terminal ═════════════════════════════════════ */

  function initLoader() {
    var loader = document.getElementById('loader-terminal');
    if (!loader) return;

    // Empêche l'utilisateur de scroller vers le bas, lock le body
    document.body.classList.add('is-locked');

    var hidden = false;
    function hide() {
      if (hidden) return;
      hidden = true;
      loader.classList.add('is-done');
      document.body.classList.remove('is-locked');
      //Enlève la balise HTML pour libérer de la mémoire sur le navigateur
      setTimeout(function () {
                if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 800);
    }

    // En fonction du navigateur / utilisateur si réduire les animations est coché alors le loader ne s'affiche pas
    if (REDUCED_MOTION) { hide(); return; }

    var output = loader.querySelector('.terminal-output');
    var lines = [
      '&gt; chargement des modules… [cursor] [reveal] [github-api] <span style="color:#86EFAC">OK</span>',
      '&gt; connexion à api.github.com/users/Swe3fty… <span style="color:#86EFAC">200</span>',
      '&gt; interface prête. bienvenue_'
    ];

    lines.forEach(function (line, i) {
      setTimeout(function () {
        var p = document.createElement('p');
        p.innerHTML = line;
        output.appendChild(p);
      }, 420 + i * 460);
    });

    setTimeout(hide, 420 + lines.length * 460 + 500);
    setTimeout(hide, 4500); /* enlève le loader si bug : jamais bloqué sur le loader */
  }

  /* ═══ 2. Curseur magnétique (lerp + inertie) ═════════════════ */

  function initCursor() {
    var cursor = document.getElementById('custom-cursor');
    if (!cursor || !FINE_POINTER) return;

    document.documentElement.classList.add('has-custom-cursor');

    /* L'élément fait 45px (état survolé) : au repos on le réduit à ~14px.
       Réduire une couche GPU reste net, l'agrandir la pixelise. */
    var SCALE_IDLE = 14 / 45;
    var SCALE_HOVER = 1;

    var pos = { x: mouse.x, y: mouse.y };
    var scale = SCALE_IDLE;
    var targetScale = SCALE_IDLE;
    var magnetEl = null;
    var ease = REDUCED_MOTION ? 1 : 0.16;

    var HOVERABLE = 'a, button, [data-cursor-hover]';

    document.addEventListener('mouseover', function (e) {
      var t = e.target.closest(HOVERABLE);
      if (!t) return;
      cursor.classList.add('cursor-hover');
      targetScale = SCALE_HOVER;
      magnetEl = t.classList.contains('magnetic') ? t : null;
    });

    document.addEventListener('mouseout', function (e) {
      var t = e.target.closest(HOVERABLE);
      if (!t) return;
      cursor.classList.remove('cursor-hover');
      targetScale = SCALE_IDLE;
      if (magnetEl === t) magnetEl = null;
      if (t.classList.contains('magnetic')) t.style.transform = '';
    });

    ticker.add(function () {
      var tx = mouse.x;
      var ty = mouse.y;

      /* Aimantation : le curseur colle au centre de l'élément,
         l'élément glisse légèrement vers la souris */
      if (magnetEl) {
        var r = magnetEl.getBoundingClientRect();
        tx = r.left + r.width / 2;
        ty = r.top + r.height / 2;
        if (!REDUCED_MOTION) {
          magnetEl.style.transform =
            'translate(' + (mouse.x - tx) * 0.3 + 'px,' + (mouse.y - ty) * 0.3 + 'px)';
        }
      }

      pos.x = lerp(pos.x, tx, ease);
      pos.y = lerp(pos.y, ty, ease);
      scale = lerp(scale, targetScale, REDUCED_MOTION ? 1 : 0.14);

      cursor.style.transform =
        'translate3d(' + pos.x + 'px,' + pos.y + 'px,0) translate(-50%,-50%) scale(' + scale.toFixed(3) + ')';
    });
  }

  /* ═══ 3. Hover-reveal : miniature élastique ══════════════════ */

  function initPreview() {
    var wrap = document.getElementById('project-preview');
    var list = document.getElementById('projects-list');
    if (!wrap || !list || !FINE_POINTER) return;

    var img = wrap.querySelector('img');
    var pos = { x: mouse.x, y: mouse.y };
    var currentSrc = '';
    var ease = REDUCED_MOTION ? 1 : 0.09;

    list.addEventListener('mouseover', function (e) {
      var item = e.target.closest('.project-item');
      if (!item) return;
      var src = item.getAttribute('data-preview');
      if (src && src !== currentSrc) {
        currentSrc = src;
        img.src = src;
      }
      wrap.classList.add('is-visible');
    });

    list.addEventListener('mouseleave', function () {
      wrap.classList.remove('is-visible');
    });

    ticker.add(function () {
      var prevX = pos.x;
      pos.x = lerp(pos.x, mouse.x, ease);
      pos.y = lerp(pos.y, mouse.y, ease);
      /* rotation issue de la vélocité horizontale → effet élastique */
      var rot = REDUCED_MOTION ? 0 : clamp((pos.x - prevX) * 0.55, -10, 10);
      wrap.style.transform =
        'translate3d(' + pos.x + 'px,' + pos.y + 'px,0) translate(-50%,-58%) rotate(' + rot.toFixed(2) + 'deg)';
    });
  }

  /* ═══ 4. Fetch API GitHub ════════════════════════════════════ */

  var GH_USER = 'Swe3fty';
  var MAX_REPOS = 6;

  /* Ordre imposé des projets phares ; les autres suivent par date de push */
  var PRIORITY = ['f1-telemetry-predictor', 'projet_ia_s6', 'projet_dev_web_s6', 'Projet-Informatique-S6'];

  var DISPLAY_NAMES = {
    'f1-telemetry-predictor': 'F1 Telemetry',
    'projet_ia_s6': 'IRVE — Machine Learning',
    'projet_dev_web_s6': 'Borneo',
    'Projet-Informatique-S6': 'Projet Info S6'
  };

  /* Filet de sécurité si l'API est injoignable (offline, rate limit) */
  var FALLBACK_REPOS = [
    { name: 'f1-telemetry-predictor', language: 'Python', pushed_at: '2026-06-01T00:00:00Z' },
    { name: 'projet_ia_s6', language: 'Python', pushed_at: '2026-05-01T00:00:00Z' },
    { name: 'projet_dev_web_s6', language: 'JavaScript', pushed_at: '2026-05-01T00:00:00Z' },
    { name: 'Projet-Informatique-S6', language: 'C', pushed_at: '2026-04-01T00:00:00Z' }
  ].map(function (r) {
    r.html_url = 'https://github.com/' + GH_USER + '/' + r.name;
    return r;
  });

  function repoRank(repo) {
    var i = PRIORITY.indexOf(repo.name);
    return i === -1 ? PRIORITY.length : i;
  }

  function renderProjects(repos) {
    var list = document.getElementById('projects-list');
    if (!list) return;

    var html = repos.map(function (repo, i) {
      var title = DISPLAY_NAMES[repo.name] || repo.name.replace(/[-_]/g, ' ');
      var lang = repo.language || 'code';
      var year = repo.pushed_at ? new Date(repo.pushed_at).getFullYear() : '';
      var preview = 'https://opengraph.githubassets.com/1/' + GH_USER + '/' + encodeURIComponent(repo.name);
      return '<a class="project-item" href="' + esc(repo.html_url) + '" target="_blank" rel="noopener"' +
        ' data-preview="' + esc(preview) + '">' +
        '<span class="project-index">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<h2 class="project-title">' + esc(title) + '</h2>' +
        '<span class="project-meta">' + esc(lang) + (year ? ' · ' + year : '') + '</span>' +
        '</a>';
    }).join('');

    list.innerHTML = html;

    /* Préchargement des miniatures pour un hover-reveal instantané */
    if (FINE_POINTER) {
      repos.forEach(function (repo) {
        new Image().src = 'https://opengraph.githubassets.com/1/' + GH_USER + '/' + encodeURIComponent(repo.name);
      });
    }
  }

  function initProjects() {
    fetch('https://api.github.com/users/' + GH_USER + '/repos?per_page=100&sort=pushed')
      .then(function (res) {
        if (!res.ok) throw new Error('GitHub API ' + res.status);
        return res.json();
      })
      .then(function (repos) {
        var own = repos.filter(function (r) { return !r.fork; });
        own.sort(function (a, b) {
          var d = repoRank(a) - repoRank(b);
          return d !== 0 ? d : new Date(b.pushed_at) - new Date(a.pushed_at);
        });
        if (!own.length) throw new Error('Aucun dépôt');
        renderProjects(own.slice(0, MAX_REPOS));
      })
      .catch(function () {
        renderProjects(FALLBACK_REPOS);
      });
  }

  /* ═══ 5. Reveal au scroll ════════════════════════════════════ */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || REDUCED_MOTION) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ═══ Init ═══════════════════════════════════════════════════ */

  function init() {
    initLoader();
    initCursor();
    initPreview();
    initProjects();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
