import { expect, test } from 'bun:test';
import { Cover, Thompson } from '../src/thomson.js';

test('Thomson formula', () => {
  expect(Thompson.calculate(1e-6, 100e-12)).toBeCloseTo(15.9155e6, -2);
  expect(Thompson.inverse(15.9155e6, 100e-12)).toBeCloseTo(1e-6, 9);
});

test('FM band with a 2-20pF trimmer: any L from ~165nH to ~1.09uH works', () => {
  const r = Cover([87.5e6, 108e6], [2e-12, 20e-12]);

  expect(r.feasible).toBe(true);
  expect(r.min).toBeCloseTo(165.4e-9, 10);
  expect(r.max).toBeCloseTo(1.0858e-6, 9);
  expect(r.best).toBeGreaterThan(r.min);
  expect(r.best).toBeLessThan(r.max);
  // the chosen L tunes the whole band, with margin at both ends
  expect(r.band[0]).toBeLessThan(87.5e6);
  expect(r.band[1]).toBeGreaterThan(108e6);
});

test('order of the range ends does not matter', () => {
  expect(Cover([108e6, 87.5e6], [20e-12, 2e-12])).toEqual(Cover([87.5e6, 108e6], [2e-12, 20e-12]));
});

test('trimmer too small for the band is flagged', () => {
  const r = Cover([87.5e6, 108e6], [10e-12, 11e-12]);

  expect(r.feasible).toBe(false);
  expect(r.band[1] / r.band[0]).toBeLessThan(108 / 87.5);
});
