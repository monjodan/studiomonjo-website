/**
 * Renders Studio Monjo's notebook commerce surfaces from data/notebooks.json.
 * Populates whichever of these exist on the current page:
 *   - #offerGrid         → A6 / A5 commission product cards
 *   - #readyMadeGrid     → ready-made one-of-a-kind pieces (available or sold)
 *   - #faqList           → FAQ items
 *   - [data-commission="primary"|"secondary"|"nav"] → global CTAs
 *
 * CTA logic:
 *   - If naverShopUrl is set, primary CTAs point to Naver Shop (external).
 *   - Otherwise they open the commission form modal (js/commission.js).
 *   - Ready-made pieces with status="available" get a Reserve CTA that
 *     opens the form with the piece pre-filled.
 *
 * No mailto links. Email is never placed in the HTML.
 */
(function () {
  var JSON_URL = '/data/notebooks.json';

  function fmtKRW(n) { return '\u20A9' + Number(n).toLocaleString('ko-KR'); }
  function fmtEUR(n) { return '\u20AC' + Number(n); }

  function openForm(opts) {
    if (typeof window.openCommission === 'function') window.openCommission(opts);
  }

  function commissionBehaviorFor(size, data) {
    if (data.naverShopUrl) {
      return { href: data.naverShopUrl, label: 'Buy on Naver \u2197', external: true };
    }
    return { href: null, label: 'Commission \u2197', external: false, formOpts: { size: size || null } };
  }

  function buyPieceBehaviorFor(piece, data) {
    if (piece.naverUrl) return { href: piece.naverUrl, label: 'Buy on Naver \u2197', external: true };
    if (data.naverShopUrl) return { href: data.naverShopUrl, label: 'Buy on Naver \u2197', external: true };
    return { href: null, label: 'Reserve \u2197', external: false, formOpts: { size: piece.size, piece: piece.title } };
  }

  function wireLink(el, behavior) {
    if (!el) return;
    if (behavior.href) {
      el.href = behavior.href;
      el.target = behavior.external ? '_blank' : '';
      el.rel = behavior.external ? 'noopener noreferrer' : '';
      el.onclick = null;
    } else {
      el.href = '#';
      el.removeAttribute('target');
      el.removeAttribute('rel');
      el.onclick = function (e) {
        e.preventDefault();
        openForm(behavior.formOpts || {});
      };
    }
    if (behavior.label) el.textContent = behavior.label;
  }

  function renderOfferings(data) {
    var root = document.getElementById('offerGrid');
    if (!root) return;
    root.innerHTML = '';
    (data.offerings || []).forEach(function (o) {
      var card = document.createElement('article');
      card.className = 'offer-card';

      var imgWrap = document.createElement('div');
      imgWrap.className = 'offer-img';
      var pic = document.createElement('picture');
      if (o.imageWebp) {
        var src = document.createElement('source');
        src.srcset = o.imageWebp; src.type = 'image/webp';
        pic.appendChild(src);
      }
      var imEl = document.createElement('img');
      imEl.src = o.image;
      imEl.alt = o.name + ' hand-painted notebook — example';
      imEl.loading = 'lazy';
      imEl.decoding = 'async';
      pic.appendChild(imEl);
      imgWrap.appendChild(pic);
      card.appendChild(imgWrap);

      var body = document.createElement('div');
      body.className = 'offer-body';

      var head = document.createElement('div');
      head.className = 'offer-head';

      var nameWrap = document.createElement('div');
      var name = document.createElement('h3');
      name.className = 'offer-name';
      name.textContent = o.name;
      nameWrap.appendChild(name);
      var tag = document.createElement('span');
      tag.className = 'offer-tag';
      tag.textContent = o.tag || '';
      nameWrap.appendChild(tag);
      head.appendChild(nameWrap);

      var priceRow = document.createElement('div');
      priceRow.className = 'offer-price-row';
      var price = document.createElement('div');
      price.className = 'offer-price';
      price.textContent = fmtKRW(o.price.krw);
      priceRow.appendChild(price);
      var alt = document.createElement('div');
      alt.className = 'offer-price-alt';
      alt.textContent = fmtEUR(o.price.eur);
      priceRow.appendChild(alt);
      head.appendChild(priceRow);

      body.appendChild(head);

      var dim = document.createElement('div');
      dim.className = 'offer-dim';
      dim.textContent = o.dimensions + ' · ' + (o.pages || '~80') + ' pages';
      body.appendChild(dim);

      if (o.description) {
        var desc = document.createElement('p');
        desc.className = 'offer-desc';
        desc.textContent = o.description;
        body.appendChild(desc);
      }

      var included = [
        'Paper made for fountain pens — no feathering, no bleed-through',
        (o.pages || 24) + ' pages',
        'Hand-painted cover in ink and watercolour',
        'Hand-stitched binding',
        'Signed and stamped'
      ];
      var inc = document.createElement('div');
      inc.className = 'offer-included';
      included.forEach(function (t) {
        var d = document.createElement('div');
        d.className = 'offer-included-item';
        d.textContent = t;
        inc.appendChild(d);
      });
      body.appendChild(inc);

      var cta = document.createElement('a');
      cta.className = 'btn btn-primary offer-cta';
      wireLink(cta, commissionBehaviorFor(o.name, data));
      body.appendChild(cta);

      card.appendChild(body);
      root.appendChild(card);
    });
  }

  function statusLabel(s) {
    if (s === 'sold') return 'Sold';
    if (s === 'reserved') return 'Reserved';
    if (s === 'coming-soon') return 'Coming soon';
    return 'Available';
  }

  function renderReadyMade(data) {
    var root = document.getElementById('readyMadeGrid');
    if (!root) return;
    var items = (data.readyMade || data.portfolio || []).slice();
    if (!items.length) { root.innerHTML = ''; return; }

    // Available pieces first, then reserved, then sold
    var order = { available: 0, reserved: 1, 'coming-soon': 2, sold: 3 };
    items.sort(function (a, b) {
      return (order[a.status] || 9) - (order[b.status] || 9);
    });

    // Adaptive lede based on how many are actually available
    var available = items.filter(function (i) { return i.status === 'available'; }).length;
    var lede = document.getElementById('readyMadeLede');
    if (lede) {
      if (available > 0) {
        lede.textContent = available + ' available right now. Each piece is unique — once it\u2019s gone, it\u2019s gone. If nothing here fits, commission one above.';
      } else {
        lede.textContent = 'Nothing available right now — previous pieces below. For something new, commission one above.';
      }
    }

    root.innerHTML = '';
    items.forEach(function (p) {
      var status = p.status || 'available';
      var card = document.createElement('article');
      card.className = 'piece-card is-' + status;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'piece-img';
      btn.setAttribute('aria-label', p.title + ' — view gallery');
      btn.dataset.gallery = JSON.stringify(p.gallery || [{ src: p.image, caption: p.title }]);

      var pic = document.createElement('picture');
      if (p.imageWebp) {
        var src = document.createElement('source');
        src.srcset = p.imageWebp; src.type = 'image/webp';
        pic.appendChild(src);
      }
      var img = document.createElement('img');
      img.src = p.image;
      img.alt = p.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      pic.appendChild(img);
      btn.appendChild(pic);

      var pill = document.createElement('span');
      pill.className = 'piece-status piece-status-' + status;
      pill.textContent = statusLabel(status);
      btn.appendChild(pill);
      card.appendChild(btn);

      var info = document.createElement('div');
      info.className = 'piece-info';

      var top = document.createElement('div');
      top.className = 'piece-top';
      var title = document.createElement('span');
      title.className = 'piece-title';
      title.textContent = p.title;
      top.appendChild(title);
      var meta = document.createElement('span');
      meta.className = 'piece-meta';
      meta.textContent = [p.size, p.year].filter(Boolean).join(' · ');
      top.appendChild(meta);
      info.appendChild(top);

      if (p.price) {
        var price = document.createElement('div');
        price.className = 'piece-price';
        price.textContent = fmtKRW(p.price.krw) + '  ·  ' + fmtEUR(p.price.eur);
        info.appendChild(price);
      }

      if (status === 'available' || status === 'reserved') {
        var cta = document.createElement('a');
        cta.className = 'btn btn-primary piece-cta';
        if (status === 'reserved') {
          cta.textContent = 'Reserved';
          cta.setAttribute('aria-disabled', 'true');
          cta.href = '#';
          cta.addEventListener('click', function (e) { e.preventDefault(); });
        } else {
          wireLink(cta, buyPieceBehaviorFor(p, data));
        }
        info.appendChild(cta);
      }

      card.appendChild(info);
      root.appendChild(card);
    });
    document.dispatchEvent(new CustomEvent('notebooks:rendered'));
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
      q.textContent = f.q;
      var a = document.createElement('div');
      a.className = 'faq-a';
      a.textContent = f.a;
      item.appendChild(q);
      item.appendChild(a);
      root.appendChild(item);
    });
  }

  function wireGlobalCtas(data) {
    var hasNaver = !!data.naverShopUrl;
    var primaryBeh = hasNaver
      ? { href: data.naverShopUrl, label: 'Shop on Naver \u2197', external: true }
      : { href: null, label: 'Commission \u2197', external: false };

    document.querySelectorAll('[data-commission="primary"]').forEach(function (el) {
      wireLink(el, primaryBeh);
    });
    document.querySelectorAll('[data-commission="secondary"]').forEach(function (el) {
      // Secondary is always the form path (international, enquiries)
      wireLink(el, { href: null, label: 'International \u2197', external: false });
      el.hidden = !hasNaver; // only show as a "secondary" when there's a primary Naver path
    });
    document.querySelectorAll('[data-commission="nav"]').forEach(function (el) {
      if (hasNaver) {
        el.href = data.naverShopUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
        el.textContent = 'Shop \u2197';
      } else {
        el.href = '/notebooks/';
        el.removeAttribute('target');
        el.removeAttribute('rel');
        el.textContent = 'Shop';
      }
    });

    // Footer Naver link
    var footerNaver = document.getElementById('footerNaver');
    if (footerNaver) {
      if (hasNaver) {
        footerNaver.href = data.naverShopUrl;
        footerNaver.target = '_blank';
        footerNaver.rel = 'noopener noreferrer';
        footerNaver.textContent = 'Naver Shop';
      } else {
        footerNaver.style.display = 'none';
      }
    }
  }

  fetch(JSON_URL, { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error('load'); return r.json(); })
    .then(function (data) {
      wireGlobalCtas(data);
      renderOfferings(data);
      renderReadyMade(data);
      renderFaq(data);
    })
    .catch(function () {
      var root = document.getElementById('offerGrid') || document.getElementById('readyMadeGrid');
      if (root) root.innerHTML = '<p class="essays-error">Could not load the notebooks.</p>';
    });
})();
