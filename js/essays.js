/**
 * Renders Brunch essays from data/brunch-featured.json.
 *   - #essaysGrid      → featured essays (home page, ~4)
 *   - #essaysAll       → all essays (essays page) — falls back to featured if not yet synced
 */
(function () {
  var JSON_URL = '/data/brunch-featured.json';

  var fallbackProfile = 'https://brunch.co.kr/@444d2811f4b84ad';

  function makeItem(essay) {
    var a = document.createElement('a');
    a.href = essay.url;
    a.className = 'essay-item';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    var text = document.createElement('div');
    text.className = 'essay-text';

    var lang = document.createElement('div');
    lang.className = 'essay-lang';
    lang.textContent = '한국어 · Essay';
    text.appendChild(lang);

    var title = document.createElement('div');
    title.className = 'essay-title';
    title.textContent = essay.title || '';
    text.appendChild(title);

    if (essay.excerpt) {
      var ex = document.createElement('div');
      ex.className = 'essay-excerpt';
      ex.textContent = essay.excerpt;
      text.appendChild(ex);
    }

    var read = document.createElement('span');
    read.className = 'essay-read';
    read.textContent = 'Read →';

    a.appendChild(text);
    a.appendChild(read);
    return a;
  }

  function renderList(root, list, emptyMsg) {
    root.innerHTML = '';
    if (!list || !list.length) {
      var p = document.createElement('p');
      p.className = 'essays-error';
      p.textContent = emptyMsg || 'No essays yet.';
      root.appendChild(p);
      return;
    }
    list.forEach(function (e) { root.appendChild(makeItem(e)); });
  }

  function setIntro(data) {
    var introEl = document.getElementById('essaysIntro');
    if (!introEl || typeof data.articleCount !== 'number') return;
    var n = data.articleCount;
    introEl.textContent =
      n + ' essay' + (n === 1 ? '' : 's') +
      ' on Brunch — on consciousness, control, aesthetics, and living between languages and cultures.';
  }

  function wireViewAll(data) {
    var viewAll = document.getElementById('essaysViewAll');
    var countEl = document.getElementById('essaysArticleCount');
    if (viewAll) viewAll.href = data.profileUrl || fallbackProfile;
    if (countEl && typeof data.articleCount === 'number') countEl.textContent = String(data.articleCount);
  }

  function render(data) {
    setIntro(data);
    wireViewAll(data);

    var featuredRoot = document.getElementById('essaysGrid');
    if (featuredRoot) renderList(featuredRoot, data.featured || [], 'No essays yet.');

    var allRoot = document.getElementById('essaysAll');
    if (allRoot) {
      var list = (data.all && data.all.length) ? data.all : (data.featured || []);
      renderList(allRoot, list, 'Essay list unavailable — visit Brunch directly.');
    }
  }

  fetch(JSON_URL, { credentials: 'same-origin' })
    .then(function (r) { if (!r.ok) throw new Error('load'); return r.json(); })
    .then(render)
    .catch(function () {
      ['essaysGrid', 'essaysAll'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.innerHTML = '';
          var p = document.createElement('p');
          p.className = 'essays-error';
          p.textContent = 'Could not load essays. Visit Brunch directly below.';
          el.appendChild(p);
        }
      });
      var viewAll = document.getElementById('essaysViewAll');
      if (viewAll) viewAll.href = fallbackProfile;
    });
})();
