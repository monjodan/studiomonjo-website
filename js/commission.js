/**
 * Commission form modal. Injected into the page, triggered by
 * window.openCommission(size?).
 *
 * Submits to a Formspree-compatible endpoint (set in data/notebooks.json
 * → formspreeEndpoint). Posts JSON so the page stays put and can show
 * a success state inline.
 *
 * No email address is ever written into the HTML.
 */
(function () {
  var JSON_URL = '/data/notebooks.json';
  var config = null;
  var modal = null;

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'cmx';
    wrap.id = 'commissionModal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'cmxTitle');
    wrap.hidden = true;
    wrap.innerHTML = [
      '<div class="cmx-backdrop" data-close></div>',
      '<form class="cmx-panel" id="cmxForm" novalidate>',
      '  <div class="cmx-head">',
      '    <span class="cmx-title" id="cmxTitle">Commission a notebook</span>',
      '    <button type="button" class="cmx-close" data-close aria-label="Close">✕</button>',
      '  </div>',
      '  <div class="cmx-body">',
      '    <p class="cmx-intro">Tell me which size and any direction you have in mind. I\'ll reply within a day with a timeline, shipping quote, and payment details.</p>',
      '',
      '    <fieldset class="cmx-field">',
      '      <legend class="cmx-label">Size <span class="req">*</span></legend>',
      '      <div class="cmx-radios">',
      '        <label class="cmx-radio">',
      '          <input type="radio" name="size" value="A6" required>',
      '          <span class="cmx-radio-tile">',
      '            <span class="cmx-radio-tile-name">A6 — Pocket</span>',
      '            <span class="cmx-radio-tile-meta">₩38,000 / €26</span>',
      '          </span>',
      '        </label>',
      '        <label class="cmx-radio">',
      '          <input type="radio" name="size" value="A5" required>',
      '          <span class="cmx-radio-tile">',
      '            <span class="cmx-radio-tile-name">A5 — Desk</span>',
      '            <span class="cmx-radio-tile-meta">₩68,000 / €46</span>',
      '          </span>',
      '        </label>',
      '      </div>',
      '    </fieldset>',
      '',
      '    <div class="cmx-field">',
      '      <label class="cmx-label" for="cmxDirection">Direction <span class="cmx-help" style="text-transform:none;letter-spacing:0;font-weight:400;color:var(--ink-light)">— optional</span></label>',
      '      <textarea class="cmx-textarea" id="cmxDirection" name="direction" placeholder="A mood, a palette, a subject. Or leave blank and I\'ll choose." rows="4"></textarea>',
      '    </div>',
      '',
      '    <div class="cmx-field">',
      '      <label class="cmx-label" for="cmxName">Name <span class="req">*</span></label>',
      '      <input class="cmx-input" type="text" id="cmxName" name="name" required autocomplete="name">',
      '    </div>',
      '',
      '    <div class="cmx-field">',
      '      <label class="cmx-label" for="cmxEmail">Email <span class="req">*</span></label>',
      '      <input class="cmx-input" type="email" id="cmxEmail" name="email" required autocomplete="email" placeholder="you@example.com">',
      '    </div>',
      '',
      '    <div class="cmx-field">',
      '      <label class="cmx-label" for="cmxCountry">Country / shipping region <span class="req">*</span></label>',
      '      <input class="cmx-input" type="text" id="cmxCountry" name="country" required autocomplete="country-name" placeholder="e.g. France, Korea, Japan">',
      '    </div>',
      '',
      '    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px">',
      '    <input type="hidden" name="_subject" value="New notebook commission — Studio Monjo">',
      '',
      '    <button type="submit" class="cmx-submit" id="cmxSubmit">Send enquiry</button>',
      '    <div class="cmx-status" id="cmxStatus" hidden></div>',
      '  </div>',
      '  <div class="cmx-foot">I reply personally, usually within 24 hours. No newsletters, no third-party sharing.</div>',
      '</form>'
    ].join('\n');
    document.body.appendChild(wrap);
    modal = wrap;
    wireModal();
  }

  function wireModal() {
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
    modal.querySelector('#cmxForm').addEventListener('submit', onSubmit);
  }

  function open(size) {
    if (!modal) return;
    // Preselect size if given
    if (size) {
      var r = modal.querySelector('input[name="size"][value="' + size + '"]');
      if (r) r.checked = true;
    }
    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('open'); });
    document.body.classList.add('locked');
    setTimeout(function () {
      var first = modal.querySelector('input[name="size"]:checked') || modal.querySelector('input[name="size"]');
      if (first) first.focus();
    }, 320);
  }

  function close() {
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(function () { modal.hidden = true; }, 300);
    document.body.classList.remove('locked');
  }

  function setStatus(kind, text) {
    var el = modal.querySelector('#cmxStatus');
    if (!text) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = text;
    el.className = 'cmx-status cmx-status--' + kind;
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var endpoint = (config && config.formspreeEndpoint) || '';

    if (!endpoint) {
      setStatus('error', 'The commission form is being set up — please try again shortly.');
      return;
    }

    var submit = form.querySelector('#cmxSubmit');
    submit.disabled = true;
    submit.textContent = 'Sending…';
    setStatus('', '');

    var data = new FormData(form);
    fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (r) {
        if (r.ok) {
          setStatus('success', 'Sent. I\'ll reply within 24 hours.');
          form.reset();
          submit.textContent = 'Send enquiry';
          submit.disabled = false;
        } else {
          return r.json().then(function (j) {
            var msg = (j && j.errors && j.errors[0] && j.errors[0].message) || 'Something went wrong. Please try again.';
            setStatus('error', msg);
            submit.textContent = 'Send enquiry';
            submit.disabled = false;
          });
        }
      })
      .catch(function () {
        setStatus('error', 'Network error. Please try again.');
        submit.textContent = 'Send enquiry';
        submit.disabled = false;
      });
  }

  // Expose global trigger
  window.openCommission = function (size) { open(size); };
  window.closeCommission = close;

  // Build the modal, then load config
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }

  fetch(JSON_URL, { credentials: 'same-origin' })
    .then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (c) { config = c; })
    .catch(function () { config = {}; });
})();
