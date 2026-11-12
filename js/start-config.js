/* Adresa servisa za upite (funswap-api, ruta POST /briefs) i javni ključ Cloudflare Turnstilea (nevidljivi widget).
   Objavljeni servis i pravi widget za artificialmediastudio.com; na localhostu lokalni servis i Cloudflareov probni ključ. */
window.AM_START_API = "https://funswap-api.funswap-api.workers.dev";
window.AM_START_TURNSTILE = "0x4AAAAAAF-AeABLmz5S2Vm4";
if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) {
  window.AM_START_API = "http://localhost:8787";
  window.AM_START_TURNSTILE = "1x00000000000000000000BB";   // Cloudflareov probni ključ: nevidljivi, uvijek prolazi
}
