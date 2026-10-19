#!/usr/bin/env bash
# Privremeni videi za drugi slide (tri karte), 1920x1080, petlja od 8 s, s malim natpisom PLACEHOLDER u kutu.
# Pokretanje iz mape artificial-media-v3:  bash tools/make_card_placeholders.sh
set -e
FONT="${FONT:-/usr/share/fonts/opentype/inter/Inter-SemiBold.otf}"
OUT="video/cards"; mkdir -p "$OUT"
make() {   # broj boja0 boja1 boja2 boja3 tip seed
  ffmpeg -y -loglevel error -f lavfi -i "gradients=s=1920x1080:c0=$2:c1=$3:c2=$4:c3=$5:nb_colors=4:speed=0.01:type=$6:seed=$7:d=8:r=25" \
    -vf "noise=alls=6:allf=t,vignette=PI/4.5,drawtext=fontfile=${FONT}:text='PLACEHOLDER  ·  CARD $1':fontcolor=white@0.45:fontsize=22:x=w-tw-40:y=h-th-36" \
    -c:v libx264 -preset medium -crf 26 -pix_fmt yuv420p -movflags +faststart -an "$OUT/card-$1.mp4"
  ffmpeg -y -loglevel error -ss 1 -i "$OUT/card-$1.mp4" -frames:v 1 -q:v 4 "$OUT/card-$1.jpg"
}
make 1 0x2a0a0a 0x8a1e1a 0xe0785a 0x120505 radial   201   # emocija: toplo crveno
make 2 0x120a2a 0x4a2a8a 0x9a7ae0 0x06040f spiral   202   # mašta: ljubičasto
make 3 0x041418 0x0e5a66 0x7ad0d8 0x020809 linear   203   # dalje od kamere: hladno plavo-zeleno
ls -la "$OUT"
