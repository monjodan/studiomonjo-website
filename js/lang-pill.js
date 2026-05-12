/**
 * Language pill dropdown — shared across the homepage and every inner
 * page. The pill collapses to "EN ▾" / "한국어 ▾" / etc. and reveals
 * the alternate languages inline when opened.
 *
 * Open/close behaviour:
 *   - Click on .page-lang-current toggles open
 *   - Mouseleave on the pill closes it (250ms grace period so the user
 *     can swipe across the alts without it slamming shut)
 *   - Click outside the pill closes it
 *   - Escape closes it and returns focus to the button
 *
 * Markup contract:
 *   <div class="page-lang">
 *     <button class="page-lang-current" aria-expanded="false">…</button>
 *     <span class="page-lang-alts" hidden>…<a class="page-lang-alt">…</a>…</span>
 *   </div>
 */
(function () {
  var pills = document.querySelectorAll('.page-lang');
  Array.prototype.forEach.call(pills, function (box) {
    var btn = box.querySelector('.page-lang-current');
    var alts = box.querySelector('.page-lang-alts');
    if (!btn || !alts) return; // not a dropdown — bail

    var closeTimer = null;
    function open() {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      box.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      alts.removeAttribute('hidden');
    }
    function close() {
      box.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
    function deferredClose() {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(function () {
        if (!box.matches(':hover') && !box.contains(document.activeElement)) close();
      }, 250);
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (box.classList.contains('is-open')) close(); else open();
    });

    // Auto-close when the cursor leaves the pill (with a small grace
    // period so dragging across alts doesn't accidentally close it).
    box.addEventListener('mouseleave', deferredClose);
    box.addEventListener('mouseenter', function () {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    });

    // Click outside the pill closes it.
    document.addEventListener('click', function (e) {
      if (box.classList.contains('is-open') && !box.contains(e.target)) close();
    });

    // Escape closes and returns focus to the button.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('is-open')) {
        close();
        btn.focus();
      }
    });

    // Remember preference for next visit.
    var altLinks = box.querySelectorAll('.page-lang-alt');
    Array.prototype.forEach.call(altLinks, function (link) {
      link.addEventListener('click', function () {
        try { localStorage.setItem('sm-lang', link.getAttribute('lang') || 'en'); } catch (e) {}
      });
    });
  });
})();
