const $2PI = Math.PI * 2;
const $PI2 = Math.PI ** 2;

/**
 * This class models an RLC component with a designator
 *
 * @class      ComponentNode (name)
 */
export class ComponentNode {
  constructor(name) {
    this.name = name;
  }

  get unit() {
    if(/[RCLX]/y.test(this.name[0])) return this.name[0];
  }

  evaluate(values) {
    return values[this.name] ?? 0;
  }

  toJS(p = '') {
    return (p.length ? p + '.' : '') + this.name;
  }

  toSVG() {
    return `<tspan font-style="italic">${this.name}</tspan>`;
  }
}

ComponentNode.prototype[Symbol.toStringTag] = 'ComponentNode';

/**
 * This class models several components of the same type in a series circuit
 *
 * @class      SeriesGroup
 *
 * @param {Array}  nodes   The nodes/groups
 * @param {String} unit    The unit (L, C, R)
 */
export class SeriesGroup {
  constructor(nodes, unit) {
    this.nodes = nodes;
    this.unit = unit ?? nodes?.find(n => n.unit)?.unit; /* 'C' or 'L' */
  }

  evaluate(values) {
    const vals = this.nodes.map(n => n.evaluate(values));

    if(this.unit == 'C') {
      const invSum = vals.reduce((sum, v) => sum + (v ? 1 / v : 0), 0);
      return invSum ? 1 / invSum : 0;
    }

    return vals.reduce((sum, v) => sum + v, 0);
  }

  toJS(p) {
    const exprs = this.nodes.map(n => n.toJS(p));

    /* 1 / (1/a + 1/b) -> simplified for 2 nodes: (a * b) / (a + b) */
    if(this.unit == 'C') {
      if(exprs.length == 2) return `((${exprs[0]} * ${exprs[1]}) / (${exprs[0]} + ${exprs[1]}))`;

      return `(1 / (${exprs.map(e => `(1 / ${e})`).join(' + ')}))`;
    }

    return `(${exprs.join(' + ')})`;
  }

  toSVG() {
    /* Formats symbolically: (C1 · C2) / (C1 + C2) for 2 caps */
    if(this.unit == 'C' && this.nodes.length == 2) {
      const [n1, n2] = this.nodes.map(n => n.toSVG());

      return (
        `<g class="fraction">` +
        `<text x="0" y="-6" font-size="18">${n1} &#183; ${n2}</text>` +
        `<line x1="-2" y1="0" x2="55" y2="0" stroke="black" stroke-width="1.5" />` +
        `<text x="0" y="20" font-size="18">${n1} + ${n2}</text>` +
        `</g>`
      );
    }

    return `<text font-size="18">(${this.nodes.map(n => n.toSVG()).join(' + ')})</text>`;
  }
}

SeriesGroup.prototype[Symbol.toStringTag] = 'SeriesGroup';

/**
 * This class models several components of the same type in a parallel circuit
 *
 * @class      SeriesGroup
 *
 * @param {Array}  nodes   The nodes/groups
 * @param {String} unit    The unit (L, C, R)
 */
export class ParallelGroup {
  constructor(nodes, unit) {
    this.nodes = nodes;
    this.unit = unit ?? nodes?.find(n => n.unit)?.unit; /* 'C' or 'L' */
  }

  evaluate(values) {
    const vals = this.nodes.map(n => n.evaluate(values));

    /* Capacitors in parallel: C1 + C2 + ... */
    if(this.unit == 'C') return vals.reduce((sum, v) => sum + v, 0);

    /* Inductors in parallel: 1 / (1/L1 + 1/L2 + ...) */
    const invSum = vals.reduce((sum, v) => sum + (v ? 1 / v : 0), 0);
    return invSum ? 1 / invSum : 0;
  }

  toJS(p) {
    const exprs = this.nodes.map(n => n.toJS(p));

    /* Capacitors in parallel: C1 + C2 + ... */
    if(this.unit == 'C') return `(${exprs.join(' + ')})`;

    /* Inductors in parallel: 1 / (1/L1 + 1/L2 + ...) */
    if(exprs.length == 2) return `((${exprs[0]} * ${exprs[1]}) / (${exprs[0]} + ${exprs[1]}))`;

    return `(1 / (${exprs.map(e => `(1 / ${e})`).join(' + ')}))`;
  }

  toSVG() {
    if(this.unit == 'C') {
      const inner = this.nodes.map(n => n.toSVG()).join(' + ');
      return `<text font-size="18">(${inner})</text>`;
    }

    /* Parallel inductors */
    if(this.nodes.length == 2) {
      const [n1, n2] = this.nodes.map(n => n.toSVG());
      return;
      `<g class="fraction">` +
        `<text x="0" y="-6" font-size="18">${n1} &#183; ${n2}</text>` +
        `<line x1="-2" y1="0" x2="55" y2="0" stroke="black" stroke-width="1.5" />` +
        `<text x="0" y="20" font-size="18">${n1} + ${n2}</text>` +
        `</g>`;
    }

    return `<text font-size="18">(${this.nodes.map(n => n.toSVG()).join(' + ')})</text>`;
  }
}

ParallelGroup.prototype[Symbol.toStringTag] = 'ParallelGroup';

/**
 * This class models the Thomson formula
 *
 * @class      ThomsonEquation
 *
 * @param {Object} L_network    The inductance network
 * @param {Object} C_network    The capacitance network
 */
export class ThomsonEquation {
  constructor(L_network, C_network) {
    this.L = L_network; /* ComponentNode or Group */
    this.C = C_network; /* ComponentNode or Group */
  }

  /* 1. Solve for frequency: f = 1 / (2 * pi * sqrt(L * C)) */
  calculateFrequency(values) {
    const Leq = this.L.evaluate(values);
    const Ceq = this.C.evaluate(values);
    return 1 / ($2PI * Math.sqrt(Leq * Ceq));
  }

  /* 2. Synthesize frequency formula as SVG markup */
  renderFrequencySVG() {
    const svgL = this.L.toSVG();
    const svgC = this.C.toSVG();

    const isLGroup = this.L instanceof SeriesGroup || this.L instanceof ParallelGroup;
    const isCGroup = this.C instanceof SeriesGroup || this.C instanceof ParallelGroup;

    const wrappedL = isLGroup ? svgL : `<text font-size="22">${svgL}</text>`;
    const wrappedC = isCGroup ? svgC : `<text font-size="22">${svgC}</text>`;

    return `<svg viewBox="0 0 450 130" xmlns="http://www.w3.org/2000/svg" font-family="Times New Roman, serif">
  <!-- Target Left Hand Side -->
  <text x="20" y="65" font-size="32" font-style="italic">f</text>
  <text x="45" y="65" font-size="32">=</text>

  <!-- Numerator -->
  <text x="230" y="30" font-size="28">1</text>

  <!-- Fraction Bar -->
  <line x1="90" y1="42" x2="370" y2="42" stroke="black" stroke-width="2.5" />

  <!-- Denominator: 2 * pi * sqrt( Leq * Ceq ) -->
  <g transform="translate(90, 85)" font-size="28">
    <text x="0" y="5">2&#960;</text>

    <!-- Radical Sign -->
    <path d="M 45 0 L 50 0 L 56 15 L 66 -35 L 270 -35" fill="none" stroke="black" stroke-width="2" />

    <!-- Radicand (L * C networks) -->
    <g transform="translate(75, -10)">
      <g transform="translate(0, 0)">
        ${wrappedL}
      </g>
      <text x="65" y="8" font-size="22">&#183;</text>
      <g transform="translate(85, 0)">
        ${wrappedC}
      </g>
    </g>
  </g>
</svg>`;
  }

  /* 3. Synthesize component target solving: solve for Leq or Ceq */
  calculateTargetEquivalent(target, { f }) {
    const reqProduct = 1 / (4 * $PI2 * f ** 2); /* Leq * Ceq */

    if(target == 'L') return reqProduct / this.C.evaluate(values); /* Returns required Leq */
    if(target == 'C') return reqProduct / this.L.evaluate(values); /* Returns required Ceq */
  }

  /* 1. Universal evaluator for the whole tank */
  evaluate(values) {
    const Leq = this.L.evaluate(values);
    const Ceq = this.C.evaluate(values);

    return { Leq, Ceq, freq: 1 / ($2PI * Math.sqrt(Leq * Ceq)) };
  }

  toJS(p = '') {
    const lExpr = this.L.toJS(p);
    const cExpr = this.C.toJS(p);

    return `1 / (2 * Math.PI * Math.sqrt(${lExpr} * ${cExpr}))`;
  }

  /**
   * Synthesizes and compiles a specialized JS calculation function
   * for any target variable (e.g., 'f', 'L1', 'C1', 'C2')
   */
  compileSolver(target) {
    /* f = 1 / (2 * pi * sqrt(Leq * Ceq)) */
    if(target == 'f') return new Function('values', `return ${this.toJS('values')};`);

    /* For component targets (e.g., solving C1 given frequency f and other
       values) Uses a robust bisection numerical solver over evaluate() */
    return (values, min = 1e-15, max = 1.0) => {
      const { f } = values;

      for(let i = 0; i < 50; i++) {
        const guess = (min + max) / 2;

        const { freq } = this.evaluate({ ...values, [target]: guess });

        /* Depending on whether freq increases/decreases with value */
        if(freq > f) min = guess;
        else max = guess;
      }

      return guess;
    };
  }
}

ThomsonEquation.prototype[Symbol.toStringTag] = 'ThomsonEquation';
