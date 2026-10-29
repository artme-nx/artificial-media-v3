/* THE WORK (#work, 29. 10. 2026.): jedino mjesto gdje se upisuju projekti, redom kojim se prikazuju.
   Nikad izmišljen rad, klijent, broj ni rezultat: što ne znamo, ostaje doslovno u uglatoj zagradi ([X] days, [TOOLS] ...).
   Koji radovi smiju biti javni i s imenom klijenta, odlučuje Kristian [TREBA POTVRDU za EVCharge i Gidru].

   Polja projekta:
     id           kratko ime (mala slova)
     number       "01", "02" ... (broj na kartici)
     title        naziv projekta (velika slova)
     tag          "CLIENT" | "ORIGINAL" | "SPEC" (03 §7 R3: client i spec uvijek označeni)
     client, year, format, deliveredIn, madeWith   redovi na kartici projekta
     description  jedna rečenica
     clips        [{ title, file, poster, format }]; format "16:9" | "9:16" | "21:9" (po njemu monitor mijenja oblik).
                  Trajanje se čita iz samog videa (loadedmetadata); polje duration upiši samo ako treba ručno (u sekundama).
     disabled     true = ugašena kartica (bez klipova, ne može se izabrati ni fokusirati)
   PRIVREMENI VIDEI: video/work/*.mp4 i *.jpg su kopije placeholdera iz video/reels/; zamijeni ih pravima pod istim imenima. */
window.AM_WORK = [
  {
    id: "evcharge", number: "01", title: "EVCHARGE", tag: "CLIENT",
    client: "EVCharge.hr", year: "2026", format: "16:9 Commercial", deliveredIn: "[X] days", madeWith: "[TOOLS]",
    description: "Two films for an EV charging payment system: one for location owners, one for drivers.",
    clips: [
      { title: "B2B film", file: "video/work/evcharge-01.mp4", poster: "video/work/evcharge-01.jpg", format: "16:9" },
      { title: "Drivers film", file: "video/work/evcharge-02.mp4", poster: "video/work/evcharge-02.jpg", format: "16:9" }
    ]
  },
  {
    id: "gidra", number: "02", title: "GIDRA", tag: "CLIENT",
    client: "Gidra · Connect group", year: "[YEAR]", format: "[FORMAT]", deliveredIn: "[X] days", madeWith: "[TOOLS]",
    description: "[DESCRIPTION]",
    clips: [
      { title: "[CLIP TITLE]", file: "video/work/gidra-01.mp4", poster: "video/work/gidra-01.jpg", format: "16:9" }   // format zasad 16:9
    ]
  },
  {
    id: "sofia", number: "03", title: "SOFIA", tag: "ORIGINAL",
    client: "Artificial Media (own character)", year: "2026", format: "9:16 Social media", deliveredIn: "[X] days", madeWith: "Nano Banana Pro, Seedance",
    description: "Our own AI artist. One character, directed video after video.",
    clips: [
      { title: "[CLIP 1]", file: "video/work/sofia-01.mp4", poster: "video/work/sofia-01.jpg", format: "9:16" },
      { title: "[CLIP 2]", file: "video/work/sofia-02.mp4", poster: "video/work/sofia-02.jpg", format: "9:16" },
      { title: "[CLIP 3]", file: "video/work/sofia-03.mp4", poster: "video/work/sofia-03.jpg", format: "9:16" }
    ]
  },
  { id: "next", number: "04", title: "NEXT CLIENT", tag: "COMING SOON", disabled: true, clips: [] }
];
