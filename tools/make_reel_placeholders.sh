#!/usr/bin/env bash
# Privremeni reelovi (PLACEHOLDER): apstraktno svjetlo u pravim omjerima kadra, s natpisom da nije pravi rad.
# Pokretanje iz mape artificial-media-v3:  bash tools/make_reel_placeholders.sh
# Treba ffmpeg s drawtext i pismo Inter (bilo koje .ttf/.otf; putanja u FONT).
set -e
FONT="${FONT:-/usr/share/fonts/opentype/inter/Inter-SemiBold.otf}"
OUT="video/reels"; mkdir -p "$OUT"
make() {   # id širina visina omjer boja0 boja1 boja2 boja3 tip seed
  local id=$1 w=$2 h=$3 r=$4 c0=$5 c1=$6 c2=$7 c3=$8 ty=$9 seed=${10}
  local fs=$(( (w<h?w:h) / 22 ))
  ffmpeg -y -loglevel error -f lavfi -i "gradients=s=${w}x${h}:c0=${c0}:c1=${c1}:c2=${c2}:c3=${c3}:nb_colors=4:speed=0.012:type=${ty}:seed=${seed}:d=8:r=25" \
    -vf "noise=alls=7:allf=t,vignette=PI/4.2,drawtext=fontfile=${FONT}:text='REEL ${id}':fontcolor=white@0.92:fontsize=${fs}*2:x=(w-tw)/2:y=(h/2)-th-${fs}*0.3,drawtext=fontfile=${FONT}:text='PLACEHOLDER  ·  ${r//:/\\:}':fontcolor=white@0.6:fontsize=${fs}*0.62:x=(w-tw)/2:y=(h/2)+${fs}*0.6" \
    -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart -an "$OUT/reel-${id}.mp4"
  ffmpeg -y -loglevel error -ss 2.5 -i "$OUT/reel-${id}.mp4" -frames:v 1 -q:v 4 "$OUT/reel-${id}.jpg"
}
# 21:9 CINEMA, 16:9 COMMERCIAL, 9:16 SOCIAL MEDIA (Kristian, 14. 10. 2026.); kao primjer 3 + 5 + 5 klipova
make 01 1680 720  "21:9" 0x0f2a33 0x2f6f73 0xc98a4b 0x1a1410 radial   11
make 02 1680 720  "21:9" 0x231a12 0x7a4b28 0xe0b77a 0x120d09 circular 44
make 03 1680 720  "21:9" 0x101828 0x3a4f7a 0xd9a066 0x0a0c12 linear   77
make 04 1280 720  "16:9" 0x0e1620 0x2b4a7a 0x9fb4c9 0x0a0d12 linear   33
make 05 1280 720  "16:9" 0x0b1a14 0x1f5c45 0x8fd1b0 0x070d0a spiral   55
make 06 1280 720  "16:9" 0x221016 0x6d2a3e 0xe08a8a 0x0e0709 radial   88
make 07 1280 720  "16:9" 0x14140c 0x5c5a2a 0xd8cf8a 0x0a0a06 circular 99
make 08 1280 720  "16:9" 0x0c1418 0x285a66 0xa8d8e0 0x060a0c linear   121
make 09 720  1280 "9:16" 0x1b1030 0x5a2d6b 0xd06a4f 0x0d0a12 linear   22
make 10 720  1280 "9:16" 0x2a0d0d 0x8a2a22 0xf0a07a 0x120606 radial   66
make 11 720  1280 "9:16" 0x0d1a2a 0x2a5a8a 0x9ad0f0 0x060c14 spiral   131
make 12 720  1280 "9:16" 0x1a1a10 0x6a5a2a 0xf0d08a 0x0c0a06 circular 141
make 13 720  1280 "9:16" 0x10201a 0x2a6a4a 0xa0f0c0 0x060c0a linear   151
ls -la "$OUT"
