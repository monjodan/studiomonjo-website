/**
 * Cahier pages (notebooks / workshop) shared behaviour:
 *   - a faint warm paper fibre texture on the page
 *   - smooth in-page jumps for the "contents" links ([data-goto="#id"])
 *   - Formspree forms: waitlist and company brief confirmations stay inline
 *     without leaving the page (both still work without JS)
 */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- keep autoplay videos looping silently (some mobile browsers block
     native autoplay and show a play button; force muted playback) ---- */
  Array.prototype.forEach.call(document.querySelectorAll('video[autoplay]'), function (v) {
    v.muted = true;
    v.playsInline = true;
    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    play();
    v.addEventListener('loadeddata', play);
    v.addEventListener('canplay', play);
    var onGesture = function () {
      play();
      document.removeEventListener('touchstart', onGesture);
      document.removeEventListener('pointerdown', onGesture);
    };
    document.addEventListener('touchstart', onGesture, { passive: true });
    document.addEventListener('pointerdown', onGesture);
  });

  /* ---- paper texture ---- */
  var cahier = document.querySelector('.cahier');
  if (cahier && !cahier.hasAttribute('data-flat-paper')) {
    var c = document.createElement('canvas');
    c.width = 160; c.height = 160;
    var ctx = c.getContext('2d');
    var im = ctx.createImageData(160, 160);
    for (var i = 0; i < im.data.length; i += 4) {
      im.data[i] = 92; im.data[i + 1] = 74; im.data[i + 2] = 46;
      im.data[i + 3] = Math.random() * 26;
    }
    ctx.putImageData(im, 0, 0);
    cahier.style.backgroundImage = 'url(' + c.toDataURL() + ')';
    cahier.style.backgroundRepeat = 'repeat';
  }

  /* ---- contents jumps ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-goto]'), function (btn) {
    btn.addEventListener('click', function (e) {
      var sel = btn.getAttribute('data-goto');
      var t = sel && document.querySelector(sel);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---- waitlist form -> Formspree, inline confirmation ---- */
  var form = document.querySelector('[data-waitlist]');
  if (form) {
    var done = document.querySelector('[data-waitlist-done]');
    var showDone = function () { form.hidden = true; if (done) done.hidden = false; };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var endpoint = form.getAttribute('action') || '';
      var live = /^https?:\/\//.test(endpoint) && endpoint.indexOf('REPLACE') === -1;
      if (!live) { showDone(); return; } // stub endpoint: demo the confirmation
      var data = new FormData(form);
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r : Promise.reject(r); })
        .then(showDone)
      .catch(function () { form.submit(); }); // fall back to a plain POST
    });
  }

  /* ---- company brief -> Formspree, inline acknowledgement ---- */
  var companyForm = document.querySelector('[data-company-form]');
  if (companyForm) {
    var companyDone = document.querySelector('[data-company-form-done]');
    var companyStatus = companyForm.querySelector('[data-company-form-status]');
    var companySubmit = companyForm.querySelector('button[type="submit"]');
    var setCompanyPending = function (pending) {
      companyForm.setAttribute('aria-busy', pending ? 'true' : 'false');
      if (companySubmit) companySubmit.disabled = pending;
    };

    companyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      setCompanyPending(true);
      if (companyStatus) companyStatus.hidden = true;

      fetch(companyForm.getAttribute('action'), {
        method: 'POST',
        body: new FormData(companyForm),
        headers: { Accept: 'application/json' }
      })
        .then(function (r) { return r.ok ? r : Promise.reject(r); })
        .then(function () {
          companyForm.hidden = true;
          if (companyDone) {
            companyDone.hidden = false;
            companyDone.focus();
          }
        })
        .catch(function () {
          setCompanyPending(false);
          if (companyStatus) {
            companyStatus.textContent = 'The brief could not be sent. Please try again, or use the email link above.';
            companyStatus.hidden = false;
          }
        });
    });
  }
})();
