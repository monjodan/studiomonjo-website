/**
 * Robey — an ink drawing that lives on the plates.
 * Ported from new-design/support.js (the DC logic) into a standalone,
 * framework-free script. Include on any cahier page; Robey hops across
 * that page's images/videos and follows the cursor. He is pointer-events
 * :none, so he can never swallow a real click.
 *
 * Requires an element:  <div id="robey" aria-hidden="true"></div>
 * Optional: an element #line-practice — when it is on screen Robey stops
 * and stares (the "멍" / mung behaviour).
 */
(function () {
  var robeyEl = document.getElementById('robey');
  if (!robeyEl) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { robeyEl.style.display = 'none'; return; }

  var ink = '#33302B', wash = '#E7E4DC', washSide = '#D6D2C7', red = '#8E2F2A';
  robeyEl.innerHTML =
    '<svg viewBox="0 0 60 84" width="54" height="76" style="display:block;overflow:visible;">' +
    '<defs>' +
    '<filter id="mj-rough" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="7" result="n"></feTurbulence><feDisplacementMap in="SourceGraphic" in2="n" scale="1.9"></feDisplacementMap></filter>' +
    '<pattern id="mj-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width="4" height="4" fill="' + washSide + '"></rect><line x1="0" y1="0" x2="0" y2="4" stroke="rgba(51,48,43,0.28)" stroke-width="0.9"></line></pattern>' +
    '</defs>' +
    '<g data-puppet style="transform-origin:30px 78px;">' +
    '<g filter="url(#mj-rough)">' +
    '<g data-mung opacity="0"><circle cx="45" cy="12" r="1.6" fill="' + ink + '"></circle><circle cx="51" cy="7" r="2" fill="' + ink + '"></circle><circle cx="57.5" cy="2.5" r="2.4" fill="' + ink + '"></circle></g>' +
    '<line x1="30.5" y1="16" x2="29.8" y2="7" stroke="' + ink + '" stroke-width="1.7" stroke-linecap="round"></line>' +
    '<circle cx="29.6" cy="5.4" r="3.1" fill="' + red + '" stroke="' + ink + '" stroke-width="1.2"></circle>' +
    '<g data-head style="transform-origin:30px 34px;">' +
    '<rect x="13" y="15" width="34" height="26" rx="4.5" fill="' + wash + '" stroke="' + ink + '" stroke-width="2" stroke-linejoin="round"></rect>' +
    '<rect x="39.5" y="16.5" width="6" height="23" rx="2.8" fill="url(#mj-hatch)" opacity="0.85"></rect>' +
    '<circle cx="24" cy="28" r="2.3" fill="' + ink + '"></circle>' +
    '<circle cx="36" cy="28" r="2.3" fill="' + ink + '"></circle>' +
    '</g>' +
    '<rect x="21" y="43" width="18" height="15" rx="2" fill="' + wash + '" stroke="' + ink + '" stroke-width="1.9" stroke-linejoin="round"></rect>' +
    '<rect x="34" y="44.2" width="4.2" height="12.6" rx="1.8" fill="url(#mj-hatch)" opacity="0.85"></rect>' +
    '<g data-arm-l style="transform-origin:21px 46px;"><path d="M21 46 Q13 49 10.5 55" fill="none" stroke="' + ink + '" stroke-width="1.8" stroke-linecap="round"></path><circle cx="10" cy="56.5" r="2" fill="' + ink + '"></circle></g>' +
    '<g data-arm-r style="transform-origin:39px 46px;"><path d="M39 46 Q47 49 49.5 55" fill="none" stroke="' + ink + '" stroke-width="1.8" stroke-linecap="round"></path><circle cx="50" cy="56.5" r="2" fill="' + ink + '"></circle></g>' +
    '<g data-legs-a><line x1="26" y1="58" x2="23.5" y2="72" stroke="' + ink + '" stroke-width="1.9" stroke-linecap="round"></line><ellipse cx="22.6" cy="73.6" rx="3.4" ry="1.9" fill="' + ink + '"></ellipse><line x1="34" y1="58" x2="37.5" y2="72" stroke="' + ink + '" stroke-width="1.9" stroke-linecap="round"></line><ellipse cx="38.6" cy="73.6" rx="3.4" ry="1.9" fill="' + ink + '"></ellipse></g>' +
    '<g data-legs-b style="display:none;"><line x1="27.5" y1="58" x2="27.5" y2="72" stroke="' + ink + '" stroke-width="1.9" stroke-linecap="round"></line><ellipse cx="27.5" cy="73.6" rx="3.4" ry="1.9" fill="' + ink + '"></ellipse><line x1="33" y1="58" x2="33" y2="72" stroke="' + ink + '" stroke-width="1.9" stroke-linecap="round"></line><ellipse cx="33.5" cy="73.6" rx="3.4" ry="1.9" fill="' + ink + '"></ellipse></g>' +
    '</g></g></svg>';

  var puppet = robeyEl.querySelector('[data-puppet]');
  var headG = robeyEl.querySelector('[data-head]');
  var armL = robeyEl.querySelector('[data-arm-l]');
  var armR = robeyEl.querySelector('[data-arm-r]');
  var legsA = robeyEl.querySelector('[data-legs-a]');
  var legsB = robeyEl.querySelector('[data-legs-b]');
  var mungDots = robeyEl.querySelector('[data-mung]');

  /* modes: plat (on a plate) | hop (between plates) | floor (brief fallback) */
  var R = {
    x: Math.min(160, window.innerWidth * 0.25), yOff: 0, target: 0, facing: 1,
    nextThink: 0, lastStep: 0, stepFlag: false, speed: 42,
    hopWaveUntil: 0, waveUntil: 0, lean: 0, squashUntil: 0,
    mung: false, mungPhase: 0, mungIntersecting: false, dwellStart: 0, fleeUntil: 0,
    mode: 'floor', platEl: null, hopFromX: 0, hopFromY: 0, hopT0: 0, hopDur: 500, toEl: null, toFx: 0.5
  };
  R.target = R.x;
  var cursor = { x: -9999, y: -9999 };
  var lastT = performance.now();

  var rectOf = function (el) {
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return (r.width > 40 && r.height > 10) ? r : null;
  };
  var platY = function (r) { return r.top - window.innerHeight + 12; };
  var inBounds = function (r) {
    var H = window.innerHeight, W = window.innerWidth;
    return r && r.top > 120 && r.top < H - 130 && r.right > 40 && r.left < W - 40;
  };
  var candidates = function () {
    return Array.prototype.slice.call(document.querySelectorAll('img, video, [data-robey-plat]')).filter(function (el) {
      var r = rectOf(el);
      return r && r.width > 120 && inBounds(r);
    });
  };
  var startHop = function (t, el, fx) {
    var r = rectOf(el);
    if (!r) return false;
    R.toEl = el; R.toFx = fx != null ? fx : (0.15 + Math.random() * 0.7);
    R.hopFromX = R.x; R.hopFromY = R.yOff; R.hopT0 = t;
    var tx = r.left + R.toFx * r.width;
    var dist = Math.hypot(tx - R.x, platY(r) - R.yOff);
    R.hopDur = Math.max(380, Math.min(760, dist * 1.05));
    R.mode = 'hop';
    R.facing = tx >= R.x ? 1 : -1;
    return true;
  };
  var hopSomewhere = function (t, exclude) {
    var cands = candidates().filter(function (el) { return el !== exclude; });
    if (!cands.length) return false;
    var near = cands.map(function (el) { return { el: el, d: Math.abs(rectOf(el).left + rectOf(el).width / 2 - R.x) }; })
      .sort(function (a, b) { return a.d - b.d; });
    var pick = near[Math.random() < 0.6 ? 0 : Math.floor(Math.random() * near.length)].el;
    return startHop(t, pick);
  };
  var dropToFloor = function (t) {
    R.toEl = null; R.mode = 'hop';
    R.hopFromX = R.x; R.hopFromY = R.yOff; R.hopT0 = t; R.hopDur = 430;
  };

  var think = function (t) {
    if (R.mung) { R.nextThink = t + 1500; return; }
    if (R.mode === 'plat') {
      var r = rectOf(R.platEl);
      var roll = Math.random();
      if (!r || roll < 0.38) {
        if (!hopSomewhere(t, R.platEl)) { if (!r) dropToFloor(t); }
        R.nextThink = t + 1600 + Math.random() * 2200;
      } else {
        R.target = Math.max(r.left + 4, Math.min(r.right - 58, r.left + Math.random() * r.width));
        R.nextThink = t + 1500 + Math.random() * 2400;
      }
    } else if (R.mode === 'floor') {
      if (!hopSomewhere(t, null)) R.nextThink = t + 800;
      else R.nextThink = t + 1200;
    }
  };

  var raf = 0;
  var tick = function (t) {
    raf = requestAnimationFrame(tick);
    var dt = Math.min(50, t - lastT) / 1000;
    lastT = t;
    var W = window.innerWidth, H = window.innerHeight;

    R.mung = R.mungIntersecting && R.mode === 'plat';

    /* platform sanity */
    if (R.mode === 'plat') {
      var rr = rectOf(R.platEl);
      if (!rr || !inBounds(rr)) {
        if (!hopSomewhere(t, R.platEl)) dropToFloor(t);
      }
    }

    /* cursor dwelling on him? hop away so clicks reach the page */
    var topY = H - 88 + R.yOff;
    var inBox = cursor.x > R.x - 8 && cursor.x < R.x + 62 && cursor.y > topY - 10 && cursor.y < topY + 92;
    if (inBox && R.mode !== 'hop') {
      if (!R.dwellStart) R.dwellStart = t;
      else if (t - R.dwellStart > 600) {
        if (!hopSomewhere(t, R.platEl)) {
          var away = cursor.x >= R.x + 27 ? -1 : 1;
          R.target = Math.max(30, Math.min(W - 80, R.x + away * 140));
        }
        R.fleeUntil = t + 1600;
        R.dwellStart = 0;
      }
    } else R.dwellStart = 0;

    if (t > R.nextThink) think(t);

    var effTarget = R.target;
    if (R.mung && t > R.fleeUntil) effTarget = R.x;

    /* motion */
    var moving = false;
    if (R.mode === 'hop') {
      var p = Math.min(1, (t - R.hopT0) / R.hopDur);
      var tx, ty;
      if (R.toEl) {
        var r = rectOf(R.toEl);
        if (r) { tx = r.left + R.toFx * r.width - 27; ty = platY(r); }
        else { tx = R.x; ty = 0; R.toEl = null; }
      } else { tx = R.hopFromX; ty = 0; }
      var arc = Math.max(34, Math.min(88, Math.abs(ty - R.hopFromY) * 0.4 + Math.abs(tx - R.hopFromX) * 0.16 + 30));
      R.x = R.hopFromX + (tx - R.hopFromX) * p;
      R.yOff = R.hopFromY + (ty - R.hopFromY) * p - arc * Math.sin(p * Math.PI);
      legsA.style.display = 'none'; legsB.style.display = '';
      if (p >= 1) {
        R.squashUntil = t + 150;
        if (R.toEl) { R.mode = 'plat'; R.platEl = R.toEl; R.yOff = ty; R.target = R.x; R.nextThink = t + 700 + Math.random() * 900; }
        else { R.mode = 'floor'; R.yOff = 0; R.nextThink = t + 250; }
      }
    } else {
      var dx = effTarget - R.x;
      moving = Math.abs(dx) > 2;
      if (moving) {
        R.x += Math.sign(dx) * Math.min(Math.abs(dx), R.speed * dt);
        R.facing = Math.sign(dx) || R.facing;
        if (t - R.lastStep > 175) { R.stepFlag = !R.stepFlag; R.lastStep = t; legsA.style.display = R.stepFlag ? 'none' : ''; legsB.style.display = R.stepFlag ? '' : 'none'; }
      } else if (legsB.style.display !== 'none') { legsA.style.display = ''; legsB.style.display = 'none'; }
      if (R.mode === 'plat') {
        var rp = rectOf(R.platEl);
        if (rp) {
          R.yOff = platY(rp);
          var minX = rp.left + 2, maxX = rp.right - 56;
          R.x = Math.max(minX, Math.min(maxX, R.x));
          R.target = Math.max(minX, Math.min(maxX, R.target));
        }
      }
    }

    /* pose */
    var airborne = R.mode === 'hop';
    var bob = airborne ? 0 : (moving ? Math.sin(t / 100) * 1.6 : Math.sin(t / 900) * 0.8);
    R.lean *= 0.9;
    var tilt = (airborne ? -6 * R.facing : (moving ? Math.sin(t / 100) * 3.2 : Math.sin(t / 1100) * 1.1)) + R.lean;
    var squash = t < R.squashUntil ? ' scale(1,0.9)' : '';
    robeyEl.style.left = R.x + 'px';
    robeyEl.style.transform = 'translateY(' + (bob + R.yOff) + 'px)';
    puppet.style.transform = 'scaleX(' + R.facing + ') rotate(' + tilt + 'deg)' + squash;

    /* head follows the cursor */
    var headCY = topY + 30;
    var dcx = cursor.x - (R.x + 27), dcy = cursor.y - headCY;
    if (R.mung) {
      headG.style.transform = 'rotate(' + (Math.sin(t / 1600) * 4 - 3) + 'deg)';
    } else if (cursor.x > -999 && Math.abs(dcx) < 520) {
      if (Math.abs(dcx) > 40 && R.mode === 'plat' && !moving) R.facing = dcx >= 0 ? 1 : -1;
      var look = Math.max(-9, Math.min(8, dcy * 0.03)) * R.facing;
      headG.style.transform = 'rotate(' + look + 'deg)';
    } else headG.style.transform = 'rotate(0deg)';

    /* arms */
    if (t < R.waveUntil) {
      var w = Math.sin(t / 90) * 24;
      armR.style.transform = 'rotate(' + (-58 + w) + 'deg)';
      armL.style.transform = 'rotate(0deg)';
    } else if (airborne) {
      armR.style.transform = 'rotate(-42deg)';
      armL.style.transform = 'rotate(42deg)';
    } else {
      armR.style.transform = 'rotate(0deg)';
      armL.style.transform = 'rotate(0deg)';
    }

    /* mung thought-dots */
    if (R.mung) {
      R.mungPhase += dt;
      mungDots.setAttribute('opacity', String(Math.max(0, Math.min(1, Math.sin(R.mungPhase * 0.9) * 1.4))));
    } else if (R.mungPhase !== 0) {
      R.mungPhase = 0;
      mungDots.setAttribute('opacity', '0');
    }
  };

  R.nextThink = performance.now() + 500;
  raf = requestAnimationFrame(tick);

  window.addEventListener('mousemove', function (e) { cursor.x = e.clientX; cursor.y = e.clientY; });
  /* robey is pointer-events:none; clicks on his silhouette are hit-tested here */
  document.addEventListener('click', function (e) {
    var topY = window.innerHeight - 88 + R.yOff;
    if (e.clientX > R.x - 4 && e.clientX < R.x + 58 && e.clientY > topY - 6 && e.clientY < topY + 82) {
      var now = performance.now();
      R.waveUntil = now + 1150;
      if (R.mode === 'plat') { R.squashUntil = now + 140; }
    }
  });
  window.addEventListener('resize', function () {
    R.x = Math.min(R.x, window.innerWidth - 80);
    R.target = Math.min(R.target, window.innerWidth - 80);
  });

  /* scroll: lean into the movement of the plates */
  window.addEventListener('scroll', function () {
    var d = (window.scrollY || 0) - (R._lastScroll || 0);
    R._lastScroll = window.scrollY || 0;
    R.lean = Math.max(-7, Math.min(7, R.lean + d * 0.045));
  }, { passive: true });

  /* 멍: he stops and stares when the practice line is on screen */
  var practice = document.getElementById('line-practice');
  if (practice && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { R.mungIntersecting = en.isIntersecting; });
    }, { threshold: 0.3 });
    io.observe(practice);
  }
})();
