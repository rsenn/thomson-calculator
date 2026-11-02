const unitNames = ['H', 'F', 'Hz'];

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

export function NumericValue([num, exp]) {
  if(IsBigInt(num) || IsBigInt(exp)) return 10n ** BigInt(exp) * BigInt(num);

  return Math.pow(10, exp) * num;
}

export function Exponent(num) {
  if(IsBigInt(num)) return num.toString().length - 1;

  return Math.floor(Math.log10(num));
}

export function Thousand(exponent, fn = 'floor') {
  return Math.min(21, Math.max(-24, Math[fn](exponent / 3) * 3));
}

export function Exp2Unit(exponent, fn = 'floor') {
  /* prettier-ignore */ switch (Thousand(exponent, fn)) {
  case -24:
    return 'y';
  case -21:
    return 'z';
  case -18:
    return 'a';
  case -15:
    return 'f';
  case -12:
    return 'p';
  case -9:
    return 'n';
  case -6:
    return 'µ';
  case -3:
    return 'm';
  case -2:
    return 'c';
  case -1:
    return 'd';
  case 0:
    return '';
  case 2:
    return 'h';
  case 3:
    return 'k';
  case 6:
    return 'M';
  case 9:
    return 'G';
  case 12:
    return 'T';
  case 15:
    return 'P';
  case 18:
    return 'E';
  case 21:
    return 'Z';
  }
}

export function Unit(str) {
  if(!IsString(str)) str = str + '';

  str = str.replaceAll(/\s+/g, '');
  const [num] = str.match(/[+-]?(?:\d+\.\d*|\d*\.\d+|\d+)(?:[eE][+-]?\d+)?/gy) ?? [''];
  const unit = str.slice(num.length);
  let exp = null;

  /* prettier-ignore */ switch (unit[0]) {
  case 'y':
    exp = -24;
    break;
  case 'z':
    exp = -21;
    break;
  case 'a':
    exp = -18;
    break;
  case 'f':
    exp = -15;
    break;
  case 'p':
    exp = -12;
    break;
  case 'n':
    exp = -9;
    break;
  case '\u00B5':
  case '\u03BC':
  case 'u':
    exp = -6;
    break;
  case 'm':
    exp = -3;
    break;
  case 'c':
    exp = -2;
    break;
  case 'd':
    exp = -1;
    break;
  case 'h':
    exp = 2;
    break;
  case 'k':
    exp = 3;
    break;
  case 'M':
    exp = 6;
    break;
  case 'G':
    exp = 9;
    break;
  case 'T':
    exp = 12;
    break;
  case 'P':
    exp = 15;
    break;
  case 'E':
    exp = 18;
    break;
  case 'Z':
    exp = 21;
    break;
  }

  return [+num, exp];
}

export function RoundTo(prec) {
  return n => n.toFixed(prec).replace(/\.(.*[^0])0*$/g, '.$1');
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
