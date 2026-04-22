/**
 * Renders Studio Monjo's notebook commerce surfaces from data/notebooks.json.
 * Populates whichever of these exist on the current page:
 *   - #offerGrid        → A6 / A5 commission product cards
 *   - #portfolioGrid    → past commissions (sold) gallery
 *   - #faqList          → FAQ items
 *   - [data-commission="primary"|"secondary"|"nav"] → global CTAs
 *
 * CTA logic:
 *   - If naverShopUrl is set, primary CTAs point to Naver Shop (external).
 *   - Otherwise they open the commission form modal (js/commission.js).
 *   - "International" secondary CTA always opens the form modal.
 *
 * No mailto links. Email is never placed in the HTML.
 */
(function () {
  var JSON_URL = '/data/notebooks.json';

  function fmtKRW(n) { return '\u20A9' + Number(n).toLocaleString('ko-KR'); }
  function fmtEUR(n) { return '\u20AC' + Number(n); }

  function openForm(size) {
    if (typeof window.openCommission === 'function') window.openCommission(size);
  }

  function primaryBehaviorFor(size, data) {
    if (data.naverShopUrl) {
      return {
        href: data.naverShopUrl,
        label: 'Buy on Naver \u2197',
        external: true
      };
    }
    return {
      href: null, // opens modal
      label: 'Commission \u2197',
      external: false,
      size: size || null
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
        openForm(behavior.size);
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
        'Hand-painted cover in ink and watercolour',
        'Hand-stitched binding, red thread',
        'Handmade paper inside',
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
      wireLink(cta, primaryBehaviorFor(o.name, data));
      body.appendChild(cta);

      card.appendChild(body);
      root.appendChild(card);
    });
  }

  function renderPortfolio(data) {
    var root = document.getElementById('portfolioGrid');
    if (!root) return;
    root.innerHTML = '';
    (data.portfolio || []).forEach(function (p) {
      var card = document.createElement('article');
      card.className = 'portfolio-card';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'portfolio-img';
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

      var sold = document.createElement('span');
      sold.className = 'portfolio-sold';
      sold.textContent = p.status === 'sold' ? 'Sold' : (p.status || '');
      btn.appendChild(sold);
      card.appendChild(btn);

      var info = document.createElement('div');
      info.className = 'portfolio-info';
      var title = document.createElement('span');
      title.className = 'portfolio-title';
      title.textContent = p.title;
      var meta = document.createElement('span');
      meta.className = 'portfolio-meta';
      meta.textContent = [p.size, p.year].filter(Boolean).join(' · ');
      info.appendChild(title);
      info.appendChild(meta);
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
      renderPortfolio(data);
      renderFaq(data);
    })
    .catch(function () {
      var root = document.getElementById('offerGrid') || document.getElementById('portfolioGrid');
      if (root) root.innerHTML = '<p class="essays-error">Could not load the notebooks.</p>';
    });
})();
