# artificial-media-v3 — pravila za Claude Code

Vrijedi uz `../CLAUDE.md`; gdje se razlikuju, vrijedi ovaj dokument.

- **Što je ovo:** nova stranica Artificial Media (rebranding). Čisti HTML, CSS i JS, bez builda i bez npm-a. Sve o sekcijama, tijeku, reelovima, zvuku, bojama i videu piše u `README.md`. Odluke i dnevnik promjena: `../brand/12-novi-smjer.md`. Predaja i stanje: `../brand/13-predaja-v3.md`.
- **Pregled:** u ovoj mapi `python3 -m http.server 8765`, pa http://localhost:8765. Server neka stalno radi.
- **Live:** GitHub Pages iz grane `main` (korijen): https://artme-nx.github.io/artificial-media-v3/. Objava je samo commit i push na `main`. Ovdje nema `gh-pages` grane ni deploy skripte (to iz `../CLAUDE.md` vrijedi za Next.js).
- **Jezik:** s Kristianom na hrvatskom. Copy stranice je na engleskom.
- **Istina:** copy se ne izmišlja. Tvrdnja, broj, klijent ili rezultat bez izvora dobiva oznaku [TREBA POTVRDU].
- **Ritam:** jedan korak, pa stani i čekaj Kristianov OK. Commit i push samo kad Kristian kaže.
- **Provjera:** svaku promjenu pogledaj na desktopu (1440×900) i mobitelu (390×844). Ako dira scroll, provjeri kotačićem, trackpadom (s inercijom) i prstom.
- **Nakon odobrenja:** ažuriraj `README.md` ako se promijenilo ponašanje i dopiši kratku bilješku na kraj `../brand/12-novi-smjer.md` (datum, Kristianove riječi, što je napravljeno).
- **Ne diraj:** `../artificial-media/` ni `../artificial-media-v2/`.
- **Videi:** pravi idu pod istim imenima kao privremeni (README → Video). 4K ne ide u repo, nego na Bunny ili Cloudflare Stream.
- `qa/` je lokalna mapa za provjere i ne objavljuje se (`.gitignore`).
