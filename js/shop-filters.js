/**
 * Shop filter row — category + hide-sold toggle.
 *
 * Markup contract on the shop page:
 *   <div class="shop-filters" data-shop-filters>
 *     <div class="shop-filter-group" data-filter-cats></div>
 *     <label class="filter-toggle"><input type="checkbox" data-filter-hide-sold> Hide sold out</label>
 *     <span class="shop-filter-meta" data-filter-count></span>
 *   </div>
 *   <div class="ed-grid" data-editions-grid></div>
 *   <p class="grid-empty">No matches.</p>
 *
 * Called by js/notebooks.js after the editions are rendered into the grid.
 * Maintains state in URL hash params so filtered views are shareable.
 */
(function () {
  var T = (window.SM && window.SM.T) || function (k) { return k; };
  var pick = (window.SM && window.SM.pickLocalized) || function (o, f) { return (o && o[f]) || ''; };

  function readHashState() {
    var raw = (location.hash || '').replace(/^#/, '');
    var out = { cat: 'all', hideSold: false };
    raw.split('&').forEach(function (pair) {
      var kv = pair.split('=');
      if (kv[0] === 'cat' && kv[1]) out.cat = decodeURIComponent(kv[1]);
      else if (kv[0] === 'sold' && kv[1] === '0') out.hideSold = true;
      else if (kv[0] && kv[1] === undefined) {
        // Old anchor like #notebook — accept as cat shortcut
        if (/^(notebook|bound-card|postcard)$/.test(kv[0])) out.cat = kv[0];
      }
    });
    return out;
  }

  function writeHashState(state) {
    var parts = [];
    if (state.cat && state.cat !== 'all') parts.push('cat=' + encodeURIComponent(state.cat));
    if (state.hideSold) parts.push('sold=0');
    var newHash = parts.length ? '#' + parts.join('&') : '';
    if (location.hash !== newHash) {
      history.replaceState(null, '', location.pathname + location.search + newHash);
    }
  }

  function init(data) {
    var bar = document.querySelector('[data-shop-filters]');
    if (!bar) return;
    var grid = document.querySelector('[data-editions-grid]');
    if (!grid) return;

    var state = readHashState();

    var catGroup = bar.querySelector('[data-filter-cats]');
    var hideSoldEl = bar.querySelector('[data-filter-hide-sold]');
    var countEl = bar.querySelector('[data-filter-count]');

    if (catGroup) {
      catGroup.innerHTML = '';
      var cats = data.categoryOrder || Object.keys(data.categories || {});
      var allBtn = makeChip('all', T('shop.filterAll'), state.cat === 'all');
      catGroup.appendChild(allBtn);
      cats.forEach(function (key) {
        var cat = (data.categories || {})[key];
        if (!cat) return;
        var label = pick(cat, 'label') || cat.label_en || key;
        catGroup.appendChild(makeChip(key, label, state.cat === key));
      });
    }
    if (hideSoldEl) {
      hideSoldEl.checked = !!state.hideSold;
      hideSoldEl.addEventListener('change', function () {
        state.hideSold = hideSoldEl.checked;
        apply();
      });
    }

    function makeChip(key, label, isActive) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'filter-chip' + (isActive ? ' is-active' : '');
      b.dataset.cat = key;
      b.textContent = label;
      b.addEventListener('click', function () {
        state.cat = key;
        Array.prototype.forEach.call(catGroup.querySelectorAll('.filter-chip'), function (c) {
          c.classList.toggle('is-active', c.dataset.cat === key);
        });
        apply();
      });
      return b;
    }

    function apply() {
      var cards = grid.querySelectorAll('.ed-card');
      var visible = 0;
      cards.forEach(function (card) {
        var cat = card.dataset.category;
        var sold = card.dataset.sold === '1';
        var passCat = state.cat === 'all' || cat === state.cat;
        var passSold = !state.hideSold || !sold;
        var show = passCat && passSold;
        card.dataset.hidden = show ? 'false' : 'true';
        if (show) visible++;
      });
      grid.classList.toggle('is-empty', visible === 0);
      if (countEl) {
        if (visible === 0) countEl.textContent = '';
        else if (visible === 1) countEl.textContent = T('shop.matchOne');
        else countEl.textContent = T('shop.matchN', { n: visible });
      }
      writeHashState(state);
    }

    apply();

    window.addEventListener('hashchange', function () {
      var fresh = readHashState();
      state.cat = fresh.cat;
      state.hideSold = fresh.hideSold;
      Array.prototype.forEach.call(catGroup.querySelectorAll('.filter-chip'), function (c) {
        c.classList.toggle('is-active', c.dataset.cat === state.cat);
      });
      if (hideSoldEl) hideSoldEl.checked = state.hideSold;
      apply();
    });
  }

  window.initShopFilters = init;
})();
