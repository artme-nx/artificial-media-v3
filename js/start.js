/* WORK WITH US: forma za upit /start/ (brand/27, brand/28). Jedno pitanje po ekranu; put ovisi o odabiru u koraku 1.
   Odgovori se čuvaju u localStorage (am-start) i brišu nakon slanja ili nakon 7 dana. Sve što posjetitelj upiše ide u stranicu kao tekst, nikad kao HTML. */
(function () {
  "use strict";
  var T = window.AM_START, API = window.AM_START_API || "", KEY = "am-start", WEEK = 7 * 864e5;
  var form = document.getElementById("st-form"), bar = document.getElementById("st-progress"), status = document.getElementById("st-status");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var BACK = '<svg class="st-arr" viewBox="0 0 16 12" aria-hidden="true"><path d="M15 6H2M6.5 1.5 2 6l4.5 4.5"/></svg>';
  var TICK = '<span class="st-tick" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="m2 6.5 2.6 2.6L10 3.4"/></svg></span>';

  function blank() { return { step: "intro", need: { video: false, web: false, other: false }, run: [], time: null, budget: null, note: "", link: "", name: "", email: "", company: "" }; }
  var S = blank(), t0 = 0;
  function save() {
    try { if (!t0) t0 = Date.now(); localStorage.setItem(KEY, JSON.stringify({ t0: t0, s: S })); } catch (e) {}
  }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} t0 = 0; }
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(KEY));
      if (!o || !o.s || !o.t0) return;
      if (Date.now() - o.t0 > WEEK) { clear(); return; }
      var b = blank();
      for (var k in b) if (o.s[k] != null) b[k] = o.s[k];
      S = b; t0 = o.t0;
    } catch (e) {}
  }

  /* ---------- put kroz formu ---------- */
  function path() { return S.need.other ? "other" : S.need.video ? "video" : S.need.web ? "web" : null; }
  function steps() {
    var p = path(), a = ["need"];
    if (p === "video") a.push("run");
    a.push("time");
    if (p === "video" || p === "web") a.push("budget");
    a.push("note", "contact");
    return a;
  }
  function budgetSet() { return S.budget === "x" || (S.budget && S.budget.k === path()); }

  /* ---------- pomoćno ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function title(t) { var end = t.slice(-1); return /[?.]/.test(end) ? esc(t.slice(0, -1)) + '<span class="r">' + end + "</span>" : esc(t); }
  /* glavni gumb, smjer B "REC" (brand/28, I): REC točka i natpis lijevo, desno brojač koraka "02 / 06" (isti n i N kao STEP n / N u zaglavlju) */
  function nextBtn(label, cls, count) {
    return '<button type="button" class="st-btn st-rec ' + (count ? "" : "st-rec--mid ") + (cls || "") + '" data-go="next"><span class="st-rec-l"><i class="st-rec-dot" aria-hidden="true"></i><span>' + esc(label || T.next) + "</span></span>" +
      (count ? '<span class="st-rec-n" aria-hidden="true">' + count + "</span>" : "") + "</button>";
  }
  function two(x) { return (x < 10 ? "0" : "") + x; }
  function backBtn() { return '<button type="button" class="st-back" data-go="back">' + BACK + esc(T.back) + "</button>"; }
  function timeText(i) { return i === 0 ? T.time.stops[0] : "Within " + T.time.stops[i].toLowerCase(); }
  function short(t) {
    t = t.replace(/\s+/g, " ").trim();
    if (t.length <= 90) return t;
    var cut = t.lastIndexOf(" ", 90);
    return t.slice(0, cut > 40 ? cut : 90).replace(/[\s,;:.–—-]+$/, "") + "…";
  }

  /* ---------- ekrani ---------- */
  function screen(step) {
    var list = steps(), n = list.indexOf(step) + 1, N = list.length, p = path(), h = "";
    var count = step === "need" ? "STEP 1" : "STEP " + n + " / " + N;
    var head = '<p class="st-count">' + count + "</p>", rec = two(n) + " / " + two(N);
    if (step === "intro") {
      h = '<p class="st-eyebrow"><i></i>' + esc(T.intro.eyebrow) + "</p>" +
        '<h1 id="st-h" tabindex="-1">' + esc(T.intro.title) + '<span class="r">.</span></h1>' +
        '<p class="st-text">' + esc(T.intro.text) + "</p>" +
        '<div class="st-act">' + nextBtn(T.intro.start, "st-btn--start") + "</div>";
    } else if (step === "need") {
      var N0 = T.need, nd = S.need;
      h = head + '<h1 id="st-h" tabindex="-1">' + title(N0.title) + "</h1>" +
        '<p class="st-hint">' + esc(N0.hint) + "</p>" +
        '<div class="st-need">' +
        '<button type="button" class="st-tile st-tile--big" data-need="video" aria-pressed="' + nd.video + '">' + TICK + '<span class="st-tile-t">' + esc(N0.video.label) + "</span></button>" +
        '<button type="button" class="st-tile" data-need="web" aria-pressed="' + nd.web + '">' + TICK + '<span class="st-tile-k">' + esc(nd.web ? N0.web.on : N0.web.off) + '</span><span class="st-tile-t">' + esc(N0.web.label) + "</span></button>" +
        '<button type="button" class="st-tile" data-need="other" aria-pressed="' + nd.other + '">' + TICK + '<span class="st-tile-k">' + esc(nd.other ? N0.other.on : N0.other.off) + '</span><span class="st-tile-t">' + esc(N0.other.label) + "</span></button>" +
        "</div>" +
        '<div class="st-act">' + (p ? nextBtn(0, 0, rec) : '<p class="st-wait">' + esc(T.choose) + "</p>") + "</div>";
    } else if (step === "run") {
      h = head + '<h1 id="st-h" tabindex="-1">' + title(T.run.title) + "</h1>" +
        '<p class="st-hint">' + esc(T.run.hint) + "</p>" +
        '<div class="st-run">' + T.run.options.map(function (o) {
          return '<button type="button" class="st-tile st-tile--run" data-run="' + o.id + '" aria-pressed="' + (S.run.indexOf(o.id) > -1) + '">' + TICK +
            '<svg class="st-icon" viewBox="0 0 64 64" aria-hidden="true"><path d="' + o.icon + '"/></svg>' +
            '<span class="st-run-l"><span class="st-run-t">' + esc(o.label) + "</span>" + (o.sub ? '<span class="st-run-s">' + esc(o.sub) + "</span>" : "") + "</span></button>";
        }).join("") + "</div>" +
        '<div class="st-act">' + (S.run.length ? nextBtn(0, 0, rec) : '<p class="st-wait">' + esc(T.choose) + "</p>") + backBtn() + "</div>";
    } else if (step === "time") {
      var ticks = "", marks = "", POS = { 0: [170, 24], 1: [234, 38], 6: [282, 290], 9: [100, 318], 14: [58, 48] };
      for (var i = 0; i < 15; i++) { var a = pt(i, 98), b = pt(i, 106); ticks += "M" + a[0] + " " + a[1] + "L" + b[0] + " " + b[1]; }
      T.time.marks.forEach(function (m) { marks += '<text x="' + POS[m[0]][0] + '" y="' + POS[m[0]][1] + '">' + esc(m[1].toUpperCase()) + "</text>"; });
      h = head + '<h1 id="st-h" tabindex="-1">' + title(T.time.title) + "</h1>" +
        '<div class="st-time"><div class="st-dial" role="slider" tabindex="0" aria-label="' + esc(T.time.title) + '" aria-valuemin="0" aria-valuemax="14">' +
        '<svg viewBox="0 0 340 340" aria-hidden="true"><circle class="st-dial-track" cx="170" cy="170" r="118"/><path class="st-dial-ticks" d="' + ticks + '"/>' +
        '<path class="st-dial-arc" d=""/><circle class="st-dial-knob" cx="170" cy="52" r="14"/><g class="st-dial-marks">' + marks + "</g></svg>" +
        '<p class="st-dial-val" aria-hidden="true"><span class="st-dial-lead"></span><span class="st-dial-v"></span></p></div>' +
        '<div class="st-time-side"><p class="st-hint st-hint--dial">' + esc(T.time.drag) + "</p>" +
        '<div class="st-act">' + nextBtn(0, 0, rec) + '<button type="button" class="st-btn st-btn--ghost" data-skip="time">' + esc(T.time.skip) + "</button>" + backBtn() + "</div></div></div>";
    } else if (step === "budget") {
      var B = T.budget[p], idx = budgetSet() && S.budget !== "x" ? S.budget.i : B.start;
      h = head + '<h1 id="st-h" tabindex="-1">' + title(T.budget.title) + "</h1>" +
        '<p class="st-text st-text--sm">' + esc(B.helper) + "</p>" +
        '<div class="st-budget"><p class="st-amount" aria-hidden="true"><span class="st-cur">$</span><span class="st-amount-v">' + esc(B.stops[idx]) + "</span></p>" +
        '<label class="st-label" for="st-range">' + esc(T.budget.drag) + "</label>" +
        '<input id="st-range" class="st-range" type="range" min="0" max="' + (B.stops.length - 1) + '" step="1" value="' + idx + '">' +
        '<div class="st-ends" aria-hidden="true"><span>' + esc(B.lo) + "</span><span>" + esc(B.hi) + "</span></div></div>" +
        '<div class="st-act">' + nextBtn(0, 0, rec) + '<button type="button" class="st-btn st-btn--ghost" data-skip="budget">' + esc(T.budget.skip) + "</button>" + backBtn() + "</div>";
    } else if (step === "note") {
      var req = p === "other";
      h = head + '<h1 id="st-h" tabindex="-1">' + title(T.note.title) + "</h1>" +
        '<div class="st-fields st-fields--one">' +
        '<div class="st-field"><label class="st-label" for="st-note">' + esc(req ? T.note.labelRequired : T.note.label) + "</label>" +
        '<textarea id="st-note" class="st-input st-area" rows="4" maxlength="' + T.note.max + '" placeholder="' + esc(T.note.placeholder[p]) + '"' + (req ? " required" : "") + "></textarea></div>" +
        '<div class="st-field"><label class="st-label" for="st-link">' + esc(T.note.link) + "</label>" +
        '<input id="st-link" class="st-input" type="text" inputmode="url" autocapitalize="off" autocomplete="url" spellcheck="false" maxlength="200"></div></div>' +
        '<div class="st-act">' + nextBtn(0, 0, rec) + backBtn() + "</div>";
    } else if (step === "contact") {
      h = head + '<h1 id="st-h" tabindex="-1">' + title(T.contact.title) + "</h1>" +
        '<form class="st-fields st-fields--contact" id="st-contact" novalidate>' +
        '<div class="st-field"><label class="st-label" for="st-name">' + esc(T.contact.name) + "</label>" +
        '<input id="st-name" class="st-input" type="text" autocomplete="name" maxlength="100" required></div>' +
        '<div class="st-field"><label class="st-label" for="st-email">' + esc(T.contact.email) + "</label>" +
        '<input id="st-email" class="st-input" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" maxlength="200" required></div>' +
        '<div class="st-field st-field--wide"><label class="st-label" for="st-company">' + esc(T.contact.company) + "</label>" +
        '<input id="st-company" class="st-input" type="text" autocomplete="organization" maxlength="120"></div>' +
        '<div class="st-hp" aria-hidden="true"><label>Fax<input id="st-fax" type="text" name="fax" tabindex="-1" autocomplete="off"></label></div>' +
        "</form>" +
        '<div class="st-legal"><p>' + esc(T.contact.reply) + "</p><p>" + T.contact.privacy + "</p></div>" +
        '<div class="st-act">' + nextBtn(T.contact.send, "st-btn--send") + backBtn() + "</div>" +
        '<p class="st-error" id="st-error" role="alert" hidden></p>';
    } else if (step === "sent") {
      h = sentScreen();
    }
    return '<section class="st-scr st-scr--' + step + '" aria-labelledby="st-h">' + h + "</section>";
  }

  function rows() {
    var p = path(), R = T.sent.rows, out = [];
    var need = S.need.other ? T.need.other.summary : [S.need.video && T.need.video.summary, S.need.web && T.need.web.summary].filter(Boolean).join(" + ");
    out.push([R.need, need]);
    if (p === "video") out.push([R.run, T.run.options.filter(function (o) { return S.run.indexOf(o.id) > -1; }).map(function (o) { return o.label; }).join(", ")]);
    out.push([R.time, S.time === "x" ? T.time.skip : timeText(S.time)]);
    if (p === "video" || p === "web") out.push([R.budget, S.budget === "x" ? T.budget.skip : "$" + T.budget[p].stops[S.budget.i]]);
    return out;
  }
  function sentScreen() {
    return '<div class="st-sent"><div class="st-sent-main"><p class="st-count st-count--sent">' + esc(T.sent.status.toUpperCase()) + "</p>" +
      '<h1 id="st-h" tabindex="-1"><span class="st-sent-t"></span><span class="r">.</span></h1>' +
      '<dl class="st-sum"></dl>' +
      '<a class="st-btn st-btn--ghost st-home" href="../#next">' + esc(T.sent.home) + "</a></div>" +
      '<div class="st-next"><h2 class="st-eyebrow"><i></i>' + esc(T.sent.nextTitle) + "</h2><ol>" +
      T.sent.next.map(function (t, i) { return '<li><span class="st-next-n">0' + (i + 1) + "</span><span>" + esc(t) + "</span></li>"; }).join("") +
      "</ol></div></div>";
  }
  function fillSent(sum) {
    form.querySelector(".st-sent-t").textContent = T.sent.title + sum.name;
    var dl = form.querySelector(".st-sum");
    sum.rows.forEach(function (r) {
      var d = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
      dt.textContent = r[0]; dd.textContent = r[1]; d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
    });
    if (sum.note) {
      var d = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
      d.className = "st-sum-note"; dt.textContent = T.sent.rows.note; dd.textContent = short(sum.note); d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
    }
  }

  /* ---------- krug za rok ---------- */
  function pt(i, r) { var a = i * (320 / 14) * Math.PI / 180; return [+(170 + r * Math.sin(a)).toFixed(1), +(170 - r * Math.cos(a)).toFixed(1)]; }
  function dialIdx() { return typeof S.time === "number" ? S.time : 0; }
  function drawDial() {
    var d = form.querySelector(".st-dial"); if (!d) return;
    var set = typeof S.time === "number", i = dialIdx(), k = pt(i, 118), deg = i * 320 / 14;
    d.classList.toggle("is-unset", !set);
    d.querySelector(".st-dial-arc").setAttribute("d", set && i > 0 ? "M170 52A118 118 0 " + (deg > 180 ? 1 : 0) + " 1 " + k[0] + " " + k[1] : "");
    d.querySelector(".st-dial-knob").setAttribute("cx", k[0]);
    d.querySelector(".st-dial-knob").setAttribute("cy", k[1]);
    d.querySelector(".st-dial-lead").textContent = (i === 0 ? T.time.leadFirst : T.time.lead).toUpperCase();
    d.querySelector(".st-dial-v").textContent = T.time.stops[i].toUpperCase();
    d.setAttribute("aria-valuenow", i);
    d.setAttribute("aria-valuetext", set ? timeText(i) : T.time.drag);
    var nx = form.querySelector('[data-go="next"]');
    nx.disabled = !set;
  }
  function setTime(i) { S.time = Math.max(0, Math.min(14, i)); save(); drawDial(); }
  function bindDial() {
    var d = form.querySelector(".st-dial"), svg = d.querySelector("svg"), drag = false;
    function idxAt(e, moving) {
      var r = svg.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var a = Math.atan2(dx, -dy) * 180 / Math.PI, last = dialIdx(), i;
      if (a < 0) a += 360;
      if (a > 320) i = moving ? (last >= 7 ? 14 : 0) : (a > 340 ? 0 : 14);   // 40° praznine: s kraja se ne preskače na početak
      else i = Math.round(a / 320 * 14);
      if (moving && typeof S.time === "number") {
        if (last >= 11 && i <= 3) i = 14;
        else if (last <= 3 && i >= 11) i = 0;
      }
      return i;
    }
    d.addEventListener("pointerdown", function (e) {
      if (e.button > 0) return;
      e.preventDefault(); d.focus({ preventScroll: true });
      try { d.setPointerCapture(e.pointerId); } catch (x) {}
      drag = true; d.classList.add("is-drag"); setTime(idxAt(e, false));
    });
    d.addEventListener("pointermove", function (e) { if (drag) setTime(idxAt(e, true)); });
    function end() { drag = false; d.classList.remove("is-drag"); }
    d.addEventListener("pointerup", end); d.addEventListener("pointercancel", end); d.addEventListener("lostpointercapture", end);
    d.addEventListener("keydown", function (e) {                       // svaka tipka na krugu je odabir, i kad vrijednost ostane ista (brand/28, H1)
      var i = dialIdx(), map = { ArrowRight: i + 1, ArrowUp: i + 1, ArrowLeft: i - 1, ArrowDown: i - 1, PageUp: i + 3, PageDown: i - 3, Home: 0, End: 14 };
      if (e.key in map) { e.preventDefault(); setTime(map[e.key]); return; }
      if ((e.key === "Enter" || e.key === " ") && typeof S.time !== "number") { e.preventDefault(); e.stopPropagation(); setTime(i); }
    });
    drawDial();
  }

  /* ---------- traka za budžet ---------- */
  function bindBudget() {
    var p = path(), B = T.budget[p], r = form.querySelector("#st-range"), v = form.querySelector(".st-amount-v"), nx = form.querySelector('[data-go="next"]');
    function draw(set) {
      var i = +r.value;
      v.textContent = B.stops[i];
      r.setAttribute("aria-valuetext", "$" + B.stops[i]);
      r.style.setProperty("--fill", (i / (B.stops.length - 1) * 100) + "%");
      form.querySelector(".st-budget").classList.toggle("is-unset", !set);
      nx.disabled = !set;
    }
    function pick() { S.budget = { k: p, i: +r.value }; save(); draw(true); }
    r.addEventListener("input", pick); r.addEventListener("change", pick);
    r.addEventListener("pointerdown", pick);                              // dodir na ručicu bez pomaka je odabir (brand/28, H1)
    r.addEventListener("keydown", function (e) {
      if (e.key === "Tab" || e.key === "Shift") return;
      if (!(S.budget && S.budget.k === p) && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.stopPropagation(); }
      pick();
    });
    draw(S.budget && S.budget !== "x" && S.budget.k === p);
  }

  /* ---------- prikaz ---------- */
  function show(step, dir) {
    var list = steps();
    if (step !== "intro" && step !== "sent" && list.indexOf(step) < 0) step = "need";
    S.step = step;
    if (step !== "sent") save();
    form.innerHTML = screen(step);
    document.body.setAttribute("data-st", step);
    var n = list.indexOf(step) + 1, N = list.length;
    if (step === "intro" || step === "sent") { bar.hidden = true; status.textContent = step === "sent" ? T.sent.status.toUpperCase() : T.status.toUpperCase(); }
    else {
      var pc = step === "need" ? 15 : Math.round(15 + (n - 1) * 85 / (N - 1));
      bar.hidden = false; bar.setAttribute("aria-valuenow", pc); bar.firstChild.style.width = pc + "%";
      status.textContent = step === "need" ? "STEP 1" : "STEP " + n + " / " + N;
    }
    if (step === "time") bindDial();
    if (step === "budget") bindBudget();
    if (step === "note") { form.querySelector("#st-note").value = S.note; form.querySelector("#st-link").value = S.link; }
    if (step === "contact") { form.querySelector("#st-name").value = S.name; form.querySelector("#st-email").value = S.email; form.querySelector("#st-company").value = S.company; }
    if (dir) {
      var sec = form.firstChild;
      if (!reduce.matches) sec.classList.add(dir < 0 ? "st-in-back" : "st-in");
      if (form.getBoundingClientRect().top < 0) window.scrollTo(0, 0);
      var h = document.getElementById("st-h"); if (h) h.focus({ preventScroll: true });
    }
  }
  /* ---------- povijest preglednika (brand/28, L.1): svaki korak je unos u povijesti (stanje, ne adresa); Natrag/Naprijed i gumb "Back" rade isto ---------- */
  var ORDER = ["intro", "need", "run", "time", "budget", "note", "contact"], sent = false, toStart = false;
  function depth() { return history.state && typeof history.state.d === "number" ? history.state.d : 0; }
  function mark(step, push) {                                            // push: novi korak naprijed; inače se zamijeni trenutni unos
    if (!history.pushState) return;
    try { if (push) history.pushState({ st: step, d: depth() + 1 }, ""); else history.replaceState({ st: step, d: depth() }, ""); } catch (e) {}
  }
  function fit(st) {                                                      // korak iz povijesti koji u trenutnom putu ne postoji: najbliži raniji koji postoji
    if (st === "intro" || st === "need") return st;
    if (!path() || ORDER.indexOf(st) < 0) return "need";                 // bez odabira u koraku 1 dalje se ne može
    var list = steps(), i = ORDER.indexOf(st);
    while (i > 1 && list.indexOf(ORDER[i]) < 0) i--;
    return ORDER[i];
  }
  function forward(step) { show(step, 1); mark(step, true); }
  window.addEventListener("popstate", function (e) {
    var h = e.state; if (!h || !h.st) return;
    if (toStart) { toStart = false; show("intro", 0); mark("intro", false); return; }
    if (sent) {                                                           // nakon slanja: nikad ispunjena forma; povijest forme se preskoči do uvoda
      sent = false; show("intro", -1);
      if (h.d > 0) { toStart = true; history.go(-h.d); } else mark("intro", false);
      return;
    }
    var step = fit(h.st);
    show(step, ORDER.indexOf(step) < ORDER.indexOf(S.step) ? -1 : 1);
    if (step !== h.st) mark(step, false);
  });

  function go(d) {
    var list = steps(), i = list.indexOf(S.step);
    if (S.step === "intro") return forward("need");
    if (d < 0) {                                                          // gumb "Back" = strelica preglednika, bez dvostrukih unosa
      if (depth() > 0) return history.back();
      var prev = i > 0 ? list[i - 1] : "intro";
      show(prev, -1); mark(prev, false); return;
    }
    if (!valid()) return;
    if (S.step === "contact") {
      if (path() === "other" && !S.note.trim()) { show("note", -1); mark("note", false); return valid(); }   // obavezan opis preskočen strelicom Naprijed
      return send();
    }
    forward(list[i + 1]);
  }
  function valid() {
    var st = S.step;
    if (st === "need") return !!path();
    if (st === "run") return S.run.length > 0;
    if (st === "time") return S.time != null;
    if (st === "budget") return budgetSet();
    if (st === "note") { var t = form.querySelector("#st-note"); if (!t.checkValidity() || (t.required && !t.value.trim())) { t.value = t.value.trim(); t.reportValidity(); t.focus(); return false; } return true; }
    if (st === "contact") {
      var f = form.querySelector("#st-contact"), nm = form.querySelector("#st-name");
      nm.value = nm.value.replace(/\s+/g, " ").trim(); S.name = nm.value;
      return f.reportValidity();
    }
    return true;
  }

  /* ---------- slanje ---------- */
  function send() {
    var btn = form.querySelector(".st-btn--send"), err = form.querySelector("#st-error"), p = path();
    var body = {
      need: ["video", "web", "other"].filter(function (k) { return S.need[k]; }),
      run: p === "video" ? S.run.slice() : [],
      time: S.time,
      budget: p === "video" || p === "web" ? (S.budget === "x" ? "x" : S.budget.i) : null,
      note: S.note.trim(), link: S.link.trim(),
      name: S.name, email: S.email.trim(), company: S.company.trim(),
      fax: form.querySelector("#st-fax").value
    };
    var sum = { name: S.name, rows: rows(), note: body.note };
    btn.disabled = true; btn.setAttribute("aria-busy", "true"); err.hidden = true;
    (API ? fetch(API + "/briefs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) : Promise.reject(new Error("no api")))
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); })
      .then(function () {
        clear(); S = blank(); S.step = "sent";
        show("sent", 1); fillSent(sum); sent = true; mark("sent", false);
      })
      .catch(function () {
        btn.disabled = false; btn.removeAttribute("aria-busy");
        err.innerHTML = T.error; err.hidden = false;                       // tekst greške je naš (js/start-data.js), ne posjetiteljev
      });
  }

  /* ---------- događaji ---------- */
  form.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || b.disabled) return;
    if (b.dataset.go) return go(b.dataset.go === "back" ? -1 : 1);
    if (b.dataset.skip) { S[b.dataset.skip] = "x"; save(); return forward(steps()[steps().indexOf(S.step) + 1]); }
    if (b.dataset.need) {
      var k = b.dataset.need;
      if (k === "other") S.need = { video: false, web: false, other: !S.need.other };
      else { S.need[k] = !S.need[k]; S.need.other = false; }
      save(); return redraw();
    }
    if (b.dataset.run) {
      var id = b.dataset.run, alone = T.run.options.filter(function (o) { return o.alone; }).map(function (o) { return o.id; });
      var on = S.run.indexOf(id) > -1;
      if (alone.indexOf(id) > -1) S.run = on ? [] : [id];
      else S.run = (on ? S.run.filter(function (x) { return x !== id; }) : S.run.concat(id)).filter(function (x) { return alone.indexOf(x) < 0; });
      save(); return redraw();
    }
  });
  function redraw() {                                                        // isti ekran nakon odabira pločice: fokus ostaje na istoj pločici
    var a = document.activeElement, sel = a && a.dataset && (a.dataset.need ? '[data-need="' + a.dataset.need + '"]' : a.dataset.run ? '[data-run="' + a.dataset.run + '"]' : null);
    show(S.step, 0);
    if (sel) form.querySelector(sel).focus();
  }
  form.addEventListener("input", function (e) {
    var id = e.target.id, map = { "st-note": "note", "st-link": "link", "st-name": "name", "st-email": "email", "st-company": "company" };
    if (map[id]) { S[map[id]] = e.target.value; save(); }
  });
  form.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || e.isComposing) return;
    var t = e.target, tag = t.tagName;
    if (tag === "BUTTON" || tag === "A" || tag === "SUMMARY" || (tag === "TEXTAREA" && e.shiftKey)) return;
    e.preventDefault();
    var nx = form.querySelector('[data-go="next"]');
    if (S.step === "sent" || !nx || nx.disabled) return;
    go(1);
  });

  load();
  var h0 = history.state;
  if (t0 && h0 && h0.st && h0.st !== "sent") S.step = fit(h0.st);         // Natrag/Naprijed s druge stranice: korak iz povijesti (odgovori su iz preglednika)
  if (!t0) S.step = "intro";                                              // nema spremljenih odgovora (poslano ili isteklo): uvod
  show(S.step, 0);
  mark(S.step, false);
})();
