/* Studio Monjo · the walk with Robey, the homepage in every language. September 2026.
   One drawn map of Seoul. Scrolling walks Robey from Namsan to Seokchon Lake at his own pace.
   At each place his painting inks itself in and a little of his letter appears.
   Each page is already written in its language; the few words this script writes in as the walk
   goes are read from the page's #walk-copy data. Map data © OpenStreetMap contributors. */
(() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const UA = navigator.userAgent || '';
  const IN_APP = /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|FB_IAB|Line\/|DaumApps|; wv\)/i.test(UA);
  const IOS = /iP(hone|ad|od)/.test(UA) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const rand = (a, b) => a + Math.random() * (b - a);
  const now = () => performance.now();
  const loadImage = src => new Promise((res, rej) => { const i = new Image(); i.decoding = 'async'; i.onload = () => res(i); i.onerror = () => rej(new Error(src)); i.src = src; });

  /* ——— Words ——— */
  const C = JSON.parse(($('#walk-copy') || {}).textContent || '{"t":{}}');
  const L = C.lang || doc.lang || 'en', LANGS = ['en', 'fr', 'ko'];
  const T = (k, vars) => {
    const s = C.t[k]; if (s == null) return '';
    return vars ? s.replace(/\{(\w+)\}/g, (m, v) => (vars[v] != null ? vars[v] : m)) : s;
  };

  /* ——— Changing language keeps your place: the other page opens where you were reading ——— */
  const PLACE = 'sm-place';
  $$('.lang a[hreflang]').forEach(a => a.addEventListener('click', () => {
    if (a.hasAttribute('aria-current')) return;
    const y = scrollY + 1, sec = $$('main > section').find(s => s.offsetTop <= y && s.offsetTop + s.offsetHeight > y);
    if (!sec) return;
    const at = { path: new URL(a.href, location.href).pathname, id: sec.id, f: (y - sec.offsetTop) / Math.max(1, sec.offsetHeight), t: Date.now() };
    try { sessionStorage.setItem(PLACE, JSON.stringify(at)); } catch (e) { /* storage may be unavailable */ }
  }));
  const placeOnArrival = () => {
    let at = null;
    try { at = JSON.parse(sessionStorage.getItem(PLACE) || 'null'); sessionStorage.removeItem(PLACE); } catch (e) { return; }
    if (!at || at.path !== location.pathname || Date.now() - at.t > 20000 || location.hash) return;
    const sec = document.getElementById(at.id); if (!sec) return;
    scrollTo(0, Math.round(sec.offsetTop + at.f * sec.offsetHeight));
  };

  /* ——— Seoul time, in the studio ——— */
  const clockEl = $('[data-clock]');
  const tick = () => {
    if (!clockEl) return;
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const h = parts.find(p => p.type === 'hour').value, m = parts.find(p => p.type === 'minute').value;
    clockEl.textContent = T('studio.clock', { t: L === 'fr' ? `${h} h ${m}` : `${h}:${m}` });
  };
  tick(); setInterval(tick, 10000);

  /* ——— Stillness and time spent ——— */
  let lastInput = now();
  ['wheel', 'pointermove', 'pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(ev => addEventListener(ev, () => { lastInput = now(); }, { passive: true }));
  const idleFor = () => (now() - lastInput) / 1000;
  let seenMs = 0;

  /* ——— Painter: the ink spreads out from Robey, then the colour blooms after it ——— */
  const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const FS = [
    'precision highp float;varying vec2 v;',
    'uniform sampler2D uL,uF;uniform float uLine,uColor,uAsp,uSeed,uMax;uniform vec2 uO;',
    'float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}',
    'float fbm(vec2 p){float s=0.,a=.5;for(int k=0;k<5;k++){s+=a*n(p);p=p*2.03+17.1;a*=.5;}return s;}',
    'void main(){',
    ' vec2 uv=vec2(v.x,1.-v.y);',
    ' vec2 q=vec2(uv.x*uAsp,uv.y),o=vec2(uO.x*uAsp,uO.y);',
    ' float d=length(q-o)/uMax;',
    ' float n1=fbm(q*6.5+uSeed),n2=fbm(q*2.4+uSeed*1.9+7.3);',
    ' float w1=.06,r1=uLine*(1.+w1)*1.02;',
    ' float a1=1.-smoothstep(r1-w1,r1,d*.8+n1*.2);',
    ' float f2=d*.6+n2*.4,w2=.13,r2=uColor*(1.+w2)*1.02;',
    ' float a2=1.-smoothstep(r2-w2,r2,f2);',
    ' float e=smoothstep(r2-w2,r2-w2*.5,f2)*(1.-smoothstep(r2-w2*.5,r2,f2));',
    ' vec3 L=texture2D(uL,uv).rgb,F=texture2D(uF,uv).rgb;',
    ' vec3 base=mix(vec3(1.),L,a1);',
    ' vec3 pig=clamp(1.-(1.-F)*(1.+.6*e),0.,1.);',
    ' gl_FragColor=vec4(mix(base,pig,a2),1.);',
    '}'
  ].join('\n');
  class Painter {
    constructor(canvas, o) { this.c = canvas; this.o = o; this.line = 0; this.color = 0; this.dirty = true; this.ok = false; this.done = false; }
    init() {
      const opts = { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' };
      const gl = this.c.getContext('webgl2', opts) || this.c.getContext('webgl', opts);
      if (!gl) return Promise.reject(new Error('webgl'));
      this.gl = gl; this.gl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
      gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return Promise.reject(new Error('link'));
      gl.useProgram(pr);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      this.u = {}; ['uL', 'uF', 'uLine', 'uColor', 'uAsp', 'uSeed', 'uMax', 'uO'].forEach(k => { this.u[k] = gl.getUniformLocation(pr, k); });
      return Promise.all([loadImage(this.o.lines), loadImage(this.o.full)]).then(([li, fi]) => {
        const A = fi.naturalWidth / fi.naturalHeight, [ox, oy] = this.o.origin;
        this.tex(li, 0); this.tex(fi, 1);
        gl.uniform1i(this.u.uL, 0); gl.uniform1i(this.u.uF, 1);
        gl.uniform1f(this.u.uAsp, A); gl.uniform2f(this.u.uO, ox, oy); gl.uniform1f(this.u.uSeed, this.o.seed || 1);
        gl.uniform1f(this.u.uMax, Math.max(...[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, y]) => Math.hypot((x - ox) * A, y - oy))));
        this.ok = true; this.resize(); this.draw();
      });
    }
    tex(img, unit) {
      const gl = this.gl, t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (this.gl2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    resize() {
      // The layout size, not the box on screen: the cards are tilted, and a tilted box is wider than the drawing.
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(this.c.offsetWidth * dpr)), h = Math.max(2, Math.round(this.c.offsetHeight * dpr));
      if (this.c.width !== w || this.c.height !== h) { this.c.width = w; this.c.height = h; this.dirty = true; }
    }
    set(line, color) { if (line !== this.line || color !== this.color) { this.line = line; this.color = color; this.dirty = true; } }
    draw() {
      if (!this.ok || !this.dirty) return;
      const gl = this.gl; gl.viewport(0, 0, this.c.width, this.c.height);
      gl.uniform1f(this.u.uLine, this.line); gl.uniform1f(this.u.uColor, this.color);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); this.dirty = false;
    }
  }
  const paintInto = (box, img, origin, seed) => {
    const c = document.createElement('canvas'); c.setAttribute('aria-hidden', 'true');
    box.insertBefore(c, img);
    const p = new Painter(c, { lines: img.dataset.lines, full: img.dataset.full || img.getAttribute('src'), origin, seed });
    p.fallback = false;
    p.init().catch(() => { c.remove(); p.fallback = true; if (img.dataset.full) img.src = img.dataset.full; img.style.visibility = 'visible'; img.style.position = 'static'; });
    return p;
  };

  /* ——— Motion: calm by construction ———
     The page never moves the map straight to the scroll position. A critically damped spring
     follows it, with a speed limit: Robey's walking pace. Pan and zoom travel together along
     the smoothest path between two views (van Wijk and Nuij), so nothing jolts. */
  function smoothDamp(cur, target, st, smoothTime, maxSpeed, dt) {
    const omega = 2 / smoothTime, x = omega * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const maxChange = maxSpeed * smoothTime, change = clamp(cur - target, -maxChange, maxChange);
    const temp = (st.v + omega * change) * dt;
    st.v = (st.v - omega * temp) * e;
    let out = (cur - change) + (change + temp) * e;
    if ((target - cur > 0) === (out > target)) { out = target; st.v = 0; }
    return out;
  }
  function zoomPath(p0, p1, rho) {
    const [x0, y0, w0] = p0, [x1, y1, w1] = p1, dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy, r2 = rho * rho, r4 = r2 * r2;
    if (d2 < 1e-6) { const S = Math.log(w1 / w0) / rho; const f = t => [x0 + t * dx, y0 + t * dy, w0 * Math.exp(rho * t * S), t]; f.S = Math.abs(S); return f; }
    const d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + r4 * d2) / (2 * w0 * r2 * d1), b1 = (w1 * w1 - w0 * w0 - r4 * d2) / (2 * w1 * r2 * d1);
    const q0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), q1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1), S = (q1 - q0) / rho, c0 = Math.cosh(q0);
    const f = t => { const s = t * S, u = w0 / (r2 * d1) * (c0 * Math.tanh(rho * s + q0) - Math.sinh(q0)); return [x0 + u * dx, y0 + u * dy, w0 * c0 / Math.cosh(rho * s + q0), u]; };
    f.S = Math.abs(S); return f;
  }
  const easeSine = t => 0.5 - Math.cos(Math.PI * clamp(t, 0, 1)) / 2;

  /* ——— Robey's walk ——— */
  const ROUTE = [[126.98823, 37.55119], [126.9915, 37.5482], [126.9948, 37.5447], [126.9985, 37.5412], [127.0035, 37.5378], [127.0082, 37.5340], [127.0112, 37.5303],
    [127.0165, 37.5213], [127.0238, 37.5221], [127.0330, 37.5232], [127.0428, 37.5226], [127.0500, 37.5192], [127.0553, 37.5143], [127.0592, 37.5108],
    [127.0642, 37.5118], [127.0700, 37.5132], [127.0752, 37.5139], [127.0800, 37.5139], [127.0872, 37.5126], [127.0955, 37.5104], [127.0976, 37.5080], [127.0992, 37.5066], [127.1025, 37.5076], [127.1048, 37.5090], [127.1070, 37.5108]];
  const LANDMARKS = [
    { src: '/media/web/world/pop/tower.webp', lon: 126.98823, lat: 37.55119, ar: 500 / 650, height: 190, nudge: [-92, -14] },
    { src: '/media/web/world/pop/library.webp', lon: 127.06009, lat: 37.51017, ar: 580 / 1360, height: 150, nudge: [-70, -8] },
    { src: '/media/web/world/pop/lotte.webp', lon: 127.10268, lat: 37.51255, ar: 940 / 690, height: 170, nudge: [0, 0] }
  ];
  // The watercolour map, painted from OpenStreetMap geometry: six tiles and its projection.
  const MAP = { w: 4885, h: 2553, mpp: 3.0, lon0: 126.962, lon1: 127.128, lats: 37.494, latn: 37.563, kx: 88282.37417416234, ky: 110990.0,
    overview: '/media/web/world/map/map-overview.webp',
    tiles: [
      { src: '/media/web/world/map/map-0-0.webp', x: 0, y: 0, w: 1640, h: 1280 }, { src: '/media/web/world/map/map-1-0.webp', x: 1640, y: 0, w: 1640, h: 1280 },
      { src: '/media/web/world/map/map-2-0.webp', x: 3280, y: 0, w: 1605, h: 1280 }, { src: '/media/web/world/map/map-0-1.webp', x: 0, y: 1280, w: 1640, h: 1273 },
      { src: '/media/web/world/map/map-1-1.webp', x: 1640, y: 1280, w: 1640, h: 1273 }, { src: '/media/web/world/map/map-2-1.webp', x: 3280, y: 1280, w: 1605, h: 1273 }
    ] };
  const SPRITES = {
    leaves: ['/media/web/world/sprites/leaf-a.png', '/media/web/world/sprites/leaf-b.png', '/media/web/world/sprites/leaf-c.png'],
    petals: ['/media/web/world/sprites/petal-a.png', '/media/web/world/sprites/petal-b.png', '/media/web/world/sprites/petal-c.png']
  };
  const NEXT = [127.0565, 37.5428];   // a dashed dot near Seongsu: the next place could be yours

  const Journey = (() => {
    const sec = $('#journey');
    if (!sec || reduce) return null;
    doc.classList.add('walking');
    const stage = $('.j-stage', sec), mapEl = $('.j-map', sec), routeCv = $('.j-route', sec), rg = routeCv.getContext('2d');
    const robeyEl = $('.j-robey', sec), light = $('.j-light', sec), balloon = $('.j-balloon', sec);
    const wayEl = $('.j-way', sec), paceEl = $('.j-pace', sec), hint = $('.j-hint', sec), endEl = $('.j-end', sec), cart = $('.j-cartouche', sec), postcard = $('.j-postcard', sec);
    robeyEl.draggable = false;

    const stops = $$('.stop', sec).map((el, i) => ({
      el, i, id: el.dataset.id, lon: +el.dataset.lon, lat: +el.dataset.lat, ar: +el.dataset.ar, fx: +el.dataset.fx, fy: +el.dataset.fy, rh: +el.dataset.rh,
      seed: +el.dataset.seed || i + 1, ambient: el.dataset.ambient || '', balloon: el.dataset.balloon === 'true',
      label: $('.s-label', el), paint: $('.s-paint', el), letter: $('.s-letter', el), img: $('.s-paint img', el),
      painter: null, started: false, done: false, t0: 0, color: 0, visited: false, s: 0, pin: null, count: 0, v: -1, rv: -2
    }));
    const pcArt = $('.pc-art', postcard), pcImg = $('img', pcArt);
    const hello = paintInto(pcArt, pcImg, [0.33, 0.37], 3.1);
    const helloT0 = now() + 500;
    stops.forEach((st, i) => setTimeout(() => { st.painter = paintInto(st.paint, st.img, [st.fx, st.fy - st.rh * 0.5], st.seed); }, 900 + i * 450));

    // a dashed dot for the next place, and its words, drawn above the dusk
    const nextEl = document.createElement('div'); nextEl.className = 'j-next'; nextEl.setAttribute('aria-hidden', 'true');
    nextEl.innerHTML = '<span class="n-ring"></span><span class="n-label"></span>';
    stage.appendChild(nextEl);
    const nextLabel = $('.n-label', nextEl);
    nextLabel.textContent = T('j.next');

    let M = null, X = [], Y = [], total = 1, segs = [], W = 0, H = 0, mobile = false, top0 = 0, secH = 0;
    let over = null, vOver = null, zStop = 1, stopA = [0, 0], D = -1, lastS = -1, phase = 0, amp = 0, night = false, ready = false, nextXY = [0, 0], dpr = 1, drawn = '';
    let yS = -1, paceSince = 0; const vel = { v: 0 };
    const STEP = 5, pops = [];
    const project = (lon, lat) => [(lon - M.lon0) * M.kx / M.mpp, (M.latn - lat) * M.ky / M.mpp];
    const at = s => { const f = clamp(s / STEP, 0, X.length - 1), i = Math.floor(f), j = Math.min(X.length - 1, i + 1), t = f - i; return { x: lerp(X[i], X[j], t), y: lerp(Y[i], Y[j], t) }; };
    const nearestS = (x, y) => { let best = 0, bd = Infinity; for (let i = 0; i < X.length; i++) { const d = (X[i] - x) ** 2 + (Y[i] - y) ** 2; if (d < bd) { bd = d; best = i; } } return best * STEP; };
    const vStop = s => { const p = at(s); return [p.x + (W / 2 - stopA[0]) / zStop, p.y + (H / 2 - stopA[1]) / zStop, W / zStop]; };

    function build() {
      const under = new Image(); under.className = 'under'; under.alt = ''; under.src = M.overview;
      Object.assign(under.style, { width: M.w + 'px', height: M.h + 'px' }); mapEl.appendChild(under);
      let loaded = 0;
      M.tiles.forEach(t => {
        const im = new Image(); im.className = 'tile'; im.alt = ''; im.decoding = 'async';
        im.onload = () => { if (++loaded === M.tiles.length) setTimeout(() => under.remove(), 300); };
        im.src = t.src; Object.assign(im.style, { left: t.x + 'px', top: t.y + 'px', width: t.w + 'px', height: t.h + 'px' }); mapEl.appendChild(im);
      });
      mapEl.style.width = M.w + 'px'; mapEl.style.height = M.h + 'px';
      const P = ROUTE.map(([lo, la]) => project(lo, la)), raw = [];
      for (let i = 0; i < P.length - 1; i++) {
        const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
        for (let k = 0; k < 24; k++) { const t = k / 24, t2 = t * t, t3 = t2 * t; raw.push([0, 1].map(c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3))); }
      }
      raw.push(P[P.length - 1]);
      const cum = [0]; for (let i = 1; i < raw.length; i++) cum.push(cum[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
      const L = cum[cum.length - 1]; let k = 0; X = []; Y = [];
      for (let s = 0; s <= L; s += STEP) { while (k < cum.length - 2 && cum[k + 1] < s) k++; const t = (s - cum[k]) / Math.max(1e-6, cum[k + 1] - cum[k]); X.push(lerp(raw[k][0], raw[k + 1][0], t)); Y.push(lerp(raw[k][1], raw[k + 1][1], t)); }
      total = (X.length - 1) * STEP;
      stops.forEach(st => {
        const [x, y] = project(st.lon, st.lat); st.s = nearestS(x, y);

      });
      LANDMARKS.forEach(l => {
        const el = document.createElement('div'); el.className = 'pop up';
        const im = new Image(); im.alt = ''; im.src = l.src; el.appendChild(im);
        const [x, y] = project(l.lon, l.lat), h = l.height, w = h * l.ar;
        Object.assign(el.style, { width: w + 'px', height: h + 'px', transform: `translate(${(x + l.nudge[0] - w / 2).toFixed(1)}px,${(y + l.nudge[1] - h).toFixed(1)}px)` });
        mapEl.appendChild(el); pops.push(el);
      });
      nextXY = project(NEXT[0], NEXT[1]);
    }

    // A phone has no room beside a painting, so nothing may cover it: the name, the painting and the letter
    // stack down the left, and the painting grows smaller when a short screen needs the room.
    function stack(st) {
      const top = st.label.offsetTop + st.label.offsetHeight + 14, gap = 12, foot = 78;
      const room = H - top - st.letter.offsetHeight - gap - foot;
      const w = clamp(room * st.ar, W * 0.3, W * 0.46);
      st.paint.style.top = top + 'px'; st.paint.style.width = w + 'px'; st.paint.style.height = (w / st.ar) + 'px';
      st.letter.style.top = (top + w / st.ar + gap) + 'px';
    }

    function layout() {
      if (!M) return;
      W = stage.clientWidth; H = stage.clientHeight; mobile = W < 760;
      if (mobile) {
        const x0 = Math.min(...X), x1 = Math.max(...X), y0 = Math.min(...Y), y1 = Math.max(...Y);
        const z = Math.min((W * 0.86) / (x1 - x0), (H * 0.26) / (y1 - y0));
        over = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, ax: W / 2, ay: H * 0.38, z };
      } else {
        over = { cx: M.w / 2, cy: M.h / 2, ax: W / 2, ay: H * 0.52, z: Math.min(W / M.w, H / M.h) * 0.98 };
      }
      vOver = [over.cx + (W / 2 - over.ax) / over.z, over.cy + (H / 2 - over.ay) / over.z, W / over.z];
      zStop = mobile ? 0.62 : clamp(W / 1440, 0.62, 1.1);
      // On a phone Robey waits on the map at the right, beside his place's name, painting and letter.
      stopA = mobile ? [W * 0.8, H * 0.3] : [W * 0.22, H * 0.62];
      // and his first card sits as low as it can while clearing the title above and the scroll hint below
      const ch = postcard.offsetHeight / 2, cy = Math.max(cart.offsetTop + cart.offsetHeight + 12 + ch, Math.min(H * 0.73, H - 72 - ch));
      postcard.style.top = mobile ? cy + 'px' : '';
      hint.style.visibility = mobile && cy + ch > H - 70 ? 'hidden' : '';   // the smallest phones have no room for both
      stops.forEach(st => {
        if (mobile) stack(st);
        else { st.paint.style.top = st.paint.style.width = st.letter.style.top = ''; const w = st.paint.offsetWidth || 300; st.paint.style.height = (w / st.ar) + 'px'; }
        if (st.painter && st.painter.ok) { st.painter.resize(); st.painter.dirty = true; st.painter.draw(); }
      });
      // every stretch of scroll is as long as the distance it covers, so the pace never changes
      segs = []; let y = 0;
      const add = (type, len, data = {}) => { segs.push(Object.assign({ type, y0: y, y1: y + len }, data)); y += len; };
      add('hold', H * 0.35);
      const dive = zoomPath(vOver, vStop(stops[0].s), 1.0); add('dive', H * clamp(dive.S * 0.95, 1.1, 2.2), { path: dive });
      stops.forEach((st, i) => {
        if (i) { const path = zoomPath(vStop(stops[i - 1].s), vStop(st.s), 1.25); add('travel', H * clamp(path.S * 0.95, 0.6, 2.0), { a: i - 1, b: i, path }); }
        add('stop', H * (i === stops.length - 1 ? 1.1 : 0.75), { i });
      });
      const end = zoomPath(vStop(stops[stops.length - 1].s), vOver, 1.0); add('end', H * clamp(end.S * 0.95, 1.0, 2.0), { path: end });
      add('tail', H * 0.45);
      secH = Math.round(y + H); sec.style.height = secH + 'px';
      top0 = sec.getBoundingClientRect().top + scrollY;
      dpr = Math.min(devicePixelRatio || 1, 2);
      routeCv.width = Math.round(W * dpr); routeCv.height = Math.round(H * dpr); drawn = '';
    }

    function state(y) {
      const seg = segs.find(g => y < g.y1) || segs[segs.length - 1];
      const t = clamp((y - seg.y0) / Math.max(1, seg.y1 - seg.y0), 0, 1), s0 = stops[0].s, sl = stops[stops.length - 1].s;
      if (seg.type === 'hold') return { v: vOver, s: s0, seg, t };
      if (seg.type === 'dive') return { v: seg.path(easeSine(t)), s: s0, seg, t };
      if (seg.type === 'stop') return { v: vStop(stops[seg.i].s), s: stops[seg.i].s, seg, t };
      if (seg.type === 'travel') { const p = seg.path(easeSine(t)); return { v: p, s: lerp(stops[seg.a].s, stops[seg.b].s, p[3]), seg, t }; }
      if (seg.type === 'end') return { v: seg.path(easeSine(t)), s: sl, seg, t };
      return { v: vOver, s: sl, seg, t };
    }

    const RED = '#B0392E';
    function drawRoute(tx, ty, z, s) {
      const key = `${tx.toFixed(1)}|${ty.toFixed(1)}|${z.toFixed(4)}|${s.toFixed(1)}|${stops.map(p => +p.visited).join('')}`;
      if (key === drawn) return; drawn = key;
      const g = rg, n = X.length;
      g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = RED;
      const iWalk = clamp(Math.floor(s / STEP), 0, n - 1);
      const line = to => { g.beginPath(); g.moveTo(X[0] * z + tx, Y[0] * z + ty); for (let i = 1; i <= to; i++) g.lineTo(X[i] * z + tx, Y[i] * z + ty); if (to === iWalk && to < n - 1) { const q = at(s); g.lineTo(q.x * z + tx, q.y * z + ty); } };
      // dots keep their place on the map: their spacing doubles or halves with the zoom, cross-faded
      const l = Math.log2((13 / z) / STEP), lo = Math.floor(l), f = l - lo;
      [[STEP * 2 ** lo, 1 - f], [STEP * 2 ** (lo + 1), f]].forEach(([period, wgt]) => {
        if (wgt < 0.02) return;
        g.setLineDash([0.01, period * z]); g.lineDashOffset = 0;
        g.globalAlpha = 0.34 * wgt; g.lineWidth = 4.6; line(n - 1); g.stroke();
        if (s > 0) { g.globalAlpha = wgt; g.lineWidth = 5.8; line(iWalk); g.stroke(); }
      });
      g.setLineDash([]); g.globalAlpha = 1;
      stops.forEach(sp => {
        const q = at(sp.s), x = q.x * z + tx, y = q.y * z + ty; if (x < -20 || y < -20 || x > W + 20 || y > H + 20) return;
        g.beginPath(); g.arc(x, y, 7.5, 0, Math.PI * 2);
        if (sp.visited) { g.fillStyle = RED; g.fill(); }
        else { g.fillStyle = '#fcfbf8'; g.fill(); g.lineWidth = 2; g.strokeStyle = 'rgba(58,47,40,.5)'; g.stroke(); }
      });
    }

    function spawn(st, kind) {
      const box = st.paint, bw = box.clientWidth, bh = box.clientHeight;
      const list = SPRITES[kind === 'leaves' ? 'leaves' : 'petals'];
      const img = new Image(); img.src = list[(Math.random() * 3) | 0]; img.alt = ''; img.className = 'fall';
      img.onload = () => {
        const k = bh / 1600, leaves = kind === 'leaves'; img.style.width = img.naturalWidth * k + 'px'; img.style.height = img.naturalHeight * k + 'px';
        const X0 = (leaves ? rand(0.42, 0.9) : rand(0.12, 0.5)) * bw, Y0 = (leaves ? rand(0.16, 0.34) : rand(0.07, 0.2)) * bh, Y1 = (leaves ? rand(0.86, 0.93) : rand(0.9, 0.95)) * bh;
        const sway = rand(10, 22) * (bw / 400), drift = rand(-30, 40) * (bw / 400), r0 = rand(-40, 40), spin = rand(-150, 150), frames = [];
        for (let i = 0; i <= 16; i++) { const t = i / 16; frames.push({ transform: `translate(${(X0 + drift * t + Math.sin(t * Math.PI * 3 + r0) * sway).toFixed(1)}px,${lerp(Y0, Y1, t * t * .35 + t * .65).toFixed(1)}px) rotate(${(r0 + spin * t).toFixed(1)}deg)`, opacity: t < .08 ? t / .08 : 1 }); }
        box.appendChild(img);
        img.animate(frames, { duration: rand(7000, 9500), fill: 'forwards' }).onfinish = () => { img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 2400, fill: 'forwards' }).onfinish = () => img.remove(); };
      };
      if (kind === 'leaves' && st.count < 7) {
        st.count += 1;
        const n = document.createElement('span'); n.className = 'count'; n.textContent = st.count; n.setAttribute('aria-hidden', 'true');
        n.style.left = (bw * (st.fx + 0.08)) + 'px'; n.style.top = (bh * (st.fy - st.rh - 0.05)) + 'px'; box.appendChild(n);
        n.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: .8, transform: 'none', offset: .2 }, { opacity: .8, offset: .6 }, { opacity: 0, transform: 'translateY(-5px)' }], { duration: 2600, fill: 'forwards' }).onfinish = () => n.remove();
      }
    }
    let nextFall = 0, balloonFrom = null, lastWay = '', nextSide = '';

    function update(t, dt, sy, vh) {
      if (!ready) return;
      const rTop = top0 - sy, maxY = segs[segs.length - 1].y1;
      const yT = clamp(-rTop, 0, maxY);
      // follow the scroll at a walking pace; a long jump is shortened so the page never falls far behind
      if (yS < 0) yS = yT;
      // the further the reader runs ahead, the more Robey lengthens his stride, never with a jump
      const gap = Math.abs(yT - yS), pace = H * (0.72 + 0.5 * Math.max(0, gap / H - 1.2));
      yS = smoothDamp(yS, yT, vel, 0.6, pace, dt);
      const visible = rTop < vh && rTop + secH > 0;
      // when the reader hurries ahead, Robey keeps his pace, and says so
      const behind = Math.abs(yT - yS) > H * 0.7;
      if (behind && !paceSince) paceSince = t; if (!behind) paceSince = 0;
      paceEl.classList.toggle('on', !!paceSince && t - paceSince > 600 && visible);
      if (!visible) return;
      const y = yS, { v, s, seg, t: st } = state(y);
      const z = W / v[2], tx = W / 2 - v[0] * z, ty = H / 2 - v[1] * z;
      mapEl.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${z.toFixed(5)})`;

      const ds = lastS < 0 ? 0 : Math.abs(s - lastS); lastS = s;
      if (ds > 0.05) phase += ds / 70;
      amp = damp(amp, ds > 0.05 ? 1 : 0, 6, dt);
      const p = at(s), rock = Math.sin(phase * Math.PI * 2) * 4 * amp, bob = Math.abs(Math.sin(phase * Math.PI * 2)) * 3 * amp;
      robeyEl.style.transform = `translate(${(tx + p.x * z).toFixed(1)}px,${(ty + p.y * z).toFixed(1)}px) scale(${z.toFixed(4)}) rotate(${rock.toFixed(2)}deg) translate(-29px,${(-120 - bob).toFixed(1)}px)`;
      // arrival
      const hy = seg.type === 'hold' ? st * 0.3 : seg.type === 'dive' ? 0.3 + st * 0.7 : 1.2, pk = smooth(0.2, 0.75, hy);
      if (hy <= 1.1 || postcard.style.visibility !== 'hidden') {
        postcard.style.opacity = (1 - pk).toFixed(3);
        postcard.style.transform = `translate(-50%, calc(-50% + ${(pk * 30).toFixed(2)}vh)) rotate(${(-1.4 + pk * 3).toFixed(2)}deg)`;
        postcard.style.visibility = pk >= 1 ? 'hidden' : 'visible';
        cart.style.opacity = (1 - smooth(0.4, 0.85, hy)).toFixed(3);
        hint.style.opacity = (1 - smooth(0.02, 0.18, hy)).toFixed(3);
      }
      if (!hello.done && hello.ok) { const e = (t - helloT0) / 1000; if (e > 0) { hello.set(easeIO(clamp(e / 2.2, 0, 1)), easeIO(clamp((e - 1.1) / 3, 0, 1))); hello.draw(); if (e > 4.2) hello.done = true; } }

      // the places
      stops.forEach((sp, i) => {
        let vv = 0;
        if (seg.type === 'stop' && seg.i === i) vv = smooth(0, 0.24, st) * (1 - smooth(0.82, 1, st));
        if (seg.type === 'dive' && i === 0) vv = smooth(0.78, 1, st);
        if (vv !== sp.v) {
          sp.v = vv; sp.el.classList.toggle('on', vv > 0.001);
          if (vv > 0.001) {
            const vl = clamp(vv * 1.25, 0, 1), vp = clamp((vv - 0.05) * 1.3, 0, 1), vc = clamp((vv - 0.2) * 1.4, 0, 1);
            sp.label.style.opacity = vl.toFixed(3); sp.label.style.transform = `translateY(${((1 - vl) * 12).toFixed(1)}px)`;
            sp.paint.style.opacity = vp.toFixed(3); sp.paint.style.transform = `translateY(${((1 - vp) * 22).toFixed(1)}px) rotate(${(-2.2 + (1 - vp) * 2).toFixed(2)}deg)`;
            sp.letter.style.opacity = vc.toFixed(3); sp.letter.style.transform = `translateY(${((1 - vc) * 26).toFixed(1)}px) rotate(${(1.8 - (1 - vc) * 2).toFixed(2)}deg)`;
            if (!sp.started && vp > 0.35) { sp.started = true; sp.t0 = t; }
          }
        }
        if (sp.started && !sp.done) {
          const e = (t - sp.t0) / 1000; sp.color = easeIO(clamp((e - 1.1) / 3.2, 0, 1));
          if (sp.painter && !sp.painter.fallback) sp.painter.set(easeIO(clamp(e / 2.4, 0, 1)), sp.color);
          if (e > 4.4) sp.done = true;
        }
        if (sp.painter) sp.painter.draw();
        if (!sp.visited && ((seg.type === 'stop' && seg.i === i && st > 0.12) || seg.type === 'end' || seg.type === 'tail' || (seg.type === 'stop' && seg.i > i) || (seg.type === 'travel' && seg.a >= i))) { sp.visited = true; }
      });

      drawRoute(tx, ty, z, s);

      const way = seg.type === 'travel' ? T(`stop.${stops[seg.b].id}.way`) : '';
      if (way !== lastWay) { lastWay = way; if (way) wayEl.textContent = way; }
      wayEl.style.opacity = seg.type === 'travel' ? (smooth(0.06, 0.28, st) * (1 - smooth(0.74, 0.95, st))).toFixed(3) : '0';

      // dusk at the last place, then night over the map
      let duskT = 0;
      if (seg.type === 'stop' && seg.i === stops.length - 1) duskT = smooth(0.4, 1, st) * 0.3;
      else if (seg.type === 'end') duskT = 0.3 + smooth(0, 0.9, st) * 0.32;
      else if (seg.type === 'tail') duskT = 0.62 + smooth(0, 1, st) * 0.38;
      const nd = damp(D < 0 ? duskT : D, duskT, 3, dt);
      if (Math.abs(nd - D) > 0.0005) {
        D = nd;
        const a = smooth(0, 1, D) * 0.9, c0 = [170, 172, 190], c1 = [22, 36, 63], m = smooth(0.2, 1, D);
        light.style.backgroundColor = D < 0.002 ? 'transparent' : `rgba(${Math.round(lerp(c0[0], c1[0], m))},${Math.round(lerp(c0[1], c1[1], m))},${Math.round(lerp(c0[2], c1[2], m))},${a.toFixed(3)})`;
      }
      night = D > 0.5;
      endEl.style.opacity = seg.type === 'end' ? smooth(0.35, 0.6, st).toFixed(3) : seg.type === 'tail' ? (1 - smooth(0.4, 0.9, st)).toFixed(3) : '0';
      // the next place could be yours
      const nv = seg.type === 'end' ? smooth(0.55, 0.85, st) : seg.type === 'tail' ? 1 - smooth(0.5, 0.95, st) : 0;
      nextEl.style.opacity = nv.toFixed(3);
      if (nv > 0.001) {
        const nx = tx + nextXY[0] * z, lw = nextLabel.offsetWidth || 200;
        const side = nx + 22 + lw < W - 12 ? 'right' : nx - 22 - lw > 12 ? 'left' : 'above';
        nextEl.style.transform = `translate(${nx.toFixed(1)}px,${(ty + nextXY[1] * z).toFixed(1)}px)`;
        if (side !== nextSide) { nextSide = side; nextEl.classList.toggle('left', side === 'left'); nextEl.classList.toggle('above', side === 'above'); }
      }

      // the balloon lets go at dusk and stays lit
      const bs = stops[stops.length - 1], inLast = seg.type === 'stop' && seg.i === bs.i, after = seg.type === 'end' || seg.type === 'tail';
      if ((inLast || after) && bs.color > 0.4) {
        const lt = inLast ? st : 1;
        if (!balloonFrom || (inLast && bs.v !== bs.rv)) { bs.rv = bs.v; const rc = bs.paint.getBoundingClientRect(); balloonFrom = { x: rc.left + rc.width * 0.38323, y: rc.top + rc.height * 0.0525, w: rc.width * 0.53465, h: rc.height * 0.67875 }; }
        const rise = smooth(0.38, 1, lt), extra = seg.type === 'end' ? smooth(0, 0.8, st) : seg.type === 'tail' ? 1 : 0;
        const b = balloonFrom, up = (rise * 0.3 + extra * 0.9) * (b.y + b.h * 0.3 + 140), sway = Math.sin(t / 1300) * 10 * clamp(rise * 2, 0, 1) + W * (0.12 * easeIO(rise) + 0.1 * extra);
        balloon.style.width = b.w + 'px'; balloon.style.height = b.h + 'px';
        balloon.style.opacity = (smooth(0.4, 0.8, bs.color) * (1 - smooth(0.7, 1, extra))).toFixed(3);
        balloon.style.transform = `translate3d(${(b.x + sway).toFixed(1)}px,${(b.y - up).toFixed(1)}px,0) rotate(${(Math.sin(t / 1500) * 3 * rise).toFixed(2)}deg) scale(${(1 - (rise * 0.12 + extra * 0.25)).toFixed(3)})`;
      } else if (balloonFrom) { balloon.style.opacity = '0'; balloonFrom = null; }

      const cur = seg.type === 'stop' ? stops[seg.i] : null;
      if (cur && cur.done && t > nextFall) {
        if (cur.ambient === 'leaves' && idleFor() > 3.5) { spawn(cur, 'leaves'); nextFall = t + 1900; }
        else if (cur.ambient === 'petals') { spawn(cur, 'petals'); nextFall = t + 3200; }
      }
    }

    // After the rest of this script has set up, so the other chapters hear that the walk is ready.
    // A page opened from another language starts where the reader was, before the first step is drawn.
    Promise.resolve().then(() => { M = MAP; build(); layout(); placeOnArrival(); ready = true; document.dispatchEvent(new Event('journey:ready')); });
    return { update, layout, get night() { return night; }, get range() { return [top0, top0 + secH]; } };
  })();

  /* ——— Night: one lit window, growing at the same calm pace ——— */
  const Night = (() => {
    const sec = $('#night'); if (!sec) return null;
    const win = $('.night-window', sec), vid = $('video', win), l1 = $('.night-l1', sec), l2 = $('.night-l2', sec);
    if (!Journey) { vid.setAttribute('controls', ''); l2.classList.add('on'); return null; }
    let playing = false, top = 0, h = 1, full = 1, qS = -1, lastQ = -1; const vel = { v: 0 };
    return {
      layout() { top = sec.getBoundingClientRect().top + scrollY; h = sec.offsetHeight; full = win.offsetHeight || 1; lastQ = -1; },
      update(sy, vh, dt) {
        const rTop = top - sy, visible = !(rTop + h <= 0 || rTop >= vh);
        const q = clamp(-rTop / Math.max(1, h - vh), 0, 1);
        qS = qS < 0 || !visible ? q : smoothDamp(qS, q, vel, 0.5, 0.6, dt);
        if (!visible) { if (playing) { vid.pause(); playing = false; } return; }
        if (!playing) { const pr = vid.play(); if (pr) pr.catch(() => {}); playing = true; }
        if (Math.abs(qS - lastQ) < 0.0003) return; lastQ = qS;
        const g = easeSine(smooth(0.08, 0.5, qS)), small = Math.min(vh * 0.17, 150) / full, sc = lerp(small, 1, g);
        win.style.setProperty('--s', sc.toFixed(4)); sec.style.setProperty('--ww', (full * sc * 9 / 16).toFixed(1) + 'px');
        l1.style.opacity = (1 - smooth(0.1, 0.32, qS)).toFixed(3);
        // Jordan's words stay with the window until the night scrolls away, so a quick reader still meets them.
        l2.classList.toggle('on', qS > 0.5);
      }
    };
  })();

  /* ——— The studio: a needle sews the steps together as you read ——— */
  const Studio = (() => {
    const sec = $('#studio'); if (!sec) return null;
    const wrap = $('.steps', sec), svg = $('.stitch', wrap), guide = $('.stitch-guide', svg), thr = $('.stitch-thread', svg), holesG = $('.stitch-holes', svg), needle = $('.needle', svg), clip = $('#sewn rect');
    const steps = $$('.step', wrap); let holes = [], y0 = 0, y1 = 0, top = 0, hh = 0, lastY = -1, circles = []; const cx = 30;
    function layout() {
      const wr = wrap.getBoundingClientRect(); top = wr.top + scrollY; hh = wrap.offsetHeight;
      svg.setAttribute('height', hh); svg.setAttribute('viewBox', `0 0 60 ${hh}`);
      holes = steps.map(st => { const m = $('.step-media', st).getBoundingClientRect(); return m.top + m.height / 2 - wr.top; });
      y0 = Math.max(0, holes[0] - 160); y1 = Math.min(hh, holes[holes.length - 1] + 160);
      let d = ''; for (let y = y0; y <= y1; y += 18) d += (d ? 'L' : 'M') + (cx + Math.sin(y * 0.013) * 1.6).toFixed(2) + ' ' + y.toFixed(1);
      guide.setAttribute('d', d); thr.setAttribute('d', d);
      holesG.innerHTML = holes.map(y => `<circle cx="${cx}" cy="${y.toFixed(1)}" r="5"/>`).join(''); circles = $$('circle', holesG);
      clip.setAttribute('y', y0); lastY = -1;
    }
    function update(sy, vh) {
      const rTop = top - sy; if (rTop + hh < -200 || rTop > vh + 200) return;
      const y = reduce ? y1 : clamp(vh * 0.56 - rTop, y0, y1); if (Math.abs(y - lastY) < 0.5) return; lastY = y;
      clip.setAttribute('height', Math.max(0, y - y0));
      needle.setAttribute('transform', `translate(${(cx + Math.sin(y * 0.013) * 1.6).toFixed(2)} ${y.toFixed(1)})`);
      needle.style.opacity = y > y0 + 4 && y < y1 - 4 ? 1 : 0;
      circles.forEach((c, i) => c.classList.toggle('sewn', y >= holes[i] - 2));
    }
    const vids = $$('video', sec);
    if (reduce) vids.forEach(v => v.setAttribute('controls', ''));
    else { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const p = e.target.play(); if (p) p.catch(() => {}); } else e.target.pause(); }), { threshold: 0.35 }); vids.forEach(v => io.observe(v)); }
    layout();
    return { layout, update };
  })();

  /* ——— A notebook, up close: photographs, a little of the letter, the facts ——— */
  const THREAD = C.thread || {};
  const PHOTOS = {
    '006': ['/media/web/world/photo/006-cut.webp', '/media/web/world/photo/006-spine.webp'], '001': ['/media/web/world/photo/001-cut.webp', '/media/web/world/photo/001-spine.webp'],
    '003': ['/media/web/world/photo/003-cut.webp', '/media/web/world/photo/003-spine.webp'], '004': ['/media/web/world/photo/004-cut.webp', '/media/web/world/photo/004-spine.webp'],
    '005': ['/media/web/world/photo/005-cut.webp', '/media/web/world/photo/005-spine.webp'], '002': ['/media/web/world/photo/002-cut.webp', '/media/web/world/photo/002-spine.webp']
  };
  const GUIDES = '/media/web/world/photo/guides.webp', BLANK = '/media/web/world/photo/blank-spread.webp';
  (() => {
    const dlg = $('#reader'); if (!dlg || !dlg.showModal) return;
    const main = $('.r-main', dlg), thumbs = $('.r-thumbs', dlg);
    let trigger = null, openId = null;
    const show = src => { main.src = src; main.classList.toggle('cut', /-cut\./.test(src)); $$('button', thumbs).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.src === src))); };
    function fill(id) {
      const photos = [[PHOTOS[id][0], 'reader.t1'], [PHOTOS[id][1], 'reader.t2'], [GUIDES, 'reader.t3'], [BLANK, 'reader.t4']];
      const cur = main.getAttribute('src');
      thumbs.innerHTML = photos.map(([src, k]) => `<button type="button" data-src="${src}" aria-label="${T(k)}"><img src="${src}" alt=""></button>`).join('');
      show(photos.some(p => p[0] === cur) ? cur : photos[0][0]);
      main.alt = T(`book.${id}.name`);
      $('.r-ed', dlg).textContent = `${T('nb.ed')} · ${id}`;
      $('#r-name').textContent = T(`book.${id}.name`);
      const ko = (C.ko || {})[id] || ''; $('.r-ko', dlg).textContent = L === 'ko' ? '' : ko; $('.r-ko', dlg).hidden = L === 'ko';
      $('.r-line', dlg).textContent = T(`book.${id}.line`);
      $('.r-binding', dlg).innerHTML = T('reader.bindingT', { thread: T(`thread.${THREAD[id]}`) });
      const letter = id === '002' ? `<p>${T('stop.002.line')}</p>` : T(`stop.${id}.letter`) + `<p class="l-rest">${T('stop.rest')}</p>`;
      $('.r-letter', dlg).innerHTML = letter;
    }
    function open(id, from) {
      trigger = from; openId = id; main.removeAttribute('src'); fill(id);
      doc.style.overflow = 'hidden'; dlg.showModal(); $('.reader', dlg).scrollTop = 0;
    }
    function close(after) {
      if (!dlg.open) return;
      dlg.classList.add('closing');
      setTimeout(() => { dlg.classList.remove('closing'); dlg.close(); openId = null; doc.style.overflow = ''; if (after) after(); else if (trigger) trigger.focus({ preventScroll: true }); }, reduce ? 0 : 380);
    }
    thumbs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) show(b.dataset.src); });
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
    $('.r-close', dlg).addEventListener('click', () => close());
    $('.r-find', dlg).addEventListener('click', e => { e.preventDefault(); close(() => $('#find').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })); });
    // Each notebook links to its page; with the reader available, it opens here instead.
    $$('.nb').forEach(btn => btn.addEventListener('click', e => { e.preventDefault(); open(btn.dataset.book, btn); }));
  })();

  /* ——— Your page ——— */
  const MARK = ['M35.75,17.17c-2.12,0-3.68-1.79-3.68-3.82s1.56-3.82,3.68-3.82,3.73,1.75,3.73,3.82-1.65,3.82-3.73,3.82Z',
    'M14.82,29.2c0-6.96,4.58-11.15,10.86-11.15s10.86,4.19,10.86,11.15v4.43c0,6.96-4.58,11.15-10.86,11.15s-10.86-4.19-10.86-11.15v-4.43ZM25.68,38.89c2.92,0,3.94-2.14,3.94-5.5v-3.94c0-3.36-1.02-5.5-3.94-5.5s-3.94,2.14-3.94,5.5v3.94c0,3.36,1.02,5.5,3.94,5.5Z'];
  const Page = (() => {
    const sec = $('#page'); if (!sec) return null;
    const spread = $('.spread', sec), leaf = $('.leaf-right', sec), cv = $('#ink'), ctx = cv.getContext('2d');
    const robey = $('.p-robey', sec), after = $('.page-after', sec), folio = $('.folio', sec), prompt = $('.prompt', sec);
    const btnTurn = $('[data-act="turn"]', sec), btnKeep = $('[data-act="keep"]', sec);
    const mobilePrompt = document.createElement('div'); mobilePrompt.className = 'mobile-prompt'; mobilePrompt.setAttribute('aria-hidden', 'true'); spread.parentNode.insertBefore(mobilePrompt, spread);
    let pi = 0;
    const fillPrompt = () => {
      const p = C.prompts[pi], others = LANGS.filter(l => l !== L), alts = $$('.p-alt', prompt);
      $('.p-word', prompt).textContent = p.w; $('.p-roman', prompt).textContent = p.r; $('.p-essence', prompt).textContent = p.e[L];
      $('.p-main', prompt).textContent = p.q[L]; $('.p-main', prompt).lang = L;
      others.forEach((l, i) => { alts[i].textContent = p.q[l]; alts[i].lang = l; });
      mobilePrompt.innerHTML = `<p class="p-word" lang="ko">${p.w}</p><p class="p-essence">${p.e[L]}</p><p class="p-main">${p.q[L]}</p>`;
    };
    fillPrompt();
    $('.p-next', sec).addEventListener('click', () => { prompt.classList.add('swap'); setTimeout(() => { pi = (pi + 1) % C.prompts.length; fillPrompt(); prompt.classList.remove('swap'); }, 450); });
    $$('.tools [data-guide]', sec).forEach(b => b.addEventListener('click', () => {
      leaf.dataset.guide = b.dataset.guide; spread.dataset.guide = b.dataset.guide;
      $$('.tools [data-guide]', sec).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    }));
    const WET = '#34539a', DRY = '#1c2846';
    let dpr = 1, PW = 1, PH = 1, strokes = [], cur = null, wrote = false, poolTimer = 0, folioN = 1;
    const base = () => Math.max(1.3, PW * 0.0048);
    function seg(g, s, i, color, w, h) { const P = s.pts, a = P[i - 1], b = P[i], pa = i > 1 ? P[i - 2] : a; g.strokeStyle = color; g.lineWidth = (a.w + b.w) / 2 * w; g.beginPath(); if (i > 1) g.moveTo((pa.x + a.x) / 2 * w, (pa.y + a.y) / 2 * h); else g.moveTo(a.x * w, a.y * h); g.quadraticCurveTo(a.x * w, a.y * h, (a.x + b.x) / 2 * w, (a.y + b.y) / 2 * h); g.stroke(); }
    function dot(g, s, color, w, h) { const a = s.pts[0]; g.fillStyle = color; g.beginPath(); g.arc(a.x * w, a.y * h, a.w * w * 0.5 * s.pool, 0, Math.PI * 2); g.fill(); }
    function tail(g, s, color, w, h) { const P = s.pts; if (P.length < 2) return; const a = P[P.length - 2], b = P[P.length - 1]; g.strokeStyle = color; g.lineWidth = b.w * w; g.beginPath(); g.moveTo((a.x + b.x) / 2 * w, (a.y + b.y) / 2 * h); g.lineTo(b.x * w, b.y * h); g.stroke(); }
    function drawStroke(g, s, color, w, h) { g.lineCap = 'round'; g.lineJoin = 'round'; dot(g, s, color, w, h); for (let i = 1; i < s.pts.length; i++) seg(g, s, i, color, w, h); tail(g, s, color, w, h); }
    function size() { const r = leaf.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); PW = Math.max(1, r.width); PH = Math.max(1, r.height); cv.width = Math.round(PW * dpr); cv.height = Math.round(PH * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); strokes.forEach(s => drawStroke(ctx, s, s.dry ? DRY : WET, PW, PH)); }
    // Points are kept as fractions of the page as it is now, so the ink stays under the finger even when a
    // messenger's toolbar slides away and the page changes size in the middle of a line.
    const pt = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / Math.max(1, r.width), y: (e.clientY - r.top) / Math.max(1, r.height), t: e.timeStamp || now(), pen: e.pointerType === 'pen', p: e.pressure || 0.5, w: 0 }; };
    function add(e) {
      const q = pt(e), P = cur.pts, prev = P[P.length - 1];
      const dist = Math.hypot((q.x - prev.x) * PW, (q.y - prev.y) * PH); if (dist < 0.8) return;
      const v = dist / Math.max(1, q.t - prev.t), pf = q.pen ? lerp(0.45, 1.4, q.p) : 1;
      q.w = lerp(prev.w, base() * pf * clamp(1.28 - v * 0.42, 0.5, 1.28) / PW, 0.28);
      P.push(q); seg(ctx, cur, P.length - 1, WET, PW, PH); clearTimeout(poolTimer);
    }
    cv.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) { /* nicety */ }
      const q = pt(e); q.w = base() * 0.95 / PW; cur = { pts: [q], pool: 1, dry: false };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; dot(ctx, cur, WET, PW, PH);
      leaf.classList.add('has-ink'); robey.classList.add('watching');
      const grow = () => { if (!cur || cur.pts.length > 1 || cur.pool > 1.7) return; cur.pool += 0.07; dot(ctx, cur, WET, PW, PH); poolTimer = setTimeout(grow, 90); };
      poolTimer = setTimeout(grow, 280);
    });
    cv.addEventListener('pointermove', e => { if (!cur) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : []; (evs.length ? evs : [e]).forEach(add); });
    const end = () => {
      if (!cur) return; clearTimeout(poolTimer); tail(ctx, cur, WET, PW, PH);
      const s = cur; strokes.push(s); cur = null;
      setTimeout(() => { if (!strokes.includes(s)) return; s.dry = true; drawStroke(ctx, s, DRY, PW, PH); }, 1300);
      if (!wrote) { wrote = true; setTimeout(() => after.classList.add('on'), 1500); }
      btnTurn.disabled = false; btnKeep.disabled = false;
      clearTimeout(robey._t); robey._t = setTimeout(() => robey.classList.remove('watching'), 2400);
    };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end); cv.addEventListener('lostpointercapture', end);
    function clear() { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.restore(); strokes = []; leaf.classList.remove('has-ink'); }
    btnTurn.addEventListener('click', () => {
      if (!strokes.length) return;
      const snap = document.createElement('div'); snap.className = 'turning'; snap.setAttribute('aria-hidden', 'true');
      const im = new Image(); im.alt = ''; im.src = cv.toDataURL('image/png'); snap.appendChild(im);
      const r = leaf.getBoundingClientRect(), sr = spread.getBoundingClientRect();
      Object.assign(snap.style, { left: (r.left - sr.left) + 'px', top: '0px', width: r.width + 'px', height: r.height + 'px' });
      spread.appendChild(snap); clear(); btnTurn.disabled = true; btnKeep.disabled = true; folioN += 2; folio.textContent = folioN;
      requestAnimationFrame(() => requestAnimationFrame(() => snap.classList.add('go'))); setTimeout(() => snap.remove(), 1300);
    });
    btnKeep.addEventListener('click', () => {
      const w = 1240, h = Math.round(w * PH / PW), c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
      g.fillStyle = '#fcfaf5'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 16000; i++) { g.fillStyle = `rgba(70,60,50,${(Math.random() * 0.04).toFixed(3)})`; g.fillRect(Math.random() * w, Math.random() * h, 1.3, 1.3); }
      strokes.forEach(s => drawStroke(g, s, DRY, w, h));
      g.save(); g.translate(w - 122, h - 124); g.scale(1.35, 1.35); g.fillStyle = 'rgba(176,57,46,.88)'; MARK.forEach(d => g.fill(new Path2D(d))); g.restore();
      g.fillStyle = 'rgba(19,26,42,.42)'; g.font = '17px "Gowun Dodum", sans-serif'; g.textAlign = 'right'; g.fillText('Studio Monjo · Seoul', w - 124, h - 52);
      const url = c.toDataURL('image/png');
      c.toBlob(blob => {
        const file = blob && typeof File === 'function' ? new File([blob], 'my-page.png', { type: 'image/png' }) : null;
        const canShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
        if (canShare && (IN_APP || IOS)) { navigator.share({ files: [file], title: 'Studio Monjo' }).catch(() => {}); return; }
        if (IN_APP) { showKept(url); return; }
        const a = document.createElement('a'); a.download = 'my-page.png'; a.href = url; document.body.appendChild(a); a.click(); a.remove();
      }, 'image/png');
    });
    // Messenger browsers (KakaoTalk, Naver, Instagram, Facebook, Line) cannot save a page made here as a
    // download, so it opens as a picture to press and hold.
    function showKept(url) {
      let d = $('.kept');
      if (!d) {
        d = document.createElement('dialog'); d.className = 'kept';
        d.innerHTML = '<div class="kept-card"><img alt=""><p></p><button type="button"></button></div>';
        document.body.appendChild(d);
        $('button', d).addEventListener('click', () => d.close());
        d.addEventListener('click', e => { if (e.target === d) d.close(); });
      }
      $('img', d).src = url; $('img', d).alt = T('page.aria');
      $('p', d).textContent = T('page.kept'); $('button', d).textContent = T('reader.close');
      if (d.showModal) d.showModal(); else window.open(url);
    }
    size();
    if ('ResizeObserver' in window) { let rq = 0; new ResizeObserver(() => { cancelAnimationFrame(rq); rq = requestAnimationFrame(size); }).observe(leaf); }
    // Some in-app browsers still scroll the page under a finger that writes; this page is for ink only.
    ['touchstart', 'touchmove'].forEach(ev => cv.addEventListener(ev, e => { if (e.cancelable) e.preventDefault(); }, { passive: false }));
    return { size };
  })();

  /* ——— Invite Robey ——— */
  (() => {
    const sec = $('#visit'); if (!sec) return;
    if (reduce || !('IntersectionObserver' in window)) { sec.classList.add('in'); return; }
    new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { sec.classList.add('in'); io.disconnect(); } }), { threshold: 0.25 }).observe(sec);
  })();

  /* ——— Time together ——— */
  (() => {
    const el = $('.together'); if (!el) return;
    let m = -1;
    const say = () => {
      if (m < 1) { el.textContent = T('find.together'); return; }
      const words = C.words;
      const n = L === 'ko' ? String(m) : (m <= 20 && words ? words[m] : String(m));
      el.textContent = T('find.minutes', { n, s: m === 1 ? '' : 's' });
    };
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { m = Math.round(seenMs / 60000); say(); } }), { threshold: 0.5 }).observe(el);
  })();

  /* ——— A way past the walk, for those who prefer to go straight to the notebooks ——— */
  const Jump = (() => {
    const btn = $('.jump'), target = $('#notebooks'); if (!btn || !target) return null;
    const veil = document.createElement('div'); veil.className = 'veil'; veil.setAttribute('aria-hidden', 'true'); document.body.appendChild(veil);
    btn.addEventListener('click', e => {
      e.preventDefault();
      const go = () => { target.scrollIntoView({ behavior: 'auto', block: 'start' }); try { history.replaceState(null, '', location.pathname + location.search); } catch (_) { /* file: URLs */ } };
      if (reduce) { go(); target.focus({ preventScroll: true }); return; }
      veil.classList.add('on');
      setTimeout(() => { go(); requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.remove('on'))); }, 480);
    });
    target.setAttribute('tabindex', '-1');
    let shown = null;
    return { update(sy, vh) { const r = target.getBoundingClientRect(); const on = r.top > vh * 0.6; if (on !== shown) { shown = on; btn.classList.toggle('on', on); } } };
  })();

  const top = $('.top'), themed = $$('main > section, .foot');
  let bands = [];
  const measure = () => { bands = themed.map(s => { const r = s.getBoundingClientRect(); return { id: s.id, dark: s.dataset.theme === 'dark', a: r.top + scrollY, b: r.bottom + scrollY }; }); };
  const darkAt = y => { for (const b of bands) if (b.a <= y && b.b > y) return b.id === 'journey' ? !!(Journey && Journey.night) : b.dark; return false; };

  let last = now(), wasDark = null, wasScrim = null, wasDarkLow = null;
  function frame(t) {
    const dt = Math.min(0.05, Math.max(0, (t - last) / 1000)); last = t;
    if (document.visibilityState === 'visible') seenMs += dt * 1000;
    const sy = scrollY, vh = innerHeight;
    if (Journey) Journey.update(t, dt, sy, vh);
    if (Night) Night.update(sy, vh, dt);
    if (Studio) Studio.update(sy, vh);
    if (Jump) Jump.update(sy, vh);
    const dark = darkAt(sy + 34);
    const darkLow = darkAt(sy + vh - 40);
    if (darkLow !== wasDarkLow) { wasDarkLow = darkLow; $('.jump').classList.toggle('is-dark', darkLow); }
    if (dark !== wasDark) { wasDark = dark; top.classList.toggle('is-dark', dark); }
    const jr = Journey ? Journey.range : null;
    const scrim = !(jr && sy >= jr[0] && sy < jr[1] - 60) && sy > 40;
    if (scrim !== wasScrim) { wasScrim = scrim; top.classList.toggle('scrim', scrim); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  let rz = 0, lastW = innerWidth, lastH = innerHeight;
  const relayoutAll = () => { if (Journey) Journey.layout(); if (Studio) Studio.layout(); if (Night) Night.layout(); if (Page) Page.size(); measure(); };
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      const big = innerWidth !== lastW || Math.abs(innerHeight - lastH) > 140; lastW = innerWidth; lastH = innerHeight;
      if (big) relayoutAll(); else { if (Studio) Studio.layout(); if (Night) Night.layout(); measure(); }
    }, 140);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayoutAll);
  document.addEventListener('journey:ready', relayoutAll);
  addEventListener('load', relayoutAll);
  setTimeout(relayoutAll, 600);
})();
