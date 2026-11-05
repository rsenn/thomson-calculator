import { expect, test } from 'bun:test';
import { Checks, LIMITS } from '../src/checks.js';
import { ComponentNode, Parse } from '../src/equations.js';

const ids = (L, C, texts) => Checks({ L: L && Parse(L), C: C && Parse(C) }, texts).map(w => w.id);

test('a sound tank gives no warning', () => {
  expect(ids('L1=0.5u', 'Cosc=3..30p + Cpad=5p')).toEqual([]);
  expect(ids('L1=1u', 'C1=100p | C2=5p')).toEqual([]);
});

test('a part without a value', () => {
  expect(ids('L1=1u', 'C1')).toEqual(['no-value']);
});

test('absurd values point at the unit prefix', () => {
  expect(ids('L1=5M', 'C1=100p')).toEqual(['absurd']);
  expect(ids('L1=1u', 'C1=0.1f..1p')).toContain('absurd');
  expect(Checks({ L: Parse('L1=5M') })[0].message).toContain('milli');
  expect(LIMITS.L[0]).toBe(1e-12);
});

test('equal or reversed range ends', () => {
  const C = r => new ComponentNode('C1', Math.max(...r), 'C', r);

  expect(Checks({ L: Parse('L1=1u'), C: C([5e-12, 5e-12]) }).map(w => w.id)).toContain('range');
  expect(Checks({ L: Parse('L1=1u'), C: C([9e-12, 5e-12]) })[0].message).toContain('backwards');
});

test('a part that sets the whole value of its group', () => {
  expect(ids('L1=1u', 'C1=100p | C2=0.5p')).toEqual(['dominated']); // parallel: the big one
  expect(ids('L1=1u', 'C1=1p + C2=1n')).toEqual(['dominated']); // series: the small one
  expect(ids('L1=1m + L2=1u', 'C1=100p')).toEqual(['dominated']); // series L: the big one
  expect(ids('L1=1u | L2=1n', 'C1=100p')).toContain('dominated'); // parallel L: the small one
  expect(ids('L1=1u', 'C1=100p | C2=5p')).toEqual([]);
});

test('dominated only counts when it holds over the whole range', () => {
  // Cv at its minimum is swamped by C2, at its maximum it is not
  expect(ids('L1=1u', 'Cv=1p..200p | C2=100p')).toEqual([]);
  expect(ids('L1=1u', 'Cfix=1n | Cv=1p..2p')).toContain('dominated');
});

test('inductors in parallel are assumed not to couple', () => {
  expect(ids('L1=1u | L2=2u', 'C1=100p')).toEqual(['coupling']);
  expect(ids('(L1=1u + L2=2u) | L3=3u', 'C1=100p')).toEqual(['coupling']);
  expect(ids('L1=1u + L2=2u', 'C1=100p | C2=5p')).toEqual([]);
});

test('only one of L and C, but not when the other field is just wrong', () => {
  const L = Parse('L1=1u');

  expect(Checks({ L }, { L: '1u', C: '' }).map(w => w.id)).toEqual(['missing']);
  expect(Checks({ L }, { L: '1u', C: 'C1 +' })).toEqual([]);
  expect(Checks({}, { L: '', C: '' })).toEqual([]);
});

test('a knob with almost no effect on the frequency', () => {
  expect(ids('L1=1u', 'Cfix=1n | Ctrim=1p..2p')).toContain('no-effect');
  expect(ids('L1=1u', 'Cfix=100p | Ctrim=10p..60p')).not.toContain('no-effect');
});
