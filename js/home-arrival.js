/**
 * Studio Monjo — home arrival page (the doors landing).
 *
 *   1. Hover/focus a door → fade in its background photograph + make
 *      the other doors translucent. Driven by JS class toggles so it
 *      works regardless of :has() support and regardless of DOM order.
 *   2. Click any CTA on a door → smooth scale + paper veil + navigate.
 *      No layout jumps; total ~480ms.
 *   3. Mobile auto-cycle through the three backgrounds (4s, paused
 *      when tab hidden).
 *   4. Language toggle pill (top-right).
 *
 * Honors prefers-reduced-motion: reduce.
 */
(function () {
  var body = document.body;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;

  var doors = Array.prototype.slice.call(document.querySelectorAll('.home-arrival-door'));
  var bgs   = Array.prototype.slice.call(document.querySelectorAll('.home-arrival-bg'));

  // --- 1. HOVER / FOCUS — activate the matching background ----------------
  function activateDoor(n) {
    body.classList.add('is-hovering');
    bgs.forEach(function (bg) {
      bg.classList.toggle('is-active', bg.dataset.bg === String(n));
    });
    doors.forEach(function (d) {
      d.classList.toggle('is-hovered', d.dataset.door === String(n));
    });
  }
  function deactivateDoors() {
    body.classList.remove('is-hovering');
    bgs.forEach(function (bg) { bg.classList.remove('is-active'); });
    doors.forEach(function (d) { d.classList.remove('is-hovered'); });
  }
  doors.forEach(function (door) {
    var n = door.dataset.door;
    door.addEventListener('mouseenter', function () { activateDoor(n); });
    door.addEventListener('focusin',    function () { activateDoor(n); });
    door.addEventListener('mouseleave', function () {
      // Defer so a quick move to a sibling door doesn't flicker
      setTimeout(function () {
        if (!doors.some(function (d) { return d.matches(':hover') || d.matches(':focus-within'); })) deactivateDoors();
      }, 0);
    });
    door.addEventListener('focusout', function () {
      setTimeout(function () {
        if (!doors.some(function (d) { return d.matches(':focus-within') || d.matches(':hover'); })) deactivateDoors();
      }, 0);
    });
  });

  // --- 2. DOOR-OPEN CLICK ANIMATION ---------------------------------------
  function isExternal(a) {
    if (a.getAttribute('target') === '_blank') return true;
    var h = a.getAttribute('href') || '';
    return /^https?:\/\//.test(h) && h.indexOf(location.hostname) === -1;
  }
  function openDoor(door, href, opensInNewTab) {
    if (prefersReducedMotion) {
      if (opensInNewTab) window.open(href, '_blank', 'noopener');
      else location.href = href;
      return;
    }
    // Inject paper veil overlay if not already present
    var veil = document.querySelector('.home-arrival-veil');
    if (!veil) {
      veil = document.createElement('div');
      veil.className = 'home-arrival-veil';
      body.appendChild(veil);
    }
    door.classList.add('is-opened');
    body.classList.add('is-opening');
    var DURATION = 480;
    if (opensInNewTab) {
      window.open(href, '_blank', 'noopener');
      setTimeout(function () {
        door.classList.remove('is-opened');
        body.classList.remove('is-opening');
        if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
      }, DURATION);
    } else {
      setTimeout(function () { location.href = href; }, DURATION - 80);
    }
  }
  doors.forEach(function (door) {
    var ctas = door.querySelectorAll('.home-arrival-door-actions a');
    ctas.forEach(function (a) {
      a.addEventListener('click', function (e) {
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
    function startCycle() { tickCycle(); cycleTimer = setInterval(tickCycle, 4000); }
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
