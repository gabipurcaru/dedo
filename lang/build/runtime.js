'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.run = run;
exports.lex = lex;

var _parser = require('./parser');

var _types = require('./types');

var _units = require('./units');

function run(code, formValue) {
  global.env = {
    val: _units.val,
    eval: function _eval(op, left, right) {
      return (0, _units.evalBinaryExpression)(op, left, right, _units.DEFAULT_ENVIRONMENT);
    },
    convert: function convert(value, units) {
      return (0, _units.convertUnits)(value, units.units, _units.DEFAULT_ENVIRONMENT);
    },
    time: function time(what, when) {
      return (0, _units.val)(-1);
    },
    DEFAULT_ENVIRONMENT: _units.DEFAULT_ENVIRONMENT,
    vars: {},
    result: [],
    funcs: {
      sum: function sum(env) {
        if (env.result.length === 0) {
          return (0, _units.val)(0);
        }

        var result = env.result[env.result.length - 1];

        for (var i = env.result.length - 2; i >= 0; i--) {
          if (!env.result[i]) {
            break;
          }
          result = env.eval('+', result, env.result[i]);
        }
        return result;
      },
      prod: function prod(env) {
        if (env.result.length === 0) {
          return (0, _units.val)(0);
        }

        var result = env.result[env.result.length - 1];

        for (var i = env.result.length - 2; i > 0; i--) {
          if (!env.result[i]) {
            break;
          }
          result = env.eval('*', result, env.result[i]);
        }
        return result;
      },
      prev: function prev(env) {
        return env.result[env.result.length - 1];
      },
      tomorrow: function tomorrow(env) {
        return new Date();
      },
      sqrt: function sqrt(env, val) {
        var num = val.num,
            units = val.units;

        return env.val(Math.sqrt(num), units);
      },
      min: function min(env, a, b) {
        return a.num < b.num ? a : b;
      },
      max: function max(env, a, b) {
        return a.num > b.num ? a : b;
      }
    }
  };

  var lines = code.split(/\n/g);

  lines.map(function (line, idx) {
    var PLACEHOLDER = /\[(.*?)\]/;
    var match = line.match(PLACEHOLDER);
    if (match && match.length > 0) {
      if (formValue && typeof formValue[idx] !== 'undefined') {
        if (match[1].indexOf(',') !== -1 && match[1].indexOf(':') === -1) {
          var _match$1$split = match[1].split(/,/),
              _match$1$split2 = _slicedToArray(_match$1$split, 2),
              before = _match$1$split2[0],
              after = _match$1$split2[1];

          var _val = formValue[idx] ? before : after;
          line = line.replace(PLACEHOLDER, _val);
        } else {
          line = line.replace(PLACEHOLDER, formValue[idx]);
        }
      } else {
        var value = match[1].replace(/,.*$/, '');
        line = line.replace(PLACEHOLDER, value);
      }
    }
    try {
      _parser.parser.parse(line + '\n')[0];
    } catch (e) {
      global.env.result.push(null);
    }
  });

  return global.env.result;
}

function lex(code) {
  var lexer = _parser.parser.lexer,
      token = void 0;
  lexer.setInput(code);
  var result = [];
  while (!lexer.done) {
    token = lexer.lex();
    if (token in _parser.parser.terminals_) {
      token = _parser.parser.terminals_[token];
    }
    result.push('<' + token + ', ' + lexer.yytext + '>');
  }
  return result;
}