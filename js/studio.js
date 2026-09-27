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
    picker.addEventListener('focusout', event => {
      if (event.relatedTarget && !picker.contains(event.relatedTarget)) picker.open = false;
    });
    picker.addEventListener('keydown', event => {
      if (event.key === 'Escape') { picker.open = false; picker.querySelector('summary').focus(); }
      if (event.key === 'Tab') setTimeout(() => {
        if (!picker.contains(document.activeElement)) picker.open = false;
      }, 0);
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
  // Size guide: opens on hover or focus with a mouse, on tap otherwise; a click keeps it open.
  const sizeGuide = document.getElementById('size-guide');
  const sizeTrigger = document.querySelector('[data-size-trigger]');
  if (sizeGuide && sizeTrigger && typeof sizeGuide.showPopover === 'function') {
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
    let pinned = false;
    let closeTimer;
    const isOpen = () => sizeGuide.matches(':popover-open');
    const place = () => {
      // Phones keep the centred sheet; wider screens anchor it below the trigger.
      if (window.innerWidth < 700) { sizeGuide.removeAttribute('style'); return; }
      const rect = sizeTrigger.getBoundingClientRect();
      const width = sizeGuide.offsetWidth;
      const left = Math.min(Math.max(16, rect.right - width), window.innerWidth - width - 16);
      const below = rect.bottom + 12;
      const top = below + sizeGuide.offsetHeight > window.innerHeight - 16 ? Math.max(16, rect.top - sizeGuide.offsetHeight - 12) : below;
      sizeGuide.style.cssText = `margin:0;inset:auto;top:${top}px;left:${left}px`;
    };
    const open = () => { clearTimeout(closeTimer); if (!isOpen()) sizeGuide.showPopover({ source: sizeTrigger }); };
    const closeSoon = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => { if (!pinned && isOpen()) sizeGuide.hidePopover(); }, 180);
    };
    sizeGuide.addEventListener('toggle', event => {
      const opened = event.newState === 'open';
      sizeTrigger.setAttribute('aria-expanded', String(opened));
      if (opened) place(); else pinned = false;
    });
    sizeTrigger.addEventListener('click', event => {
      // Take over the native toggle so a hover-opened guide stays open when clicked.
      event.preventDefault();
      if (isOpen() && pinned) { sizeGuide.hidePopover(); return; }
      pinned = true;
      open();
    });
    [sizeTrigger, sizeGuide].forEach(element => {
      element.addEventListener('pointerenter', event => { if (hover.matches && event.pointerType === 'mouse') open(); });
      element.addEventListener('pointerleave', event => { if (hover.matches && event.pointerType === 'mouse') closeSoon(); });
    });
    sizeTrigger.addEventListener('focus', () => { if (hover.matches && sizeTrigger.matches(':focus-visible')) open(); });
    sizeTrigger.addEventListener('blur', event => { if (!sizeGuide.contains(event.relatedTarget)) closeSoon(); });
    window.addEventListener('resize', () => { if (isOpen()) place(); });
    window.addEventListener('scroll', () => { if (isOpen() && !pinned) sizeGuide.hidePopover(); else if (isOpen()) place(); }, { passive: true });
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
      status.textContent = form.dataset.errorMessage + ' ';
      if (form.dataset.errorLink) {
        const fallback = document.createElement('a');
        fallback.href = 'https://ig.me/m/studio.monjo';
        fallback.target = '_blank';
        fallback.rel = 'noopener noreferrer';
        fallback.textContent = form.dataset.errorLink + ' ↗';
        status.append(fallback);
      }
      status.hidden = false;
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
      submit.innerHTML = submitLabel;
      form.setAttribute('aria-busy', 'false');
    }
  });
})();
