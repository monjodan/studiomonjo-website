/**
 * Studio Monjo — home arrival page (the doors landing).
 *
 * Responsibilities:
 *   1. Loading sequence on first visit, gated by localStorage 'sm-arrival-seen'.
 *   2. Lazy-load the per-door background video on first hover/focus.
 *   3. Provide a class-based fallback for browsers without :has() support.
 *   4. Auto-cycle backgrounds on mobile (4s interval, paused when hidden).
 *   5. Language toggle pill (top-right).
 *
 * Honors prefers-reduced-motion: reduce. Skips video on slow connections.
 */
(function () {
  var docEl = document.documentElement;
  var body = document.body;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var slowConnection = (function () {
    try {
      var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!c || !c.effectiveType) return false;
      return c.effectiveType === '2g' || c.effectiveType === 'slow-2g';
    } catch (e) { return false; }
  })();
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  var supportsHas = (function () {
    try { return CSS && CSS.supports && CSS.supports('selector(:has(*))'); } catch (e) { return false; }
  })();

  // --- 1. LOADING SEQUENCE -------------------------------------------------
  var loading = document.getElementById('arrivalLoading');
  function dismissLoading(immediate) {
    if (!loading) return;
    if (immediate) {
      loading.classList.add('is-skipped');
      loading.setAttribute('aria-hidden', 'true');
      return;
    }
    loading.classList.add('is-fading');
    setTimeout(function () { loading.classList.add('is-skipped'); }, 900);
  }
  try {
    var seen = localStorage.getItem('sm-arrival-seen');
    if (seen === '1' || prefersReducedMotion) {
      dismissLoading(true);
    } else {
      // Show loading: total intro ~3.1s. Begin fade at 1.8s.
      setTimeout(function () { dismissLoading(false); }, 1800);
      try { localStorage.setItem('sm-arrival-seen', '1'); } catch (e) {}
    }
  } catch (e) {
    // localStorage blocked — show the intro anyway, but don't error
    setTimeout(function () { dismissLoading(false); }, 1800);
  }

  // --- 2. LAZY VIDEO LOADING -----------------------------------------------
  // Each .home-arrival-bg-video carries data-src-mp4 and data-src-webm.
  // We attach <source> children on first activation, then call .load() and .play().
  function activateVideo(videoEl) {
    if (!videoEl || videoEl.dataset.activated === '1') return;
    if (prefersReducedMotion || slowConnection) return; // poster image only
    videoEl.dataset.activated = '1';
    var webm = videoEl.dataset.srcWebm;
    var mp4 = videoEl.dataset.srcMp4;
    if (webm) {
      var sw = document.createElement('source');
      sw.src = webm; sw.type = 'video/webm';
      videoEl.appendChild(sw);
    }
    if (mp4) {
      var sm = document.createElement('source');
      sm.src = mp4; sm.type = 'video/mp4';
      videoEl.appendChild(sm);
    }
    try { videoEl.load(); } catch (e) {}
    var p = videoEl.play();
    if (p && p.catch) p.catch(function () { /* autoplay may fail on some browsers; poster shows */ });
  }
  function videoForDoor(n) {
    var bg = document.querySelector('.home-arrival-bg-' + n);
    return bg ? bg.querySelector('video') : null;
  }

  // --- 3. HOVER / FOCUS — :has() fallback ---------------------------------
  var doors = Array.prototype.slice.call(document.querySelectorAll('.home-arrival-door'));
  var page = document.querySelector('.home-arrival-page');

  function activateDoor(n) {
    activateVideo(videoForDoor(n));
    if (!supportsHas && page) {
      page.classList.add('is-hovering', 'is-hovering-' + n);
      doors.forEach(function (d) {
        d.classList.toggle('is-hovered', d.dataset.door === String(n));
      });
    }
  }
  function deactivateDoors() {
    if (!supportsHas && page) {
      page.classList.remove('is-hovering', 'is-hovering-1', 'is-hovering-2', 'is-hovering-3');
      doors.forEach(function (d) { d.classList.remove('is-hovered'); });
    }
  }
  doors.forEach(function (door) {
    var n = door.dataset.door;
    door.addEventListener('mouseenter', function () { activateDoor(n); });
    door.addEventListener('focusin', function () { activateDoor(n); });
    if (!supportsHas) {
      door.addEventListener('mouseleave', function () {
        if (!doors.some(function (d) { return d.matches(':hover') || d.matches(':focus-within'); })) deactivateDoors();
      });
      door.addEventListener('focusout', function (e) {
        // wait a tick so focus can move within the door
        setTimeout(function () {
          if (!doors.some(function (d) { return d.matches(':focus-within') || d.matches(':hover'); })) deactivateDoors();
        }, 0);
      });
    }
  });

  // --- 4. MOBILE AUTO-CYCLE -----------------------------------------------
  // On mobile, cycle through backgrounds every 4s. Pause when tab is hidden.
  if (isMobile && !prefersReducedMotion && !slowConnection) {
    var current = 0;
    var cycleTimer = null;
    function tickCycle() {
      // strip previous
      body.classList.remove('is-cycling-1', 'is-cycling-2', 'is-cycling-3');
      current = (current % 3) + 1; // 1, 2, 3, 1, ...
      activateVideo(videoForDoor(current));
      body.classList.add('is-cycling-' + current);
    }
    function startCycle() {
      tickCycle();
      cycleTimer = setInterval(tickCycle, 4000);
    }
    function stopCycle() {
      if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
      body.classList.remove('is-cycling-1', 'is-cycling-2', 'is-cycling-3');
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopCycle();
      else if (!cycleTimer) startCycle();
    });
    // delay start until after the intro completes
    setTimeout(startCycle, prefersReducedMotion ? 0 : 3200);
  }

  // --- 5. LANGUAGE TOGGLE PILL --------------------------------------------
  var langBox = document.getElementById('arrivalLang');
  var langBtn = document.getElementById('arrivalLangBtn');
  var langAlt = langBox ? langBox.querySelector('.home-arrival-lang-alt') : null;
  if (langBtn && langBox) {
    langBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = langBox.classList.toggle('is-open');
      langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && langAlt) langAlt.removeAttribute('hidden');
    });
    document.addEventListener('click', function (e) {
      if (langBox.classList.contains('is-open') && !langBox.contains(e.target)) {
        langBox.classList.remove('is-open');
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && langBox.classList.contains('is-open')) {
        langBox.classList.remove('is-open');
        langBtn.setAttribute('aria-expanded', 'false');
        langBtn.focus();
      }
    });
    if (langAlt) {
      langAlt.addEventListener('click', function () {
        try { localStorage.setItem('sm-lang', langAlt.getAttribute('lang') || 'en'); } catch (e) {}
      });
    }
  }

})();
