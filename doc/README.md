# Design documents

These documents are the source of truth for what the Thomson calculator is,
how it is built, why it is built that way, and what is still to be done. When
the code and a document disagree, one of them is wrong: fix it in the same
change. `../TODO` lists the open work and points back here; `../ChangeLog`
records what changed and when; `../README.md` is the user-facing summary.

## Reading order

| Document | What it covers | State |
|---|---|---|
| [architecture.md](architecture.md) | files, modules, data flow, runtimes (web, Electron, Tauri), storage, conventions | built |
| [model.md](model.md) | the network model in `src/equations.js`: parts, groups, ranges, the text syntax, resonances, solving | built |
| [typesetting.md](typesetting.md) | equations as vector graphics: glyph atlas, TeX metrics, LaTeX output, MathJax tooling | built |
| [schematic.md](schematic.md) | the schematic drawing: layout rules, junction dots, the adjustable (trimmer) symbol | built |
| [advanced-mode.md](advanced-mode.md) | the Advanced view: fields, token syntax, selection, solve, result table, persistence | built |
| [icons.md](icons.md) | how the icons and generated assets are produced from one SVG | built |
| [polyvaricon.md](polyvaricon.md) | reference data of the gang capacitors in use (Mitsumi PVC-2LXT-L5, CBM-443) | reference |
| [knob-curve.md](knob-curve.md) | frequency against knob position, tapers, linearity, resolution | **planned** |
| [tracking.md](tracking.md) | two tanks on one knob: antenna and oscillator, tracking error | **planned** |
| [design-tool.md](design-tool.md) | synthesis of padder and trimmer values, tolerance, stray capacitance, practicality checks | **planned** |
| [coil.md](coil.md) | coil inductance, resistance (Q) and self-capacitance from geometry; the clean-room rules | **planned** |
| [pitfalls.md](pitfalls.md) | mistakes made and the rules that came out of them | living |

"Built" documents describe code that exists and is tested. "Planned"
documents are designs: they state the intent, the maths and the interfaces,
and nothing in them is implemented yet. A document says so at its top.

## The project in one paragraph

A calculator for Thomson's formula, f = 1 / (2π√(LC)), with two views. The
**basic mode** solves the third of L, C and f from the other two, with ranges
and a fixed part tuned over a band. The **Advanced mode** takes the inductance
and the capacitance of a tank as networks of parts (series, parallel, ranges
for adjustable parts), draws the schematic and the equation of the tank,
calculates L, C and f over the whole knob range and lets you click a part in
either drawing to solve for its value. It is meant to grow into a design tool
for capacitor networks around variable capacitors such as the polyvaricon
gangs used in radios: how a trimmer, a padder or a fixed parallel capacitor
changes the tuning range, and whether the knob stays usable.

## Vocabulary

- **tank**: one inductance network `L` and one capacitance network `C` in
  parallel, the resonant circuit of the Thomson formula.
- **network**: a two-terminal series/parallel tree of parts of one kind (all
  inductors or all capacitors) in the Advanced mode; the model also allows
  mixed trees through the API.
- **part**: one inductor or capacitor, a leaf of the tree. Its name starts with
  `L` or `C`.
- **range part** or **adjustable part**: a part whose value is an interval
  `lo..hi` instead of a number; a knob moves it.
- **knob position** θ: the position of the shaft, 0 to 1. At θ = 0 every range
  part has its minimum value, at θ = 1 its maximum.
- **trimmer**: a part that is set once with a screwdriver, as opposed to the
  knob. In the model a trimmer is an ordinary fixed part at its set value.
- **gang**: several capacitor sections on one shaft; every section follows the
  same θ.
- **padder**: a fixed capacitor in series with a variable one, which shrinks
  the range and bends the curve.
- **swing**: the variable part of a capacitor, maximum minus minimum.
