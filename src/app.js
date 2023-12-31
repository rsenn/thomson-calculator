import './stylesheets/main.css';

// Everything below is just a demo. You can delete all of it.

/*import { ipcRenderer } from 'electron';
import env from 'env';*/ const Q = s => document.querySelector(s);
const QA = s => [...(document.querySelectorAll(s) ?? [])];

const values = (globalThis.values = new Float64Array(3));
const valueIndex = {
  L: 0,
  C: 1,
  f: 2
};

const validValues = [false, false, false];
const units = ['H', 'F', 'Hz'];
const names = Object.keys(valueIndex);
const inputElements = QA('input');

let fields,
  selectedField,
  config = (globalThis.config = {}),
  initialized;

document.addEventListener('load', Init);

setTimeout(Init, 100);

function FieldIndex(arg) {
  if(typeof arg == 'string') arg = valueIndex[arg];
  return arg;
}

function SaveConfig() {
  for(let i = 0; i < 3; i++) {
    if(!validValues[i]) continue;

    config['LCf'[i]] = GetFieldElements(i)[2].value;
  }

  config.selected = GetSelected();

  localStorage.setItem('config', JSON.stringify(config));
}

function LoadConfig() {
  try {
    return JSON.parse(localStorage.getItem('config') ?? '{}');
  } catch(e) {}
  return {};
}

function* partitionArray(a, size) {
  for(let i = 0; i < a.length; i += size) yield a.slice(i, i + size);
}

function GetFieldElements(n) {
  if(!fields) SetupFields();

  return [...partitionArray([...fields.children], 3)][n];
}

function GetFieldValue(n) {
  const e = GetFieldElements(FieldIndex(n)).find(e => e.tagName.toLowerCase() == 'input');
  return e.value;
}

function SelectField(i) {
  if(!(i >= 0 && i <= 2)) throw new Error(`SelectField i=${i}`);

  for(let j = 0; j < 3; j++) {
    GetFieldElements(j).forEach((e, x) => {
      /*if(x < 2)*/ e.classList[i == j ? 'add' : 'remove']('selected');
    });

    GetFieldElements(j)[2].disabled = i == j;
  }

  selectedField = i;

  Q('img').src = `svg/${['inductance', 'capacitance', 'freq'][i]}-equation.svg`;
}

function GuessField() {
  if(validValues.filter(v => v === true).length == 2) return validValues.indexOf(false);

  return 0;
}

function GetSelected() {
  return selectedField;
}

function GetValue(name) {
  return values[typeof name == 'number' ? name : valueIndex[name]];
}

function SetValue(name, value) {
  const idx = typeof name == 'number' ? name : valueIndex[name];

  if(value === undefined) {
    values[idx] = undefined;
    return true;
  }

  const result = ParseValue(value, name);

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

  if(isNaN(num)) throw new Error(`SetField(): i = ${i},  num = ${num}`);

  inputElements[i].value = FormatNumber(num, null, i, round);
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
  return Math.floor(exponent / 3) * 3;
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

function OnInput(event) {
  const { target } = event;
  const { name, value } = target;
  const idx = valueIndex[name];

  if(ParseValue(value, name)) CalcThompson();

  event.preventDefault();
}

function ClearValues() {
  SetValue('L', undefined);
  SetValue('C', undefined);
  SetValue('f', undefined);
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
  const idx = typeof name == 'number' ? name : valueIndex[name];

  if(typeof name != 'string') name = 'LCf'[idx];

  if(value != '') {
    const result = ProcessValue(value, name);
    const valid = (validValues[idx] = !isNaN(result));

    if(!valid) {
      console.error('ParseValue', { value, name, idx, result, valid });
      throw new Error(`ParseValue name=${name} value=${value}`);
    }

    values[idx] = valid ? result : NaN;

    return valid;
  }
}

function Update() {
  ClearValues();

  QA('input').forEach(e => {
    const { name, value } = e;

    if(value != '') ParseValue(value, name);
  });

  for(let i = 0; i < 3; i++)
    try {
      SetField(i);
    } catch(e) {}
}

function FormatNumber(num, exp, unit, round = a => a.toFixed(12).replace(/\.0*$/g, '')) {
  if(typeof exp != 'number') exp = Exponent(num);

  exp = Thousand(exp);

  const expStr = Exp2Unit(exp);

  if(expStr === undefined) console.error('FormatNumber', { num, exp, expStr, unit });

  return round(num * Math.pow(10, -exp)) + ' ' + expStr + units[unit];
}

export function WaitFor(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function SetStatus(str, t1 = 3000, t2 = 1000) {
  const status = Q('#status');
  console.log('Display status:', str);

  while(status.firstElementChild) {
    if(!status.firstElementChild.nextElementSibling) break;
    status.removeChild(status.firstElementChild);
  }

  let e = status.firstElementChild ?? document.createElement('div');

  status.insertBefore(e, status.firstElementChild);
  e.style.transition = `opacity 0s`;
  e.style.opacity = '1';

  Object.assign(e.style, {
    transition: `opacity ${t1 / 1000}s`,
    opacity: '1'
  });

  e.innerText = str;

  await WaitFor(t1);
  e.style.transition = `all ${t2 / 1000}s`;
  e.style.opacity = '0 ';
  await WaitFor(t2);
  //status.removeChild(e);
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

  fields = Q('#fields');

  [...partitionArray([...fields.children], 3)].forEach((a, i) => {
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

  CalcThompson();
  Update();
}

function Init() {
  if(initialized) return;
  initialized = true;

  let { L, C, f } = (config = globalThis.config = LoadConfig());

  QA('input').forEach(e => {
    e.addEventListener('change', OnInput, false);
    e.addEventListener('input', OnInput, false);
  });

  SetupFields();

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

  if(typeof L == 'string' && L != '') {
    SetValue(0, L);
    SetField(0);
  }

  if(typeof C == 'string' && C != '') {
    SetValue(1, C);
    SetField(1);
  }

  if(typeof f == 'string' && f != '') {
    SetValue(2, f);
    SetField(2);
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

  CalcThompson();
  Update();

  setInterval(() => SaveConfig(), 500);
}

Object.assign(globalThis, {
  CalcThompson,
  CalcInductance,
  CalcCapacity,
  CalcFrequency,
  ClearValues,
  Exp2Unit,
  Exponent,
  FormatNumber,
  GetFieldElements,
  GetFieldValue,
  GetSelected,
  GetValue,
  GuessField,
  Init,
  OnInput,
  ParseValue,
  ProcessValue,
  RoundFunction,
  SelectField,
  SetField,
  SetValue,
  SetupFields,
  Thousand,
  Unit,
  Update,
  LoadConfig,
  SaveConfig,
  inputElements,
  validValues,
  Q,
  QA
});
