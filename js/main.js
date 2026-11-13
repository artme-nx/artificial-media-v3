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
   7) Drugi slide (19. 10. 2026.; 10. 11.: ulazak na jedan pokret, Bands): tri trake s videom nakon zuma; slide sa scenarijem je isključen (SCREENPLAY).
   Boje: pozadina je papir za scenarij (boja + zrno iz img/paper.png), crvena je REC crvena. */
(function () {
  "use strict";
  /* Prekidači za tri trake (brand/45 D2, Kristian, 13. 11. 2026.). Vraćanje na staro: jedna riječ u jednom retku.
     Izmjereno u Chromeu (kadrovi u 2,7 s ulaska, 160 = glatko): video trake od ulaska 86, uz zaustavljen hero 108, video tek kad sve sjednu 160. */
  var BAND_VIDEO_ON_ENTER = true;    // true: video trake krene čim ta traka počne ulaziti; false: staro, videi krenu kad sve tri sjednu
  var HERO_STOP_ON_BANDS = false;    // true: video heroja stane čim trake počnu ulaziti; pali se samo na Kristianov zahtjev
  var AUTO_ADVANCE = true;           // true: pred kraj videa heroja, traka, WHERE ART ili WHO WE ARE? stranica sama napravi korak dolje, toliko ranije koliko traje odlazak ekrana (brand/45 E2, F1); false: kao prije
  var L = window.AM_LOGO;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s) { return document.querySelector(s); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { return t * t * (3 - 2 * t); };

  /* ---------- hero: slova kao rupe u sivom pokrovu ---------- */
  var svg = $("#cover"), letters = $("#letters"), maskRect = $("#mask-rect"), coverRect = $("#cover-rect");
  var hero = $(".hero"), hint = $("#hint"), bar = $("#bar");
  var next = $("#next");                                               // završni ekran (tri pločice) ispod THE WORK
  var work = $("#work"), why = $("#why");                             // THE WORK ispod ekrana WHO WE ARE?, iza njega #why (brand/35 F)
  // osvježavanje početne uvijek kreće od heroja, i s #next u adresi (brand/28, J); dolazak linkom s #next ostaje na pločicama
  // Natrag i Naprijed (brand/28, K): u povijesti preglednika stoji je li posjetitelj bio na pločicama ili ispod njih (history.state.end); povratak strelicom to vrati
  var NAV = window.performance && performance.getEntriesByType ? performance.getEntriesByType("navigation")[0] : null, RELOAD = !!NAV && NAV.type === "reload";
  var BACKFWD = !!NAV && NAV.type === "back_forward";
  function markEnd(v) {                                                   // zapis u povijest (i bez #next u adresi); samo kad se promijeni
    if (!history.replaceState) return;
    var st = history.state || {};
    if (!!st.end === v && !location.hash) return;
    history.replaceState({ end: v }, "", location.pathname + location.search);
  }
  if (RELOAD) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    markEnd(false);
  }
  var AT_END = !!next && !RELOAD && (location.hash === "#next" || (BACKFWD && !!history.state && !!history.state.end));   // link s #next (logo, "Back to the homepage"; H2–H3) ili Natrag/Naprijed s pločica (K): odmah završni ekran
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
    if (CARDS) hero.style.height = (Math.floor((ZOOM_VH + 3) * vh) + vh) + "px";   // kraj heroja na cijelom pikselu: WHO WE ARE? i #work leže točno preko pozornice
    var cb = $("#cards"), bh = Math.round(vh / 3);                // visine traka na cijelom pikselu, da tekst nakon sjedanja bude oštar
    if (cb) { cb.style.setProperty("--band-h", bh + "px"); cb.style.setProperty("--band-h3", (vh - 2 * bh) + "px"); }
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

  /* ---------- drugi slide: tri trake ----------
     Karta k stoji na k/3 visine ekrana. Svaka karta ima svoj video, s object-fit: cover u sredini (CSS; brand/37).
     Trake ulaze na vrijeme (Bands, dolje), a ne na scroll. q (0–3) služi još samo za slobodan scroll (smanjeni pokret) i zaključak. */
  // video trake (brand/37): do 640 px card-N-m (4:3) i njegov poster, inače card-N (21:9) s posterom card-N.jpg; bira se jednom, pri učitavanju, pa se učita samo jedna
  var bandM = window.matchMedia("(max-width: 640px)").matches;
  [].forEach.call(document.querySelectorAll(".card-v[data-src]"), function (v) {
    var b = v.getAttribute("data-src") + (bandM ? "-m" : "");
    v.poster = b + ".jpg"; v.src = b + ".mp4";
  });
  var cards = [].slice.call(document.querySelectorAll(".card")).map(function (el) {
    return { el: el, v: el.querySelector(".card-v"), on: false, playing: false };
  });
  var heroVideo = $(".hero-video"), heroCovered = false;
  function playV(v) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
  var AUTO = AUTO_ADVANCE && !reduce;                                   // uz smanjeni pokret ništa ne ide samo (i videi ostaju u petlji)
  function fromStart(v) { if (AUTO && v && v.currentTime > 0.04) { try { v.currentTime = 0; } catch (e) {} } }   // povratak na ekran: video ispočetka (samo uz AUTO_ADVANCE); već na početku: bez premotavanja (brand/45 G2)
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
      HOLD: 500,          // od kraja ulaska rečenice do SCROLL-a (Kristian, 12. 11.: s 1500 na 500; brand/35 E)
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
      later(function () { set("open", true); set("out", true); fromStart(v); playV(v); }, T.FADE);   // trake krenu, video uđe
      var end = T.FADE + 2 * T.STEP + T.OUT;                            // zadnja traka je otišla
      later(function () { setGone(true); }, end);
      later(function () { set("in", true); }, end + T.IN_DELAY);        // rečenica
      if (done) later(done, end + T.IN_DELAY + T.IN + T.HOLD);          // SCROLL
    }
    function back(done) {                                               // trake se vraćaju (donja, srednja, gornja)
      if (state !== "out") return; state = "back";
      timers.forEach(clearTimeout); timers = []; box.classList.remove("ready");
      cards.forEach(function (c, k) {                                  // trake se vraćaju: videi krenu zajedno, svaki od točke s koje završe zajedno (brand/45 F2)
        if (AUTO) { try { c.v.currentTime = (cards.length - 1 - k) * Bands.step / 1000; } catch (e) {} }
      });
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
    function instant() {                                                // #next: blok WHERE ART već otvoren, bez animacije
      if (!el) return; state = "out"; ["fade", "open", "out", "in"].forEach(function (c) { set(c, true); }); gone = true;
    }
    return {
      restart: function () { fromStart(v); },                           // povratak na blok WHERE ART (s WHO WE ARE?): video ispočetka
      start: start, back: back, view: view, instant: instant, outMs: T.FADE + 2 * T.STEP + T.OUT,   // odlazak traka (ms): sam korak (Flow)
      busy: function () { return state !== "idle"; },                  // trake vani ili se vraćaju
      out: function () { return state === "out"; },
      gone: function () { return gone; }
    };
  })();
  /* tri trake ulaze same (Kristian, 10. 11. 2026.; brand/21): jedan pokret nakon zuma pokrene sve tri, vodoravno, jednu za drugom:
     gornja s lijeve strane, srednja s desne, donja s lijeve. Prema gore izlaze obrnutim redom, svaka na stranu s koje je došla.
     Kretanje je u CSS-u (klasa seat na .card, tranzicija dok je klasa bands na .cards); ovdje su samo redoslijed i vremena.
     Prvi kadar svake trake je unaprijed dekodiran (primeVideo), pa nema crnog polja ni skoka s postera. Kada video krene, određuje BAND_VIDEO_ON_ENTER
     (na vrhu): s ulaskom trake ili kad sve tri sjednu. Više videa u pokretu ruši kadrove ulaska (mjerenja uz prekidače). */
  var SLIDE = { IN: 1050, WHO: 1050, EASE: "cubic-bezier(.16, 1, .3, 1)" };   // ulazak traka i polovica WHO WE ARE?: trajanje (ms) i krivulja (Kristian, 10. 11. 2026.)
  function primeVideo(v) {                                              // prvi kadar unaprijed dekodiran, bez zamjene postera tijekom ulaska
    if (!v || reduce) return;
    var pr = v.play();
    if (pr && pr.then) pr.then(function () { v.pause(); }, function () {});
  }
  var Bands = (function () {
    var T = {
      IN: SLIDE.IN,       // jedna traka ulazi ili izlazi
      STEP: SLIDE.IN - 250   // razmak između startova traka: sljedeća kreće 0,25 s prije nego prethodna sjedne
    };
    var box = $("#cards"), timers = [], covered = false, entered = 0, END = T.IN + 2 * T.STEP;
    if (box) { box.style.setProperty("--band-in", T.IN + "ms"); box.style.setProperty("--band-ease", SLIDE.EASE); }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function show(c, on) { c.el.classList.toggle("seat", on); }
    function finish(done) { box.classList.remove("bands"); onScroll(); if (done) done(); }
    function ready(fn) { requestAnimationFrame(function () { requestAnimationFrame(fn); }); }   // slojevi (will-change) gotovi prije prvog pomaka
    function enter(done) {                                              // 1, 2, 3; video trake krene s njom ili kad sve sjednu (BAND_VIDEO_ON_ENTER); kad sve sjednu, hero stane
      box.classList.add("bands");
      if (HERO_STOP_ON_BANDS && heroVideo) heroVideo.pause();
      Who.preload();
      cards.forEach(function (c) { fromStart(c.v); });
      ready(function () {
        cards.forEach(function (c, k) { later(function () { if (BAND_VIDEO_ON_ENTER) c.on = true; show(c, true); entered = k + 1; onScroll(); }, k * T.STEP); });
        later(function () { cards.forEach(function (c) { c.on = true; }); covered = true; finish(done); }, END);
      });
    }
    function leave(done) {                                              // 3, 2, 1; videi traka stanu, a video heroja krene, jer se opet vidi
      box.classList.add("bands"); covered = false; cards.forEach(function (c) { c.on = false; }); onScroll();
      ready(function () {
        cards.forEach(function (c, k) {
          var at = (cards.length - 1 - k) * T.STEP;
          later(function () { show(c, false); entered = k; onScroll(); }, at);
        });
        later(function () { finish(done); }, END);
      });
    }
    function instant(on) {                                              // smanjeni pokret: bez klizanja
      if (on === covered) return;
      cards.forEach(function (c) { show(c, on); c.on = on; });
      covered = on; entered = on ? cards.length : 0;
    }
    return { enter: enter, leave: leave, instant: instant, covered: function () { return covered; }, entered: function () { return entered; },
      inMs: END, step: T.STEP };                                        // ulazak sve tri (ms) i razmak između traka: sam korak (Flow) i povratak traka (Sum.back)
  })();
  /* WHO WE ARE? (Kristian, 10. 11. 2026.; brand/22): ekran leži preko bloka WHERE ART i ulazi u dvije polovice (video odozdo, papir odozgo), bez vožnje stranice.
     Kretanje je u CSS-u (klasa in na #split-2). Dok ekran stoji, ispod njega se smije vidjeti #work (klasa under; brand/35 F). */
  var Who = (function () {
    var T = {
      IN: SLIDE.WHO,     // polovice uđu ili izađu
      HOLD: 500          // od kraja ulaska do SCROLL-a (isto kao na bloku WHERE ART, Sum; brand/35 E)
    };
    var el = $("#split-2"), v = el && el.querySelector(".split-v"), under = work, state = "off", hintT = 0;
    if (el) { el.style.setProperty("--who-in", T.IN + "ms"); el.style.setProperty("--who-ease", SLIDE.EASE); }
    function set(s) { state = s; onScroll(); }
    function hint(on) { clearTimeout(hintT); el.classList.toggle("ready", on); }   // SCROLL (pokret dalje ne ovisi o njemu)
    function enter(done) {
      set("coming"); el.classList.add("moving");
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        el.classList.add("in");
        setTimeout(function () { el.classList.remove("moving"); set("in"); fromStart(v); playV(v); if (under) under.classList.add("under"); hintT = setTimeout(function () { hint(true); }, T.HOLD); if (done) done(); }, T.IN);
      }); });
    }
    function leave(done) {
      set("going"); hint(false); if (v) v.pause(); if (under) under.classList.remove("under"); el.classList.add("moving");
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        el.classList.remove("in");
        setTimeout(function () { el.classList.remove("moving"); set("off"); if (done) done(); }, T.IN);
      }); });
    }
    function instant() { if (!el) return; el.classList.add("in"); state = "in"; if (under) under.classList.add("under"); }   // #next: polovice već stoje
    /* video oka cijeli u memoriji prije nego što polovice uđu (brand/45 G2): mobilni Safari ne učitava video unaprijed, pa bi se punio tek kad krene.
       Dohvat počne kad trake uđu (WHO WE ARE? je najmanje dva ekrana dalje); zamjena izvora samo dok ekran nije ni blizu, uz dekodiranu prvu sličicu. */
    var preloaded = false;
    function preload() {
      if (preloaded || !v || reduce || !window.fetch || !window.URL || !URL.createObjectURL) return; preloaded = true;
      fetch(v.currentSrc || v.src).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); }).then(function (b) {
        if (state !== "off") return;                                    // ekran već ulazi ili stoji: ostaje izvorna adresa
        var t = v.currentTime; v.src = URL.createObjectURL(b); v.load(); if (t) { try { v.currentTime = 0; } catch (e) {} }
        primeVideo(v);
      }).catch(function () {});
    }
    return { enter: enter, leave: leave, hint: hint, instant: instant, preload: preload, covers: function () { return state === "in"; }, inMs: T.IN };
  })();
  function renderCards(q, inView) {
    if (!CARDS) return;
    if (reduce) Bands.instant(q > 0);
    cards.forEach(function (c) {
      var show = c.on && inView && !Sum.gone();                         // video se vrti samo dok se traka vidi
      if (show && !c.playing) { c.playing = true; playV(c.v); } else if (!show && c.playing) { c.playing = false; c.v.pause(); }
    });
    // trake su sjele: u zaključanom tijeku Sum pokreće Flow; slobodan scroll (nakon SCROLL, smanjeni pokret) ovdje
    if (q < 3 - 2 / vh) Sum.back(); else if (Flow.free()) Sum.start();
    Sum.view(inView && !(Who && Who.covers()));                                  // ispod ekrana WHO WE ARE? video bloka WHERE ART stoji (brand/45 G: na mobitelu dva videa odjednom zapinju)
    document.documentElement.classList.toggle("cards-dark", inView && Bands.covered());   // traka za scrollbar uz tamne karte; tek kad trake stoje, ne usred pokreta
    Sound.videoLevel(1 - Bands.entered() / cards.length);               // zvuk heroja se utiša kako trake prekrivaju video
    var covered = Bands.covered() || !inView;                           // hero video stoji kad se ne vidi
    if (heroVideo && covered !== heroCovered) { heroCovered = covered; if (covered) heroVideo.pause(); else playV(heroVideo); }
  }

  // crna traka (Kristian, 10. 11. 2026.): tek kad se otvori THE WORK (brand/35 F) i dalje; ekrani prije nemaju traku
  function renderBar() {
    var on = reduce ? work.getBoundingClientRect().top <= 1 : hero.getBoundingClientRect().bottom < vh - 1 || (Door && Door.isOpen());
    bar.classList.toggle("on", on);
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
     Hero (Kristian, 10. 11. 2026.): jedan pokret (kotačić, trackpad, prst, tipka) pokrene sve: zum u slovo D odvrti se sam (T.ZOOM), a čim video ispuni ekran,
     uđu tri trake (Bands, oko 2 s). Stranica tada skoči na zaustavljanje C3 (pozornica heroja stoji, pa se skok ne vidi). Dok sve traje, pokreti se upiju.
     Jedan pokret prema gore: trake izađu i zum se odvrti natrag do heroja.
     Nakon treće trake (Kristian, 19. 10. 2026.: "neka se zaključa na 3-4 sekunde da stigne pogledati i pročitati")
     prema dolje se ništa ne miče 0,6 s (SEAT_HOLD). Onda SCROLL, i novi pokret prema dolje pošalje trake (Sum); dok odlaze i rečenica
     ulazi, sve se upija, a 0,5 s nakon rečenice opet SCROLL. Prvi pokret prema dolje (ili klik na SCROLL) tada dovede ekran WHO WE ARE? u dvije polovice (Who),
     sljedeći ga razdvoji i otkrije THE WORK (#work, Door; redoslijed od 13. 11., brand/35 F), pa jedan pokret
     glatko doveze #why (četiri reda dođu sama, Why), sljedeći završni ekran (#next); tamo sljedeći otključa stranicu prema footeru.
     Na mobitelu je #work viši od ekrana: otključa se već s #work, a #why i #next su običan scroll (redovi #why krenu kad se ekran vidi).
     Prema gore ekran po ekran; iz slobodnog scrolla natrag iznad zadnjeg zaustavljanja tijek se opet zaključa na njemu.
     Vodoravni pokreti (trackpad, prst po ploči s projektima) ne broje se kao korak.
     Jedan pokret = jedan korak u cijelom tijeku; rep inercije trackpada se ne broji (wheelNew).
     Uz scenarij (SCREENPLAY) jedino zaustavljanje je naslov, a otključa se kad se tekst otipka i marker dovrši.
     Uz "smanjeni pokret" u sustavu ništa se ne zaključava. */
  var Flow = (function () {
    var root = document.documentElement, locked = false, phase = reduce ? "free" : "hero", touchY = null, touchFresh = false;
    var target = 0, cur = 0, running = false, last = 0, SPEED = ZOOM_VH / 1.8;   // brzina zuma u visinama ekrana po sekundi
    var idx = 0, arrived = 0, lastWheel = 0, tweenEnd = 0, tweening = false;
    var T = {
      ZOOM: 1800,        // zum u slovo D odvrti se sam (naprijed i natrag)
      TWEEN: 900,        // vožnja stranice na #why, #next i natrag
      SEAT_HOLD: 600     // tri trake sjele: mir do SCROLL-a
    };
    var GAP = 250, holdT = 0, recent = [];
    var C3 = 3;                                                          // zaustavljanje s tri trake (i bloka WHERE ART); iza njega WHO WE ARE?
    var screens = [].slice.call(document.querySelectorAll(".split-screen"));
    var W3 = C3 + screens.length;                                        // WHO WE ARE? (vrata #work, isti položaj kao C3); iza njega #why i #next, ako stanu u ekran
    var cardsEl = document.getElementById("cards"), goEl = document.getElementById("cards-go"), whoGoEl = document.getElementById("who-go");
    var canStep = false;                                                 // smije li pokret dolje dalje (ne ovisi o tome vidi li se SCROLL)
    function setReady(v) { canStep = v; if (cardsEl) cardsEl.classList.toggle("ready", v); }   // isti trenutak: korak dozvoljen + SCROLL
    function isReady() { return canStep; }
    function atC3() { return phase === "hero" && idx === C3 && !tweening; }
    function onSumDone() { if (atC3()) setReady(true); }
    function seatHold() {                                                // treća karta sjela (ili su se trake vratile): 0,6 s mira, pa SCROLL
      clearTimeout(holdT); holdT = setTimeout(function () { if (atC3() && !Sum.busy()) setReady(true); }, T.SEAT_HOLD);
    }
    function zoomTo(to, done) {                                          // zum se odvrti sam (tweening = sve se upija)
      var from = cur, t0 = performance.now();
      tweening = true; running = false;
      (function f(now) {
        var k = Math.min(1, (now - t0) / T.ZOOM);
        cur = target = from + (to - from) * smooth(k);
        window.scrollTo(0, cur);
        if (k < 1) requestAnimationFrame(f); else done();
      })(t0);
    }
    function heroIn() {                                                  // jedan pokret na heroju: zum, pa odmah tri trake
      setReady(false); clearTimeout(holdT);
      zoomTo(stops()[0], bandsIn);
    }
    function bandsIn() {                                                 // tri trake uđu same
      idx = C3; cur = target = stops()[C3]; running = false; tweening = true; setReady(false); clearTimeout(holdT);
      window.scrollTo(0, cur);
      Bands.enter(function () { tweening = false; tweenEnd = arrived = performance.now(); seatHold(); });
    }
    function bandsOut() {                                                // jedan pokret gore: sve tri izađu, pa se zum odvrti natrag do heroja
      tweening = true; setReady(false); clearTimeout(holdT); fromStart(heroVideo);
      Bands.leave(function () {
        cur = target = stops()[0]; window.scrollTo(0, cur);
        zoomTo(0, function () { idx = 0; tweening = false; tweenEnd = arrived = performance.now(); });
      });
    }
    function whoIn() {                                                   // s bloka WHERE ART: polovice WHO WE ARE? uđu, stranica stoji
      idx = W3; cur = target = stops()[W3]; tweening = true; setReady(false); clearTimeout(holdT);
      window.scrollTo(0, cur);
      Who.enter(function () { tweening = false; tweenEnd = arrived = performance.now(); });
    }
    function whoOut() {                                                  // natrag na blok WHERE ART: polovice izađu putem kojim su došle
      tweening = true; Sum.restart();
      Who.leave(function () { idx = C3; tweening = false; tweenEnd = arrived = performance.now(); setReady(true); });
    }
    function fromC3() {                                                  // korak dolje s tri trake: prvo blok WHERE ART, zatim WHO WE ARE?
      setReady(false); clearTimeout(holdT);
      if (!Sum.busy()) Sum.start(onSumDone); else if (screens.length) whoIn(); else leave();
    }
    function leave() {                                                   // s posljednjeg ekrana: otključa, dalje običan scroll (#next)
      setReady(false); clearTimeout(holdT);
      phase = "free"; setLock(false);
      var atEnd = next && Math.abs(window.scrollY - next.offsetTop) < 2;
      var to = next && !atEnd ? next.offsetTop : document.documentElement.scrollHeight;   // sa završnog ekrana: do footera
      if (work && idx === W3 && work.offsetHeight > vh + 1) to = Math.min(to, window.scrollY + vh * 0.6);   // mobitel: #work je viši od ekrana, dalje se lista
      window.scrollTo({ top: to, behavior: "smooth" });
    }
    function fromWork() {                                                // THE WORK otvoren (SCROLL): na #why, ili otpuštanje (mobitel)
      if (idx === W3 && stops().length - 1 > W3) tweenTo(W3 + 1); else leave();
    }
    function atWhy(i) { return Why && i === W3 + 1 && stops().length - 1 > W3; }   // #why kao zaustavljanje (desktop)
    function setLock(v) { locked = v; root.classList.toggle("locked", v); }
    function stops() {
      if (!CARDS) return [loop.offsetTop];
      var t = hero.offsetTop, S = [t + ZOOM_VH * vh, t + (ZOOM_VH + 1) * vh, t + (ZOOM_VH + 2) * vh, Math.floor(t + (ZOOM_VH + 3) * vh)];   // C3 na cijelom pikselu: pozornica stoji točno na vrhu, pa je tekst oštar
      screens.forEach(function () { S.push(S[C3]); });                   // WHO WE ARE? leži na istom položaju kao C3
      if (work && work.offsetHeight <= vh + 1) {                          // THE WORK leži ispod WHO WE ARE? (W3); na mobitelu je viši od ekrana, pa je dalje običan scroll
        if (why) S.push(why.offsetTop);                                  // #why (brand/35 F)
        if (next) S.push(next.offsetTop);                                // završni ekran
      }
      return S;
    }
    function ease(t) { return 1 - Math.pow(1 - t, 3); }                  // odmah krene, mekano stane
    function tweenTo(i) {                                                // glatko do zaustavljanja i (karta, ili cijela stranica na ekran)
      var S = stops(), from = cur, to = S[i], t0 = performance.now();
      idx = i; tweening = true; running = false; setReady(false); clearTimeout(holdT);
      (function f(now) {
        var k = Math.min(1, (now - t0) / T.TWEEN);
        cur = from + (to - from) * ease(k); target = cur;
        window.scrollTo(0, cur);
        if (k < 1) requestAnimationFrame(f);
        else {
          tweening = false; tweenEnd = arrived = performance.now();
          if (i === C3) { if (Sum.busy()) setReady(true); else seatHold(); }   // treća karta sjela: 0,6 s mira, pa SCROLL; natrag s ekrana 2: odmah
          if (atWhy(i)) Why.enter();                                      // #why: redovi dođu sami (s #next natrag: već stoje)
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
      if (phase !== "hero" || tweening) return;                          // dok se zum, trake ili ekran voze, ostatak zamaha se upije
      if (CARDS && idx === 0) { if (dy > 0 && isNew) heroIn(); return; }  // hero: jedan pokret pokrene zum i trake
      var S = stops(), now = performance.now();
      var atStop = CARDS && Math.abs(cur - S[idx]) < 1;
      if (atStop) {
        if (idx === C3 && !Sum.busy() && !canStep) return;               // treća karta tek sjela (ili su se trake vratile): mir, sve se upija
        if (dy > 0) {
          if (!isNew) return;                                             // jedan pokret = jedan korak
          if (idx === C3) { if (canStep) fromC3(); return; }              // blok WHERE ART, pa WHO WE ARE? (dok trake odlaze i rečenica ulazi: upija se)
          if (idx === W3) {                                               // WHO WE ARE? se razdvoji i otkrije #work, pa dalje na #why
            if (!Door) fromWork(); else if (Door.busy()) return; else if (!Door.isOpen()) Door.open(); else fromWork();
            return;
          }
          if (atWhy(idx) && !Why.ready()) return;                         // redovi #why još dolaze: upije se
          if (idx < S.length - 1) tweenTo(idx + 1);                       // s #why na završni ekran
          else leave();                                                   // zadnje zaustavljanje: otpuštanje (footer; na mobitelu dalje s #work)
          return;
        }
        if (dy < 0 && idx > 0) {
          if (!isNew) return;
          if (idx === C3 && Sum.busy()) {                                 // prvo se vrate trake; tek sljedeći pokret spusti kartu
            if (Sum.out()) { setReady(false); clearTimeout(holdT); Sum.back(function () { tweenEnd = performance.now(); seatHold(); }); }
            return;
          }
          if (idx === C3) { bandsOut(); return; }                         // trake izađu, ostane video heroja
          if (idx === W3 && Door && Door.busy()) return;                  // razdvajanje ili sastavljanje još traje: upije se
          if (idx === W3 && Door && Door.isOpen()) { Door.close(); return; }   // #work: WHO WE ARE? se sastavi
          if (idx === W3) { whoOut(); return; }                           // polovice izađu, ostane blok WHERE ART
          if (atWhy(idx) && !Why.ready()) return;                         // redovi #why još dolaze: upije se (i prema gore)
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
    if (whoGoEl) whoGoEl.addEventListener("click", function () {
      if (phase === "hero" && idx === W3 && !tweening && Door && !Door.busy() && !Door.isOpen()) Door.open();
    });
    if (goEl) goEl.addEventListener("click", function () {
      if (atC3() && isReady()) fromC3();
    });
    // natrag iz slobodnog scrolla: čim se vrati iznad zadnjeg zaustavljanja, tijek se opet zaključa na njemu (dalje gore ekran po ekran)
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
    /* sam korak (brand/45 E2): kad video ekrana odvrti krug, isti korak kao pokret dolje (push), uz iste uvjete.
       Kreće samo ako je taj ekran i dalje trenutni; ako korak još nije dopušten (prijelaz, SCROLL još nije spreman), čeka; skrivena kartica čeka. */
    var autoWant = "", autoT = 0;
    function screenNow() {
      if (phase !== "hero" || !CARDS) return "";
      if (idx === 0) return "hero";
      if (idx === C3) return Sum.busy() ? "sum" : "bands";
      if (idx === W3) return Door && Door.isOpen() ? "work" : "who";
      return "";
    }
    function stepOk(s) {
      if (tweening) return false;
      if (s === "hero") return true;                                     // push na heroju pokrene zum i trake (kao pokret)
      if (Math.abs(cur - stops()[idx]) >= 1) return false;
      if (s === "bands" || s === "sum") return canStep;
      return Who.covers() && Door && !Door.busy() && !Door.isOpen();     // who
    }
    function autoTry() {
      clearTimeout(autoT);
      if (!autoWant) return;
      if (screenNow() !== autoWant) { autoWant = ""; return; }           // posjetitelj je otišao dalje ili natrag: za taj ekran ništa
      if (document.hidden) return;                                       // skrivena kartica: čeka (visibilitychange)
      if (!stepOk(autoWant)) { autoT = setTimeout(autoTry, 150); return; }
      autoWant = ""; push(vh, 1e9, true);
    }
    /* korak kreće toliko prije kraja videa koliko traje odlazak ekrana (+100 ms), pa se video vrti dok se ekran miče (brand/45 F1).
       Vremena se računaju iz konstanti modula. Ako korak ne smije odmah, video ide dalje u petlji, a korak krene čim smije (autoTry). */
    function leadMs(s) {
      if (s === "hero") return T.ZOOM + Bands.inMs + 100;                 // zum i ulazak sve tri trake
      if (s === "bands") return Sum.outMs + 100;                          // trake odu
      if (s === "sum") return Who.inMs + 100;                             // WHO WE ARE? uđe
      if (s === "who") return (Door ? Door.splitMs : 0) + 100;            // vrata se razdvoje
      return 0;
    }
    function left(vs) {                                                  // koliko videu (najduljem, za trake) ostaje do kraja kruga, s; -1 = ne vrti se
      var m = -1, any = false;
      vs.forEach(function (v) { if (!v || !v.duration) return; if (!v.paused) any = true; m = Math.max(m, v.duration - v.currentTime); });
      return any ? m : -1;
    }
    var armed = "";
    function autoCheck(vids) {
      var s = screenNow();
      if (s !== armed) { armed = s; autoFired = false; }                 // novi ekran (ili povratak): pravilo vrijedi ponovno
      if (!AUTO || autoFired || !vids[s]) return;
      var r = left(vids[s]);
      if (r >= 0 && r * 1000 <= leadMs(s)) { autoFired = true; autoWant = s; autoTry(); }
    }
    var autoFired = false;
    document.addEventListener("visibilitychange", autoTry);
    function toEnd() {                                                   // #next: kao da su prođeni svi ekrani; gore se ide ekran po ekran, kao inače
      if (reduce || !CARDS) { window.scrollTo(0, next.offsetTop); return; }
      Bands.instant(true); Sum.instant(); if (screens.length) Who.instant(); if (Door) Door.instant(); if (Why) Why.instant();
      var S = stops(), L = S.length - 1;
      tweening = false; setReady(false); clearTimeout(holdT); tweenEnd = arrived = performance.now();
      if (Math.abs(S[L] - next.offsetTop) < 1) { phase = "hero"; idx = L; cur = target = S[L]; setLock(true); }   // desktop: završni ekran je zadnje zaustavljanje
      else { phase = "free"; idx = L; cur = target = S[L]; setLock(false); }                                   // mobitel: iza #work je običan scroll
      window.scrollTo(0, next.offsetTop);
    }
    return {
      toEnd: toEnd,
      scriptDone: function (ms) { setTimeout(function () { phase = "free"; setLock(false); }, (ms || 0) + 250); },
      free: function () { return phase === "free"; },
      release: function () {                                             // klik na SCROLL u #work (→ #why) i u #why (→ #next)
        if (phase !== "hero" || tweening) return;
        if (idx === W3) { if (!Door || Door.isOpen()) fromWork(); return; }
        if (atWhy(idx) && !Why.ready()) return;
        if (idx < stops().length - 1) tweenTo(idx + 1); else leave();
      },
      state: function () { return phase + ":" + idx + ":" + Math.round(cur); },
      screen: screenNow, autoCheck: autoCheck, lead: leadMs,
      held: function () { return arrived ? Math.round(performance.now() - arrived) : -1; }
    };
  })();
  window.AM_FLOW = Flow;                                              // za provjeru u testovima
  if (AUTO && CARDS) {                                                  // pred kraj videa ekrana: sam korak (Flow.autoCheck); videi ostaju u petlji
    var autoVids = { hero: [heroVideo], bands: cards.map(function (c) { return c.v; }), sum: [$("#sum .split-v")], who: [$("#split-2 .split-v")] };
    (function autoLoop() { Flow.autoCheck(autoVids); requestAnimationFrame(autoLoop); })();   // svaki kadar; u skrivenoj kartici preglednik ga sam uspava
  }

  /* ---------- vrata: WHO WE ARE? se razdvoji i otkrije THE WORK (brand/35 F, 13. 11. 2026.; prije je otkrivao #why) ----------
     Jedan pokret (Flow) razdvoji ekran (video gore, papir dolje; CSS, klasa apart) i otkrije #work, koji leži ispod njega.
     Dok se razdvaja ili sastavlja, pokreti se upiju. Pokret gore na #work: WHO WE ARE? se sastavi. #work zna da se vidi po klasi revealed (js/reels.js). */
  var Door = (function () {
    var door = $("#split-2");
    if (!door || !work || !CARDS) return null;
    var SPLIT = 900;                                                     // razdvajanje i sastavljanje (cubic-bezier(0.65, 0, 0.35, 1), u CSS-u)
    door.style.setProperty("--why-split", SPLIT + "ms");
    var open = false, busyUntil = 0, t = 0, dv = door.querySelector(".split-v");
    function reveal(v) { work.classList.toggle("revealed", v); work.dispatchEvent(new Event("am:reveal")); }
    function move() { clearTimeout(t); door.classList.add("moving"); t = setTimeout(function () { door.classList.remove("moving"); }, SPLIT); busyUntil = performance.now() + SPLIT; }
    function doOpen() {
      open = true; Who.hint(false); door.classList.add("apart"); move(); reveal(true); onScroll();
      setTimeout(function () { if (open && dv) dv.pause(); }, SPLIT);   // vrata otvorena: video oka se više ne vidi i stoji (brand/45 G2)
    }
    function close() {                                                   // #work natrag pod vrata; #why se vrati na početak (redovi opet dođu sami)
      fromStart(dv); if (dv && !reduce) playV(dv);                       // povratak na WHO WE ARE?: video ispočetka i u pokretu (sam korak opet tek pred kraj)
      open = false; reveal(false); door.classList.remove("apart"); move(); onScroll();
      if (Why) Why.reset();
      setTimeout(function () { if (!open) Who.hint(true); }, SPLIT);
    }
    function instant() { open = true; door.classList.add("apart"); reveal(true); }   // #next: WHO WE ARE? razdvojen, #work otkriven
    return { open: doOpen, close: close, instant: instant, isOpen: function () { return open; }, busy: function () { return performance.now() < busyUntil; }, splitMs: SPLIT };
  })();
  window.AM_DOOR = Door;

  /* ---------- zašto AI produkcija (#why, Kristian, 29. 10. 2026.; iza THE WORK od 13. 11., brand/35 F) ----------
     Jedan pokret s #work doveze #why (Flow); kad stoji, redovi 1–4 dođu SAMI, jedan za drugim (Kristian, 29. 10. 2026.: posjetitelj više ne scrolla red po red).
     Red: fade s pomakom, a brojke se odbroje od 0 do vrijednosti i trake narastu do svoje širine, u istom trajanju. Novi red krene ROW_GAP nakon prethodnog (preklapaju se).
     Footnote dođe sa zadnjim redom. Dok redovi dolaze, svi pokreti se upiju (i prema gore). Zatim SCROLL i jedan pokret dolje vodi na #next.
     Povratak s #next ili s #work: sve već stoji. Kad se WHO WE ARE? sastavi (Door), redovi se vrate na početak.
     Na mobitelu (slobodan scroll iza #work) redovi krenu kad se ekran vidi. Nazivi, brojke, oznake i footnote su u js/why-data.js (10. 11. 2026.). */
  var Why = (function () {
    var sec = why, D = window.AM_WHY_DATA;
    if (!sec || !CARDS || !D) return null;
    var T = {
      ROW_GAP: 350,      // novi red krene toliko nakon što je prethodni krenuo
      IN: 400,           // red uđe (fade, pomak 16 px)
      COUNT: 600,        // brojke se odbroje i trake iscrtaju (ease-out)
      COUNT_SLOW: 1100,  // isto, za redove sa slow: true u js/why-data.js (veliki iznosi)
      OUT: 300,          // natrag na početak: svi redovi zajedno nestanu; trajanje je u CSS-u (.why-row)
      HOLD: 600          // od kraja zadnjeg reda do SCROLL-a
    };
    [["--why-in", T.IN], ["--why-count", T.COUNT]].forEach(function (d) { sec.style.setProperty(d[0], d[1] + "ms"); });
    var rows = [].slice.call(sec.querySelectorAll(".why-row")), go = $("#why-go"), note = $("#why-note");
    var shown = false, busyUntil = 0, timers = [], ready = false;     // shown: redovi su krenuli (dolaze ili stoje)
    function show(v, cell) {                                             // dvije znamenke; iznos: točka za tisuće, od 0.000 naviše
      var s = String(v), min = cell.money ? 4 : 2;
      while (s.length < min) s = "0" + s;
      return cell.money ? s.slice(0, -3) + "." + s.slice(-3) : s;
    }
    // tablica iz podataka; trake: veća vrijednost u redu = 100 %, manja = manja / veća (najmanja širina je u CSS-u)
    rows.forEach(function (row, i) {
      var d = D.rows[i], cells = [d.trad, d.am], max = Math.max(d.trad.value, d.am.value);
      if (d.slow) { row.style.setProperty("--why-count", T.COUNT_SLOW + "ms"); row.style.setProperty("--why-ease", "cubic-bezier(.65, 0, .35, 1)"); }
      row.querySelector(".why-dim").textContent = d.dim;
      row.querySelector(".why-sub").textContent = d.better;
      [].forEach.call(row.querySelectorAll(".why-cell"), function (el, k) {
        el.querySelector(".why-val").textContent = show(cells[k].value, cells[k]);
        el.querySelector(".why-unit").textContent = cells[k].unit || "";
        el.querySelector(".why-from").textContent = cells[k].above || "";
        el.querySelector(".why-bar b").style.setProperty("--f", max > 0 ? cells[k].value / max : 0);
      });
    });
    (function () {
      var a = document.createElement("a");
      a.href = D.note.link.href; a.target = "_blank"; a.rel = "noopener"; a.textContent = D.note.link.text;
      note.textContent = "";
      note.append(D.note.before, a, D.note.after);
    })();
    function count(row, d) {                                             // 0 → vrijednost, cijeli brojevi; krivulja je ista kao kod traka (CSS). slow: kreće polako, da se vidi start od nule
      var els = [].slice.call(row.querySelectorAll(".why-val")), cells = [d.trad, d.am], t0 = performance.now();
      (function f(now) {
        if (!row.classList.contains("on")) return;                      // red je u međuvremenu otišao
        var k = clamp((now - t0) / (d.slow ? T.COUNT_SLOW : T.COUNT), 0, 1), e = !d.slow ? 1 - Math.pow(1 - k, 3) : k < .5 ? 4 * k * k * k : 1 - Math.pow(2 - 2 * k, 3) / 2;
        els.forEach(function (el, i) { var n = cells[i].value; el.textContent = show(k < 1 ? Math.round(n * e) : n, cells[i]); });
        if (k < 1) requestAnimationFrame(f);
      })(t0);
    }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function setReady(v) { ready = v; sec.classList.toggle("ready", v); }
    function enter() {                                                   // #why stoji: redovi sami, pa SCROLL (ako su već došli, ništa)
      if (shown) return;
      shown = true;
      var end = (rows.length - 1) * T.ROW_GAP + Math.max(T.IN, T.COUNT) + T.HOLD;
      rows.forEach(function (row, k) { later(function () { row.classList.add("on"); count(row, D.rows[k]); if (k === rows.length - 1) note.classList.add("on"); }, k * T.ROW_GAP); });
      later(function () { setReady(true); }, end);
      busyUntil = performance.now() + end;
    }
    function reset() {                                                   // WHO WE ARE? se sastavio: redovi zajedno nestanu (T.OUT)
      if (reduce) return;
      timers.forEach(clearTimeout); timers = []; setReady(false); shown = false; busyUntil = 0;
      rows.forEach(function (row) { row.classList.remove("on"); });
      note.classList.remove("on");
    }
    if (reduce) { shown = true; rows.forEach(function (row) { row.classList.add("on"); }); note.classList.add("on"); setReady(true); }   // smanjeni pokret: sve odmah, bez odbrojavanja i crtanja, SCROLL odmah
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) {   // slobodan scroll (mobitel): redovi krenu kad se ekran vidi
      if (es[0].intersectionRatio >= 0.5 && Flow.free()) enter();
    }, { threshold: [0, 0.5] }).observe(sec);
    if (go) go.addEventListener("click", function () {
      if (!ready) return;
      if (Flow.free() && next) window.scrollTo({ top: next.offsetTop, behavior: "smooth" }); else Flow.release();
    });
    function instant() {                                                 // #next: svi redovi stoje, SCROLL
      timers.forEach(clearTimeout); timers = []; shown = true; busyUntil = 0; note.classList.add("on");
      rows.forEach(function (row, k) { row.classList.add("on"); count(row, D.rows[k]); });
      setReady(true);
    }
    return { enter: enter, reset: reset, instant: instant, ready: function () { return ready && performance.now() >= busyUntil; }, busy: function () { return performance.now() < busyUntil; },
      state: function () { return (shown ? sec.querySelectorAll(".why-row.on").length : "zatvoren") + (ready ? "+SCROLL" : ""); } };
  })();
  window.AM_WHY = Why;

  /* ---------- završni ekran: pločice uđu kad se ekran pojavi (velika prva; CSS, klase wait i in) ----------
     Pozadina pločice (Kristian, 10. 11. 2026.; brand/24): video/tiles/<ime>.mp4 i/ili .jpg (data-media na .end-media). Što postoji, to se prikaže; bez datoteka pločica ostaje tamna.
     Videi krenu tek kad pločice uđu (više videa u pokretu ruši kadrove, vidi Bands) i vrte se samo dok se vide. Uz smanjeni pokret stoje na posteru. */
  (function () {
    if (!next || !("IntersectionObserver" in window)) return;
    var ENTER = 1250, started = false, vids = [];                        // ENTER: pločice su ušle (animacija i zadnja odgoda, CSS)
    function sync() { vids.forEach(function (v) { if (v.seen && started && !reduce) playV(v); else v.pause(); }); }
    var seenIO = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.seen = e.isIntersecting; }); sync(); });
    function exists(url) { return fetch(url, { method: "HEAD" }).then(function (r) { return r.ok; }, function () { return false; }); }
    function attach(box) {
      var base = box.getAttribute("data-media");
      Promise.all([exists(base + ".mp4"), exists(base + ".jpg")]).then(function (has) {
        var el;
        if (has[0]) {
          el = document.createElement("video");
          el.muted = true; el.loop = true; el.playsInline = true; el.preload = "metadata"; el.setAttribute("aria-hidden", "true");
          if (has[1]) el.poster = base + ".jpg";
          el.src = base + ".mp4";
          vids.push(el); seenIO.observe(el);
        } else if (has[1]) { el = new Image(); el.alt = ""; el.src = base + ".jpg"; }
        if (el) { box.appendChild(el); box.parentNode.classList.add("has-media"); }
      });
    }
    var nearIO = new IntersectionObserver(function (es) {                // datoteke se traže tek kad je ekran blizu
      if (!es[0].isIntersecting) return;
      nearIO.disconnect();
      [].forEach.call(next.querySelectorAll(".end-media"), attach);
    }, { rootMargin: "100% 0px" });
    nearIO.observe(next);
    if (!reduce && !AT_END) next.classList.add("wait");                  // s #next pločice već stoje
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      next.classList.remove("wait"); if (!AT_END) next.classList.add("in");
      setTimeout(function () { started = true; sync(); }, ENTER);
    }, { threshold: 0.2 });
    io.observe(next);
  })();

  /* ---------- WHO WE ARE? (27. 10. 2026.): video se vrti samo dok se ekran vidi ---------- */
  (function () {
    var vs = [].slice.call(document.querySelectorAll(".split-screen .split-v"));
    if (!vs.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (!e.isIntersecting) e.target.pause(); else if (reduce || Who.covers()) playV(e.target);   // dok polovice ulaze, video stoji (Who ga pokrene kad sjednu)
    }); });
    vs.forEach(function (v) { io.observe(v); });
  })();

  /* ---------- petlja crtanja ---------- */
  var ticking = false;
  function update() {
    ticking = false;
    if (CARDS) {
      var hr = hero.getBoundingClientRect(), sc = -hr.top;
      renderHero(clamp(sc / (ZOOM_VH * vh), 0, 1));
      renderCards(clamp((sc - ZOOM_VH * vh) / vh, 0, 3), hr.bottom > 1 && !Who.covers());
    } else renderHero(progressOf(hero));
    if (SCREENPLAY) renderLoop(progressOf(loop));
    renderBar();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { layout(); onScroll(); Marks.redraw(); });
  layout(); update();
  var barLogo = bar && bar.querySelector(".bar-logo");                // logo u crnoj traci (WHY, THE WORK): završni ekran s tri pločice, kao na podstranicama (brand/28, H4)
  if (barLogo && next) barLogo.addEventListener("click", function (e) {
    e.preventDefault(); AT_END = true; next.classList.remove("wait"); Flow.toEnd();
  });
  if (next) window.addEventListener("scroll", function () { markEnd(window.scrollY + window.innerHeight / 2 >= next.offsetTop); }, { passive: true });   // pločice zauzimaju sredinu ekrana, ili je ispod njih (footer)
  window.addEventListener("pageshow", function (e) {                     // povratak iz memorije preglednika (bfcache, osobito Safari)
    if (!e.persisted || !next) return;
    if (history.state && history.state.end) { AT_END = true; next.classList.remove("wait"); Flow.toEnd(); }
    else if (window.scrollY > 0) location.reload();                      // otišao s ranijeg ekrana: hero, kao kod osvježavanja (J)
  });
  window.addEventListener("hashchange", function () {                   // #next upisan dok je početna već otvorena: isto kao dolazak linkom
    if (location.hash !== "#next" || !next) return;
    AT_END = true; next.classList.remove("wait"); Flow.toEnd(); markEnd(true);
  });
  if (RELOAD) {                                                          // preglednik bi sam skočio na staro mjesto ili na #next: natrag na vrh, dok posjetitelj ništa ne dirne
    var fresh = true, top = function () { if (fresh && window.scrollY) window.scrollTo(0, 0); };
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (t) { window.addEventListener(t, function () { fresh = false; }, { once: true, passive: true }); });
    window.scrollTo(0, 0); window.addEventListener("load", top); setTimeout(top, 0);
  }
  if (AT_END) {
    Flow.toEnd();
    markEnd(true);                                                       // bez #next u adresi: osvježavanje opet otvara hero (J), a Natrag pločice (K)
    var touched = false;
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (t) { window.addEventListener(t, function () { touched = true; }, { once: true, passive: true }); });
    var reEnd = function () { if (!touched) Flow.toEnd(); };                   // THE WORK, pisma i slike mijenjaju raspored (i točke zaustavljanja) do učitavanja
    setTimeout(reEnd, 0);
    window.addEventListener("load", reEnd);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reEnd);
  }
  window.addEventListener("load", function () {                          // prvi kadrovi se dekodiraju kad je stranica učitana, a ne usred pokreta
    if (CARDS) { cards.forEach(function (c) { primeVideo(c.v); }); primeVideo($("#split-2 .split-v")); }
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(update);

  // video: neki preglednici ne pokrenu autoplay sami
  var v = $(".hero-video");
  if (v) { var tryPlay = function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }; tryPlay(); document.addEventListener("touchstart", tryPlay, { once: true, passive: true }); }
})();
