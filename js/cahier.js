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

  /* ---- Robey scene carousel: one painted story at a time ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-scene-carousel]'), function (carousel) {
    var track = carousel.querySelector('[data-scene-track]');
    var slides = track ? Array.prototype.slice.call(track.querySelectorAll('.scene')) : [];
    var previous = carousel.querySelector('[data-scene-previous]');
    var next = carousel.querySelector('[data-scene-next]');
    var controls = carousel.querySelector('[data-scene-controls]');
    var currentLabel = carousel.querySelector('[data-scene-current]');
    var live = carousel.querySelector('[data-scene-live]');
    var liveTemplate = carousel.getAttribute('data-scene-template') || 'Scene {current} of {total}: {name}';
    var current = 0;
    var scrollFrame = null;

    if (!track || !slides.length) return;

    var update = function (index) {
      current = Math.max(0, Math.min(slides.length - 1, index));
      if (currentLabel) currentLabel.textContent = ('0' + (current + 1)).slice(-2);
      if (previous) previous.disabled = current === 0;
      if (next) next.disabled = current === slides.length - 1;
      if (live) {
        var name = slides[current].querySelector('.scene__name');
        live.textContent = liveTemplate
          .replace('{current}', current + 1)
          .replace('{total}', slides.length)
          .replace('{name}', name ? name.textContent : '');
      }

      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', (slideIndex + 1) + ' / ' + slides.length);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        if ('inert' in slide) {
          slide.inert = !active;
        } else {
          Array.prototype.forEach.call(
            slide.querySelectorAll('a[href], button, input, select, textarea, [tabindex]'),
            function (element) {
              if (!element.hasAttribute('data-scene-original-tabindex')) {
                element.setAttribute(
                  'data-scene-original-tabindex',
                  element.hasAttribute('tabindex') ? element.getAttribute('tabindex') : ''
                );
              }

              if (active) {
                var originalTabindex = element.getAttribute('data-scene-original-tabindex');
                if (originalTabindex === '') element.removeAttribute('tabindex');
                else element.setAttribute('tabindex', originalTabindex);
              } else {
                element.setAttribute('tabindex', '-1');
              }
            }
          );
        }
      });
    };

    var move = function (index) {
      var target = Math.max(0, Math.min(slides.length - 1, index));
      update(target);
      track.scrollTo({ left: slides[target].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    };

    if (previous) previous.addEventListener('click', function () { move(current - 1); });
    if (next) next.addEventListener('click', function () { move(current + 1); });

    track.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      if (event.key === 'Home') move(0);
      else if (event.key === 'End') move(slides.length - 1);
      else move(current + (event.key === 'ArrowRight' ? 1 : -1));
    });

    track.addEventListener('scroll', function () {
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(function () {
        var closest = 0;
        var distance = Infinity;
        slides.forEach(function (slide, slideIndex) {
          var nextDistance = Math.abs(slide.offsetLeft - track.scrollLeft);
          if (nextDistance < distance) { closest = slideIndex; distance = nextDistance; }
        });
        if (closest !== current) update(closest);
      });
    }, { passive: true });

    window.addEventListener('resize', function () {
      track.scrollTo({ left: slides[current].offsetLeft, behavior: 'auto' });
    });

    carousel.classList.add('is-ready');
    if (controls) controls.hidden = false;
    update(0);
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
            companyStatus.textContent = companyForm.getAttribute('data-error-message') || 'The brief could not be sent. Please try again, or use the email link above.';
            companyStatus.hidden = false;
          }
        });
    });
  }
})();
