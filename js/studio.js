/* Shared navigation, choosing an order route, and the existing company enquiry. */
(() => {
  'use strict';
  document.querySelectorAll('[data-language]').forEach(link => {
    link.addEventListener('click', () => {
      try { localStorage.setItem('sm-lang', link.dataset.language); } catch (_) { /* Storage is optional. */ }
    });
  });
  const picker = document.querySelector('.language-picker');
  if (picker) {
    document.addEventListener('click', event => { if (!picker.contains(event.target)) picker.open = false; });
    picker.addEventListener('keydown', event => {
      if (event.key === 'Escape') { picker.open = false; picker.querySelector('summary').focus(); }
    });
  }
  const dialog = document.querySelector('[data-buy-dialog]');
  if (dialog && typeof dialog.showModal === 'function') {
    let previousFocus;
    const buttons = [...dialog.querySelectorAll('[data-buy-route]')];
    const panels = [...dialog.querySelectorAll('[data-buy-panel]')];
    const originalRoutes = panels.map(panel => panel.innerHTML);
    const selectRoute = (route, remember = false) => {
      if (!buttons.some(button => button.dataset.buyRoute === route)) route = 'korea';
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.buyRoute === route)));
      panels.forEach(panel => { panel.hidden = panel.dataset.buyPanel !== route; });
      if (remember && route !== 'business') {
        try { localStorage.setItem('sm-order-route', route); } catch (_) { /* Optional preference. */ }
      }
    };
    document.querySelectorAll('[data-buy]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        previousFocus = link;
        const product = link.dataset.product || '';
        const picture = dialog.querySelector('[data-buy-image]');
        dialog.querySelector('[data-buy-product]').textContent = product;
        dialog.querySelector('[data-buy-selection]').hidden = !product;
        if (product && link.dataset.productImage) picture.src = link.dataset.productImage;
        else picture.removeAttribute('src');
        picture.hidden = !link.dataset.productImage;
        let route = document.documentElement.lang === 'ko' ? 'korea' : 'international';
        try { route = localStorage.getItem('sm-order-route') || route; } catch (_) { /* No location lookup. */ }
        const unique = link.dataset.buyKind === 'unique';
        panels.forEach((panel, index) => {
          if (panel.dataset.buyPanel !== 'international') return;
          panel.innerHTML = originalRoutes[index];
          if (unique) {
            panel.querySelector('h3').textContent = dialog.dataset.uniqueTitle;
            panel.querySelector('p').textContent = dialog.dataset.uniqueText;
            const action = panel.querySelector('a');
            action.href = 'https://ig.me/m/studio.monjo';
            action.textContent = dialog.dataset.uniqueLink + ' ↗';
          }
        });
        selectRoute(route);
        dialog.showModal();
      });
    });
    buttons.forEach(button => button.addEventListener('click', () => selectRoute(button.dataset.buyRoute, true)));
    dialog.querySelector('[data-buy-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      // Only a backdrop click, never a click within the dialog's content.
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => { if (previousFocus) previousFocus.focus({ preventScroll: true }); });
    dialog.querySelector('[data-buy-dismiss]').addEventListener('click', () => dialog.close());
  }
  document.querySelectorAll('[data-edition]').forEach(link => {
    link.addEventListener('click', () => {
      const field = document.querySelector('select[name="edition"]');
      if (field) field.value = link.dataset.edition;
    });
  });
  // Autoplay silently when visible. Respect reduced motion and an intentional pause.
  const video = document.querySelector('.writing-film video');
  if (video) {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    let userPaused = false;
    let managedPause = false;
    video.muted = true;
    video.playsInline = true;
    const pause = () => {
      if (!video.paused) { managedPause = true; video.pause(); }
    };
    const sync = () => {
      if (document.hidden || !inView) { pause(); return; }
      if (motion.matches) return;
      if (!userPaused) {
        const attempt = video.play();
        if (attempt) attempt.catch(() => {}); // Native controls remain if autoplay is blocked.
      }
    };
    video.autoplay = !motion.matches;
    if (motion.matches) { video.removeAttribute('autoplay'); pause(); }
    video.addEventListener('pause', () => {
      if (managedPause) managedPause = false;
      else if (inView && !document.hidden) userPaused = true;
    });
    video.addEventListener('play', () => {
      userPaused = false;
      if (document.hidden || !inView) pause();
    });
    video.addEventListener('loadeddata', sync);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', () => {
      video.autoplay = !motion.matches;
      if (motion.matches) pause();
      else sync();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        sync();
      }, { threshold: 0.15 }).observe(video);
    } else { inView = true; sync(); }
  }
  const form = document.querySelector('[data-company-form]');
  if (!form) return;
  const submit = form.querySelector('button[type="submit"]');
  const status = form.querySelector('[data-company-form-status]');
  const done = document.querySelector('[data-company-form-done]');
  const submitLabel = submit.innerHTML;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled || !form.reportValidity()) return;
    const payload = new FormData(form);
    form.setAttribute('aria-busy', 'true');
    submit.disabled = true;
    submit.textContent = form.dataset.sendingMessage;
    status.hidden = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, { method: 'POST', body: payload, headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Enquiry not accepted');
      form.hidden = true;
      done.hidden = false;
      done.focus();
    } catch (_) {
      status.textContent = form.dataset.errorMessage;
      status.hidden = false;
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
      submit.innerHTML = submitLabel;
      form.setAttribute('aria-busy', 'false');
    }
  });
})();
