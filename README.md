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

Put: **hero (zum u D) → tri trake → WHERE ART MEETS INTELLIGENCE → WHO WE ARE? → THE WORK (`#work`) → WHY AI PRODUCTION (`#why`) → `#next`** (redoslijed WORK i WHY zamijenjen 13. 11. 2026., `brand/35` F).

1. **Hero:** pozadina kao papir za scenarij, a video se vidi samo kroz slova (pismo AM Puni). Slova su najveća moguća, gotovo do samog ruba ekrana. Na širokom ekranu ime je u dva reda (ARTIFICIAL / MEDIA), a na uspravnom tabletu u tri (ARTI / FICIAL / MEDIA). Na mobitelu je (proba, Kristian, 14. 10. 2026.) u četiri reda: **ART / IFICIAL / ME / DIA**. ART i ME su najveći jer imaju mjesta: oba idu preko cijele širine, kao i IFICIAL, a DIA je iste veličine kao IFICIAL. Povratak na tri reda je jedna izmjena u `js/main.js` (u `layout()` umjesto `LINES4` stavi `LINES3`). Jedan pokret pokrene zum: slova sama rastu u puno slovo D (oko 1,8 s), a čim video ispuni ekran, uđu tri trake.
2. **Drugi slide: tri trake s videom** (Kristian, 19. 10. i 10. 11. 2026.). Čim zum u slovo D završi, tri trake uđu same, vodoravno, jedna za drugom; svaka je trećina visine ekrana:
   - gornja, **Defined by emotion.**, ulazi s lijeve strane;
   - srednja, **Boundless imagination.**, s desne;
   - donja, **Beyond what any camera could reach.**, s lijeve.

   Rečenice putuju s trakama (pismo AM Puni, točka u REC crvenoj). Jedna traka ulazi 1,05 s (`cubic-bezier(.16, 1, .3, 1)`), a sljedeća kreće 0,25 s prije nego prethodna sjedne; ulazak traje oko 2,65 s. Vremena: `js/main.js`, `SLIDE` i `Bands`, objekt `T`. Na mobitelu je isto, tri trake po trećinu visine.

   **Videi tijekom pokreta:** izmjereno u Chromeu 10. 11. 2026.: dok se vrti više od jednog videa, kadrovi padnu sa 60 na 30 u sekundi. Zato trake ulaze na već dekodiranom prvom kadru (`primeVideo`), a videi krenu kad sve tri sjednu; tada stane video heroja. Isto vrijedi za polovice WHO WE ARE?. Videi su bez zvuka i **privremeni** (`video/cards/card-1…3.mp4`, `tools/make_card_placeholders.sh`); pravi idu pod istim imenom, 1920 × 1080, H.264, petlja od 8 do 15 s, bez zvuka.

   **Zaključak: WHERE ART MEETS INTELLIGENCE.** (Kristian, 21. 10. 2026.). Kad se tri pruge pogledaju, sljedeći pokret prema dolje pošalje ih svaku na svoju stranu (gornja lijevo, srednja desno, donja lijevo), jednu za drugom. Ispod njih se otkrije blok u dva stupca: lijevo papir s rečenicom **WHERE ART MEETS INTELLIGENCE.** (ART i točka crveno), desno video. Na mobitelu su to dva reda: gore papir s rečenicom, dolje video. Tekst rečenice je u `index.html` (blok `#sum`), a video je **privremen** (`video/sum.mp4`, kopija `card-1.mp4`). Sva vremena (izlazak traka, ulazak rečenice, SCROLL) su na jednom mjestu: `js/main.js`, dio `Sum`, objekt `T`. Izgled bloka je zajednička klasa `.split` (`css/style.css`), ista kao na ekranu WHO WE ARE?.

   **WHO WE ARE?** (`#split-2`; Kristian, 27. 10. i 10. 11. 2026.): ekran leži točno preko bloka WHERE ART i ulazi bez vožnje stranice, u dvije polovice: lijevo video odozdo, desno papir s naslovom **WHO / WE / ARE?** (upitnik crven) odozgo, istovremeno, 1,05 s (`js/main.js`, `Who`). Crna traka se pojavi s njima. Na mobitelu je papir gore, a video dolje. **Privremeno:** `video/split-2.mp4` (kopija `card-2`). Ekran 3 obrisan je 10. 11. 2026.; njegov video `video/split-3.mp4` ostao je u mapi.

   **Zašto AI produkcija (`#why`)** (Kristian, 29. 10. i 10. 11. 2026.): crni ekran iza sekcije THE WORK (od 13. 11. 2026.). Jedan pokret s THE WORK doveze ga (0,9 s), a na njemu je tablica usporedbe, široka 84 vw: gore lijevo oznaka **WHY AI PRODUCTION**, pa zaglavlje (**TRADITIONAL SHOOT** sivo · **ARTIFICIAL MEDIA** crveno). Četiri **reda** dođu **sama**, jedan za drugim: naziv s podnaslovom LOWER / HIGHER IS BETTER, brojka klasične produkcije (siva) i naša (papir), a ispod svake traka. Pod tablicom je footnote s izvorom, a dolazi sa zadnjim redom. Sve stane u jedan ekran, i na mobitelu.
   - **Podaci:** sve brojke, oznake i tekstovi su u `js/why-data.js` (jedino mjesto za promjenu); `index.html` drži iste konačne vrijednosti da se vide i bez JavaScripta, a `main.js` ih pri učitavanju upiše iz podataka.
   - **Trake** se računaju iz podataka: veća vrijednost u redu = 100 %, manja = manja / veća, najmanje 24 px. Ne upisuju se ručno.
   - **Red COST** ima `slow: true` i `money: true`: odvrti se dulje (1,1 s, od `0.000`), s točkom za tisuće. Ostali redovi prikazuju dvije znamenke i traju 0,6 s; brojač i traka imaju isto trajanje i krivulju.
   - **Vremena** su u `js/main.js`, dio `Why`, objekt `T` (`SPLIT`, `ROW_GAP`, `IN`, `COUNT`, `COUNT_SLOW`, `OUT`, `HOLD`).

   **THE WORK (`#work`)** (Kristian, 29. 10. 2026.; mockup `brand/14-the-work-mockup-desktop.pdf`; korak 1 od 2): crni ekran koji leži točno ispod ekrana WHO WE ARE? (od 13. 11. 2026.). Pokret dolje nastavi kretanje polovica (video gore, papir dolje, 0,9 s; na mobitelu se otvore prema van: papir gore, video dolje) i otkrije ga (`js/main.js`, `Door`). Gore lijevo **THE WORK.** (točka crvena) i broj projekata (npr. (03), broje se samo projekti koji nisu ugašeni), gore desno "Client work and spec work, always labeled." Lijevo je **monitor** (otvori se iz sredine, REC, vremenski kod, kutne oznake, crvena traka napretka), a oblik mijenja glatko po formatu klipa (16:9 vodoravno, 9:16 uspravno, 21:9 široko). Ispod monitora je **ploča kao na kameri**: tipka PREV, kartica za svaki projekt (sličica, broj, naziv, oznaka CLIENT / ORIGINAL / SPEC; aktivna ima crvenu lampicu i crvenu crtu napretka) i tipka NEXT. Zadnja kartica, NEXT CLIENT · COMING SOON, ugašena je i ne može se izabrati. Desno je **kartica projekta**: PROJECT 01 / 03, naziv s oznakom, redovi CLIENT, YEAR, FORMAT, DELIVERED IN, MADE WITH, rečenica opisa, popis klipova (s trajanjem iz videa) i WATCH WITH SOUND.
   - **Projekt se mijenja samo klikom** na karticu, PREV ili NEXT (i Enter / razmak na njima). PREV i NEXT idu u krug i preskaču ugašenu karticu. Scroll, strelice ← → i swipe nikad ne mijenjaju projekt ni klip.
   - Korak 1: klip se vrti u petlji, bez zvuka (SOUND je skriven). Popis klipova i WATCH WITH SOUND zasad su samo prikaz (korak 2: lanac klipova, showreel, player). Klik na monitor zasad ne radi ništa.
   - Na desktopu cijela pozornica stane u ekran ispod crne trake (ako ne stane, manji je monitor, ne tekst). Na mobitelu: naslov, monitor preko širine (9:16 visok koliko stane), "Tap to watch with sound", ploča koja se lista prstom vodoravno (bez PREV / NEXT), kartica projekta, SCROLL; sekcija je tamo viša od ekrana.
   - **Podaci projekata** (naziv, oznaka, klijent, godina, format, dani, alati, opis, klipovi) su u `js/reels-data.js`. Što ne znamo, piše doslovno u uglatoj zagradi ([X] days, [TOOLS], [YEAR], [FORMAT], [DESCRIPTION], [CLIP TITLE], [CLIP 1–3]).
   - **Videi:** `video/work/evcharge-01.mp4`, `evcharge-02.mp4`, `gidra-01.mp4`, `sofia-01.mp4`, `sofia-02.mp4`, `sofia-03.mp4` (uz istoimene `.jpg` postere). Zasad su to kopije placeholdera iz `video/reels/`; pravi idu pod istim imenima, točno u omjeru formata klipa (polje `format` u `reels-data.js`).
   - Ponašanje: `js/reels.js`; izgled: `css/style.css`, dio THE WORK.
3. **Crna traka:** pojavi se gore kad se WHO WE ARE? razdvoji i otkrije THE WORK, i ostane dalje (do 26. 10. 2026. palili su je reelovi). U njoj piše ARTIFICIAL MEDIA, s ART i ME crveno (REC crvena), a ostatak je bijel.
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

- izvor za footnote u `#why`: C&I Studios potvrđuje 4–8 tjedana; raspon $5K–$100K, "mid-point" i "single format" Kristian još treba potvrditi [TREBA POTVRDU];
- sva polja u uglatim zagradama u `js/reels-data.js`; smije li se rad pokazati s imenom klijenta (EVCharge, Gidra) [TREBA POTVRDU];
- svi videi: `video/hero.mp4`, `video/cards/`, `video/sum.mp4`, `video/split-2.mp4` i `video/work/`.

Tekst scenarija je Kristianov (13. 10. 2026.), a ispravljeni su samo pravopis i gramatika engleskog. Nalazi se u `js/main.js`, u nizu `SCRIPT`.

## Tijek se ne može preskočiti

Koliko god jako netko scrollao, ništa se ne preskače (`js/main.js`, `Flow`):
Put: **hero → tri trake → trake odu i WHERE ART MEETS INTELLIGENCE → WHO WE ARE? → razdvajanje i THE WORK → tablica (WHY AI PRODUCTION, redovi dolaze sami) → završni ekran → dalje običan scroll** (od 13. 11. 2026.; na mobitelu je iza THE WORK običan scroll). Svaki korak je **jedan pokret**: jedan tik kotačića, jedan zamah trackpadom, jedan prst ili jedna tipka. Izmjereno 10. 11. 2026. (1440×900 kotačićem i trackpadom, 390×844 prstom): 1 na tri trake, 1 na WHERE ART, 1 na WHO WE ARE?, 1 na THE WORK (razdvajanje), 1 za tablicu, 1 na završni ekran, 1 za otpuštanje; natrag isto (redoslijed od 13. 11. 2026.).
- hero (Kristian, 10. 11. 2026.): jedan pokret pokrene sve. Zum u slovo D odvrti se sam (1,8 s; `Flow`, objekt `T`), a čim video ispuni ekran, uđu tri trake, bez zaustavljanja. Dok sve traje, svi pokreti se upiju. Jedan pokret prema gore: trake izađu obrnutim redom (3, 2, 1), svaka na stranu s koje je došla, pa se zum odvrti natrag;
- nakon što treća traka sjedne: 0,6 s mira (`SEAT_HOLD`), pokreti se upiju, pa se pojavi SCROLL;
- zaključak: prvi pokret prema dolje (ili klik na SCROLL) pošalje trake i otkrije blok WHERE ART MEETS INTELLIGENCE. Dok trake odlaze i rečenica ulazi, svi pokreti se upiju. 1,5 s nakon rečenice SCROLL se pojavi opet. Pokret prema gore dok je blok otvoren vrati trake obrnutim redom, pa opet 0,6 s mira i SCROLL;
- WHO WE ARE? (10. 11. 2026.): sljedeći pokret prema dolje dovede polovice (1,05 s, stranica stoji), a pokreti se upiju. Prema gore polovice izađu putem kojim su došle i ostane blok WHERE ART, a sljedeći pokret gore vrati trake;
- THE WORK (od 13. 11. 2026., `brand/35` F): pokret dolje na ekranu WHO WE ARE? (ili klik na SCROLL) ga razdvoji i otkrije `#work` (0,9 s); za to vrijeme pokreti se upiju. Monitor i ulazak sekcije krenu tek kad se razdvoji (`js/reels.js`, klasa `revealed`). Prema gore s `#work`: WHO WE ARE? se sastavi (0,9 s). Na mobitelu, gdje je `#work` viši od ekrana, sljedeći pokret otključa stranicu (0,6 ekrana niže), pa su `#why` i `#next` običan scroll. Vodoravni pokreti (trackpad, prst po ploči s projektima) nikad nisu korak;
- zašto AI produkcija: na desktopu pokret dolje s `#work` (ili klik na SCROLL) glatko odveze stranicu na `#why` (0,9 s); četiri reda dođu sama, a SCROLL se pojavi oko 2,25 s nakon dolaska. Za to vrijeme svi pokreti (i prema gore) se upiju. Sljedeći pokret vodi na `#next`, a odande jedan otključa stranicu prema footeru. Prema gore s `#next` na `#why` i s `#why` na `#work` redovi ostaju prikazani; vrate se na početak kad se WHO WE ARE? sastavi. Na mobitelu redovi krenu kad se ekran vidi;
- dalje je običan scroll. Kad se posjetitelj običnim scrollom vrati iznad zadnjeg zaustavljanja (desktop: `#next`; mobitel: `#work`), tijek se opet zaključa na njemu i dalje gore ide korak po korak;
- jedan pokret je uvijek jedan korak (`js/main.js`, `wheelNew`): tik kotačića (više od 60 ms od prethodnog događaja) ili novi zamah trackpadom, i kad rep prethodnog još traje (pomak naraste barem 2× i 3 px). Rep inercije samo slabi, pa se ne broji. Do 27. 10. 2026. karte su tražile ili stanku od 250 ms ili pomak od barem 40 px, pa nježan drugi zamah preko repa prvoga nije dizao kartu;
- uz "smanjeni pokret" u postavkama sustava ništa se ne zaključava; sekcije stoje jedna ispod druge bez klizanja, trake se odmah prikažu, `#work` stoji ispod ekrana WHO WE ARE?, a `#why` ispod njega, sa svim redovima, brojkama, trakama i SCROLL-om odmah, a u THE WORK se ništa ne animira i klip se ne pušta sam.

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

**Pločice završnog ekrana** (Kristian, 10. 11. 2026.): pozadina se stavlja u `video/tiles/` pod imenima `work`, `academy` i `funswap` (`.mp4` i/ili `.jpg`). Što postoji, to se samo prikaže; bez datoteka pločica ostaje tamna. Format: MP4 H.264, bez zvuka, petlja 6–10 s, 1920×1080 za veliku pločicu (`work`) i 1280×720 za manje, do oko 3 MB; JPG poster iste rezolucije. Jačina tamnog sloja iza teksta je `--end-shade` u `css/style.css`.

## Datoteke

| Datoteka | Što je |
|---|---|
| `index.html` | Stranica |
| `css/style.css` | Izgled; boje su na vrhu (`--bg`, `--red`) |
| `css/ampuni-font.css` | Pismo AM Puni, ugrađeno (generirano) |
| `js/main.js` | Scroll: zum, tri trake (`Bands`), zaključak WHERE ART (`Sum`), WHO WE ARE? (`Who`), tijek (`Flow`), tablica `#why` (`Why`), traka, zvuk (i isključeni scenarij) |
| `js/why-data.js` | **Brojke i tekstovi tablice `#why`** (ovdje se mijenjaju) |
| `video/cards/` | Privremeni videi za tri trake (`tools/make_card_placeholders.sh`) |
| `video/sum.mp4` | Privremeni video za blok WHERE ART MEETS INTELLIGENCE |
| `video/split-2.mp4` | Privremeni video za ekran WHO WE ARE? (`video/split-3.mp4` se više ne koristi) |
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
