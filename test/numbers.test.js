import { expect, test } from 'bun:test';
import { Exponent, FormatNumber, NumericValue, ParseRange, RoundTo, Unit } from '../src/numbers.js';

test('Unit parses single values', () => {
  expect(Unit('4.7 nF')).toEqual([4.7, -9]);
  expect(Unit('100hz')).toEqual([100, null]);
  expect(Unit('10 H')).toEqual([10, null]);
  expect(Unit('1e-6')).toEqual([1e-6, null]);
  expect(Unit('10 µH')).toEqual([10, -6]);
  expect(Unit('')[0]).toBeNaN();
  expect(Unit('abc')[0]).toBeNaN();
});

test('NumericValue has no float noise', () => {
  expect(NumericValue([4.7, -9])).toBe(4.7e-9);
  expect(NumericValue([87.5, 6])).toBe(87500000);
  expect(NumericValue([3, null])).toBe(3);
});

test('ParseRange', () => {
  expect(ParseRange('')).toEqual([]);
  expect(ParseRange('garbage')).toEqual([]);
  expect(ParseRange('10 nF')).toEqual([10e-9]);
  expect(ParseRange('87.5 - 108MHz')).toEqual([87.5e6, 108e6]);
  expect(ParseRange('87.5..108 MHz')).toEqual([87.5e6, 108e6]);
  expect(ParseRange('87.5–108MHz')).toEqual([87.5e6, 108e6]);
  expect(ParseRange('950 kHz - 1.2 MHz')).toEqual([950e3, 1.2e6]);
  expect(ParseRange('1e-6 - 1e-3')).toEqual([1e-6, 1e-3]);
  expect(ParseRange('87..108')).toEqual([87, 108]);
  expect(ParseRange('1 - 2 - 3')).toEqual([]);
});

test('Exponent', () => {
  expect(Exponent(1e-7)).toBe(-7);
  expect(Exponent(1000)).toBe(3);
  expect(Exponent(0)).toBe(0);
});

test('RoundTo drops trailing zeros', () => {
  const r = RoundTo(3);
  expect(r(2)).toBe('2');
  expect(r(1.5)).toBe('1.5');
  expect(r(100)).toBe('100');
  expect(r(10.0004)).toBe('10');
  expect(RoundTo(0)(100)).toBe('100');
});

test('FormatNumber', () => {
  const r = RoundTo(3);
  expect(FormatNumber(87.5e6, 'Hz', 'floor', r)).toBe('87.5 MHz');
  expect(FormatNumber(4.7e-9, 'F', 'floor', r)).toBe('4.7 nF');
  expect(FormatNumber(1e-7, 'H', 'floor', r)).toBe('100 nH');
  expect(FormatNumber(999.9996e3, 'Hz', 'floor', r)).toBe('1 MHz');
  expect(FormatNumber(0, 'Hz', 'floor', r)).toBe('0 Hz');
  expect(FormatNumber(5, 'H', 'floor', r)).toBe('5 H');
  expect(FormatNumber(4.7e-9, undefined, 'floor', r)).toBe('4.7');
});
