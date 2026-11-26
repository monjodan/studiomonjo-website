/* Shared by every page. A showcase, not a shop: nothing is sold here, the pages link to the Naver shop, our dates and Instagram.
   What is left to script: the photograph galleries (small pictures under a large one) and the films that play when seen. */
function monjoShop(){
  "use strict";
  // ---------- galleries: the small pictures sit right under the large one they change
  [].forEach.call(document.querySelectorAll("[data-gal]"), function(g){
    var big = g.querySelector(".big img"), cap = g.querySelector(".big figcaption"), th = [].slice.call(g.querySelectorAll(".thumbs button"));
    th.forEach(function(t){
      t.addEventListener("click", function(){
        th.forEach(function(o){ o.setAttribute("aria-pressed", o === t ? "true" : "false"); });
        var im = t.querySelector("img");
        big.src = t.getAttribute("data-src") || im.src; big.alt = im.alt;
        if (cap) cap.textContent = t.getAttribute("data-cap") || "";
      });
    });
  });
  // ---------- films play, silent, while they are on screen
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vids = [].slice.call(document.querySelectorAll("video[data-play]"));
  if (still || !("IntersectionObserver" in window)) vids.forEach(function(v){ v.controls = true; });
  else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function(){ e.target.controls = true; }); } else e.target.pause(); });
    }, {threshold: 0.35});
    vids.forEach(function(v){ io.observe(v); });
  }
}
