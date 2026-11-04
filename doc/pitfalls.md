# Pitfalls

Mistakes made while building this, and the rules that came out of them. Each
entry says what happened, why, and how to avoid it. Add to it when something
costs more than ten minutes.

## Module start order: `Start()` last

**What happened.** The Advanced fields did nothing on the hosted page until the
Advanced checkbox was switched off and on, then worked. Console:
`ReferenceError: Cannot access 'network' before initialization`. A second
variant of the same mistake broke the page again a little later (`saved`).

**Why.** `app.js` is a deferred module, so on a page that is already loaded
`Init()` runs the moment the module reaches the start code. That code was
near the top of the file; a `let network;` and a `const saved = {}` declared
further down were still in their temporal dead zone. The dev server happened to
start the app on `DOMContentLoaded`, after the whole module had run, so the bug
only showed on the nginx page.

**Rule.** `Start()` is the last statement of `app.js`; anything `Init()` reaches
at module level is declared above it. Test the hosted page, not only the dev
server, after touching start-up code.

## Several tabs overwrote the saved config

**What happened.** The Advanced fields were empty after a reload while the basic
fields were kept.

**Why.** `SaveConfig()` wrote the whole config from the tab's memory every
500 ms. Another tab of the app (an old one, or one left open with a stale
script) rewrote the shared `localStorage` entry with its own copy, and erased
newer data. Detected by a `storage` event listener: four foreign writes in two
seconds.

**Rule.** Write a key only when its content changed since this tab last read or
wrote it; keep unrelated features in separate keys (`config`, `config.advanced`).
See [architecture.md](architecture.md).

## The browser keeps old modules (nginx without cache headers)

**What happened.** After an update the hosted page showed the new HTML with the
old stylesheet (values under their labels instead of beside them), or ran the
old `app.js` against the new HTML, or mixed old and new modules.

**Why.** nginx sends `Last-Modified` and `ETag` but no `Cache-Control` for static
files; the browser may keep a file for a fraction of its age without asking.
The files of a module graph are not versioned, so one stale file breaks the set.

**Rule.** After deploying, hard-reload once (Ctrl+Shift+R). A permanent fix is
`add_header Cache-Control "no-cache";` in the nginx location of
`/thomson-calculator/` (revalidates every time; cheap thanks to the ETag), see
`../TODO`, `nginx-cache-control`. Do not conclude "my fix does not work" from a
page that was not hard-reloaded: check the served file with `curl` and the
console line numbers of the error.

## The dev server (`bun src/app.html`)

- A lazily loaded module (`import('./network-ui.js')`) is bundled as its own
  chunk and **can stay stale after an edit**: the page keeps running the old code
  until the server is restarted. When a change "does nothing", restart the
  dev server first.
- It only serves assets referenced from the HTML. The basic mode sets
  `img.src = 'svg/<name>-equation.svg'` at run time, which returns the HTML page
  for that path, so the equation image breaks after switching the solved field.
  This predates the Advanced mode (`../TODO`, `dev-server-runtime-image`). The
  hosted page, Electron and Tauri serve the files and are not affected.
- Stop it with `kill <pid>`; `pkill -f <pattern>` kills the shell that runs it
  when the pattern appears in the command line itself.

## Generated glyph paths

MathJax path data has no leading `M` and no closing `Z`; drawing it raw shows
nothing. Math italic letters are stored in the `normal` variant at `U+1D4xx`,
not in `italic`. A global `replace` of `width`/`height` on an SVG string also
rewrites the bars (`<rect>`) of fractions and removes their size: only touch the
root element. See [typesetting.md](typesetting.md).

## LaTeX source

`j\omega L` needs the space: `j\omegaL` is an unknown command and MathJax prints
an error box instead of failing. When generating LaTeX from a model, check the
result by rendering it once (`RenderLaTeX`).

## Parser details

- `Parse()` separates tokens at white space, so `10 u` is two tokens; the
  Advanced mode joins a value and its unit itself (`TOKENS` in `network-ui.js`).
- A value `0` is rejected (`> 0`), also as the start of a range, because a part
  of 0 F or 0 H makes the reactance singular. Model a trimmer at its set value.
- A range part's `value` is its **maximum**. Code that overrides a value to
  evaluate at a knob position must pass the value in the `values` map; setting
  `.value` would change the model.

## SVG details

- A hit rectangle must use `fill="transparent"`; `fill="none"` receives no
  pointer events.
- `data-part` values are escaped (`&`, `"`, `<`).
- The `color` attribute of the SVG root is what `currentColor` resolves to; a
  CSS `color` on a `g[data-part]` recolours one part, which is how selection
  works.
- A rule such as `fill="none"` on the parent group is inherited by everything
  inside it: elements that need a fill must set it.

## Layout of the result table

A table with `width: 1%` cells stretches to the full width when the table has no
width of its own (percentage widths make the auto layout fill the container).
Plain `auto` layout gives the wanted behaviour: columns as wide as their
content, the name column equally wide in every row.

## Working notes

- The browser tools drive the user's own Chrome profile: `localStorage` is
  shared with the real app. Test input changes persisted config; mention it.
- Use `curl --resolve transistorisiert.ch:443:127.0.0.1` against the local nginx
  to compare the served file with the working tree (`md5sum`).
- Do not write `Co-Authored-By` or `Claude-Session` lines in commits (`CLAUDE.md`).
