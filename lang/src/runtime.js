/* @flow */

import { parser } from './parser';
import { TValue } from './types';
import {
  evalBinaryExpression,
  val,
  convertUnits,
  DEFAULT_ENVIRONMENT,
} from './units';

export function run(
  code: string,
  formValue: { [key: number]: string }
): Array<?TValue> {
  global.env = {
    val,
    eval: (op, left, right) => {
      return evalBinaryExpression(
        op,
        left,
        right,
        DEFAULT_ENVIRONMENT
      );
    },
    convert: (value, units) => {
      return convertUnits(
        value,
        units.units,
        DEFAULT_ENVIRONMENT,
      );
    },
    time: (what, when) => {
      return val(-1);
    },
    DEFAULT_ENVIRONMENT,
    vars: {},
    result: [],
    funcs: {
      sum: function(env) {
        if(env.result.length === 0) {
          return val(0);
        }

        let result = env.result[env.result.length - 1];

        for(let i = env.result.length - 2; i >= 0; i --) {
          if(!env.result[i]) {
            break;
          }
          result = env.eval('+', result, env.result[i]);
        }
        return result;
      },
      prod: function(env) {
        if(env.result.length === 0) {
          return val(0);
        }

        let result = env.result[env.result.length - 1];

        for(let i = env.result.length - 2; i > 0; i --) {
          if(!env.result[i]) {
            break;
          }
          result = env.eval('*', result, env.result[i]);
        }
        return result;
      },
      prev: function(env) {
        return env.result[env.result.length - 1];
      },
      tomorrow: function(env) {
        return new Date();
      },
      sqrt: function(env, val) {
        const { num, units } = val;
        return env.val(Math.sqrt(num), units);
      },
      min: function(env, a, b) {
        return (a.num < b.num) ? a : b;
      },
      max: function(env, a, b) {
        return (a.num > b.num) ? a : b;
      }
    }
  };

  const lines = code.split(/\n/g);

  lines.map((line, idx) => {
    const PLACEHOLDER = /\[(.*?)\]/;
    const match = line.match(PLACEHOLDER);
    if(match && match.length > 0) {
      if(formValue && typeof formValue[idx] !== 'undefined') {
        if(match[1].indexOf(',') !== -1 && match[1].indexOf(':') === -1) {
          const [before, after] = match[1].split(/,/);
          const val = formValue[idx] ? before : after;
          line = line.replace(PLACEHOLDER, val);
        } else {
          line = line.replace(PLACEHOLDER, formValue[idx]);
        }
      } else {
        const value = match[1].replace(/,.*$/, '');
        line = line.replace(PLACEHOLDER, value);
      }
    }
    try {
      parser.parse(line + '\n')[0];
    } catch(e) {
      global.env.result.push(null);
    }
  });

  return global.env.result;
}

export function lex(code: string): Array<string> {
  let lexer = parser.lexer,
      token;
  lexer.setInput(code);
  let result = [];
  while(!lexer.done) {
    token = lexer.lex();
    if(token in parser.terminals_) {
      token = parser.terminals_[token];
    }
    result.push('<' + token + ', ' + lexer.yytext + '>');
  }
  return result;
}
