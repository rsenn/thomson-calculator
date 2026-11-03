const unitNames = ['H', 'F', 'Hz'];

export function FormatNumber(arg, unit, fn = 'floor', round = RoundTo()) {
  let [num, exp = null] = Array.isArray(arg) ? arg : [arg];

  if(IsNumber(exp)) num = NumericValue([num, exp]);
  if(IsNumber(unit)) unit = unitNames[unit];
  if(!IsBigInt(num) && !Number.isFinite(num)) return num + '';

  let e = Thousand(Exponent(num), fn);
  let s = round(Shift(num, -e));

  // rounding may carry into the next prefix (999.96 -> 1000)
  if(Math.abs(+s) >= 1000 && e < 21) s = round(Shift(num, -(e += 3)));

  if(typeof unit != 'undefined') {
    const expStr = Exp2Unit(e);

    if(IsString(expStr)) s += ' ' + expStr;
    s += unit;
  }

  return s + '';
}

/* multiply by 10^by without binary floating point noise (4.7e-9 * 1e9) */
function Shift(num, by) {
  if(IsBigInt(num)) num = Number(num);
  if(!Number.isFinite(num)) return num;

  const [m, e] = num.toExponential().split('e');

  return +`${m}e${+e + by}`;
}

export function NumericValue([num, exp]) {
  exp ??= 0;

  if(IsBigInt(num) || IsBigInt(exp)) return 10n ** BigInt(exp) * BigInt(num);

  return Shift(num, exp);
}

export function Exponent(num) {
  if(IsBigInt(num)) return num.toString().length - 1;
  if(!Number.isFinite(num)) return 0;

  // exact, unlike Math.floor(Math.log10(num)) which misjudges e.g. 1e-7
  return +num.toExponential().split('e')[1];
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

const prefixes = { y: -24, z: -21, a: -18, f: -15, p: -12, n: -9, '\u00B5': -6, '\u03BC': -6, u: -6, m: -3, c: -2, d: -1, k: 3, M: 6, G: 9, T: 12, P: 15, E: 18, Z: 21 };

const NUMBER = String.raw`[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?`;
const TOKEN = String.raw`(${NUMBER})\s*([A-Za-z\u00B5\u03BC]*)`;
const RANGE = new RegExp(String.raw`^\s*${TOKEN}(?:\s*(?:\.\.\.?|\u2026|[-\u2013\u2014~])\s*${TOKEN})?\s*$`);

/* SI prefix of a unit string like 'MHz', 'pF', 'Hz' or 'H' (null if none) */
function PrefixExp(unit) {
  // base units themselves: 'Hz' (any case), 'H', 'F', and 'h' for Henry
  if(/^hz$/i.test(unit) || unit == 'H' || unit == 'F' || unit == 'h') return null;

  return prefixes[unit[0]] ?? null;
}

/* parses a single value like '4.7 nF' into [4.7, -9], NaN if invalid */
export function Unit(str) {
  const m = RANGE.exec(IsString(str) ? str : str + '');

  if(!m || m[3] !== undefined) return [NaN, null];

  return [+m[1], PrefixExp(m[2])];
}

/*
 * parses 'a', or a range 'a - b' ('87.5 - 108MHz', '1e-6..1e-3', '1u~5u')
 * into an array of plain numbers: [], [a] or [a, b]. A missing prefix on
 * the first value is taken from the second one.
 */
export function ParseRange(value) {
  const m = RANGE.exec(IsString(value) ? value : value + '');

  if(!m) return [];

  const a = [+m[1], PrefixExp(m[2])];
  const b = m[3] === undefined ? null : [+m[3], PrefixExp(m[4])];

  if(b && m[2] === '') a[1] = b[1];

  return [a, b].filter(Boolean).map(NumericValue);
}

export function RoundTo(prec) {
  if(!IsNumber(prec)) return n => n;

  return n => {
    const s = n.toFixed(prec);

    return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
  };
}

export function IsNumber(arg) {
  return typeof arg == 'number';
}

export function IsString(arg) {
  return typeof arg == 'string';
}

export function IsBigInt(arg) {
  return typeof arg == 'bigint';
}
