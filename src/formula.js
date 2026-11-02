/* Basic building blocks */
export class ComponentNode {
  constructor(name) {
    this.name = name;
  }

  evaluate(values) {
    return values[this.name] ?? 0;
  }

  toSVG() {
    return `<tspan font-style="italic">${this.name}</tspan>`;
  }
}

export class SeriesGroup {
  constructor(nodes, unit = 'C') {
    this.nodes = nodes;
    this.unit = unit; /* 'C' or 'L' */
  }

  evaluate(values) {
    const vals = this.nodes.map(n => n.evaluate(values));
    if(this.unit === 'C') {
      /* Capacitors in series: 1 / (1/C1 + 1/C2 + ...) */
      const invSum = vals.reduce((sum, v) => sum + (v ? 1 / v : 0), 0);
      return invSum ? 1 / invSum : 0;
    } else {
      /* Inductors in series: L1 + L2 + ... */
      return vals.reduce((sum, v) => sum + v, 0);
    }
  }

  toSVG() {
    if(this.unit === 'C') {
      /* Formats symbolically: (C1 · C2) / (C1 + C2) for 2 caps, or 1 / (1/C1 +
       * ...) */
      if(this.nodes.length === 2) {
        const [n1, n2] = this.nodes.map(n => n.toSVG());
        return (
          `<g class="fraction">` +
          `<g class="num">${n1} &#183; ${n2}</g>` +
          `<line class="frac-bar" />` +
          `<g class="den">${n1} + ${n2}</g>` +
          `</g>`
        );
      }
    }
    return `(${this.nodes.map(n => n.toSVG()).join(' + ')})`;
  }
}

export class ParallelGroup {
  constructor(nodes, unit = 'C') {
    this.nodes = nodes;
    this.unit = unit;
  }

  evaluate(values) {
    const vals = this.nodes.map(n => n.evaluate(values));
    if(this.unit === 'C') {
      /* Capacitors in parallel: C1 + C2 + ... */
      return vals.reduce((sum, v) => sum + v, 0);
    } else {
      /* Inductors in parallel: 1 / (1/L1 + 1/L2 + ...) */
      const invSum = vals.reduce((sum, v) => sum + (v ? 1 / v : 0), 0);
      return invSum ? 1 / invSum : 0;
    }
  }

  toSVG() {
    if(this.unit === 'C') {
      return `(${this.nodes.map(n => n.toSVG()).join(' + ')})`;
    } else {
      /* Parallel inductors */
      const [n1, n2] = this.nodes.map(n => n.toSVG());
      return (
        `<g class="fraction">` +
        `<g class="num">${n1} &#183; ${n2}</g>` +
        `<line class="frac-bar" />` +
        `<g class="den">${n1} + ${n2}</g>` +
        `</g>`
      );
    }
  }
}

export class ThomsonEquation {
  constructor(L_network, C_network) {
    this.L = L_network; /* ComponentNode or Group */
    this.C = C_network; /* ComponentNode or Group */
  }

  /* 1. Solve for frequency: f = 1 / (2 * pi * sqrt(L * C)) */
  calculateFrequency(values) {
    const Leq = this.L.evaluate(values);
    const Ceq = this.C.evaluate(values);
    return 1 / (2 * Math.PI * Math.sqrt(Leq * Ceq));
  }

  /* 2. Synthesize frequency formula as SVG markup */
  renderFrequencySVG() {
    const svgL = this.L.toSVG();
    const svgC = this.C.toSVG();

    return `<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" font-family="Times New Roman, serif">
  <!-- Target Left Hand Side -->
  <text x="20" y="65" font-size="32" font-style="italic">f</text>
  <text x="45" y="65" font-size="32">=</text>

  <!-- Numerator -->
  <text x="180" y="35" font-size="28">1</text>
  
  <!-- Fraction Bar -->
  <line x1="90" y1="48" x2="290" y2="48" stroke="black" stroke-width="2.5" />

  <!-- Denominator: 2 * pi * sqrt( Leq * Ceq ) -->
  <g transform="translate(90, 85)" font-size="28">
    <text x="0" y="0">2&#960;</text>
    
    <!-- Radical Sign -->
    <path d="M 45 -5 L 50 -5 L 56 10 L 66 -25 L 190 -25" fill="none" stroke="black" stroke-width="2" />
    
    <!-- Radicand (L * C networks) -->
    <g transform="translate(70, 0)">
      ${svgL} &#183; ${svgC}
    </g>
  </g>
</svg>
`;
  }

  /* 3. Synthesize component target solving: solve for Leq or Ceq */
  calculateTargetEquivalent(target, values) {
    const f = values.f;
    const reqProduct = 1 / (4 * Math.PI ** 2 * f ** 2); /* Leq * Ceq */

    if(target === 'L') {
      const Ceq = this.C.evaluate(values);
      return reqProduct / Ceq; /* Returns required Leq */
    }

    if(target === 'C') {
      const Leq = this.L.evaluate(values);
      return reqProduct / Leq; /* Returns required Ceq */
    }
  }
}
