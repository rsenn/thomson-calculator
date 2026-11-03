import { ComponentNode, ParallelGroup, SeriesGroup, ThomsonEquation } from './equations.js';
import { Cover, Thompson } from './thomson.js';
import { Exp2Unit, Exponent, FormatNumber, IsNumber, IsString, NumericValue, ParseRange, RoundTo, Thousand, Unit } from './numbers.js';

// import './stylesheets/main.css';

const Q = s => (typeof s == 'string' ? document.querySelector(s) : s);
const QA = (...a) => [...(document.querySelectorAll(a.join(', ')) ?? [])];
const GS = s => GetProps(window.getComputedStyle(Q(s)));
const GA = s => GetAttributes(Q(s));
const GR = s => Rect(Q(s)?.getBoundingClientRect());

const NUM_FIELDS = 3;

const buffer = new ArrayBuffer(8 * NUM_FIELDS * 2);
const values = new Float64Array(buffer, 0, NUM_FIELDS);
const values2 = new Float64Array(buffer, 24, NUM_FIELDS);
const validValues = Array.from(new Array(NUM_FIELDS * 2), () => false);
const allValues = new Float64Array(buffer);
const fieldNames = ['L', 'C', 'f'];
const config = {};
/* unrounded numbers behind the text of computed fields: [{ text, range }] */
const computed = [];
const minSize = 10;
const DEFAULT_PRECISION = 3;

const Start = () => {
  try {
    Init();
  } catch(e) {
    console.log('ERROR', e.message);
    throw e;
  }
};

if(document.readyState == 'loading') document.addEventListener('DOMContentLoaded', Start);
else Start();

export function ParseValue(value, name) {
  const idx = FieldIndex(name);

  if(!IsString(name)) name = 'LCf'[idx];

  if(value != '') {
    const result = NumericValue(Unit(value, name));
    const valid = (validValues[idx] = !isNaN(result));

    if(!valid || idx === undefined) throw new Error(`ParseValue idx=${idx} name=${name} value=${value} result=${result}`);

    values[idx] = valid ? result : undefined;

    return valid;
  }
}

const rosaKm = e => Math.log(2 * Math.PI) - 1.5 - Math.log(e) / (6 * e) - 0.33084236 / e - 1 / (120 * e ** 3) + 1 / (504 * e ** 5) - 0.0011923 / e ** 7 + 5068e-7 / e ** 9;
const rosaKs = e => 1.25 - Math.log(2 * e);

function SeriesCaps(values) {
  return 1 / values.map(v => 1 / (IsString(v) ? NumericValue(Unit(v)) : v)).reduce((r, v) => r + v, 0);
}

/**
 * Calculates number of turns for a single-layer coil
 *
 * @param {Number} L          Inductance (µH)
 * @param {Number} form       form diameter (mm)
 * @param {Number} inner      inner wire diam (mm)
 * @param {Number} outer      outer wire diam (mm)
 *
 * @returns {Number}  number of turns
 */
function CoilTurns(L, form, inner, outer) {
  let n = 0,
    i = 0,
    Dk = form + outer;

  L /= 2e-4 * Math.PI * Dk;

  for(let Ks = rosaKs(outer / inner); i <= L;) {
    n += 1e-4;

    const k = (n * outer) / Dk;

    i = n * (Math.log(1 + Math.PI / (2 * k)) + 1 / (2.3004 + 3.437 * k + 1.763 * k * k - 0.47 / (0.755 + 1 / k) ** 1.44));
    i -= Ks + rosaKm(n);
    i *= n;
  }

  return n;
}

/**
 * Calculates inductance
 *
 * @param {Number} n     Number of turns
 * @param {Number} form  form diameter (mm)
 * @param {Number} len   coil length (mm)
 *
 * @returns {Number} inductance  (µH)
 */
function CoilInductance(n, form, len) {
  const Ks = rosaKs(1.07),
    Dk = form + len / n,
    k = len / Dk;

  return n * 2e-4 * Math.PI * Dk * (n * (Math.log(1 + Math.PI / (2 * k)) + 1 / (2.3004 + 3.437 * k + 1.763 * k * k - 0.47 / (0.755 + 1 / k) ** 1.44)) - (Ks + rosaKm(n)));
}

export function OnInput(event) {
  const { name } = event.target;

  if(FieldIndex(name) !== undefined) {
    event.preventDefault();

    GetRange(name);
    CalcThompson();
  }
}

export function GetProps(cssStyle) {
  return Object.fromEntries([...cssStyle].map(name => [name, cssStyle[name]]));
}

export function GetAttributes(e) {
  return Object.fromEntries(e.getAttributeNames().map(name => [name, e.getAttribute(name)]));
}

export function IsRange(fieldId) {
  return GetRange(fieldId).length > 1;
  return !!validValues[NUM_FIELDS + fieldId];
}

export function FieldIndex(arg) {
  if(IsString(arg)) {
    arg = fieldNames.indexOf(arg);
    if(arg == -1) arg = undefined;
  }
  return arg;
}

export function SaveConfig() {
  for(let i = 0; i < NUM_FIELDS; i++) config['LCf'[i]] = GetField(i) ?? '';

  config.selected = GetSelected();

  localStorage.setItem('config', JSON.stringify(config));
}

export function LoadConfig() {
  let r = {};

  try {
    r = JSON.parse(localStorage.getItem('config') ?? '{}');
  } catch(e) {}

  return r;
}

function FieldElements(n) {
  return [...PartitionArray([...Q('#fields').children], NUM_FIELDS)][FieldIndex(n)];
}

export function GetField(n) {
  const e = (FieldElements(n) ?? []).find(e => e.tagName.toLowerCase() == 'input');
  return e?.value;
}

export function SetField(n, v, range) {
  const e = (FieldElements(n) ?? []).find(e => e.tagName.toLowerCase() == 'input');
  e.value = v;
  computed[FieldIndex(n)] = range && { text: v, range };
}

/* set a computed field, remembering the unrounded numbers behind its text */
function SetResult(n, str, results) {
  const r = results.filter(Number.isFinite);
  const count = ParseRange(str).length;

  SetField(n, str, r.length && count ? (count > 1 ? [Math.min(...r), Math.max(...r)] : [r.reduce((s, v) => s + v, 0) / r.length]) : undefined);
}

export function SelectField(i) {
  if(!(i >= 0 && i <= 2)) throw new Error(`SelectField i=${i}`);

  for(let j = 0; j < NUM_FIELDS; j++) {
    FieldElements(j).forEach((e, x) => e.classList[i == j ? 'add' : 'remove']('selected'));

    FieldElements(j)[2].disabled = i == j;
  }

  Q('img').src = `svg/${['inductance', 'capacitance', 'freq'][i]}-equation.svg`;
}

export function GuessField() {
  const empty = [0, 1, 2].filter(i => (GetField(i) ?? '').trim() == '');

  return empty.length == 1 ? empty[0] : 2;
}

export function GetSelected() {
  return QA('input')
    .map(e => e.classList.contains('selected'))
    .indexOf(true);
}

export function GetRange(name) {
  const idx = FieldIndex(name);
  const text = GetField(idx) ?? '';
  /* a computed field that was not edited since still has its full precision */
  const a = computed[idx]?.text === text ? [...computed[idx].range] : ParseRange(text);

  for(let i = 0; i < 2; i++) {
    allValues[idx + i * NUM_FIELDS] = a[i] ?? NaN;
    validValues[idx + i * NUM_FIELDS] = i < a.length;
  }

  return a;
}

export function SetRange(name, value) {
  const idx = FieldIndex(name);

  if(value === undefined) {
    values[idx] = undefined;
    return true;
  }

  if(IsNumber(value)) {
    if(!Number.isFinite(value)) throw new Error(`SetRange name=${name} value=${value}`);

    if(isNaN(value)) throw new Error(`SetRange name=${name} value=${value}`);
  }

  const range = ParseRange(value);

  // console.log('SetRange', { name, value, range });

  for(let i = 0; i < 2; i++) {
    allValues[idx + i * NUM_FIELDS] = range[i];
    validValues[idx + i * NUM_FIELDS] = i < range.length;
  }

  return range;
}

export function CalcThompson() {
  const sel = GetSelected();

  SetNote('');

  if(IsNumber(sel) && !isNaN(sel)) {
    const fn = [CalcInductance, CalcCapacitance, CalcFrequency][sel];

    if(typeof fn != 'function') throw new Error(`CalcThompson sel=${sel}`);

    [CalcInductance, CalcCapacitance, CalcFrequency][sel]();

    const sz = GetSize(),
      max = GetMaxSize();

    if(max > sz || sz > minSize) ChangeSize(Math.max(minSize, max));
  }
}

export function FormatRange(arg, unit) {
  const results = [...arg].filter(Number.isFinite);

  if(!results.length) return '';

  const fmt = n => FormatNumber(n, unit, 'floor', RoundTo(config.precision));
  const lo = fmt(Math.min(...results)),
    hi = fmt(Math.max(...results));

  if(lo == hi) return lo;

  // '87.5 - 108 MHz' rather than '87.5 MHz - 108 MHz' if the prefix matches
  const [loNum, loUnit] = lo.split(' '),
    [hiNum, hiUnit] = hi.split(' ');

  return (loUnit === hiUnit ? loNum : lo) + ' - ' + hi;
}

export function CalcFrequency() {
  const results = [],
    L = GetRange('L'),
    C = GetRange('C');

  for(let i = 0; i < L.length; i++) for (let j = 0; j < C.length; j++) results.push(Thompson.calculate(L[i], C[j]));

  const str = FormatRange(results, 'Hz');

  SetResult(2, str, results);

  return str;
}

/*
 * Solve for the fixed component (field 0 = L, 1 = C, 'H'/'F') from the
 * frequency and the other component. A single range is the span the output
 * has to cover; with a band and a tuning range on both inputs the output is
 * one value that lets the tuning range cover the band.
 */
function CalcFixed(field, unit, other) {
  const f = GetRange('f'),
    Y = GetRange(other);

  if(f.length > 1 && Y.length > 1) {
    /* values shown with N decimals carry about 10^-N relative error */
    const tol = Math.min(0.01, 10 ** -(config.precision ?? DEFAULT_PRECISION));
    const { min, max, best, feasible, exact, band } = Cover(f, Y, tol);
    const str = FormatRange([best], unit);

    SetResult(field, str, [best]);
    SetNote(
      !feasible
        ? `${other} range too small for the band: ${str} tunes only ${FormatRange(band, 'Hz')}`
        : exact
          ? `${str} tunes ${FormatRange(band, 'Hz')} (any value from ${FormatRange([min, max], unit)} covers the band)`
          : `${str} just covers the band, within rounding (${FormatRange(band, 'Hz')})`,
    );

    return str;
  }

  const results = [];

  for(let i = 0; i < f.length; i++) for (let j = 0; j < Y.length; j++) results.push(Thompson.inverse(f[i], Y[j]));

  const str = FormatRange(results, unit);

  SetResult(field, str, results);

  return str;
}

export function CalcInductance() {
  return CalcFixed(0, 'H', 'C');
}

export function CalcCapacitance() {
  return CalcFixed(1, 'F', 'L');
}

export function SetNote(str) {
  const e = Q('#note');

  if(e) e.textContent = str;
}

export function ClearValues(idx) {
  for(let i = 0; i < NUM_FIELDS; i++) if(idx === undefined || (IsNumber(idx) && i == idx)) SetRange(i, undefined);
}

export function ReadFields(name) {
  const idx = FieldIndex(name);

  ClearValues(idx);

  QA('input')
    .slice(0, NUM_FIELDS)
    .forEach(({ name, value }, i) => {
      if(!IsNumber(idx) || i == idx)
        if((IsString(value) && value != '') || (IsNumber(value) && Number.isFinite(value))) if (!ParseValue(value, name)) throw new Error(`ReadFields(): error parsing field '${name}'`);
    });
}

export async function SetStatus(str, t1 = 3000, t2 = 1000) {
  const st = Q('#status');

  RemoveAllChildren(st);

  let e = st.firstElementChild ?? document.createElement('div');

  e.innerText = str;

  st.insertBefore(e, st.firstElementChild);

  Object.assign(e.style, { transition: 'opacity 0s' });
  Object.assign(e.style, {
    transition: `opacity ${t1 / 1000}s`,
    opacity: '1',
  });

  await WaitFor(t1);

  Object.assign(e.style, { transition: `all ${t2 / 1000}s`, opacity: '0' });

  await WaitFor(t2);
}
export function SetupFields() {
  if(!globalThis.document) {
    setTimeout(() => SetupFields(), 100);
    return;
  }

  [...PartitionArray([...Q('#fields').children], NUM_FIELDS)].forEach((a, i) => {
    a.slice(0, 2).forEach(e =>
      e.addEventListener('click', () => {
        SelectField(i);
        CalcThompson();
      }),
    );
    a.forEach(e =>
      e.addEventListener(
        'dblclick',
        e => {
          e.preventDefault();
          CopyToClipboard(GetField(i));
        },
        true,
      ),
    );
  });
}

export function GetSize() {
  return +Q('input').size;
}

export function GetMaxSize() {
  return Math.max(
    ...QA('input')
      .slice(0, 3)
      .map(e => e.value)
      .map(v => v.length),
  );
}

export function ChangeSize(sz = GetMaxSize()) {
  QA('input')
    .slice(0, 3)
    .forEach((e, i) => e.setAttribute('size', sz));
}

export function ChangePrecision(p) {
  Q('#precision').value = p + '';
  Q('#precision_num').value = p + '';

  config.precision = p;

  try {
    CalcThompson();
  } catch(e) {
    console.log('ERROR', e.message);
  }
}

export function Init() {
  if(globalThis.initialized) return;
  globalThis.initialized = true;

  QA('input')
    .slice(0, 3)
    .forEach((e, i) => {
      e.addEventListener('input', OnInput, false);
      e.addEventListener('change', OnInput, false);
      e.addEventListener('blur', OnInput, false);
    });

  // Enter must not reload the page
  Q('form').addEventListener('submit', e => {
    e.preventDefault();
    CalcThompson();
  });

  SetupFields();

  Object.assign(config, LoadConfig());

  if(!IsNumber(config.precision)) config.precision = DEFAULT_PRECISION;

  Q('#precision_num').addEventListener('change', event => {
    const { target } = event;
    const { value } = target;
    const p = +value;

    if(!isNaN(p) && p >= 0 && p <= 9) ChangePrecision(p);
  });

  Q('#precision').addEventListener('input', event => ChangePrecision(+event.target.value));

  QA('#precision, #precision_num').forEach(e =>
    e.addEventListener('wheel', ({ target, deltaY }) => {
      let x = +target.value - Math.sign(deltaY);

      if(!isNaN(x) && x >= 0 && x <= 9) ChangePrecision(x);
    }),
  );

  Q('#precision').value = config.precision;
  Q('#precision_num').value = config.precision;

  const { L, C, f } = config;

  [L, C, f].forEach((v, i) => SetField(i, IsString(v) && v != '' ? v : ''));

  if('selected' in config) {
    if(config.selected >= 0 && config.selected <= 2) SelectField(config.selected);
    else delete config.selected;
  }

  if(GetSelected() == -1) {
    let f = GuessField();
    if(!IsNumber(f) || !(f >= 0 && f <= 2)) f = 2;
    SelectField(f);
  }

  try {
    CalcThompson();
  } catch(e) {
    console.log('ERROR', e.message);
    // throw e;
  }

  setInterval(() => SaveConfig(), 500);
}

export function WaitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function RemoveAllChildren(e) {
  while(e.firstElementChild) e.removeChild(e.firstElementChild);
}

export function* PartitionArray(a, size) {
  for(let i = 0; i < a.length; i += size) yield a.slice(i, i + size);
}

export async function CopyToClipboard(str) {
  try {
    await navigator.clipboard.writeText(str);
    SetStatus(`Copied: '${str}'`);
  } catch(e) {
    SetStatus(`Copy failed: ${e.message}`);
  }
}

function Rect({ x, y, width, height }) {
  return Object.setPrototypeOf({ x, y, width, height }, Rect.prototype);
}

Rect.prototype[Symbol.iterator] = function* () {
  const { x, y, width, height } = this;
  yield* [x, y, width, height];
};

Object.defineProperties(Rect.prototype, {
  x2: {
    get() {
      return this.x + this.width;
    },
  },
  y2: {
    get() {
      return this.y + this.height;
    },
  },
});

Object.assign(globalThis, {
  ComponentNode,
  SeriesGroup,
  ParallelGroup,
  ThomsonEquation,
});
Object.assign(globalThis, {
  FormatNumber,
  NumericValue,
  Exponent,
  Thousand,
  Exp2Unit,
  Unit,
  RoundTo,
  IsNumber,
  IsString,
});
/* prettier-ignore */ Object.assign(globalThis, {
  CalcCapacitance,
  CalcFrequency,
  CalcInductance,
  CalcThompson,
  ChangePrecision,
  ChangeSize,
  ClearValues,
  CoilInductance,
  CoilTurns,
  CopyToClipboard,
  Exp2Unit,
  FieldElements,
  FieldIndex,
  FormatNumber,
  FormatRange,
  GetAttributes,
  GetField,
  GetMaxSize,
  GetProps,
  GetRange,
  GetSelected,
  GetSize,
  GuessField,
  Init,
  IsNumber,
  IsRange,
  IsString,
  LoadConfig,
  OnInput,
  ParseValue,
  ReadFields,
  Rect,
  RemoveAllChildren,
  SaveConfig,
  SelectField,
  SeriesCaps,
  SetField,
  SetRange,
  SetNote,
  SetStatus,
  SetupFields,
  WaitFor,
  ParseRange
});
/* prettier-ignore */ Object.assign(globalThis, {
  buffer,
  values,
  values2,
  validValues,
  allValues,
  config,
  Q,
  QA,
  GS,
  GA,
  GR,
  Thompson,
  Cover
});
