#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p src/assets/hd/avatars src/assets/hd/clues src/assets/hd/locations

rsvg-convert -w 1600 -h 2653 src/assets/town-map.svg -o src/assets/hd/town-map-hd.png

if command -v magick >/dev/null 2>&1 && [[ -f docs/assets/mockup-investigation-interrogation.png ]]; then
  magick docs/assets/mockup-investigation-interrogation.png -crop 64x64+877+137 -resize 768x768 -unsharp 0x0.75+0.75+0.02 src/assets/hd/avatars/cafe-shen.png
  magick docs/assets/mockup-investigation-interrogation.png -crop 64x64+877+252 -resize 768x768 -unsharp 0x0.75+0.75+0.02 src/assets/hd/avatars/doctor-bai.png
  magick docs/assets/mockup-investigation-interrogation.png -crop 64x64+877+367 -resize 768x768 -unsharp 0x0.75+0.75+0.02 src/assets/hd/avatars/librarian-lin.png
  magick docs/assets/mockup-investigation-interrogation.png -crop 64x64+877+483 -resize 768x768 -unsharp 0x0.75+0.75+0.02 src/assets/hd/avatars/reporter-xu.png
  magick docs/assets/mockup-investigation-interrogation.png -crop 64x64+877+618 -resize 768x768 -unsharp 0x0.75+0.75+0.02 src/assets/hd/avatars/mayor-zhou.png
else
  for source in src/assets/avatars/*.svg; do
    name="$(basename "$source" .svg)"
    rsvg-convert -w 768 -h 768 "$source" -o "src/assets/hd/avatars/$name.png"
  done
fi

for source in src/assets/clues/*.svg; do
  name="$(basename "$source" .svg)"
  rsvg-convert -w 800 -h 550 "$source" -o "src/assets/hd/clues/$name.png"
done

for source in src/assets/locations/*.svg; do
  name="$(basename "$source" .svg)"
  rsvg-convert -w 1600 -h 720 "$source" -o "src/assets/hd/locations/$name.png"
done
