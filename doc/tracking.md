# Tracking: two tanks on one knob

**Status: planned. Nothing in this document is implemented.** It depends on the
knob curve ([knob-curve.md](knob-curve.md)); `../TODO`, `tracking-plot`.

## The problem

In a superheterodyne radio one knob turns the **antenna (RF) tank** and the
**oscillator tank**. The oscillator has to stay one **intermediate frequency**
(IF; 455 kHz for AM, 10.7 MHz for FM) above the RF tank over the whole band:

`f_osc(θ) − f_rf(θ) = IF`  for every θ.

Two circuits with the same law cannot do that: the ratio f_osc/f_rf is not
constant, so the oscillator needs a smaller capacitance swing, a series
capacitor (**padder**), a parallel **trimmer**, a different coil, or several of
these. The gangs in use are built for it ([polyvaricon.md](polyvaricon.md)): the AM
oscillator section is 82 pF where the antenna section is 140 pF. The feature
makes the result visible and the design possible.

## Inputs

A **tracking view** next to the single-tank view of the Advanced mode (a second
tab or a second pair of fields; decided when it is built):

- the RF tank: an L network and a C network, as today;
- the oscillator tank: an L network and a C network;
- the IF, with a default of 455 kHz;
- optionally a stray capacitance per tank ([design-tool.md](design-tool.md)).

All range parts of **both** tanks follow the same θ. Each may have its own
taper.

## Outputs

- **Frequency curves** of both tanks over θ (from `KnobCurve`).
- **Tracking error** `e(θ) = f_osc(θ) − f_rf(θ) − IF`, plotted in kHz against θ
  (or against the RF frequency, the way receiver designers draw it), with the
  zero line and the zero crossings marked: the **tracking points**.
- **Metrics**: `max |e|` and where, the rms error, the RF band and the oscillator
  band, whether the RF band edges are covered, and the frequency error at the
  band edges. A verdict: `tracks within 3 kHz`, `error 14 kHz at 1400 kHz`.
- **Image frequency** `f_rf + 2·IF` is shown for the end points of the band,
  because the image is the reason the tracking matters.
- Equation boxes: both tanks' Thomson equations and the tracking condition, in
  the typesetter.

## Theory used by the solver

A curve of the shape e(θ) with three zeros is the best an RF/oscillator pair
with a padder and a trimmer can do, which is the textbook **three-point
tracking**: the free elements are tuned so that e = 0 at three chosen points of
the band. For the usual cubic-like error, zeros at the Chebyshev nodes
give the smallest maximum error: at 6.7 %, 50 % and 93.3 % of the band
(`½(1 ± cos 30°)` and ½). So the default alignment points are

`f_k = f_lo + (f_hi − f_lo) · {0.067, 0.5, 0.933}`

of the **RF band** (chosen by the user, 520 to 1650 kHz in the Mitsumi
datasheet), overridable.

## Synthesis (the design half)

Given the RF tank, the target band, the IF, and the oscillator's **variable
section** (its swing and minimum), find the three free values: the oscillator
coil `L_o`, the padder `C_p` (series with the section) and the trimmer `C_t`
(parallel with it, the fixed part of the minimum capacitance), so that e = 0 at
the three points. The topology of the oscillator capacitance is

`C_osc(θ) = C_p · (C_v(θ) + C_t) / (C_p + C_v(θ) + C_t)`

Three equations, three unknowns. The solver uses the exact model and not the
approximations of the textbooks:

- it is monotone in each unknown, so a damped Newton iteration on the exact
  residuals converges from a sensible start (the textbook approximations are
  the start), with bisection as the fall back;
- constraints: all values positive, `C_p` and `C_t` inside a realistic range
  (minimum about 1 pF), `L_o` positive;
- the result goes through E-series snapping ([design-tool.md](design-tool.md))
  and is shown with the **resulting error curve**, so the cost of standard
  values is visible.

A gang like the 82/140 pF one needs no padder; the solver with `C_p` fixed at
infinity (a short) gives the residual error of that "trackingless" design, which
is the quantity to compare with a padded one.

## Architecture

`src/tracking.js`, DOM-free and tested like the rest:

```js
Tracking(rfTank, oscTank, { IF, points, tapers })
  // -> { theta[], frf[], fosc[], error[], zeros[] }
TrackingMetrics(result)
AlignmentPoints(band, n = 3)       // the Chebyshev points
SolveOscillator(rfTank, oscSpec, { IF, points: AlignmentPoints(...) })
```

`Tracking` is two `KnobCurve`s on the same θ grid. The UI reuses `CurveSVG` for
the plots and the result-table style for the metrics.

### Test vectors

- Two identical tanks with `IF = 0`: e ≡ 0.
- Two tanks that differ by a constant factor in L: the error is the known
  closed form `f_rf·(√k − 1) − IF` at every θ (no padder).
- A synthetic case built backwards: choose `L_o`, `C_p`, `C_t`, compute the
  error at the three points, check that `SolveOscillator` recovers them (within
  1e-6) from the three zeros.
- Monotonicity and band edges as in [knob-curve.md](knob-curve.md).

## Open questions

- Whether to allow tracking at the **FM** gang sections in the same view (10.7 MHz
  IF, 87.5 to 108 MHz), which has no padder: yes, the model does not care,
  only the defaults differ.
- How the two tanks' fields are laid out without doubling the page; probably the
  tracking view reuses the single-tank view twice and adds the shared IF.
- Whether the ± tolerance corners ([design-tool.md](design-tool.md)) should be
  drawn as an envelope on the error plot. Probably yes; the monotone structure
  makes it cheap.
