# The schematic

`Network#schematic(opts)` (alias `drawCircuit`) returns a complete `<svg>`
string: a small **vertical** two-terminal drawing in the style of a printed
circuit diagram. It is meant to be read at a glance, not to be a layout tool.

## Boxes and the port axis

Every node is laid out as a box `{ w, h, ax, draw(x, y) }`: width, height, and
the x of its **axis**, where both terminals sit: at `(ax, 0)` at the top and
`(ax, h)` at the bottom. The parent places children so that their axes line up
(series) or sit side by side (parallel).

- **Part** (`layoutPart`): a capacitor is two horizontal plates with a vertical
  lead; an inductor is four loops bulging to the right of the lead. The name
  (bold) and the value are written to the right.
- **Series** (`layoutSeries`): children stacked, axes aligned.
- **Parallel** (`layoutParallel`): children side by side between a top and a
  bottom **rail**; each child has its own vertical spine from the rail.

The outer `Schematic()` adds the terminals (`terminals: 'ports'` open circles at
both ends, `'ground'`, or `'none'`) and the viewBox. Options in `SCH`:
`scale`, `stroke`, `color`, `fontSize`, `compH` (part height 44), `plateW`,
`plateT`, `plateGap`, `loops`, `loopRx`, `loopRy`, `rail`, `gap`, `margin`, `lead`.

## Junction dots

A dot (radius 2.4) marks every place where a wire branches: the two ends of
the port wire, and the top and bottom of each **inner** branch of a parallel
group. The outer branches continue the rail and need none.

**Rule: the port shares the dot of a branch that is next to it.** The port wire
of a parallel group is placed at the midpoint of its first and last spine.
With an odd number of branches the middle branch is near that midpoint but not
exactly on it (the spines depend on the widths of the parts), which used to
produce two overlapping dots a pixel apart at the top and at the bottom. A
middle branch whose spine is within 10 units of the midpoint now **takes over
the port position**, so port and branch share one dot. With an even number of
branches, or when the middle one is further away, nothing changes: the port
sits between two branches with its own dot. Test: three branches draw two
dots (top and bottom), four branches draw six.

## Adjustable parts: the trimmer symbol

A part with a `range` carries the **trimmer symbol** (IEC style): a diagonal
line through the symbol, drawn at the stroke of the leads, ending in a short bar
across its upper end, reaching past the plates or the coil on both sides.
Coordinates relative to the centre of the part: capacitor from `(−11, +15)` to
`(+11, −15)`; inductor from `(−8, +19)` to `(+16, −19)`; end bar half-length 4.6,
perpendicular to the diagonal. The diagonal path has `class="adj"`.

An adjustable **inductor** also gets a **dotted vertical line** beside the coil,
the ferrite core that is being moved (stroke 0.65 of the lead stroke, dash
`1.2 2.4`). Its label is moved 12 units to the right and the lead 4 to the right
to make room.

The label of a range part is `min..max` with the unit once (`3.8..85.8pF`).

The "variable" arrow symbol (an arrowhead on the diagonal) was the first
version and was rejected in favour of the trimmer symbol.

## Selection support

Every part is drawn as `<g data-part="name">` that contains a **transparent**
rectangle covering the part and its label, then the drawing. The attribute value
is escaped (`&`, `"`, `<`). The rectangle uses `fill="transparent"`; `fill="none"`
would make it ignore the pointer. The equation typesetter tags names the same
way (`Sym`), which is what links the two drawings in the Advanced mode.

## Limits

- A part cannot be rotated or placed freely; the drawing is derived from the
  tree and not interactive beyond selection.
- Networks of more than a handful of branches become wide; there is no
  wrapping.
- Mixed networks are drawn (the model allows them) but the Advanced mode does
  not offer them.
