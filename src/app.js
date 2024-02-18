import './stylesheets/main.css';

const Q = s => (typeof s == 'string' ? document.querySelector(s) : s);
const QA = (...a) => [...(document.querySelectorAll(a.join(', ')) ?? [])];
const GS = s => GetProps(window.getComputedStyle(Q(s)));
const GA = s => GetAttributes(Q(s));
const GR = s => Rect(Q(s)?.getBoundingClientRect());

const NUM_FIELDS = 3;

const $2PI = Math.PI * 2;
const $PI2 = Math.PI ** 2;

const Thompson = {
  calculate: (L, C) => 1 / (Math.sqrt(L * C) * $2PI * 2),
  inverse: (f, LC) => 1 / (4 * $PI2 * LC * f ** 2)
};

const buffer = new ArrayBuffer(8 * NUM_FIELDS * 2);
const values = new Float64Array(buffer, 0, NUM_FIELDS);
const values2 = new Float64Array(buffer, 24, NUM_FIELDS);
const validValues = Array.from(new Array(NUM_FIELDS * 2), () => false);
const allValues = new Float64Array(buffer);
const fieldNames = ['L', 'C', 'f'];
const unitNames = ['H', 'F', 'Hz'];
const config = {};
const minSize = 10;

document.addEventListener('load', () => {
  try {
    Init();
  } catch(e) {
    console.log('ERROR', e.message);
    throw e;
  }
});

setTimeout(Init, 100);

const rosaKm = e => Math.log(2 * Math.PI) - 1.5 - Math.log(e) / (6 * e) - 0.33084236 / e - 1 / (120 * e ** 3) + 1 / (504 * e ** 5) - 0.0011923 / e ** 7 + 5068e-7 / e ** 9;
const rosaKs = e => 1.25 - Math.log(2 * e);

function SeriesCaps(values) {
  return 1 / values.map(v => 1 / ParseNumber(v)).reduce((r, v) => r + v, 0);
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

  for(let Ks = rosaKs(outer / inner); i <= L; ) {
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

export function OnInput({ target }) {
  const { name, value } = target;
  const idx = FieldIndex(name);

  if(idx !== undefined) {
    event.preventDefault();

    const range = ParseRange(value);

    for(let i = 0; i < 2; i++) {
      allValues[idx + i * NUM_FIELDS] = range[i];
      validValues[idx + i * NUM_FIELDS] = i < range.length;
    }

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
    if(arg == -1)
      arg = {
        L: 0,
        C: 1,
        f: 2
      }[arg];
  }
  return arg;
}

export function SaveConfig() {
  for(let i = 0; i < NUM_FIELDS; i++) if(validValues[i]) config['LCf'[i]] = GetField(i);

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

export function SetField(n, v) {
  const e = (FieldElements(n) ?? []).find(e => e.tagName.toLowerCase() == 'input');
  e.value = v;
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
  if(validValues.filter(v => v === true).length == 2) return validValues.indexOf(false);

  return 0;
}

export function GetSelected() {
  return QA('input')
    .map(e => e.classList.contains('selected'))
    .indexOf(true);
}

export function GetRange(name) {
  const idx = FieldIndex(name);

  let a = [,];

  try {
    throw new Error();
    for(let i = 0; i < 2; i++) {
      if(IsNumber(allValues[idx + i * NUM_FIELDS]) && Number.isFinite(allValues[idx + i * NUM_FIELDS]) && !isNaN(allValues[idx + i * NUM_FIELDS])) {
        a[i] = allValues[idx + i * NUM_FIELDS];
        continue;
      }
      throw new Error();
    }
  } catch(e) {
    a = ParseRange(GetField(idx) ?? '');
    for(let i = 0; i < 2; i++) {
      allValues[idx + i * NUM_FIELDS] = a[i];
      validValues[idx + i * NUM_FIELDS] = i < a.length;
    }
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

  //console.log('SetRange', { name, value, range });

  for(let i = 0; i < 2; i++) {
    allValues[idx + i * NUM_FIELDS] = range[i];
    validValues[idx + i * NUM_FIELDS] = i < range.length;
  }

  return range;
}

export function CalcThompson() {
  const sel = GetSelected();

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
  const results = [...arg].sort((a, b) => a - b);

  return (results.length > 1 ? [Math.min(...results), Math.max(...results)] : results)
    .map((n, i) => FormatNumber(n, results.length <= 1 || i > 0 ? unit : undefined, config.precision <= 0 ? 'floor' : 'round', RoundTo()))
    .join(' - ');
}

export function CalcFrequency() {
  const results = [],
    L = GetRange('L'),
    C = GetRange('C');

  for(let i = 0; i < L.length; i++) for (let j = 0; j < C.length; j++) results.push(Thompson.calculate(L[i], C[j]));

  const str = FormatRange(results, 'Hz');

  SetField(2, str);

  return str;
}

export function CalcInductance() {
  const results = [],
    f = GetRange('f'),
    C = GetRange('C');

  for(let i = 0; i < f.length; i++) for (let j = 0; j < C.length; j++) results.push(Thompson.inverse(f[i], C[j]));

  const str = FormatRange(results, 'H');

  SetField(0, str);

  return str;
}

export function CalcCapacitance() {
  const results = [],
    f = GetRange('f'),
    L = GetRange('L');

  for(let i = 0; i < f.length; i++) for (let j = 0; j < L.length; j++) results.push(Thompson.inverse(f[i], L[j]));

  const str = FormatRange(results, 'F');

  SetField(1, str);

  return str;
}

export function ClearValues(idx) {
  for(let i = 0; i < NUM_FIELDS; i++) if(idx === undefined || (IsNumber(idx) && i == idx)) SetRange(i, undefined);
}

export function ProcessValue(value, name) {
  try {
    const [num, exp] = Unit(value);
    return Math.pow(10, exp) * num;
  } catch(e) {
    console.error('ProcessValue', { value, name });
  }
}

export function ParseRange(value) {
  const parts = value
    .split(/\s*-\s*/g)
    .map(Unit)
    .slice(0, 2);

  if(parts[0] && parts[1]) if (parts[0][1] === null) parts[0][1] = parts[1][1];

  return parts.map(NumericValue);
}

export function ParseNumber(value) {
  return NumericValue(Unit(value));
}

export function ParseValue(value, name) {
  const idx = FieldIndex(name);

  if(!IsString(name)) name = 'LCf'[idx];

  if(value != '') {
    const result = ProcessValue(value, name);
    const valid = (validValues[idx] = !isNaN(result));

    if(!valid || idx === undefined) throw new Error(`ParseValue idx=${idx} name=${name} value=${value} result=${result}`);

    values[idx] = valid ? result : undefined;

    return valid;
  }
}

export function ReadFields(name) {
  const idx = FieldIndex(name);

  ClearValues(idx);

  QA('input')
    .slice(0, 2)
    .forEach(({ name, value }, i) => {
      if(!IsNumber(idx) || i == idx)
        if((IsString(value) && value != '') || (IsNumber(value) && Number.isFinite(value))) if (!ParseValue(value, name)) throw new Error(`ReadFields(): error parsing field '${name}'`);
    });
}

export function FormatNumber(arg, unit, fn = 'round', round = RoundTo()) {
  let [num, exp = null] = Array.isArray(arg) ? arg : [arg];

  if(!IsNumber(exp)) exp = Exponent(num);
  exp = Thousand(exp, fn);
  const expStr = Exp2Unit(exp);
  if(IsNumber(unit)) unit = unitNames[unit];

  let s = round(num * Math.pow(10, -exp)) + '';

  if(typeof unit != 'undefined') {
    if(IsString(expStr)) s += ' ' + expStr;
    s += unit;
  }

  return s;
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
    opacity: '1'
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
    a.slice(0, 2).forEach(e => e.addEventListener('click', e => SelectField(i)));
    a.forEach(e => e.addEventListener('dblclick', async e => (await CopyToClipboard(GetField(i)), e.preventDefault()), true));
  });

  document.body.addEventListener(
    'dblclick',
    async e => {
      const { target } = e;

      if(target.tagName.toLowerCase() == 'input') await CopyToClipboard(target.value);

      e.preventDefault();
    },
    true
  );
}

export function GetSize() {
  return +Q('input').size;
}

export function GetMaxSize() {
  return Math.max(
    ...QA('input')
      .slice(0, 3)
      .map(e => e.value)
      .map(v => v.length)
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
    ReadFields();
  } catch(e) {}
}

export function Init() {
  if(globalThis.initialized) return;
  globalThis.initialized = true;

  QA('input')
    .slice(0, 3)
    .forEach((e, i) => {
      e.addEventListener('change', OnInput, false);
      e.addEventListener('blur', OnInput, false);
    });

  SetupFields();

  Object.assign(config, LoadConfig());

  Q('#precision_num').addEventListener('change', event => {
    const { target } = event;
    const { value } = target;
    const p = +value;

    if(!isNaN(p) && p >= 0 && p <= 9) ChangePrecision(p);
  });

  Q('#precision').addEventListener('change', event => {
    const { target } = event;
    const { value } = target;

    ChangePrecision(+value);
  });

  QA('#precision, #precision_num').forEach(e =>
    e.addEventListener('wheel', ({ target, deltaY }) => {
      let x = +target.value - Math.sign(deltaY);

      if(!isNaN(x) && x >= 0) ChangePrecision(+x);
    })
  );

  if('precision' in config) {
    Q('#precision').value = config.precision;
    Q('#precision_num').value = config.precision;
  }

  const { L, C, f } = config;

  [L, C, f].forEach((v, i) => SetField(i, IsString(v) && v != '' ? v : ''));

  if('selected' in config) {
    if(config.selected >= 0 && config.selected <= 2) SelectField(config.selected);
    else delete config.selected;
  }

  if(GetSelected() === undefined) {
    let f = GuessField();
    if(!IsNumber(f) || !(f >= 0 && f <= 2)) f = 2;
    SelectField(f);
  }

  try {
    CalcThompson();
  } catch(e) {
    console.log('ERROR', e.message);
    //throw e;
  }

  setInterval(() => SaveConfig(), 500);
}

export function NumericValue([num, exp]) {
  return Math.pow(10, exp) * num;
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

export function Exponent(num) {
  return Math.floor(Math.log10(num));
}

export function Thousand(exponent, fn = 'floor') {
  return Math.min(21, Math.max(-24, Math[fn](exponent / 3) * 3));
}

export function Exp2Unit(exponent, fn = 'floor') {
  /* prettier-ignore */ switch (Thousand(exponent, fn)) {
    case -24: return 'y';
    case -21: return 'z';
    case -18: return 'a';
    case -15: return 'f';
    case -12: return 'p';
    case -9: return 'n';
    case -6: return 'µ';
    case -3: return 'm';
    case -2: return 'c';
    case -1: return 'd';
    case 0: return '';
    case 2: return 'h';
    case 3: return 'k';
    case 6: return 'M';
    case 9: return 'G';
    case 12: return 'T';
    case 15: return 'P';
    case 18: return 'E';
    case 21: return 'Z';
  }
}

export function Unit(str) {
  if(!IsString(str)) str = str + '';

  const [num, unit = ''] = [...str.replaceAll(/\s+/g, '').matchAll(/([-Ee.\d]+|[^-Ee.\d]+)/g)].map(([a]) => a);
  let exp = null;

  /* prettier-ignore */ switch (unit[0]) {
    case 'y': exp = -24; break;
    case 'z': exp = -21; break;
    case 'a': exp = -18; break;
    case 'f': exp = -15; break;
    case 'p': exp = -12; break;
    case 'n': exp = -9; break;
    case '\u00B5': case '\u03BC': case 'u': exp = -6; break;
    case 'm': exp = -3; break;
    case 'c': exp = -2; break;
    case 'd': exp = -1; break;
    case 'h': exp = 2; break;
    case 'k': exp = 3; break;
    case 'M': exp = 6; break;
    case 'G': exp = 9; break;
    case 'T': exp = 12; break;
    case 'P': exp = 15; break;
    case 'E': exp = 18; break;
    case 'Z': exp = 21; break;
  }

  return [+num, exp];
}

export function RoundTo(prec = config.precision) {
  return n => n.toFixed(prec).replace(/\.(.*[^0])0*$/g, '.$1');
}

export function IsNumber(arg) {
  return typeof arg == 'number';
}

export function IsString(arg) {
  return typeof arg == 'string';
}

export async function CopyToClipboard(str) {
  let result = await navigator.clipboard.writeText(str);

  SetStatus(`Copied: '${str}'`);
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
    }
  },
  y2: {
    get() {
      return this.y + this.height;
    }
  }
});

/* prettier-ignore */ Object.assign(globalThis, { CalcCapacitance, CalcFrequency, CalcInductance, CalcThompson, ChangePrecision, ChangeSize, ClearValues, CoilInductance, CoilTurns, CopyToClipboard, Exp2Unit, Exponent, FieldElements, FieldIndex, FormatNumber, FormatRange, GetAttributes, GetField, GetMaxSize, GetProps, GetRange, GetSelected, GetSize, GuessField, Init, IsNumber, IsRange, IsString, LoadConfig, NumericValue, OnInput, ParseNumber, ParseRange, ParseValue, ProcessValue, ReadFields, Rect, RemoveAllChildren, RoundTo, SaveConfig, SelectField, SeriesCaps, SetField, SetRange, SetStatus, SetupFields, Thousand, Unit, WaitFor });
/* prettier-ignore */ Object.assign(globalThis, { buffer, values, values2, validValues, allValues, config, Q, QA, GS, GA, GR, Thompson });
