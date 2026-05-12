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
  // Inject the cream-paper veil once, lazily. Lives at the top of <body> so
  // it sits above everything (its own z-index also covers it).
  function ensureVeil() {
    var v = document.querySelector('.home-arrival-veil');
    if (v) return v;
    v = document.createElement('div');
    v.className = 'home-arrival-veil';
    v.setAttribute('aria-hidden', 'true');
    body.appendChild(v);
    return v;
  }

  function openDoor(door, href, opensInNewTab) {
    if (prefersReducedMotion) {
      if (opensInNewTab) window.open(href, '_blank', 'noopener');
      else location.href = href;
      return;
    }
    // Drop any lingering hover-state class so :hover/.is-hovered rules
    // don't fight the opening transition.
    deactivateDoors();
    ensureVeil();
    door.classList.add('is-opened');
    body.classList.add('is-opening');
    // Force a reflow so the opening transition has a clean starting state
    // separate from the just-mutated classList.
    /* eslint-disable-next-line no-unused-expressions */
    void door.offsetWidth;
    var DURATION = 460;
    if (opensInNewTab) {
      window.open(href, '_blank', 'noopener');
      setTimeout(function () {
        door.classList.remove('is-opened');
        body.classList.remove('is-opening');
      }, DURATION);
    } else {
      setTimeout(function () { location.href = href; }, DURATION);
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

  // --- 3. MOBILE — entire door is the tap target ---------------------------
  // Tapping anywhere on the door (outside the explicit buttons) navigates
  // to the primary destination = first .home-arrival-door-actions a.
  // No auto-cycle; nothing moves until you choose a door.
  if (isMobile) {
    doors.forEach(function (door) {
      var primary = door.querySelector('.home-arrival-door-actions a');
      if (!primary) return;
      door.addEventListener('click', function (e) {
        // Let real button taps go through; only synthesize a tap when the
        // user clicked the door surface itself.
        if (e.target.closest('.home-arrival-door-actions')) return;
        if (e.target.closest('a, button')) return;
        var href = primary.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        if (isExternal(primary)) {
          window.open(href, '_blank', 'noopener');
        } else {
          openDoor(door, href, false);
        }
      });
      door.style.cursor = 'pointer';
    });
  }

  // --- 4. LANGUAGE TOGGLE PILL --------------------------------------------
  var langBox = document.getElementById('arrivalLang');
  var langBtn = document.getElementById('arrivalLangBtn');
  var langAlts = langBox ? langBox.querySelector('.home-arrival-lang-alts') : null;
  var langAltLinks = langBox ? langBox.querySelectorAll('.home-arrival-lang-alt') : [];
  if (langBtn && langBox) {
    langBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var open = langBox.classList.toggle('is-open');
      langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open && langAlts) langAlts.removeAttribute('hidden');
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
    Array.prototype.forEach.call(langAltLinks, function (link) {
      link.addEventListener('click', function () {
        try { localStorage.setItem('sm-lang', link.getAttribute('lang') || 'en'); } catch (e) {}
      });
    });
  }

})();
