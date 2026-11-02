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
    if (/[RCLX]/y.test(this.name[0])) return this.name[0];
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

  /**
   * Renders a vertical schematic SVG element spanning exactly 100px in height (y=0 to y=100)
   */
  drawCircuit() {
    const type = this.unit;
    let symbolMarkup = '';

    if (type === 'C') {
      // Capacitor: top lead to plate 1, plate 2 to bottom lead
      symbolMarkup = `
        <line x1="0" y1="0" x2="0" y2="40" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <line x1="-14" y1="40" x2="14" y2="40" stroke="black" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        <line x1="-14" y1="50" x2="14" y2="50" stroke="black" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        <line x1="0" y1="50" x2="0" y2="100" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      `;
    } else if (type === 'L') {
      // Inductor: top lead, 4 loops, bottom lead
      symbolMarkup = `
        <line x1="0" y1="0" x2="0" y2="16" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <path d="M 0 16 C -12 16, -12 24, 0 24 C -12 24, -12 32, 0 32 C -12 32, -12 40, 0 40 C -12 40, -12 48, 0 48 L 0 84" fill="none" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <line x1="0" y1="84" x2="0" y2="100" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      `;
    } else {
      // Resistor: top lead, zigzag, bottom lead
      symbolMarkup = `
        <line x1="0" y1="0" x2="0" y2="20" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <path d="M 0 20 L -6 26 L 6 32 L -6 38 L 6 44 L -6 50 L 6 56 L 0 62" fill="none" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        <line x1="0" y1="62" x2="0" y2="100" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      `;
    }

    return `
      <g class="component-node" data-name="${this.name}">
        ${symbolMarkup}
        <text x="20" y="54" font-size="14" font-family="sans-serif" font-style="italic" fill="black">${this.name}</text>
      </g>
    `;
  }
}

ComponentNode.prototype[Symbol.toStringTag] = 'ComponentNode';

/**
 * This class models several components of the same type in a series circuit
 *
 * @class      SeriesGroup
 */
export class SeriesGroup {
  constructor(nodes, unit) {
    this.nodes = nodes ?? [];
    this.unit = unit ?? nodes?.find(n => n.unit)?.unit; /* 'C' or 'L' */
  }

  evaluate(values) {
    const vals = this.nodes.map(n => n.evaluate(values));

    if (this.unit == 'C') {
      const invSum = vals.reduce((sum, v) => sum + (v ? 1 / v : 0), 0);
      return invSum ? 1 / invSum : 0;
    }

    return vals.reduce((sum, v) => sum + v, 0);
  }

  toJS(p) {
    const exprs = this.nodes.map(n => n.toJS(p));

    if (this.unit == 'C') {
      if (exprs.length == 2) return `((${exprs[0]} * ${exprs[1]}) / (${exprs[0]} + ${exprs[1]}))`;

      return `(1 / (${exprs.map(e => `(1 / ${e})`).join(' + ')}))`;
    }

    return `(${exprs.join(' + ')})`;
  }

  toSVG() {
    if (this.unit == 'C' && this.nodes.length == 2) {
      const [n1, n2] = this.nodes.map(n => n.toSVG());

      return (
        `<g class="fraction">` +
        `<text x="0" y="-6" font-size="18">${n1} &#183; ${n2}</text>` +
        `<line x1="-2" y1="0" x2="55" y2="0" stroke="black" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />` +
        `<text x="0" y="20" font-size="18">${n1} + ${n2}</text>` +
        `</g>`
      );
    }

    return `<text font-size="18">(${this.nodes.map(n => n.toSVG()).join(' + ')})</text>`;
  }

  /**
   * Renders child elements stacked vertically in series (each taking 50px of the 100px block)
   */
  drawCircuit() {
    const spacing = 50;
    const elements = this.nodes
      .map((node, i) => `<g transform="translate(0, ${i * spacing}) scale(1, 0.5)">${node.drawCircuit()}</g>`)
      .join('');

    return `<g class="series-group">${elements}</g>`;
  }
}

SeriesGroup.prototype[Symbol.toStringTag] = 'SeriesGroup';

/**
 * This class models several components of the same type in a parallel circuit
 *
 * @class      ParallelGroup
 */
export class ParallelGroup {
  constructor(nodes, unit) {
    this.nodes = nodes ?? [];
    this.unit = unit ?? nodes?.find(n => n.unit)?.unit; /* 'C' or 'L' */
  }

  evaluate(values) {
    const vals = this.nodes.map(n => n.evaluate(values));

    if (this.unit == 'C') return vals.reduce((sum, v) => sum + v, 0);

    const invSum = vals.reduce((sum, v) => sum + (v ? 1 / v : 0), 0);
    return invSum ? 1 / invSum : 0;
  }

  toJS(p) {
    const exprs = this.nodes.map(n => n.toJS(p));

    if (this.unit == 'C') return `(${exprs.join(' + ')})`;

    if (exprs.length == 2) return `((${exprs[0]} * ${exprs[1]}) / (${exprs[0]} + ${exprs[1]}))`;

    return `(1 / (${exprs.map(e => `(1 / ${e})`).join(' + ')}))`;
  }

  toSVG() {
    if (this.unit == 'C') {
      const inner = this.nodes.map(n => n.toSVG()).join(' + ');
      return `<text font-size="18">(${inner})</text>`;
    }

    if (this.nodes.length == 2) {
      const [n1, n2] = this.nodes.map(n => n.toSVG());
      return (
        `<g class="fraction">` +
        `<text x="0" y="-6" font-size="18">${n1} &#183; ${n2}</text>` +
        `<line x1="-2" y1="0" x2="55" y2="0" stroke="black" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />` +
        `<text x="0" y="20" font-size="18">${n1} + ${n2}</text>` +
        `</g>`
      );
    }

    return `<text font-size="18">(${this.nodes.map(n => n.toSVG()).join(' + ')})</text>`;
  }

  /**
   * Renders child elements side-by-side in parallel branches spanning y=0 to y=100
   */
  drawCircuit() {
    const branchWidth = 55;
    const count = this.nodes.length;
    const totalWidth = (count - 1) * branchWidth;
    const startX = -totalWidth / 2;

    const branches = this.nodes.map((node, i) => {
      const x = startX + i * branchWidth;
      return `<g transform="translate(${x}, 0)">${node.drawCircuit()}</g>`;
    }).join('');

    return `
      <g class="parallel-group">
        <!-- Top horizontal rail -->
        <line x1="${startX}" y1="0" x2="${startX + totalWidth}" y2="0" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
        
        <!-- Parallel branches -->
        ${branches}

        <!-- Bottom horizontal rail -->
        <line x1="${startX}" y1="100" x2="${startX + totalWidth}" y2="100" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
      </g>
    `;
  }
}

ParallelGroup.prototype[Symbol.toStringTag] = 'ParallelGroup';

/**
 * This class models the Thomson formula
 *
 * @class      ThomsonEquation
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
  <line x1="90" y1="42" x2="370" y2="42" stroke="black" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

  <!-- Denominator: 2 * pi * sqrt( Leq * Ceq ) -->
  <g transform="translate(90, 85)" font-size="28">
    <text x="0" y="5">2&#960;</text>

    <!-- Radical Sign -->
    <path d="M 45 0 L 50 0 L 56 15 L 66 -35 L 270 -35" fill="none" stroke="black" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />

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

  /**
   * Renders a complete LC tank schematic diagram with smooth linejoins
   */
  drawCircuit() {
    const drawL = this.L.drawCircuit();
    const drawC = this.C.drawCircuit();

    return `
<svg viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
  <!-- Tank Top Rail -->
  <path d="M 60 40 L 260 40" stroke="black" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round" />
  
  <!-- Left Branch (Inductance Network) -->
  <g transform="translate(60, 40)">
    ${drawL}
  </g>
  
  <!-- Right Branch (Capacitance Network) -->
  <g transform="translate(260, 40)">
    ${drawC}
  </g>
  
  <!-- Tank Bottom Rail -->
  <path d="M 60 140 L 260 140" stroke="black" stroke-width="2" fill="none" stroke-linejoin="round" stroke-linecap="round" />
</svg>`;
  }

  /* 3. Synthesize component target solving */
  calculateTargetEquivalent(target, values) {
    const { f } = values;
    const reqProduct = 1 / (4 * $PI2 * f ** 2);

    if (target == 'L') return reqProduct / this.C.evaluate(values);
    if (target == 'C') return reqProduct / this.L.evaluate(values);
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
    if (target === 'f') return new Function('values', `return ${this.toJS('values')};`);

    return (values, min = 1e-12, max = 1.0, tolerance = 1e-2) => {
      const targetFreq = values.f;
      let lowLog = Math.log10(min);
      let highLog = Math.log10(max);
      let guess = min;

      for (let i = 0; i < 50; i++) {
        const midLog = (lowLog + highLog) / 2;
        guess = Math.pow(10, midLog);

        const { freq } = this.evaluate({ ...values, [target]: guess });
        const diff = freq - targetFreq;

        if (Math.abs(diff) < tolerance) break;

        if (freq > targetFreq) lowLog = midLog;
        else highLog = midLog;
      }

      return guess;
    };
  }
}

ThomsonEquation.prototype[Symbol.toStringTag] = 'ThomsonEquation';