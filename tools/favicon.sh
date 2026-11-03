#!/bin/sh
# regenerate src/favicon.{png,ico} from src/svg/favicon.svg
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
# electron window icon (electron/ is packaged, resources/ is not)
cp "$tmp/256.png" electron/icon.png
# tauri icon writes the whole set (and android/ios dirs, which we drop)
rsvg-convert -w 1024 -h 1024 src/svg/favicon.svg -o "$tmp/1024.png"
bunx tauri icon "$tmp/1024.png" -o src-tauri/icons >/dev/null
rm -rf src-tauri/icons/64x64.png src-tauri/icons/android src-tauri/icons/ios
