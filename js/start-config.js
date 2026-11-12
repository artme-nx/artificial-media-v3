/* Adresa servisa za upite (funswap-api, ruta POST /briefs) i javni ključ Cloudflare Turnstilea (nevidljivi widget).
   Prazno: slanje javlja grešku s emailom, dok servis i Turnstile ne budu objavljeni. */
window.AM_START_API = "";
window.AM_START_TURNSTILE = "";
if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
  window.AM_START_API = "http://localhost:8787";
  window.AM_START_TURNSTILE = "1x00000000000000000000BB";   // Cloudflareov probni ključ: nevidljivi, uvijek prolazi
}
