(function () {
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');

  var gallery = [];
  var idx = 0;

  function openLightbox(items, startIdx) {
    gallery = items || [];
    idx = startIdx || 0;
    show();
    lb.hidden = false;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function show() {
    var it = gallery[idx];
    if (!it) return;
    lbImg.src = it.src;
    lbImg.alt = it.alt || it.caption || '';
    lbCap.textContent = it.caption || '';
  }
  function close() {
    lb.classList.remove('open');
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.style.overflow = '';
  }
  function step(delta) {
    if (!gallery.length) return;
    idx = (idx + delta + gallery.length) % gallery.length;
    show();
  }

  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev) lbPrev.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  if (lbNext) lbNext.addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  if (lb) lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

  document.addEventListener('keydown', function (e) {
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  function bindTriggers() {
    document.querySelectorAll('[data-gallery]').forEach(function (el) {
      if (el.dataset.lbBound) return;
      el.dataset.lbBound = '1';
      el.addEventListener('click', function () {
        try {
          var items = JSON.parse(el.dataset.gallery);
          openLightbox(items, 0);
        } catch (e) { /* ignore */ }
      });
    });
  }
  bindTriggers();
  document.addEventListener('notebooks:rendered', bindTriggers);

  /* Mobile nav */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');
  var navBackdrop = document.getElementById('navBackdrop');

  function closeNav() {
    if (!navToggle || !navMenu) return;
    navMenu.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    if (!lb || !lb.classList.contains('open')) document.body.style.overflow = '';
  }
  function openNav() {
    navMenu.classList.add('open');
    if (navBackdrop) navBackdrop.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (navMenu.classList.contains('open')) closeNav(); else openNav();
    });
  }
  if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
  if (navMenu) {
    navMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.matchMedia('(max-width: 900px)').matches) closeNav();
      });
    });
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
