# Artificial Media v3 · prototip

Prototip nove stranice (13. 10. 2026.), korak 3 iz `brand/12-novi-smjer.md`. Čisti HTML, CSS i JS, bez builda. Ne dira `artificial-media/` ni `artificial-media-v2/`.

## Kako otvoriti

Dvaput klikni `index.html`, i stranica se otvori u pregledniku. Pismo AM Puni je ugrađeno u `css/ampuni-font.css`, pa radi i bez servera. Courier Prime (pismo scenarija) i Inter (moderno pismo reelova) učitavaju se s Google Fonts, pa za njih treba internet.

## Live i GitHub

- Repo: [github.com/artme-nx/artificial-media-v3](https://github.com/artme-nx/artificial-media-v3), javni (kao `artificial-media` i `artificial-media-v2`).
- Live: [artme-nx.github.io/artificial-media-v3](https://artme-nx.github.io/artificial-media-v3/), GitHub Pages iz grane `main` (korijen). Sve putanje su relativne, pa radi i pod podmapom.
- Nova verzija na live: `git add -A && git commit -m "opis" && git push`. Za minutu-dvije je na adresi.
- Ne objavljuje se `qa/` (testovi i snimke zaslona), vidi `.gitignore`. `.nojekyll` kaže GitHubu da datoteke posluži kakve jesu.
- Pravi 4K videi kasnije ne idu u repo, nego na Bunny ili Cloudflare Stream.

## Što je na stranici

1. **Hero:** pozadina kao papir za scenarij, a video se vidi samo kroz slova (pismo AM Puni). Slova su najveća moguća, gotovo do samog ruba ekrana. Na širokom ekranu ime je u dva reda (ARTIFICIAL / MEDIA), a na uspravnom tabletu u tri (ARTI / FICIAL / MEDIA). Na mobitelu je (proba, Kristian, 14. 10. 2026.) u četiri reda: **ART / IFICIAL / ME / DIA**. ART i ME su najveći jer imaju mjesta: oba idu preko cijele širine, kao i IFICIAL, a DIA je iste veličine kao IFICIAL. Povratak na tri reda je jedna izmjena u `js/main.js` (u `layout()` umjesto `LINES4` stavi `LINES3`). Dok se scrolla, slova rastu i zumiraju u puno slovo D, sve dok video ne ispuni ekran.
2. **Drugi slide: tri karte s videom** (Kristian, 19. 10. 2026.). Kad se zum u slovo D završi i video ispuni ekran, odozdo se dižu tri karte, jedna za drugom, i slažu se jedna preko druge:
   - prva preko cijelog ekrana, s rečenicom **Defined by emotion.** u gornjoj trećini;
   - druga stane od druge trećine, s **Boundless imagination.** u sredini ekrana;
   - treća stane u donjoj trećini, s **Beyond what any camera could reach.**

   Na kraju se vide tri pruge, svaka sa svojim videom i rečenicom (pismo AM Puni, točka u REC crvenoj). Kad se digne sljedeća karta, video prethodne klizne malo gore, pa u njezinoj trećini ostane sredina kadra. Videi karata su bez zvuka i vrte se samo dok se karta vidi; video u heroju stane kad ga prva karta prekrije. Videi su **privremeni** (`video/cards/card-1…3.mp4`, `tools/make_card_placeholders.sh`); pravi idu pod istim imenom, 1920 × 1080, H.264, petlja od 8 do 15 s, bez zvuka.
3. **Crna traka:** pojavi se gore tek kad se dođe do reelova. U njoj piše ARTIFICIAL MEDIA, s ART i ME crveno (REC crvena), a ostatak je bijel.
4. **Slide sa scenarijem (isključen 19. 10. 2026.):** zamijenile su ga tri karte. Kod je ostao; povratak: u `js/main.js` stavi `SCREENPLAY = true`, u `index.html` makni klasu `has-cards` s heroja i `hidden` sa sekcije `#loop`, i vrati `js/typewriter-sounds.js`. Kako je radio: nad tekstom je veliko ime ARTIFICIAL MEDIA, a ispod se sam tipka tekst kao filmski scenarij, čim sekcija dođe na ekran. Ritam je ljudski i nepravilan, s predahom na zarezu i točki; izvan ekrana zastane. Nazivi ME, ART, AI i ARTIFICIAL MEDIA nisu u tekstu. Dok se tipka, u imenu se redom pale ME, ART, AI (drugo A iz ARTIFICIAL i I iz MEDIA) i na kraju cijelo ime.
   Kad je tekst otipkan, netko rukom, crvenim markerom (kao bilješke na pravom scenariju):
   - napiše ME i strelicu na prvi tekst;
   - napiše ART iznad drugog teksta, sa strelicom;
   - zaokruži treći tekst i napiše AI;
   - zaokruži veliki naslov ARTIFICIAL MEDIA i povuče strelicu do "Where art meets intelligence."

   Slova markera su crtana potezima, kao rukom, a svaki potez se iscrta redom; sve traje oko četiri i pol sekunde. Nakon toga prelazak mišem (ili dodir) preko teksta pali u imenu samo njegov dio: ME, ART ili A i I. Preko zadnjeg teksta i bilo gdje drugdje svijetli cijelo ime. Iznad teksta miš ostaje strelica, a papir stoji s tekstom.
5. **Reelovi:** nakon papira i pisaćeg stroja dolazi rez na crno i moderan dizajn (Kristian, 14. 10. 2026.: "nakon ovog pisanja starinskog moderan dizajn"). Detalji su u odjeljku *Reelovi* ispod.
6. **Objašnjenje:** zasad samo prazno mjesto za sljedeći korak.

Tekst scenarija je Kristianov (13. 10. 2026.), a ispravljeni su samo pravopis i gramatika engleskog. Nalazi se u `js/main.js`, u nizu `SCRIPT`.

## Tijek se ne može preskočiti

Koliko god jako netko scrollao, ništa se ne preskače (`js/main.js`, `Flow`):
- zum u slovo D: slova rastu samo dok posjetitelj scrolla (kotačić, prst ili tipke), a kad stane, stanu i ona. Brzina je ograničena, pa ni najjači scroll ne prođe zum brže od oko 1,8 s;
- karte (Kristian, 19. 10. 2026.: "nije na scroll, glatko, dugo se čeka i scrolla da se digne"): jedan pokret glatko digne cijelu sljedeću kartu, za oko 0,9 s. Ako se nakon zuma scrolla dalje, prva karta krene sama. Dok se karta diže, ostatak istog zamaha se upije, pa ni inercija trackpada ne preskače karte; kotačić koji se i dalje vrti diže najviše jednu kartu svakih ~1,3 s. Prema gore isto, karta po karta;
- treća karta (Kristian, 19. 10. 2026.: "neka se zaključa na 3-4 sekunde da stigne pogledati i pročitati", pa ispravak: "2-3 sekunde da ne ide nigdje i onda sa scrollom ide dalje" i "nek piše SCROLL"): kad stane, prema dolje se ništa ne miče 2,5 s (`LAST_HOLD`). Onda se pri dnu karte pojavi SCROLL s crticom koja teče prema dolje, i prvi pokret prema dolje (kotačić, trackpad, prst, tipka) ili klik na SCROLL ide prema reelovima. Slabi rep inercije trackpada (pomak manji od 25 px bez stanke) ne pokreće dalje. Prema gore se može;
- **reelovi stoje** (`js/reels.js`, `Hold`): kad se scrolla prema dolje, stranica stane tako da pozornica s monitorom točno ispuni ekran ispod trake, koliko god jak bio scroll. Prva dva pokreta (kotačić, trackpad, prst ili tipka) samo se upiju, a sekcija se malo trzne da se vidi da je pokret primljen. Tek treći pokret ide dalje. Jedan zamah, s inercijom trackpada ili nizom zubaca kotačića, broji se kao jedan pokret. Prema gore se može uvijek, a kad se posjetitelj vrati iznad reelova, oni opet stanu;
- uz "smanjeni pokret" u postavkama sustava ništa se ne zaključava.

## Reelovi

Ideja: scenarij je na papiru, a ono što je snimljeno gleda se na monitoru. Zato je sekcija crna, s pismom Inter umjesto pisaćeg stroja, a crvena je tu samo kao REC: ono što se upravo vrti.
- **Naslov** REELS u pismu AM Puni izroni odozdo, s brojem radova i rečenicom "Client work and spec work, always labeled." (03 §7 R3, prijedlog iz v2).
- **Pozornica** je ispod naslova i zauzima cijeli ekran ispod crne trake. Na njoj je monitor, a **veličina monitora ovisi o formatu** (Kristian, 14. 10. 2026.): **21:9** ide od ruba do ruba ekrana, **16:9** skoro preko cijelog ekrana, a **9:16** od vrha do dna. Kad se promijeni format, monitor se glatko razvuče ili suzi u novi oblik. Iza monitora je blago svjetlo iz samog kadra.
- **Monitor** se otvori od sredine kao ekran i pušta aktivni reel bez zvuka. Gore lijevo trepće REC i teče vremenski kod (sat:min:sek:sličica), gore desno je format, a dolje crvena traka napretka. Kutne oznake su kao u tražilu kamere.
- **Ploča kao na filmskoj kameri** je na dnu pozornice. Kod 21:9 i 16:9 je ispod kadra, a kod 9:16 lijevo i desno od njega.
  - Lijevo, pod natpisom SELECT FORMAT, su tipke **21:9 CINEMA**, **16:9 COMMERCIAL** i **9:16 SOCIAL MEDIA**. Svaka ima okvir u točnom omjeru i broj klipova u tom formatu, a odabrana ima upaljenu crvenu lampicu. Tipke su zamijenile filtre Video / Web / AI tools iz briefa (§5).
  - Desno, pod natpisom SELECT CLIP, je mali zaslon s brojem aktivnog klipa od ukupno (npr. **02/05**), nazivom, oznakom client/spec i trajanjem, a do njega traka sličica s brojevima. Aktivna sličica ima crveni rub i crvenu traku napretka. Ako sličica ima više nego što stane, traka se pomiče sama do aktivne.
  - Klik na sličicu bira klip; kad klip završi, sam kreće sljedeći.
- **Kako se vidi da se može birati** (Kristian, 14. 10. 2026.: "kako da čovjek to lijepo izabere a da vidi da može mijenjati i birati"):
  - na monitoru su lijevo i desno strelice za prethodni i sljedeći klip, a gore desno piše koji je klip od koliko (npr. 02/05);
  - kad se monitor prvi put otvori, lampice na tipkama formata i sličice zasvijetle redom, jednom, da se vidi da se može pritisnuti;
  - dok posjetitelj sam ne izabere format, reelovi se vrte kao showreel kroz sve formate: nakon zadnjeg klipa 21:9 monitor se sam razvuče u 16:9, pa u 9:16. Kad posjetitelj sam izabere format, vrti se samo taj;
  - tipke ← i → mijenjaju klip, a na mobitelu se klip mijenja povlačenjem prsta lijevo i desno po monitoru.
- **Preko cijelog ekrana:** klik na monitor (ili drugi klik na aktivni klip) otvara reel sa zvukom: pauza, prethodni / sljedeći, traka za premotavanje, zvuk. Esc zatvara, strelice premotavaju 5 s.
- **Zvuk:** u monitoru reel svira sa zvukom samo kad je SOUND uključen, i utiša se dok monitor odlazi s ekrana. Kad je crna traka gore, gumb SOUND se preseli u nju, da ne pokrije ploču.
- **Mobitel:** gore tipke formata, pa monitor (21:9 od ruba do ruba, 16:9 skoro, 9:16 koliko god ekran dopušta), pa zaslon klipa i traka sličica. Strelice i WATCH su stalno vidljivi.
- Uz "smanjeni pokret" ništa se ne animira i ništa ne kreće samo; reel se pusti klikom.

**Radovi se upisuju u `js/reels-data.js`** (naziv, format 21:9 / 16:9 / 9:16, client/spec, video, poster). Zasad su tamo **privremeni klipovi** `video/reels/reel-01…13`, kao primjer 3 u 21:9, 5 u 16:9 i 5 u 9:16 (apstraktno svjetlo s natpisom PLACEHOLDER, `tools/make_reel_placeholders.sh`). Nisu pravi radovi. Koji radovi smiju biti javni, odlučuje Kristian (brief §4, pitanje 5).

Pravi reel: MP4 (H.264, zvuk AAC) u `video/reels/`, točno u omjeru svog formata, plus jedan kadar kao JPG za poster. Trajanje se pročita iz samog videa.

## Zvuk

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
| `js/main.js` | Scroll: rast slova, tri karte, traka, zvuk (i isključeni scenarij) |
| `video/cards/` | Privremeni videi za tri karte (`tools/make_card_placeholders.sh`) |
| `js/reels.js` | Reelovi: pozornica i veličina monitora po formatu, tipke formata, klipovi, reel preko cijelog ekrana, zaustavljanje na reelovima |
| `js/reels-data.js` | **Popis reelova** (ovdje se upisuju pravi radovi) |
| `video/reels/` | Privremeni reelovi i posteri (`tools/make_reel_placeholders.sh`) |
| `js/logo-data.js` | Obrisi slova za masku u heroju (generirano) |
| `js/typewriter-sounds.js` | Zvukovi pisaćeg stroja (generirano, `tools/make_typewriter_sounds.py`) |
| `tools/build_logo_data.py` | Ponovno generira `logo-data.js` i `ampuni-font.css` kad se pismo promijeni |
| `fonts/` | AM Puni (.ttf i .woff), kopija iz `brand/05-logo/runda9-font/out/` |
| `img/paper.png` | Zrno papira za pozadinu (`tools/make_paper.py`) |

Kad se pismo promijeni, kopiraj novi `AMPuni-Regular.ttf` u `fonts/` i u mapi `artificial-media-v3` pokreni naredbu ispod (treba Python s paketom fontTools). Ona napravi `.woff`, `css/ampuni-font.css` i `js/logo-data.js`:

```
python3 tools/build_logo_data.py ../brand/05-logo/runda9-font/out/glyphs.json
```
