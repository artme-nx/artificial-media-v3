/* Artificial Media v3 · THE WORK (#work, 29. 10. 2026.; prije reelovi, 14. 10. 2026.)
   Mockup: brand/14-the-work-mockup-desktop.pdf (Kristian: "kako se promijeni projekt tako se mijenja video i informacija s desna.
   scroll nije dobar za mijenjanje projekta").
   - lijevo monitor kao prije: otvori se iz sredine, REC, vremenski kod (sat:min:sek:sličica, 25 sličica u sekundi), kutne oznake,
     crvena traka napretka; oblik mijenja po formatu aktivnog klipa (16:9 vodoravno, 9:16 uspravno, 21:9 široko), glatko (layout);
   - ispod ploča kao na kameri: PREV, kartica po projektu, NEXT. Klik (ili Enter / razmak) bira projekt: video (prvi klip), oblik
     monitora i kartica desno se promijene. PREV / NEXT idu u krug i preskaču ugašenu karticu;
   - desno kartica projekta (klijent, godina, format, dani izrade, alati, opis, klipovi);
   - scroll, strelice ← → i swipe NIKAD ne mijenjaju projekt ni klip. Tijek stranice (dolazak i odlazak) vodi js/main.js, Flow.
   Korak 1: klip se vrti u petlji; popis klipova i WATCH WITH SOUND su samo prikaz. Video je bez zvuka (SOUND je skriven).
   Projekti su u js/reels-data.js. */
(function () {
  "use strict";
  var DATA = window.AM_WORK || [];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s) { return document.querySelector(s); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var FPS = 25;

  var section = $("#work"), screenBox = $("#wk-screen"), monitor = $("#monitor"), screen = $("#screen"), cardsEl = $("#wk-cards");
  var tc = $("#tc"), mRatio = $("#m-ratio"), mProg = $("#m-prog"), card = $("#wk-card"), clipsEl = $("#wk-clips"), bar = $("#bar");
  if (!section || !DATA.length) return;
  var vids = [].slice.call(screen.querySelectorAll("video")), front = 0, token = 0;
  var real = DATA.filter(function (p) { return !p.disabled && p.clips && p.clips.length; });

  function ratioNum(r) { var p = String(r || "16:9").split(":"); return (+p[0] || 16) / (+p[1] || 9); }
  function fmt(s) { s = Math.max(0, Math.round(s || 0)); return pad(Math.floor(s / 60)) + ":" + pad(s % 60); }
  function timecode(t) {
    t = Math.max(0, t || 0);
    var f = Math.floor((t % 1) * FPS), s = Math.floor(t) % 60, m = Math.floor(t / 60) % 60, h = Math.floor(t / 3600);
    return pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
  }
  function isNarrow() { return window.innerWidth <= 900; }
  function barH() { return bar ? bar.offsetHeight : 56; }
  function set(id, t) { var el = document.getElementById(id); if (el) el.textContent = t || ""; }

  /* ---------- ploča: kartica po projektu ---------- */
  var keys = DATA.map(function (p, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "wk-key wk-p";
    b.innerHTML = (p.disabled ? "" : '<span class="wk-th" aria-hidden="true"></span>') +
      '<span class="wk-pt"><span class="wk-pl"><b class="wk-pn"></b><span class="wk-pname"></span></span><small></small></span>' +
      '<i class="wk-led" aria-hidden="true"></i><i class="wk-pbar" aria-hidden="true"></i>';
    b.querySelector(".wk-pn").textContent = p.number;
    b.querySelector(".wk-pname").textContent = p.title;
    b.querySelector("small").textContent = p.tag || "";
    b.setAttribute("aria-label", "Project " + p.number + ": " + p.title + (p.tag ? ", " + p.tag.toLowerCase() : ""));
    var first = p.clips && p.clips[0];
    if (first && first.poster) b.querySelector(".wk-th").style.backgroundImage = 'url("' + first.poster + '")';
    if (p.disabled) b.disabled = true;                                 // ugašena: ne klikne se i ne fokusira
    else b.addEventListener("click", function () { pick(i); });
    cardsEl.appendChild(b);
    return b;
  });
  set("wk-count", "(" + pad(real.length) + ")");
  $("#wk-prev").addEventListener("click", function () { step(-1); });
  $("#wk-next").addEventListener("click", function () { step(1); });

  /* ---------- kartica projekta desno ---------- */
  var cur = -1, clip = 0, durs = {};                                   // durs["projekt:klip"] = sekunde (iz videa)
  function durOf(pi, ci) { var c = DATA[pi].clips[ci]; return c.duration || durs[pi + ":" + ci] || 0; }
  function showCard() {
    var p = DATA[cur];
    set("wk-pi", p.number); set("wk-pc", " / " + pad(real.length));
    set("wk-pt", p.title); set("wk-ptag", p.tag);
    set("wk-client", p.client); set("wk-year", p.year); set("wk-format", p.format);
    set("wk-days", p.deliveredIn); set("wk-tools", p.madeWith); set("wk-desc", p.description);
    clipsEl.innerHTML = "";
    p.clips.forEach(function (c, ci) {
      var li = document.createElement("li");
      li.innerHTML = '<b></b><span class="ct"></span><span class="cd"></span>';
      li.querySelector("b").textContent = pad(ci + 1);
      li.querySelector(".ct").textContent = c.title;
      li.querySelector(".cd").textContent = durOf(cur, ci) ? fmt(durOf(cur, ci)) : "--:--";
      li.setAttribute("aria-current", ci === clip ? "true" : "false");
      clipsEl.appendChild(li);
    });
    if (!reduce) { card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap"); }   // nova kartica kratko izroni
  }
  function showDur(pi, ci) {
    if (pi !== cur) return;
    var li = clipsEl.children[ci]; if (li) li.querySelector(".cd").textContent = fmt(durOf(pi, ci));
  }
  // trajanja iz samih videa (učita se samo zaglavlje datoteke), kad se sekcija prvi put približi
  function loadDurations() {
    DATA.forEach(function (p, pi) {
      (p.clips || []).forEach(function (c, ci) {
        if (c.duration) return;
        var v = document.createElement("video"); v.preload = "metadata"; v.muted = true;
        v.addEventListener("loadedmetadata", function () { durs[pi + ":" + ci] = v.duration; showDur(pi, ci); v.removeAttribute("src"); v.load(); }, { once: true });
        v.src = c.file;
      });
    });
  }

  /* ---------- monitor: oblik po formatu klipa ----------
     Desktop: 16:9 je širok 88 % stupca (kao u mockupu), a 9:16 i 21:9 iste su visine; ako ne stane, manji je monitor, ne tekst.
     Mobitel: preko cijele širine, 9:16 visok koliko stane na ekran ispod naslova. */
  var ratio = "16:9", laidOut = false;
  function layout() {
    var r = ratioNum(ratio), W = screenBox.clientWidth, w, h;
    if (!laidOut) monitor.classList.add("no-anim");
    if (isNarrow()) {
      var cs = getComputedStyle(screenBox);
      W -= parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      var top = screenBox.getBoundingClientRect().top - section.getBoundingClientRect().top;
      var tap = section.querySelector(".wk-tap"), Hm = window.innerHeight - top - (tap ? tap.offsetHeight + 34 : 24);
      w = Math.min(W, Math.max(200, Hm) * r); h = w / r;
    } else {
      var H = screenBox.clientHeight;
      h = Math.min(H, W * 0.88 / (16 / 9)); w = h * r;
      if (w > W) { w = W; h = w / r; }
    }
    monitor.classList.toggle("tight", w < 460);
    monitor.style.setProperty("--mw", w.toFixed(1) + "px"); monitor.style.setProperty("--mh", h.toFixed(1) + "px");
    if (!laidOut) { laidOut = true; void monitor.offsetWidth; requestAnimationFrame(function () { monitor.classList.remove("no-anim"); }); }
  }
  function setFrame(c) {
    var p = DATA[cur], name = String(p.format || "");
    ratio = c.format || "16:9";
    monitor.dataset.fmt = ratio;
    if (name.indexOf(ratio) === 0) name = name.slice(ratio.length).trim();   // "16:9 Commercial" → 16:9 + COMMERCIAL
    mRatio.innerHTML = "";
    mRatio.appendChild(document.createTextNode(ratio));
    if (name) { var n = document.createElement("span"); n.className = "fmt-name"; n.textContent = "  " + name.toUpperCase(); mRatio.appendChild(n); }
    layout();
  }

  /* ---------- izbor projekta ---------- */
  function pick(i) {
    var p = DATA[i];
    if (!p || p.disabled || !p.clips.length || i === cur) return;
    cur = i; clip = 0;
    keys.forEach(function (b, k) { b.setAttribute("aria-current", k === i ? "true" : "false"); b.querySelector(".wk-pbar").style.transform = "scaleX(0)"; });
    var b = keys[i], lr = cardsEl.getBoundingClientRect(), br = b.getBoundingClientRect();   // mobitel: aktivna kartica vidljiva na ploči
    if (br.left < lr.left || br.right > lr.right) cardsEl.scrollTo({ left: cardsEl.scrollLeft + br.left - lr.left - 4, behavior: reduce ? "auto" : "smooth" });
    showCard();
    setFrame(p.clips[0]);
    load(p.clips[0]);
  }
  function step(s) {                                                   // PREV / NEXT: u krug, preko ugašenih
    var n = DATA.length, k = cur;
    for (var t = 0; t < n; t++) { k = (k + s + n) % n; if (!DATA[k].disabled && DATA[k].clips.length) { pick(k); return; } }
  }

  /* ---------- video: dva sloja, novi klip uđe preko starog ---------- */
  var inView = false, wantPlay = !reduce;
  function load(c) {
    var my = ++token, nv = vids[1 - front], ov = vids[front];
    nv.poster = c.poster || ""; nv.src = c.file; nv.muted = true; nv.loop = true;   // korak 1: klip se vrti u petlji
    var swapped = false;
    function swap() {
      if (swapped || my !== token) return; swapped = true;
      nv.classList.add("on"); ov.classList.remove("on"); front = vids.indexOf(nv);
      if (wantPlay && inView) play();
      setTimeout(function () { if (vids[front] !== ov) { ov.pause(); ov.removeAttribute("src"); ov.removeAttribute("poster"); ov.load(); } }, 650);
    }
    nv.addEventListener("loadeddata", swap, { once: true });
    setTimeout(swap, 700);                                             // ako se video ne učita, pokaže se barem poster
    nv.load();
  }
  function play() { var v = vids[front]; if (!v.src) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  function pause() { vids.forEach(function (v) { v.pause(); }); }
  vids.forEach(function (v) {
    v.addEventListener("play", function () { if (v === vids[front]) monitor.classList.add("playing"); });
    v.addEventListener("pause", function () { if (v === vids[front]) monitor.classList.remove("playing"); });
  });

  // vremenski kod i napredak (monitor i aktivna kartica), samo dok je monitor na ekranu
  var raf = 0;
  function tick() {
    raf = 0;
    var v = vids[front], dur = v.duration || durOf(cur, clip) || 0, t = v.currentTime || 0;
    tc.textContent = timecode(t);
    var p = dur ? clamp(t / dur, 0, 1) : 0;
    mProg.style.transform = "scaleX(" + p.toFixed(4) + ")";
    if (keys[cur]) keys[cur].querySelector(".wk-pbar").style.transform = "scaleX(" + p.toFixed(4) + ")";
    if (inView) raf = requestAnimationFrame(tick);
  }
  function startTick() { if (!raf) raf = requestAnimationFrame(tick); }

  // ulazak: naslov izroni, ploča i kartica uđu; monitor se otvori iz sredine tek kad je na ekranu
  var entered = false;
  function onEnter() { if (entered) return; entered = true; loadDurations(); section.classList.add("in"); }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) onEnter(); }); }, { rootMargin: "0px 0px -30% 0px" }).observe(section);
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        inView = e.intersectionRatio > 0.3;
        if (e.intersectionRatio > 0.15) monitor.classList.add("open");
        if (inView) { if (wantPlay) play(); startTick(); } else pause();
      });
    }, { threshold: [0, 0.15, 0.3, 0.6, 1] }).observe(monitor);
  } else { onEnter(); inView = true; monitor.classList.add("open"); }

  // crna pozadina iza stranice (scrollbar, rub kod povlačenja) dok je sekcija na sredini ekrana
  function onScroll() {
    var r = section.getBoundingClientRect(), vh = window.innerHeight;
    document.documentElement.classList.toggle("dark", r.top < vh * 0.5 && r.bottom > vh * 0.5);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { onScroll(); layout(); });

  // SCROLL dolje: isto što i pokret prema dolje (Flow ide dalje na #next)
  var go = $("#wk-go");
  if (go) go.addEventListener("click", function () { if (window.AM_FLOW) window.AM_FLOW.release(); });

  /* ---------- start ---------- */
  pick(DATA.indexOf(real[0]));
  onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);   // naslov se izmjeri tek s pravim pismom
  if (reduce) { section.classList.add("in"); monitor.classList.add("open"); loadDurations(); }
  window.AM_WORK_UI = { state: function () { return { project: cur, id: DATA[cur].id, clip: clip, fmt: ratio, src: vids[front].getAttribute("src") }; } };   // za provjeru u testovima
})();
