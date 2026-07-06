/**
 * The bench (home) — film grain over the filmed arrival.
 * The hero video autoplays via its native attributes; this only adds the
 * animated grain. Cross-fade to the cahiers is handled by the CSS
 * @view-transition rule, so navigation needs no JS.
 */
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
