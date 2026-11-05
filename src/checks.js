// Structural checks of a tank as typed: warnings about the network, not
// about whether it can be built (doc/design-tool.md, section 5). DOM-free,
// a pure function of the model. Never errors, only messages.
import { ParallelGroup, ThomsonEquation } from './equations.js';
import { FormatNumber, RoundTo } from './numbers.js';

// rules of thumb, not physics (doc/design-tool.md)
export const LIMITS = {
  L: [1e-12, 1e3], // below 1 pH or above 1 kH is probably a unit typo
  C: [1e-15, 1], // below 1 fF or above 1 F likewise
  dominated: 0.99, // a part that sets this share of a group's value
  noEffect: 0.01, // a knob that moves the frequency by less than this
};

const UNIT = { L: 'H', C: 'F' };
const fmt = (v, unit) => FormatNumber(v, unit, 'floor', RoundTo(4)).replace(/\s+/g, '');
const ends = c => (c.range ? [...c.range] : c.value > 0 ? [c.value] : []);

/* values with every range part at its minimum (the default is the maximum) */
const atMin = leaves => Object.fromEntries(leaves.filter(c => c.range).map(c => [c.name, c.range[0]]));

/* index of the child that sets at least LIMITS.dominated of the group, or -1 */
function Dominant(group, values) {
  const e = group.nodes.map(n => n.evaluate(values)),
    eff = group.evaluate(values),
    adds = group.adds(group.kind),
    // admittance share for a harmonic group: eff / e_i, since eff <= every e_i
    share = e.map(v => (adds ? v / eff : eff / v));

  return share.findIndex(s => s >= LIMITS.dominated);
}

function* Groups(node) {
  if(node.nodes) {
    yield node;

    for(const n of node.nodes) yield* Groups(n);
  }
}

/* one network, field `k` ('L' or 'C') */
function CheckNetwork(net, k, out) {
  const leaves = net.leaves();

  for(const c of leaves) {
    const [lo, hi] = LIMITS[k];

    if(c.value == null) {
      out.push({ id: 'no-value', part: c.name, message: `${c.name} has no value, so there is no frequency yet.` });
      continue;
    }

    if(c.range && !(c.range[0] < c.range[1]))
      out.push({ id: 'range', part: c.name, message: `${c.name} has a range with ${c.range[0] == c.range[1] ? 'equal' : 'reversed'} ends, so its knob ${c.range[0] == c.range[1] ? 'does nothing' : 'runs backwards'}.` });

    if(ends(c).some(v => v < lo || v > hi))
      out.push({ id: 'absurd', part: c.name, message: `${c.name} = ${ends(c).map(v => fmt(v, UNIT[k])).join('…')} is far outside what exists (${fmt(lo, UNIT[k])} to ${fmt(hi, UNIT[k])}); check the unit prefix (m is milli, M is mega).` });
  }

  const min = atMin(leaves);

  for(const g of Groups(net)) {
    if(!g.kind) continue;

    try {
      const i = Dominant(g, undefined);

      if(i >= 0 && i == Dominant(g, min)) out.push({ id: 'dominated', part: g.nodes[i].toText(), message: `In ${g.toText()}, ${g.nodes[i].toText()} alone sets the value; the other parts hardly matter.` });
    } catch(e) {
      /* a part without a value: reported above */
    }

    if(g instanceof ParallelGroup && k == 'L' && g.nodes.filter(n => n.leaves().length).length >= 2)
      out.push({ id: 'coupling', part: g.toText(), message: `${g.toText()}: inductors in parallel are assumed not to couple; real coils close together do.` });
  }
}

/* a knob that hardly moves the frequency, with the other range parts at their maximum */
function CheckKnobs({ L, C }, out) {
  const tank = new ThomsonEquation(L, C);

  for(const c of [...L.leaves(), ...C.leaves()].filter(c => c.range && c.range[0] < c.range[1])) {
    try {
      const f = end => tank.calculateFrequency({ [c.name]: c.range[end] }),
        change = Math.abs(f(0) / f(1) - 1);

      if(change < LIMITS.noEffect) out.push({ id: 'no-effect', part: c.name, message: `The whole travel of ${c.name} moves the frequency by only ${(change * 100).toPrecision(2)} percent; the other parts decide it.` });
    } catch(e) {
      /* a part without a value: reported above */
    }
  }
}

/*
 * Checks({ L, C }, texts) -> [{ id, part, message }]
 * `L` and `C` are the parsed networks (undefined when empty or wrong);
 * `texts` the field texts, so that an empty field can be told from a wrong
 * one (a wrong one is already reported as a syntax error).
 */
export function Checks({ L, C } = {}, texts = {}) {
  const out = [],
    blank = k => !String(texts[k] ?? '').trim();

  if(L) CheckNetwork(L, 'L', out);
  if(C) CheckNetwork(C, 'C', out);

  if(L && !C && blank('C')) out.push({ id: 'missing', part: 'C', message: 'Only L is given; a frequency needs a capacitance too.' });
  if(C && !L && blank('L')) out.push({ id: 'missing', part: 'L', message: 'Only C is given; a frequency needs an inductance too.' });

  if(L && C && !out.some(w => w.id == 'no-value')) CheckKnobs({ L, C }, out);

  return out;
}
