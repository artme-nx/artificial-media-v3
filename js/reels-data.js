/* Reelovi: jedino mjesto gdje se upisuju radovi (redom kojim se prikazuju).
   Dok pravih radova nema, ovdje su PRIVREMENI klipovi iz video/reels/ (tools/make_reel_placeholders.sh).
   Nikad izmišljen rad, klijent ni rezultat: koji radovi smiju biti javni, odlučuje Kristian (brief §4, pitanje 5).

   Polja jednog reela:
     title   naziv rada (engleski)
     ratio   "21:9" | "16:9" | "9:16"   format, ujedno i gumb na kojem se reel prikazuje (Kristian, 14. 10. 2026.):
             21:9 CINEMA, 16:9 COMMERCIAL, 9:16 SOCIAL MEDIA. Video mora biti baš u tom omjeru.
     kind    "client" | "spec" | null    oznaka client / spec (03 §7 R3); null = još nije potvrđeno
     src     MP4 (H.264, zvuk AAC), poster = jedan kadar kao JPG
     placeholder: true                   privremeni klip; u popisu piše PLACEHOLDER */
// Privremeno, kao primjer: 3 klipa 21:9, 5 klipova 16:9 i 5 klipova 9:16.
window.AM_REELS = [
  { title: "Reel 01", ratio: "21:9", kind: null, src: "video/reels/reel-01.mp4", poster: "video/reels/reel-01.jpg", placeholder: true },
  { title: "Reel 02", ratio: "21:9", kind: null, src: "video/reels/reel-02.mp4", poster: "video/reels/reel-02.jpg", placeholder: true },
  { title: "Reel 03", ratio: "21:9", kind: null, src: "video/reels/reel-03.mp4", poster: "video/reels/reel-03.jpg", placeholder: true },
  { title: "Reel 04", ratio: "16:9", kind: null, src: "video/reels/reel-04.mp4", poster: "video/reels/reel-04.jpg", placeholder: true },
  { title: "Reel 05", ratio: "16:9", kind: null, src: "video/reels/reel-05.mp4", poster: "video/reels/reel-05.jpg", placeholder: true },
  { title: "Reel 06", ratio: "16:9", kind: null, src: "video/reels/reel-06.mp4", poster: "video/reels/reel-06.jpg", placeholder: true },
  { title: "Reel 07", ratio: "16:9", kind: null, src: "video/reels/reel-07.mp4", poster: "video/reels/reel-07.jpg", placeholder: true },
  { title: "Reel 08", ratio: "16:9", kind: null, src: "video/reels/reel-08.mp4", poster: "video/reels/reel-08.jpg", placeholder: true },
  { title: "Reel 09", ratio: "9:16", kind: null, src: "video/reels/reel-09.mp4", poster: "video/reels/reel-09.jpg", placeholder: true },
  { title: "Reel 10", ratio: "9:16", kind: null, src: "video/reels/reel-10.mp4", poster: "video/reels/reel-10.jpg", placeholder: true },
  { title: "Reel 11", ratio: "9:16", kind: null, src: "video/reels/reel-11.mp4", poster: "video/reels/reel-11.jpg", placeholder: true },
  { title: "Reel 12", ratio: "9:16", kind: null, src: "video/reels/reel-12.mp4", poster: "video/reels/reel-12.jpg", placeholder: true },
  { title: "Reel 13", ratio: "9:16", kind: null, src: "video/reels/reel-13.mp4", poster: "video/reels/reel-13.jpg", placeholder: true }
];
