/* @flow */

import { TEnvironment, TValue, TUnit, TUnitSet, TConversion } from './types';

let conversions = [
  ["gbp", "£", 1],
  ["usd", "$", 1],
  ["eur", "€", 1],
  ["km", "m", 1000],
  ["m", "dm", 10],
  ["dm", "cm", 10],
  ["cm", "mm", 10],
  ["kg", "g", 1000],
  ["g", "mg", 1000],
  ["minute", "second", 60],
  ["hour", "minute", 60],
  ["day", "hour", 24],
  ["week", "day", 7],
  ["month", "day", 30.5],
  ["year", "month", 12],
  ["minute", "minutes", 1],
  ["hour", "hours", 1],
  ["day", "days", 1],
  ["week", "weeks", 1],
  ["month", "months", 1],
  ["year", "years", 1],
  ["s", "second", 1],
  ["sec", "second", 1],
  ["min", "minute", 1],
  ["h", "hour", 1],
  ["d", "day", 1],
  ["w", "week", 1],
  ["y", "year", 1],
];

let rates = { EUR: 0.94, GBP: 0.66, RON: 4.13 };

try {
  rates = require('./rates');
} catch(e) {
  // pass
}

// if testing, provide some standard values for the rates
if(typeof global.it === 'function') {
  rates.EUR = 0.94;
  rates.GBP = 0.66;
  rates.RON = 4.13;
}

for(let currency in rates) {
  conversions.push(["usd", currency.toLowerCase(), rates[currency]]);
}

export let DEFAULT_ENVIRONMENT: TEnvironment;

try {
  DEFAULT_ENVIRONMENT = require('./environment');
} catch(e) {
  const allConversions = expandConversions(conversions.map(
    ([ from, to, ratio ]) => conversion(from, to, ratio))
  );
  const conversionsMap = createConversionsMap(allConversions);
  DEFAULT_ENVIRONMENT = {
    conversions: allConversions,
    conversionsMap,
  };
}

function conversionHash(from: String, to: String): string {
  return `${from}|${to}`;
}

function createConversionsMap(
  conversions: Array<TConversion>,
): ({ [key: string]: TConversion }) {
  const map = {};
  conversions.map(conversion => map[conversionHash(conversion.from, conversion.to)] = conversion);
  return map;
}

// this function fills the directed graph of conversions
// for example, if we have a m -> cm and a cm -> mm conversion,
// this function adds cm -> m, mm -> cm, m -> m, cm -> cm, mm -> mm
// and finally m -> mm and mm -> m. For N nodes in the conversion graph,
// this function returns an array with O(N^2) elements
function expandConversions(
  oldConversions: Array<TConversion>
): Array<TConversion> {
  const before = new Date();

  let conversions = [];
  let conversionMapping = {};

  const addConversion = (from, to, ratio) => {
    const pairKey = from + '|' + to;
    if(typeof conversionMapping[pairKey] === 'undefined') {
      conversions.push({
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        ratio
      });
      conversionMapping[pairKey] = true;
      return true;
    }
    return false;
  };

  oldConversions.map(({ from, to, ratio }) => {
    addConversion(from, to, ratio);
    addConversion(to, from, 1/ratio);
    addConversion(from, from, 1);
    addConversion(to, to, 1);
  });

  while(true) {
    let isSaturated = true;

    let length = conversions.length;
    for(let i = 0; i < length; i ++) {
      for(let j = 0; j < length; j ++) {
        if(conversions[i].to === conversions[j].from) {
          if(addConversion(
            conversions[i].from,
            conversions[j].to,
            conversions[i].ratio * conversions[j].ratio)) {
            isSaturated = false;
          }
        }
      }
    }

    if(isSaturated) {
      break;
    }
  }

  return conversions;
}

function sameUnit(left: TUnitSet, right: TUnitSet): boolean {
  // TODO: account for type conversions and aliases

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if(leftKeys.length != rightKeys.length) {
    return false;
  }

  leftKeys.sort();
  rightKeys.sort();

  for(let i = 0; i < leftKeys.length; i ++) {
    if(leftKeys[i] !== rightKeys[i]) {
      return false;
    }

    const key = leftKeys[i];

    if(left[key] !== right.key) {
      return false;
    }
  }

  return true;
}

export function convertUnits(
  value: TValue,
  newUnits: TUnitSet,
  env: TEnvironment,
  strict: boolean = true,
): TValue {
  // Example:
  // { m: 2, s: -1 }  -->  100 / 3600 * { cm: 2, h: -1 }

  // clone the inputs
  value = {
    num: value.num,
    units: Object.assign({}, value.units),
  };
  newUnits = Object.assign({}, newUnits);

  let fromUnits = {};
  Object.assign(fromUnits, value.units);

  let fromUnit, toUnit;
  for(fromUnit in fromUnits) {
    if(!fromUnits.hasOwnProperty(fromUnit)) {
      continue;
    }
    for(toUnit in newUnits) {
      if(!newUnits.hasOwnProperty(toUnit)) {
        continue;
      }
      const conversion = env.conversionsMap[conversionHash(fromUnit, toUnit)];
      if(fromUnit === toUnit || !conversion) {
        continue;
      }
      if(fromUnits[fromUnit] !== newUnits[toUnit] && strict) {
        throw new Error("Conversion error");
      }

      value.num *= Math.pow(conversion.ratio, fromUnits[fromUnit]);
      value.units[toUnit] = value.units[fromUnit];
      delete value.units[fromUnit];
    }
  }

  return value;
}

export function evalBinaryExpression(
  operator: string,
  left: TValue,
  right: TValue,
  environment: TEnvironment,
): TValue {
  left = {
    num: left.num,
    units: Object.assign({}, left.units),
  };
  right = {
    num: right.num,
    units: Object.assign({}, right.units),
  };
  if(operator === '*') {
    let units = {};

    const convertedLeft = convertUnits(
      left,
      right.units,
      environment,
      false,
    );

    Object.assign(units, convertedLeft.units);
    let num = convertedLeft.num * right.num;

    Object.keys(right.units).map(unit => {
      if(typeof units[unit] === 'undefined') {
        units[unit] = right.units[unit];
      } else {
        units[unit] += right.units[unit];
        if(units[unit] === 0) {
          delete units[unit];
        }
      }
    });

    // fix units like g/kg -> nothing
    let from, to, conversion;
    for(from in units) {
      for(to in units) {
        const conversion = environment.conversionsMap[conversionHash(from, to)];
        if(!conversion || from === to) {
          continue;
        }
        num /= Math.pow(conversion.ratio, units[from]);
        units[to] += units[from];
        if(units[to] === 0) {
          delete units[to];
        }
        delete units[from];
      }
    }

    return { num, units };
  } else if(operator === '/') {
    let num = left.num / right.num;
    let units = {};
    Object.assign(units, left.units);
    Object.keys(right.units).map(unit => {
      if(typeof units[unit] === 'undefined') {
        units[unit] = -right.units[unit];
      } else {
        units[unit] -= right.units[unit];
        if(units[unit] === 0) {
          delete units[unit];
        }
      }
    });

    // fix units like g/kg -> nothing
    let from, to, conversion;
    for(from in units) {
      for(to in units) {
        const conversion = environment.conversionsMap[conversionHash(from, to)];
        if(!conversion || from === to) {
          continue;
        }
        num *= Math.pow(conversion.ratio, units[from]);
        units[to] += units[from];
        if(units[to] === 0) {
          delete units[to];
        }
        delete units[from];
      }
    }

    return { num, units };
  } else if(operator === '+' || operator === '-') {
    const convertedLeft = convertUnits(
      left,
      right.units,
      environment,
    );

    const num = (
      operator === '+'
      ? convertedLeft.num + right.num
      : convertedLeft.num - right.num
    );

    return {
      num,
      units: (num === 0 ? {} : convertedLeft.units),
    }
  } else if(operator === '^') {
    const pow = right.num;
    let units = {};
    Object.keys(left.units).map(unit => {
      units[unit] = left.units[unit] * pow;
    });
    return {
      num: Math.pow(left.num, pow),
      units,
    }
  } else if(operator === '->') {
    if(right.num !== 1) {
      throw new Error("Malformed expression");
    }
    return convertUnits(left, right.units, environment);
  }

  throw new Error(
    "Operator not implemented: " + operator
  );
}

export function val(
  num: string | number,
  unitsOrUnit: TUnitSet | string = {}
): TValue {
  if(typeof num === 'string') {
    num = parseFloat(num);
  }
  if(typeof unitsOrUnit === 'object') {
    return { num, units: unitsOrUnit };
  } else {
    let units = {};
    units[unitsOrUnit.toLowerCase()] = 1;
    return { num, units };
  }
}

export function conversion(
  from: TUnit,
  to: TUnit,
  ratio: number,
): TConversion {
  return { from, to, ratio };
}
