/* FUNSWAP: adresa servisa je samo ovdje (brand/26). Lokalno (localhost) koristi se lažni API iz qa/, koji se ne objavljuje. */
window.AM_FUNSWAP = { api: "", maxPhotoMB: 15, maxSide: 3840 };
if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
  window.AM_FUNSWAP.api = location.port === "8767" ? "http://localhost:8787" : "https://mock.local";   // 8767: pravi servis (wrangler dev), inače lažni API
  document.write('<script src="/qa/funswap-mock.js"><\/script>');
}
