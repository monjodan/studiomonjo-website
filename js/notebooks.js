/**
 * Renders Studio Monjo's notebook commerce surfaces from data/notebooks.json.
 * Populates whichever of these exist on the current page:
 *   - #offerGrid         → A6 / A5 commission product cards
 *   - #portfolioGrid     → past commissions (sold) gallery
 *   - #faqList           → FAQ items
 *   - #homeFeatured      → 3-image teaser on the home page
 *   - #commissionPrimary, #commissionSecondary → global CTAs
 *
 * Also rewrites any link with [data-naver-url] when a Naver Shop URL is set.
 */
(function () {
  var JSON_URL = '/data/notebooks.json';

  function fmtKRW(n) { return '₩' + Number(n).toLocaleString('ko-KR'); }
  function fmtEUR(n) { return '€' + Number(n); }

  function mailto(email, subject, body) {
    var q = [];
    if (subject) q.push('subject=' + encodeURIComponent(subject));
    if (body) q.push('body=' + encodeURIComponent(body));
    return 'mailto:' + (email || '') + (q.length ? '?' + q.join('&') : '');
  }

  function buyHrefFor(offering, data) {
    if (data.naverShopUrl) return data.naverShopUrl;
    var subject = 'Commission — Studio Monjo ' + offering.name + ' notebook';
    var body =
      'Hi Jordan,\n\n' +
      'I would like to commission a ' + offering.name + ' notebook (' + fmtKRW(offering.price.krw) + ' / ' + fmtEUR(offering.price.eur) + ').\n\n' +
      'Direction (mood / palette / subject — or leave to you):\n\n' +
      'Shipping address:\n\n' +
      'Thank you.';
    return mailto(data.contactEmail, subject, body);
  }

  function intlMailto(data) {
    return mailto(
      data.contactEmail,
      'Studio Monjo — international commission',
      'Hi Jordan,\n\nI would like to commission a notebook and ship internationally. Size (A6 / A5):\n\nThank you.'
    );
  }

  function renderOfferings(data) {
    var root = document.getElementById('offerGrid');
    if (!root) return;
    root.innerHTML = '';
    (data.offerings || []).forEach(function (o) {
      var card = document.createElement('article');
      card.className = 'offer-card';

      var img = document.createElement('div');
      img.className = 'offer-img';
      var pic = document.createElement('picture');
      if (o.imageWebp) {
        var src = document.createElement('source');
        src.srcset = o.imageWebp;
        src.type = 'image/webp';
        pic.appendChild(src);
      }
      var imEl = document.createElement('img');
      imEl.src = o.image;
      imEl.alt = o.name + ' hand-painted notebook — example';
      imEl.loading = 'lazy';
      imEl.decoding = 'async';
      pic.appendChild(imEl);
      img.appendChild(pic);

      var tag = document.createElement('span');
      tag.className = 'offer-size-tag';
      tag.textContent = o.tag || o.name;
      img.appendChild(tag);
      card.appendChild(img);

      var body = document.createElement('div');
      body.className = 'offer-body';

      var head = document.createElement('div');
      head.className = 'offer-head';
      var name = document.createElement('h3');
      name.className = 'offer-name';
      name.innerHTML = o.name + ' <em>notebook</em>';
      var dim = document.createElement('span');
      dim.className = 'offer-dim';
      dim.textContent = o.dimensions;
      head.appendChild(name);
      head.appendChild(dim);
      body.appendChild(head);

      if (o.description) {
        var desc = document.createElement('p');
        desc.className = 'offer-desc';
        desc.textContent = o.description;
        body.appendChild(desc);
      }

      var price = document.createElement('div');
      price.className = 'offer-price';
      price.textContent = fmtKRW(o.price.krw);
      var alt = document.createElement('span');
      alt.className = 'offer-price-alt';
      alt.textContent = fmtEUR(o.price.eur);
      price.appendChild(alt);
      body.appendChild(price);

      var ctas = document.createElement('div');
      ctas.className = 'offer-ctas';

      var primary = document.createElement('a');
      primary.className = 'btn btn-primary';
      primary.href = buyHrefFor(o, data);
      primary.textContent = data.naverShopUrl ? 'Commission on Naver ↗' : 'Commission by email ↗';
      if (/^https?:/.test(primary.href)) { primary.target = '_blank'; primary.rel = 'noopener noreferrer'; }
      ctas.appendChild(primary);

      if (data.naverShopUrl) {
        var secondary = document.createElement('a');
        secondary.className = 'btn btn-ghost';
        secondary.href = intlMailto(data);
        secondary.textContent = 'International ↗';
        ctas.appendChild(secondary);
      }

      body.appendChild(ctas);
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
        src.srcset = p.imageWebp;
        src.type = 'image/webp';
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

  function renderHomeFeatured(data) {
    var root = document.getElementById('homeFeatured');
    if (!root) return;
    var picks = [];
    var seen = {};
    function push(src, webp) {
      if (!src || seen[src]) return;
      seen[src] = 1;
      picks.push({ image: src, imageWebp: webp });
    }
    (data.portfolio || []).forEach(function (p) {
      push(p.image, p.imageWebp);
    });
    (data.portfolio || []).forEach(function (p) {
      (p.gallery || []).forEach(function (g) { push(g.src, g.webp); });
    });
    picks = picks.slice(0, 3);
    root.innerHTML = '';
    picks.forEach(function (p) {
      var cell = document.createElement('a');
      cell.className = 'home-strip-cell';
      cell.href = '/notebooks/';
      cell.setAttribute('aria-label', 'See the notebooks');
      var pic = document.createElement('picture');
      if (p.imageWebp) {
        var src = document.createElement('source');
        src.srcset = p.imageWebp;
        src.type = 'image/webp';
        pic.appendChild(src);
      }
      var img = document.createElement('img');
      img.src = p.image;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      pic.appendChild(img);
      cell.appendChild(pic);
      root.appendChild(cell);
    });
  }

  function wireGlobalCtas(data) {
    var hasNaver = !!data.naverShopUrl;
    var primaryHref = hasNaver
      ? data.naverShopUrl
      : mailto(
          data.contactEmail,
          'Studio Monjo — notebook commission',
          'Hi Jordan,\n\nI would like to commission a notebook. Size (A6 / A5):\n\nDirection (mood / palette / subject — or leave to you):\n\nShipping address:\n\nThank you.'
        );
    var primaryLabel = hasNaver ? 'Commission on Naver ↗' : 'Commission by email ↗';

    document.querySelectorAll('[data-commission="primary"]').forEach(function (el) {
      el.href = primaryHref;
      el.textContent = primaryLabel;
      if (hasNaver) {
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      } else {
        el.removeAttribute('target');
        el.removeAttribute('rel');
      }
    });
    document.querySelectorAll('[data-commission="secondary"]').forEach(function (el) {
      el.href = intlMailto(data);
      el.hidden = !hasNaver;
      el.textContent = 'International ↗';
    });

    var footerNaver = document.getElementById('footerNaver');
    if (footerNaver) {
      if (hasNaver) {
        footerNaver.href = data.naverShopUrl;
        footerNaver.target = '_blank';
        footerNaver.rel = 'noopener noreferrer';
      } else {
        footerNaver.href = mailto(data.contactEmail, 'Studio Monjo — Naver Shop opening');
        footerNaver.textContent = 'Naver Shop (soon)';
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
      renderHomeFeatured(data);
    })
    .catch(function () {
      var root = document.getElementById('offerGrid') || document.getElementById('portfolioGrid');
      if (root) root.innerHTML = '<p class="nb-error">Could not load the notebook list. Email hello@studiomonjo.com.</p>';
    });
})();
