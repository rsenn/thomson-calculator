# Design tool: padding, tolerance, strays, practicality

**Status: planned. Nothing in this document is implemented.** It collects the
analyses that turn the Advanced mode from a calculator into a design tool for
capacitor networks around a variable capacitor. It relies on
[knob-curve.md](knob-curve.md); the oscillator synthesis of
[tracking.md](tracking.md) uses the same machinery. Items are in `../TODO`.

The question the tool answers: **given a variable (or trimmer) capacitor and a
band I want to cover, which fixed parts do I add, what band do I actually get
when the parts have tolerances and the circuit has stray capacitance, and is the
result practical to build and to tune?**

## 1. What a network around the variable part does

With the variable capacitance c ∈ [a, b] (the section's minimum and maximum):

| Added | C_eff | Effect |
|---|---|---|
| nothing | c | the bare part, frequency ratio √(b/a) |
| fixed parallel `Cp` | Cp + c | shifts the range up, **shrinks the ratio** to √((Cp+b)/(Cp+a)), makes the dial nearly linear (bandspread) |
| fixed series `Cs` | Cs·c/(Cs+c) | caps C_eff below Cs, **shrinks the ratio**, crowds the high-capacitance (low-frequency) end |
| both | `Cs·(Cp+c)/(Cs+Cp+c)` | the padder/trimmer arrangement of the superhet oscillator |

Use cases: a trimmer that is "too big" for the band is padded with a series
capacitor for a higher frequency and a finer adjustment; a wide gang section is
squeezed to a narrow band (**bandspread**) with a parallel capacitor; an
oscillator is bent against the RF tank ([tracking.md](tracking.md)).

The same holds for adjustable inductors with the roles of series and parallel
exchanged: a **parallel** fixed inductor lowers the effective L and shrinks the
range.

## 2. Synthesis

The inverse problem: for a band [f1, f2] (f1 < f2) that the part's range
[a, b] must cover at its two stops, find the fixed part values. The condition
is a ratio:

`ρ = C_eff(b) / C_eff(a) = (f2 / f1)²`

and then L (or the other component) follows from one end,
`L = 1 / ((2π f1)² C_eff(b))`.

**Closed forms** (derived here and spot-checked numerically: for a = 5 pF, b = 60 pF,
`ρ = 2` gives `Cp = 50 pF`; `ρ = 1.6` gives `Cs = 3.46 pF`; `ρ = 1.3` with `Cs = 20 pF` gives
`Cp = 28.72 pF`, the other root of the quadratic being negative and invalid; each
must still become a test against `ThomsonEquation#evaluate`):

- parallel capacitor only: `Cp = (b − ρ·a) / (ρ − 1)`; valid if `ρ < b/a`, and
  `Cp ≥ 0`. A larger ρ than b/a is impossible: the bare part is already too
  narrow.
- series capacitor only: `Cs = a·b·(ρ − 1) / (b − ρ·a)`; valid if `1 < ρ < b/a`.
- both, with `Cs` chosen (for instance an E-series value): `Cp` is the positive
  root of
  `(ρ − 1)·Cp² + (ρ − 1)(a + b + Cs)·Cp + [(ρ − 1)·a·b − Cs·(b − ρ·a)] = 0`.
- inductors: the dual formulas with L in place of C and parallel and series
  exchanged.

Where a closed form is not enough (several unknowns, a tapered part with a
table), the monotonicity of the model gives a robust numeric route: bisection
for one unknown, nested bisection or damped Newton for two or three.

**Outputs**: the part values (exact, then snapped), the band that results, and
the knob-curve metrics for the result (crowding, linearity).

### E-series snapping

Standard values come from the E12, E24, E48 and E96 series (selectable, default
E24 for capacitors, E12 for inductors). For each synthesized value the two
neighbours in the series are the candidates; with several fixed parts the
combinations are tried (2^n, n small) and the one that gets the band closest
to the target is proposed, together with the **band error in kHz at both
ends**. Also offered: *two parts in series or parallel that make the exact
value* (the tool already draws such networks).

## 3. Tolerance

Because every resonance falls monotonically as any part grows
([model.md](model.md)), the **worst-case band is exact at the corners**: no
Monte Carlo is needed.

- highest possible frequency: every part at its lowest allowed value
  (`value − tol`), the variable part at its minimum stop;
- lowest possible frequency: every part at its highest allowed value, the
  variable part at its maximum stop.

So the worst-case band is two evaluations. The tolerance of a part is
`± (absolute + relative · value)`, as the datasheets give it (Mitsumi AM
± (1 pF + 1 %), FM ± (0.3 pF + 2 %)). Defaults by kind (fixed capacitor 5 %,
inductor 5 %, trimmer's set value 0) are settings, and the part panel overrides
one part. It is an *interval* analysis: it is conservative when the real parts
vary independently (all at the extreme together is unlikely), and exact as a
bound.

Reported: the band with and without tolerance, the **shift of each band edge**
in kHz and in percent of the band, and a ranking of which part contributes
most (the one-at-a-time sensitivity, again two evaluations per part). A small
series capacitor is typically the worst offender: its tolerance appears almost
in full in the frequency.

Optionally an **envelope** is drawn on the knob curve and on the tracking error.

## 4. Stray capacitance

Every real circuit has capacitance that is not a component: wiring, the
transistor, the coil's self-capacitance, usually **3 to 15 pF in parallel with
the capacitor network**. It matters most exactly where this tool is used, small
capacitances: a 3.8 pF minimum is dominated by it, a series capacitor of a few
pF is swamped by it.

Modelled as a settings value `stray` (default 0) **added in parallel to the C
network** of a tank, drawn in the schematic as a dotted capacitor named
`Cstray` (a `stray` flag on the part so that the schematic can draw it
differently and the selection and the tables treat it as a part). The result
table says when a stray value is included. Two uses:

- enter the stray capacitance you measured (the LC meter) and see the real band;
- solve it: for a target minimum frequency the stray that is *implied* by a
  measured end of the band.

An inductance counterpart (lead inductance, a parasitic) is out of scope.

## 5. Practicality checks

Each is a pure function of the model and the settings, returning a message when
it fires. They are warnings in a list under the metrics, never errors.

| Check | Fires when | Why |
|---|---|---|
| value too small | a fixed capacitor below about 1 pF, an inductor below about 10 nH | not realizable, and swamped by parasitics |
| swamped by strays | a series capacitor below 3 × the stray value | the stray decides the frequency, not the part |
| band lost to tolerance | worst-case edge shift larger than the adjustment range left to the trimmer | it cannot be tuned in |
| crowded dial | knob-curve crowding factor above 3 | one end of the knob is too critical |
| narrow band | frequency ratio below 1.1 | the knob hardly changes anything |
| tuning range does not reach | the target band is outside the achievable band | the synthesis is infeasible, with the closest possible band |
| trimmer travel | the trimmer would have to be near an end of its 0 to 7 pF travel | no margin to adjust |
| voltage and current | optional: when a drive level is given, the reactive current and the voltage across the smallest capacitor | solid-dielectric parts are rated about 100 V DC |

Checks that depend on features that do not exist yet. They are added with the
feature, and the table is extended with the threshold when it is set:

| Check | Fires when | Needs |
|---|---|---|
| self-resonance | the band reaches the coil's self-resonant frequency (say above 0.5 of it) | `coil-inductance` ([coil.md](coil.md)) |
| bandwidth too wide | the tank bandwidth f/Q is wider than the channel it must select | `q-bandwidth` |
| image rejection too low | the selectivity at the image frequency is below a given dB | `q-bandwidth`, `tracking-plot` |
| Q too low | the loaded Q is below a useful value (say 20) | `q-bandwidth` |

### Structural checks

**Built** (`src/checks.js`, `Checks({ L, C }, texts)`, tested in
`test/checks.test.js`, shown under the result table of the Advanced view). A
second group is about the network as typed, not about building it. It needs
nothing but the existing model. Same rules: a list of warnings, never errors,
thresholds in `LIMITS`.

| Check | Fires when | Why |
|---|---|---|
| empty or inverted range | a range with minimum not below maximum, or equal ends | the knob does nothing, or runs backwards |
| absurd value | a value at or below 0, below 1 fF or 1 pH, or above 1 F or 1 kH | probably a unit typo (`m` for milli against `M` for mega) |
| dominated by one part | one part in series 100 times smaller than the others, or one in parallel 100 times larger | the other parts hardly matter, so adjusting them does nothing |
| parallel inductors | two or more inductors in parallel | the model assumes no mutual coupling; real coils couple |
| part without a value | a named part with no value (`C1`) | there is no frequency yet |
| only one of L and C | one network is empty | there is no frequency to compute |
| range inside a fixed part's shadow | a range part whose full travel changes the tank frequency by less than 1 percent | knob has almost no effect |

The thresholds are constants in one place in the code and are listed in this
table when they are set; they are rules of thumb, not physics.

Not modelled, stated so nobody assumes otherwise: loss (the Q of the coil and
of the capacitors, of which a series capacitor's ESR matters most), temperature
coefficients (the class of the fixed capacitors, C0G or NP0 against a drifting
film dielectric), coupling between coils (parallel inductors), the frequency
dependence of the parts.

## 6. Interface

New DOM-free modules, tested like the model, plus panels in the Advanced view:

```js
Synthesize(kind, range, band, options)  // closed forms, E-series, returns values + band
SnapE(value, series)                    // neighbours in an E series
Worst(tank, tolerances)                 // { fmin, fmax, shifts, ranking }
Checks(tank, curve, settings)           // -> [ message, ... ]
```

The UI adds a **Design** section: the target band (two values), the topology
(parallel, series, both), the series, and the result; the tolerance settings; the
stray field; the list of checks.

## 7. Phases

1. Closed-form synthesis for one range part, parallel or series, with the
   result shown as a band, plus tests against the evaluator.
2. E-series snapping and the band error.
3. Worst-case tolerance with the ranking.
4. Stray capacitance as a part, in the tank, the table and the schematic.
5. The checks list.
6. Both-padding synthesis, the oscillator solver ([tracking.md](tracking.md)).
