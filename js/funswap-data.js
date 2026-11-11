/* FUNSWAP: popis videa u galeriji (brand/26, brand/31). Videi nisu u repou, nego u R2 servisa (gallery/<datoteka>); stranica adresu slaže iz AM_FUNSWAP.api + "/gallery/".
   Polja: id (isto ime izvornika u R2: <id>.mp4 ide Higgsfieldu), number ("01"…), name (može prazno), category (može prazno), duration ("0:12"),
   src (datoteka za prikaz; HEVC izvornici imaju H.264 kopiju <id>-h264.mp4), poster. Puni URL ili put od korijena ostaje kakav jest.
   Prikazuje se samo ono što je upisano; broj videa i filter kategorija računaju se iz popisa. Prva objava: 24 videa "jedna osoba". */
window.AM_FUNSWAP_VIDEOS = [
  { id: "v01", number: "01", name: "", category: "", duration: "0:12", src: "v01.mp4", poster: "v01.jpg" },
  { id: "v02", number: "02", name: "", category: "", duration: "0:14", src: "v02.mp4", poster: "v02.jpg" },
  { id: "v03", number: "03", name: "", category: "", duration: "0:14", src: "v03.mp4", poster: "v03.jpg" },
  { id: "v04", number: "04", name: "", category: "", duration: "0:11", src: "v04.mp4", poster: "v04.jpg" },
  { id: "v05", number: "05", name: "", category: "", duration: "0:09", src: "v05-h264.mp4", poster: "v05.jpg" },
  { id: "v07", number: "07", name: "", category: "", duration: "0:14", src: "v07-h264.mp4", poster: "v07.jpg" },
  { id: "v08", number: "08", name: "", category: "", duration: "0:14", src: "v08.mp4", poster: "v08.jpg" },
  { id: "v11", number: "11", name: "", category: "", duration: "0:14", src: "v11-h264.mp4", poster: "v11.jpg" },
  { id: "v13", number: "13", name: "", category: "", duration: "0:11", src: "v13.mp4", poster: "v13.jpg" },
  { id: "v14", number: "14", name: "", category: "", duration: "0:14", src: "v14.mp4", poster: "v14.jpg" },
  { id: "v16", number: "16", name: "", category: "", duration: "0:11", src: "v16.mp4", poster: "v16.jpg" },
  { id: "v17", number: "17", name: "", category: "", duration: "0:09", src: "v17.mp4", poster: "v17.jpg" },
  { id: "v20", number: "20", name: "", category: "", duration: "0:07", src: "v20-h264.mp4", poster: "v20.jpg" },
  { id: "v22", number: "22", name: "", category: "", duration: "0:13", src: "v22.mp4", poster: "v22.jpg" },
  { id: "v23", number: "23", name: "", category: "", duration: "0:12", src: "v23.mp4", poster: "v23.jpg" },
  { id: "v24", number: "24", name: "", category: "", duration: "0:14", src: "v24.mp4", poster: "v24.jpg" },
  { id: "v25", number: "25", name: "", category: "", duration: "0:08", src: "v25.mp4", poster: "v25.jpg" },
  { id: "v27", number: "27", name: "", category: "", duration: "0:09", src: "v27.mp4", poster: "v27.jpg" },
  { id: "v28", number: "28", name: "", category: "", duration: "0:14", src: "v28.mp4", poster: "v28.jpg" },
  { id: "v29", number: "29", name: "", category: "", duration: "0:12", src: "v29.mp4", poster: "v29.jpg" },
  { id: "v31", number: "31", name: "", category: "", duration: "0:14", src: "v31.mp4", poster: "v31.jpg" },
  { id: "v32", number: "32", name: "", category: "", duration: "0:14", src: "v32.mp4", poster: "v32.jpg" },
  { id: "v33", number: "33", name: "", category: "", duration: "0:10", src: "v33.mp4", poster: "v33.jpg" },
  { id: "v35", number: "35", name: "", category: "", duration: "0:07", src: "v35.mp4", poster: "v35.jpg" }
];
