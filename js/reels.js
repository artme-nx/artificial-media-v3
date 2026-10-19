/* Artificial Media v3 · reelovi (14. 10. 2026.)
   Nakon papira i pisaćeg stroja dolazi rez na crno i moderan "monitor":
   - formati su tipke kao na filmskoj kameri: 21:9 CINEMA, 16:9 COMMERCIAL, 9:16 SOCIAL MEDIA (Kristian, 14. 10. 2026.);
     tipka bira koji se reelovi vide;
   - pozornica je cijeli ekran ispod trake, a monitor mijenja veličinu po formatu (Kristian, 14. 10. 2026.):
     21:9 od ruba do ruba, 16:9 skoro preko cijelog ekrana, 9:16 od vrha do dna (layoutStage);
   - gore lijevo REC i vremenski kod (sat:min:sek:sličica, 25 sličica u sekundi), gore desno format, dolje crvena traka napretka;
   - dolje je ploča kao na kameri: lijevo tipke formata, desno klipovi (sličica, broj, naziv, client/spec, trajanje).
     Klik bira reel, a kad reel završi, kreće sljedeći;
   - klik na monitor otvara reel preko cijelog ekrana, sa zvukom;
   - zvuk u monitoru prati gumb SOUND, isto kao video u heroju;
   - reelovi stoje: kad se do njih dođe, ni jaki scroll ih ne preskoči; tek treći pokret ide dalje (Hold, dolje).
   Radovi su u js/reels-data.js. */
(function () {
  "use strict";
  var DATA = window.AM_REELS || [];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s) { return document.querySelector(s); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var FMT = { "21:9": "Cinema", "16:9": "Commercial", "9:16": "Social media" };
  var KIND = { client: "Client", spec: "Spec" };
  var FPS = 25;

  var section = $("#reels"), stage = $("#stage"), deck = $("#deck"), formatsEl = $("#formats"), clipsEl = $("#clips"), bar = $("#bar");
  var monitor = $("#monitor"), screen = $("#screen"), listEl = $("#reel-list");
  var tc = $("#tc"), mRatio = $("#m-ratio"), mCount = $("#m-count"), mProg = $("#m-prog"), watch = $("#watch");
  var ciN = $("#ci-n"), ciT = $("#ci-t"), ciM = $("#ci-m");
  if (!section || !DATA.length) return;
  var vids = [].slice.call(screen.querySelectorAll("video")), front = 0, token = 0;

  function ratioNum(r) { var p = String(r || "16:9").split(":"); return (+p[0] || 16) / (+p[1] || 9); }
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + pad(s % 60); }
  function timecode(t) {
    t = Math.max(0, t || 0);
    var f = Math.floor((t % 1) * FPS), s = Math.floor(t) % 60, m = Math.floor(t / 60) % 60, h = Math.floor(t / 3600);
    return pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
  }
  function tagOf(d) { return d.kind && KIND[d.kind] ? KIND[d.kind] : (d.placeholder ? "Placeholder" : ""); }
  function isNarrow() { return window.innerWidth <= 900; }

  /* ---------- klipovi: traka sličica ----------
     Svaki klip je sličica u omjeru svog formata, s brojem. Lijevo od trake piše koji je klip aktivan (npr. 02/05),
     njegov naziv, oznaka i trajanje, pa se odmah vidi koliko klipova ima i koji se vrti. */
  var rows = [], durs = [];
  DATA.forEach(function (d, i) {
    var li = document.createElement("li");
    li.innerHTML =
      '<button type="button" class="reel" data-i="' + i + '">' +
        '<span class="r-th" aria-hidden="true"></span><span class="r-no" aria-hidden="true"></span>' +
        '<i class="r-prog" aria-hidden="true"></i>' +
      '</button>';
    var th = li.querySelector(".r-th");
    if (d.poster) th.style.backgroundImage = 'url("' + d.poster + '")';
    li.style.setProperty("--tr", ratioNum(d.ratio).toFixed(4));
    listEl.appendChild(li);
    var btn = li.firstChild;
    btn.title = d.title;
    btn.addEventListener("click", function () {
      if (cur === i) { openPlayer(i); return; }        // drugi klik na aktivni klip otvara ga preko cijelog ekrana
      select(i, true);
      if (isNarrow()) {                                // na mobitelu je monitor iznad klipova: neka bude na ekranu
        var r = monitor.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) window.scrollTo({ top: window.scrollY + r.top - 70, behavior: reduce ? "auto" : "smooth" });
      }
    });
    rows.push({ li: li, btn: btn, no: li.querySelector(".r-no"), prog: li.querySelector(".r-prog") });
  });
  function showInfo() {                                // koji je klip aktivan: broj od ukupno, naziv, oznaka, trajanje
    var d = DATA[cur]; if (!d) return;
    var k = visibleIdx.indexOf(cur) + 1, n = visibleIdx.length;
    ciN.innerHTML = pad(k) + "<i>/" + pad(n) + "</i>";
    ciT.textContent = d.title;
    ciM.textContent = [tagOf(d), durs[cur] ? fmt(durs[cur]) : ""].filter(Boolean).join("  ·  ");
    mCount.textContent = pad(k) + "/" + pad(n);
    rows.forEach(function (r, j) { r.btn.setAttribute("aria-label", "Clip " + pad(visibleIdx.indexOf(j) + 1) + ": " + DATA[j].title); });
  }

  // trajanja iz samih videa (učita se samo zaglavlje datoteke)
  function loadDurations() {
    DATA.forEach(function (d, i) {
      if (d.dur) { durs[i] = d.dur; return; }
      var v = document.createElement("video"); v.preload = "metadata"; v.muted = true;
      v.addEventListener("loadedmetadata", function () { durs[i] = v.duration; if (i === cur) showInfo(); v.removeAttribute("src"); v.load(); }, { once: true });
      v.src = d.src;
    });
  }

  /* ---------- formati: tipke kamere ---------- */
  var filter = null, visibleIdx = [], userPicked = false;
  var keys = [].slice.call(document.querySelectorAll("#formats .fk"));
  keys.forEach(function (k) {
    var f = k.dataset.f, n = DATA.filter(function (d) { return d.ratio === f; }).length;
    k.querySelector(".fk-n").textContent = pad(n);                  // koliko klipova ima u formatu
    k.setAttribute("aria-label", k.getAttribute("aria-label") + ", " + n + " clips");
    if (!n) { k.disabled = true; k.setAttribute("aria-disabled", "true"); }
    k.addEventListener("click", function () { userPicked = true; setFilter(f, true); });
  });
  $("#reels-count").textContent = "(" + pad(DATA.length) + ")";
  function setFilter(f, animate) {
    if (f === filter) return;
    filter = f;
    keys.forEach(function (k) { k.setAttribute("aria-pressed", k.dataset.f === f ? "true" : "false"); });
    visibleIdx = [];
    rows.forEach(function (r, i) {
      var show = DATA[i].ratio === f;
      r.li.hidden = !show;
      if (show) {
        visibleIdx.push(i); r.no.textContent = pad(visibleIdx.length); r.li.style.setProperty("--k", visibleIdx.length - 1);
        if (animate) { r.li.classList.remove("enter"); void r.li.offsetWidth; r.li.classList.add("enter"); }
      }
    });
    monitor.classList.toggle("single", visibleIdx.length < 2);           // jedan klip: bez strelica
    setFrame(f);
    if (visibleIdx.indexOf(cur) < 0) select(visibleIdx[0], animate); else showInfo();
  }
  // Veličina monitora po formatu (Kristian, 14. 10. 2026.): 21:9 od ruba do ruba, 16:9 skoro preko cijelog ekrana,
  // 9:16 od vrha do dna. Na desktopu je pozornica cijeli ekran ispod trake, a ploča s tipkama je dolje; kod 21:9 i 16:9
  // monitor je iznad ploče, a kod 9:16 tipke i klipovi stoje lijevo i desno od kadra. Na mobitelu: tipke, monitor, klipovi.
  var laidOut = false;
  stage.addEventListener("scroll", function () { if (stage.scrollTop || stage.scrollLeft) { stage.scrollTop = 0; stage.scrollLeft = 0; } });   // stariji preglednici bez overflow: clip
  function barH() { return bar ? bar.offsetHeight : 56; }
  function layoutStage() {
    if (!filter) return;
    var r = ratioNum(filter), W = stage.clientWidth, w, h, x = 0, y = 0;
    if (!laidOut) monitor.classList.add("no-anim");
    if (isNarrow()) {
      var Hm = window.innerHeight - barH() - formatsEl.offsetHeight - 40;
      if (r > 2) w = W; else if (r >= 1) w = W - 32; else w = Math.min(W - 32, Math.max(320, Hm) * r);
      h = w / r;
      deck.classList.remove("compact", "tiny"); deck.style.removeProperty("--clips-max");
    } else {
      var H = stage.clientHeight, pad = clamp(W * 0.036, 20, 56);
      deck.classList.remove("compact", "tiny");
      var R = deck.offsetHeight + 32;                                   // mjesto za ploču ispod širokog kadra
      if (r < 1) { h = H; w = h * r; y = 0; }                            // 9:16: od vrha do dna
      else {
        var maxW = r > 2 ? W : W - 2 * pad;                               // 21:9: od ruba do ruba; 16:9: skoro
        w = Math.min(maxW, (H - R - (r > 2 ? 0 : 20)) * r); h = w / r;
        y = Math.max(0, (H - R - h) / 2);
      }
      x = (W - w) / 2;
      var side = r < 1 ? (W - w) / 2 - pad - 16 : W - 2 * pad - 24;
      if (r < 1 && formatsEl.offsetWidth > side) deck.classList.add("compact");   // uže tipke kad stoje uz uski kadar
      if (r < 1 && formatsEl.offsetWidth > side) deck.classList.add("tiny");
      var clipsMax = r < 1 ? side : side - formatsEl.offsetWidth;
      deck.style.setProperty("--clips-max", Math.max(160, clipsMax) + "px");
    }
    monitor.classList.toggle("tight", w < 460);
    stage.style.setProperty("--mx", x.toFixed(1) + "px"); stage.style.setProperty("--my", y.toFixed(1) + "px");
    stage.style.setProperty("--mw", w.toFixed(1) + "px"); stage.style.setProperty("--mh", h.toFixed(1) + "px");
    if (!laidOut) { laidOut = true; void monitor.offsetWidth; requestAnimationFrame(function () { monitor.classList.remove("no-anim"); }); }
  }
  function setFrame(f) {
    monitor.dataset.fmt = f;
    mRatio.innerHTML = f + '<span class="fmt-name">&nbsp; ' + (FMT[f] || "").toUpperCase() + "</span>";
    layoutStage();
  }

  /* ---------- monitor ---------- */
  var cur = -1, inView = false, wantPlay = !reduce, level = 0, playerOpen = false;
  function soundOn() { return !!window.AM_SOUND_ON; }
  function applySound() {
    var v = vids[front];
    var audible = soundOn() && inView && !playerOpen && level > 0.02;
    vids.forEach(function (x) { x.muted = x !== v || !audible; });
    v.volume = clamp(level, 0, 1);
  }
  function select(i, autoplay) {
    if (i == null || i < 0) return;
    cur = i;
    var d = DATA[i], my = ++token;
    rows.forEach(function (r, k) { r.btn.setAttribute("aria-current", k === i ? "true" : "false"); r.prog.style.transform = "scaleX(0)"; });
    showInfo();
    var row = rows[i].li, lr = listEl.getBoundingClientRect(), rr = row.getBoundingClientRect();   // aktivna sličica uvijek vidljiva u traci
    if (rr.left < lr.left || rr.right > lr.right) listEl.scrollTo({ left: listEl.scrollLeft + rr.left - lr.left - 8, behavior: "smooth" });
    // puna adresa: var(--poster) se koristi u css/style.css, pa bi se relativna putanja čitala od mape css/
    stage.style.setProperty("--poster", d.poster ? 'url("' + new URL(d.poster, document.baseURI).href + '")' : "none");
    watch.setAttribute("aria-label", "Watch " + d.title + " full screen");
    var nv = vids[1 - front], ov = vids[front];
    nv.poster = d.poster || ""; nv.src = d.src; nv.muted = true;
    var swapped = false;
    function swap() {
      if (swapped || my !== token) return; swapped = true;
      nv.classList.add("on"); ov.classList.remove("on"); front = vids.indexOf(nv);
      applySound();
      if (autoplay !== false && wantPlay && inView && !playerOpen) play();
      setTimeout(function () { if (vids[front] !== ov) { ov.pause(); ov.removeAttribute("src"); ov.removeAttribute("poster"); ov.load(); } }, 650);
    }
    nv.addEventListener("loadeddata", swap, { once: true });
    setTimeout(swap, 700);                               // ako se video ne učita, pokaže se barem poster
    nv.load();
  }
  function play() { var v = vids[front]; if (!v.src) return; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  function pause() { vids.forEach(function (v) { v.pause(); }); }
  function stepFrom(i, s) { var k = visibleIdx.indexOf(i), n = visibleIdx.length; return visibleIdx[((k < 0 ? 0 : k) + s + n) % n]; }
  vids.forEach(function (v) {
    v.addEventListener("ended", function () {
      if (v !== vids[front]) return;
      var last = visibleIdx.indexOf(cur) === visibleIdx.length - 1;
      if (last && !userPicked) {                       // showreel: dok posjetitelj sam ne izabere, prolazi kroz sve formate
        var on = keys.filter(function (k) { return !k.disabled; }), ki = on.map(function (k) { return k.dataset.f; }).indexOf(filter);
        var nf = on[(ki + 1) % on.length].dataset.f;
        if (nf !== filter) { setFilter(nf, true); return; }
      }
      if (visibleIdx.length < 2) { v.currentTime = 0; play(); return; }
      select(stepFrom(cur, 1), true);
    });
    v.addEventListener("play", function () { if (v === vids[front]) monitor.classList.add("playing"); });
    v.addEventListener("pause", function () { if (v === vids[front]) monitor.classList.remove("playing"); });
  });
  watch.addEventListener("click", function () { openPlayer(cur); });
  function go(s) { if (visibleIdx.length > 1) select(stepFrom(cur, s), true); }
  $("#m-prev").addEventListener("click", function (e) { e.stopPropagation(); go(-1); });
  $("#m-next").addEventListener("click", function (e) { e.stopPropagation(); go(1); });
  document.addEventListener("keydown", function (e) {                 // ← → mijenjaju klip dok je monitor na ekranu
    if (playerOpen || !inView || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target; if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); } else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  });
  var sx = null, sy = null;                                           // na mobitelu: povlačenje prstom lijevo-desno po monitoru
  monitor.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  monitor.addEventListener("touchend", function (e) {
    if (sx === null) return; var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
  }, { passive: true });
  // jednom, kad se monitor prvi put otvori: lampice na tipkama i sličice zasvijetle redom, da se vidi da se može birati
  var hinted = false;
  function hint() {
    if (hinted || reduce) return; hinted = true;
    setTimeout(function () { deck.classList.add("hinting"); setTimeout(function () { deck.classList.remove("hinting"); }, 2600); }, 1300);
  }

  // vremenski kod i napredak (samo dok je monitor na ekranu)
  var raf = 0;
  function tick() {
    raf = 0;
    var v = vids[front], dur = v.duration || durs[cur] || 0, t = v.currentTime || 0;
    tc.textContent = timecode(t);
    var p = dur ? clamp(t / dur, 0, 1) : 0;
    mProg.style.transform = "scaleX(" + p.toFixed(4) + ")";
    if (rows[cur]) rows[cur].prog.style.transform = "scaleX(" + p.toFixed(4) + ")";
    if (inView && !playerOpen) raf = requestAnimationFrame(tick);
  }
  function startTick() { if (!raf) raf = requestAnimationFrame(tick); }

  // ulazak u sekciju: naslov izroni, tipke i popis uđu redom; monitor se otvori tek kad je na ekranu
  var entered = false;
  function onEnter() {
    if (entered) return; entered = true;
    loadDurations();
    section.classList.add("in");
  }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) onEnter(); }); }, { rootMargin: "0px 0px -30% 0px" }).observe(section);
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        inView = e.intersectionRatio > 0.3;
        if (e.intersectionRatio > 0.15) { monitor.classList.add("open"); hint(); }
        if (inView && !playerOpen) { if (wantPlay) play(); startTick(); } else pause();
        applySound();
      });
    }, { threshold: [0, 0.15, 0.3, 0.6, 1] }).observe(monitor);
  } else { onEnter(); inView = true; monitor.classList.add("open"); }

  // glasnoća: puna kad je monitor cijeli na ekranu, tiša dok odlazi
  function onScroll() {
    var r = monitor.getBoundingClientRect(), vh = window.innerHeight;
    var seen = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    level = clamp(seen / Math.max(1, Math.min(r.height, vh)) * 1.15, 0, 1);
    document.documentElement.classList.toggle("dark", section.getBoundingClientRect().top < vh * 0.5);
    if (soundOn()) applySound();
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { onScroll(); layoutStage(); });
  document.addEventListener("am:sound", function () { onScroll(); applySound(); if (soundOn() && inView && !playerOpen && wantPlay) play(); });

  /* ---------- reelovi stoje: ni jaki scroll ih ne preskoči (Kristian, 14. 10. 2026.) ----------
     Kad se scrolla prema dolje, stranica stane tako da pozornica s monitorom točno ispuni ekran ispod trake, i tu ostane. Prva dva pokreta (kotačić, trackpad,
     prst ili tipka) samo se upiju: sekcija se malo trzne, da se vidi da je pokret primljen. Tek treći pokret ide dalje.
     Jedan pokret je jedan zamah: inercija trackpada i niz zubaca kotačića bez stanke broje se kao jedan.
     Prema gore se može uvijek. Uz "smanjeni pokret" ništa se ne zaustavlja. */
  var Hold = (function () {
    var root = document.documentElement, NEED = 3, GAP = 320;
    var state = "armed", count = 0, lastWheel = 0, lastY = window.scrollY, tween = 0, tweening = false, lastCount = 0, MINGAP = 700;   // dolazni zamah i prebrzi niz ne broje se
    function anchor() { return stage.getBoundingClientRect().top + window.scrollY - barH(); }   // pozornica točno ispod trake
    function blocked() { return reduce || playerOpen || root.classList.contains("locked"); }
    function crosses(dy) { var y = window.scrollY, a = anchor(); return dy > 0 && y < a + 1 && y + dy >= a - 1; }
    function enter() {
      state = "hold"; count = 0; lastCount = performance.now(); root.classList.add("hold");
      var from = window.scrollY, to = anchor(), t0 = performance.now(), D = Math.min(380, 140 + Math.abs(to - from) * 0.5);
      cancelAnimationFrame(tween); tweening = true;
      (function f(now) {
        var k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
        window.scrollTo(0, from + (to - from) * e);
        if (k < 1) tween = requestAnimationFrame(f); else tweening = false;
      })(t0);
    }
    function nudge() { stage.classList.remove("nudge"); void stage.offsetWidth; stage.classList.add("nudge"); }
    function stop() { cancelAnimationFrame(tween); tweening = false; root.classList.remove("hold"); }
    function release() { state = "released"; stop(); }
    function up() { state = "armed"; stop(); }
    function gesture() {                                              // true = ovaj pokret ide dalje
      var now = performance.now(); if (now - lastCount < MINGAP) return false;   // prebrzi niz zamaha broji se kao jedan
      lastCount = now; count++;
      if (count >= NEED) { release(); return true; }
      nudge(); return false;
    }

    window.addEventListener("wheel", function (e) {
      if (blocked()) return;
      var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      var now = performance.now(), fresh = now - lastWheel > GAP; lastWheel = now;
      if (state === "armed") { if (crosses(dy)) { e.preventDefault(); enter(); } return; }
      if (state !== "hold") return;
      if (dy < -1) { e.preventDefault(); up(); window.scrollBy({ top: Math.min(dy, -60), behavior: "smooth" }); return; }   // prema gore: pusti
      e.preventDefault();
      if (fresh && dy > 0 && gesture()) window.scrollBy({ top: Math.max(dy, 60), behavior: "smooth" });
    }, { passive: false });

    var tY = null, tX = null, t0Y = null, t0X = null, startedInHold = false;
    window.addEventListener("touchstart", function (e) {
      tY = t0Y = e.touches[0].clientY; tX = t0X = e.touches[0].clientX; startedInHold = state === "hold";
    }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (blocked() || tY === null) return;
      var y = e.touches[0].clientY, x = e.touches[0].clientX, dy = tY - y; tY = y; tX = x;
      if (Math.abs(x - t0X) > Math.abs(y - t0Y)) return;              // vodoravno (npr. tipke formata na mobitelu): pusti
      if (state === "armed") { if (crosses(dy)) { e.preventDefault(); enter(); } return; }
      if (state !== "hold") return;
      if (y - t0Y > 12) { up(); return; }                             // prst prema dolje = scroll prema gore
      e.preventDefault();
    }, { passive: false });
    window.addEventListener("touchend", function () {
      if (!blocked() && state === "hold" && startedInHold && t0Y !== null && t0Y - tY > 30 && Math.abs(tX - t0X) < Math.abs(t0Y - tY)) {
        if (gesture()) window.scrollBy({ top: Math.min(window.innerHeight * 0.7, (t0Y - tY) * 2.2), behavior: "smooth" });
      }
      tY = t0Y = null;
    }, { passive: true });

    var DOWN = { ArrowDown: 1, PageDown: 1, " ": 1, Spacebar: 1, End: 1 }, UP = { ArrowUp: 1, PageUp: 1, Home: 1 };
    window.addEventListener("keydown", function (e) {
      if (blocked() || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target, onControl = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName));
      if ((e.key === " " || e.key === "Spacebar") && onControl) return;      // razmak na gumbu ga klikne
      var down = DOWN[e.key] && !(e.shiftKey && e.key === " ");
      if (down) {
        var dy = e.key === "ArrowDown" ? 40 : e.key === "End" ? 1e7 : window.innerHeight * 0.85;
        if (state === "armed") { if (crosses(dy)) { e.preventDefault(); enter(); } return; }
        if (state === "hold") { e.preventDefault(); if (!e.repeat && gesture()) window.scrollBy({ top: Math.min(dy, window.innerHeight * 0.85), behavior: "smooth" }); }
      } else if ((UP[e.key] || (e.shiftKey && e.key === " ")) && state === "hold") {
        e.preventDefault(); up();
        if (e.key === "Home") window.scrollTo({ top: 0, behavior: "smooth" });
        else window.scrollBy({ top: e.key === "ArrowUp" ? -40 : -window.innerHeight * 0.85, behavior: "smooth" });
      }
    });

    window.addEventListener("scroll", function () {
      var y = window.scrollY, a = anchor();
      if (!blocked()) {
        if (state === "armed" && lastY < a - 1 && y > a + 1) enter();                     // prošao bez kotačića (traka, inercija na iOS-u)
        else if (state === "hold" && !tweening && Math.abs(y - a) > 1) window.scrollTo(0, a); // ostaje na mjestu
        else if (state === "released" && y < a - window.innerHeight * 0.5) state = "armed";  // vratio se gore: opet stane
      }
      lastY = y;
    }, { passive: true });
    return { state: function () { return state + ":" + count; } };
  })();
  window.AM_HOLD = Hold;                                                // za provjeru u testovima

  /* ---------- preko cijelog ekrana ---------- */
  var player = $("#player"), pv = $("#pl-video"), plNo = $("#pl-no"), plTitle = $("#pl-title"), plTime = $("#pl-time");
  var plFill = $("#pl-fill"), plSeek = $("#pl-seek"), plPlay = $("#pl-play"), plMute = $("#pl-mute"), plClose = $("#pl-close");
  var plCur = -1, lastFocus = null, plRaf = 0;
  function plLoad(i) {
    plCur = i; var d = DATA[i];
    var k = visibleIdx.indexOf(i);
    plNo.textContent = pad((k < 0 ? 0 : k) + 1) + " / " + pad(visibleIdx.length);
    plTitle.textContent = [d.title, (FMT[d.ratio] || "") + " " + d.ratio, tagOf(d)].filter(Boolean).join("  ·  ");
    pv.poster = d.poster || ""; pv.src = d.src; pv.currentTime = 0;
    var p = pv.play(); if (p && p.catch) p.catch(function () {});
  }
  function plTick() {
    plRaf = 0;
    var dur = pv.duration || durs[plCur] || 0, t = pv.currentTime || 0, p = dur ? clamp(t / dur, 0, 1) : 0;
    plFill.style.transform = "scaleX(" + p.toFixed(4) + ")";
    plSeek.setAttribute("aria-valuenow", Math.round(p * 100));
    plTime.textContent = fmt(t) + " / " + fmt(dur);
    if (playerOpen) plRaf = requestAnimationFrame(plTick);
  }
  function openPlayer(i) {
    if (playerOpen || i < 0) return;
    playerOpen = true; lastFocus = document.activeElement;
    pause(); applySound();
    player.hidden = false; document.documentElement.classList.add("player-open");
    requestAnimationFrame(function () { player.classList.add("open"); });
    setMute(false);
    plLoad(i); plTick();
    plClose.focus({ preventScroll: true });
  }
  function closePlayer() {
    if (!playerOpen) return;
    playerOpen = false;
    pv.pause();
    player.classList.remove("open"); document.documentElement.classList.remove("player-open");
    setTimeout(function () { if (!playerOpen) { player.hidden = true; pv.removeAttribute("src"); pv.load(); } }, 350);
    if (plCur !== cur) select(plCur, true); else if (inView && wantPlay) play();
    applySound(); startTick();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  function setMute(m) { pv.muted = m; plMute.setAttribute("aria-pressed", m ? "true" : "false"); plMute.querySelector("span").textContent = m ? "OFF" : "ON"; }
  function togglePlay() { if (pv.paused) { var p = pv.play(); if (p && p.catch) p.catch(function () {}); } else pv.pause(); }
  pv.addEventListener("play", function () { player.classList.remove("paused"); plPlay.setAttribute("aria-label", "Pause"); });
  pv.addEventListener("pause", function () { player.classList.add("paused"); plPlay.setAttribute("aria-label", "Play"); });
  pv.addEventListener("ended", function () {                    // kao showreel: nakon kraja ide sljedeći istog formata
    if (visibleIdx.length > 1) plLoad(stepFrom(plCur, 1)); else { pv.currentTime = 0; togglePlay(); }
  });
  pv.addEventListener("click", togglePlay);
  plPlay.addEventListener("click", togglePlay);
  $("#pl-prev").addEventListener("click", function () { plLoad(stepFrom(plCur, -1)); });
  $("#pl-next").addEventListener("click", function () { plLoad(stepFrom(plCur, 1)); });
  plMute.addEventListener("click", function () { setMute(!pv.muted); });
  plClose.addEventListener("click", closePlayer);
  function seekTo(x) {
    var r = plSeek.getBoundingClientRect(), dur = pv.duration || durs[plCur] || 0;
    if (dur) pv.currentTime = clamp((x - r.left) / r.width, 0, 1) * dur;
  }
  var dragging = false;
  plSeek.addEventListener("pointerdown", function (e) { dragging = true; plSeek.setPointerCapture(e.pointerId); seekTo(e.clientX); });
  plSeek.addEventListener("pointermove", function (e) { if (dragging) seekTo(e.clientX); });
  plSeek.addEventListener("pointerup", function () { dragging = false; });
  document.addEventListener("keydown", function (e) {
    if (!playerOpen) return;
    if (e.key === "Escape") { e.preventDefault(); closePlayer(); }
    else if (e.key === " " && (e.target === document.body || e.target === plSeek || e.target === pv)) { e.preventDefault(); togglePlay(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); pv.currentTime = Math.min((pv.duration || 0), pv.currentTime + 5); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); pv.currentTime = Math.max(0, pv.currentTime - 5); }
    else if (e.key === "Tab") {                                  // fokus ostaje u playeru
      var f = [].slice.call(player.querySelectorAll("button, [tabindex='0']")), a = f.indexOf(document.activeElement);
      if (e.shiftKey && a <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && a === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  player.addEventListener("click", function (e) { if (e.target === player || e.target.id === "pl-stage") closePlayer(); });

  /* ---------- start ---------- */
  var first = keys.filter(function (k) { return !k.disabled; })[0];
  setFilter(first ? first.dataset.f : DATA[0].ratio, false);
  onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutStage);   // ploča se izmjeri tek s pravim pismom
  if (reduce) { section.classList.add("in", "still"); monitor.classList.add("open"); loadDurations(); }
})();
