/**
 * Loads data/brunch-featured.json and renders the essay grid.
 * Falls back to profile link if fetch fails (e.g. offline local preview).
 */
(function () {
  var JSON_URL = 'data/brunch-featured.json';
  var grid = document.getElementById('essaysGrid');
  var loading = document.getElementById('essaysLoading');
  var sectionCta = document.getElementById('essaysSectionCta');
  var viewAll = document.getElementById('essaysViewAll');
  var countEl = document.getElementById('essaysArticleCount');
  var introEl = document.getElementById('essaysIntro');

  if (!grid) return;

  function clearLoading() {
    if (loading) loading.remove();
  }

  function setIntro(data) {
    if (!introEl || typeof data.articleCount !== 'number') return;
    var n = data.articleCount;
    var text =
      n +
      ' essay' +
      (n === 1 ? '' : 's') +
      ' published on Brunch. Questions of consciousness, control, aesthetics, and what it means to live between languages and cultures. Written in Korean — the language that fits the thinking.';
    introEl.textContent = text;
  }

  function renderError(msg) {
    clearLoading();
    grid.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'essays-error';
    p.textContent = msg;
    grid.appendChild(p);
  }

  function render(data) {
    clearLoading();
    if (sectionCta) sectionCta.href = data.profileUrl;
    if (viewAll) viewAll.href = data.profileUrl;
    if (countEl) countEl.textContent = String(data.articleCount);
    setIntro(data);

    grid.innerHTML = '';
    (data.featured || []).forEach(function (essay) {
      var a = document.createElement('a');
      a.href = essay.url;
      a.className = 'essay-item';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      var lang = document.createElement('div');
      lang.className = 'essay-lang';
      lang.textContent = '한국어 · Essay';

      var title = document.createElement('div');
      title.className = 'essay-title';
      title.textContent = essay.title || '';

      var ex = document.createElement('div');
      ex.className = 'essay-excerpt';
      ex.textContent = essay.excerpt || '';

      var read = document.createElement('div');
      read.className = 'essay-read';
      read.textContent = 'Read on Brunch →';

      a.appendChild(lang);
      a.appendChild(title);
      a.appendChild(ex);
      a.appendChild(read);
      grid.appendChild(a);
    });
  }

  fetch(JSON_URL, { credentials: 'same-origin' })
    .then(function (r) {
      if (!r.ok) throw new Error('Could not load essay list.');
      return r.json();
    })
    .then(render)
    .catch(function () {
      renderError(
        'Could not load the essay list. Open the Brunch profile below, or run: node scripts/sync-brunch-feed.mjs'
      );
      if (sectionCta) sectionCta.href = 'https://brunch.co.kr/@444d2811f4b84ad';
      if (viewAll) viewAll.href = 'https://brunch.co.kr/@444d2811f4b84ad';
    });
})();
