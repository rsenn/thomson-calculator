# The network model

`src/equations.js` holds the model, its analysis, the schematic and the
equation typesetter. This document covers the model and the analysis; the
drawing parts are in [schematic.md](schematic.md) and
[typesetting.md](typesetting.md). The module is DOM-free.

## Parts and groups

A network is a tree:

- `ComponentNode(name, value, kind, range)`: a leaf, one inductor or
  capacitor. `kind` is `'L'` or `'C'`, by default the upper-cased first letter
  of the name; a name that starts with anything else is an error.
- `SeriesGroup(nodes)` and `ParallelGroup(nodes)`: inner nodes. A group built
  from a group of the same type is flattened (a series of a series is a series).
- Common base class `Network` with the analysis methods below.

The model deliberately has **no notion of an adjustable part's position**. A
part may carry a `range`, but evaluating the network at a knob position is the
caller's business (see [knob-curve.md](knob-curve.md)): pass a `values` map
that overrides the part values.

### Ranges

`ComponentNode.range` is `[min, max]` or absent. For a range part:

- `value` is the **maximum**. Every function that evaluates a network without
  an override therefore sees the part at the top of its range, and nothing
  that predates ranges had to change. Keep this invariant.
- the range is positive and increasing; the minimum may not be 0 (a 0 pF
  trimmer would give a zero capacitance and an infinite reactance; model a
  trimmer by its set value instead).
- `toText()` writes `name=min..max`; the schematic labels it and draws the
  adjustable mark.

## Text syntax

`Parse(str)` builds a tree from text:

```
network   := series
series    := parallel ( '+' parallel )*        series connection
parallel  := atom ( '|' atom )*                parallel connection (binds tighter)
atom      := '(' series ')' | part
part      := name [ '=' value ]
value     := number [unit] | number [unit] '..' number [unit]
```

- Tokens are separated by white space; `||` is accepted for `|`. Inside a
  token, spaces are only allowed around `=`.
- `value` goes through `numbers.js`: `Unit()` for a single value, `ParseRange()`
  for `a..b` (the unit or SI prefix of the second end is given to the first
  when the first has none: `5..60p`). Accepted prefixes: `y z a f p n µ u m c d
  k M G T P E Z`. The base units `H`, `F`, `Hz` are accepted and ignored.
- A bad value, a reversed range or a range starting at 0 is a `SyntaxError`.
- Errors carry the whole input in the message.

`toString()` / `toText()` writes the same syntax back, with values rounded
to six significant digits.

The Advanced mode does not use `Parse` directly on what the user types; it
first rewrites it (bare values, units after a space), see
[advanced-mode.md](advanced-mode.md).

## Analysis

All of these are methods of `Network` (so of every node).

| Method | Result |
|---|---|
| `components()` | the distinct parts in order of appearance |
| `leaves()` | all parts, including a name that occurs twice |
| `values()` | `{ name: value }` of the parts that have a value (a range part: its maximum) |
| `reactance(w, values)` | the reactance X of the network at angular frequency w |
| `evaluate(values)` | the effective L (or C) of a network of one kind; throws for a mixed network |
| `resonances(values, opts)` | `[{ f, w, type }]`, ascending; `type` is `'series'` (impedance zero) or `'parallel'` (pole) |
| `resonance(values, {type, index})` | one of them |
| `solve(name, target, values, opts)` | the value of part `name` that puts a resonance at `target` Hz |
| `band(name, [lo, hi], values, opts)` | the `[fmin, fmax]` a resonance covers while the part is swept |
| `toJS(prefix)` | a JavaScript expression of the effective value |

`values` is always an override map: a part named in it takes that value,
others use their own `value`. A part with no value anywhere is an error
(`no value for L3`) when something needs it.

### Effective values

`evaluate()` is the closed form: inductors add in series and combine as
`1/Σ(1/L)` in parallel; capacitors the other way round. It works for a network
of **one kind** only, which is exactly what the Advanced mode's two fields
are.

### Resonances

`resonances()` scans the reactance on a logarithmic grid (default 2400 cells,
about 0.4 % each) between `fmin` and `fmax` (defaults that contain every
resonance) and bisects each sign change. A rise through zero is a series
resonance, a fall through a pole a parallel one. Cells that fall without a
sign change are refined (a zero and a pole closer than one cell). Raise
`points` when two resonances are closer than 0.4 %.

### Monotonicity

For a lossless LC network **every resonance frequency falls monotonically as
any single part value grows**. Three things rest on it:

- `solve()` bisects the part value in the logarithmic domain (80 steps,
  default search range 1 pH..1 H for inductors and 1 fF..1 mF for capacitors,
  both overridable) and throws a `RangeError` when the target is outside what
  the part can reach;
- `band()` needs only the two ends of the sweep;
- tolerance analysis is exact at the corners (see [design-tool.md](design-tool.md)).

The tank of the Advanced mode, `new ThomsonEquation(L, C).network()`, is the
parallel group of the two networks; its one resonance is of type `'parallel'`.

## `ThomsonEquation`

`new ThomsonEquation(Lnet, Cnet)` is the Thomson formula for a tank of two
networks.

| Method | Result |
|---|---|
| `evaluate(values)` | `{ Leq, Ceq, freq }` |
| `calculateFrequency(values)` | f |
| `calculateTargetEquivalent('L' \| 'C', values)` | the L or C a given `values.f` needs |
| `network()` | the tank as a `ParallelGroup`, for `resonances()`, `solve()`, `schematic()` |
| `renderSVG(target, opts)` | the equation for `'f'`, `'L'` or `'C'` as an `<svg>` string |
| `toLaTeX(target)` | the same equation as LaTeX source |
| `drawCircuit(opts)` | the schematic of the tank |

## Basic-mode helpers outside the model

`thomson.js` has `Thompson.calculate(L, C)`, `Thompson.inverse(f, LC)` and
`Cover(f, Y, tol)`: a fixed part X against a variable part Y tuned over the band
f. `Cover` returns the valid interval for X, its geometric centre (equal margin
at both band edges), whether it is feasible and the band it really covers; `tol`
forgives values that were rounded for display. The basic mode is a fixed
two-part special case of what the model does in general, and the two are
tested against each other (`test/equations.test.js`).

## Tests

`test/equations.test.js` covers: effective values, `Parse` errors, resonances,
`solve` and `band` against the closed form, `ThomsonEquation` against the
general solver, range parsing and `toText`, schematic dots and marks, the SVG
output being complete (no `NaN`, `undefined`).
