/**
 * Studio Monjo — home arrival page (the doors landing).
 *
 * Responsibilities:
 *   1. Toggle the per-door background image on hover/focus.
 *      Uses CSS :has() where supported, class fallback otherwise.
 *   2. Door-open click animation on every door CTA: the chosen door
 *      expands to fill the viewport while the other two slide away,
 *      then navigation proceeds. ~620ms.
 *   3. Mobile auto-cycle through the three backgrounds (4s, paused
 *      when tab is hidden).
 *   4. Language toggle pill (top-right).
 *
 * Honors prefers-reduced-motion: reduce throughout.
 */
(function () {
  var body = document.body;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  var supportsHas = (function () {
    try { return CSS && CSS.supports && CSS.supports('selector(:has(*))'); } catch (e) { return false; }
  })();

  var doors = Array.prototype.slice.call(document.querySelectorAll('.home-arrival-door'));
  var page = document.querySelector('.home-arrival-page');
  var bgs = Array.prototype.slice.call(document.querySelectorAll('.home-arrival-bg'));

  // --- 1. HOVER / FOCUS — activate the matching background ----------------
  function activateDoor(n) {
    bgs.forEach(function (bg) { bg.classList.toggle('is-active', bg.dataset.bg === String(n)); });
    if (!supportsHas && page) {
      page.classList.add('is-hovering', 'is-hovering-' + n);
      doors.forEach(function (d) {
        d.classList.toggle('is-hovered', d.dataset.door === String(n));
      });
    }
  }
  function deactivateDoors() {
    bgs.forEach(function (bg) { bg.classList.remove('is-active'); });
    if (!supportsHas && page) {
      page.classList.remove('is-hovering', 'is-hovering-1', 'is-hovering-2', 'is-hovering-3');
      doors.forEach(function (d) { d.classList.remove('is-hovered'); });
    }
  }
  doors.forEach(function (door) {
    var n = door.dataset.door;
    door.addEventListener('mouseenter', function () { activateDoor(n); });
    door.addEventListener('focusin', function () { activateDoor(n); });
    door.addEventListener('mouseleave', function () {
      if (!doors.some(function (d) { return d.matches(':hover') || d.matches(':focus-within'); })) deactivateDoors();
    });
    door.addEventListener('focusout', function () {
      setTimeout(function () {
        if (!doors.some(function (d) { return d.matches(':focus-within') || d.matches(':hover'); })) deactivateDoors();
      }, 0);
    });
  });

  // --- 2. DOOR-OPEN CLICK ANIMATION ---------------------------------------
  // Every CTA on a door (Learn more + primary) triggers the open animation.
  // External Naver link still opens in a new tab; we animate then navigate.
  function isExternal(a) {
    var t = a.getAttribute('target');
    if (t && t === '_blank') return true;
    var h = a.getAttribute('href') || '';
    return /^https?:\/\//.test(h) && h.indexOf(location.hostname) === -1;
  }
  function openDoor(door, href, opensInNewTab) {
    if (prefersReducedMotion) {
      // No animation — just navigate
      if (opensInNewTab) { window.open(href, '_blank', 'noopener'); }
      else { location.href = href; }
      return;
    }
    door.classList.add('is-opened');
    if (page) page.classList.add('is-opening');
    body.classList.add('is-opening');
    var DURATION = 620;
    if (opensInNewTab) {
      // Open in new tab immediately so the click event isn't lost,
      // then re-render the doors after a short pause.
      window.open(href, '_blank', 'noopener');
      setTimeout(function () {
        door.classList.remove('is-opened');
        if (page) page.classList.remove('is-opening');
        body.classList.remove('is-opening');
      }, DURATION);
    } else {
      setTimeout(function () { location.href = href; }, DURATION - 80);
    }
  }
  doors.forEach(function (door) {
    var ctas = door.querySelectorAll('.home-arrival-door-actions a');
    ctas.forEach(function (a) {
      a.addEventListener('click', function (e) {
        // Allow modifier-clicks (cmd, ctrl, middle) to bypass animation
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        var href = a.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        openDoor(door, href, isExternal(a));
      });
    });
  });

  // --- 3. MOBILE AUTO-CYCLE -----------------------------------------------
  if (isMobile && !prefersReducedMotion) {
    var current = 0;
    var cycleTimer = null;
    function tickCycle() {
      body.classList.remove('is-cycling-1', 'is-cycling-2', 'is-cycling-3');
      bgs.forEach(function (bg) { bg.classList.remove('is-active'); });
      current = (current % 3) + 1;
      body.classList.add('is-cycling-' + current);
      var bg = document.querySelector('.home-arrival-bg-' + current);
      if (bg) bg.classList.add('is-active');
    }
    function startCycle() {
      tickCycle();
      cycleTimer = setInterval(tickCycle, 4000);
    }
    function stopCycle() {
      if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
      body.classList.remove('is-cycling-1', 'is-cycling-2', 'is-cycling-3');
      bgs.forEach(function (bg) { bg.classList.remove('is-active'); });
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopCycle();
      else if (!cycleTimer) startCycle();
    });
    setTimeout(startCycle, 200);
  }

  // --- 4. LANGUAGE TOGGLE PILL --------------------------------------------
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
