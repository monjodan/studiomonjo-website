/**
 * The bench (home) — the filmed arrival.
 *   - keep the hero video playing (some mobile browsers, e.g. iOS Safari,
 *     block the native autoplay and show a play button; force muted playback)
 *   - add the animated film grain
 * Cross-fade to the cahiers is handled by the CSS @view-transition rule.
 */

/* Force the background video to loop silently, even where autoplay is blocked. */
(function () {
  var v = document.querySelector('.bench__video');
  if (!v) return;
  v.muted = true;            // the muted *property* must be true at play time (iOS)
  v.playsInline = true;
  var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
  play();
  v.addEventListener('loadeddata', play);
  v.addEventListener('canplay', play);
  // last resort: kick it off on the first user gesture, then stop listening
  var onGesture = function () {
    play();
    document.removeEventListener('touchstart', onGesture);
    document.removeEventListener('pointerdown', onGesture);
  };
  document.addEventListener('touchstart', onGesture, { passive: true });
  document.addEventListener('pointerdown', onGesture);
})();

(function () {
  var grain = document.getElementById('grain');
  if (!grain) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function noiseTile(alpha) {
    var c = document.createElement('canvas');
    c.width = 160; c.height = 160;
    var ctx = c.getContext('2d');
    var im = ctx.createImageData(160, 160);
    for (var i = 0; i < im.data.length; i += 4) {
      var v = Math.floor(Math.random() * 255);
      im.data[i] = v; im.data[i + 1] = v; im.data[i + 2] = v;
      im.data[i + 3] = Math.random() * alpha;
    }
    ctx.putImageData(im, 0, 0);
    return c.toDataURL();
  }

  grain.style.backgroundImage = 'url(' + noiseTile(92) + ')';
  grain.style.backgroundRepeat = 'repeat';
  if (reduce) grain.style.animation = 'none';
})();
