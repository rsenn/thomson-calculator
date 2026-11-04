# Architecture

## Layout of the repository

| Path | Role |
|---|---|
| `src/app.html` | the page: basic mode form, the Advanced section, the mode switch |
| `src/app.js` | behaviour of the basic mode, the mode switch, persistence; starts the app |
| `src/numbers.js` | parsing and formatting of values: SI prefixes, units, ranges |
| `src/thomson.js` | the formula and `Cover`, the fixed part over a tuning range |
| `src/equations.js` | the network model, its analysis, the schematic and the equation typesetter |
| `src/glyphs.js` | **generated**: glyph outlines of the TeX font (see [typesetting.md](typesetting.md)) |
| `src/network-ui.js` | the Advanced mode, loaded on demand (see [advanced-mode.md](advanced-mode.md)) |
| `src/stylesheets/main.css` | all styles of both modes |
| `src/svg/` | `favicon.svg` (the source of all icons) and the three equation images of the basic mode |
| `src/favicon.{png,ico}` | **generated** from `favicon.svg` |
| `electron/` | the Electron main process and the window icon |
| `src-tauri/` | the Tauri app and its generated icon set |
| `resources/icons/` | the icon electron-builder uses for the packages |
| `tools/` | build-time tools: `favicon.sh`, `glyphs.js`, `equations.js` |
| `test/` | `bun test` suites |
| `doc/` | these documents |

`src/` is plain ES modules with no build step. The same directory is served
by nginx, opened by Electron and shipped inside the Tauri app. Nothing in
`src/` may need a bundler, a transpiler or a server side.

## Runtimes

The code has to behave identically in four places:

1. **Hosted** at `https://transistorisiert.ch/thomson-calculator/`. nginx
   serves `/var/www/html/thomson-calculator`, a symlink to `src/`, so the
   hosted copy is always the working tree. See [pitfalls.md](pitfalls.md) for
   what that means for caching.
2. **Dev server**, `bun run web` (`bun src/app.html`, port 3000). It bundles the
   HTML import. It has two quirks (stale lazily loaded chunk, runtime image
   paths) listed in the pitfalls.
3. **Electron**, `bun run start`: `BrowserWindow` loads `src/app.html` from
   disk; sandboxed renderer, no node integration. Dynamic `import()` of a
   sibling module works over `file://`.
4. **Tauri**, `bun run tauri:dev` or the bundles: the system web view loads
   `src/` as `frontendDist`.

Anything that works in a browser tab and uses only relative URLs works in all
four. Every runtime-built URL (the equation image path in basic mode, the
`import('./network-ui.js')`) must be relative to the module or page.

## Data flow

```
 basic mode                              Advanced mode
 ----------                              -------------
 3 text fields L, C, f                   2 text fields (L network, C network)
   |  numbers.js: Unit, ParseRange         |  network-ui.js: Scan, Expand
   v                                       v
 thomson.js: Thompson, Cover             equations.js: Parse -> ComponentNode tree
   |                                       |  ThomsonEquation(L, C)
   v                                       v
 result text in the fields               schematic()  renderSVG('f')  evaluate()
                                           |            |                |
                                           v            v                v
                                         #schematic   #equation     result table
```

The two modes share only the page, the saved config and `numbers.js`. The
model in `equations.js` knows nothing about the DOM and is covered by
`bun test` without a browser; `network-ui.js` imports DOM-free helpers that
are testable the same way and keeps its DOM access inside a few functions.

## Module loading and start order

`app.js` is loaded as `<script type="module">`. Module scripts are deferred, so
when the module runs the document is usually already `interactive`, and the
start code at the bottom runs `Init()` **immediately**, not on
`DOMContentLoaded`. Consequences, all of which have bitten once:

- `Start()` is the last statement of `app.js`. Every module-level `const` and
  `let` that `Init()` reaches must be evaluated before it. A binding declared
  after an early `Start()` call is in its temporal dead zone and throws
  `Cannot access 'x' before initialization`. Function declarations are
  hoisted and are not affected.
- `network-ui.js` is imported lazily by `SetAdvanced()` the first time the
  Advanced mode is shown, so the basic mode loads nothing of it. `equations.js`
  (with `glyphs.js`, 91 KB) is statically imported by `app.js` and therefore
  always loaded.

## Persistence

Settings live in `localStorage` under two keys, both JSON:

| Key | Content |
|---|---|
| `config` | basic mode: `L`, `C`, `f` (the text of the three fields), `selected`, `precision` |
| `config.advanced` | `advanced` (the mode switch), `networkL`, `networkC` (the texts of the two fields) |

`SaveConfig()` runs every 500 ms and on mode changes. It writes a key **only
if its content differs from what this tab last read or wrote**. That makes an
idle tab harmless; before this rule every open tab rewrote the whole config
twice a second with its own stale memory, which erased what was typed in
another tab (the cause of "the Advanced fields are empty after a reload").
Advanced mode has its own key so that a tab running an older version, which
only knows `config`, cannot erase it.

`LoadConfig()` merges both keys; the advanced keys win over any legacy copy in
`config`.

## Conventions

- **ChangeLog**: `ChangeLog` in GNU style, newest first, one header per day,
  written in the same change as the code (rules in `CLAUDE.md`).
- **Commits**: no `Co-Authored-By` and no `Claude-Session` trailers (`CLAUDE.md`).
- **Bun, not node**: scripts run with `bun`, tests with `bun test test/`.
- **Tests**: `test/equations.test.js` covers the model, the typesetter output,
  the schematic and the DOM-free parts of the Advanced mode; `numbers.test.js`
  and `thomson.test.js` the basic mode. The Advanced mode DOM code is checked by
  hand in a browser; there is no browser test suite yet (see `../TODO`).
- **Generated files** are never edited by hand: `src/glyphs.js`,
  `src/favicon.*`, `src/svg/*-equation.svg`, `src-tauri/icons/*`,
  `resources/icons/512x512.png`, `electron/icon.png`. [icons.md](icons.md) and
  [typesetting.md](typesetting.md) name the command for each.
- **Names**: functions and exported helpers are `PascalCase` in `equations.js`
  and `network-ui.js` (matching the older code), methods `camelCase`.

## Dependencies

Runtime: none. Everything in `src/` is self-contained.

Build time only: `mathjax-full` (pre-renders the basic equations and is the
source of the glyph outlines), `electron`, `electron-builder`, `@tauri-apps/*`.
System tools used by `tools/favicon.sh`: `rsvg-convert`, `python3`, `bunx`.
