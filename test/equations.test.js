import { expect, test } from 'bun:test';
import { ComponentNode, Parse, ParallelGroup, SeriesGroup, ThomsonEquation } from '../src/equations.js';

const f0 = (L, C) => 1 / (2 * Math.PI * Math.sqrt(L * C));
const close = (a, b, rel = 1e-6) => expect(Math.abs(a - b) / b).toBeLessThan(rel);

test('Parse and toString round-trip', () => {
  const s = '(L1=27n | C1=470p) + C2=3p';
  const n = Parse(s);

  expect(n).toBeInstanceOf(SeriesGroup);
  expect(n.toString()).toBe(s);
  expect(n.values()).toEqual({ L1: 27e-9, C1: 470e-12, C2: 3e-12 });
  expect(Parse('L1 || C1').toString()).toBe('L1 | C1');
  expect(Parse('L1 + L2 + C1').nodes.length).toBe(3);
});

test('Parse rejects junk', () => {
  expect(() => Parse('R1 + L1')).toThrow();
  expect(() => Parse('(L1 | C1')).toThrow();
  expect(() => Parse('L1 +')).toThrow();
  expect(() => Parse('L1=abc')).toThrow();
});

test('parallel tank has one parallel resonance, series LC one series', () => {
  const tank = Parse('L1=1u | C1=100p').resonances();
  const ser = Parse('L1=1u + C1=100p').resonances();

  expect(tank.length).toBe(1);
  expect(tank[0].type).toBe('parallel');
  close(tank[0].f, f0(1e-6, 100e-12));
  expect(ser.length).toBe(1);
  expect(ser[0].type).toBe('series');
  close(ser[0].f, f0(1e-6, 100e-12));
});

test('tank in series with a capacitor: zero and pole in closed form', () => {
  const r = Parse('(L1=1u | C1=10p) + C2=40p').resonances();

  expect(r.map(x => x.type)).toEqual(['series', 'parallel']);
  close(r[0].f, f0(1e-6, 50e-12));
  close(r[1].f, f0(1e-6, 10e-12));
});

test('a zero and a pole 0.05% apart are both found', () => {
  const r = Parse('(L1=1u | C1=10p) + C2=10f').resonances();

  expect(r.map(x => x.type)).toEqual(['series', 'parallel']);
  close(r[0].f, f0(1e-6, 10.01e-12), 1e-5);
  close(r[1].f, f0(1e-6, 10e-12), 1e-5);
});

test('pure L or pure C networks have no resonance', () => {
  expect(Parse('L1=1u + L2=2u').resonances()).toEqual([]);
});

test('solve a component for a target frequency', () => {
  const tank = Parse('L1=1u | C1=10p');

  close(tank.solve('C1', 100e6), 1 / ((2 * Math.PI * 1e8) ** 2 * 1e-6), 1e-9);

  const two = Parse('(L1=1u | C1=10p) + C2=40p');

  close(two.solve('C2', 20e6, {}, { type: 'series' }), 1 / ((2 * Math.PI * 2e7) ** 2 * 1e-6) - 10e-12, 1e-8);
  close(two.solve('L1', 40e6, {}, { type: 'parallel' }), 1 / ((2 * Math.PI * 4e7) ** 2 * 10e-12), 1e-8);
  expect(() => tank.solve('C1', 100e6, {}, { lo: 50e-12, hi: 1e-9 })).toThrow(RangeError);
  expect(() => tank.solve('X1', 1e6)).toThrow();
});

test('band covered while a component is swept', () => {
  const [lo, hi] = Parse('L1=1u | C1=10p').band('C1', [2e-12, 20e-12]);

  close(lo, f0(1e-6, 20e-12));
  close(hi, f0(1e-6, 2e-12));
});

test('values override the ones in the model', () => {
  const n = Parse('L1=1u | C1=10p');

  close(n.resonances({ C1: 20e-12 })[0].f, f0(1e-6, 20e-12));
});

test('same-kind networks keep their effective value', () => {
  const s = Parse('L1=1u + L2=3u'),
    p = Parse('C1=10p | C2=30p');

  close(s.evaluate(), 4e-6);
  close(p.evaluate(), 40e-12);
  close(Parse('C1=10p + C2=30p').evaluate(), 7.5e-12);
  expect(() => Parse('L1=1u | C1=1p').evaluate()).toThrow();
});

test('ThomsonEquation still works and matches the general solver', () => {
  const L = new SeriesGroup([new ComponentNode('L1', 1e-6), new ComponentNode('L2', 1e-6)]);
  const C = new ParallelGroup([new ComponentNode('C1', 30e-12), new ComponentNode('C2', 20e-12)]);
  const t = new ThomsonEquation(L, C);

  close(t.calculateFrequency({}), f0(2e-6, 50e-12));
  close(t.network().resonances()[0].f, t.calculateFrequency({}), 1e-6);
  expect(t.renderFrequencySVG()).toStartWith('<svg');
  expect(t.drawCircuit()).toStartWith('<svg');
});

test('svg output is complete', () => {
  const n = Parse('(L1=27n | (C1=470p + C2=3p) | L2) + C3=7p');

  for(const svg of [n.schematic(), n.schematic({ terminals: 'ground' }), n.equationSVG(), Parse('L1').schematic()]) {
    expect(svg).toStartWith('<svg');
    expect(svg).toEndWith('</svg>');
    expect(svg).not.toMatch(/NaN|undefined|Infinity/);
  }
});

/*
 * The automatic range must not lose resonances a much wider scan finds. A
 * zero/pole pair closer than one grid cell (0.4%) can slip between two
 * samples, since X barely changes across it; that is the only thing allowed
 * to be missing.
 */
test('automatic frequency range is wide enough for random networks', () => {
  let seed = 12345;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const pick = a => a[Math.floor(rnd() * a.length)];
  let n = 0;

  const make = depth => {
    if(depth == 0 || rnd() < 0.3) {
      const k = pick(['L', 'C']);

      return new ComponentNode(k + ++n, k == 'L' ? 10 ** (-9 + rnd() * 4) : 10 ** (-12 + rnd() * 4));
    }

    const kids = Array.from({ length: 2 + Math.floor(rnd() * 2) }, () => make(depth - 1));

    return new (rnd() < 0.5 ? SeriesGroup : ParallelGroup)(kids);
  };

  for(let i = 0; i < 40; i++) {
    n = 0;
    const net = make(3);
    const auto = net.resonances();
    const wide = net.resonances({}, { fmin: 1e2, fmax: 1e14, points: 40000 });
    const near = (a, b) => Math.abs(a.f - b.f) / b.f < 1e-4 && a.type == b.type;

    /* nothing invented, nothing lost but tight pairs */
    for(const r of auto) expect(wide.some(w => near(r, w))).toBe(true);

    const lost = wide.map((w, j) => [w, j]).filter(([w]) => !auto.some(r => near(r, w)));

    for(const [w, j] of lost) {
      const mate = [wide[j - 1], wide[j + 1]].find(m => m && m.type != w.type && Math.abs(m.f - w.f) / w.f < 0.004);

      expect(mate).toBeDefined();
    }
  }
});

test('equations are typeset from glyph outlines and also given as LaTeX', () => {
  const t = new ThomsonEquation(Parse('L1 + L2'), Parse('C1 | C2'));

  for(const k of ['f', 'L', 'C']) {
    const svg = t.renderSVG(k);

    expect(svg).toStartWith('<svg');
    expect(svg).toContain('<path');
    expect(svg).not.toContain('<text');
    expect(svg).not.toMatch(/NaN|undefined|Infinity/);
  }

  expect(t.toLaTeX('f')).toBe('f = \\frac{1}{2\\pi\\sqrt{\\left(L_{1} + L_{2}\\right)\\left(C_{1} + C_{2}\\right)}}');
  expect(new ThomsonEquation(Parse('L'), Parse('C')).toLaTeX('L')).toBe('L = \\frac{1}{4\\pi^2Cf^2}');
  expect(Parse('L1 | C1').toLaTeX()).toStartWith('Z(j\\omega) = \\frac{1}');
});

test('advanced mode fields: bare values are named, kinds are checked', async () => {
  const { Expand, ParseKind, Seed } = await import('../src/network-ui.js');

  expect(Expand('(100n | 47n) + 250n', 'L')).toBe('( L1=100n | L2=47n ) + L3=250n');
  expect(Expand('L2=1u + 3u', 'L')).toBe('L2=1u + L1=3u');
  // C parts in series add reciprocally, in parallel directly: (27p + 470p) | 5p
  close(ParseKind('(27p + 470p) | 5p', 'C').evaluate(), 1 / (1 / 27e-12 + 1 / 470e-12) + 5e-12);
  expect(() => ParseKind('100n | C1', 'L')).toThrow(/not an inductor/);
  expect(ParseKind('  ', 'L')).toBeUndefined();
  expect(Seed('10 u')).toBe('10u');
  expect(Seed('1u..2u')).toBe('');
});

test('advanced mode: parts are found in the text, set, and solved for', async () => {
  const { Scan, SetValue, ParseKind, ParseFrequency, SolvePart } = await import('../src/network-ui.js');

  expect(Scan('(100n | L1=47n) + 250n', 'L').map(k => k.name)).toEqual([undefined, 'L2', undefined, 'L1', undefined, undefined, 'L3']);
  expect(SetValue('(100n | 47n) + 250n', 'L', 'L2', '51n')).toBe('(100n | 51n) + 250n');
  expect(SetValue('L1=5n + L2', 'L', 'L2', '8n')).toBe('L1=5n + L2=8n');
  expect(SetValue('L1=5n + L2=9n', 'L', 'L1', '6n')).toBe('L1=6n + L2=9n');
  close(ParseFrequency('433.92MHz'), 433.92e6);
  expect(() => ParseFrequency('abc')).toThrow();

  // the L3 that tunes (100n | 47n) + L3 against 30.5332p to 54.2413 MHz is 250n
  const L = ParseKind('(100n | 47n) + L3', 'L'),
    C = ParseKind('(27p + 470p) | 5p', 'C');

  close(SolvePart(L, C, 'L3', 54.2413e6), 250e-9, 1e-4);
  close(SolvePart(ParseKind('(100n | 47n) + 250n', 'L'), C, 'C3', 54.2413e6), 5e-12, 1e-3);
});

test('advanced mode: a value may carry its unit after a space', async () => {
  const { Expand, ParseKind, SetValue } = await import('../src/network-ui.js');

  expect(Expand('10 u + 4.7 u', 'L')).toBe('L1=10u + L2=4.7u');
  expect(Expand('Ltrim = 5 u | 100n', 'L')).toBe('Ltrim=5u | L1=100n');
  expect(Expand('(2.2 nF | 100 pF)', 'C')).toBe('( C1=2.2nF | C2=100pF )');
  expect(Expand('10 L2', 'L')).toBe('L1=10 L2');
  close(ParseKind('10 u | 10 u', 'L').evaluate(), 5e-6);
  close(ParseKind('2.2 n + 3.3 n', 'C').evaluate(), 1 / (1 / 2.2e-9 + 1 / 3.3e-9));
  expect(SetValue('10 u + 4.7 u', 'L', 'L2', '5u')).toBe('10 u + 5u');
});
