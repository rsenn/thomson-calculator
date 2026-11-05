# Coil calculation (planned)

State: **planned**, nothing here is implemented. `../TODO`: `coil-inductance`.

From a description of a coil the tool computes three things the tank needs:

| Result | Used for |
|---|---|
| inductance L | the L network of the Thomson formula, instead of typing it |
| series resistance R, so Q = ωL / R | bandwidth and selectivity (`q-bandwidth`) |
| self-capacitance C_d and self-resonant frequency | a stray capacitance in parallel with the C network (`stray-capacitance`); a warning above the self-resonance |

## Clean-room rules

Coil64 (an open source coil calculator) is GPLv3; this project is MIT. To keep
the code free of it:

1. **Do not read the Coil64 source**, not even to "check" something. Anyone
   who has read it should not write the corresponding code.
2. The formulas come from the **published literature** (below). Formulas
   and physical constants are not copyrightable; a particular program's code
   and structure are.
3. The code is written from our own derivation of each formula, with the
   source cited in a comment at the function.
4. **Test vectors** come from numbers printed in the papers and books, or from
   hand calculations. Running Coil64 as a black box and comparing its output
   numbers is acceptable as a plausibility check, but its numbers are not
   copied into tests as the expectation.
5. If a formula was only found in a program's source, it is not used until
   it is found in a book or paper.

## Sources (verify each citation before relying on it)

- Single layer inductance: H. A. Wheeler, "Simple inductance formulas for
  radio coils", Proc. IRE 16 (10), 1928; the Nagaoka coefficient (elliptic
  integrals) as the exact reference; I. Lundin, "A handbook formula for the
  inductance of a single-layer circular coil", Proc. IEEE 73 (9), 1985.
- Collected formulas: F. W. Grover, *Inductance Calculations* (1946).
- Self-capacitance and high frequency resistance of single layer solenoids:
  R. G. Medhurst, Wireless Engineer, 1947.
- Skin and proximity effect for the AC resistance of round wire: the
  standard Bessel function result and Butterworth's proximity factors.

## Plan

1. Single layer solenoid, round wire: L (Wheeler, cross-checked against
   Nagaoka), wire length and R_dc from the resistivity, R_ac with skin effect,
   C_d (Medhurst), self-resonant frequency.
2. The result feeds the tank as `L` (and a stray `C_d`, a series loss) in the
   Advanced mode; a coil is a new kind of leaf in the network of parts.
3. Later: other shapes (toroid, multilayer, flat spiral) only when a real
   case needs them.

Open questions: units in the user interface (mm, inch, turns per length), the
winding pitch versus close wound, how a measured L from the LC meter replaces
the computed one, and whether the coil is a leaf node or a separate panel.
