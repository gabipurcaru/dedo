"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEFAULT_ENVIRONMENT = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.convertUnits = convertUnits;
exports.evalBinaryExpression = evalBinaryExpression;
exports.val = val;
exports.conversion = conversion;

var _types = require("./types");

var conversions = [["gbp", "£", 1], ["usd", "$", 1], ["eur", "€", 1], ["km", "m", 1000], ["m", "dm", 10], ["dm", "cm", 10], ["cm", "mm", 10], ["kg", "g", 1000], ["g", "mg", 1000], ["minute", "second", 60], ["hour", "minute", 60], ["day", "hour", 24], ["week", "day", 7], ["month", "day", 30.5], ["year", "month", 12], ["minute", "minutes", 1], ["hour", "hours", 1], ["day", "days", 1], ["week", "weeks", 1], ["month", "months", 1], ["year", "years", 1], ["s", "second", 1], ["sec", "second", 1], ["min", "minute", 1], ["h", "hour", 1], ["d", "day", 1], ["w", "week", 1], ["y", "year", 1]];

var rates = { EUR: 0.94, GBP: 0.66, RON: 4.13 };

try {
  rates = require('./rates');
} catch (e) {}
// pass


// if testing, provide some standard values for the rates
if (typeof global.it === 'function') {
  rates.EUR = 0.94;
  rates.GBP = 0.66;
  rates.RON = 4.13;
}

for (var currency in rates) {
  conversions.push(["usd", currency.toLowerCase(), rates[currency]]);
}

var DEFAULT_ENVIRONMENT = exports.DEFAULT_ENVIRONMENT = void 0;

try {
  exports.DEFAULT_ENVIRONMENT = DEFAULT_ENVIRONMENT = require('./environment');
} catch (e) {
  var allConversions = expandConversions(conversions.map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 3),
        from = _ref2[0],
        to = _ref2[1],
        ratio = _ref2[2];

    return conversion(from, to, ratio);
  }));
  var conversionsMap = createConversionsMap(allConversions);
  exports.DEFAULT_ENVIRONMENT = DEFAULT_ENVIRONMENT = {
    conversions: allConversions,
    conversionsMap: conversionsMap
  };
}

function conversionHash(from, to) {
  return from + "|" + to;
}

function createConversionsMap(conversions) {
  var map = {};
  conversions.map(function (conversion) {
    return map[conversionHash(conversion.from, conversion.to)] = conversion;
  });
  return map;
}

// this function fills the directed graph of conversions
// for example, if we have a m -> cm and a cm -> mm conversion,
// this function adds cm -> m, mm -> cm, m -> m, cm -> cm, mm -> mm
// and finally m -> mm and mm -> m. For N nodes in the conversion graph,
// this function returns an array with O(N^2) elements
function expandConversions(oldConversions) {
  var before = new Date();

  var conversions = [];
  var conversionMapping = {};

  var addConversion = function addConversion(from, to, ratio) {
    var pairKey = from + '|' + to;
    if (typeof conversionMapping[pairKey] === 'undefined') {
      conversions.push({
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        ratio: ratio
      });
      conversionMapping[pairKey] = true;
      return true;
    }
    return false;
  };

  oldConversions.map(function (_ref3) {
    var from = _ref3.from,
        to = _ref3.to,
        ratio = _ref3.ratio;

    addConversion(from, to, ratio);
    addConversion(to, from, 1 / ratio);
    addConversion(from, from, 1);
    addConversion(to, to, 1);
  });

  while (true) {
    var isSaturated = true;

    var length = conversions.length;
    for (var i = 0; i < length; i++) {
      for (var j = 0; j < length; j++) {
        if (conversions[i].to === conversions[j].from) {
          if (addConversion(conversions[i].from, conversions[j].to, conversions[i].ratio * conversions[j].ratio)) {
            isSaturated = false;
          }
        }
      }
    }

    if (isSaturated) {
      break;
    }
  }

  return conversions;
}

function sameUnit(left, right) {
  // TODO: account for type conversions and aliases

  var leftKeys = Object.keys(left);
  var rightKeys = Object.keys(right);

  if (leftKeys.length != rightKeys.length) {
    return false;
  }

  leftKeys.sort();
  rightKeys.sort();

  for (var i = 0; i < leftKeys.length; i++) {
    if (leftKeys[i] !== rightKeys[i]) {
      return false;
    }

    var _key = leftKeys[i];

    if (left[_key] !== right.key) {
      return false;
    }
  }

  return true;
}

function convertUnits(value, newUnits, env) {
  var strict = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  // Example:
  // { m: 2, s: -1 }  -->  100 / 3600 * { cm: 2, h: -1 }

  // clone the inputs
  value = {
    num: value.num,
    units: Object.assign({}, value.units)
  };
  newUnits = Object.assign({}, newUnits);

  var fromUnits = {};
  Object.assign(fromUnits, value.units);

  var fromUnit = void 0,
      toUnit = void 0;
  for (fromUnit in fromUnits) {
    if (!fromUnits.hasOwnProperty(fromUnit)) {
      continue;
    }
    for (toUnit in newUnits) {
      if (!newUnits.hasOwnProperty(toUnit)) {
        continue;
      }
      var _conversion = env.conversionsMap[conversionHash(fromUnit, toUnit)];
      if (fromUnit === toUnit || !_conversion) {
        continue;
      }
      if (fromUnits[fromUnit] !== newUnits[toUnit] && strict) {
        throw new Error("Conversion error");
      }

      value.num *= Math.pow(_conversion.ratio, fromUnits[fromUnit]);
      value.units[toUnit] = value.units[fromUnit];
      delete value.units[fromUnit];
    }
  }

  return value;
}

function evalBinaryExpression(operator, left, right, environment) {
  left = {
    num: left.num,
    units: Object.assign({}, left.units)
  };
  right = {
    num: right.num,
    units: Object.assign({}, right.units)
  };
  if (operator === '*') {
    var _ret = function () {
      var units = {};

      var convertedLeft = convertUnits(left, right.units, environment, false);

      Object.assign(units, convertedLeft.units);
      var num = convertedLeft.num * right.num;

      Object.keys(right.units).map(function (unit) {
        if (typeof units[unit] === 'undefined') {
          units[unit] = right.units[unit];
        } else {
          units[unit] += right.units[unit];
          if (units[unit] === 0) {
            delete units[unit];
          }
        }
      });

      // fix units like g/kg -> nothing
      var from = void 0,
          to = void 0,
          conversion = void 0;
      for (from in units) {
        for (to in units) {
          var _conversion2 = environment.conversionsMap[conversionHash(from, to)];
          if (!_conversion2 || from === to) {
            continue;
          }
          num /= Math.pow(_conversion2.ratio, units[from]);
          units[to] += units[from];
          if (units[to] === 0) {
            delete units[to];
          }
          delete units[from];
        }
      }

      return {
        v: { num: num, units: units }
      };
    }();

    if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
  } else if (operator === '/') {
    var _ret2 = function () {
      var num = left.num / right.num;
      var units = {};
      Object.assign(units, left.units);
      Object.keys(right.units).map(function (unit) {
        if (typeof units[unit] === 'undefined') {
          units[unit] = -right.units[unit];
        } else {
          units[unit] -= right.units[unit];
          if (units[unit] === 0) {
            delete units[unit];
          }
        }
      });

      // fix units like g/kg -> nothing
      var from = void 0,
          to = void 0,
          conversion = void 0;
      for (from in units) {
        for (to in units) {
          var _conversion3 = environment.conversionsMap[conversionHash(from, to)];
          if (!_conversion3 || from === to) {
            continue;
          }
          num *= Math.pow(_conversion3.ratio, units[from]);
          units[to] += units[from];
          if (units[to] === 0) {
            delete units[to];
          }
          delete units[from];
        }
      }

      return {
        v: { num: num, units: units }
      };
    }();

    if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
  } else if (operator === '+' || operator === '-') {
    var _convertedLeft = convertUnits(left, right.units, environment);

    var _num = operator === '+' ? _convertedLeft.num + right.num : _convertedLeft.num - right.num;

    return {
      num: _num,
      units: _num === 0 ? {} : _convertedLeft.units
    };
  } else if (operator === '^') {
    var _ret3 = function () {
      var pow = right.num;
      var units = {};
      Object.keys(left.units).map(function (unit) {
        units[unit] = left.units[unit] * pow;
      });
      return {
        v: {
          num: Math.pow(left.num, pow),
          units: units
        }
      };
    }();

    if ((typeof _ret3 === "undefined" ? "undefined" : _typeof(_ret3)) === "object") return _ret3.v;
  } else if (operator === '->') {
    if (right.num !== 1) {
      throw new Error("Malformed expression");
    }
    return convertUnits(left, right.units, environment);
  }

  throw new Error("Operator not implemented: " + operator);
}

function val(num) {
  var unitsOrUnit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (typeof num === 'string') {
    num = parseFloat(num);
  }
  if ((typeof unitsOrUnit === "undefined" ? "undefined" : _typeof(unitsOrUnit)) === 'object') {
    return { num: num, units: unitsOrUnit };
  } else {
    var units = {};
    units[unitsOrUnit.toLowerCase()] = 1;
    return { num: num, units: units };
  }
}

function conversion(from, to, ratio) {
  return { from: from, to: to, ratio: ratio };
}