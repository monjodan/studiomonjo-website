/**
 * Renders Studio Monjo's notebook editions from data/notebooks.json.
 * Populates whichever of these exist on the current page:
 *   - #editionsGrid    → edition cards (click opens product modal)
 *   - #faqList         → FAQ items
 *
 * Each edition is a limited run (default: 20). Cards show either
 * "N of 20 remaining" or "Sold out — 20/20". Clicking opens the
 * product detail modal (js/product.js) with the gallery, description,
 * materials, and the two Buy buttons (Korea / France).
 *
 * Strings come from window.SM.T (js/i18n.js). JSON data supports
 * locale-suffixed fields: name_en/name_ko, description_en/description_ko,
 * shortDescription_en/shortDescription_ko, caption_en/caption_ko,
 * q_en/a_en, q_ko/a_ko.
 */
(function () {
  var JSON_URL = '/data/notebooks.json';
  var T = (window.SM && window.SM.T) || function (k) { return k; };
  var pick = (window.SM && window.SM.pickLocalized) || function (o, f) { return (o && o[f]) || ''; };
  var numberLocale = (window.SM && window.SM.numberLocale) || function () { return 'en-US'; };

  function fmtKRW(n) { return '\u20A9' + Number(n).toLocaleString(numberLocale()); }
  function fmtEUR(n) { return '\u20AC' + Number(n); }

  function editionStatus(ed, editionSize) {
    var size = ed.editionSize || editionSize || 20;
    var sold = Math.min(ed.soldCount || 0, size);
    var remaining = size - sold;
    return {
      size: size,
      sold: sold,
      remaining: remaining,
      soldOut: remaining <= 0,
      label: remaining <= 0
        ? T('edition.soldOutPill', { sold: sold, total: size })
        : T('edition.remaining', { count: remaining, total: size })
    };
  }

  function renderEditions(data) {
    var root = document.getElementById('editionsGrid');
    if (!root) return;

    var category = root.getAttribute('data-category') || null;
    var items = (data.editions || []).slice();
    if (category) {
      items = items.filter(function (ed) {
        var c = ed.category || 'notebook';
        return c === category;
      });
    }
    if (!items.length) {
      root.innerHTML = '<p class="essays-error">' + T('editions.empty') + '</p>';
      return;
    }

    items.sort(function (a, b) {
      var sa = editionStatus(a, data.editionSize).soldOut ? 1 : 0;
      var sb = editionStatus(b, data.editionSize).soldOut ? 1 : 0;
      return sa - sb;
    });

    root.innerHTML = '';
    items.forEach(function (ed) {
      var s = editionStatus(ed, data.editionSize);
      var name = pick(ed, 'name') || ed.name || '';

      var card = document.createElement('article');
      card.className = 'ed-card' + (s.soldOut ? ' is-sold' : ' is-available');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', (ed.title || '') + (name ? ' — ' + name : ''));

      var img = document.createElement('div');
      img.className = 'ed-img';
      var pic = document.createElement('picture');
      if (ed.imageWebp) {
        var src = document.createElement('source');
        src.srcset = ed.imageWebp; src.type = 'image/webp';
        pic.appendChild(src);
      }
      var imEl = document.createElement('img');
      imEl.src = ed.image;
      imEl.alt = (ed.title || '') + (name ? ' — ' + name : '');
      imEl.loading = 'lazy';
      imEl.decoding = 'async';
      pic.appendChild(imEl);
      img.appendChild(pic);

      var pill = document.createElement('span');
      pill.className = 'ed-status ed-status-' + (s.soldOut ? 'sold' : 'available');
      pill.textContent = s.soldOut ? T('status.sold') : T('status.available');
      img.appendChild(pill);
      card.appendChild(img);

      var info = document.createElement('div');
      info.className = 'ed-info';

      var top = document.createElement('div');
      top.className = 'ed-top';
      var title = document.createElement('div');
      title.className = 'ed-title';
      if (name) {
        title.innerHTML = (ed.title || '') + ' <span class="ed-name"></span>';
        title.querySelector('.ed-name').textContent = name;
      } else {
        title.textContent = ed.title || '';
      }
      top.appendChild(title);
      var meta = document.createElement('span');
      meta.className = 'ed-meta';
      meta.textContent = ed.size;
      top.appendChild(meta);
      info.appendChild(top);

      var edLine = document.createElement('div');
      edLine.className = 'ed-count';
      edLine.textContent = s.label;
      info.appendChild(edLine);

      if (ed.price) {
        var price = document.createElement('div');
        price.className = 'ed-price';
        price.textContent = fmtKRW(ed.price.krw) + '  \u00B7  ' + fmtEUR(ed.price.eur);
        info.appendChild(price);
      }

      card.appendChild(info);

      var openDetail = function () {
        if (typeof window.openProduct === 'function') {
          window.openProduct({ edition: ed, data: data, status: s });
        }
      };
      card.addEventListener('click', openDetail);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetail();
        }
      });

      root.appendChild(card);
    });
  }

  function renderFaq(data) {
    var root = document.getElementById('faqList');
    if (!root) return;
    root.innerHTML = '';
    (data.faq || []).forEach(function (f) {
      var item = document.createElement('div');
      item.className = 'faq-item';
      var q = document.createElement('div');
      q.className = 'faq-q';
      q.textContent = pick(f, 'q') || f.q || '';
      var a = document.createElement('div');
      a.className = 'faq-a';
      a.textContent = pick(f, 'a') || f.a || '';
      item.appendChild(q);
      item.appendChild(a);
      root.appendChild(item);
    });
  }

  fetch(JSON_URL, { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error('load'); return r.json(); })
    .then(function (data) {
      window.__monjoData = data;
      renderEditions(data);
      renderFaq(data);
    })
    .catch(function () {
      var root = document.getElementById('editionsGrid');
      if (root) root.innerHTML = '<p class="essays-error">' + T('editions.error') + '</p>';
    });
})();
