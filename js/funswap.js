/* FUNSWAP: put kupca (brand/26): galerija (funswap/), tri fotografije (funswap/photos/), status narudžbe (funswap/thanks/).
   Plaćanje je na Stripeovoj stranici; podaci o kartici ne prolaze kroz ovu stranicu. Odabir i ID narudžbe čuvaju se u sessionStorage i u adresi (?o=). */
(function () {
  "use strict";
  var cfg = window.AM_FUNSWAP, list = window.AM_FUNSWAP_VIDEOS || [], KEY = "am-funswap", $ = function (s) { return document.querySelector(s); };
  function read() { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(o) { try { sessionStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function api(path, opts) {
    return fetch(cfg.api + path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.error || "Request failed"); e.status = r.status; throw e; } return j; });
    });
  }
  function json(body) { return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }; }
  function fail(el, text) { el.textContent = text; el.hidden = false; }
  function media(f) { return !f || /^(https?:)?\//.test(f) ? f : cfg.api + "/gallery/" + f; }   // datoteka iz R2 servisa (js/funswap-data.js)
  list.forEach(function (v) { v.src = media(v.src); v.poster = media(v.poster); });
  function setThumb(el, v) { el.style.backgroundImage = v && v.poster ? "url('" + v.poster + "')" : ""; }

  /* ---------- 1. galerija ---------- */
  function gallery() {
    var grid = $("#fs-grid"), chips = $("#fs-chips"), more = $("#fs-more"), err = $("#fs-err"), wide = window.matchMedia("(min-width: 1024px)");
    var state = read(), filter = "", shown = [], rendered = 0, sel = null, tiles = {};
    var player = document.createElement("video");                        // jedan video za cijelu galeriju: nikad se ne vrte dva
    player.muted = true; player.loop = true; player.playsInline = true; player.setAttribute("playsinline", ""); player.preload = "none"; player.className = "fs-player";
    $("#fs-count").textContent = "FUNSWAP · €25 incl. VAT · " + list.length + (list.length === 1 ? " video" : " videos");
    var cats = list.map(function (v) { return v.category; }).filter(function (c, i, a) { return c && a.indexOf(c) === i; });
    if (cats.length >= 2) {
      chips.hidden = false;
      [""].concat(cats).forEach(function (c) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "fs-chip"; b.textContent = c || "All " + list.length; b.setAttribute("aria-pressed", String(c === filter));
        b.addEventListener("click", function () {
          filter = c; [].forEach.call(chips.children, function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          reset();
        });
        chips.appendChild(b);
      });
    }
    function batch() { return wide.matches ? 15 : 9; }
    function stop() { player.pause(); player.removeAttribute("src"); player.load(); if (player.parentNode) player.parentNode.removeChild(player); [].forEach.call(grid.children, function (t) { t.classList.remove("playing"); }); }
    function tile(v) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "fs-tile"; b.setAttribute("aria-label", "Video " + v.number + (v.name ? ", " + v.name : "")); b.setAttribute("aria-pressed", "false");
      var html = v.poster ? '<img loading="lazy" alt="" src="' + v.poster + '">' : "";
      html += '<span class="fs-tile-n">' + v.number + '</span><span class="fs-badge" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#0A0A0A" stroke-width="2"><path d="m2 6.5 2.6 2.6L10 3.4"/></svg></span>';
      html += '<span class="fs-play" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 12 12" fill="#F4F3EF"><path d="M3 1.5v9l7.5-4.5z"/></svg></span>';
      html += '<span class="fs-tile-b"><span></span><span class="fs-tile-d">' + (v.duration || "") + "</span></span>";
      b.innerHTML = html;
      b.querySelector(".fs-tile-b span").textContent = v.name || "";
      b.addEventListener("click", function () { choose(v, b); });
      tiles[v.id] = b;
      return b;
    }
    function fill() {
      var end = Math.min(rendered + batch(), shown.length);
      for (; rendered < end; rendered++) { var t = tile(shown[rendered]); grid.appendChild(t); if (sel && sel.id === shown[rendered].id) mark(t); }
      var left = rendered < shown.length;
      more.textContent = left ? rendered + " of " + shown.length + " · scroll for more" : "";
      more.hidden = !left;
    }
    function reset() {
      stop(); grid.innerHTML = ""; tiles = {}; rendered = 0;
      shown = list.filter(function (v) { return !filter || v.category === filter; });
      fill();
    }
    function mark(t) { [].forEach.call(grid.children, function (x) { x.classList.toggle("on", x === t); x.setAttribute("aria-pressed", String(x === t)); }); }
    function show(v) {
      sel = v;
      $("#fs-bar-n").innerHTML = 'No<span class="r">.</span> ' + v.number; setThumb($("#fs-bar-thumb"), v);
      $("#fs-go").disabled = false; $("#fs-use").disabled = false;
      $("#fs-use-t").textContent = "Use video No. " + v.number; $("#fs-stage-n").textContent = v.number;
    }
    function choose(v, t) {
      var same = sel && sel.id === v.id;
      if (same && !player.paused) { player.pause(); t.classList.remove("playing"); return; }
      show(v); mark(t);
      if (!same || !player.getAttribute("src")) { stop(); player.src = v.src; if (v.poster) player.poster = v.poster; else player.removeAttribute("poster"); }
      var host = wide.matches ? $("#fs-stage") : t;
      if (player.parentNode !== host) host.appendChild(player);
      t.classList.add("playing");
      var pr = player.play(); if (pr && pr.catch) pr.catch(function () {});
    }
    function go() {
      if (!sel) return;
      err.hidden = true; $("#fs-go").disabled = $("#fs-use").disabled = true;
      api("/orders", json({ video: sel.id, number: sel.number })).then(function (j) {
        write({ o: j.id, id: sel.id, number: sel.number, poster: sel.poster || "", uploaded: {} });
        location.href = "photos/?o=" + encodeURIComponent(j.id);
      }).catch(function () {
        fail(err, "Something went wrong. Please try again."); $("#fs-go").disabled = $("#fs-use").disabled = false;
      });
    }
    $("#fs-go").addEventListener("click", go); $("#fs-use").addEventListener("click", go);
    reset();
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting && rendered < shown.length) fill(); }, { rootMargin: "300px" }).observe(more);
    wide.addEventListener("change", stop);
    if (state.id) { var was = list.filter(function (v) { return v.id === state.id; })[0]; if (was) { show(was); while (!tiles[was.id] && rendered < shown.length) fill(); if (tiles[was.id]) mark(tiles[was.id]); } }
  }

  /* ---------- 2. tri fotografije ---------- */
  function photos() {
    var q = new URLSearchParams(location.search), state = read(), o = q.get("o") || state.o;
    if (!o) { location.replace("../"); return; }
    if (state.o !== o) state = { o: o, uploaded: {} };
    state.uploaded = state.uploaded || {}; state.thumbs = state.thumbs || {}; write(state);   // thumbs: male sličice poslanih fotografija, samo u ovoj kartici (brand/28, L.2)
    var slots = [].slice.call(document.querySelectorAll(".fs-slot")), checks = [].slice.call(document.querySelectorAll("[data-fs-checks] input")), err = $("#fs-photo-err"), payErr = $("#fs-pay-err"), pay = $("#fs-pay"), missing = $("#fs-missing"), busy = 0;
    if (state.number) { $("#fs-card-n").innerHTML = 'No<span class="r">.</span> ' + state.number; setThumb($("#fs-card-thumb"), state); }
    function count() { return slots.filter(function (s) { return state.uploaded[s.dataset.slot]; }).length; }
    function sync() {
      var n = count(), ticks = checks.every(function (c) { return c.checked; }), ok = n === 3 && ticks && !busy;
      pay.hidden = !ok; missing.hidden = ok;
      if (!ok) missing.textContent = busy ? "Uploading your photo…" : n < 3 ? "Add " + (3 - n) + (3 - n === 1 ? " more photo" : " more photos") + " to continue" : "Tick all four boxes to continue";
    }
    function paint(slot, on, label) { slot.classList.toggle("on", on); slot.querySelector(".fs-slot-a").textContent = label; }
    function toJpeg(f) {                                                  // svaka fotografija, i HEIC, prolazi kroz canvas: najviše maxSide, uspravno, JPEG (Higgsfield ne prima HEIC)
      var url = URL.createObjectURL(f), img = new Image();
      return new Promise(function (res, rej) { img.onload = res; img.onerror = rej; img.src = url; }).then(function () {
        var m = Math.max(img.naturalWidth, img.naturalHeight), k = Math.min(1, cfg.maxSide / m), c = document.createElement("canvas"), g = c.getContext("2d");
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);   // bijela podloga: PNG može biti proziran
        return new Promise(function (res, rej) { c.toBlob(function (b) { if (b) res(b); else rej(); }, "image/jpeg", 0.9); });
      }).then(function (b) { URL.revokeObjectURL(url); return b; }, function () { URL.revokeObjectURL(url); throw new Error("read"); });
    }
    function clear(slot) { var box = slot.querySelector(".fs-shot"); if (box.firstChild) { if (box.firstChild.src.indexOf("blob:") === 0) URL.revokeObjectURL(box.firstChild.src); box.removeChild(box.firstChild); } }
    function restart() {                                                  // narudžba je istekla (sat vremena bez aktivnosti): nova narudžba za isti video, fotografije iznova
      if (!state.id) { location.replace("../"); return; }
      return api("/orders", json({ video: state.id, number: state.number })).then(function (j) {
        o = state.o = j.id; state.uploaded = {}; state.thumbs = {}; write(state);
        history.replaceState(null, "", "?o=" + encodeURIComponent(o));
        slots.forEach(function (s) { clear(s); paint(s, false, "Add photo"); });
        fail(err, "Your photos were deleted after an hour without activity. Please add them again."); sync();
      });
    }
    function thumb(slot, blob) {
      var box = slot.querySelector(".fs-shot"), img = new Image();
      clear(slot); img.alt = "";
      img.src = URL.createObjectURL(blob); box.appendChild(img);
    }
    function small(blob) {                                                // sličica ~200 px po duljoj strani, za povratak na ovu stranicu (Natrag, Naprijed, refresh)
      var url = URL.createObjectURL(blob), img = new Image();
      return new Promise(function (res) { img.onload = res; img.onerror = res; img.src = url; }).then(function () {
        URL.revokeObjectURL(url);
        if (!img.naturalWidth) return "";
        var k = Math.min(1, 200 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        try { return c.toDataURL("image/jpeg", 0.7); } catch (e) { return ""; }
      });
    }
    function restore(slot, data) { var box = slot.querySelector(".fs-shot"), img = new Image(); clear(slot); img.alt = ""; img.src = data; box.appendChild(img); }
    slots.forEach(function (slot) {
      var input = slot.querySelector("input"), name = slot.dataset.slot;
      if (state.uploaded[name]) { paint(slot, true, "Replace"); if (state.thumbs[name]) restore(slot, state.thumbs[name]); }   // bez sličice ostaje samo "Replace"
      input.addEventListener("change", function () {
        var f = input.files[0]; input.value = ""; err.hidden = true;
        if (!f) return;
        delete state.uploaded[name]; delete state.thumbs[name]; write(state); paint(slot, false, "Uploading…"); slot.classList.add("busy"); busy++; sync();
        var mini = "";
        toJpeg(f).then(function (b) {
          if (b.size > cfg.maxPhotoMB * 1048576) throw new Error("big");
          thumb(slot, b);
          return small(b).then(function (d) { mini = d; return api("/orders/" + encodeURIComponent(o) + "/photos/" + name, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: b }); });
        }).then(function () {
          state.uploaded[name] = true; if (mini) state.thumbs[name] = mini; write(state); paint(slot, true, "Replace");
        }).catch(function (e) {
          clear(slot); paint(slot, false, "Add photo");
          if (e.status === 410) return restart();
          fail(err, e.message === "read" ? "We could not read this photo. Please choose a JPG or PNG." : e.message === "big" ? "That photo is too large. The limit is " + cfg.maxPhotoMB + " MB." : "That photo could not be uploaded. Please try again.");
        }).then(function () { slot.classList.remove("busy"); busy--; sync(); });
      });
    });
    checks.forEach(function (c) { c.addEventListener("change", sync); });
    pay.addEventListener("click", function () {
      payErr.hidden = true; pay.disabled = true;
      api("/orders/" + encodeURIComponent(o) + "/checkout", json({ adult: true, consent: true, photosUse: true, withdrawal: true })).then(function (j) { location.href = j.url; }).catch(function (e) {
        if (e.status === 409) { location.replace("../thanks/?o=" + encodeURIComponent(o)); return; }   // već plaćeno
        pay.disabled = false;
        if (e.status === 410) return restart();
        fail(payErr, "We couldn't open the payment page. Please try again.");
      });
    });
    sync();
  }

  /* ---------- 3. status narudžbe ---------- */
  function status() {
    var q = new URLSearchParams(location.search), s = read(), o = q.get("o") || s.o;
    if (!o) { location.replace("../"); return; }
    if (s.thumbs) { delete s.thumbs; write(s); }                          // narudžba je plaćena: sličice više ne trebaju
    var wait = $("#fs-wait"), blocks = [wait, $("#fs-ready"), $("#fs-refunded"), $("#fs-gone")], flying = false, done = false, poll;
    var WAIT = {
      confirming: { label: "CONFIRMING PAYMENT", text: "", close: false, red: false },
      queued: { label: "IN QUEUE", text: "Your video starts as soon as a slot is free.", close: true, red: false },
      generating: { label: "GENERATING", text: "We're putting you into video No. NN.", close: true, red: true }
    };
    function only(el) { blocks.forEach(function (b) { b.hidden = b !== el; }); window.scrollTo(0, 0); }
    function finish() { done = true; clearInterval(poll); }
    function render(j) {
      var w = WAIT[j.status], n = j.number || s.number || "";
      $("#fs-step").textContent = j.status === "refunded" ? "REFUNDED" : j.status === "confirming" ? "" : "PAID";
      if (w) {
        if (wait.hidden) only(wait);
        wait.classList.toggle("red", w.red);                              // isti element: krug se ne pokreće iznova, samo promijeni boju
        $("#fs-wait-l").textContent = w.label;
        $("#fs-wait-t").textContent = w.text.replace("NN", n);
        $("#fs-wait-t").hidden = !w.text; $("#fs-wait-c").hidden = !w.close;
      } else if (j.status === "ready") {
        finish();
        $("#fs-ready-n").textContent = "FUNSWAP · Video No. " + n;
        $("#fs-video").src = j.video + "#t=0.001";                        // #t: iPhone inače pokaže crno umjesto prvog kadra
        $("#fs-download").href = j.video + (j.video.indexOf("?") < 0 ? "?" : "&") + "download=1";
        $("#fs-sent").textContent = "We also sent it to " + j.email + ".";
        only($("#fs-ready"));
      } else if (j.status === "refunded") {
        finish(); write({}); only($("#fs-refunded"));
      }
    }
    function check() {
      if (done || flying || document.hidden) return;
      flying = true;
      api("/orders/" + encodeURIComponent(o) + "/status", { cache: "no-store" }).then(render).catch(function (e) {
        if (e.status === 404) { finish(); write({}); $("#fs-step").textContent = ""; only($("#fs-gone")); }   // inače mreža: pitamo opet za 3 s
      }).then(function () { flying = false; });
    }
    poll = setInterval(check, 3000);
    document.addEventListener("visibilitychange", check);
    check();
  }

  var page = document.body.dataset.fs;
  if (page === "gallery") gallery(); else if (page === "photos") photos(); else if (page === "thanks") status();
})();
