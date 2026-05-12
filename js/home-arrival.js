/**
 * Studio Monjo — home arrival page (the doors landing).
 *
 *   1. Hover/focus a door → fade in its background photograph + make
 *      the other doors translucent. Driven by JS class toggles so it
 *      works regardless of :has() support and regardless of DOM order.
 *   2. Mobile: tapping anywhere on a door (outside the explicit buttons)
 *      navigates to the door's primary destination.
 *
 * Language pill behaviour is shared with the rest of the site and lives
 * in /js/lang-pill.js. No door-open animation: links navigate natively,
 * browser handles the paint.
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

  // --- 2. MOBILE — entire door is the tap target ---------------------------
  // Tapping anywhere on the door (outside the explicit buttons) navigates
  // to the primary destination = first .home-arrival-door-actions a. Lets
  // mobile users tap any part of the door surface, not just the buttons.
  if (isMobile) {
    doors.forEach(function (door) {
      var primary = door.querySelector('.home-arrival-door-actions a');
      if (!primary) return;
      door.addEventListener('click', function (e) {
        // Let real button taps go through; only synthesize a tap when the
        // user clicked the door surface itself.
        if (e.target.closest('a, button')) return;
        var href = primary.getAttribute('href');
        if (!href) return;
        var target = primary.getAttribute('target');
        if (target === '_blank') {
          window.open(href, '_blank', 'noopener');
        } else {
          location.href = href;
        }
      });
      door.style.cursor = 'pointer';
    });
  }

  // Language pill behaviour lives in /js/lang-pill.js (shared across the
  // homepage and every inner page).

})();
