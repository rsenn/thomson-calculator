import { FormatNumber, NumericValue, RoundTo, Unit } from './numbers.js';

const $2PI = Math.PI * 2;
const $PI2 = Math.PI ** 2;

const UNITS = { L: 'H', C: 'F' };

/* ------------------------------------------------------------------------ *
 * Model: a two-terminal network of inductors and capacitors, composed from
 * ComponentNode (leaf), SeriesGroup and ParallelGroup. The model carries no
 * notion of "adjustable" parts; sweeping or solving for a component is done
 * from the outside (see Network#band and Network#solve).
 * ------------------------------------------------------------------------ */

const sign = x => (x < 0 ? -1 : 1);

class Network {
  /* all distinct components in order of appearance */
  components() {
    return [...new Map(this.leaves().map(c => [c.name, c])).values()];
  }

  /* values given in the model, as { name: value } */
  values() {
    return Object.fromEntries(this.components().filter(c => c.value != null).map(c => [c.name, c.value]));
  }

  /*
   * All resonances of the network seen from its two terminals, ascending:
   * [{ f, w, type }], where type is 'series' (impedance zero) or 'parallel'
   * (impedance pole). Found by scanning the reactance X(w) for sign changes
   * on a log grid and bisecting; X of a lossless LC network rises
   * monotonically between poles, so a rise through zero is a series and a
   * fall (jump from +inf to -inf) a parallel resonance.
   *
   * The grid has `points` cells (default 2400, ~0.4% each) between fmin and
   * fmax, which default to a range that holds every resonance. A zero/pole
   * pair closer than one cell can slip through unless `points` is raised
   * (cells that fall without a sign change are refined automatically).
   */
  resonances(values, { fmin, fmax, points = 2400 } = {}) {
    const parts = this.components().map(c => [c.kind, c.getValue(values)]);
    const L = parts.filter(([k]) => k == 'L').map(([, v]) => v),
      C = parts.filter(([k]) => k == 'C').map(([, v]) => v);

    if(!L.length || !C.length) return [];

    const sum = a => a.reduce((s, v) => s + v, 0);
    const w0 = fmin ? $2PI * fmin : 0.1 / Math.sqrt(sum(L) * sum(C)),
      w1 = fmax ? $2PI * fmax : 10 * Math.sqrt(sum(L.map(v => 1 / v)) * sum(C.map(v => 1 / v)));
    const X = w => this.reactance(w, values);
    const out = [];

    const scan = (a, b, n, depth) => {
      const r = (b / a) ** (1 / n);
      let wl = a,
        xl = X(a);

      for(let i = 1; i <= n; i++) {
        const wr = i == n ? b : a * r ** i,
          xr = X(wr);

        if(sign(xl) != sign(xr)) {
          let lo = wl,
            hi = wr;

          for(let k = 0; k < 64; k++) {
            const mid = Math.sqrt(lo * hi);
            if(sign(X(mid)) == sign(xl)) lo = mid;
            else hi = mid;
          }

          const w = Math.sqrt(lo * hi);
          out.push({ f: w / $2PI, w, type: sign(xl) < 0 ? 'series' : 'parallel' });
        } else if(xr < xl - 1e-9 * Math.max(Math.abs(xl), Math.abs(xr)) && depth < 3) {
          /* falling without a sign change: a pole and a zero hide in this cell */
          scan(wl, wr, 16, depth + 1);
        }

        wl = wr;
        xl = xr;
      }
    };

    scan(w0, w1, points, 0);

    return out;
  }

  /* the `index`th resonance (of the given type, if any), or undefined */
  resonance(values, { type, index = 0, ...opts } = {}) {
    return this.resonances(values, opts).filter(r => !type || r.type == type)[index];
  }

  /*
   * Value of component `name` that puts a resonance at `target` Hz. All
   * resonances fall as any component grows, so the value is bisected.
   * Options: type ('series' | 'parallel'), index, lo, hi (search range).
   */
  solve(name, target, values = {}, { type, index = 0, lo, hi, ...opts } = {}) {
    const comp = this.components().find(c => c.name == name);

    if(!comp) throw new Error(`solve: no component '${name}' in ${this}`);

    const [dlo, dhi] = comp.kind == 'L' ? [1e-12, 1] : [1e-15, 1e-3];
    let a = Math.log(lo ?? dlo),
      b = Math.log(hi ?? dhi);
    const fAt = x => this.resonance({ ...this.values(), ...values, [name]: Math.exp(x) }, { type, index, ...opts })?.f;
    const fa = fAt(a),
      fb = fAt(b);

    if(!(fa >= target && target >= fb)) throw new RangeError(`solve: ${name} cannot reach ${target} Hz within ${Math.exp(a)} .. ${Math.exp(b)}`);

    for(let i = 0; i < 80; i++) {
      const mid = (a + b) / 2,
        f = fAt(mid);

      if(f > target) a = mid;
      else b = mid;
    }

    return Math.exp((a + b) / 2);
  }

  /*
   * The frequency band [min, max] a resonance covers while component `name`
   * is swept over [lo, hi] (the sweep itself is the caller's business).
   */
  band(name, [lo, hi], values = {}, opts = {}) {
    const f = v => this.resonance({ ...this.values(), ...values, [name]: v }, opts)?.f;
    const r = [f(lo), f(hi)];

    return r.every(Number.isFinite) ? r.sort((x, y) => x - y) : undefined;
  }

  /* textual form accepted by Parse() */
  toString() {
    return this.toText();
  }

  /* schematic as a complete <svg> string */
  schematic(opts) {
    return Schematic(this, opts);
  }

  drawCircuit(opts) {
    return this.schematic(opts);
  }

  /* composite impedance equation Z(jw) = ... as a complete <svg> string */
  equationSVG(opts) {
    return EquationSVG(this, opts);
  }
}

/**
 * An inductor or capacitor. The kind is the first letter of the name
 * (L1, Ctrim, ...) unless given explicitly.
 *
 * @class      ComponentNode (name, value)
 */
export class ComponentNode extends Network {
  constructor(name, value, kind = String(name)[0]?.toUpperCase()) {
    super();

    if(!(kind in UNITS)) throw new Error(`ComponentNode: '${name}' is neither an inductor nor a capacitor (names start with L or C)`);

    this.name = name;
    this.value = value;
    this.kind = kind;
  }

  get unit() {
    return this.kind;
  }

  leaves() {
    return [this];
  }

  getValue(values) {
    const v = values?.[this.name] ?? this.value;

    if(!(v > 0)) throw new Error(`no value for ${this.name}`);

    return v;
  }

  /* reactance X (Z = jX) at angular frequency w */
  reactance(w, values) {
    const v = this.getValue(values);

    return this.kind == 'L' ? w * v : -1 / (w * v);
  }

  /* effective L or C of this part */
  evaluate(values) {
    return this.getValue(values);
  }

  toJS(p = '') {
    return (p.length ? p + '.' : '') + this.name;
  }

  toText() {
    return this.name + (this.value != null ? '=' + FormatNumber(this.value, '', 'floor', RoundTo(6)).replace(/\s/g, '') : '');
  }

  toSVG() {
    return `<tspan font-style="italic">${this.name}</tspan>`;
  }
}

ComponentNode.prototype[Symbol.toStringTag] = 'ComponentNode';

class Group extends Network {
  constructor(nodes, unit) {
    super();

    /* a series of series is just a series */
    this.nodes = (nodes ?? []).flatMap(n => (n instanceof this.constructor ? n.nodes : [n]));
    this.unit = unit ?? this.kind;
  }

  /* 'L' or 'C' if every part is of that kind, else undefined (mixed) */
  get kind() {
    const kinds = new Set(this.nodes.map(n => n.kind));

    return kinds.size == 1 ? [...kinds][0] : undefined;
  }

  leaves() {
    return this.nodes.flatMap(n => n.leaves());
  }

  toText() {
    const wrap = n => (n instanceof Group ? `(${n.toText()})` : n.toText());

    return this.nodes.map(wrap).join(this.sep);
  }

  /* effective L (or C) of a network made of one kind of part */
  evaluate(values) {
    if(!this.kind) throw new Error(`evaluate: mixed network ${this}, use reactance() or resonances()`);

    const vals = this.nodes.map(n => n.evaluate(values));
    const sum = vals.reduce((s, v) => s + v, 0);
    const harmonic = 1 / vals.reduce((s, v) => s + 1 / v, 0);

    return this.adds(this.kind) ? sum : harmonic;
  }

  toJS(p) {
    if(!this.kind) throw new Error(`toJS: mixed network ${this}`);

    const exprs = this.nodes.map(n => n.toJS(p));

    if(this.adds(this.kind)) return `(${exprs.join(' + ')})`;
    if(exprs.length == 2) return `((${exprs[0]} * ${exprs[1]}) / (${exprs[0]} + ${exprs[1]}))`;

    return `(1 / (${exprs.map(e => `(1 / ${e})`).join(' + ')}))`;
  }
}

/**
 * Several parts in series: reactances add.
 *
 * @class      SeriesGroup
 */
export class SeriesGroup extends Group {
  get sep() {
    return ' + ';
  }

  /* does the effective value of this kind add up (L in series, C in parallel)? */
  adds(kind) {
    return kind == 'L';
  }

  reactance(w, values) {
    return this.nodes.reduce((s, n) => s + n.reactance(w, values), 0);
  }
}

/**
 * Several parts in parallel: susceptances add.
 *
 * @class      ParallelGroup
 */
export class ParallelGroup extends Group {
  get sep() {
    return ' | ';
  }

  adds(kind) {
    return kind == 'C';
  }

  reactance(w, values) {
    let b = 0;

    for(const n of this.nodes) {
      const x = n.reactance(w, values);

      if(x === 0) return 0;
      b += 1 / x;
    }

    return b === 0 ? Infinity : 1 / b;
  }
}

SeriesGroup.prototype[Symbol.toStringTag] = 'SeriesGroup';
ParallelGroup.prototype[Symbol.toStringTag] = 'ParallelGroup';

/*
 * Parse a network from text: `+` is series, `|` parallel (binds tighter),
 * parentheses group, a part is a name with an optional value:
 *
 *   Parse('(L1=27n | C1=470p) + C2=3p')
 */
export function Parse(str) {
  const tokens = String(str).match(/[()+|]|[^\s()+|=]+(?:\s*=\s*[^\s()+|]+)?/g) ?? [];
  let pos = 0;

  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const list = (item, sep, Group) => {
    const nodes = [item()];

    while(peek() == sep) {
      next();
      while(sep == '|' && peek() == '|') next(); /* `||` */
      nodes.push(item());
    }

    return nodes.length == 1 ? nodes[0] : new Group(nodes);
  };

  const atom = () => {
    const t = next();

    if(t === undefined) throw new SyntaxError(`Parse: unexpected end of '${str}'`);

    if(t == '(') {
      const n = series();

      if(next() != ')') throw new SyntaxError(`Parse: missing ')' in '${str}'`);

      return n;
    }

    if(/^[()+|]$/.test(t)) throw new SyntaxError(`Parse: unexpected '${t}' in '${str}'`);

    const [name, val] = t.split(/\s*=\s*/);
    let value;

    if(val !== undefined) {
      value = NumericValue(Unit(val));

      if(!(value > 0)) throw new SyntaxError(`Parse: bad value '${val}' for ${name}`);
    }

    return new ComponentNode(name, value);
  };

  const parallel = () => list(atom, '|', ParallelGroup);
  const series = () => list(parallel, '+', SeriesGroup);
  const root = series();

  if(pos < tokens.length) throw new SyntaxError(`Parse: unexpected '${peek()}' in '${str}'`);

  return root;
}

/* ------------------------------------------------------------------------ *
 * Schematic: vertical two-terminal drawing, parts as in a printed circuit
 * diagram (plates, coils, junction dots). Every node is laid out as a box
 * { w, h, ax, draw(x, y) } whose terminals sit at (ax, 0) and (ax, h).
 * ------------------------------------------------------------------------ */

const SCH = {
  scale: 1,
  stroke: 1.7,
  color: '#1a1a1a',
  fontSize: 10.5,
  compH: 44, // height of one part
  plateW: 24,
  plateT: 3.4,
  plateGap: 6,
  loops: 4,
  loopRx: 5,
  loopRy: 4,
  rail: 9, // distance of a parallel rail from its box edge
  gap: 12, // between parallel branches
  margin: 8,
  lead: 12, // from a terminal symbol to the network
  terminals: 'ports', // 'ports' | 'ground' | 'none'
};

const fmt = n => +n.toFixed(2);

function Label(c) {
  return c.value != null ? FormatNumber(c.value, UNITS[c.kind], 'floor', RoundTo(3)).replace(/\s/g, '') : null;
}

function layoutPart(c, o) {
  const isC = c.kind == 'C',
    value = Label(c),
    fs = o.fontSize,
    ax = isC ? o.plateW / 2 + 2 : 4,
    lx = ax + (isC ? o.plateW / 2 : o.loopRx) + 5,
    tw = Math.max(c.name.length, value?.length ?? 0) * fs * 0.62;

  return {
    w: lx + tw + 2,
    h: o.compH,
    ax,
    draw(x, y) {
      const cx = x + ax,
        h = o.compH,
        cy = y + h / 2;
      let s;

      if(isC) {
        const t = o.plateT,
          g = o.plateGap / 2;

        s =
          `<path d="M${fmt(cx)},${fmt(y)}V${fmt(cy - g - t)}M${fmt(cx)},${fmt(cy + g + t)}V${fmt(y + h)}"/>` +
          [-g - t, g].map(d => `<rect x="${fmt(cx - o.plateW / 2)}" y="${fmt(cy + d)}" width="${o.plateW}" height="${t}" rx="0.6" fill="currentColor" stroke="none"/>`).join('');
      } else {
        const y0 = cy - o.loops * o.loopRy;

        s = `<path d="M${fmt(cx)},${fmt(y)}V${fmt(y0)}${`a${o.loopRx},${o.loopRy} 0 0 1 0,${2 * o.loopRy}`.repeat(o.loops)}V${fmt(y + h)}"/>`;
      }

      const font = `font-family="Helvetica,Arial,sans-serif" font-weight="bold" font-size="${fs}" fill="currentColor" stroke="none"`;

      s += `<text x="${fmt(x + lx)}" y="${fmt(value ? cy - 1.5 : cy + fs * 0.35)}" ${font}>${c.name}</text>`;
      if(value) s += `<text x="${fmt(x + lx)}" y="${fmt(cy + fs)}" ${font}>${value}</text>`;

      return s;
    },
  };
}

function layoutSeries(g, o) {
  const kids = g.nodes.map(n => layout(n, o)),
    ax = Math.max(...kids.map(k => k.ax));

  return {
    ax,
    w: Math.max(...kids.map(k => ax - k.ax + k.w)),
    h: kids.reduce((s, k) => s + k.h, 0),
    draw(x, y) {
      return kids
        .map(k => {
          const r = k.draw(x + ax - k.ax, y);
          y += k.h;
          return r;
        })
        .join('');
    },
  };
}

function layoutParallel(g, o) {
  const kids = g.nodes.map(n => layout(n, o)),
    maxH = Math.max(...kids.map(k => k.h)),
    H = maxH + 2 * o.rail,
    xs = [];
  let x = 0;

  for(const k of kids) {
    xs.push(x);
    x += k.w + o.gap;
  }

  const spine = i => xs[i] + kids[i].ax,
    first = spine(0),
    last = spine(kids.length - 1),
    ax = (first + last) / 2;

  return {
    ax,
    w: x - o.gap,
    h: H,
    draw(px, py) {
      const top = py + o.rail,
        bot = py + H - o.rail;
      let d = `M${fmt(px + ax)},${fmt(py)}V${fmt(top)}M${fmt(px + ax)},${fmt(py + H)}V${fmt(bot)}M${fmt(px + first)},${fmt(top)}H${fmt(px + last)}M${fmt(px + first)},${fmt(bot)}H${fmt(px + last)}`;
      let s = '';
      const dots = new Set([ax]);

      kids.forEach((k, i) => {
        const y = top + (maxH - k.h) / 2,
          sx = px + spine(i);

        d += `M${fmt(sx)},${fmt(top)}V${fmt(y)}M${fmt(sx)},${fmt(y + k.h)}V${fmt(bot)}`;
        s += k.draw(px + xs[i], y);

        if(i > 0 && i < kids.length - 1) dots.add(spine(i));
      });

      for(const dx of dots) for(const dy of [top, bot]) s += `<circle cx="${fmt(px + dx)}" cy="${fmt(dy)}" r="2.4" fill="currentColor" stroke="none"/>`;

      return `<path d="${d}"/>` + s;
    },
  };
}

function layout(node, o) {
  if(node instanceof SeriesGroup) return layoutSeries(node, o);
  if(node instanceof ParallelGroup) return layoutParallel(node, o);

  return layoutPart(node, o);
}

export function Schematic(node, opts) {
  const o = { ...SCH, ...opts },
    lay = layout(node, o),
    R = 3.4,
    M = o.margin,
    ox = M + Math.max(0, 14 - lay.ax),
    cx = ox + lay.ax,
    ports = o.terminals == 'ports',
    ground = o.terminals == 'ground',
    topH = o.terminals == 'none' ? 0 : 2 * R + o.lead,
    botH = ports ? o.lead + 2 * R : ground ? o.lead - 2 + 4 : 0,
    W = ox + lay.w + M,
    H = M + topH + lay.h + botH + M,
    y = M + topH,
    yb = y + lay.h;
  let s = '';

  if(o.terminals != 'none') {
    s += `<path d="M${fmt(cx)},${fmt(M + 2 * R)}V${fmt(y)}M${fmt(cx)},${fmt(yb)}V${fmt(yb + o.lead - (ground ? 2 : 0))}"/>`;
    s += `<circle cx="${fmt(cx)}" cy="${fmt(M + R)}" r="${R}" fill="#fff"/>`;
    if(ports) s += `<circle cx="${fmt(cx)}" cy="${fmt(yb + o.lead + R)}" r="${R}" fill="#fff"/>`;
    if(ground) s += `<rect x="${fmt(cx - 13)}" y="${fmt(yb + o.lead - 2)}" width="26" height="4" rx="0.6" fill="currentColor" stroke="none"/>`;
  }

  s += lay.draw(ox, y);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(W)} ${fmt(H)}" width="${fmt(W * o.scale)}" height="${fmt(H * o.scale)}" color="${o.color}" role="img">` +
    `<title>${node}</title>` +
    `<g fill="none" stroke="currentColor" stroke-width="${o.stroke}" stroke-linecap="round" stroke-linejoin="round">${s}</g></svg>`
  );
}

/* ------------------------------------------------------------------------ *
 * Equations: a tiny typesetter. A box is { w, a, d, draw(x, y) } with the
 * baseline at y, ascent a above and descent d below it.
 * ------------------------------------------------------------------------ */

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function glyphWidth(ch) {
  if('ijl1tf.,:;()| ·'.includes(ch)) return 0.3;
  if('mwMW'.includes(ch)) return 0.78;
  if('ω'.includes(ch)) return 0.68;

  return 0.52;
}

function Text(str, fs, italic = false) {
  return {
    w: [...str].reduce((s, c) => s + glyphWidth(c) * fs, 0) + 0.04 * fs,
    a: 0.72 * fs,
    d: 0.22 * fs,
    draw: (x, y) => `<text x="${fmt(x)}" y="${fmt(y)}" font-size="${fmt(fs)}"${italic ? ' font-style="italic"' : ''}>${esc(str)}</text>`,
  };
}

/* variable name, with trailing digits as a subscript: L1 -> L_1 */
function Sym(name, fs) {
  const m = /^(\D+?)(\d+)$/.exec(name);

  if(!m) return Text(name, fs, true);

  const base = Text(m[1], fs, true),
    sub = Text(m[2], fs * 0.7);

  return {
    w: base.w + sub.w,
    a: base.a,
    d: Math.max(base.d, 0.25 * fs + sub.d),
    draw: (x, y) => base.draw(x, y) + sub.draw(x + base.w, y + 0.25 * fs),
  };
}

function Row(items, fs, gap = 0.25) {
  const g = gap * fs;

  return {
    w: items.reduce((s, b) => s + b.w, 0) + g * (items.length - 1),
    a: Math.max(...items.map(b => b.a)),
    d: Math.max(...items.map(b => b.d)),
    draw(x, y) {
      let s = '';

      for(const b of items) {
        s += b.draw(x, y);
        x += b.w + g;
      }

      return s;
    },
  };
}

function Sum(items, fs) {
  const parts = [];

  items.forEach((b, i) => parts.push(...(i ? [Text('+', fs), b] : [b])));

  return { ...Row(parts, fs, 0.3), sum: true };
}

function Frac(n, d, fs) {
  const pad = 0.2 * fs,
    gap = 0.18 * fs,
    axis = 0.3 * fs,
    t = Math.max(1, fs * 0.07),
    w = Math.max(n.w, d.w) + 2 * pad;

  return {
    w,
    a: axis + gap + n.d + n.a,
    d: Math.max(0, d.a + d.d + gap - axis),
    draw(x, y) {
      const bar = y - axis;

      return (
        n.draw(x + (w - n.w) / 2, bar - gap - n.d) +
        `<line x1="${fmt(x + pad / 2)}" x2="${fmt(x + w - pad / 2)}" y1="${fmt(bar)}" y2="${fmt(bar)}" stroke="currentColor" stroke-width="${fmt(t)}"/>` +
        d.draw(x + (w - d.w) / 2, bar + gap + d.a)
      );
    },
  };
}

function Paren(b, fs) {
  const h = b.a + b.d + 0.1 * fs,
    pw = 0.3 * fs,
    top = -b.a - 0.05 * fs,
    bot = b.d + 0.05 * fs;

  return {
    w: b.w + 2 * pw,
    a: b.a + 0.05 * fs,
    d: b.d + 0.05 * fs,
    draw: (x, y) =>
      `<path d="M${fmt(x + pw * 0.8)},${fmt(y + top)}Q${fmt(x)},${fmt(y + (top + bot) / 2)} ${fmt(x + pw * 0.8)},${fmt(y + bot)}M${fmt(x + pw + b.w + pw * 0.2)},${fmt(y + top)}Q${fmt(x + 2 * pw + b.w)},${fmt(y + (top + bot) / 2)} ${fmt(x + pw + b.w + pw * 0.2)},${fmt(y + bot)}" fill="none" stroke="currentColor" stroke-width="${fmt(Math.max(1, fs * 0.06))}" stroke-linecap="round"/>` +
      b.draw(x + pw, y),
  };
}

function Sqrt(b, fs) {
  const gap = 0.15 * fs,
    t = Math.max(1, fs * 0.07),
    lead = 0.7 * fs;

  return {
    w: lead + b.w + 0.15 * fs,
    a: b.a + gap + t,
    d: b.d,
    draw(x, y) {
      const top = y - b.a - gap,
        bot = y + b.d + 0.05 * fs;

      return (
        `<path d="M${fmt(x)},${fmt(y - 0.3 * fs)}L${fmt(x + 0.12 * fs)},${fmt(y - 0.34 * fs)}L${fmt(x + 0.34 * fs)},${fmt(bot)}L${fmt(x + lead - 0.1 * fs)},${fmt(top)}H${fmt(x + lead + b.w + 0.1 * fs)}" fill="none" stroke="currentColor" stroke-width="${fmt(t)}" stroke-linejoin="round" stroke-linecap="round"/>` +
        b.draw(x + lead, y)
      );
    },
  };
}

const jw = fs => Row([Text('j', fs, true), Text('ω', fs, true)], fs, 0.05);

/* impedance Z and admittance Y of a node as boxes, mutually recursive */
function ZBox(node, fs, lv = 0) {
  const f = fs * Math.max(0.6, 1 - 0.1 * lv);

  if(node instanceof ComponentNode) {
    const part = Row([jw(f), Sym(node.name, f)], f, 0.05);

    return node.kind == 'L' ? part : Frac(Text('1', f), part, f);
  }

  if(node instanceof SeriesGroup) return Sum(node.nodes.map(n => ZBox(n, fs, lv)), f);

  return Frac(Text('1', f), YBox(node, fs, lv + 1), f);
}

function YBox(node, fs, lv = 0) {
  const f = fs * Math.max(0.6, 1 - 0.1 * lv);

  if(node instanceof ComponentNode) {
    const part = Row([jw(f), Sym(node.name, f)], f, 0.05);

    return node.kind == 'C' ? part : Frac(Text('1', f), part, f);
  }

  if(node instanceof ParallelGroup) return Sum(node.nodes.map(n => YBox(n, fs, lv)), f);

  return Frac(Text('1', f), ZBox(node, fs, lv + 1), f);
}

/* effective L (or C) of a one-kind network, in the usual closed forms */
function EffectiveBox(node, fs) {
  if(node instanceof ComponentNode) return Sym(node.name, fs);

  const kids = node.nodes.map(n => EffectiveBox(n, fs));

  if(node.adds(node.kind)) return Sum(kids, fs);

  if(kids.length == 2) {
    const p = kids.map(k => (k.sum ? Paren(k, fs) : k));

    return Frac(Row([p[0], Text('·', fs), p[1]], fs, 0.15), Sum(kids, fs), fs);
  }

  return Frac(Text('1', fs), Sum(kids.map(k => Frac(Text('1', fs), k, fs)), fs), fs);
}

function Page(box, fs, color = '#1a1a1a', margin = 0.5) {
  const m = margin * fs,
    W = box.w + 2 * m,
    H = box.a + box.d + 2 * m;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(W)} ${fmt(H)}" width="${fmt(W)}" height="${fmt(H)}" color="${color}" role="img"><g fill="currentColor" stroke="none" font-family="'Times New Roman',Times,serif">${box.draw(m, m + box.a)}</g></svg>`;
}

export function EquationSVG(node, { fontSize = 18, color } = {}) {
  const fs = fontSize;

  const lhs = Row([Text('Z(', fs, true), jw(fs), Text(')', fs)], fs, 0.02);

  return Page(Row([lhs, Text('=', fs), ZBox(node, fs)], fs, 0.3), fs, color);
}

/**
 * This class models the Thomson formula for a tank made of an inductive
 * network and a capacitive network.
 *
 * @class      ThomsonEquation
 */
export class ThomsonEquation {
  constructor(L_network, C_network) {
    this.L = L_network; /* ComponentNode or Group */
    this.C = C_network; /* ComponentNode or Group */
  }

  /* the same tank as a general network, e.g. for resonances() or schematic() */
  network() {
    return new ParallelGroup([this.L, this.C]);
  }

  /* 1. Solve for frequency: f = 1 / (2 * pi * sqrt(L * C)) */
  calculateFrequency(values) {
    const Leq = this.L.evaluate(values);
    const Ceq = this.C.evaluate(values);
    return 1 / ($2PI * Math.sqrt(Leq * Ceq));
  }

  /* 2. Frequency formula as a complete <svg> string */
  renderFrequencySVG({ fontSize = 20, color } = {}) {
    const fs = fontSize,
      factor = n => {
        const b = EffectiveBox(n, fs);

        return b.sum ? Paren(b, fs) : b;
      },
      radicand = Row([factor(this.L), Text('·', fs), factor(this.C)], fs, 0.2),
      den = Row([Text('2π', fs), Sqrt(radicand, fs)], fs, 0.1);

    return Page(Row([Text('f', fs, true), Text('=', fs), Frac(Text('1', fs), den, fs)], fs, 0.3), fs, color);
  }

  /* schematic of the tank */
  drawCircuit(opts) {
    return this.network().schematic(opts);
  }

  /* composite impedance equation of the tank */
  renderImpedanceSVG(opts) {
    return this.network().equationSVG(opts);
  }

  /* 3. Synthesize component target solving */
  calculateTargetEquivalent(target, values) {
    const { f } = values;
    const reqProduct = 1 / (4 * $PI2 * f ** 2);

    if(target == 'L') return reqProduct / this.C.evaluate(values);
    if(target == 'C') return reqProduct / this.L.evaluate(values);
  }

  /* 1. Universal evaluator for the whole tank */
  evaluate(values) {
    const Leq = this.L.evaluate(values);
    const Ceq = this.C.evaluate(values);
    return { Leq, Ceq, freq: this.calculateFrequency(values) };
  }

  toJS(p = '') {
    const lExpr = this.L.toJS(p);
    const cExpr = this.C.toJS(p);

    return `1 / (2 * Math.PI * Math.sqrt(${lExpr} * ${cExpr}))`;
  }

  compileSolver(target) {
    if(target === 'f') return new Function('values', `return ${this.toJS('values')};`);

    return (values, min = 1e-12, max = 1.0, tolerance = 1e-2) => {
      const targetFreq = values.f;
      let lowLog = Math.log10(min);
      let highLog = Math.log10(max);
      let guess = min;

      for(let i = 0; i < 50; i++) {
        const midLog = (lowLog + highLog) / 2;
        guess = Math.pow(10, midLog);

        const { freq } = this.evaluate({ ...values, [target]: guess });
        const diff = freq - targetFreq;

        if(Math.abs(diff) < tolerance) break;

        if(freq > targetFreq) lowLog = midLog;
        else highLog = midLog;
      }

      return guess;
    };
  }
}

ThomsonEquation.prototype[Symbol.toStringTag] = 'ThomsonEquation';
