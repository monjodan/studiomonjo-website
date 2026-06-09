/**
 * Studio Monjo — home arrival page (the doors landing).
 *
 *   1. Desktop: hover/focus gives the active door a subtle opening state.
 *   2. Mobile: tapping anywhere on a door (outside the explicit buttons)
 *      navigates to the door's primary destination.
 *
 * Language pill behaviour is shared with the rest of the site and lives
 * in /js/lang-pill.js. No door-open animation: links navigate natively,
 * browser handles the paint.
 */
(function () {
  var isMobile = window.matchMedia && window.matchMedia('(max-width: 900px)').matches;
  var canPreview = !isMobile && (!window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  var doors = Array.prototype.slice.call(document.querySelectorAll('.home-arrival-door'));

  // --- 1. DESKTOP — active door state --------------------------------------
  function activateDoor(n) {
    document.body.classList.add('is-hovering');
    document.body.classList.remove('is-door-1-active', 'is-door-2-active', 'is-door-3-active');
    document.body.classList.add('is-door-' + n + '-active');
    doors.forEach(function (door) {
      door.classList.toggle('is-hovered', door.dataset.door === String(n));
    });
  }
  function deactivateDoors() {
    document.body.classList.remove('is-hovering', 'is-door-1-active', 'is-door-2-active', 'is-door-3-active');
    doors.forEach(function (door) { door.classList.remove('is-hovered'); });
  }
  if (canPreview) {
    doors.forEach(function (door) {
      var n = door.dataset.door;
      door.addEventListener('mouseenter', function () { activateDoor(n); });
      door.addEventListener('focusin', function () { activateDoor(n); });
      door.addEventListener('mouseleave', function () {
        setTimeout(function () {
          if (!doors.some(function (d) { return d.matches(':hover') || d.matches(':focus-within'); })) deactivateDoors();
        }, 0);
      });
      door.addEventListener('focusout', function () {
        setTimeout(function () {
          if (!doors.some(function (d) { return d.matches(':hover') || d.matches(':focus-within'); })) deactivateDoors();
        }, 0);
      });
    });
  }

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
