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
 * Strings come from window.SM.T (see js/i18n.js). JSON data supports
 * locale-suffixed fields: tag_en/tag_ko, description_en/description_ko,
 * q_en/q_ko, a_en/a_ko, title_en/title_ko.
 *
 * No mailto links. Email is never placed in the HTML.
 */
(function () {
  var JSON_URL = '/data/notebooks.json';
  var T = (window.SM && window.SM.T) || function (k) { return k; };
  var pick = (window.SM && window.SM.pickLocalized) || function (o, f) { return (o && o[f]) || ''; };
  var numberLocale = (window.SM && window.SM.numberLocale) || function () { return 'ko-KR'; };

  function fmtKRW(n) { return '\u20A9' + Number(n).toLocaleString(numberLocale()); }
  function fmtEUR(n) { return '\u20AC' + Number(n); }

  function openForm(opts) {
    if (typeof window.openCommission === 'function') window.openCommission(opts);
  }

  function commissionBehaviorFor(size, data) {
    if (data.naverShopUrl) {
      return { href: data.naverShopUrl, label: T('cta.buyOnNaver'), external: true };
    }
    return { href: null, label: T('cta.commission'), external: false, formOpts: { size: size || null } };
  }

  function buyPieceBehaviorFor(piece, data) {
    if (piece.naverUrl) return { href: piece.naverUrl, label: T('cta.buyOnNaver'), external: true };
    if (data.naverShopUrl) return { href: data.naverShopUrl, label: T('cta.buyOnNaver'), external: true };
    return {
      href: null,
      label: T('cta.reserve'),
      external: false,
      formOpts: { size: piece.size, piece: pick(piece, 'title') || piece.title || '' }
    };
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
      imEl.alt = T('offer.altExample', { name: o.name });
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
      tag.textContent = pick(o, 'tag') || o.tag || '';
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
      dim.textContent = T('offer.dimPages', { dims: o.dimensions, pages: o.pages || 24 });
      body.appendChild(dim);

      var descText = pick(o, 'description') || o.description;
      if (descText) {
        var desc = document.createElement('p');
        desc.className = 'offer-desc';
        desc.textContent = descText;
        body.appendChild(desc);
      }

      var included = [
        T('offer.included.paper'),
        T('offer.pages', { count: o.pages || 24 }),
        T('offer.included.cover'),
        T('offer.included.binding'),
        T('offer.included.signed')
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
    if (s === 'sold') return T('status.sold');
    if (s === 'reserved') return T('status.reserved');
    if (s === 'coming-soon') return T('status.comingSoon');
    return T('status.available');
  }

  function renderReadyMade(data) {
    var root = document.getElementById('readyMadeGrid');
    if (!root) return;
    var items = (data.readyMade || data.portfolio || []).slice();
    if (!items.length) { root.innerHTML = ''; return; }

    var order = { available: 0, reserved: 1, 'coming-soon': 2, sold: 3 };
    items.sort(function (a, b) {
      return (order[a.status] || 9) - (order[b.status] || 9);
    });

    var available = items.filter(function (i) { return i.status === 'available'; }).length;
    var lede = document.getElementById('readyMadeLede');
    if (lede) {
      if (available > 0) {
        lede.textContent = T('readyMade.ledeAvailable', { count: available });
      } else {
        lede.textContent = T('readyMade.ledeNone');
      }
    }

    root.innerHTML = '';
    items.forEach(function (p) {
      var status = p.status || 'available';
      var card = document.createElement('article');
      card.className = 'piece-card is-' + status;

      var title = pick(p, 'title') || p.title || '';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'piece-img';
      btn.setAttribute('aria-label', T('readyMade.gallery', { title: title }));
      btn.dataset.gallery = JSON.stringify(p.gallery || [{ src: p.image, caption: title }]);

      var pic = document.createElement('picture');
      if (p.imageWebp) {
        var src = document.createElement('source');
        src.srcset = p.imageWebp; src.type = 'image/webp';
        pic.appendChild(src);
      }
      var img = document.createElement('img');
      img.src = p.image;
      img.alt = title;
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
      var titleEl = document.createElement('span');
      titleEl.className = 'piece-title';
      titleEl.textContent = title;
      top.appendChild(titleEl);
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
          cta.textContent = T('cta.reserved');
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
      q.textContent = pick(f, 'q') || f.q || '';
      var a = document.createElement('div');
      a.className = 'faq-a';
      a.textContent = pick(f, 'a') || f.a || '';
      item.appendChild(q);
      item.appendChild(a);
      root.appendChild(item);
    });
  }

  function wireGlobalCtas(data) {
    var hasNaver = !!data.naverShopUrl;
    var primaryBeh = hasNaver
      ? { href: data.naverShopUrl, label: T('cta.shopOnNaver'), external: true }
      : { href: null, label: T('cta.commission'), external: false };

    document.querySelectorAll('[data-commission="primary"]').forEach(function (el) {
      wireLink(el, primaryBeh);
    });
    document.querySelectorAll('[data-commission="secondary"]').forEach(function (el) {
      wireLink(el, { href: null, label: T('cta.international'), external: false });
      el.hidden = !hasNaver;
    });
    document.querySelectorAll('[data-commission="nav"]').forEach(function (el) {
      var base = el.dataset.localeBase || '/';
      if (hasNaver) {
        el.href = data.naverShopUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
        el.textContent = T('cta.shopExt');
      } else {
        el.href = base + 'notebooks/';
        el.removeAttribute('target');
        el.removeAttribute('rel');
        el.textContent = T('cta.shop');
      }
    });

    var footerNaver = document.getElementById('footerNaver');
    if (footerNaver) {
      if (hasNaver) {
        footerNaver.href = data.naverShopUrl;
        footerNaver.target = '_blank';
        footerNaver.rel = 'noopener noreferrer';
        footerNaver.textContent = T('cta.naverShop');
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
      if (root) root.innerHTML = '<p class="essays-error">' + T('load.notebooksError') + '</p>';
    });
})();
