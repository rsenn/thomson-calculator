import './stylesheets/main.css';

const Q = s => document.querySelector(s);
const QA = s => [...(document.querySelectorAll(s) ?? [])];

const values = (globalThis.values = new Float64Array(3));
const valueIndex = {
  L: 0,
  C: 1,
  f: 2
};
const validValues = [false, false, false];

globalThis.config = {};
document.addEventListener('load', Init);

setTimeout(Init, 100);

function FieldIndex(arg) {
  if(typeof arg == 'string') arg = valueIndex[arg];
  return arg;
}

function SaveConfig() {
  for(let i = 0; i < 3; i++) if(validValues[i]) config['LCf'[i]] = GetFieldValue(i);

  config.selected = GetSelected();

  localStorage.setItem('config', JSON.stringify(config));
}

function LoadConfig() {
  let r = {};

  try {
    r = JSON.parse(localStorage.getItem('config') ?? '{}');
  } catch(e) {}

  const { L, C, f } = r;

  [L, C, f].forEach((v, i) => SetValue(i, typeof v == 'string' && v != '' ? v : ''));

  return r;
}

function* PartitionArray(a, size) {
  for(let i = 0; i < a.length; i += size) yield a.slice(i, i + size);
}

function GetFieldElements(n) {
  return [...PartitionArray([...Q('#fields').children], 3)][FieldIndex(n)];
}

function GetFieldValue(n) {
  const e = GetFieldElements(n).find(e => e.tagName.toLowerCase() == 'input');
  return e.value;
}

function SetFieldValue(n, v) {
  const e = GetFieldElements(n).find(e => e.tagName.toLowerCase() == 'input');
  e.value = v;
}

function SelectField(i) {
  if(!(i >= 0 && i <= 2)) throw new Error(`SelectField i=${i}`);

  for(let j = 0; j < 3; j++) {
    GetFieldElements(j).forEach((e, x) => e.classList[i == j ? 'add' : 'remove']('selected'));

    GetFieldElements(j)[2].disabled = i == j;
  }

  Q('img').src = `svg/${['inductance', 'capacitance', 'freq'][i]}-equation.svg`;
}

function GuessField() {
  if(validValues.filter(v => v === true).length == 2) return validValues.indexOf(false);

  return 0;
}

function GetSelected() {
  return QA('input')
    .map(e => e.classList.contains('selected'))
    .indexOf(true);
}

function GetValue(name) {
  const idx = FieldIndex(name);

  while(true) {
    if(typeof values[idx] == 'number' && Number.isFinite(values[idx]) && !isNaN(values[idx])) return values[idx];

    if(!ParseValue(GetFieldValue(name), name)) return undefined;
  }
}

function SetValue(name, value) {
  const idx = FieldIndex(name);

  if(value === undefined) {
    values[idx] = undefined;
    return true;
  }

  if(typeof value == 'number') {
    if(!Number.isFinite(value)) throw new Error(`SetValue name=${name} value=${value}`);

    if(isNaN(value)) throw new Error(`SetValue name=${name} value=${value}`);
  }

  const result = ParseValue(value, name);
  //console.log('SetValue', { name, value, result });

  if(validValues[idx]) SetField(name);

  return result;
}

function CalcThompson() {
  const sel = GetSelected();

  if(typeof sel == 'number' && !isNaN(sel)) {
    const fn = [CalcInductance, CalcCapacity, CalcFrequency][sel];

    if(typeof fn != 'function') throw new Error(`CalcThompson sel=${sel}`);

    [CalcInductance, CalcCapacity, CalcFrequency][sel]();
  }
}

function SetField(i, num, round = RoundFunction(config.precision ?? 3)) {
  if(typeof i == 'string') i = valueIndex[i];

  if(typeof num != 'number') num = GetValue(i);

  if(typeof num != 'number') num = ProcessValue(num + '', 'LCf'[i]);

  if(isNaN(num)) return; //throw new Error(`SetField(): i = ${i}, num = ${num}`);

  QA('input')[i].value = FormatNumber(num, null, i, round);
}

function RoundFunction(prec = 3) {
  const p = Math.pow(10, prec);
  return n => Math.round(n * p) / p;
}

function CalcFrequency() {
  SetValue('f', 1 / (Math.sqrt(GetValue('L') * GetValue('C')) * Math.PI * 2));

  SetField(2, GetValue('f'));

  return values[2];
}

function CalcInductance() {
  SetValue('L', 1 / (GetValue('C') * (GetValue('f') * Math.PI * 2) ** 2));

  SetField(0, GetValue('L'));

  return values[0];
}

function CalcCapacity() {
  SetValue('C', 1 / (GetValue('L') * (GetValue('f') * Math.PI * 2) ** 2));

  SetField(1, GetValue('C'));

  return values[1];
}

function Exponent(num) {
  return Math.floor(Math.log10(num));
}

function Thousand(exponent) {
  return Math.min(15, Math.max(-18, Math.floor(exponent / 3) * 3));
}

function Exp2Unit(exponent) {
  /* prettier-ignore */ switch (Thousand(exponent)) {
 case -18: return 'a';
 case -15: return 'f';
 case -12: return 'p';
 case -9: return 'n';
 case -6: return 'u';
 case -3: return 'm';
 case 0: return '';
 case 3: return 'k';
 case 6: return 'M';
 case 9: return 'G';
 case 12: return 'T';
 case 15: return 'P';
 }
}

function Unit(str) {
  if(typeof str != 'string') str = str + '';

  const [num, unit = ''] = [...str.replaceAll(/\s+/g, '').matchAll(/([-Ee.\d]+|[^-Ee.\d]+)/g)].map(([a]) => a);
  let exp = 0;

  if(isNaN(num)) console.error('Unit', { str, num, unit });

  /* prettier-ignore */ switch (unit[0]) {
 case 'a': exp = -18; break;
 case 'f': exp = -15; break;
 case 'p': exp = -12; break;
 case 'n': exp = -9; break;
 case 'u': exp = -6; break;
 case 'm': exp = -3; break;
 default: exp = 0; break;
 case 'k': exp = 3; break;
 case 'M': exp = 6; break;
 case 'G': exp = 9; break;
 case 'T': exp = 12; break;
 }

  return [+num, exp];
}

function OnInput({ target }) {
  const { name, value } = target;
  const idx = valueIndex[name];

  if(idx !== undefined) {
    if(ParseValue(value, name)) CalcThompson();

    event.preventDefault();
  }
}

function ClearValues(idx) {
  for(let i = 0; i < 3; i++) if(idx === undefined || (typeof idx == 'number' && i == idx)) SetValue(i, undefined);
}

function ProcessValue(value, name) {
  try {
    const [num, exp] = Unit(value);
    return Math.pow(10, exp) * num;
  } catch(e) {
    console.error('ProcessValue', { value, name });
  }
}

function ParseValue(value, name) {
  const idx = FieldIndex(name);

  if(typeof name != 'string') name = 'LCf'[idx];

  if(value != '') {
    const result = ProcessValue(value, name);
    const valid = (validValues[idx] = !isNaN(result));

    if(!valid || idx === undefined) console.error('ParseValue', { value, name, idx, result, valid });

    if(!valid || idx === undefined) throw new Error(`ParseValue idx=${idx} name=${name} value=${value}`);

    values[idx] = valid ? result : undefined;

    return valid;
  }
}

function ReadFields(name) {
  const idx = FieldIndex(name);

  ClearValues(idx);

  QA('input')
    .slice(0, 2)
    .forEach(({ name, value }, i) => {
      if(typeof idx != 'number' || i == idx) if ((typeof value == 'string' && value != '') || (typeof value == 'number' && Number.isFinite(value))) if (ParseValue(value, name)) SetField(i);
    });
}

function WriteFields(name) {
  const idx = FieldIndex(name);

  for(let i = 0; i < 3; i++) if(idx === undefined || (typeof idx == 'number' && i == idx)) SetField(i);
}

function FormatNumber(num, exp, unit, round = a => a.toFixed(12).replace(/\.0*$/g, '')) {
  if(typeof exp != 'number') exp = Exponent(num);

  exp = Thousand(exp);

  const expStr = Exp2Unit(exp);

  if(expStr === undefined) console.error('FormatNumber', { num, exp, expStr, unit });

  return round(num * Math.pow(10, -exp)) + ' ' + expStr + ['H', 'F', 'Hz'][unit];
}

export function WaitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function SetStatus(str, t1 = 3000, t2 = 1000) {
  const st = Q('#status');

  while(st.firstElementChild) {
    if(!st.firstElementChild.nextElementSibling) break;
    st.removeChild(st.firstElementChild);
  }

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

async function CopyToClipboard(str) {
  let result = await navigator.clipboard.writeText(str);

  SetStatus(`Copied: '${str}'`);
}

function SetupFields() {
  if(!globalThis.document) {
    setTimeout(() => SetupFields(), 100);
    return;
  }

  [...PartitionArray([...Q('#fields').children], 3)].forEach((a, i) => {
    a.slice(0, 2).forEach(e => e.addEventListener('click', e => SelectField(i)));
    a.forEach(e => e.addEventListener('dblclick', async e => (await CopyToClipboard(GetFieldValue(i)), e.preventDefault()), true));
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

function ChangePrecision(p) {
  Q('#precision').value = p + '';
  Q('#precision_num').value = p + '';

  config.precision = p;
  //console.log('ChangePrecision', { values: [0, 1, 2].map(GetValue) });

  try {
    CalcThompson();
    ReadFields();
  } catch(e) {}
}

function Init() {
  if(globalThis.initialized) return;
  globalThis.initialized = true;

  QA('input').forEach(e => {
    e.addEventListener('change', OnInput, false);
    e.addEventListener('input', OnInput, false);
  });

  SetupFields();

  config = LoadConfig();

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

  if('precision' in config) {
    Q('#precision').value = config.precision;
    Q('#precision_num').value = config.precision;
  }

  if('selected' in config) {
    if(config.selected >= 0 && config.selected <= 2) SelectField(config.selected);
    else delete config.selected;
  }

  if(GetSelected() === undefined) {
    let f = GuessField();
    if(typeof f != 'number' || !(f >= 0 && f <= 2)) f = 2;
    SelectField(f);
  }

  setInterval(() => SaveConfig(), 500);
}

/* prettier-ignore */ Object.assign(globalThis, { CalcCapacity, CalcFrequency, CalcInductance, CalcThompson, ChangePrecision, ClearValues, CopyToClipboard, Exp2Unit, Exponent, FieldIndex, FormatNumber, GetFieldElements, GetFieldValue, GetSelected, GetValue, GuessField, Init, LoadConfig, OnInput, ParseValue, ProcessValue, RoundFunction, SaveConfig, SelectField, SetField, SetFieldValue, SetStatus, SetValue, SetupFields, Thousand, Unit, ReadFields, WriteFields, WaitFor, validValues, Q, QA });
