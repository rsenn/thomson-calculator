# The knob curve

**Status: planned. Nothing in this document is implemented.** It is the next
feature (`../TODO`, `knob-curve`). It builds on [model.md](model.md) (ranges are
there already), [advanced-mode.md](advanced-mode.md) and the data in
[polyvaricon.md](polyvaricon.md).

## Purpose

Once a part has a range, the Advanced mode shows the two ends of the tuning
band. What it cannot show is **what happens in between**, and that is what
decides whether a design is usable:

- Frequency is never a linear function of capacitance, so a plain variable
  capacitor already has a crowded end. A series capacitor (padder) makes it
  worse at one end, a fixed parallel capacitor makes the dial much more
  linear but shrinks the range. A hand calculation for a 5 to 60 pF capacitor
  with a straight-line law gives these numbers (the test vectors below):

  | Network | C_eff | f ratio | half-way point of the knob is at |
  |---|---|---|---|
  | the capacitor alone | 5 … 60 pF | 3.464 | 85 % of the frequency span |
  | in series with 10 pF | 3.33 … 8.57 pF | 1.604 | 90 % |
  | in parallel with 100 pF | 105 … 160 pF | 1.234 | 58 % |

- "A completely distorted tuning range on the knob is of no use": a design that
  needs the whole second half of the dial to cover 10 % of the band cannot be
  tuned by hand. The tool should say so, with numbers, before anything is
  built.

The feature plots frequency against knob position and reports how linear and
how fine the control is.

## Definitions

- **Knob position** θ ∈ [0, 1]. θ = 0 is the stop where every range part has its
  **minimum**, θ = 1 the stop where it has its **maximum**. (For the Mitsumi gang
  the datasheet's "rotation index" is θ × 100; the shaft turns 97 % of a half
  circle, so θ = 1 is a rotation of about 174.6°.)
- **Taper** g: [0, 1] → [0, 1], strictly increasing, g(0) = 0, g(1) = 1. The value
  of a range part with the range [lo, hi] at position θ is

  `v(θ) = lo + (hi − lo) · g(θ)`

  Different parts may have different tapers; all follow the same θ (a gang).
- **Tank curve** f(θ): the Thomson frequency of the tank with every range part at
  `v_i(θ)` and the other parts at their values. For a network of one kind this
  is the closed form (`ThomsonEquation#evaluate`), no resonance scan is
  needed, so a curve of 201 samples is cheap.

Because every part value grows with θ and f falls as any part grows, f(θ) is
**strictly decreasing and invertible** whenever at least one part has a range.
(Where one capacitor and one inductor both have ranges they both push f down;
a combination that moves in opposite senses, which a real mechanism could
have, needs a reversed taper, see "Open questions".)

## Tapers

| Name | g(θ) | Meaning |
|---|---|---|
| `slc` | θ | straight-line capacitance: semicircular plates, the default |
| `slf` | defined by the network | straight-line frequency: the plate shape that makes f linear in θ; computed by inverting f |
| `slw` | defined by the network | straight-line wavelength: λ = c/f linear in θ |
| `log` | defined by the network | constant frequency ratio per step: ln f linear in θ (equal musical intervals) |
| table | interpolated points | a measured or datasheet curve |

`slf`, `slw` and `log` are *targets*: for the network at hand they give the value
the part would need at each θ to make the dial linear in that sense. They show
what an ideal plate shape would do and let the tool report how far a straight-line
part is from it. For a lone variable part in a one-part-tuned tank g can be
written in closed form; in general it is found by bisection on v for each θ.

### Measured tapers (tables)

A table is a list of pairs `(θ_k, s_k)`, the **swing** s_k (the value above the
minimum) at θ_k, as in the datasheets. The part's `lo..hi` already contains the
minimum, so the table is normalised: `g(θ) = s(θ) / s(1)` (the table is
*relative*; only its shape matters, and the swing it implies is checked
against `hi − lo` with a warning when it differs by more than 2 %).

- Interpolation: monotone cubic (Fritsch–Carlson PCHIP). It cannot overshoot
  between points, so g stays increasing; linear interpolation is the fallback
  for fewer than three points. Missing entries (`—` in the Mitsumi FM row) are
  simply omitted.
- Presets: the three Mitsumi curves of [polyvaricon.md](polyvaricon.md) ship as
  data: `mitsumi-2lxt-am-osc` (curve C), `mitsumi-2lxt-am-ant` (curve A),
  `mitsumi-2lxt-fm` (curve B).
- User tables: entered as text, one `θ value` pair per line (θ in percent or
  0..1, either unit of swing), stored in `config.advanced`, named so that a part
  can refer to them. They are what the LC-meter measurements of
  [polyvaricon.md](polyvaricon.md) become.

### Syntax

A taper is attached to a range part after an `@`:

```
Cosc=3.8p..85.8p@mitsumi-2lxt-am-osc | Ctrim=3.5p
C1=5p..60p@slf
```

No `@` means `slc`. `Parse()` (the model) keeps the name in `ComponentNode.taper`
(a string) and nothing else; resolving the name into a function is the job of
the new module below, so the model stays free of the taper catalogue. A
selected part also gets a taper chooser in the part panel, which edits the
field text through the same `SetValue` mechanism.

## Metrics

Computed from the sampled curve (θ_j, f_j), j = 0..N:

- **band**: `f_min`, `f_max`, ratio `r = f_max / f_min`, in octaves `log2 r`.
- **linearity error**: against the straight line between the ends,
  `f_lin(θ) = f(0) + (f(1) − f(0))·θ`. Report `E = max |f − f_lin| / (f_max − f_min)`
  in percent and the θ where it occurs. For a bare 5…60 pF capacitor this is
  large; the parallel-padded one is small. A second figure uses ln f instead
  of f ("in octaves"), because tuning is perceived in frequency ratios.
- **sensitivity** `S(θ) = |df/dθ|`, by central differences, expressed as **Hz per
  percent of the knob**; report it at both ends and its minimum and maximum.
  The **crowding factor** `K = S_max / S_min` is 1 for a perfectly even dial; a
  value above about 3 means one end of the knob is three times more critical than
  the other. Also reported at the ends: the sensitivity in Hz per degree for a
  known rotation angle.
- **fine-tune factor** of a padded design against the bare variable part:
  `B = ln r_bare / ln r`. How many times finer the network made the adjustment;
  the number the "too big trim-cap" use case is about. The "bare" reference
  is the same ranged part alone in the same tank with the padding removed; when
  that cannot be formed (every part is a range part) the factor is omitted.
- **dial positions** of chosen frequencies: for a list of marks (600 kHz,
  800 kHz, …) the θ at which they occur, by inverting the curve. This turns the
  curve into a **dial scale**: a ruler SVG (an arc or a straight scale) with
  the marks where they fall.

A short verdict line sums it up (`usable`, `one end crowded 4.1 : 1`,
`narrow: band 1.23 : 1`), with fixed thresholds that are defined once in the
code and listed in this document when set.

## Architecture

A new **DOM-free module `src/knob.js`**, covered by `bun test` like the model:

```js
Taper(spec)                       // 'slc' | 'slf' | 'slw' | 'log' | { table: [...] } -> g(θ)
ParseTaper(name, catalogue)       // resolves a name from a part
KnobCurve(tank, { points = 201, tapers = {} })
  // -> { theta[], f[], L[], C[], values: { name: number[] } }
CurveMetrics(curve)               // -> { band, ratio, linearity, sensitivity, crowding, ... }
DialMarks(curve, [f1, f2, ...])   // -> [{ f, theta }]
CurveSVG(curve, { log, line, marks, width, height })  // the chart as an <svg> string
```

- `KnobCurve` evaluates `tank.evaluate({ ...values, [name]: v_i(θ) })` for every
  sample; it does not touch the model's classes and needs no change of them
  beyond the `taper` string.
- `CurveSVG` draws axes, grid, labels (with the glyph typesetter's `Text`, so
  the labels match the equations), the curve, the optional straight line for
  comparison and the dial marks. It is a string, like the schematic, so it can
  be tested and reused in the packages.
- The DOM side stays in `network-ui.js`: a **Knob section** under the views,
  shown only when at least one part is a range. It holds the chart, a table of
  the metrics in the style of the result table, the y-axis switch (linear /
  logarithmic), and a hover readout (θ, f and the value of every range part
  at the pointer). Moving the pointer over the chart marks the part values in
  the schematic as a tooltip.

### Test vectors

From the hand calculation above (straight-line law, range 5…60 pF, L irrelevant
to the ratios); implement each as a test:

| Network | f ratio | share of the span covered at θ = 0.5 |
|---|---|---|
| `5p..60p` | 3.464 | 85 % |
| `5p..60p` in series with `10p` | 1.604 | 90 % |
| `5p..60p` in parallel with `100p` | 1.234 | 58 % |

More tests: f(θ) is strictly decreasing; the end samples equal the band the
result table already shows; `slf` makes the linearity error vanish (below 1e-6);
the table taper reproduces the datasheet values at the listed indices
(`36.7 pF` of 140 pF at θ = 0.5 for the antenna curve, within 1e-9) and stays
monotone between them; scaling θ by the 97 % rotation angle gives the degrees.

## Phases

1. **Core**: `src/knob.js` with `slc`, `KnobCurve`, `CurveMetrics`, `CurveSVG`;
   the Knob section with chart and metrics; the test vectors.
2. **Tapers**: `slf`, `slw`, `log`, tables with PCHIP, the three Mitsumi presets,
   the `@taper` syntax, the taper chooser in the part panel.
3. **Dial scale** with frequency marks, hover readout, copy as CSV.
4. **Solve at a knob position**: the Solve panel takes a θ (default: the stop
   that gives the target) so other range parts are held at their value at that
   position instead of at their maximum (`../TODO`, `solve-at-knob-position`).

## Open questions

- **Opposed ranges**: a mechanism where one part grows while another shrinks
  with the knob (an inductor on the same axle). Probably a `@rev` taper
  modifier (g(θ) → 1 − g(θ)) with the range written as usual; decide when a real
  case appears.
- **Inductors**: a slug-tuned inductor is close to linear in the slug position
  over most of its travel but not at the ends. `slc` (linear in the value) is
  the default; a table is the right tool for a measured coil.
- **Trimmers in the sweep**: a screw trimmer is set once, so it stays a fixed
  part. A "trimmer sweep" (how the band moves when the trimmer goes from 0 to
  7 pF) is a different plot, band edges against the trimmer position, and
  belongs to [design-tool.md](design-tool.md).
- **Angle**: whether the chart's x axis should offer degrees for parts with a
  known rotation angle (the Mitsumi 97 % of 180°).
