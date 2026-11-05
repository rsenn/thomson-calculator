# Thomson calculator

Calculator for Thomson's formula, the resonant frequency of an LC tank:

    f = 1 / (2π √(L·C))

Enter any two of inductance, capacitance and frequency and it solves for the
third. Every field also takes a **range**, so a tuning band comes out as a
band, or as the one fixed part that covers it.

Hosted at <https://transistorisiert.ch/thomson-calculator/>, and available as
a desktop app (Electron and Tauri) built from the same `src/` directory.

## Using it

Click the label of the quantity you want solved (**L**, **C** or **f**); the
other two are inputs. Results update as you type, or press Enter.

- **Units:** SI prefixes `y z a f p n µ (or u) m k M G T P E Z`, and the base
  units `H`, `F`, `Hz` are accepted: `4.7n`, `10 pF`, `87.5MHz`, `1e-6`.
- **Ranges:** `87.5 - 108 MHz`, `87.5..108MHz`, `2-20pF`. A first value without
  a prefix takes the prefix of the second, so `2-20pF` is 2 pF to 20 pF.
- **Precision:** 0 to 9 decimals (default 3), by slider, number box or mouse
  wheel.
- **Copy:** double-click a field to copy its value.
- The fields are remembered between visits (browser `localStorage`, or the
  app's own profile).

### Ranges, and a fixed part with a tuning range

With a range on only one input, the output is the range it requires: a band of
`87.5 - 108 MHz` with a fixed `10pF` needs `217.166 - 330.845 nH`.

When both the **frequency** and the **other component** are ranges, the
output is a single fixed value that lets the range cover the band. For the FM
band with a `2-20pF` trimmer:

    L = 423.817 nH   tunes 54.666 - 172.869 MHz
                     (any value from 165.422 nH - 1.086 µH covers the band)

The value is the geometric centre of the valid interval, which leaves the same
margin at both band edges. If the tuning range is too small the note says so
and gives what it can cover. Values that were rounded for display are given a
small tolerance (`10^-precision`, at most 1%), so a band that fits exactly is
not reported as too small after a round trip.

## Running

Needs [Bun](https://bun.sh).

    bun install
    bun run web          # serve src/ on http://localhost:3000
    bun run start        # Electron window
    bun run tauri:dev    # Tauri window (needs Rust, see below)
    bun test test/       # unit tests

`src/` is plain ES modules with no build step, so it is hosted as it is.

## Building

| Command | Result |
|---|---|
| `bun run electron:pack` | unpacked app in `release/linux-unpacked/` |
| `bun run electron:dist` | AppImage and `.deb` in `release/` |
| `bun run tauri:build` | Tauri bundles in `src-tauri/target/release/bundle/` |
| `bun run build` | both of the above |

Electron's `.deb` installs to `/opt/thomson-calculator`. It bundles Chromium
(about 100 MB).

Tauri uses the system web view, so it is small: the binary is about 3 MB and
the `.deb`/`.rpm` about 1.3 MiB, installing `/usr/bin/thomson-calculator`.
Needs Rust 1.90+ and, on Linux, the WebKitGTK 4.1 and GTK 3 development
packages. The default targets are `deb`, `rpm`, `nsis`, `msi`, `app` and
`dmg` (only Linux has been built so far). The AppImage is left out of the
defaults because it carries WebKitGTK and comes to about 80 MB:

    bun run tauri:build -- --bundles appimage

## Source

| Path | |
|---|---|
| `src/app.html`, `src/app.js` | the page and its behaviour |
| `src/numbers.js` | parsing and formatting of values, units and ranges |
| `src/thomson.js` | the formula, and the fixed-part-over-a-tuning-range solver |
| `src/equations.js` | models, draws and solves composed LC networks |
| `src/network-ui.js` | the Advanced mode: L and C of a tank as networks, schematic, equation, solve |
| `src/glyphs.js` | generated glyph outlines for the equations (`bun run glyphs`) |
| `tools/` | icon, glyph and equation generators |
| `doc/` | the design documents, the source of truth (start with `doc/README.md`) |
| `electron/main.js` | Electron main process |
| `src-tauri/` | Tauri app |
| `test/` | `bun test` suites |

### `src/equations.js`

A network is a two-terminal series/parallel tree of inductors and capacitors.
`+` is series, `|` is parallel (binds tighter), a part is a name with an
optional value; names start with `L` or `C`. A value `a..b` makes a part
adjustable (a knob moves it); the model holds the range and evaluating at a
knob position is left to the caller.

```js
import { Parse } from './src/equations.js';

const net = Parse('(L1=1u | C1=10p) + C2=40p');

net.resonances();
// [{ f: 22.5e6, type: 'series' }, { f: 50.3e6, type: 'parallel' }]

net.solve('C2', 20e6, {}, { type: 'series' });   // C2 for a 20 MHz zero
net.band('C2', [20e-12, 60e-12]);                // band a resonance sweeps

net.schematic();      // small vertical schematic, a complete <svg> string
net.equationSVG();    // Z(jω) = …, typeset with fractions, as <svg>
```

`resonances()` scans the reactance for sign changes and bisects each one;
`solve()` bisects a component value, since every resonance falls as any
component grows. A zero/pole pair closer than one scan cell (about 0.4%) can
be missed unless `points` is raised.

## Advanced mode

Tick **Advanced** (top right) to enter the inductance and the capacitance of
the tank as networks of parts: `(100n | 47n) + 250n` for L, `Cosc=3.8p..85.8p |
Ctrim=3.5p` for C (`+` series, `|` parallel, `a..b` an adjustable part).
You get the schematic, the Thomson equation of the two networks, and L, C and
f over the whole knob range; click a part in either drawing to solve for its
value. See `doc/advanced-mode.md`. What is planned (knob curve, tracking,
padder synthesis, tolerance) is in `doc/` and `TODO`.

## License

MIT. See `LICENSE`.

## Hosted version and offline use

Every push to `main` is tested and deployed to GitHub Pages by
`.github/workflows/pages.yml` (Settings, Pages, Source: GitHub Actions). The
page can be installed as an app (Chrome: install icon in the address bar,
Android: Add to Home screen, iOS: Share, Add to Home Screen) and then works
offline. A new version is fetched in the background and used the next time
the app is opened. `bun run pwa` builds the same `dist/` locally.
