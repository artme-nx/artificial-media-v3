/* Artificial Media v3 · prototip (13. 10. 2026.)
   1) Hero: video se vidi kroz slova ARTIFICIAL / MEDIA; na scroll slova rastu (zum u puno slovo D) dok video ne ispuni ekran.
   2) Petlja: ME, ART, AI (drugo A iz ARTIFICIAL i I iz MEDIA), pa cijelo ARTIFICIAL MEDIA; ispod se tipka kao filmski scenarij.
      Tekst se tipka sam čim sekcija dođe na ekran, ljudskim tempom (nepravilan ritam, predasi na interpunkciji). Sav tekst ostaje vidljiv.
   3) Crna traka s ARTIFICIAL MEDIA (ART i ME crveno) pojavi se kad se napusti blok WHERE ART MEETS INTELLIGENCE. (renderBar).
   4) Zvuk: gumb SOUND. Preglednici ne puštaju zvuk dok posjetitelj jednom ne klikne, pa zvuk kreće tek na taj klik.
      Uključen zvuk = zvuk videa u heroju + zvuk starog pisaćeg stroja za svako otkucano slovo, povrat valjka između blokova
      i zvonce na kraju (js/typewriter-sounds.js).
   5) Tijek se ne može preskočiti: do naslova se mora scrollati (brzina ograničena), a tipkanje s markerom odigra se do kraja.
   6) Reelovi (js/reels.js, js/reels-data.js) su isključeni 26. 10. 2026. (README → Isključeno); SOUND im javlja događaj "am:sound".
      Gumb SOUND je skriven (index.html, hidden): nijedan video zasad nema zvuk.
   7) Drugi slide (19. 10. 2026.): tri karte s videom nakon zuma (renderCards); slide sa scenarijem je isključen (SCREENPLAY).
   Boje: pozadina je papir za scenarij (boja + zrno iz img/paper.png), crvena je REC crvena. */
(function () {
  "use strict";
  var L = window.AM_LOGO;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s) { return document.querySelector(s); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { return t * t * (3 - 2 * t); };

  /* ---------- hero: slova kao rupe u sivom pokrovu ---------- */
  var svg = $("#cover"), letters = $("#letters"), maskRect = $("#mask-rect"), coverRect = $("#cover-rect");
  var hero = $(".hero"), hint = $("#hint"), bar = $("#bar");
  var next = $("#next");                                               // privremeni blok ispod THE WORK: kamo vodi otpuštanje tijeka
  var work = $("#work");                                               // THE WORK (29. 10. 2026.): zadnje zaustavljanje tijeka, iza #why
  // Drugi slide (Kristian, 19. 10. 2026.): tri karte s videom u pozornici heroja umjesto slidea sa scenarijem.
  // Povratak na scenarij: SCREENPLAY = true, makni klasu has-cards s heroja i "hidden" sa sekcije #loop (index.html).
  var SCREENPLAY = false, CARDS = hero.classList.contains("has-cards"), ZOOM_VH = 2.2;   // zum u slovo D traje 220vh scrolla
  // Raspored imena: na širokom ekranu dva reda (ARTIFICIAL / MEDIA), na uspravnom tabletu tri reda (ARTI / FICIAL / MEDIA),
  // da slova budu što veća. Slova se šire do samog ruba ekrana.
  // Mobitel (Kristian, 14. 10. 2026., proba): četiri reda ART / IFICIAL / ME / DIA. ART i ME su najveći jer imaju mjesta:
  // svaki ide preko cijele širine. IFICIAL ide preko cijele širine, a DIA je iste veličine kao IFICIAL.
  // Povratak na tri reda: u layout() umjesto LINES4 stavi LINES3.
  var LINES2 = ["ARTIFICIAL", "MEDIA"], LINES3 = ["ARTI", "FICIAL", "MEDIA"], TRACK_U = 8.5;
  var LINES4 = [{ t: "ART", fill: true }, { t: "IFICIAL", fill: true }, { t: "ME", fill: true }, { t: "DIA", like: 1 }];
  var D_CX = L.anchor.x - L.glyphs.M.adv - L.glyphs.E.adv;         // sredina slova D od njegova lijevog ruba
  // stvarni rubovi tinte svakog slova (iz obrisa), da redovi stanu točno od ruba do ruba
  var INK = {};
  Object.keys(L.glyphs).forEach(function (k) {
    var n = L.glyphs[k].d.match(/-?[0-9.]+/g).map(Number), x0 = 1e9, x1 = -1e9;
    for (var i = 0; i < n.length; i += 2) { x0 = Math.min(x0, n[i]); x1 = Math.max(x1, n[i]); }
    INK[k] = [x0, x1];
  });
  function inkOf(t) {                                                // [lijevi, desni] rub tinte reda, u jedinicama
    var x = 0, l = INK[t[0]][0], r = 0;
    for (var i = 0; i < t.length; i++) { r = x + INK[t[i]][1]; x += L.glyphs[t[i]].adv; }
    return [l, r];
  }
  function inkW(t) { var e = inkOf(t); return e[1] - e[0]; }
  var curLines = null, W0 = 1, H0 = 1, anchor = L.anchor;
  function buildLetters(lines) {
    if (curLines === lines) return; curLines = lines;
    // svaki red: tekst, mjerilo s i vrh y (jedinice: visina velikog slova = 100); redovi su poravnati po lijevom rubu tinte
    var rows = [];
    if (typeof lines[0] === "string") {
      lines.forEach(function (t, li) { rows.push({ t: t, s: 1, y: li * L.lead }); });
      W0 = Math.max.apply(null, lines.map(inkW));
    } else {
      var T = inkW("IFICIAL");                                      // širina reda IFICIAL je mjera; ART i ME se rašire do nje
      lines.forEach(function (r) { r.s = r.fill ? T / inkW(r.t) : 1; });
      lines.forEach(function (r) { if (r.like != null) r.s = lines[r.like].s; });
      var y = 0;
      lines.forEach(function (r, i) {
        rows.push({ t: r.t, s: r.s, y: y });
        var nx = lines[i + 1]; if (nx) y += 100 * r.s + (L.lead - 100) * Math.min(r.s, nx.s);
      });
      W0 = T;
    }
    var html = "";
    rows.forEach(function (r) {
      var x = 0; r.x0 = -inkOf(r.t)[0] * r.s;
      for (var i = 0; i < r.t.length; i++) {
        var g = L.glyphs[r.t[i]];
        html += '<path transform="translate(' + (r.x0 + x * r.s).toFixed(2) + "," + r.y.toFixed(2) + ") scale(" + r.s.toFixed(4) + ')" d="' + g.d + '"/>';
        x += g.adv;
      }
    });
    letters.innerHTML = html;
    var last = rows[rows.length - 1];
    H0 = last.y + 100 * last.s;
    // sidro zuma: sredina slova D (u rasporedu za mobitel D počinje zadnji red, inače je D treće slovo u MEDIA)
    var dRow = rows.filter(function (r) { return r.t.indexOf("D") >= 0; }).pop(), dx = 0;
    for (var k = 0; k < dRow.t.indexOf("D"); k++) dx += L.glyphs[dRow.t[k]].adv;
    anchor = { x: dRow.x0 + (dx + D_CX) * dRow.s, y: dRow.y + 50 * dRow.s, halfW: L.anchor.halfW * dRow.s, s: dRow.s };
  }

  var vw = 0, vh = 0, k0 = 1, bx = 0, by = 0, zEnd = 1;
  function layout() {
    var st = document.querySelector(".hero-stage") || document.documentElement;
    vw = st.clientWidth || window.innerWidth; vh = st.clientHeight || window.innerHeight;
    buildLetters(vw / vh >= 0.8 ? LINES2 : vw <= 640 ? LINES4 : LINES3);
    svg.setAttribute("viewBox", "0 0 " + vw + " " + vh);
    [maskRect, coverRect].forEach(function (r) { r.setAttribute("width", vw); r.setAttribute("height", vh); });
    var mask = $("#holes"); mask.setAttribute("width", vw); mask.setAttribute("height", vh);
    var maxW = vw * 0.985, maxH = vh * 0.9;                       // najveće moguće: tinta slova skoro do ruba ekrana
    k0 = Math.min(maxW / W0, maxH / H0);                          // W0 je širina tinte
    bx = (vw - k0 * W0) / 2; by = (vh - k0 * H0) / 2;              // tinta slova točno u sredini
    // koliko treba povećati da puno slovo D prekrije cijeli ekran (D ima kose kutove s desne strane)
    var a = anchor, hw = vw / 2, hh = vh / 2;
    var as = a.s || 1;
    zEnd = 1.06 * Math.max(hw / (k0 * (a.halfW - as)), hh / (k0 * 48 * as), (hw + hh) / (k0 * 68 * as));
  }

  function progressOf(el) {
    var r = el.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
  }

  function renderHero(p) {
    var t = reduce ? 0 : clamp((p - 0.05) / 0.8, 0, 1);
    var z = Math.exp(Math.log(zEnd) * Math.pow(t, 1.7));
    var K = k0 * z, a = anchor;
    var s = smooth(clamp(t * 1.4, 0, 1));                       // sidro (sredina slova D) klizi prema sredini ekrana
    var sx = lerp(bx + k0 * a.x, vw / 2, s), sy = lerp(by + k0 * a.y, vh / 2, s);
    letters.setAttribute("transform", "translate(" + (sx - K * a.x).toFixed(2) + "," + (sy - K * a.y).toFixed(2) + ") scale(" + K.toFixed(5) + ")");
    coverRect.style.opacity = reduce ? 1 : (1 - smooth(clamp((p - 0.82) / 0.1, 0, 1))).toFixed(3);
    hint.style.opacity = p < 0.02 ? 1 : 0;
    // zvuk videa: pun dok je hero na ekranu, utiša se dok hero odlazi (s kartama: dok ga prva karta prekriva)
    if (!CARDS) { var hr = hero.getBoundingClientRect(); Sound.videoLevel(clamp(hr.bottom / vh, 0, 1)); }
  }

  /* ---------- drugi slide: tri karte ----------
     q ide od 0 do 3: svaka jedinica je jedna karta koja se digne (100vh scrolla po karti).
     Karta k stane na k/3 visine ekrana. Kad se digne sljedeća, video prethodne klizne malo gore, da u njezinoj
     trećini ostane sredina kadra. Rečenica se pojavi kad je karta više od pola gore. */
  var cards = [].slice.call(document.querySelectorAll(".card")).map(function (el) {
    return { el: el, v: el.querySelector(".card-v"), t: el.querySelector(".card-t"), on: false, playing: false };
  });
  var heroVideo = $(".hero-video"), heroCovered = false;
  function playV(v) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
  /* zaključak (Kristian, 21. 10. 2026.): na pokret prema dolje nakon treće karte (Flow) rečenice na kartama izblijede (200 ms), pa trake
     odu svaka na svoju stranu (gornja lijevo, srednja desno, donja lijevo) i otkriju #sum: lijevo papir s rečenicom
     WHERE ART MEETS INTELLIGENCE. (tekst je u index.html), desno video. Malo nakon zadnje trake uđe rečenica, a nakon nje SCROLL (Flow).
     Natrag: trake se vrate obrnutim redom, pa se vrate rečenice na kartama. Vremena su u T ispod.
     Kretanje je u CSS-u (klase fade, open, out, in na .cards); ovdje je samo redoslijed. */
  var Sum = (function () {
    // SVA VREMENA ZAKLJUČKA (ms, rise u px; Kristian, 21. 10. 2026.). CSS ih dobiva kao varijable na .cards (--sum-*), pa se mijenjaju samo ovdje.
    var T = {
      FADE: 300,          // rečenice na kartama izblijede
      OUT: 900,           // jedna traka odlazi (cubic-bezier(0.65, 0, 0.35, 1), u CSS-u)
      STEP: 250,          // razmak između startova traka: 0, 250, 500
      VIDEO_FADE: 600,    // video desno uđe kad krene prva traka
      IN_DELAY: 300,      // od odlaska zadnje trake do rečenice
      IN: 600,            // rečenica uđe (ease-out)
      RISE: 20,           // pomak rečenice prema gore, px
      HOLD: 1500,         // od kraja ulaska rečenice do SCROLL-a
      BACK: 900           // jedna traka se vraća (isti STEP, obrnutim redom)
    };
    var box = $("#cards"), el = $("#sum"), v = el && el.querySelector(".split-v"), state = "idle", gone = false, timers = [], seen = true;
    if (box) [["fade", T.FADE], ["out", T.OUT], ["step", T.STEP], ["vfade", T.VIDEO_FADE], ["in", T.IN], ["back", T.BACK]].forEach(function (d) {
      box.style.setProperty("--sum-" + d[0], d[1] + "ms");
    });
    if (box) box.style.setProperty("--sum-rise", T.RISE + "px");
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function set(c, on) { box.classList.toggle(c, on); }
    function setGone(g) { gone = g; onScroll(); }                      // karte koje su otišle ne vrte video (renderCards)
    function start(done) {                                              // trake odlaze
      if (!el || state !== "idle") return; state = "out";
      if (reduce) { set("fade", true); set("open", true); set("out", true); set("in", true); playV(v); setGone(true); if (done) done(); return; }
      set("fade", true);                                                // 0: rečenice na kartama izblijede
      later(function () { set("open", true); set("out", true); playV(v); }, T.FADE);   // trake krenu, video uđe
      var end = T.FADE + 2 * T.STEP + T.OUT;                            // zadnja traka je otišla
      later(function () { setGone(true); }, end);
      later(function () { set("in", true); }, end + T.IN_DELAY);        // rečenica
      if (done) later(done, end + T.IN_DELAY + T.IN + T.HOLD);          // SCROLL
    }
    function back(done) {                                               // trake se vraćaju (donja, srednja, gornja)
      if (state !== "out") return; state = "back";
      timers.forEach(clearTimeout); timers = []; box.classList.remove("ready");
      set("in", false); setGone(false);
      function seated() { set("out", false); set("fade", false); set("open", false); if (v) v.pause(); state = "idle"; if (done) done(); onScroll(); }
      if (reduce) { seated(); return; }
      set("out", false);
      later(seated, T.BACK + 2 * T.STEP);
    }
    function view(on) {                                                 // video bloka se vrti samo dok se blok vidi (i kad je otvoren)
      if (!v || on === seen) return; seen = on;
      if (on && state !== "idle") playV(v); else v.pause();
    }
    return {
      start: start, back: back, view: view,
      busy: function () { return state !== "idle"; },                  // trake vani ili se vraćaju
      out: function () { return state === "out"; },
      gone: function () { return gone; }
    };
  })();
  function renderCards(q, inView) {
    if (!CARDS) return;
    cards.forEach(function (c, k) {
      var t = clamp(q - k, 0, 1); if (t > 0.996) t = 1;                // bez crte od piksela na vrhu
      var y = lerp(vh * 1.01, vh * k / 3, t);
      c.el.style.transform = "translate3d(0," + y.toFixed(1) + "px,0)";
      c.el.style.visibility = t > 0 ? "visible" : "hidden";
      var shift = k === 0 ? -vh / 3 * clamp(q - 1, 0, 1) : k === 1 ? -vh / 6 * clamp(q - 2, 0, 1) : 0;
      c.v.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0)";
      var tt = smooth(clamp((t - 0.45) / 0.55, 0, 1));
      c.t.style.opacity = tt.toFixed(3);
      c.t.style.transform = "translate3d(0," + ((1 - tt) * 36).toFixed(1) + "px,0)";
      var show = t > 0 && inView && !Sum.gone();                        // video se vrti samo dok se karta vidi
      if (show && !c.playing) { c.playing = true; playV(c.v); } else if (!show && c.playing) { c.playing = false; c.v.pause(); }
    });
    // treća karta sjela: u zaključanom tijeku Sum pokreće Flow na kraju dizanja; slobodan scroll (nakon SCROLL, smanjeni pokret) ovdje
    if (q < 3 - 2 / vh) Sum.back(); else if (Flow.free()) Sum.start();
    Sum.view(inView);
    var t1 = clamp(q, 0, 1); if (t1 > 0.996) t1 = 1;
    document.documentElement.classList.toggle("cards-dark", inView && q > 0.15);   // traka za scrollbar uz tamne karte
    Sound.videoLevel(1 - t1);                                           // zvuk heroja se utiša dok ga prva karta prekriva
    var covered = t1 >= 0.999 || !inView;                               // hero video stoji kad se ne vidi
    if (heroVideo && covered !== heroCovered) { heroCovered = covered; if (covered) heroVideo.pause(); else playV(heroVideo); }
  }

  // crna traka (26. 10. 2026.): čim pozornica heroja (blok WHERE ART) krene gore, tj. prvi scroll iza bloka; prije su je palili reelovi
  function renderBar() {
    bar.classList.toggle("on", hero.getBoundingClientRect().bottom < vh - 1);
  }

  /* ---------- zvuk ---------- */
  // Zvukovi pisaćeg stroja su u js/typewriter-sounds.js (sintetizirani, tools/make_typewriter_sounds.py).
  var Sound = (function () {
    var on = false, ctx = null, master = null, bufs = null, video = $(".hero-video"), btn = $("#sound"), vLevel = 1;
    function b64buf(b64) { var bin = atob(b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
    function decode(b64) { return new Promise(function (res) { ctx.decodeAudioData(b64buf(b64), res, function () { res(null); }); }); }
    function ensureCtx() {
      if (ctx) return;
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC || !window.AM_TW) return;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
      var T = window.AM_TW;
      Promise.all([Promise.all(T.key.map(decode)), Promise.all(T.space.map(decode)), decode(T.ret), decode(T.bell)])
        .then(function (r) { bufs = { key: r[0].filter(Boolean), space: r[1].filter(Boolean), ret: r[2], bell: r[3] }; });
    }
    function play(buf, gain, rate) {
      if (!on || !ctx || !buf) return;
      var src = ctx.createBufferSource(), g = ctx.createGain();
      src.buffer = buf; src.playbackRate.value = rate || 1; g.gain.value = gain;
      src.connect(g); g.connect(master); src.start();
    }
    var lastKey = -1;
    function key(ch) {                         // jedno otkucano slovo
      if (!bufs) return;
      if (ch === " ") { play(bufs.space[Math.floor(Math.random() * bufs.space.length)], 0.75, 0.97 + Math.random() * 0.06); return; }
      var i; do { i = Math.floor(Math.random() * bufs.key.length); } while (i === lastKey && bufs.key.length > 1); lastKey = i;
      var loud = /[A-Z+]/.test(ch) ? 1.0 : 0.85;   // velika slova udaraju malo jače
      play(bufs.key[i], loud * (0.8 + Math.random() * 0.25), 0.96 + Math.random() * 0.08);
    }
    function ret() { if (bufs) play(bufs.ret, 0.7, 1); }
    function bell() { if (bufs) play(bufs.bell, 0.45, 1); }
    function applyVideo() {
      if (!video) return;
      video.muted = !on;
      video.volume = on ? clamp(vLevel, 0, 1) : 0;
    }
    function videoLevel(x) { vLevel = x; if (on) applyVideo(); }
    function set(v) {
      on = v;
      if (on) { ensureCtx(); if (ctx && ctx.state === "suspended") ctx.resume(); if (video && video.paused) video.play().catch(function () {}); }
      applyVideo();
      if (btn) { btn.setAttribute("aria-pressed", on ? "true" : "false"); btn.querySelector("span").textContent = on ? "ON" : "OFF"; }
      window.AM_SOUND_ON = on;                   // reelovi (js/reels.js) prate isti gumb
      document.dispatchEvent(new CustomEvent("am:sound", { detail: { on: on } }));
    }
    if (btn) btn.addEventListener("click", function () { set(!on); });
    return { key: key, ret: ret, bell: bell, videoLevel: videoLevel };
  })();

  /* ---------- petlja: scenarij ---------- */
  // Tekst: Kristian, 13. 10. 2026. (ispravljeni samo pravopis i gramatika engleskog)
  // Tekst se tipka sam, ljudskim tempom, čim sekcija dođe na ekran (ne ovisi o scrollu). Izvan ekrana zastane.
  var SCRIPT = [
    // Nazivi ME, ART, AI i ARTIFICIAL MEDIA nisu u tekstu (Kristian, 14. 10. 2026.): nakon tipkanja ih rukom dopiše crveni marker.
    { beat: 1, focus: "me", lines: [["dlg", "It starts with me. Human. I direct every single thing."]] },
    { beat: 2, focus: "art", lines: [["dlg", "I use real art. Lighting, sound, movement, composition, the shot."]] },
    { beat: 3, focus: "ai", lines: [["dlg", "Imagination has no limits. Cameras and sets do. Now, with AI, we show what no camera could reach."]] },
    { beat: 4, focus: "all", lines: [["dlg", "Where art meets intelligence."]] }
  ];
  var loop = $("#loop"), stage = $("#loop-stage"), script = $("#script");
  var caret = document.createElement("span"); caret.className = "caret";
  SCRIPT.forEach(function (b) {
    var blk = document.createElement("div"); blk.className = "blk"; b.blk = blk; blk.dataset.focus = b.focus;
    // svaki red: otipkani dio + ostatak koji je nevidljiv, ali drži mjesto (sve stoji na svom konačnom mjestu, ništa ne skače)
    b.spans = b.lines.map(function (ln) {
      var el = document.createElement("span"); el.className = "ln " + ln[0];
      el.t = document.createElement("span"); el.r = document.createElement("span"); el.r.className = "rest";
      el.r.textContent = ln[1]; el.appendChild(el.t); el.appendChild(el.r); blk.appendChild(el); return el;
    });
    script.appendChild(blk);
  });
  $("#script-text").textContent = SCRIPT.map(function (b) { return b.lines.map(function (l) { return l[1]; }).join(" "); }).join(" ");

  // daktilograf: blok bi, red li, slovo ci
  var TW = { bi: 0, li: 0, ci: 0, unlocked: 0, busy: false, done: false, visible: false };
  function setBeat(n) { if (stage.dataset.beat !== String(n)) stage.dataset.beat = n; }
  function showCaret(span, typing) {
    if (caret.nextSibling !== span.r) span.insertBefore(caret, span.r);
    caret.classList.toggle("typing", !!typing);
  }
  function delayAfter(ch, next) {              // ljudski ritam, ali brz: nepravilno, s kratkim predahom na interpunkciji (ubrzano 14. 10. 2026.)
    var d = 26 + Math.random() * 24;
    if (ch === " ") d += 8 + Math.random() * 14;
    if (ch === ",") d += 65 + Math.random() * 40;
    if (ch === ".") d += next ? 115 + Math.random() * 65 : 0;
    if (Math.random() < 0.025) d += 60 + Math.random() * 60;     // kratko oklijevanje
    if (next && /[a-z]/.test(ch) && /[a-z]/.test(next) && Math.random() < 0.3) d *= 0.75;  // poznati parovi slova idu brže
    return d;
  }
  function step() {
    TW.busy = false;
    if (TW.bi >= SCRIPT.length) { TW.done = true; caret.classList.remove("typing"); enableFocus(); setTimeout(function () { Flow.scriptDone(Marks.draw(true)); }, 300); return; }
    if (TW.bi >= TW.unlocked || !TW.visible) { caret.classList.remove("typing"); return; }     // čeka scroll; ne tipka izvan ekrana
    var b = SCRIPT[TW.bi], ln = b.lines[TW.li], span = b.spans[TW.li], text = ln[1];
    setBeat(b.beat);
    var ch = text.charAt(TW.ci);
    TW.ci++;
    span.t.textContent = text.slice(0, TW.ci); span.r.textContent = text.slice(TW.ci);
    showCaret(span, true);
    Sound.key(ch);
    var wait = delayAfter(ch, text.charAt(TW.ci));
    if (TW.ci >= text.length) {                      // kraj reda
      TW.li++; TW.ci = 0; wait = 140 + Math.random() * 60;
      if (TW.li >= b.lines.length) {                 // kraj bloka
        TW.bi++; TW.li = 0;
        if (TW.bi >= SCRIPT.length) { setTimeout(Sound.bell, 260); }
        else { wait = 300 + Math.random() * 80; setTimeout(function () { if (TW.bi < TW.unlocked) Sound.ret(); }, 120); }
      }
    }
    TW.busy = true; setTimeout(step, wait);
  }
  // Kad je sve otipkano: mišem preko bloka ME svijetli samo ME, preko ART samo ART, preko AI samo A i I;
  // preko ARTIFICIAL MEDIA i bilo gdje drugdje svijetli cijelo ime. Na dodirnom ekranu isto radi dodir.
  var focusOn = false;
  function enableFocus() {
    if (focusOn) return; focusOn = true;
    stage.classList.add("focusable"); stage.dataset.focus = "all";
    SCRIPT.forEach(function (b) {
      b.blk.addEventListener("mouseenter", function () { stage.dataset.focus = b.focus; });
      b.blk.addEventListener("mouseleave", function () { stage.dataset.focus = "all"; });
      b.blk.addEventListener("click", function (e) { e.stopPropagation(); stage.dataset.focus = stage.dataset.focus === b.focus ? "all" : b.focus; });
    });
    stage.addEventListener("click", function () { stage.dataset.focus = "all"; });
  }
  function renderLoop(q) {
    if (reduce) {                                    // smanjeni pokret: sve odmah, bez tipkanja
      if (!TW.done) {
        SCRIPT.forEach(function (b) { b.spans.forEach(function (sp, i) { sp.t.textContent = b.lines[i][1]; sp.r.textContent = ""; }); });
        TW.done = true; setBeat(4); enableFocus(); Marks.draw(false);
      }
      return;
    }
    var r = loop.getBoundingClientRect(); TW.visible = r.top < vh && r.bottom > 0;
    if (r.top < vh * 0.35) TW.unlocked = SCRIPT.length;         // sekcija je na ekranu: tipka se sve, samo od sebe
    if (!TW.busy && !TW.done && TW.visible && TW.bi < TW.unlocked) {
      TW.busy = true; setTimeout(step, TW.bi === 0 && TW.ci === 0 && TW.li === 0 ? 250 : 100);
    }
  }


  /* ---------- crveni marker: rukom dopisano nakon tipkanja ----------
     1) ME i strelica na prvi tekst  2) ART iznad drugog teksta i strelica  3) krug oko trećeg teksta i AI
     4) krug oko velikog naslova ARTIFICIAL MEDIA i strelica do "Where art meets intelligence."
     Slova su crtana potezima (kao rukom), a svaki potez se iscrta redom. */
  var Marks = (function () {
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "marks"); svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<defs><filter id="marker-rough" x="-10%" y="-10%" width="120%" height="120%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g class="ink"></g>';
    stage.appendChild(svg);
    var ink = svg.querySelector(".ink"), state = 0;           // 0 ništa, 1 crta se / nacrtano
    var J = function (a) { return (Math.random() * 2 - 1) * a; };
    // velika tiskana slova kao potezi rukom (jedinična kutija, y prema dolje); w = širina slova
    var GL = {
      M: { w: 0.95, s: [[[0, 1], [0.04, 0], [0.48, 0.62], [0.92, 0], [0.97, 1]]] },
      E: { w: 0.7, s: [[[0.72, 0.02], [0, 0], [0, 1], [0.74, 1]], [[0, 0.5], [0.56, 0.48]]] },
      A: { w: 0.9, s: [[[0, 1], [0.45, 0], [0.9, 1]], [[0.2, 0.64], [0.72, 0.6]]] },
      R: { w: 0.78, s: [[[0, 1], [0, 0], [0.5, 0], [0.72, 0.1], [0.74, 0.3], [0.56, 0.47], [0, 0.5]], [[0.34, 0.5], [0.8, 1]]] },
      T: { w: 0.86, s: [[[0, 0.02], [0.88, 0]], [[0.44, 0], [0.46, 1]]] },
      I: { w: 0.14, s: [[[0.07, 0], [0.07, 1]]] }
    };
    var GAP = 0.3, SLANT = 0.13;
    var SPD = 1.8, PAUSE = 0.5;                              // marker brži (14. 10. 2026.): brzina poteza × 1,8, predasi upola
    function wordW(t, size) { var w = 0; for (var i = 0; i < t.length; i++) w += GL[t[i]].w + GAP; return (w - GAP) * size; }
    function smoothD(pts) {                                 // zaobljeni potez kroz točke
      var d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
      if (pts.length === 2) return d + "L" + pts[1][0].toFixed(1) + "," + pts[1][1].toFixed(1);
      for (var i = 1; i < pts.length - 1; i++) {
        var mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
        d += "Q" + pts[i][0].toFixed(1) + "," + pts[i][1].toFixed(1) + " " + mx.toFixed(1) + "," + my.toFixed(1);
      }
      var L = pts[pts.length - 1]; return d + "L" + L[0].toFixed(1) + "," + L[1].toFixed(1);
    }
    function word(t, x, y, size) {                          // potezi riječi; x,y = gornji lijevi kut
      var out = [], cx = x, base = Math.random() * 2 - 1;
      for (var i = 0; i < t.length; i++) {
        var g = GL[t[i]], sc = size * (1 + J(0.06)), dy = J(size * 0.04) + base * size * 0.02 * i;
        g.s.forEach(function (st) {
          out.push(smoothD(st.map(function (p) {
            return [cx + (p[0] + J(0.035)) * sc + (1 - p[1]) * SLANT * sc, y + dy + (p[1] + J(0.03)) * sc];
          })));
        });
        cx += (g.w + GAP) * sc;
      }
      return out;
    }
    function arrow(x0, y0, x1, y1, bend) {                  // zakrivljena strelica s vrhom
      var mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1;
      var qx = mx - dy / l * bend, qy = my + dx / l * bend;
      var shaft = "M" + x0.toFixed(1) + "," + y0.toFixed(1) + "Q" + qx.toFixed(1) + "," + qy.toFixed(1) + " " + x1.toFixed(1) + "," + y1.toFixed(1);
      return [shaft, head(qx, qy, x1, y1)];
    }
    function head(fx, fy, x1, y1) {
      var a = Math.atan2(y1 - fy, x1 - fx), h = 13 + J(2), k = 0.5 + J(0.06);
      var p1 = [x1 - h * Math.cos(a - k), y1 - h * Math.sin(a - k)], p2 = [x1 - h * Math.cos(a + k), y1 - h * Math.sin(a + k)];
      return "M" + p1[0].toFixed(1) + "," + p1[1].toFixed(1) + "L" + x1.toFixed(1) + "," + y1.toFixed(1) + "L" + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    function ring(cx, cy, rx, ry) {                         // rukom povučen krug: ne zatvori se savršeno, malo prebaci
      var a0 = -2.2 + J(0.3), n = 64, ph = Math.random() * 6, d = "", tilt = J(0.04);
      for (var i = 0; i <= n; i++) {
        var t = a0 + (Math.PI * 2 + 0.5) * i / n, r = 1 + 0.035 * Math.sin(3 * t + ph) + 0.03 * (i / n);
        var x = Math.cos(t) * rx * r, y = Math.sin(t) * ry * r;
        var X = cx + x * Math.cos(tilt) - y * Math.sin(tilt), Y = cy + x * Math.sin(tilt) + y * Math.cos(tilt);
        d += (i ? "L" : "M") + X.toFixed(1) + "," + Y.toFixed(1);
      }
      return d;
    }
    function box(el) {                                      // točne granice teksta (redovi), relativno na sekciju
      var rg = document.createRange(); rg.selectNodeContents(el);
      var rs = rg.getClientRects(), sr = stage.getBoundingClientRect(), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (var i = 0; i < rs.length; i++) { var r = rs[i]; if (!r.width) continue; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); }
      return { x: x0 - sr.left, y: y0 - sr.top, w: x1 - x0, h: y1 - y0 };
    }
    function plan() {                                       // [d, debljina, brzina px/s, pauza prije]
      var fs = parseFloat(getComputedStyle(script).fontSize), size = fs * 1.5, W = stage.clientWidth;
      var B = SCRIPT.map(function (b) { return box(b.spans[0].t); }), N = box($(".name")), P = [];
      function add(list, w, v, pause) { list.forEach(function (d, i) { P.push([d, w, v, i === 0 ? pause : 50]); }); }
      var lw = size * 0.12, aw = Math.max(2.2, fs * 0.13);
      // 1) ME + strelica na prvi tekst
      var b = B[0], w = wordW("ME", size), x, y;
      if (b.x > w + 60) { x = b.x - w - 46; y = b.y + b.h / 2 - size * 0.55; add(word("ME", x, y, size), lw, 340, 0);
        add(arrow(x + w + 10, y + size * 0.55, b.x - 8, b.y + fs * 0.7, -10), aw, 650, 90); }
      else { x = Math.max(6, b.x - 4); y = b.y - size - fs * 0.5; add(word("ME", x, y, size), lw, 340, 0);
        add(arrow(x + w + 8, y + size * 0.5, x + w + fs * 1.8, b.y - 3, -8), aw, 650, 90); }
      // 2) ART iznad drugog teksta + strelica
      b = B[1]; w = wordW("ART", size);
      x = Math.min(W - w - 10, Math.max(b.x + b.w * 0.55, b.x)); y = b.y - size - fs * 0.75;
      add(word("ART", x, y, size), lw, 340, 260);
      add(arrow(x - 8, y + size * 0.65, x - fs * 2.2, b.y - 2, 10), aw, 650, 90);
      // 3) krug oko trećeg teksta + AI
      b = B[2]; var cx = b.x + b.w / 2, cy = b.y + b.h / 2, rx = Math.min(b.w / 2 + fs * 1.2, W / 2 - 4), ry = b.h / 2 + fs * 0.85;
      add([ring(cx, cy, rx, ry)], aw * 1.1, 1200, 260);
      w = wordW("AI", size);
      if (cx + rx + 14 + w < W - 6) { x = cx + rx + 14; y = cy - size * 0.9; } else { x = Math.min(W - w - 6, cx + rx * 0.55); y = cy - ry - size * 0.95; }
      add(word("AI", x, y, size), lw, 340, 110);
      // 4) krug oko velikog naslova + strelica do "Where art meets intelligence."
      var ncx = N.x + N.w / 2, ncy = N.y + N.h / 2, nrx = Math.min(N.w / 2 + fs * 1.5, W / 2 - 3), nry = N.h / 2 + fs * 0.9;
      add([ring(ncx, ncy, nrx, nry)], aw * 1.25, 1500, 300);
      b = B[3]; var a = 0.32, p0x = ncx + nrx * Math.cos(a), p0y = ncy + nry * Math.sin(a), tx = b.x + b.w + 10, ty = b.y + b.h / 2;
      var sx = Math.min(W - 12, Math.max(p0x, tx) + fs * 3.2);
      var shaft = "M" + p0x.toFixed(1) + "," + p0y.toFixed(1) + "C" + sx.toFixed(1) + "," + (p0y + fs * 3).toFixed(1) + " " + sx.toFixed(1) + "," + (ty - fs * 2.5).toFixed(1) + " " + tx.toFixed(1) + "," + ty.toFixed(1);
      add([shaft, head(sx, ty - fs * 0.6, tx, ty)], aw, 900, 110);
      return P;
    }
    function draw(animate) {
      if (state) return 0; state = 1; ink.innerHTML = "";
      if (caret.parentNode) caret.parentNode.removeChild(caret);          // daktilograf je gotov, sad piše marker
      var t = 0;
      plan().forEach(function (it) {
        var p = document.createElementNS(NS, "path"); p.setAttribute("d", it[0]); p.style.strokeWidth = it[1].toFixed(2); ink.appendChild(p);
        if (!animate) return;
        var L = p.getTotalLength(), dur = Math.max(60, L / (it[2] * SPD) * 1000);
        t += it[3] * PAUSE;
        p.style.strokeDasharray = L.toFixed(1); p.style.strokeDashoffset = L.toFixed(1); p.style.opacity = 0;   // skriveno do svog poteza
        p.animate([{ strokeDashoffset: L, opacity: 0.92 }, { strokeDashoffset: 0, opacity: 0.92 }], { duration: dur, delay: t, easing: "cubic-bezier(.35,.1,.25,1)", fill: "forwards" });
        t += dur;
      });
      return t;                                               // koliko traje crtanje (ms)
    }
    function redraw() { if (!state) return; state = 0; draw(false); }
    return { draw: draw, redraw: redraw };
  })();

  /* ---------- tijek koji se ne može preskočiti ----------
     Hero: do kraja zuma mora se scrollati; slova rastu samo dok posjetitelj scrolla, a brzina je ograničena
     (220vh zuma traje najmanje ~1,8 s).
     Karte (Kristian, 19. 10. 2026.: "nije na scroll, glatko, dugo se čeka i scrolla da se digne"): na svakom
     zaustavljanju jedan pokret (kotačić, trackpad, prst, tipka) glatko digne cijelu sljedeću kartu (~0,9 s).
     Ako se nakon zuma scrolla dalje, prva karta krene sama. Dok se karta diže, ostatak istog zamaha se upije, pa ni
     inercija trackpada ne preskače karte. Prema gore isto: karta po karta, pa natrag u zum.
     Nakon treće karte (Kristian, 19. 10. 2026.: "neka se zaključa na 3-4 sekunde da stigne pogledati i pročitati")
     prema dolje se ništa ne miče 0,6 s (SEAT_HOLD). Onda SCROLL, i novi pokret prema dolje pošalje trake (Sum); dok odlaze i rečenica
     ulazi, sve se upija, a 1,5 s nakon rečenice opet SCROLL. Prvi pokret prema dolje (ili klik na SCROLL) tada otključa stranicu
     i glatko je odvede na ekran 2 (27. 10. 2026.), sljedeći na ekran 3, zatim #why (razdvajanje i četiri reda, Why), pa jedan pokret
     glatko doveze THE WORK (#work, 29. 10. 2026.) i tu stane; sljedeći otključa stranicu i pusti je prema #next (običan scroll).
     Prema gore ekran po ekran; iz slobodnog scrolla natrag iznad #work tijek se opet zaključa na #work.
     Vodoravni pokreti (trackpad, prst po ploči s projektima) ne broje se kao korak.
     Jedan pokret = jedan korak u cijelom tijeku; rep inercije trackpada se ne broji (wheelNew).
     Uz scenarij (SCREENPLAY) jedino zaustavljanje je naslov, a otključa se kad se tekst otipka i marker dovrši.
     Uz "smanjeni pokret" u sustavu ništa se ne zaključava. */
  var Flow = (function () {
    var root = document.documentElement, locked = false, phase = reduce ? "free" : "hero", touchY = null, touchFresh = false;
    var target = 0, cur = 0, running = false, last = 0, SPEED = ZOOM_VH / 1.8;   // brzina zuma u visinama ekrana po sekundi
    var idx = 0, arrived = 0, lastWheel = 0, tweenEnd = 0, tweening = false;
    var GAP = 250, TWEEN = 900, SEAT_HOLD = 600, holdT = 0, recent = [];
    var C3 = 3;                                                          // zaustavljanje treće karte (i bloka WHERE ART); iza njega ekrani 2, 3
    var screens = [].slice.call(document.querySelectorAll(".split-screen"));
    var W3 = C3 + screens.length;                                        // ekran 3 (vrata #why); iza njega #work, ako postoji
    var cardsEl = document.getElementById("cards"), goEl = document.getElementById("cards-go");
    var canStep = false;                                                 // smije li pokret dolje dalje (ne ovisi o tome vidi li se SCROLL)
    function setReady(v) { canStep = v; if (cardsEl) cardsEl.classList.toggle("ready", v); }   // isti trenutak: korak dozvoljen + SCROLL
    function isReady() { return canStep; }
    function atC3() { return phase === "hero" && idx === C3 && !tweening; }
    function onSumDone() { if (atC3()) setReady(true); }
    function seatHold() {                                                // treća karta sjela (ili su se trake vratile): 0,6 s mira, pa SCROLL
      clearTimeout(holdT); holdT = setTimeout(function () { if (atC3() && !Sum.busy()) setReady(true); }, SEAT_HOLD);
    }
    function fromC3() {                                                  // korak dolje s treće karte: prvo trake, zatim ekran 2
      setReady(false); clearTimeout(holdT);
      if (!Sum.busy()) Sum.start(onSumDone); else if (C3 < stops().length - 1) tweenTo(C3 + 1); else leave();
    }
    function leave() {                                                   // s posljednjeg ekrana: otključa, dalje običan scroll (#next)
      setReady(false); clearTimeout(holdT);
      phase = "free"; setLock(false);
      var to = next ? next.offsetTop : window.scrollY + vh;
      if (work && idx === stops().length - 1 && work.offsetHeight > vh + 1) to = Math.min(to, window.scrollY + vh * 0.6);   // mobitel: #work je viši od ekrana, dalje se lista
      window.scrollTo({ top: to, behavior: "smooth" });
    }
    function fromWhy() {                                                 // #why gotov (SCROLL): na #work, ili otpuštanje ako ga nema
      if (work && idx === W3) tweenTo(W3 + 1); else leave();
    }
    function setLock(v) { locked = v; root.classList.toggle("locked", v); }
    function stops() {
      if (!CARDS) return [loop.offsetTop];
      var t = hero.offsetTop, S = [t + ZOOM_VH * vh, t + (ZOOM_VH + 1) * vh, t + (ZOOM_VH + 2) * vh, t + (ZOOM_VH + 3) * vh];
      screens.forEach(function (sc) { S.push(sc.offsetTop); });          // ekrani 2 i 3 (27. 10. 2026.)
      if (work) S.push(work.offsetTop);                                  // THE WORK (29. 10. 2026.): cijela pozornica ispod crne trake
      return S;
    }
    function ease(t) { return 1 - Math.pow(1 - t, 3); }                  // odmah krene, mekano stane
    function tweenTo(i) {                                                // glatko do zaustavljanja i (karta, ili cijela stranica na ekran)
      var S = stops(), from = cur, to = S[i], t0 = performance.now();
      idx = i; tweening = true; running = false; setReady(false); clearTimeout(holdT);
      (function f(now) {
        var k = Math.min(1, (now - t0) / TWEEN);
        cur = from + (to - from) * ease(k); target = cur;
        window.scrollTo(0, cur);
        if (k < 1) requestAnimationFrame(f);
        else {
          tweening = false; tweenEnd = arrived = performance.now();
          if (i === C3) { if (Sum.busy()) setReady(true); else seatHold(); }   // treća karta sjela: 0,6 s mira, pa SCROLL; natrag s ekrana 2: odmah
        }
      })(t0);
    }
    function tick(now) {                                                 // zum: ručno, s ograničenom brzinom
      var dt = Math.min(0.05, (now - (last || now)) / 1000) || 1 / 60; last = now;
      var S = stops(), d = target - cur, max = SPEED * vh * dt;
      cur += Math.abs(d) < 0.6 ? d : Math.max(-max, Math.min(max, d * Math.min(1, dt * 9)));
      window.scrollTo(0, cur);
      if (Math.abs(cur - S[0]) < 0.6) {
        if (!arrived) arrived = performance.now();
        if (!CARDS) { phase = "script"; running = false; onScroll(); return; }   // stigli do naslova scenarija
      }
      if (Math.abs(target - cur) >= 0.6) requestAnimationFrame(tick); else { running = false; last = 0; }
    }
    /* novi pokret, za SVE korake (karte, trake, ekrani, otpuštanje; 27. 10. 2026.): tik kotačića (razmak > 60 ms; inercija trackpada
       šalje pomak svaki kadar, ~16 ms) ili novi zamah usred inercije (pomak naraste: barem 2× i 3 px iznad najmanjeg u zadnjih 120 ms).
       Rep inercije samo slabi, pa se ne broji: jedan zamah = jedan korak. Prst: novi dodir; tipka: novi pritisak. */
    function wheelNew(ad, gap, now) {
      recent = recent.filter(function (r) { return now - r[0] < 120; });
      var min = recent.reduce(function (m, r) { return Math.min(m, r[1]); }, Infinity);
      recent.push([now, ad]);
      return gap > 60 || (min < Infinity && ad >= 4 && ad >= 2 * min && ad >= min + 3);
    }
    function push(dy, gap, isNew) {                                     // isNew: novi pokret (kotačić: wheelNew; prst, tipka: novi dodir/pritisak)
      if (isNew === undefined) isNew = gap > GAP;
      if (phase !== "hero" || tweening) return;                          // dok se karta ili ekran voze, ostatak zamaha se upije
      var S = stops(), now = performance.now();
      var atStop = CARDS && Math.abs(cur - S[idx]) < 1;
      if (atStop) {
        if (idx === 0 && dy > 0 && arrived && now - arrived > 150) isNew = true;   // nakon zuma prva karta krene i u istom zamahu
        if (idx === C3 && !Sum.busy() && !canStep) return;               // treća karta tek sjela (ili su se trake vratile): mir, sve se upija
        if (dy > 0) {
          if (!isNew) return;                                             // jedan pokret = jedan korak
          if (idx < C3) { if (now - arrived < 120) return; tweenTo(idx + 1); return; }   // sljedeća karta
          if (idx === C3) { if (canStep) fromC3(); return; }              // trake, pa ekran 2 (dok trake odlaze i rečenica ulazi: upija se)
          if (idx < W3) tweenTo(idx + 1);                                 // ekran 2, ekran 3
          else if (idx === W3) { if (Why) Why.down(fromWhy); else fromWhy(); }   // #why (redovi tablice), pa #work
          else leave();                                                   // s #work: otpuštanje prema #next
          return;
        }
        if (dy < 0 && idx > 0) {
          if (!isNew) return;
          if (idx === C3 && Sum.busy()) {                                 // prvo se vrate trake; tek sljedeći pokret spusti kartu
            if (Sum.out()) { setReady(false); clearTimeout(holdT); Sum.back(function () { tweenEnd = performance.now(); seatHold(); }); }
            return;
          }
          if (idx === W3 && Why && Why.up()) return;                      // #why: red po red natrag, pa se ekran 3 sastavi (s #work natrag: svi redovi stoje)
          tweenTo(idx - 1); return;                                       // karta se spusti / ekran natrag
        }
        arrived = 0;                                                      // s prve zaustavne točke natrag u zum
      }
      if (cur > S[0] + 1) return;                                         // između karata se ne staje (samo tween)
      idx = 0;
      target = clamp(target + dy, 0, S[0]);
      if (dy < 0) arrived = 0;
      if (!running) { running = true; last = 0; requestAnimationFrame(tick); }
    }
    var KEYS = { ArrowDown: 0.35, PageDown: 0.9, " ": 0.9, Spacebar: 0.9, End: 9, ArrowUp: -0.35, PageUp: -0.9, Home: -9 };
    window.addEventListener("wheel", function (e) {
      if (!locked) return; e.preventDefault();
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;               // vodoravni zamah nije korak
      var now = performance.now(), gap = now - lastWheel; lastWheel = now;
      var dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh : 1);
      push(dy, gap, wheelNew(Math.abs(dy), gap, now));
    }, { passive: false });
    window.addEventListener("keydown", function (e) {
      if (!locked || !(e.key in KEYS)) return;
      var t = e.target;
      if ((e.key === " " || e.key === "Spacebar") && t && t.tagName === "BUTTON") return;   // razmak na gumbu (kartice projekata) ga klikne
      e.preventDefault(); push(KEYS[e.key] * vh, e.repeat ? 0 : 1e9);
    });
    // prst: smjer se odluči na prvom pomaku. Vodoravno (npr. listanje ploče s projektima, data-hscroll) nije korak; na ploči se pusti
    // pregledniku da je lista, drugdje se samo upije.
    var touchX0 = 0, touchY0 = 0, touchAxis = null, touchH = false;
    window.addEventListener("touchstart", function (e) {
      touchY = touchY0 = e.touches[0].clientY; touchX0 = e.touches[0].clientX; touchFresh = true; touchAxis = null;
      touchH = !!(e.target && e.target.closest && e.target.closest(".wk-cards"));
    }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (!locked) return;
      var y = e.touches[0].clientY, x = e.touches[0].clientX;
      if (touchAxis === null) touchAxis = Math.abs(x - touchX0) > Math.abs(y - touchY0) ? "x" : "y";
      if (touchAxis === "x") { if (!touchH) e.preventDefault(); return; }
      e.preventDefault();
      if (touchY !== null) { var dy = (touchY - y) * 1.6; if (Math.abs(dy) > 0.5) { push(dy, touchFresh ? 1e9 : 0); touchFresh = false; } }
      touchY = y;
    }, { passive: false });
    if (hint) hint.addEventListener("click", function () { push(vh, 1e9); });
    if (goEl) goEl.addEventListener("click", function () {
      if (atC3() && isReady()) fromC3();
    });
    // natrag iz slobodnog scrolla: čim se vrati iznad ekrana 3, tijek se opet zaključa na ekranu 3 (dalje gore ekran po ekran)
    window.addEventListener("scroll", function () {
      if (phase !== "free" || reduce || !CARDS) return;
      var S = stops(), L = S.length - 1;
      if (window.scrollY < S[L] - 1) {
        phase = "hero"; idx = L; cur = target = S[L]; window.scrollTo(0, cur);
        tweenEnd = arrived = performance.now(); setLock(true);
      }
    }, { passive: true });
    if (!reduce) {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0); setLock(true);
    }
    return {
      scriptDone: function (ms) { setTimeout(function () { phase = "free"; setLock(false); }, (ms || 0) + 250); },
      free: function () { return phase === "free"; },
      release: function () { if (phase !== "hero") return; if (idx === W3) fromWhy(); else leave(); },   // klik na SCROLL u #why (→ #work) i u #work (→ #next)
      state: function () { return phase + ":" + idx + ":" + Math.round(cur); },
      held: function () { return arrived ? Math.round(performance.now() - arrived) : -1; }
    };
  })();
  window.AM_FLOW = Flow;                                              // za provjeru u testovima

  /* ---------- zašto AI produkcija (#why, Kristian, 29. 10. 2026.) ----------
     #why leži ispod ekrana 3. Jedan pokret (Flow) razdvoji ekran 3 i otkrije zaglavlje tablice; kad zaglavlje stoji, redovi 1–4 dođu
     SAMI, jedan za drugim (Kristian, 29. 10. 2026.: posjetitelj više ne scrolla red po red). Red: fade s pomakom, a brojke se odbroje
     od 0 do data-value i trake iscrtaju do svoje duljine, istovremeno. Novi red krene ROW_GAP nakon prethodnog (preklapaju se).
     Od razdvajanja do SCROLL-a svi pokreti se upiju (i prema gore). Zatim jedan pokret dolje vodi na #work.
     Prema gore (kad je sve prikazano): ekran 3 se sastavi, a redovi zajedno nestanu. Povratak s #work: sve već stoji, SCROLL odmah.
     Nazivi, brojke, jedinice i data-max su u index.html. */
  var Why = (function () {
    var sec = $("#why"), door = $("#split-3");
    if (!sec || !door || !CARDS) return null;
    var T = {
      SPLIT: 900,        // ekran 3 se razdvoji (cubic-bezier(0.65, 0, 0.35, 1), u CSS-u); tada krene red 1
      ROW_GAP: 350,      // novi red krene toliko nakon što je prethodni krenuo
      IN: 400,           // red uđe (fade, pomak 16 px)
      COUNT: 600,        // brojke se odbroje i trake iscrtaju (ease-out)
      OUT: 300,          // natrag: svi redovi zajedno nestanu (dok se ekran 3 sastavlja); trajanje je u CSS-u (.why-row)
      HOLD: 600          // od kraja zadnjeg reda do SCROLL-a
    };
    [["--why-split", T.SPLIT], ["--why-in", T.IN], ["--why-count", T.COUNT]].forEach(function (d) {
      sec.style.setProperty(d[0], d[1] + "ms"); door.style.setProperty(d[0], d[1] + "ms");
    });
    var rows = [].slice.call(sec.querySelectorAll(".why-row")), go = $("#why-go");
    var open = false, busyUntil = 0, timers = [], ready = false;      // open: ekran 3 razdvojen (redovi dolaze ili stoje)
    // duljine traka: vrijednost / data-max reda (prazno = veća od dvije); dok su obje 0 (placeholderi), siva 100 %, crvena 35 %
    rows.forEach(function (row) {
      var vals = [].slice.call(row.querySelectorAll(".why-val")).map(function (e) { return parseFloat(e.getAttribute("data-value")) || 0; });
      var max = parseFloat(row.getAttribute("data-max")) || Math.max.apply(null, vals), fills = row.querySelectorAll(".why-bar b");
      vals.forEach(function (v, i) { if (fills[i]) fills[i].style.setProperty("--f", max > 0 ? clamp(v / max, 0, 1) : (i === 0 ? 1 : 0.35)); });
    });
    function pad(v, n) { v = String(v); while (v.length < n) v = "0" + v; return v; }
    function count(row) {                                                // 0 → data-value, cijeli brojevi, isti broj znamenki do kraja
      var els = [].slice.call(row.querySelectorAll(".why-val")), t0 = performance.now();
      (function f(now) {
        if (!row.classList.contains("on")) return;                      // red je u međuvremenu otišao
        var k = Math.min(1, (now - t0) / T.COUNT), e = 1 - Math.pow(1 - k, 3);
        els.forEach(function (el) { var s = el.getAttribute("data-value") || "0", n = parseInt(s, 10) || 0; el.textContent = k < 1 ? pad(Math.round(n * e), s.length) : s; });
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function hold(ms) { busyUntil = performance.now() + ms; }
    function setReady(v) { ready = v; sec.classList.toggle("ready", v); }
    function down(go) {                                                  // pokret dolje na ekranu 3
      if (performance.now() < busyUntil) return;                         // razdvajanje i redovi još traju: upije se
      if (!open) {                                                       // razdvajanje, pa redovi sami, pa SCROLL
        open = true; door.classList.add("apart");
        var end = T.SPLIT + (rows.length - 1) * T.ROW_GAP + Math.max(T.IN, T.COUNT) + T.HOLD;
        rows.forEach(function (row, k) { later(function () { row.classList.add("on"); count(row); }, T.SPLIT + k * T.ROW_GAP); });
        later(function () { setReady(true); }, end);
        hold(end); return;
      }
      if (ready) go();                                                   // nakon SCROLL-a: na #work
    }
    function up() {                                                      // pokret gore; false = #why je zatvoren, Flow ide ekran natrag
      if (performance.now() < busyUntil) return true;                    // redovi još dolaze: upije se
      if (!open) return false;
      timers.forEach(clearTimeout); timers = []; setReady(false);
      rows.forEach(function (row) { row.classList.remove("on"); });       // redovi zajedno nestanu (T.OUT)
      door.classList.remove("apart"); open = false; hold(T.SPLIT);        // ekran 3 se sastavi
      return true;
    }
    if (reduce) { rows.forEach(function (row) { row.classList.add("on"); }); setReady(true); }   // smanjeni pokret: sve odmah, bez odbrojavanja i crtanja, SCROLL odmah
    if (go) go.addEventListener("click", function () { if (ready) Flow.release(); });
    return { down: down, up: up, state: function () { return (open ? sec.querySelectorAll(".why-row.on").length : "zatvoren") + (ready ? "+SCROLL" : ""); } };
  })();
  window.AM_WHY = Why;

  /* ---------- ekrani 2 i 3 (27. 10. 2026.): video se vrti samo dok se ekran vidi ---------- */
  (function () {
    var vs = [].slice.call(document.querySelectorAll(".split-screen .split-v"));
    if (!vs.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) playV(e.target); else e.target.pause(); }); });
    vs.forEach(function (v) { io.observe(v); });
  })();

  /* ---------- petlja crtanja ---------- */
  var ticking = false;
  function update() {
    ticking = false;
    if (CARDS) {
      var hr = hero.getBoundingClientRect(), sc = -hr.top;
      renderHero(clamp(sc / (ZOOM_VH * vh), 0, 1));
      renderCards(clamp((sc - ZOOM_VH * vh) / vh, 0, 3), hr.bottom > 1);
    } else renderHero(progressOf(hero));
    if (SCREENPLAY) renderLoop(progressOf(loop));
    renderBar();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { layout(); onScroll(); Marks.redraw(); });
  layout(); update();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);

  // video: neki preglednici ne pokrenu autoplay sami
  var v = $(".hero-video");
  if (v) { var tryPlay = function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }; tryPlay(); document.addEventListener("touchstart", tryPlay, { once: true, passive: true }); }
})();
