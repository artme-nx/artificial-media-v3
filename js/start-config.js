/* Adresa servisa za upite (funswap-api, ruta POST /briefs). Prazno: slanje javlja grešku s emailom, dok servis ne bude objavljen. */
window.AM_START_API = "";
if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
  window.AM_START_API = "http://localhost:8787";
  document.write('<script src="/qa/start-mock.js"><\/script>');   // lokalno lažno slanje dok ruta ne postoji (qa/ se ne objavljuje)
}
