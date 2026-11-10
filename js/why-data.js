/* WHY AI PRODUCTION (#why): jedino mjesto gdje se upisuju brojke i tekstovi tablice (Kristian, 10. 11. 2026.; brand/20).
   Pri učitavanju ih js/main.js (Why) upiše u stranicu i iz njih izračuna trake. Isti tekst stoji i u index.html, da se vidi bez JavaScripta.

   Polja reda (redom kojim se prikazuju, točno četiri):
     dim      naziv reda
     better   podnaslov ("Lower is better" | "Higher is better")
     slow     true = red se odvrti dulje od ostalih (nije obavezno; trajanje je u js/main.js, Why, T.COUNT_SLOW)
     trad     klasična produkcija, am  Artificial Media:
       value  cijeli broj (prikazuje se s dvije znamenke)
       money  true = iznos s točkom za tisuće (25000 → 25.000), a ne dvije znamenke (nije obavezno)
       unit   oznaka uz broj, npr. "$" (nije obavezno)
       above  oznaka iznad broja, npr. "From" (nije obavezno)
   Trake: veća vrijednost u redu = 100 %, manja = manja / veća. Ne upisuju se ručno. */
window.AM_WHY_DATA = {
  rows: [
    { dim: "Days to delivery", better: "Lower is better", trad: { value: 42 }, am: { value: 7 } },
    { dim: "Cost", better: "Lower is better", slow: true, trad: { value: 25000, money: true, unit: "$" }, am: { value: 3000, money: true, unit: "$", above: "From" } },
    { dim: "Formats from one master", better: "Higher is better", trad: { value: 1 }, am: { value: 5 } },
    { dim: "Rounds of revisions", better: "Higher is better", trad: { value: 2 }, am: { value: 4 } }
  ],
  note: {
    before: "Traditional figures are typical published ranges for a professionally produced 30-second commercial: 4–8 weeks from concept to delivery and $5K–$100K in production cost depending on tier, usually framed for a single format. We use 6 weeks and $25K as a mid-point. Source: ",
    link: { text: "C&I Studios, \"30-Second Commercial Cost\"", href: "https://c-istudios.com/30-second-commercial-cost/" },
    after: ". Artificial Media pricing starts at $3K; final quotes depend on scope."
  }
};
