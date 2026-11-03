// Pre-render the equations of the basic mode with MathJax (TeX input, SVG
// output, glyphs as plain paths, no font cache) into src/svg/. The LaTeX
// comes from ThomsonEquation#toLaTeX(), so the images follow the model.
// Run: bun tools/equations.js [em-size-in-px]

import { createRequire } from 'node:module';
import { ComponentNode, ThomsonEquation } from '../src/equations.js';

const require = createRequire(import.meta.url);
const { mathjax } = require('mathjax-full/js/mathjax.js');
const { TeX } = require('mathjax-full/js/input/tex.js');
const { SVG } = require('mathjax-full/js/output/svg.js');
const { liteAdaptor } = require('mathjax-full/js/adaptors/liteAdaptor.js');
const { RegisterHTMLHandler } = require('mathjax-full/js/handlers/html.js');
const { AllPackages } = require('mathjax-full/js/input/tex/AllPackages.js');

const adaptor = liteAdaptor();

RegisterHTMLHandler(adaptor);

const doc = mathjax.document('', { InputJax: new TeX({ packages: AllPackages }), OutputJax: new SVG({ fontCache: 'none' }) });

/* LaTeX source -> standalone <svg> sized at `em` px per em */
export function RenderLaTeX(tex, em = 48) {
  const node = doc.convert(tex, { display: true, em: 16, ex: 8 }),
    svg = adaptor.innerHTML(node);
  const [x, y, w, h] = /viewBox="([^"]+)"/.exec(svg)[1].split(/\s+/).map(Number);
  const px = n => +((n * em) / 1000).toFixed(3);

  /* only the root element is rewritten, the rects (fraction bars) need their sizes */
  const root = /^<svg[^>]*>/.exec(svg)[0],
    attrs = root.replace(/ (style|role|focusable|aria-hidden|width|height)="[^"]*"/g, '').replace(/^<svg/, `<svg width="${px(w)}" height="${px(h)}"`);

  return svg.replace(root, attrs).replace(/ data-[a-z-]+="[^"]*"/g, '') + '\n';
}

if(import.meta.main) {
  const em = +process.argv[2] || 48;
  const t = new ThomsonEquation(new ComponentNode('L'), new ComponentNode('C'));

  for(const [target, name] of [['f', 'freq'], ['L', 'inductance'], ['C', 'capacitance']]) {
    const file = new URL(`../src/svg/${name}-equation.svg`, import.meta.url);

    await Bun.write(file, RenderLaTeX(t.toLaTeX(target), em));
    console.log(`${name}-equation.svg  ${t.toLaTeX(target)}`);
  }
}
