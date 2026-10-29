# Artificial Media v3 · prototip

Prototip nove stranice (13. 10. 2026.), korak 3 iz `brand/12-novi-smjer.md`. Čisti HTML, CSS i JS, bez builda. Ne dira `artificial-media/` ni `artificial-media-v2/`.

## Kako otvoriti

Dvaput klikni `index.html`, i stranica se otvori u pregledniku. Pismo AM Puni je ugrađeno u `css/ampuni-font.css`, pa radi i bez servera. Courier Prime (pismo scenarija) i Inter (moderno pismo sekcije THE WORK) učitavaju se s Google Fonts, pa za njih treba internet.

## Live i GitHub

- Repo: [github.com/artme-nx/artificial-media-v3](https://github.com/artme-nx/artificial-media-v3), javni (kao `artificial-media` i `artificial-media-v2`).
- Live: [artme-nx.github.io/artificial-media-v3](https://artme-nx.github.io/artificial-media-v3/), GitHub Pages iz grane `main` (korijen). Sve putanje su relativne, pa radi i pod podmapom.
- Nova verzija na live: `git add -A && git commit -m "opis" && git push`. Za minutu-dvije je na adresi.
- Ne objavljuje se `qa/` (testovi i snimke zaslona), vidi `.gitignore`. `.nojekyll` kaže GitHubu da datoteke posluži kakve jesu.
- Pravi 4K videi kasnije ne idu u repo, nego na Bunny ili Cloudflare Stream.

## Što je na stranici

Put: **hero (zum u D) → tri karte → WHERE ART MEETS INTELLIGENCE → WHO WE ARE? → ekran 3 → WHY AI PRODUCTION (`#why`) → THE WORK (`#work`) → `#next`**.

1. **Hero:** pozadina kao papir za scenarij, a video se vidi samo kroz slova (pismo AM Puni). Slova su najveća moguća, gotovo do samog ruba ekrana. Na širokom ekranu ime je u dva reda (ARTIFICIAL / MEDIA), a na uspravnom tabletu u tri (ARTI / FICIAL / MEDIA). Na mobitelu je (proba, Kristian, 14. 10. 2026.) u četiri reda: **ART / IFICIAL / ME / DIA**. ART i ME su najveći jer imaju mjesta: oba idu preko cijele širine, kao i IFICIAL, a DIA je iste veličine kao IFICIAL. Povratak na tri reda je jedna izmjena u `js/main.js` (u `layout()` umjesto `LINES4` stavi `LINES3`). Dok se scrolla, slova rastu i zumiraju u puno slovo D, sve dok video ne ispuni ekran.
2. **Drugi slide: tri karte s videom** (Kristian, 19. 10. 2026.). Kad se zum u slovo D završi i video ispuni ekran, odozdo se dižu tri karte, jedna za drugom, i slažu se jedna preko druge:
   - prva preko cijelog ekrana, s rečenicom **Defined by emotion.** u gornjoj trećini;
   - druga stane od druge trećine, s **Boundless imagination.** u sredini ekrana;
   - treća stane u donjoj trećini, s **Beyond what any camera could reach.**

   Na kraju se vide tri pruge, svaka sa svojim videom i rečenicom (pismo AM Puni, točka u REC crvenoj). Kad se digne sljedeća karta, video prethodne klizne malo gore, pa u njezinoj trećini ostane sredina kadra. Videi karata su bez zvuka i vrte se samo dok se karta vidi; video u heroju stane kad ga prva karta prekrije. Videi su **privremeni** (`video/cards/card-1…3.mp4`, `tools/make_card_placeholders.sh`); pravi idu pod istim imenom, 1920 × 1080, H.264, petlja od 8 do 15 s, bez zvuka.

   **Zaključak: WHERE ART MEETS INTELLIGENCE.** (Kristian, 21. 10. 2026.). Kad se tri pruge pogledaju, sljedeći pokret prema dolje pošalje ih svaku na svoju stranu (gornja lijevo, srednja desno, donja lijevo), jednu za drugom. Ispod njih se otkrije blok u dva stupca: lijevo papir s rečenicom **WHERE ART MEETS INTELLIGENCE.** (ART i točka crveno), desno video. Na mobitelu su to dva reda: gore papir s rečenicom, dolje video. Tekst rečenice je u `index.html` (blok `#sum`), a video je **privremen** (`video/sum.mp4`, kopija `card-1.mp4`). Sva vremena (izlazak traka, ulazak rečenice, SCROLL) su na jednom mjestu: `js/main.js`, dio `Sum`, objekt `T`. Izgled bloka je zajednička klasa `.split` (`css/style.css`), ista kao na ekranima 2 i 3.

   **Ekrani 2 i 3** (Kristian, 27. 10. 2026.): iza bloka WHERE ART dva puna ekrana istog izgleda (isti papir, isti video preko pola ekrana, isti naslov u AM Puni, isti lijevi rub teksta). Ekran 2 (`.split--text-right`): lijevo video, desno **WHO / WE / ARE?** (upitnik crven). Ekran 3 (`.split--text-left`): lijevo naslov i odlomak, desno video. Na mobitelu je, kao i kod bloka WHERE ART, papir s tekstom gore, a video dolje. Videi se vrte samo dok se ekran vidi. **Privremeno:** `video/split-2.mp4` i `video/split-3.mp4` (kopije `card-2` i `card-3`) i tekst ekrana 3 ("HEADLINE GOES HERE", "Paragraph goes here.").
   **Zašto AI produkcija (`#why`)** (Kristian, 29. 10. 2026.): crni ekran koji leži točno ispod ekrana 3. Pokret dolje razdvoji ekran 3 (papir ode ulijevo, video udesno, 0,9 s) i otkrije tablicu usporedbe, široku 84 vw: gore lijevo oznaka **WHY AI PRODUCTION**, pa zaglavlje s tri stupca (prazno · **TRADITIONAL SHOOT** sivo · **ARTIFICIAL MEDIA** crveno). Kad zaglavlje stoji, četiri **reda** dođu **sama**, jedan za drugim (posjetitelj ne scrolla red po red): naziv dimenzije, brojka klasične produkcije (siva) i naša brojka (papir, s jedinicom u crvenom). Ispod svake brojke je traka (siva / crvena) čija je duljina razmjerna vrijednosti. Red uđe s fadeom (0,4 s), a brojke se odbroje i trake iscrtaju istovremeno (0,6 s); novi red krene 0,35 s nakon prethodnog. 0,6 s nakon kraja zadnjeg reda pojavi se SCROLL (ukupno oko 3,15 s od razdvajanja). Na mobitelu zaglavlje ima dva stupca (TRADITIONAL / ARTIFICIAL MEDIA), a u svakom redu je naziv gore, a ispod dvije brojke jedna uz drugu. **SAV TEKST I BROJKE SU PRIVREMENI** (nisu tvrdnje): "DAYS TO DELIVERY", "COST", "FORMATS FROM ONE MASTER", "ROUNDS OF REVISIONS" i "00".
   - **Nazivi** mijenjaju se u `index.html`, sekcija `#why`, u `.why-dim` svakog reda.
   - **Brojke** su u `data-value` na `.why-val` (prva u redu je klasična produkcija, druga naša). Cijeli broj; koliko znamenki ima, toliko ih ostane i dok se odbrojava (npr. `"07"`). Upiši istu vrijednost i u sam element, da se vidi i bez JavaScripta.
   - **Jedinica ili znak** uz našu brojku (%, X, DAYS) ide u `.why-unit`.
   - **`data-max`** na `.why-row` je vrijednost koja ispuni cijelu traku (širina stupca minus 3 vw). Prazno = veća od dvije brojke u redu. Dok su obje brojke 0 (placeholderi), siva traka je puna, a crvena na 35 %, da se vidi kako izgleda.
   - **Vremena** su u `js/main.js`, dio `Why`, objekt `T` (`SPLIT`, `ROW_GAP`, `IN`, `COUNT`, `OUT`, `HOLD`).

   **THE WORK (`#work`)** (Kristian, 29. 10. 2026.; mockup `brand/14-the-work-mockup-desktop.pdf`; korak 1 od 2): crni ekran ispod `#why`. Gore lijevo **THE WORK.** (točka crvena) i broj projekata (npr. (03), broje se samo projekti koji nisu ugašeni), gore desno "Client work and spec work, always labeled." Lijevo je **monitor** (otvori se iz sredine, REC, vremenski kod, kutne oznake, crvena traka napretka), a oblik mijenja glatko po formatu klipa (16:9 vodoravno, 9:16 uspravno, 21:9 široko). Ispod monitora je **ploča kao na kameri**: tipka PREV, kartica za svaki projekt (sličica, broj, naziv, oznaka CLIENT / ORIGINAL / SPEC; aktivna ima crvenu lampicu i crvenu crtu napretka) i tipka NEXT. Zadnja kartica, NEXT CLIENT · COMING SOON, ugašena je i ne može se izabrati. Desno je **kartica projekta**: PROJECT 01 / 03, naziv s oznakom, redovi CLIENT, YEAR, FORMAT, DELIVERED IN, MADE WITH, rečenica opisa, popis klipova (s trajanjem iz videa) i WATCH WITH SOUND.
   - **Projekt se mijenja samo klikom** na karticu, PREV ili NEXT (i Enter / razmak na njima). PREV i NEXT idu u krug i preskaču ugašenu karticu. Scroll, strelice ← → i swipe nikad ne mijenjaju projekt ni klip.
   - Korak 1: klip se vrti u petlji, bez zvuka (SOUND je skriven). Popis klipova i WATCH WITH SOUND zasad su samo prikaz (korak 2: lanac klipova, showreel, player). Klik na monitor zasad ne radi ništa.
   - Na desktopu cijela pozornica stane u ekran ispod crne trake (ako ne stane, manji je monitor, ne tekst). Na mobitelu: naslov, monitor preko širine (9:16 visok koliko stane), "Tap to watch with sound", ploča koja se lista prstom vodoravno (bez PREV / NEXT), kartica projekta, SCROLL; sekcija je tamo viša od ekrana.
   - **Podaci projekata** (naziv, oznaka, klijent, godina, format, dani, alati, opis, klipovi) su u `js/reels-data.js`. Što ne znamo, piše doslovno u uglatoj zagradi ([X] days, [TOOLS], [YEAR], [FORMAT], [DESCRIPTION], [CLIP TITLE], [CLIP 1–3]).
   - **Videi:** `video/work/evcharge-01.mp4`, `evcharge-02.mp4`, `gidra-01.mp4`, `sofia-01.mp4`, `sofia-02.mp4`, `sofia-03.mp4` (uz istoimene `.jpg` postere). Zasad su to kopije placeholdera iz `video/reels/`; pravi idu pod istim imenima, točno u omjeru formata klipa (polje `format` u `reels-data.js`).
   - Ponašanje: `js/reels.js`; izgled: `css/style.css`, dio THE WORK.
3. **Crna traka:** pojavi se gore čim se s bloka WHERE ART MEETS INTELLIGENCE krene na ekran 2 i ostane dalje (do 26. 10. 2026. palili su je reelovi). U njoj piše ARTIFICIAL MEDIA, s ART i ME crveno (REC crvena), a ostatak je bijel. Naslovi ekrana 2 i 3 su ispod nje.
4. **Slide sa scenarijem (isključen 19. 10. 2026.):** zamijenile su ga tri karte. Kod je ostao; povratak: u `js/main.js` stavi `SCREENPLAY = true`, u `index.html` makni klasu `has-cards` s heroja i `hidden` sa sekcije `#loop`, i vrati `js/typewriter-sounds.js`. Kako je radio: nad tekstom je veliko ime ARTIFICIAL MEDIA, a ispod se sam tipka tekst kao filmski scenarij, čim sekcija dođe na ekran. Ritam je ljudski i nepravilan, s predahom na zarezu i točki; izvan ekrana zastane. Nazivi ME, ART, AI i ARTIFICIAL MEDIA nisu u tekstu. Dok se tipka, u imenu se redom pale ME, ART, AI (drugo A iz ARTIFICIAL i I iz MEDIA) i na kraju cijelo ime.
   Kad je tekst otipkan, netko rukom, crvenim markerom (kao bilješke na pravom scenariju):
   - napiše ME i strelicu na prvi tekst;
   - napiše ART iznad drugog teksta, sa strelicom;
   - zaokruži treći tekst i napiše AI;
   - zaokruži veliki naslov ARTIFICIAL MEDIA i povuče strelicu do "Where art meets intelligence."

   Slova markera su crtana potezima, kao rukom, a svaki potez se iscrta redom; sve traje oko četiri i pol sekunde. Nakon toga prelazak mišem (ili dodir) preko teksta pali u imenu samo njegov dio: ME, ART ili A i I. Preko zadnjeg teksta i bilo gdje drugdje svijetli cijelo ime. Iznad teksta miš ostaje strelica, a papir stoji s tekstom.
5. **Stari reelovi** (biranje po formatu) zamijenjeni su sekcijom THE WORK; vidi *Isključeno* ispod.
6. **Sljedeće (`#next`):** zasad prazan papir visine pola ekrana ispod sekcije `#work`, da se vidi da stranica ide dalje. Ovdje se grade sljedeće sekcije.

### Što je još privremeno (placeholder)

- naslov i tekst ekrana 3 ("HEADLINE GOES HERE", "Paragraph goes here.");
- nazivi i brojke u `#why` (svi su privremeni, nisu tvrdnje) [TREBA POTVRDU];
- sva polja u uglatim zagradama u `js/reels-data.js`; smije li se rad pokazati s imenom klijenta (EVCharge, Gidra) [TREBA POTVRDU];
- svi videi: `video/hero.mp4`, `video/cards/`, `video/sum.mp4`, `video/split-2.mp4`, `video/split-3.mp4` i `video/work/`.

Tekst scenarija je Kristianov (13. 10. 2026.), a ispravljeni su samo pravopis i gramatika engleskog. Nalazi se u `js/main.js`, u nizu `SCRIPT`.

## Tijek se ne može preskočiti

Koliko god jako netko scrollao, ništa se ne preskače (`js/main.js`, `Flow`):
- zum u slovo D: slova rastu samo dok posjetitelj scrolla (kotačić, prst ili tipke), a kad stane, stanu i ona. Brzina je ograničena, pa ni najjači scroll ne prođe zum brže od oko 1,8 s;
Put: **hero (zum) → tri karte → trake i WHERE ART MEETS INTELLIGENCE → ekran 2 (WHO WE ARE?) → ekran 3 → razdvajanje i tablica (WHY AI PRODUCTION, redovi dolaze sami) → THE WORK → dalje običan scroll**. Svaki korak je **jedan pokret**: jedan tik kotačića, jedan zamah trackpadom, jedan prst ili jedna tipka. Izmjereno 29. 10. 2026. (1440×900 kotačićem i trackpadom, 390×844 prstom): 3 pokreta za karte, 1 za trake, 1 na ekran 2, 1 na ekran 3, 1 za razdvajanje (redovi 0), 1 na THE WORK, 1 za otpuštanje, i isto natrag.
- zum u slovo D: slova rastu samo dok posjetitelj scrolla (kotačić, prst ili tipke), a kad stane, stanu i ona. Brzina je ograničena, pa ni najjači scroll ne prođe zum brže od oko 1,8 s. Ako se nakon zuma scrolla dalje, prva karta krene iz istog zamaha;
- karte (Kristian, 19. 10. 2026.: "nije na scroll, glatko, dugo se čeka i scrolla da se digne"): jedan pokret glatko digne cijelu sljedeću kartu, za 0,9 s. Dok se karta diže, ostatak zamaha se upije. Prema gore isto, karta po karta;
- treća karta: kad sjedne (kraj dizanja od 0,9 s), 0,6 s se ništa ne miče, a pokreti se upiju bez traga (`SEAT_HOLD`). Onda se pri dnu karte pojavi SCROLL. Prema gore se tada može, karta se spusti;
- zaključak: prvi pokret prema dolje (ili klik na SCROLL) pošalje trake i otkrije blok WHERE ART MEETS INTELLIGENCE. Dok trake odlaze i rečenica ulazi, svi pokreti se upiju. 1,5 s nakon rečenice SCROLL se pojavi opet. Pokret prema gore dok je blok otvoren vrati trake obrnutim redom, pa opet 0,6 s mira i SCROLL;
- ekrani 2 i 3 (27. 10. 2026.): sljedeći pokret prema dolje glatko odvede cijelu stranicu na ekran 2 (0,9 s, isti pokret kao karte), sljedeći na ekran 3. Pokreti za vrijeme vožnje se upiju. Na ekranima nema natpisa SCROLL. Prema gore ekran po ekran; s ekrana 2 natrag na blok WHERE ART, a sljedeći pokret gore vrati trake;
- zašto AI produkcija (29. 10. 2026.): pokret dolje na ekranu 3 ga razdvoji i otkrije zaglavlje tablice (0,9 s); zatim četiri reda dođu sama, a SCROLL se pojavi oko 3,15 s nakon razdvajanja. Za to vrijeme svi pokreti (i prema gore) se upiju i ne nakupljaju se, pa ni jak zamah trackpadom ne preskoči na THE WORK. Prema gore (kad je sve prikazano): ekran 3 se sastavi (0,9 s), a redovi zajedno nestanu (0,3 s);
- THE WORK (29. 10. 2026.): pokret prema dolje nakon SCROLL-a na `#why` (ili klik na njega) glatko odveze stranicu na `#work` (0,9 s) i ona tu stane. Sljedeći pokret prema dolje (ili klik na SCROLL) otključa stranicu i pusti je do `#next`; na mobitelu, gdje je `#work` viši od ekrana, samo 0,6 ekrana niže, da se vide ploča i kartica projekta. Prema gore s `#work` vraća na `#why`, gdje su svi redovi već prikazani, bez ponovne animacije, a SCROLL je odmah vidljiv. Vodoravni pokreti (trackpad, prst po ploči s projektima) nikad nisu korak;
- dalje je običan scroll. Kad se posjetitelj običnim scrollom vrati iznad sekcije `#work`, tijek se opet zaključa na njoj i dalje gore ide korak po korak;
- jedan pokret je uvijek jedan korak (`js/main.js`, `wheelNew`): tik kotačića (više od 60 ms od prethodnog događaja) ili novi zamah trackpadom, i kad rep prethodnog još traje (pomak naraste barem 2× i 3 px). Rep inercije samo slabi, pa se ne broji. Do 27. 10. 2026. karte su tražile ili stanku od 250 ms ili pomak od barem 40 px, pa nježan drugi zamah preko repa prvoga nije dizao kartu;
- uz "smanjeni pokret" u postavkama sustava ništa se ne zaključava; `#why` tada stoji ispod ekrana 3 (bez razdvajanja), sa svim redovima, brojkama, trakama i SCROLL-om odmah, a u THE WORK se ništa ne animira i klip se ne pušta sam.

## Isključeno, kod je ostao

### Stari reelovi (14.–26. 10. 2026.), zamijenjeni sekcijom THE WORK

Do 26. 10. 2026. stranica je imala sekciju REELS: monitor koji mijenja veličinu po formatu i ploču s **tipkama formata** (21:9 CINEMA, 16:9 COMMERCIAL, 9:16 SOCIAL MEDIA) i trakom sličica; bez odabira se vrtio **showreel kroz formate**; strelice na monitoru, tipke ← → i povlačenje prstom mijenjali su klip; klik na monitor otvarao je reel preko cijelog ekrana sa zvukom; sekcija je stajala dok tri pokreta ne prođu (`Hold`).

29. 10. 2026. (`brand/14`, §7 i §7a) iz toga je napravljen THE WORK: biranje je po **projektu**, ne po formatu. **Maknuti su:** tipke formata i ploča FORMAT, biranje po formatu, showreel kroz formate, strelice na monitoru, ← → i swipe po monitoru, `Hold` (zaustavljanje sada vodi `Flow` u `js/main.js`) i player preko cijelog ekrana. Monitor (otvaranje iz sredine, REC, vremenski kod, kutne oznake, traka napretka, oblik po formatu) je ostao. Player i stari kod su u commitu `6bb6158` (`git show 6bb6158:js/reels.js`, `git show 6bb6158:index.html`, retci 119–135); korak 2 ga vraća za WATCH WITH SOUND. Stari placeholderi `video/reels/reel-01…13` (`tools/make_reel_placeholders.sh`) ostali su u repou; THE WORK ih ne koristi.

## Zvuk

**Gumb je skriven od 26. 10. 2026.** (`index.html`, atribut `hidden` na `#sound`; povratak: makni `hidden`), jer zasad nijedan video na stranici nema zvuk. Kod je ostao. Upravljao je zvukom videa u heroju, pisaćim strojem (samo uz scenarij) i starim reelovima; videi karata, bloka WHERE ART, ekrana 2 i 3 i monitora u THE WORK uvijek su bez zvuka.

Dolje desno je gumb **SOUND**. Preglednici ne puštaju zvuk dok posjetitelj jednom ne klikne, pa zvuk kreće tek na taj klik. Kad je zvuk uključen:
- video u heroju svira svojim zvukom, a utiša se dok hero odlazi s ekrana;
- svako otkucano slovo zvuči kao stari mehanički pisaći stroj. Između blokova se čuje povrat valjka, a na kraju zvonce. Zvukovi su sintetizirani, bez tuđih snimaka: radi ih `tools/make_typewriter_sounds.py` u `js/typewriter-sounds.js`. Prava snimka može se staviti umjesto njih.

## Boje

- **Pozadina:** papir za scenarij (Kristian, 13. 10. 2026.), topla i nježno siva bijela #ECE8DF. Preko nje je sitno zrno papira iz `img/paper.png`, koje se radi skriptom `tools/make_paper.py`. Isti papir je i oko slova u heroju.
- **Crvena:** REC crvena #E23B2E, za ART i ME.
- **Tinta:** toplo crna #1D1B18, kao tinta pisaćeg stroja.
- Sve boje su na vrhu `css/style.css`. Ranija proba s četiri palete je u `qa/boje-usporedba.png`.

## Video

`video/hero.mp4` i `video/hero-poster.jpg` su **privremeni** (apstraktno svjetlo, napravljeno u ffmpegu). Pravi video stavi pod istim imenom, kao MP4 (H.264, zvuk AAC), 1280×720 ili 1920×1080. Najbolje je da bude kratka petlja od 8 do 15 sekundi. Poster je jedan kadar iz videa i prikazuje se dok video ne krene.

## Datoteke

| Datoteka | Što je |
|---|---|
| `index.html` | Stranica |
| `css/style.css` | Izgled; boje su na vrhu (`--bg`, `--red`) |
| `css/ampuni-font.css` | Pismo AM Puni, ugrađeno (generirano) |
| `js/main.js` | Scroll: rast slova, tri karte, zaključak WHERE ART (`Sum`), tijek (`Flow`), tablica `#why` (`Why`), traka, zvuk (i isključeni scenarij) |
| `video/cards/` | Privremeni videi za tri karte (`tools/make_card_placeholders.sh`) |
| `video/sum.mp4` | Privremeni video za blok WHERE ART MEETS INTELLIGENCE |
| `video/split-2.mp4`, `video/split-3.mp4` | Privremeni videi za ekrane 2 (WHO WE ARE?) i 3 |
| `js/reels.js` | THE WORK: monitor (oblik po formatu klipa), ploča s projektima, kartica projekta |
| `js/reels-data.js` | **Projekti za THE WORK** (ovdje se upisuju pravi radovi i klipovi) |
| `video/work/` | Privremeni videi i posteri projekata (kopije iz `video/reels/`; pravi idu pod istim imenima) |
| `video/reels/` | Stari privremeni reelovi (ne koriste se; `tools/make_reel_placeholders.sh`) |
| `js/logo-data.js` | Obrisi slova za masku u heroju (generirano) |
| `js/typewriter-sounds.js` | Zvukovi pisaćeg stroja (generirano, `tools/make_typewriter_sounds.py`) |
| `tools/build_logo_data.py` | Ponovno generira `logo-data.js` i `ampuni-font.css` kad se pismo promijeni |
| `fonts/` | AM Puni (.ttf i .woff), kopija iz `brand/05-logo/runda9-font/out/` |
| `img/paper.png` | Zrno papira za pozadinu (`tools/make_paper.py`) |

Kad se pismo promijeni, kopiraj novi `AMPuni-Regular.ttf` u `fonts/` i u mapi `artificial-media-v3` pokreni naredbu ispod (treba Python s paketom fontTools). Ona napravi `.woff`, `css/ampuni-font.css` i `js/logo-data.js`:

```
python3 tools/build_logo_data.py ../brand/05-logo/runda9-font/out/glyphs.json
```
