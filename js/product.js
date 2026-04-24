/**
 * Product detail modal — full view of one notebook edition.
 *
 * Triggered by window.openProduct({ edition, data, status }). Shows:
 *   - Photo gallery (prev/next navigation, caption)
 *   - Edition number, size, year, edition status ("5 of 20 remaining")
 *   - Price (KRW + EUR)
 *   - Long-form description
 *   - Materials summary linking to /<locale>/materials/
 *   - Two buy buttons: Korea + France (hrefs from data.shopKorea /
 *     data.shopFrance, or per-edition overrides edition.buyKorea /
 *     edition.buyFrance). If a URL is not set, the button falls back
 *     to a visibly-disabled "shop opening soon" state.
 *   - Sold-out editions show a "Sold out — edition of 20 complete."
 *     notice instead of the buy buttons.
 *
 * All user-facing strings come from js/i18n.js via window.SM.T; data
 * uses locale-suffixed fields via window.SM.pickLocalized.
 */
(function () {
  var T = (window.SM && window.SM.T) || function (k) { return k; };
  var pick = (window.SM && window.SM.pickLocalized) || function (o, f) { return (o && o[f]) || ''; };
  var numberLocale = (window.SM && window.SM.numberLocale) || function () { return 'en-US'; };
  var localeFn = (window.SM && window.SM.locale) || function () { return 'en'; };

  function fmtKRW(n) { return '\u20A9' + Number(n).toLocaleString(numberLocale()); }
  function fmtEUR(n) { return '\u20AC' + Number(n); }

  var modal = null;
  var state = { gallery: [], index: 0, edition: null };

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'pdm';
    wrap.id = 'productModal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-labelledby', 'pdmTitle');
    wrap.hidden = true;
    wrap.innerHTML = [
      '<div class="pdm-backdrop" data-close></div>',
      '<div class="pdm-panel">',
      '  <button type="button" class="pdm-close" data-close aria-label="' + T('pdm.close') + '">\u2715</button>',
      '  <div class="pdm-grid">',
      '    <div class="pdm-gallery">',
      '      <div class="pdm-stage">',
      '        <img id="pdmImg" src="" alt="">',
      '        <button type="button" class="pdm-nav pdm-prev" id="pdmPrev" aria-label="' + T('pdm.prev') + '">\u2039</button>',
      '        <button type="button" class="pdm-nav pdm-next" id="pdmNext" aria-label="' + T('pdm.next') + '">\u203A</button>',
      '      </div>',
      '      <div class="pdm-caption" id="pdmCaption"></div>',
      '      <div class="pdm-thumbs" id="pdmThumbs"></div>',
      '    </div>',
      '    <div class="pdm-info">',
      '      <div class="pdm-eyebrow"><span id="pdmEditionNo"></span> <span class="pdm-sep">·</span> <span id="pdmSize"></span></div>',
      '      <h2 class="pdm-title" id="pdmTitle"></h2>',
      '      <div class="pdm-status-row">',
      '        <span class="pdm-status" id="pdmStatus"></span>',
      '        <span class="pdm-price" id="pdmPrice"></span>',
      '      </div>',
      '      <p class="pdm-desc" id="pdmDesc"></p>',
      '      <ul class="pdm-features">',
      '        <li class="pdm-feature pdm-feature--fp"><span class="pdm-feature-label">' + T('pdm.featureLabelPaper') + '</span><span class="pdm-feature-value">' + T('pdm.featurePaper') + ' <span class="pdm-feature-note">' + T('pdm.featurePaperNote') + '</span></span></li>',
      '        <li class="pdm-feature"><span class="pdm-feature-label">' + T('pdm.featureLabelInside') + '</span><span class="pdm-feature-value">' + T('pdm.featureInside') + '</span></li>',
      '        <li class="pdm-feature"><span class="pdm-feature-label">' + T('pdm.featureLabelCover') + '</span><span class="pdm-feature-value">' + T('pdm.featureCover') + '</span></li>',
      '        <li class="pdm-feature"><span class="pdm-feature-label">' + T('pdm.featureLabelPaint') + '</span><span class="pdm-feature-value">' + T('pdm.featurePaint') + '</span></li>',
      '      </ul>',
      '      <a href="/' + localeFn() + '/materials/" class="pdm-materials-link">' + T('pdm.aboutMaterials') + '</a>',
      '      <div class="pdm-buy" id="pdmBuy"></div>',
      '      <div class="pdm-fine" id="pdmFine"></div>',
      '    </div>',
      '  </div>',
      '</div>'
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
      if (!modal.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });
    document.getElementById('pdmPrev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    document.getElementById('pdmNext').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
  }

  function galleryCaption(g) {
    return pick(g, 'caption') || g.caption || '';
  }

  function showImage() {
    var g = state.gallery[state.index];
    if (!g) return;
    var img = document.getElementById('pdmImg');
    img.src = g.src;
    var cap = galleryCaption(g);
    var title = state.edition ? (pick(state.edition, 'name') || state.edition.name || state.edition.title || '') : '';
    img.alt = title + (cap ? ' — ' + cap : '');
    document.getElementById('pdmCaption').textContent = cap;
    Array.from(modal.querySelectorAll('.pdm-thumb')).forEach(function (t, i) {
      t.classList.toggle('is-active', i === state.index);
    });
  }
  function step(d) {
    if (!state.gallery.length) return;
    state.index = (state.index + d + state.gallery.length) % state.gallery.length;
    showImage();
  }

  function renderThumbs() {
    var root = document.getElementById('pdmThumbs');
    root.innerHTML = '';
    if (state.gallery.length < 2) return;
    state.gallery.forEach(function (g, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pdm-thumb' + (i === state.index ? ' is-active' : '');
      btn.setAttribute('aria-label', T('pdm.viewPhoto', { n: i + 1 }));
      var pic = document.createElement('picture');
      if (g.webp) {
        var src = document.createElement('source');
        src.srcset = g.webp; src.type = 'image/webp';
        pic.appendChild(src);
      }
      var im = document.createElement('img');
      im.src = g.src; im.alt = galleryCaption(g);
      im.loading = 'lazy';
      pic.appendChild(im);
      btn.appendChild(pic);
      btn.addEventListener('click', function () { state.index = i; showImage(); });
      root.appendChild(btn);
    });
  }

  function renderBuy(edition, data, status) {
    var buyWrap = document.getElementById('pdmBuy');
    var fine = document.getElementById('pdmFine');
    buyWrap.innerHTML = '';

    if (status.soldOut) {
      var soldNote = document.createElement('div');
      soldNote.className = 'pdm-soldout';
      soldNote.textContent = T('pdm.soldOutNotice', { total: status.size });
      buyWrap.appendChild(soldNote);
      fine.textContent = T('pdm.soldOutFine');
      return;
    }

    var kr = edition.buyKorea || data.shopKorea || '';
    var fr = edition.buyFrance || data.shopFrance || '';

    buyWrap.appendChild(makeBuyButton('korea', kr, T('pdm.buyKorea'), T('pdm.koreaSoon')));
    buyWrap.appendChild(makeBuyButton('france', fr, T('pdm.buyFrance'), T('pdm.franceSoon')));

    var note;
    if (!kr && !fr) note = T('pdm.shopsSoon');
    else if (!kr) note = T('pdm.koreaSoonNote');
    else if (!fr) note = T('pdm.franceSoonNote');
    else note = T('pdm.availableFine');
    fine.textContent = note;
  }

  function makeBuyButton(region, href, liveLabel, soonLabel) {
    var a = document.createElement('a');
    a.className = 'pdm-buy-btn';
    a.dataset.region = region;
    if (href) {
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = liveLabel;
    } else {
      a.href = '#';
      a.setAttribute('aria-disabled', 'true');
      a.classList.add('is-disabled');
      a.textContent = soonLabel;
      a.addEventListener('click', function (e) { e.preventDefault(); });
    }
    return a;
  }

  function computeStatus(ed, data) {
    var size = ed.editionSize || data.editionSize || 20;
    var sold = Math.min(ed.soldCount || 0, size);
    var remaining = size - sold;
    return {
      size: size, sold: sold, remaining: remaining,
      soldOut: remaining <= 0,
      label: remaining <= 0
        ? T('edition.soldOutPill', { sold: sold, total: size })
        : T('edition.remaining', { count: remaining, total: size })
    };
  }

  function open(opts) {
    if (!modal) return;
    var ed = opts.edition;
    var data = opts.data || {};
    var status = opts.status || computeStatus(ed, data);
    state.edition = ed;
    state.gallery = ed.gallery && ed.gallery.length ? ed.gallery.slice() : [{ src: ed.image, webp: ed.imageWebp, caption: ed.title }];
    state.index = 0;

    var name = pick(ed, 'name') || ed.name || ed.title || '';

    document.getElementById('pdmEditionNo').textContent = ed.title || '';
    document.getElementById('pdmSize').textContent = ed.size + (ed.year ? ' · ' + ed.year : '');
    document.getElementById('pdmTitle').textContent = name;
    var statusEl = document.getElementById('pdmStatus');
    statusEl.textContent = status.label;
    statusEl.className = 'pdm-status pdm-status-' + (status.soldOut ? 'sold' : 'available');
    document.getElementById('pdmPrice').textContent = ed.price ? fmtKRW(ed.price.krw) + '  \u00B7  ' + fmtEUR(ed.price.eur) : '';
    var desc = pick(ed, 'description') || pick(ed, 'shortDescription') || ed.description || ed.shortDescription || '';
    document.getElementById('pdmDesc').textContent = desc;

    renderThumbs();
    showImage();
    renderBuy(ed, data, status);

    modal.hidden = false;
    requestAnimationFrame(function () { modal.classList.add('open'); });
    document.body.classList.add('locked');
    setTimeout(function () {
      var focusTarget = modal.querySelector('.pdm-close');
      if (focusTarget) focusTarget.focus();
    }, 320);
  }

  function close() {
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(function () { modal.hidden = true; }, 300);
    document.body.classList.remove('locked');
  }

  window.openProduct = open;
  window.closeProduct = close;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
