// Advanced mode: the inductance L and the capacitance C of the tank are
// each typed as a network of parts of their own kind (`+` series, `|`
// parallel, parentheses), e.g. L: `(100n | 47n) + 250n`, C: `(27p + 470p) | 5p`.
// Bare values name themselves (L1, L2, ... / C1, C2, ...); a named part
// (`Ltrim=5u`) is kept. The tank is drawn as a schematic and as the Thomson
// equation of the two networks. Loaded on first use by app.js.

import { Parse, ThomsonEquation } from './equations.js';
import { FormatNumber, NumericValue, RoundTo, Unit } from './numbers.js';

const Q = s => document.querySelector(s);

/*
 * The tokens of Parse(), except that a value may carry its unit or prefix
 * after a space: `10 u`, `4.7 nF`, `Ltrim = 5 u` are one token each. A
 * letter word only joins a value when it is not itself a name (`10 L2`)
 * or followed by `=`.
 */
const VALUE = String.raw`[\d.][^\s()+|]*(?:\s+[A-Za-zµμ]+(?![\w=]))?`;
const TOKENS = new RegExp(String.raw`[()+|]|[^\s()+|=]+\s*=\s*${VALUE}|${VALUE}|[^\s()+|=]+`, 'g');

/* the tokens of `text` with the part each one is: { t, start, end, name, bare } */
export function Scan(text, kind) {
  const toks = [...text.matchAll(TOKENS)].map(m => ({ t: m[0], start: m.index, end: m.index + m[0].length })),
    used = new Set(toks.filter(k => /^[A-Za-z]/.test(k.t)).map(k => k.t.split(/\s*=/)[0]));
  let n = 0;

  for(const k of toks) {
    if(/^[()+|]$/.test(k.t)) continue;

    if(/^[\d.]/.test(k.t)) {
      while(used.has(kind + ++n));

      k.name = kind + n;
      k.bare = true;
    } else k.name = k.t.split(/\s*=/)[0];
  }

  return toks;
}

/* `(100n | 47n) + L9=1u` -> `(L1=100n | L2=47n) + L9=1u` */
export function Expand(text, kind) {
  return Scan(text, kind)
    .map(k => (k.bare ? `${k.name}=${k.t}` : k.t).replace(/\s+/g, ''))
    .join(' ');
}

/* `text` with the value of the part `name` replaced (a bare value, `name=v` or `name`) */
export function SetValue(text, kind, name, value) {
  const k = Scan(text, kind).find(k => k.name == name);

  return k ? text.slice(0, k.start) + (k.bare ? value : `${name}=${value}`) + text.slice(k.end) : text;
}

/* a network of one kind from text; throws a readable error */
export function ParseKind(text, kind) {
  if(!text.trim()) return undefined;

  const net = Parse(Expand(text, kind));

  for(const c of net.leaves()) if(c.kind != kind) throw new Error(`${c.name} is not ${kind == 'L' ? 'an inductor' : 'a capacitor'}, only ${kind} parts belong in this field`);

  return net;
}

/* numbers only: what of a basic-mode field can seed an advanced one */
export function Seed(v) {
  const t = String(v ?? '').replace(/\s/g, '');

  return /^[\d.]+[a-zA-Zµμ]*$/.test(t) ? t : '';
}

const fmtValue = (v, unit) => FormatNumber(v, unit, 'floor', RoundTo(4)).replace(/\s+/g, '');

/* `7.3 – 89.3 pF`: a range with the unit written once when both ends share it */
export function FormatSpan(x, y, unit) {
  const f = v => FormatNumber(v, unit, 'floor', RoundTo(4)).trim(),
    [a, b] = [x, y].sort((p, q) => p - q).map(f);

  if(a == b) return a;

  const u = /\s\S+$/.exec(b)?.[0];

  return `${u && a.endsWith(u) ? a.slice(0, -u.length) : a} \u2013 ${b}`;
}

/* a frequency like `100M`, `2.4G` or `433.92MHz` */
export function ParseFrequency(str) {
  const v = NumericValue(Unit(String(str).replace(/\s/g, '').replace(/hz$/i, '')));

  if(!(v > 0)) throw new Error(`not a frequency: '${str}'`);

  return v;
}

/* the value of part `name` that puts the tank of L and C at `target` Hz */
export function SolvePart(L, C, name, target) {
  const net = new ThomsonEquation(L, C).network();

  return net.solve(name, target, Object.assign({}, L.values(), C.values()), { type: 'parallel' });
}

/* state of the view: the networks shown, the selected part, the last solution */
const state = { nets: {}, texts: { L: '', C: '' }, selected: undefined, solved: undefined };

const partsOf = () => Object.entries(state.nets).flatMap(([k, n]) => (n?.leaves() ?? []).map(c => [k, c]));
const elements = name => [...document.querySelectorAll('#network_views [data-part]')].filter(e => e.dataset.part == name);

function ShowPanel() {
  const panel = Q('#part_panel'),
    found = partsOf().find(([, c]) => c.name == state.selected);

  panel.hidden = !found;

  if(!found) return;

  const [kind, c] = found;

  Q('#part_name').textContent = c.name;
  Q('#part_value').textContent = c.range ? `${fmtValue(c.range[0], kind == 'L' ? 'H' : 'F')}\u2026${fmtValue(c.range[1], kind == 'L' ? 'H' : 'F')}` : c.value != null ? fmtValue(c.value, kind == 'L' ? 'H' : 'F') : 'no value';
  Q('#part_use').hidden = state.solved?.name != c.name;
  Q('#part_result').textContent = state.solved?.name == c.name ? state.solved.message : '';
}

export function Select(name) {
  state.selected = name;
  state.solved = undefined;

  for(const e of document.querySelectorAll('#network_views [data-part]')) e.classList.toggle('sel', e.dataset.part == name);

  ShowPanel();
}

function Solve() {
  const out = Q('#part_result'),
    name = state.selected,
    { L, C } = state.nets;

  state.solved = undefined;
  Q('#part_use').hidden = true;
  out.classList.remove('error');

  try {
    if(!L || !C) throw new Error('both L and C are needed');

    const target = ParseFrequency(Q('#part_target').value),
      v = SolvePart(L, C, name, target),
      kind = name[0].toUpperCase();

    state.solved = { name, text: FormatNumber(v, '', 'floor', RoundTo(4)).replace(/\s/g, ''), message: `${name} = ${fmtValue(v, kind == 'L' ? 'H' : 'F')} gives ${fmtValue(target, 'Hz')}` };
    out.textContent = state.solved.message;
    Q('#part_use').hidden = false;
  } catch(e) {
    out.textContent = e.message;
    out.classList.add('error');
  }
}

/* put the solved value into the field of the selected part */
function UseSolved(inputs, update) {
  const { name, text } = state.solved ?? {},
    k = name?.[0].toUpperCase();

  if(!k || !inputs[k]) return;

  inputs[k].value = SetValue(inputs[k].value, k, name, text);
  update();
}

/*
 * The result table, one row per quantity: [symbol, name, class, value].
 * Rows for the single parts (C1, C2, L1, L2) can be added to the list.
 */
function ShowResult(result) {
  const rows = result
    ? [
        ['L', 'Inductance', 'inductance', result.L],
        ['C', 'Capacitance', 'capacitance', result.C],
        ['f', 'Frequency', 'frequency', result.f],
      ]
    : [];
  const cell = (cls, text) => Object.assign(document.createElement('td'), { className: cls, textContent: text });

  Q('#network_result').hidden = !rows.length;
  Q('#network_result tbody').replaceChildren(
    ...rows.map(([sym, name, cls, value]) => {
      const tr = document.createElement('tr');

      tr.append(cell('var', sym), cell(`name ${cls}`, name), cell('value', value));

      return tr;
    }),
  );
}

/* draw the tank of the two fields; returns { L, C } (a part is undefined when empty or wrong) */
export function ShowNetworks(texts) {
  const nets = {},
    errors = [];

  for(const k of ['L', 'C']) {
    const input = Q(`#network_${k}`);

    try {
      nets[k] = ParseKind(texts[k], k);
      input.classList.remove('error');
    } catch(e) {
      errors.push(`${k}: ${e.message}`);
      input.classList.add('error');
    }
  }

  const err = Q('#network_error');

  err.textContent = errors.join('\n');
  err.hidden = !errors.length;

  const { L, C } = nets,
    both = L && C && new ThomsonEquation(L, C),
    shown = both ? both.network() : L ?? C,
    values = Object.assign({}, L?.values(), C?.values()),
    ranged = [...(L?.leaves() ?? []), ...(C?.leaves() ?? [])].filter(c => c.range);
  let result;

  Q('#schematic').innerHTML = shown ? shown.schematic({ scale: 1.4 }) : '';
  Q('#equation').innerHTML = both ? both.renderSVG('f', { fontSize: 26 }) : '';

  try {
    if(both) {
      // adjustable parts (ranges) sweep with the knob: show both ends
      const at = end => both.evaluate({ ...values, ...Object.fromEntries(ranged.map(c => [c.name, c.range[end]])) }),
        [a, b] = ranged.length ? [at(0), at(1)] : [at(1), at(1)];

      result = { L: FormatSpan(a.Leq, b.Leq, 'H'), C: FormatSpan(a.Ceq, b.Ceq, 'F'), f: FormatSpan(a.freq, b.freq, 'Hz') };
    }
  } catch(e) {
    /* a part without a value */
  }

  ShowResult(result);

  // keep the selection while its part still exists
  state.nets = nets;
  state.texts = texts;
  state.solved = undefined;
  Select(partsOf().some(([, c]) => c.name == state.selected) ? state.selected : undefined);

  return nets;
}

let ready = false;

export function InitAdvanced(texts, onChange) {
  const inputs = { L: Q('#network_L'), C: Q('#network_C') };
  const read = () => ({ L: inputs.L.value, C: inputs.C.value });
  const update = () => {
    ShowNetworks(read());
    onChange?.(read());
  };

  if(!ready) {
    ready = true;

    for(const k of ['L', 'C']) {
      inputs[k].value = texts[k] ?? '';
      inputs[k].addEventListener('input', update);
    }

    // hovering or clicking a part in either drawing marks it in both
    const views = Q('#network_views'),
      partOf = e => e.target.closest?.('[data-part]')?.dataset.part;

    views.addEventListener('mouseover', e => elements(partOf(e)).forEach(x => x.classList.add('hot')));
    views.addEventListener('mouseout', e => elements(partOf(e)).forEach(x => x.classList.remove('hot')));
    views.addEventListener('click', e => {
      const name = partOf(e);

      Select(name && name != state.selected ? name : undefined);
    });

    Q('#part_solve').addEventListener('click', Solve);
    Q('#part_target').addEventListener('keydown', e => e.key == 'Enter' && Solve());
    Q('#part_use').addEventListener('click', () => UseSolved(inputs, update));
  }

  ShowNetworks(read());
}
