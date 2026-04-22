/**
 * Commission form modal. Injected into the page, triggered by
 * window.openCommission(size?).
 *
 * Submits to a Formspree-compatible endpoint (set in data/notebooks.json
 * → formspreeEndpoint). Posts JSON so the page stays put and can show
 * a success state inline.
 *
 * Strings come from window.SM.T (see js/i18n.js).
 */
(function () {
  var JSON_URL = '/data/notebooks.json';
  var T = (window.SM && window.SM.T) || function (k) { return k; };
  var config = null;
  var modal = null;

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function build() {
    var priceA6 = '\u20A938,000 / \u20AC26';
    var priceA5 = '\u20A968,000 / \u20AC46';

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
      '    <span class="cmx-title" id="cmxTitle">' + esc(T('commission.title')) + '</span>',
      '    <button type="button" class="cmx-close" data-close aria-label="' + esc(T('commission.close')) + '">\u2715</button>',
      '  </div>',
      '  <div class="cmx-body">',
      '    <p class="cmx-intro" id="cmxIntro">' + esc(T('commission.intro')) + '</p>',
      '    <div class="cmx-piece" id="cmxPiece" hidden></div>',
      '    <input type="hidden" name="piece" id="cmxPieceField">',
      '',
      '    <div class="cmx-field">',
      '      <span class="cmx-label" id="cmxSizeLabel">' + esc(T('commission.size')) + ' <span class="req">' + esc(T('commission.requiredMark')) + '</span></span>',
      '      <div class="cmx-radios" role="radiogroup" aria-labelledby="cmxSizeLabel">',
      '        <label class="cmx-radio">',
      '          <input type="radio" name="size" value="A6" required>',
      '          <span class="cmx-radio-tile">',
      '            <span class="cmx-radio-tile-name">' + esc(T('commission.sizeA6')) + '</span>',
      '            <span class="cmx-radio-tile-meta">' + priceA6 + '</span>',
      '          </span>',
      '        </label>',
      '        <label class="cmx-radio">',
      '          <input type="radio" name="size" value="A5" required>',
      '          <span class="cmx-radio-tile">',
      '            <span class="cmx-radio-tile-name">' + esc(T('commission.sizeA5')) + '</span>',
      '            <span class="cmx-radio-tile-meta">' + priceA5 + '</span>',
      '          </span>',
      '        </label>',
      '      </div>',
      '    </div>',
      '',
      '    <div class="cmx-field">',
      '      <label class="cmx-label" for="cmxDirection">' + esc(T('commission.direction')) + ' <span class="cmx-help" style="text-transform:none;letter-spacing:0;font-weight:400;color:var(--ink-light)">' + esc(T('commission.directionOptional')) + '</span></label>',
      '      <textarea class="cmx-textarea" id="cmxDirection" name="direction" placeholder="' + esc(T('commission.directionPh')) + '" rows="4"></textarea>',
      '    </div>',
      '',
      '    <div class="cmx-field">',
      '      <label class="cmx-label" for="cmxName">' + esc(T('commission.name')) + ' <span class="req">' + esc(T('commission.requiredMark')) + '</span></label>',
      '      <input class="cmx-input" type="text" id="cmxName" name="name" required autocomplete="name">',
      '    </div>',
      '',
      '    <div class="cmx-field">',
      '      <label class="cmx-label" for="cmxEmail">' + esc(T('commission.email')) + ' <span class="req">' + esc(T('commission.requiredMark')) + '</span></label>',
      '      <input class="cmx-input" type="email" id="cmxEmail" name="email" required autocomplete="email" placeholder="' + esc(T('commission.emailPh')) + '">',
      '    </div>',
      '',
      '    <div class="cmx-field">',
      '      <label class="cmx-label" for="cmxCountry">' + esc(T('commission.country')) + ' <span class="req">' + esc(T('commission.requiredMark')) + '</span></label>',
      '      <input class="cmx-input" type="text" id="cmxCountry" name="country" required autocomplete="country-name" placeholder="' + esc(T('commission.countryPh')) + '">',
      '    </div>',
      '',
      '    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px">',
      '    <input type="hidden" name="_subject" value="' + esc(T('commission.subjectCommission')) + '">',
      '    <input type="hidden" name="locale" value="' + esc((window.SM && window.SM.locale && window.SM.locale()) || 'en') + '">',
      '',
      '    <button type="submit" class="cmx-submit" id="cmxSubmit">' + esc(T('commission.send')) + '</button>',
      '    <div class="cmx-status" id="cmxStatus" hidden></div>',
      '  </div>',
      '  <div class="cmx-done" id="cmxDone" hidden>',
      '    <div class="cmx-done-mark" aria-hidden="true">\u2713</div>',
      '    <div class="cmx-done-title">' + esc(T('commission.doneTitle')) + '</div>',
      '    <p class="cmx-done-body">' + esc(T('commission.doneBody')) + '</p>',
      '    <button type="button" class="cmx-done-close" data-close>' + esc(T('commission.close')) + '</button>',
      '  </div>',
      '  <div class="cmx-foot">' + esc(T('commission.foot')) + '</div>',
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

  function open(opts) {
    if (!modal) return;
    var o = (typeof opts === 'string') ? { size: opts } : (opts || {});
    if (o.size) {
      var r = modal.querySelector('input[name="size"][value="' + o.size + '"]');
      if (r) r.checked = true;
    }
    var pieceEl = modal.querySelector('#cmxPiece');
    var pieceField = modal.querySelector('#cmxPieceField');
    var subjectField = modal.querySelector('input[name="_subject"]');
    var title = modal.querySelector('#cmxTitle');
    var intro = modal.querySelector('#cmxIntro');
    if (o.piece) {
      pieceEl.hidden = false;
      pieceEl.innerHTML =
        '<span class="cmx-piece-label">' + esc(T('commission.pieceLabel')) + '</span>' +
        '<span class="cmx-piece-name">' + esc(o.piece) + '</span>';
      pieceField.value = o.piece;
      if (subjectField) subjectField.value = T('commission.subjectReserve', { piece: o.piece });
      if (title) title.textContent = T('commission.titleReserve');
      if (intro) intro.textContent = T('commission.introReserve');
    } else {
      pieceEl.hidden = true;
      pieceEl.innerHTML = '';
      pieceField.value = '';
      if (subjectField) subjectField.value = T('commission.subjectCommission');
      if (title) title.textContent = T('commission.title');
      if (intro) intro.textContent = T('commission.intro');
    }
    hideDone();
    setStatus('', '');
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
    setTimeout(function () { modal.hidden = true; hideDone(); }, 300);
    document.body.classList.remove('locked');
  }

  function setStatus(kind, text) {
    var el = modal.querySelector('#cmxStatus');
    if (!text) { el.hidden = true; return; }
    el.hidden = false;
    el.textContent = text;
    el.className = 'cmx-status cmx-status--' + kind;
  }

  function showDone() {
    var body = modal.querySelector('.cmx-body');
    var done = modal.querySelector('#cmxDone');
    if (body) body.hidden = true;
    if (done) done.hidden = false;
  }
  function hideDone() {
    var body = modal.querySelector('.cmx-body');
    var done = modal.querySelector('#cmxDone');
    if (body) body.hidden = false;
    if (done) done.hidden = true;
  }

  function onSubmit(e) {
    e.preventDefault();
    var form = e.currentTarget;
    var endpoint = (config && config.formspreeEndpoint) || '';

    if (!endpoint) {
      setStatus('error', T('commission.errorSetup'));
      return;
    }

    var submit = form.querySelector('#cmxSubmit');
    submit.disabled = true;
    submit.textContent = T('commission.sending');
    setStatus('', '');

    var data = new FormData(form);
    fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (r) {
        if (r.ok) {
          form.reset();
          submit.textContent = T('commission.send');
          submit.disabled = false;
          showDone();
        } else {
          return r.json().then(function (j) {
            var msg = (j && j.errors && j.errors[0] && j.errors[0].message) || T('commission.errorGeneric');
            setStatus('error', msg);
            submit.textContent = T('commission.send');
            submit.disabled = false;
          });
        }
      })
      .catch(function () {
        setStatus('error', T('commission.errorNetwork'));
        submit.textContent = T('commission.send');
        submit.disabled = false;
      });
  }

  window.openCommission = function (size) { open(size); };
  window.closeCommission = close;

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
