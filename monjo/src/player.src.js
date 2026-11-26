/* The film player, shared by the pages. A film is a run of pictures the scroll plays.
   What changed after "it is still a little laggy": a picture used to be decoded at the moment it was drawn
   (up to 16 ms each on a Mac, more than one screen refresh at 120 Hz). Now the pictures arrive as sheets of four,
   and the sheets around the place in the film are decoded ahead of time, off the main thread, into bitmaps.
   Drawing a bitmap takes well under a millisecond. The canvas is also no larger than the pictures themselves.

   25 November, after looking at how Apple's product pages do it: most of their motion is short clips at 30 frames a second
   that play by the clock when the visitor arrives; they only tie a film to the scroll when it has about 150 frames per screen
   of scroll (ours has about 50). So the film now has two ways to move:
     "steps"  the film plays by the clock from one resting place to the next, at its own even pace, forwards or backwards;
     "scrub"  the earlier way: the scroll position is the place in the film, followed with a glide. Kept for comparison.

   Later the same day, after "I end up scrolling and nothing happens": the first version of "steps" held the screen still
   while the film played, so the scroll had nothing to move. Apple never does that: when their screen is held, the scroll
   drives the film, and when a clip plays by itself the page keeps moving under the hand. So now, in "steps":
     the words are no longer pinned to the picture: each block of words rides the page, at the speed of the scroll;
     the film leaves for the next resting place as soon as the scroll leaves the one it is on;
     when the hand rests, the page carries on to that next place by itself (onward, never back; the visitor's hand always wins). */
function monjoFilm(cfg){
  "use strict";
  var root = document.documentElement, stage = cfg.stage, film = stage.parentNode;
  var cv = cfg.canvas, ctx = cv.getContext("2d"), poster = cfg.poster;
  var cards = [].slice.call(stage.querySelectorAll(".card")), tags = [].slice.call(stage.querySelectorAll(".tag"));
  var rail = cfg.rail ? [].slice.call(cfg.rail.children) : [], bar = cfg.bar, progress = cfg.progress || function(){};
  var PLAY = cfg.play, LAST = PLAY.length - 1, KEYS = cfg.keys, LEN = cfg.len, BEATS = cfg.beats || [], RESTS = cfg.rests || [];
  var ANCHORS = cfg.anchors || {}, SETS = cfg.sets, PER = 4, RATE = cfg.rate || 1;
  // The pictures come in layers. Layer "s" holds one picture per frame of the timeline (30 a second): enough to play the film.
  // When the film was rendered with two pictures per frame, layer "t" holds the ones in between: they arrive after, and make it
  // twice as smooth. On a slow line the film plays at once from layer "s" and smooths out as layer "t" comes in.
  var NS = Math.ceil(Math.ceil(cfg.frames / RATE) / PER), NT = RATE > 1 ? Math.ceil(Math.floor(cfg.frames / RATE) / PER) : 0;
  function base(n){ return n - n % RATE; }             // the layer-"s" picture at or just before picture n
  function loc(n){ var j = n % RATE, q = (n - j) / RATE; return ["st".charAt(j) + (q >> 2), q & 3]; }      // which sheet, and which of its four pictures
  var STOPS = cfg.stops || null, STEP = cfg.step || 0.8, FPS = cfg.fps || 30, AWAY = cfg.away || 0.045;
  var playing = !!STOPS && cfg.mode !== "scrub";       // "steps": the film moves by the clock, the words ride the page
  var zone = 0, way = 1, ref = 0, glide = null, pump = null, NEEDS = null;
  if (playing) {
    LEN = (STOPS.length - 1) * STEP; film.style.height = "calc(var(--sh) * " + (LEN + 1) + ")";
    var layer = document.createElement("div"); layer.className = "steps";      // one screen-sized block per resting place, laid down the page
    cards.forEach(function(c, i){
      var st = document.createElement("div"); st.className = "step"; st.style.top = "calc(var(--sh) * " + (i * STEP).toFixed(3) + ")";
      c.classList.remove("on"); st.appendChild(c); layer.appendChild(st);
    });
    film.insertBefore(layer, stage.nextSibling);
  }
  film.classList.toggle("travel", playing);
  // The film arrives one move ahead, not all at once: at each resting place, the sheets needed to play as far as the next one.
  // A visitor who only looks at the first screen never downloads the rest.
  if (playing) NEEDS = STOPS.map(function(_, z){
    var to = STOPS[Math.min(z + 1, STOPS.length - 1)], mx = 0, i;
    for (i = 0; i <= to; i++) if (PLAY[i] > mx) mx = PLAY[i];
    return (base(mx) / RATE) >> 2;
  });
  function limit(){ return NEEDS ? NEEDS[Math.min(zone, NEEDS.length - 1)] : NS - 1; }
  var canBitmap = typeof createImageBitmap === "function";
  var set = null, cw = 0, ch = 0, k = 1, fit = {s: 1, dx: 0, dy: 0};
  var blobs = {}, bmps = {}, pend = {}, got = {}, got2 = {}, dead = {}, oy = 0, barH = 0, pvh = 0, DY = null, probe = null, SUBJ = cfg.subjects || null;
  Object.keys(SETS).forEach(function(s){ blobs[s] = {}; bmps[s] = {}; pend[s] = {}; dead[s] = {}; got[s] = 0; got2[s] = 0; });
  var target = 0, cur = 0, lastT = 0, running = false, drawn = -1, shown = false, waits = 0;

  function range(el){ var r = el.getAttribute("data-show").split(","); return [parseFloat(r[0]) * RATE, parseFloat(r[1]) * RATE]; }
  cards.forEach(function(c){ c._r = range(c); });
  tags.forEach(function(t){ t._r = range(t); });
  function pad(n){ return ("00" + n).slice(-3); }
  function url(s, key){ return SETS[s].dir + "/" + key.charAt(0) + pad(+key.slice(1)) + ".jpg"; }

  // ---------- the sheets arrive: layer "s" first (in the order it plays, or coarse first when the film follows the scroll), then layer "t"
  function order(){
    var seen = {}, out = [], i;
    if (playing) { for (i = 0; i < NS; i++) out.push(i); return out; }
    [8, 4, 2, 1].forEach(function(step){ for (var i = 0; i < NS; i += step) if (!seen[i]) { seen[i] = 1; out.push(i); } });
    return out;
  }
  function loadSet(){
    var s = set, q = order(), q2 = [], live = 0, tried = got[s], i;
    for (i = 0; i < NT; i++) q2.push(i);
    function said(){ if (s === set) progress(Math.min(tried / (limit() + 1), 1)); }      // the page shows how much of the part now needed has arrived
    said();
    function get(key, first){
      if (blobs[s][key] || dead[s][key]) return;
      live++;
      fetch(url(s, key)).then(function(r){ if (!r.ok) throw 0; return r.blob(); })
        .then(function(b){ blobs[s][key] = b; if (first) got[s]++; else got2[s]++; }, function(){ dead[s][key] = 1; })
        .then(function(){ live--; if (first) tried++; said(); drawn = -1; kick(); next(); });
    }
    function next(){
      if (s !== set) return;
      said();
      while (live < 4 && q.length && (!NEEDS || q[0] <= limit())) get("s" + q.shift(), true);
      while (live < 4 && q2.length && q2[0] <= limit() && !(q.length && (!NEEDS || q[0] <= limit()))) get("t" + q2.shift(), false);
    }
    pump = next;
    next();
  }

  // ---------- the sheets near the place in the film are opened into bitmaps, the others are let go
  function decode(s, i){
    if (bmps[s][i] || pend[s][i] || !blobs[s][i]) return false;
    pend[s][i] = 1;
    var done = function(b){ delete pend[s][i]; if (b) { bmps[s][i] = b; if (s === set) { drawn = -1; kick(); } } else dead[s][i] = 1; };
    if (canBitmap) createImageBitmap(blobs[s][i]).then(done, function(){ done(null); });
    else { var im = new Image(); im.onload = function(){ done(im); }; im.onerror = function(){ done(null); }; im.src = URL.createObjectURL(blobs[s][i]); }
    return true;
  }
  function tend(){
    var s = set, want = [], want2 = [], keep = {}, c = Math.round(cur), dir = target >= cur ? 1 : -1, ahead = (cfg.ahead || 34) * RATE, i, p, sh;
    var behind = ((playing && target === cur) ? 22 : 8) * RATE;        // at rest, be ready to leave either way
    if (playing && target === cur) ahead = 22 * RATE;
    function add(pos){
      if (pos < 0 || pos > LAST) return;
      var n = PLAY[pos], x = loc(base(n))[0], y;
      if (!keep[x]) { keep[x] = 1; want.push(x); }
      if (n % RATE) { y = loc(n)[0]; if (!keep[y]) { keep[y] = 1; want2.push(y); } }
    }
    add(c); add(c + dir); add(c - dir);
    for (i = 2; i <= ahead; i++) { add(c + dir * i); if (i <= behind) add(c - dir * i); }
    var busy = Object.keys(pend[s]).length;
    for (i = 0; i < want.length && busy < 3; i++) if (decode(s, want[i])) busy++;          // what the film needs to play, first
    for (i = 0; i < want2.length && busy < 3; i++) if (decode(s, want2[i])) busy++;        // then what makes it smoother
    for (sh in bmps[s]) if (!keep[sh]) { p = bmps[s][sh]; if (p.close) p.close(); delete bmps[s][sh]; }
  }
  function have(n){ var L = loc(n), b = bmps[set][L[0]]; return b ? [b, L[1]] : null; }      // picture n itself, if its sheet is open
  function near(n){                                    // picture n, or the timeline frame beside it
    var h = have(n), f0;
    if (h || !(n % RATE)) return h;
    f0 = base(n);
    return have(f0) || (f0 + RATE < cfg.frames ? have(f0 + RATE) : null);
  }
  function sheetFor(n){                                // any open sheet of layer "s", the nearest to picture n
    var s = bmps[set], i = (base(n) / RATE) >> 2, d;
    for (d = 0; d < NS; d++) { if (s["s" + (i - d)]) return [s["s" + (i - d)], d ? 3 : (base(n) / RATE) & 3]; if (s["s" + (i + d)]) return [s["s" + (i + d)], 0]; }
    return null;
  }
  function blit(hit){
    var S = SETS[set], j = hit[1];
    ctx.drawImage(hit[0], (j & 1) * S.w + 0.5, (j >> 1) * S.h + 0.5, S.w - 1, S.h - 1, fit.dx * k, fit.dy * k, S.w * fit.s * k, S.h * fit.s * k);
  }

  function size(){
    cw = stage.clientWidth; ch = stage.clientHeight || window.innerHeight;
    var want = (cw / ch < 0.8) ? "p" : "d";
    film.classList.toggle("tall", want === "p");
    if (bar && !bar.classList.contains("solid")) barH = bar.offsetHeight;
    if (want !== set) { set = want; shown = false; poster.style.visibility = ""; poster.src = SETS[set].dir + "/poster.jpg"; loadSet(); }
    var vw = cv.clientWidth || cw, vh = cv.clientHeight || ch, S = SETS[set], s; oy = cv.offsetTop || 0; pvh = vh;
    if (set === "p" && SUBJ) {
      // a phone: the picture is exactly as wide as the screen, so a notebook is never cut at the sides, and it is slid up or down
      // until the notebooks sit between the title (or the menu) and the words. See place the picture, below.
      var V = visible(); film.classList.toggle("short", V < 600);
      s = vw / S.w; fit = {s: s, dx: 0, dy: 0}; DY = offsets(S.h * s);
    } else {
      s = Math.max(vw / S.w, vh / S.h); DY = null;
      fit = {s: s, dx: (vw - S.w * s) / 2, dy: (vh - S.h * s) / 2};
    }
    k = Math.min(Math.min(window.devicePixelRatio || 1, 2), 1 / s);      // never more canvas than the picture has
    cv.width = Math.max(Math.round(vw * k), 1); cv.height = Math.max(Math.round(vh * k), 1);
    drawn = -1; read(); kick(); if (playing) plan();
  }
  // ---------- place the picture (phones). The words keep their places: the title on the blue at the top, the rest on the desk at the
  // bottom, inside what Safari really shows. For each resting moment, the room left between them is measured on the page, and the
  // picture is slid so that the notebooks of that moment sit in the middle of it. Between two moments it drifts, like a camera.
  function visible(){                                  // the height Safari shows with its toolbar on screen: the stage, less the toolbar (--tb)
    if (!probe) { probe = document.createElement("div"); probe.style.cssText = "position:absolute;left:0;top:0;width:0;height:var(--tb,0px);visibility:hidden;pointer-events:none"; film.appendChild(probe); }
    return ch - probe.offsetHeight;
  }
  function offsets(H){
    var menu = Math.max(barH - 14, 60), want = [], lo = [], hi = [];
    cards.forEach(function(c, i){
      var base = c.parentNode.getBoundingClientRect().top, a = SUBJ[i][0] * H, b = SUBJ[i][1] * H, top, bot;
      if (i === 0) {                                   // the first screen: under the title, above the invitation to scroll
        var t = c.querySelector(".sub") || c.querySelector(".title"), st = c.querySelector(".start");
        top = t.getBoundingClientRect().bottom - base + 12; bot = st.getBoundingClientRect().top - base - 12;
      } else {                                         // the other moments: under the menu, above the first line of the words
        var first = 1e9; [].forEach.call(c.children, function(e){ if (e.offsetHeight) first = Math.min(first, e.getBoundingClientRect().top); });
        top = menu + 8; bot = first - base - 16;
      }
      var l = top - a, u = bot - b, w = (top + bot) / 2 - (a + b) / 2, cap = cfg.hide && cfg.hide[i] ? -cfg.hide[i] * H - 2 : null;
      if (cap !== null && cap >= l && cap < u) { u = cap; w = Math.min(w, cap); }       // room to lift the picture until that part is off the screen
      lo.push(l); hi.push(u); want.push(w);
    });
    var out = want.map(function(w, i){ return lo[i] <= hi[i] ? Math.min(Math.max(w, lo[i]), hi[i]) : (i ? hi[i] : (lo[i] + hi[i]) / 2); });      // no room for both: the words win
    if (cfg.still) {                                   // moments filmed from one fixed camera share one place
      var g = cfg.still, L = -1e9, U = 1e9, mean = 0;
      g.forEach(function(i){ L = Math.max(L, lo[i]); U = Math.min(U, hi[i]); mean += want[i] / g.length; });
      var d = L <= U ? Math.min(Math.max(mean, L), U) : U;
      g.forEach(function(i){ out[i] = d; });
    }
    return out;
  }
  function dyAt(c){                                    // where the picture sits at this place in the film
    var i = 0; while (i < STOPS.length - 2 && c > STOPS[i + 1]) i++;
    var t = Math.min(Math.max((c - STOPS[i]) / (STOPS[i + 1] - STOPS[i]), 0), 1); t = t * t * (3 - 2 * t);
    return DY[i] + (DY[i + 1] - DY[i]) * t;
  }
  function mirror(){                                   // above and below the picture, its own edge continues, turned over: more wall, more desk
    var S = SETS[set], top = Math.round(fit.dy * k), bot = Math.round((fit.dy + S.h * fit.s) * k), need = cv.height - bot, h;
    if (top > 0) { h = Math.min(top, cv.height - top); ctx.save(); ctx.translate(0, 2 * top); ctx.scale(1, -1); ctx.drawImage(cv, 0, top, cv.width, h, 0, top, cv.width, h); ctx.restore(); }
    if (need > 0) { h = Math.min(need, bot); ctx.save(); ctx.translate(0, 2 * bot); ctx.scale(1, -1); ctx.drawImage(cv, 0, bot - h, cv.width, h, 0, bot - h, cv.width, h); ctx.restore(); }
  }
  function read(){
    var y = (window.pageYOffset || document.scrollingElement.scrollTop) - film.offsetTop;
    var s = Math.min(Math.max(y / ch, 0), LEN), i = 1;
    if (playing) {
      // Which resting place the film should be going to. The direction of the hand decides: onward means the next place ahead,
      // back means the one behind. A turn only counts once the hand has come back a little, so a wobble changes nothing.
      var u = s / STEP;
      if (way > 0) { if (u > ref) ref = u; else if (u < ref - AWAY) { way = -1; ref = u; } }
      else { if (u < ref) ref = u; else if (u > ref + AWAY) { way = 1; ref = u; } }
      zone = Math.min(Math.max(way > 0 ? Math.ceil(u - AWAY) : Math.floor(u + AWAY), 0), STOPS.length - 1);
      target = STOPS[zone]; place(y / ch);
      if (pump) pump();                                // a new resting place is in reach: fetch what the next move needs
      if (y / ch > LEN + 1.05) cur = target;             // the film is off the screen: no need to play it there
      return;
    }
    while (i < KEYS.length - 1 && KEYS[i][0] < s) i++;
    var a = KEYS[i - 1], b = KEYS[i], t = (b[0] === a[0]) ? 0 : (s - a[0]) / (b[0] - a[0]);
    target = a[1] + (b[1] - a[1]) * Math.min(Math.max(t, 0), 1);
  }
  function place(sv){                                  // sv: the scroll, in screens. Words are full where they are read, and fade as they ride away
    var tall = set === "p";
    cards.forEach(function(el, i){
      var d = sv - i * STEP, o;
      if (d >= 0) o = 1 - (d - (tall ? 0.01 : 0.08)) / (tall ? 0.085 : 0.30);                  // rising away (on a phone: gone before it reaches the picture above)
      else o = (i === 0) ? 1 : 1 + (d + 0.10) / 0.34;                                           // arriving from below
      o = o < 0 ? 0 : o > 1 ? 1 : o;
      if (el._o !== o) { el._o = o; el.style.opacity = o.toFixed(3); el.style.visibility = o ? "visible" : "hidden"; }
    });
  }
  function anchor(nm, c){
    var i0 = Math.floor(c), f = c - i0, A = ANCHORS[PLAY[i0]], B = ANCHORS[PLAY[Math.min(i0 + 1, LAST)]];
    if (!A || !A[nm]) return null;
    var S = SETS[set], a = S.map(A[nm]), b = B && B[nm] ? S.map(B[nm]) : a;
    return [fit.dx + (a[0] + (b[0] - a[0]) * f) * S.w * fit.s, oy + fit.dy + (a[1] + (b[1] - a[1]) * f) * S.h * fit.s];
  }
  function paint(){
    var c = Math.min(Math.max(cur, 0), LAST), i0 = Math.floor(c), f = c - i0;
    var n0 = PLAY[i0], own = have(n0), A = own || near(n0) || sheetFor(n0);
    if (DY) fit.dy = dyAt(c);
    if (!A && DY && poster.complete && poster.naturalWidth) {          // a phone, before the film arrives: the first picture, in the same place
      var S0 = SETS[set]; ctx.globalAlpha = 1;
      ctx.drawImage(poster, 0, 0, poster.naturalWidth, poster.naturalHeight, 0, fit.dy * k, S0.w * fit.s * k, S0.h * fit.s * k); mirror();
    }
    if (A) {
      ctx.globalAlpha = 1; blit(A);
      if (own && f > 0.03 && i0 < LAST) {            // blend only true neighbours: a stand-in frame blended with the next one shows double
        var B = have(PLAY[i0 + 1]);
        if (B) { ctx.globalAlpha = f; blit(B); ctx.globalAlpha = 1; }
      }
      if (DY) mirror();
      if (!shown) { shown = true; poster.style.visibility = "hidden"; }
    }
    if (!playing) cards.forEach(function(el){ el.classList.toggle("on", c >= el._r[0] && c <= el._r[1]); });
    tags.forEach(function(t){
      var on = c >= t._r[0] && c <= t._r[1], p = anchor(t.getAttribute("data-at"), c);
      if (!p) { t.classList.remove("on"); return; }
      p[1] = Math.min(Math.max(p[1], oy + 15), oy + pvh - 15);          // a name stays inside the picture, even on a very short screen
      if (t.classList.contains("name")) {
        var hw = t.offsetWidth / 2 + 8, x = Math.min(Math.max(p[0], hw), cw - hw);      // a name never leaves the screen
        t.style.transform = "translate(" + x.toFixed(1) + "px," + p[1].toFixed(1) + "px) translate(-50%,-100%)";
      } else {
        var w = t.offsetWidth, flip = t.getAttribute("data-side") === "left";
        if (!flip && p[0] + w > cw - 10) flip = true;          // no room on that side: go to the other
        if (flip && p[0] - w < 10) flip = false;
        t.classList.toggle("flip", flip);
        t.style.transform = "translate(" + p[0].toFixed(1) + "px," + p[1].toFixed(1) + "px) translate(" + (flip ? "-100%" : "0") + ",-50%)";
      }
      t.classList.toggle("on", on);
    });
    var b = 0; while (b < BEATS.length - 1 && c > BEATS[b]) b++;
    rail.forEach(function(li, n){ li.classList.toggle("on", n === b); });
    drawn = c;
  }
  function tick(t){
    var dt = Math.min((t - lastT) / 1000, 0.05); lastT = t;
    var d = target - cur, step, cap;
    if (playing) {
      // by the clock: one move at the film's own even pace; when several resting places lie between here and there,
      // the ones passed through go by faster, and the last move is again at the film's own pace
      var dist = Math.abs(d), go = d > 0 ? 1 : -1, lo = Math.min(cur, target), hi = Math.max(cur, target), between = 0, q;
      for (q = 0; q < STOPS.length; q++) if (STOPS[q] > lo + 0.5 && STOPS[q] < hi - 0.5) between++;
      step = Math.min(FPS * Math.min(1 + between * 1.5, 5) * dt, dist);
      var nx = cur + go * step, need = PLAY[go > 0 ? Math.min(Math.ceil(nx), LAST) : Math.max(Math.floor(nx), 0)];
      var there = near(need), lost = dead[set][loc(base(need))[0]];
      if (dist && (there || lost)) cur = nx;                             // a picture that has not arrived is waited for, never skipped (unless its file is lost)
      waits = (dist && !there) ? waits + 1 : 0;
    } else {
      step = d * (1 - Math.exp(-dt * 6.5)); cap = dt * (cfg.cap || 104);    // glide, never race
      if (step > cap) step = cap; if (step < -cap) step = -cap;
      cur += step;
    }
    if (Math.abs(target - cur) < 0.004) cur = target;
    tend();
    if (cur !== drawn) paint();
    if (cur !== target) requestAnimationFrame(tick); else running = false;
  }
  function kick(){ if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(tick); } }
  // the top bar turns solid once the page under it is no longer the film (in "steps", the last step still shows the film right up to the bar)
  function solid(){ if (bar) bar.classList.toggle("solid", (window.pageYOffset || 0) > film.offsetTop + film.offsetHeight - (playing ? 96 : ch + 4)); }
  // when the hand rests in the middle of a gesture, the page finishes it: onward, never back
  var restT = 0, touching = false;
  function top(){ return window.pageYOffset || document.scrollingElement.scrollTop || 0; }
  function stopGlide(){ if (glide) { glide = null; root.style.scrollBehavior = ""; } }
  function glideTo(y){                                  // a slow, even carry; anything the visitor does ends it at once
    var y0 = top(), dy = y - y0;
    if (Math.abs(dy) < 2) return;
    var dur = Math.min(Math.max(380 + 640 * Math.abs(dy) / (STEP * ch), 420), 980), t0 = performance.now(), last = y0, me = {};
    glide = me; root.style.scrollBehavior = "auto";
    (function f(t){
      if (glide !== me) return;
      if (Math.abs(top() - last) > 3) { stopGlide(); return; }          // something else moved the page: the visitor wins
      var q = Math.min(Math.max((t - t0) / dur, 0), 1), e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2;
      last = Math.round(y0 + dy * e); window.scrollTo(0, last); last = top();
      if (q < 1) requestAnimationFrame(f); else stopGlide();
    })(t0);
  }
  function settle(){
    var s = (top() - film.offsetTop) / ch, i;
    if (touching || glide) return;
    if (playing) {
      if (s < -0.01 || s > LEN + 0.02) return;                          // above the film, or already leaving it
      glideTo(film.offsetTop + zone * STEP * ch);
      return;
    }
    if (s <= 0.02 || s >= LEN) return;
    for (i = 0; i < RESTS.length; i++) {
      if (s >= RESTS[i][0] - 0.02 && s <= RESTS[i][1] + 0.02) return;
      if (RESTS[i][0] > s) { window.scrollTo({top: film.offsetTop + (RESTS[i][0] + 0.07) * ch, behavior: "smooth"}); return; }
    }
  }
  function plan(){ clearTimeout(restT); if (!touching) restT = setTimeout(settle, playing ? (cfg.rest || 170) : 620); }
  window.addEventListener("touchstart", function(){ touching = true; clearTimeout(restT); stopGlide(); }, {passive: true});
  window.addEventListener("touchend", function(){ touching = false; plan(); }, {passive: true});
  window.addEventListener("touchcancel", function(){ touching = false; plan(); }, {passive: true});
  // One push of the wheel or the trackpad moves the page one step, however hard or long it is (26 November 2026: visitors of the live
  // site "scroll and it skips steps and they struggle to scroll gently"). A wheel sends a burst of events and a trackpad goes on
  // sending them after the fingers have left; here the first of them starts the step and the rest of that push is swallowed.
  // A new push is a pause in the events, or a delta that jumps up again. Above the film, and below its last step, the page
  // scrolls as any page does.
  var wLast = 0, wDelta = 0, wSum = 0, wSpent = false, wLock = 0, wBelow = false;
  function onWheel(ev){
    if (!playing || ev.ctrlKey || Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) { stopGlide(); return; }      // pinch, or sideways
    var n = STOPS.length - 1, u = (top() - film.offsetTop) / (STEP * ch), dy = ev.deltaY * (ev.deltaMode === 1 ? 40 : ev.deltaMode === 2 ? ch : 1);
    var now = performance.now(), fresh = now - wLast > 140 || (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(wDelta) * 1.7);
    wLast = now; wDelta = dy;
    if (fresh) { wSum = 0; wSpent = false; wBelow = false; }
    if (u > n + 0.02) wBelow = true;                        // this push began under the film: coming up, it stops at the last step
    if (u < -0.02 || u > n + 0.02 || (dy > 0 && u >= n - 0.02) || (dy < 0 && u <= 0.02)) {                  // not the film's to answer
      if (!wSpent) stopGlide();                             // (the tail of a push that has had its step does not carry the page on)
      else if (ev.cancelable) ev.preventDefault();
      return;
    }
    if (ev.cancelable) ev.preventDefault();
    if (wSpent || glide || now < wLock) return;
    wSum += dy;
    if (Math.abs(wSum) < 24) return;                        // a brush of the fingers is not a push
    var to = wBelow && wSum < 0 ? n : (wSum > 0 ? Math.floor(u + 0.02) + 1 : Math.ceil(u - 0.02) - 1);
    to = Math.min(Math.max(to, 0), n);
    wSpent = true; wSum = 0; clearTimeout(restT);
    glideTo(film.offsetTop + to * STEP * ch);
    wLock = now + 260;
  }
  window.addEventListener("wheel", onWheel, {passive: false});
  // On a touch screen the browser itself stops the page at each step and never passes one in a single swipe (CSS scroll snap,
  // set in the page for coarse pointers under html.steps-snap).
  if (playing && window.CSS && CSS.supports && CSS.supports("scroll-snap-stop", "always")) root.classList.add("steps-snap");
  window.addEventListener("keydown", stopGlide);
  window.addEventListener("mousedown", stopGlide);
  window.addEventListener("scroll", function(){ read(); kick(); solid(); plan(); }, {passive: true});
  window.addEventListener("resize", size);
  window.addEventListener("orientationchange", size);
  window.__monjo = {get cur(){ return cur; }, get target(){ return target; }, get waits(){ return waits; }, get zone(){ return zone; }, get gliding(){ return !!glide; },
    total: NS, total2: NT, mode: playing ? "steps" : "scrub", step: STEP, smooth: function(){ return got2[set]; }, exact: function(){ return !!have(PLAY[Math.round(cur)]); }, get dy(){ return fit.dy; }, get scale(){ return fit.s; }, size: function(){ size(); },
    jump: function(){ read(); cur = target; tend(); paint(); },
    loaded: function(){ return got[set]; }, need: function(){ return limit() + 1; }, open: function(){ return Object.keys(bmps[set]).length; }};
  size(); read(); cur = target; tend(); paint(); solid(); if (playing) plan();
  poster.addEventListener("load", function(){ drawn = -1; kick(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ size(); });      // the words change height when their type arrives
}
