# Advanced mode

The Advanced view takes the **inductance** and the **capacitance** of a tank
as two networks of parts and shows everything the model knows about the tank.
Code: `src/network-ui.js`, loaded on first use by `SetAdvanced()` in `app.js`;
markup in the `#advanced` section of `app.html`; styles at the end of
`main.css`.

## Why two fields, and not one free network

An earlier version had one free-form network field. That was wrong for this
problem: Thomson's formula needs **one overall L and one overall C**. Each can
be made of several parts in any series and parallel combination, but an inductor
and a capacitor in one group form a resonant circuit in themselves and the tank
is no longer a Thomson tank. So the view takes an L network and a C network,
each of **one kind only**, and builds the tank as their parallel connection.
Putting a part of the wrong kind into a field is an error (`C1 is not an
inductor, only L parts belong in this field`). The model can describe mixed
networks (see [model.md](model.md)); the Advanced mode does not offer them, and
a design that needs them is a different tool (a filter or trap calculator).

## The page

- **Switch**: a checkbox "Advanced" at the top right (`#advanced_toggle`).
  `body.advanced` hides everything with class `basic` (title, equation image,
  the basic form) and shows `#advanced`.
- **Fields**: `#network_L` (placeholder `300u`) and `#network_C` (placeholder
  `Cosc=3.8p..85.8p | Ctrim=3.5p`, the AM oscillator section of a polyvaricon,
  see [polyvaricon.md](polyvaricon.md)), labelled like the basic mode.
- **Error line**: `#network_error`, one line per failing field, prefixed `L:` or
  `C:`; the field turns red.
- **Views**: `#schematic` and `#equation`, side by side.
- **Result table**: `#network_result`, one row each for L, C and f.
- **Part panel**: `#part_panel`, shown while a part is selected.
- **Help line**: the syntax in one sentence.

## Field syntax

The grammar of [model.md](model.md) plus conveniences handled in
`network-ui.js`, in this order:

1. **Tokens** (`TOKENS`, a regex): the operators `+ | ( )`; a part with a value
   `name = value`; a bare value; a bare name. A **value may carry its unit after
   a space**: `10 u`, `4.7 nF`, `Ltrim = 5 u` are one token each. A word after a
   number joins it only if it is not itself a name (`10 L2`) and not followed
   by `=`.
2. **Bare values name themselves** (`Scan`): `(100n | 47n) + 250n` for L becomes
   `(L1=100n | L2=47n) + L3=250n`. Numbering is by position, skipping names
   already used in the text (`L2=1u + 3u` gives `L2=1u + L1=3u`). The prefix is
   the field's kind, `L` or `C`.
3. **Compaction** (`Expand`): the rewritten text goes to `Parse` with the
   white space inside each token removed (`L1=10 u` becomes `L1=10u`).
4. **Kind check** (`ParseKind`): every part must have the field's kind.
5. A value `a..b` makes the part a **range part** (adjustable by the knob); a
   plain value is fixed. A trimmer is entered as a fixed part at its set value.

An empty field is "no network", not an error.

The first time the mode is enabled the fields are seeded from the basic mode's
L and C fields when those are plain numbers (`Seed`, e.g. `10 u` becomes `10u`;
a range or an empty field gives an empty seed).

## What is shown

On every input event (`ShowNetworks`):

1. Both fields are parsed. Errors are listed; a field that fails is marked.
2. **Schematic**: of the whole tank (`ThomsonEquation#network()`) when both fields
   are valid; of the one valid network when only one is; empty otherwise.
3. **Equation**: `ThomsonEquation#renderSVG('f')` when both are valid, the
   Thomson formula with the two networks as factors.
4. **Result table**: when both are valid and every part has a value, the
   effective L, the effective C and f. With range parts the table shows both
   ends of the knob: every range part at its minimum (θ = 0) and at its maximum
   (θ = 1). Each quantity is written as a span from its lower to its higher
   value, whichever end of the knob that is: C is lowest at θ = 0 but f is
   highest there. `FormatSpan(x, y, unit)` writes a span as
   `7.3 – 89.3 pF` (en dash): the unit once when both ends share it, both when
   they differ (`972.375 kHz – 18.6277 MHz`), one value when they are equal.
   The table is hidden while the data is incomplete.
5. **Warnings**: `Checks({ L, C }, texts)` (`src/checks.js`) lists the structural
   problems of the network as typed, as a list under the result table
   (`#network_warnings`): advice, never an error, see
   [design-tool.md](design-tool.md), section 5.
6. The selection is kept if its part still exists, and reset otherwise; a
   pending solution is discarded.

The values use four decimals (`RoundTo(4)`), engineering prefixes
(`FormatNumber(..., 'floor')`).

The result is a **table** (`<table>`, one row per quantity: a black letter
cell, a coloured name cell, a boxed value cell) because it is meant to grow:
rows for the single parts (C1, C2, L1, L2) can be added by extending the list
in `ShowResult()`. Colours are those of the basic mode: orange for the
inductance, green for the capacitance, purple for the frequency
(`label.name.*.selected` gradients, shared by selector). The table is only as
wide as its widest value, and the name cells are all as wide as the widest
label.

## Selection

Parts are selectable **in both drawings at once**.

- Hovering a part adds the class `hot` (red) to every element with the same
  `data-part`, in the schematic and in the equation.
- Clicking selects it (class `sel`, purple); clicking it again or the empty
  background deselects.
- The **part panel** shows the part's name and value (a range as `min…max`).
- **Solve**: enter a target frequency (`100M`, `2.4G`, `433.92MHz`; spaces and a
  trailing `Hz` are ignored) and press Solve or Enter. `SolvePart` calls
  `Network#solve` on the tank with the type `'parallel'`, all other parts at
  their current values; the message is `L3 = 50.9871nH gives 100MHz`. Failures
  (no value elsewhere, target out of reach, a field missing) are shown in the
  panel in red.
- **Use**: writes the solved value into the field of the part with `SetValue`,
  which replaces the bare value, the value after `name=`, or appends `=value`
  to a name without a value, then re-runs the display and saves.

Example, checked by hand and by test: L `(100n | 47n) + 250n`, C
`(27p + 470p) | 5p` gives L = 281.9728 nH, C = 30.5332 pF, f = 54.2413 MHz;
solving L3 for 100 MHz gives 50.9871 nH, and the tank is then at 100 MHz.

**Known limit**: with range parts, "the other parts at their current values"
means their *maximum*, not a knob position (see `../TODO`,
`solve-at-knob-position`).

## State and events

Module state in `network-ui.js` is one object (`state`: the networks shown, the
texts, the selected name, the last solution) plus a `ready` flag. Listeners are
attached **once**, on the first `InitAdvanced()`, because the inputs and the
containers are never replaced; later calls only redraw. Hover and click use
event delegation on `#network_views`, so they survive the SVGs being replaced at
every keystroke. The part panel's input handles Enter.

## Persistence

Key `config.advanced` in `localStorage`: `{ advanced, networkL, networkC }` (see
[architecture.md](architecture.md)). The mode and both texts are restored on
load; selection and a pending solution are not.

## Tests

DOM-free and covered by `bun test`: `Scan`, `Expand`, `SetValue`, `ParseKind`,
`Seed`, `ParseFrequency`, `SolvePart`, `FormatSpan`. The DOM parts
(`ShowNetworks`, `ShowResult`, `Select`, `Solve`, event wiring) are checked in a
browser; see `../TODO`, `browser-tests`, and the checklist below.

### Manual checklist

1. Fresh profile, tick Advanced: empty fields, placeholders visible, no table.
2. Type `300u` in L and `3.8p..85.8p | 3.5p` in C: schematic with the trimmer
   symbol on the first capacitor, equation, result table with spans.
3. Type slowly, character by character: no exception at any intermediate text.
4. Click C1 in the schematic: highlighted in both drawings; panel shows it.
5. Solve for 100M, press Use: the field changes, the table shows 100 MHz.
6. Reload: fields and mode are restored. Open a second tab, edit there, reload
   the first: the edit survives.
7. Basic mode and back: nothing lost.
8. Put `C1` into the L field: the field turns red with the message.
