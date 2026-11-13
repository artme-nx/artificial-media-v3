/* THE WORK (#work, 29. 10. 2026.; pravi radovi od 13. 11. 2026., brand/44 A): jedino mjesto gdje se upisuju projekti, redom kojim se prikazuju.
   Nikad izmišljen rad, klijent, broj ni rezultat: polje koje ne znamo se ne upisuje, a prazan red se na kartici ne prikazuje.
   EVCharge smije javno, s imenom (Kristian, 13. 11. 2026.); Nootropik bez imena naručitelja ("Private buyer", Kristian, 13. 11. 2026.).

   Polja projekta:
     id           kratko ime (mala slova)
     number       "01", "02" ... (broj na kartici)
     title        naziv projekta (velika slova)
     tag          "CLIENT" | "ORIGINAL" | "SPEC" (03 §7 R3: client i spec uvijek označeni)
     client, year, format, deliveredIn, madeWith   redovi na kartici projekta (prazno ili izostavljeno = red se ne prikazuje)
     description  jedna rečenica
     clips        [{ title, file, poster, format, sound }]; format "16:9" | "9:16" | "21:9" (po njemu monitor mijenja oblik);
                  sound: true ako klip ima zvuk (tada WATCH WITH SOUND / dodir na monitor pali zvuk).
                  Trajanje se čita iz samog videa (loadedmetadata); polje duration upiši samo ako treba ručno (u sekundama).
     disabled     true = ugašena kartica (bez klipova, ne može se izabrati ni fokusirati)
   Izvori klipova i kodiranje: brand/44 A.3. */
window.AM_WORK = [
  {
    id: "evcharge", number: "01", title: "EVCHARGE", tag: "CLIENT",
    client: "EVCharge.hr", year: "2026", format: "16:9 Commercial",
    description: "A B2B film for an EV charging payment system, made for location owners. English and Croatian versions.",
    clips: [
      { title: "B2B film · English", file: "video/work/evcharge-01.mp4", poster: "video/work/evcharge-01.jpg", format: "16:9", sound: true },
      { title: "B2B film · Croatian", file: "video/work/evcharge-02.mp4", poster: "video/work/evcharge-02.jpg", format: "16:9", sound: true }
    ]
  },
  {
    id: "nootropik", number: "02", title: "NOOTROPIK", tag: "CLIENT",
    client: "Private buyer", year: "2026", format: "16:9 Commercial",
    description: "A product commercial for the canned drink Nootropik.",
    clips: [
      { title: "Commercial", file: "video/work/nootropik-01.mp4", poster: "video/work/nootropik-01.jpg", format: "16:9" }   // kratak klip u petlji, bez zvuka
    ]
  },
  {
    id: "sofia", number: "03", title: "SOFIA", tag: "ORIGINAL",
    client: "Artificial Media (own character)", year: "2026", format: "16:9 Spot", madeWith: "Nano Banana Pro, Seedance",
    description: "Our own AI artist. One character, directed video after video.",
    clips: [
      { title: "Spot", file: "video/work/sofia-01.mp4", poster: "video/work/sofia-01.jpg", format: "16:9", sound: true }
    ]
  },
  { id: "next", number: "04", title: "NEXT CLIENT", tag: "COMING SOON", disabled: true, clips: [] }
];
