/* ART.ME ACADEMY: rezervacija (/academy/reserve/) i zahvala (/academy/thanks/), brand/33.
   Adresa servisa i Turnstile ključ: js/start-config.js (isti servis i isti widget kao forma /start/). Tekst poruka je naš, nikad posjetiteljev. */
(function () {
  "use strict";
  var API = window.AM_START_API;
  var main = document.querySelector("[data-academy]");
  if (!main) return;
  var MAIL = '<a href="mailto:kristian@artificialmediastudio.com">kristian@artificialmediastudio.com</a>';
  var T = {                                                                // poruke o grešci: brand/33 B, čekaju Kristianov OK
    name: "Enter the name you'll use in the academy.",
    email: "Enter a valid email address.",
    match: "The two emails don't match.",
    boxes: "Tick both boxes to continue.",
    taken: "This email already has a reserved seat. Check your inbox for the confirmation.",
    full: "All 100 founding seats are taken.",
    error: "Something went wrong and nothing was charged. Try again, or write to " + MAIL + "."
  };
  var EMAIL = /^[^\s@"<>,;]+@[^\s@"<>,;]+\.[^\s@"<>,;]{2,}$/;              // isto kao na servisu

  if (main.dataset.academy === "reserve") reserve();
  else thanks();

  /* ---------- obrazac ---------- */
  function reserve() {
    var form = main.querySelector("form"), btn = form.querySelector(".ar-pay"), sendErr = form.querySelector("#ar-send-err");
    var f = { name: form.querySelector("#ar-name"), email: form.querySelector("#ar-email"), email2: form.querySelector("#ar-email2"), terms: form.querySelector("#ar-terms"), adult: form.querySelector("#ar-adult") };
    var touched = {}, busy = false;

    function key(v) { return v.trim().toLowerCase(); }
    function problems() {
      var p = {}, name = f.name.value.replace(/\s+/g, " ").trim(), email = f.email.value.trim();
      if (!name || name.length > 60) p.name = T.name;
      if (email.length > 254 || !EMAIL.test(email)) p.email = T.email;
      if (key(f.email2.value) !== key(email)) p.email2 = T.match;
      if (!f.terms.checked || !f.adult.checked) p.boxes = T.boxes;
      return p;
    }
    function show(id, input, text) {                                       // greška uz polje: čitač zaslona je čita preko aria-describedby
      var el = form.querySelector("#ar-" + id + "-err");
      el.textContent = text || "";
      el.hidden = !text;
      if (input) { if (text) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
    }
    function render(all) {
      var p = problems();
      ["name", "email", "email2"].forEach(function (k) { show(k, f[k], (all || touched[k]) ? p[k] : ""); });
      show("boxes", null, (all || (touched.terms && touched.adult)) ? p.boxes : "");
      btn.setAttribute("aria-disabled", Object.keys(p).length || busy ? "true" : "false");
      return p;
    }
    ["name", "email", "email2"].forEach(function (k) {
      f[k].addEventListener("blur", function () { if (f[k].value) touched[k] = true; render(); });
      f[k].addEventListener("input", function () { sendErr.hidden = true; render(); });
    });
    ["terms", "adult"].forEach(function (k) { f[k].addEventListener("change", function () { touched[k] = true; sendErr.hidden = true; render(); }); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;
      var p = render(true);
      var first = ["name", "email", "email2"].filter(function (k) { return p[k]; })[0] || (p.boxes && (!f.terms.checked ? "terms" : "adult"));
      if (first) { f[first].focus(); return; }
      send();
    });

    function human() {                                                     // Cloudflare Turnstile, nevidljivi; izazov se pokaže samo kad treba
      return new Promise(function (ok, no) {
        var ts = window.turnstile, sitekey = window.AM_START_TURNSTILE, box = form.querySelector(".ar-ts"), id;
        if (!ts || !sitekey || !box) return no(new Error("no turnstile"));
        function done(fn, v) { try { ts.remove(id); } catch (e) {} fn(v); }
        id = ts.render(box, { sitekey: sitekey, appearance: "interaction-only", callback: function (t) { done(ok, t); }, "error-callback": function () { done(no, new Error("turnstile")); }, "timeout-callback": function () { done(no, new Error("turnstile")); } });
      });
    }
    function fail(code) {
      busy = false; btn.removeAttribute("aria-busy"); render();
      if (code === "name" || code === "email") { show(code, f[code], T[code]); f[code].focus(); return; }
      if (code === "match") { show("email2", f.email2, T.match); f.email2.focus(); return; }
      if (code === "boxes") { show("boxes", null, T.boxes); return; }
      sendErr.innerHTML = T[code === "taken" || code === "full" ? code : "error"];
      sendErr.hidden = false;
    }
    function send() {
      var body = { name: f.name.value, email: f.email.value, email2: f.email2.value, terms: f.terms.checked, adult: f.adult.checked, fax: form.querySelector("#ar-fax").value };
      busy = true; btn.setAttribute("aria-busy", "true"); btn.setAttribute("aria-disabled", "true"); sendErr.hidden = true;
      (API ? human() : Promise.reject(new Error("no api")))
        .then(function (token) { body.turnstile = token; return fetch(API + "/academy/reservations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) {
          if (x.ok && x.j.url && /^https:\/\/checkout\.stripe\.com\//.test(x.j.url)) { location.assign(x.j.url); return; }   // ostaje "busy" dok se Stripe ne otvori
          fail(x.j.error);
        })
        .catch(function () { fail("error"); });
    }
    window.addEventListener("pageshow", function (e) { if (e.persisted) { busy = false; btn.removeAttribute("aria-busy"); render(); } });   // povratak sa Stripea tipkom Natrag
    render();
  }

  /* ---------- zahvala ---------- */
  function thanks() {
    var q = new URLSearchParams(location.search), id = q.get("r") || "", sig = q.get("s") || "";
    var started = Date.now();
    function state(s) { main.setAttribute("data-state", s); }
    if (!API || !/^[\w-]{1,40}$/.test(id) || !/^[0-9a-f]{32}$/.test(sig)) return state("missing");
    function fill(j) {
      main.querySelectorAll("[data-name]").forEach(function (el) { el.textContent = j.name; });     // tekst, nikad HTML
      main.querySelectorAll("[data-email]").forEach(function (el) { el.textContent = j.email; });
      state("paid");
    }
    function check() {
      fetch(API + "/academy/reservations/" + encodeURIComponent(id) + "/status?s=" + encodeURIComponent(sig), { cache: "no-store" })
        .then(function (r) { if (r.status === 404) return { status: "missing" }; if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (j) {
          if (j.status === "paid") return fill(j);
          if (j.status === "pending") return again();
          state("missing");                                                // istekla, obrisana ili vraćena: bez podataka
        })
        .catch(again);
    }
    function again() {                                                     // webhook još nije stigao: svake 2 s, najdulje 60 s
      state("confirming");
      if (Date.now() - started < 60000) setTimeout(check, 2000);
      else main.querySelector(".ath-slow").hidden = false;               // nakon 60 s: tekst iz brand/33 C (Kristian OK, 12. 11.)
    }
    check();
  }
})();
