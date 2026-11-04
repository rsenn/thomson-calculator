# Reference: polyvaricon gang capacitors

Status: **reference data**. Nothing here is code; it is what the planned
features ([knob-curve.md](knob-curve.md), [tracking.md](tracking.md)) are
built and tested against. Every number says where it comes from.

## What they are

Miniature **solid-dielectric** variable capacitors ("polyvaricons") from
transistor radios: thin plastic film between the plates instead of air, so the
whole part is about 21 × 21 × 17 mm. Several sections sit on one shaft (a
**gang**); one knob turns all of them. The housing is clear, so the film and
the plate stack can be seen. Each section has a small **trimmer** (screw
adjusted, reached through a hole in the back) in parallel with it. The rotor is
common to all sections and is the ground terminal; each section has its own
stator terminal. Mechanical: a brass shaft with a threaded bore for the knob,
threaded mounting holes (M2.6 in the Mitsumi drawing), 6 pins plus ground tabs.

Typical use in a radio: an **AM/FM two-band** gang with four sections: AM
antenna, AM oscillator, FM antenna (FC2) and FM oscillator (FC1), and four
trimmers. The parts photographed for this project show four trimmer screws and
section labels (C1, C3, C4 are legible) on the housing. Their exact type has not been
identified (see "To measure" below).

## Mitsumi PVC-2LXT-L5 / 2LXT-LD5

Source: the Mitsumi datasheet "Trackingless Type, For AM/FM 2-Band, AM
Narrow-Band, 20 mm" (obtained from DigChip). This is manufacturer data and the
authoritative one. `-L5` is front-mounting, `-LD5` has dip pins.

### Specification

| Section | Terminal | Max swing | Min capacitance | Curve |
|---|---|---|---|---|
| AM oscillator (AM-2 O) | OSC | 82 pF | 3.8 ± 1 pF | C |
| AM antenna (AM-2 A) | ANT | 140 pF | 3.4 ± 1 pF | A |
| FM FC1 (oscillator) | FC1 | 20 (40) pF | 3.3 ± 1 pF | B |
| FM FC2 (antenna) | FC2 | 20 (40) pF | 3.8 ± 1 pF | B |

- Tolerance of the variable capacitance: AM ± (1 pF + 1 %), FM ± (0.3 pF + 2 %).
- Q: AM 500 or more, FM 200 or more.
- **Trimmer capacitance: 7 pF or more**. The datasheet gives no minimum of the
  trimmer; the four trimmer holes have a diameter of 3.6 mm.
- MW tuning frequency range: **520 to 1650 kHz**.
- Shaft: capacitance **decreases as the shaft is turned clockwise**; full
  rotation angle 97 (+2, −1) % of a half circle (180° = 100 %); the flat of the
  shaft marks the maximum capacitance. Torque 70 to 350 g·cm.
- "Oscillator stage: AM (OSC), FM (FC1)": which section feeds the oscillator.
- Mounting (drawing): 21 × 21 mm, height 16.5 mm (L5) or 19.5 mm (LD5); ground
  tabs E and G. The drawing names the terminals ANT, OSC, FC1, FC2.

### Capacitance against rotation (nominal)

The "variable coefficient capacitance": the **swing** (without the minimum
capacitance) at a rotation index, in pF. The three curves are not straight
lines and differ between the sections, so they cannot be reproduced by a
straight-line law.

| Index % | 100 | 90 | 82.8 | 75 | 70 | 60 | 50 | 42.6 | 30 | 25 | 17.5 | 10 | (3) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AM oscillator, curve C | 82.0 | 73.8 | 66.8 | 58.9 | 53.5 | 42.4 | 31.8 | 24.5 | 14.3 | 10.9 | 6.44 | 2.71 | 0 |
| AM antenna, curve A | 140.0 | 118.2 | 101.3 | 84.0 | 73.2 | 53.2 | 36.7 | 26.6 | 14.3 | 10.6 | 6.01 | 2.44 | 0 |
| FM, curve B | 20.00 | 17.24 | — | 13.46 | 12.30 | 10.08 | 8.02 | — | 4.30 | 3.45 | — | 1.05 | 0 |

Reading the table for this project:

- **Index 100 is the maximum-capacitance end** (its value equals the maximum
  swing) and 0 the minimum; the index is the fraction of the rotation
  measured from the minimum stop. This is the interpretation used in the
  designs; it is consistent with the numbers but the datasheet does not
  spell out the origin, so confirm it by measurement.
- The total capacitance of a section is **minimum + swing**: the AM oscillator
  goes from 3.8 pF to 85.8 pF, the AM antenna from 3.4 pF to 143.4 pF.
- Linear interpolation (or a monotone cubic) between the listed indices gives a
  continuous curve. The `—` entries are missing and are interpolated.
- Compare the straight-line law: at index 50 the antenna section is at 36.7 pF,
  26 % of its swing, where a straight-line capacitor would give 50 %. The
  plate shape is part of the design, and a calculator that assumed the
  straight-line law would misplace the dial of this very part.

### Wiring

Datasheet-confirmed: four sections, four terminals ANT, OSC, FC1, FC2, two
ground tabs, four trimmer holes. **Inferred, not stated in the sheet**: each
trimmer is in parallel with its section (the usual construction); the rotor is
the common ground.

The network of one section as the Advanced mode takes it:

```
C field:   Cosc=3.8p..85.8p | Ctrim=3.5p
```

- `Cosc=3.8p..85.8p`: the section, minimum 3.8 pF, maximum 3.8 + 82 pF; a range
  part, moved by the knob;
- `Ctrim=3.5p`: the trimmer set to the middle of its 0 to 7 pF range. The 3.5 pF
  is a **choice** made for the example, not a datasheet value.

This is the example in the C field's placeholder. For the antenna section it is
`Cant=3.4p..143.4p | Ctrim=3.5p`.

## Hong Da CBM-443 series

A widely sold clone family (Hong Da Industrial, HK; `CBM-443DF` is the 80 + 140 pF
AM variant, `-1DF4`, `-2DF4`, `-3DF4` the mounting forms, `4` for four trimmers,
`K` a shaft lock). The sheet we found lists AM OSC 80 pF, AM ANT 140 pF, FM
20 pF × 2, minimum about 3.8 ± 1.5 pF, tolerance ± (1 pF + 1.5 %) for AM and
± (0.3 pF + 2 %) for FM, 21 × 21 × 17 mm, and names the Mitsumi 2LXT-L5 as the
closest equivalent.

**Status: unverified.** The PDF is third-party: generated, anonymous, in Ukrainian,
dated April 2026, and not the manufacturer's. Its figures agree with the
Mitsumi sheet, which is why they are plausible, and it adds a pin assignment
that the Mitsumi sheet does not give as a table (1 AM-OSC stator, 2 rotor/GND,
3 AM-ANT stator, 4 FM FC1, 5 GND, 6 FM FC2, plus a ground tab). Do not rely on
that pin table without checking against the part or the Hong Da data (hdic.com.hk).
Other members of the family named there: `CBM-443BF` (270 + 270 pF AM), `-AF`
(140 + 140 pF), `CBM-223P` (AM only, 140 + 60 pF), `CBM-223F` and `CBM-444HF`
(FM only).

## Why the sections differ: the oscillator and the padder

In a superheterodyne receiver the oscillator must run an intermediate
frequency (IF, 455 kHz for AM) above the antenna circuit **over the whole band**.
With sections of equal capacitance and equal coils that is impossible, so the
oscillator gets a smaller swing, or a series capacitor (a **padder**) and a
parallel trimmer, or both. This gang is "trackingless": the unequal sections
(82 and 140 pF) do the job without a padder. [tracking.md](tracking.md) is the
design of the feature that makes this visible.

## To measure (the LC meter)

The parts in the drawer are not identified. With the LC meter
(`../lc-meter`) measure, for each section and at the same knob positions:

1. the capacitance at both mechanical stops, trimmer screwed fully out and fully
   in: gives the minimum capacitance and the trimmer range;
2. the capacitance every 10 % of the rotation: gives the taper and shows which
   Mitsumi curve it follows (A, B or C);
3. the direction (clockwise decreases) and the stop angle.

Record the results as a table that the knob-curve feature can read (format in
[knob-curve.md](knob-curve.md), "Measured tapers").
