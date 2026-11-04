# Typesetting the equations

The equations are **vector graphics made of glyph outlines**, not text. They
therefore look the same on every machine, scale without blurring and need no
installed font. Two routes lead to them, deliberately:

1. the **runtime typesetter** in `src/equations.js` (boxes, TeX metrics, glyphs
   from `src/glyphs.js`), which can draw the equation of *any* network the
   user types, with no dependency at run time;
2. **MathJax at build time** (`tools/equations.js`), which renders LaTeX source
   to SVG and produces the three fixed images of the basic mode.

Both start from the same model: `toLaTeX()` gives the source for route 2, and
the typesetter of route 1 is a small TeX-metrics layout engine that follows the
same rules. They look alike on purpose (same font, same rules); the images of
route 2 are the reference against which route 1 was judged.

## The glyph atlas (`src/glyphs.js`, generated)

`bun run glyphs` (`tools/glyphs.js`) reads MathJax's TeX font data
(`mathjax-full`, `TeXFont.defaultChars`, the Computer Modern outlines) and
writes `src/glyphs.js`. Do not edit it.

A glyph is `[advance, height, depth, path]`; the metrics are in 1/1000 em and the
outline is in font units (1000 per em, **y up**). Two exports:

- `GLYPHS`: keyed by the character. `'*' + char` is the **math italic** form
  (variables), the bare char the upright one. Contents: digits, Latin letters
  in both forms, Greek lower case (italic only, as in TeX; the lookup falls
  back to it for the upright request), Greek upper case (upright), the
  operators `+ = ( ) [ ] | / , . : ; ! %`, the minus `U+2212` and the middle dot
  `U+00B7`/`U+22C5`.
- `DELIMS`: `( ) [ ]` and the radical `√` in the five TeX sizes (1, 1.2, 1.8, 2.4
  and 3 em), as arrays of five glyphs.

Facts about the MathJax data worth knowing, because they cost time once:

- the path strings in MathJax lack the leading `M` and the closing `Z`; the
  generator adds both;
- math italic letters are stored in the **`normal`** variant at the Unicode
  mathematical italic code points (`U+1D434` for A, `U+1D44E` for a, with the
  exception of h at `U+210E`; Greek italic from `U+1D6FC`), not in the `italic`
  variant, which holds only punctuation;
- the size variants of delimiters are the variants `-smallop`, `-largeop`,
  `-size3`, `-size4`.

The atlas is about 91 KB and is loaded by every page because `app.js` imports
`equations.js` statically (see `../TODO`, `trim-glyph-set`).

## Boxes

The typesetter builds **boxes**: `{ w, a, d, draw(x, y) }`, a width, an ascent
above and a descent below the baseline, and a function that returns the SVG
fragment for a given origin. `y` is the baseline. Constructors:

| Box | Notes |
|---|---|
| `Text(str, fs, italic)` | glyph by glyph; width is the sum of the advances; no kerning |
| `Sym(name, fs)` | a part name: first letter italic, the rest a subscript (`L1` is L with subscript 1, `Ctrim` is C with subscript "trim"); tagged with `data-part` |
| `Script(base, fs, sub, sup)` | sub- and superscript at 0.7 of the size |
| `Row(items, fs, gap)` | horizontal list; `gap` in em |
| `Op(str, fs, relation)` | operator with TeX spacing |
| `Sum(items, fs)` | items joined by `+`; sets `sum: true` so the user can parenthesize it |
| `Frac(num, den, fs)` | fraction |
| `Paren(box, fs, [l, r])` | delimiters of the right size |
| `Sqrt(box, fs)` | radical |
| `Part(name, box)` | wraps a box in `<g data-part>` with a transparent hit rectangle |
| `Page(box, fs, color, margin)` | the complete `<svg>`; `color` defaults to `#1a1a1a` |

An SVG made by `Page` contains one `<g fill="currentColor">`; colour comes from
the `color` attribute of the root and so from CSS. This is what lets the Advanced
mode colour a selected part: `g[data-part].sel { color: … }`.

## TeX metrics used

All values in em of the box size `fs`, display style:

- axis height 0.25, rule thickness θ = 0.04;
- **fraction**: numerator baseline raised by `max(0.677, axis + θ/2 + 3θ + num.depth)`,
  denominator baseline lowered by `max(0.686, den.ascent + 3θ − (axis − θ/2))`;
  the bar is as wide as the wider part, with 0.12 em of space at both sides;
- **delimiters**: the smallest of the five sizes whose height + depth is at
  least 0.901 × twice the distance the content reaches from the axis (TeX's
  delimiter factor), centred on the axis, falling back to the largest;
- **radical**: ψ = θ + ¼·0.431 clearance above the content, the smallest radical
  whose height + depth covers content + ψ + θ, half of any excess added to the
  clearance, the overbar drawn as a rectangle from the radical's right edge;
- **scripts**: size 0.7; subscript lowered by `max(0.15, sub.ascent − 0.8·0.43)`,
  superscript raised by `max(0.413, sup.depth + ¼·0.43)`; 0.05 em of space after;
- **operators**: a binary operator (`+`) has 4/18 em on each side, a relation
  (`=`) 5/18 em;
- juxtaposition (`LC`, `4π²Cf²`) has no space; the code uses a gap of 0.04 em
  between factors to keep letters from touching.

There is no italic correction and no kerning. If a glyph pair ever looks wrong,
that is where to look.

## Equations produced

| Function | Equation |
|---|---|
| `ThomsonEquation#renderSVG('f')` | `f = 1 / (2π √(L C))` |
| `renderSVG('L')` | `L = 1 / (4π² C f²)` |
| `renderSVG('C')` | `C = 1 / (4π² L f²)` |
| `Network#equationSVG()` | `Z(jω) = …`, the impedance of the network |

A composed network stands in for L or C as a **factor**, in parentheses when it
is a sum: `(L₁·L₂/(L₁+L₂) + L₃)`; on the left side it is `L_eq` or `C_eq`. The
closed form of a parallel pair is `L₁L₂/(L₁+L₂)`, of more than two
`1/(1/L₁ + 1/L₂ + …)`. The impedance mirrors the structure: a series group is a
sum of impedances, a parallel group is `1 / (sum of admittances)`, a lone
inductor is `jωL`, a lone capacitor `1/(jωC)`; the two functions `ZBox` and
`YBox` call each other and the type size shrinks by 10 % per nesting level down
to 60 %.

## LaTeX output

`toLaTeX()` returns the source of the same equation:
`f = \frac{1}{2\pi\sqrt{LC}}`, with `\left( … \right)` around sums and `L_{1}`,
`C_{\mathrm{trim}}` for names (digits as is, letters upright). It exists to feed
MathJax and is the way to get an equation into a paper. `jω` is written
`j\omega L`; **keep the space after `\omega`**, `\omegaL` is not a command.

## MathJax tool (`tools/equations.js`)

`bun run equations [em]` renders `toLaTeX()` of the tank `L`, `C` with MathJax
(TeX input, SVG output, `fontCache: 'none'` so every glyph is an inline path)
into `src/svg/freq-equation.svg`, `inductance-equation.svg` and
`capacitance-equation.svg`, sized at `em` px per em (default 48). The module
also exports `RenderLaTeX(tex, em)` for any LaTeX string. Only the root `<svg>`
element's attributes are rewritten (a width/height rewrite of the whole string
removes the sizes of the `<rect>` fraction bars; that was a bug).

The images are loaded by the basic mode with `<img>`, so `currentColor` does
not reach them and they render in black.

## Choices and rejected alternatives

- **System fonts via `<text>`** (the first implementation): depends on the
  machine, glyph widths had to be guessed. Rejected.
- **MathJax at run time**: about a megabyte, for a feature that needs it only for
  composed networks. Rejected in favour of the atlas, which is 91 KB and was
  measured to match the MathJax output.
- **KaTeX**: produces HTML plus webfonts, not self-contained SVG.
- **Own layout engine with a different font** (STIX Two, Fira Math): possible by
  swapping the glyph source in `tools/glyphs.js`; heavier strokes, a different
  character from classic LaTeX. Not wanted so far.

## Open points

See `../TODO`: `equation-radical-clearance` (the radical's bar nearly touches
the fraction bar in tall denominators) and `trim-glyph-set`.
