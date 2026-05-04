/**
 * Renders Studio Monjo's editions from data/notebooks.json.
 *
 * Populates every element with [data-editions-grid] on the page. The
 * data-category attribute filters which editions render in that grid.
 * If absent, the grid renders all editions.
 *
 * Three product types live in the same data file: "notebook",
 * "bound-card", "postcard". Each has a category default for size,
 * pages, and price. Per-edition fields override the category default.
 *
 * Also renders #faqList if present.
 */
(function () {
  var JSON_URL = '/data/notebooks.json';
  var T = (window.SM && window.SM.T) || function (k) { return k; };
  var pick = (window.SM && window.SM.pickLocalized) || function (o, f) { return (o && o[f]) || ''; };
  var numberLocale = (window.SM && window.SM.numberLocale) || function () { return 'en-US'; };

  function fmtKRW(n) { return '₩' + Number(n).toLocaleString(numberLocale()); }

  function categoryFor(ed, data) {
    var c = ed.category || 'notebook';
    return (data.categories && data.categories[c]) || {};
  }

  function resolved(ed, data) {
    var cat = categoryFor(ed, data);
    return {
      size: ed.size || cat.size || '',
      pages: (ed.pages != null) ? ed.pages : (cat.pages != null ? cat.pages : 24),
      price: ed.price || cat.price || null,
      title: pick(ed, 'title') || ed.title || ''
    };
  }

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

  function renderGrid(root, data) {
    var category = root.getAttribute('data-category') || null;
    var items = (data.editions || []).slice();
    if (category) {
      items = items.filter(function (ed) { return (ed.category || 'notebook') === category; });
    }

    if (!items.length) {
      var emptyKey = root.getAttribute('data-empty-key') || 'editions.empty';
      root.innerHTML = '<p class="editions-empty">' + T(emptyKey) + '</p>';
      return;
    }

    items.sort(function (a, b) {
      var sa = editionStatus(a, data.editionSize).soldOut ? 1 : 0;
      var sb = editionStatus(b, data.editionSize).soldOut ? 1 : 0;
      return sa - sb;
    });

    root.innerHTML = '';
    items.forEach(function (ed) {
      root.appendChild(makeCard(ed, data));
    });
  }

  function makeCard(ed, data) {
    var s = editionStatus(ed, data.editionSize);
    var r = resolved(ed, data);
    var name = pick(ed, 'name') || ed.name || '';

    var card = document.createElement('article');
    card.className = 'ed-card' + (s.soldOut ? ' is-sold' : ' is-available');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', r.title + (name ? ', ' + name : ''));

    var img = document.createElement('div');
    img.className = 'ed-img';
    if (ed.image) {
      var pic = document.createElement('picture');
      if (ed.imageWebp) {
        var src = document.createElement('source');
        src.srcset = ed.imageWebp; src.type = 'image/webp';
        pic.appendChild(src);
      }
      var imEl = document.createElement('img');
      imEl.src = ed.image;
      imEl.alt = r.title + (name ? ', ' + name : '');
      imEl.loading = 'lazy';
      imEl.decoding = 'async';
      pic.appendChild(imEl);
      img.appendChild(pic);
    } else {
      img.classList.add('ed-img--placeholder');
      img.setAttribute('aria-hidden', 'true');
    }

    var pill = document.createElement('span');
    pill.className = 'ed-status ed-status-' + (s.soldOut ? 'sold' : 'available');
    pill.textContent = s.soldOut ? T('status.sold') : T('status.available');
    img.appendChild(pill);

    var view = document.createElement('span');
    view.className = 'ed-view';
    view.innerHTML = '<span class="ed-view-label"></span><span class="ed-view-arrow" aria-hidden="true">→</span>';
    view.querySelector('.ed-view-label').textContent = T('cta.view');
    img.appendChild(view);

    card.appendChild(img);

    card.dataset.category = ed.category || 'notebook';
    card.dataset.sold = s.soldOut ? '1' : '0';

    var info = document.createElement('div');
    info.className = 'ed-info';

    var top = document.createElement('div');
    top.className = 'ed-top';
    var title = document.createElement('div');
    title.className = 'ed-title';
    if (name) {
      title.innerHTML = '<span class="ed-no"></span><span class="ed-name"></span>';
      title.querySelector('.ed-no').textContent = r.title;
      title.querySelector('.ed-name').textContent = name;
    } else {
      title.textContent = r.title;
    }
    top.appendChild(title);
    if (r.size) {
      var meta = document.createElement('span');
      meta.className = 'ed-meta';
      meta.textContent = r.size;
      top.appendChild(meta);
    }
    info.appendChild(top);

    var edLine = document.createElement('div');
    edLine.className = 'ed-count';
    edLine.textContent = s.label;
    info.appendChild(edLine);

    if (r.price && r.price.krw) {
      var price = document.createElement('div');
      price.className = 'ed-price';
      price.textContent = fmtKRW(r.price.krw);
      info.appendChild(price);
    }

    card.appendChild(info);

    var openDetail = function () {
      if (typeof window.openProduct === 'function') {
        window.openProduct({ edition: ed, data: data, status: s, resolved: r });
      }
    };
    card.addEventListener('click', openDetail);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDetail();
      }
    });

    return card;
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

  function renderHomeTiles(data) {
    var root = document.querySelector('[data-shop-tiles]');
    if (!root) return;
    var order = data.categoryOrder || Object.keys(data.categories || {});
    root.innerHTML = '';
    order.forEach(function (key) {
      var cat = (data.categories || {})[key];
      if (!cat) return;
      var sample = (data.editions || []).find(function (e) { return e.category === key && e.image; });
      var label = pick(cat, 'label') || cat.label_en || key;
      var size = cat.size || '';
      var price = cat.price && cat.price.krw ? fmtKRW(cat.price.krw) : '';

      var tile = document.createElement('a');
      tile.className = 'shop-tile';
      tile.href = '/' + ((window.SM && window.SM.locale && window.SM.locale()) || 'en') + '/shop/#' + key;

      var imgWrap = document.createElement('div');
      imgWrap.className = 'shop-tile-img';
      if (sample && sample.image) {
        var pic = document.createElement('picture');
        if (sample.imageWebp) {
          var src = document.createElement('source');
          src.srcset = sample.imageWebp; src.type = 'image/webp';
          pic.appendChild(src);
        }
        var im = document.createElement('img');
        im.src = sample.image; im.alt = '';
        im.loading = 'lazy';
        pic.appendChild(im);
        imgWrap.appendChild(pic);
      } else {
        imgWrap.classList.add('shop-tile-img--placeholder');
      }
      tile.appendChild(imgWrap);

      var meta = document.createElement('div');
      meta.className = 'shop-tile-meta';
      var lbl = document.createElement('div');
      lbl.className = 'shop-tile-label';
      lbl.textContent = label;
      meta.appendChild(lbl);
      var foot = document.createElement('div');
      foot.className = 'shop-tile-foot';
      foot.innerHTML = '<span class="shop-tile-size"></span><span class="shop-tile-price"></span>';
      foot.querySelector('.shop-tile-size').textContent = size;
      foot.querySelector('.shop-tile-price').textContent = price;
      meta.appendChild(foot);
      tile.appendChild(meta);

      root.appendChild(tile);
    });
  }

  fetch(JSON_URL, { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error('load'); return r.json(); })
    .then(function (data) {
      window.__monjoData = data;
      document.querySelectorAll('[data-editions-grid]').forEach(function (root) {
        renderGrid(root, data);
      });
      renderFaq(data);
      renderHomeTiles(data);
      if (typeof window.initShopFilters === 'function') window.initShopFilters(data);
    })
    .catch(function () {
      document.querySelectorAll('[data-editions-grid]').forEach(function (root) {
        root.innerHTML = '<p class="editions-empty">' + T('editions.error') + '</p>';
      });
    });
})();
