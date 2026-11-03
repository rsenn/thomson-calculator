const $2PI = Math.PI * 2;
const $PI2 = Math.PI ** 2;

export const Thompson = {
  calculate: (L, C) => 1 / (Math.sqrt(L * C) * $2PI),
  inverse: (f, LC) => 1 / (4 * $PI2 * LC * f ** 2),
};

/*
 * One fixed component X (L or C) tuned over a band f by a variable
 * component Y (C or L, range [ylo, yhi]): X must satisfy
 *
 *   f_max with Y at its smallest  =>  X <= inverse(f_max, ylo)
 *   f_min with Y at its largest   =>  X >= inverse(f_min, yhi)
 *
 * Returns the valid interval [min, max], whether it is non-empty, the
 * geometric centre of it as the best X (equal margin at both band edges)
 * and the band [lo, hi] that best X really covers.
 */
export function Cover(f, Y) {
  const [flo, fhi] = [Math.min(...f), Math.max(...f)];
  const [ylo, yhi] = [Math.min(...Y), Math.max(...Y)];
  const min = Thompson.inverse(flo, yhi),
    max = Thompson.inverse(fhi, ylo);
  const best = Math.sqrt(min * max);

  return {
    min,
    max,
    best,
    feasible: min <= max,
    band: [Thompson.calculate(best, yhi), Thompson.calculate(best, ylo)],
  };
}
