# Icons and generated assets

There is **one source** for every icon: `src/svg/favicon.svg`. Everything else
is generated from it by `tools/favicon.sh`; run it after the SVG changes.

```sh
tools/favicon.sh
```

Needs `rsvg-convert` (librsvg), `python3` and `bunx` (for `tauri icon`).

## What it writes

| File | Content | Used by |
|---|---|---|
| `src/favicon.png` | 16×16 PNG | browser tab (`<link rel="icon">`) |
| `src/favicon.ico` | 6 layers (16, 32, 48, 64, 128, 256 px), each stored as PNG, 28 KB | browser (`<link rel="shortcut icon">`) |
| `resources/icons/512x512.png` | 512×512 PNG | electron-builder (`directories.buildResources`, `linux.icon`) |
| `electron/icon.png` | 256×256 PNG | the Electron window (`BrowserWindow.icon`) |
| `src-tauri/icons/*` | the Tauri icon set: `32x32`, `128x128`, `128x128@2x`, `icon.png`, `icon.icns`, `icon.ico`, the Windows `Square*Logo.png` and `StoreLogo.png` | Tauri bundles (`bundle.icon` in `tauri.conf.json`) |

Notes on the choices:

- The `.ico` is written by a small Python function, not ImageMagick: ImageMagick
  stores the small layers as uncompressed bitmaps and produced 113 KB; PNG
  layers give 28 KB and every current system reads them.
- `electron/` is in the `build.files` of `package.json` and therefore packaged;
  `resources/` is not. That is why the window icon lives in `electron/`. A
  16 px window icon was scaled up by the window manager into a blur.
- `tauri icon` also writes `android/`, `ios/` and `64x64.png`; the script deletes
  them to keep the bundle slim. `tauri.conf.json` lists only the files that are
  kept.
- The Tauri bundle icons have only been built on Linux. The `.icns` and Windows
  files are generated but untested (see `../TODO`, `desktop-app-verification`).

## Other generated assets

| Command | Output | Document |
|---|---|---|
| `bun run glyphs` | `src/glyphs.js` | [typesetting.md](typesetting.md) |
| `bun run equations` | `src/svg/{freq,inductance,capacitance}-equation.svg` | [typesetting.md](typesetting.md) |

None of them runs automatically; commit the output together with the change that
made it necessary.

## Building the apps

`package.json` scripts, from the README: `bun run start` (Electron),
`web`, `tauri:dev`, `electron:pack`, `electron:dist` (AppImage and `.deb` in
`release/`), `tauri:build` (bundles in `src-tauri/target/release/bundle/`),
`build` (both). Electron bundles Chromium (about 100 MB); Tauri uses the system
web view (about 3 MB binary).
