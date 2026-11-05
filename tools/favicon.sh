#!/bin/sh
# regenerate src/favicon.{png,ico}, src/icons/ from src/svg/favicon.svg
set -e
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
for s in 16 32 48 64 128 256; do
  rsvg-convert -w $s -h $s src/svg/favicon.svg -o "$tmp/$s.png"
done
cp "$tmp/16.png" src/favicon.png
python3 - "$tmp" src/favicon.ico <<'PY'
import struct, sys
d, out = sys.argv[1:3]
sizes = [16, 32, 48, 64, 128, 256]
imgs = [open('%s/%d.png' % (d, n), 'rb').read() for n in sizes]
off = 6 + 16 * len(sizes)
ent = b''
for n, img in zip(sizes, imgs):
    ent += struct.pack('<BBBBHHII', n % 256, n % 256, 0, 0, 1, 32, len(img), off)
    off += len(img)
open(out, 'wb').write(struct.pack('<HHH', 0, 1, len(sizes)) + ent + b''.join(imgs))
PY
rsvg-convert -w 512 -h 512 src/svg/favicon.svg -o resources/icons/512x512.png
# PWA icons: any-purpose plus a maskable one (artwork inside the 80 percent
# safe zone on the page background) and the iOS home screen icon
mkdir -p src/icons
rsvg-convert -w 192 -h 192 src/svg/favicon.svg -o src/icons/icon-192.png
rsvg-convert -w 512 -h 512 src/svg/favicon.svg -o src/icons/icon-512.png
rsvg-convert -w 360 -h 360 src/svg/favicon.svg -o "$tmp/inner.png"
convert -size 512x512 xc:white "$tmp/inner.png" -gravity center -composite src/icons/icon-maskable-512.png
convert -size 180x180 xc:white \( src/icons/icon-192.png -resize 150x150 \) -gravity center -composite src/icons/apple-touch-icon.png
# electron window icon (electron/ is packaged, resources/ is not)
cp "$tmp/256.png" electron/icon.png
# tauri icon writes the whole set (and android/ios dirs, which we drop)
rsvg-convert -w 1024 -h 1024 src/svg/favicon.svg -o "$tmp/1024.png"
bunx tauri icon "$tmp/1024.png" -o src-tauri/icons >/dev/null
rm -rf src-tauri/icons/64x64.png src-tauri/icons/android src-tauri/icons/ios
