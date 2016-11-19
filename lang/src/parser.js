/* @flow */

import { Parser, Generator } from 'jison';
import Lexer from 'jison-lex';
import { TValue } from './types';
import {
  evalBinaryExpression,
  val,
  convertUnits,
  DEFAULT_ENVIRONMENT
} from './units';

declare function escape(input: string): string;

const grammar = {
   "comment": "Calcu Parser",
   // JavaScript comments also work

   "lex": {
      "rules": [
         ["\\n",                     "return 'EOL'"],
         ["[^:\\n]*:",               "/* skip comments */"],
         [" +",                      "/* skip whitespace */"],
         ["in\\b",                   "return 'IN'"],
         ["until\\b",                "return 'UNTIL'"],
         ["from\\b",                 "return 'FROM'"],
         ["to\\b",                   "return 'TO'"],
         ["of\\b",                   "return 'OF'"],
         ["at\\b",                   "return 'AT'"],
         ["pm\\b",                   "return 'PM'"],
         ["am\\b",                   "return 'AM'"],
         ["next\\b",                 "return 'NEXT'"],
         ["[0-9]+(?:\\.[0-9]+)?",    "return 'NUMBER'"],
         ["[a-zA-Z£$€_]+",           "return 'IDENT'"],
         ["[#?]+",                   "return 'INVALID'"],
         ["\\*\\*",                  "return '**'"],
         ["\\*",                     "return '*'"],
         ["\\/",                     "return '/'"],
         ["-",                       "return '-'"],
         [":",                       "return ':'"],
         ["\\+",                     "return '+'"],
         ["\\^",                     "return '^'"],
         ["!",                       "return '!'"],
         ["%",                       "return '%'"],
         ["\\(",                     "return '('"],
         ["\\)",                     "return ')'"],
         ["=",                       "return '='"],
         [",",                       "return ','"],
         ["$",                       "return 'EOF'"],
      ]
   },

   "operators": [
      ["left", "UNITS"],
      ["left", "IN", "TO"],
      ["left", "UNTIL"],
      ["left", "OF"],
      ["left", "="],
      ["left", "+", "-"],
      ["left", "*", "/"],
      ["left", "^"],
      ["right", "!"],
      ["right", "%"],
      ["left", "UMINUS"],
      ["left", "DATETIME"],
      ["right", "IGNORE"],
      ["right", "DATE"],
   ],

   "bnf": {
      "expressions": [
        ["lines", "return $1"],
      ],

      "lines": [
        ["line lines", ""],
        ["line EOF", "return env.result"],
      ],

      "line": [
        ["ce EOL", `
          env.result.push($1);
        `],
        ["EOL", `
          env.result.push(null);
        `],
      ],

      "ce" :[
        //  ["te", "$$ = $1", { prec: "DATETIME" }],
         ["e", "$$ = $1"],
      ],

      "te" :[
         // ["FROM e UNTIL e", "$$ = env.eval('-', $4, $2)"],
         // ["e FROM e UNTIL e", "$$ = env.eval('*', $1, env.eval('-', $5, $3))"],
         ["e FROM e TO e", "$$ = env.eval('*', $1, env.eval('-', $5, $3))"],
         // ["FROM e TO e", "$$ = env.eval('-', $4, $2)"],
         // ["time", "$$ = env.time(null, $1)", { prec: "DATETIME" }],
         ["date", "$$ = env.time(null, $1)", { prec: "DATETIME" }],
         // ["date time", "$$ = env.time(null, $1, $2)", { prec: "DATETIME" }],
         // ["time date", "$$ = env.time(null, $2, $1)", { prec: "DATETIME" }],
         // ["NEXT IDENT", "$$ = env.time('next', $2)"],
         // ["NEXT IDENT AT time", "$$ = env.time('next', $2)"],
      ],

      "e": [
         ["IDENT ( elist )", "$$ = env.funcs[$1].apply(this, [env].concat($3))"],
         ["IDENT = e", "$$ = env.vars[$1] = $3"],
         ["ident NUMBER", "$$ = env.eval('*', env.val($2), $1)"],
         ["NUMBER ident", "$$ = env.eval('*', env.val($1), $2)"],
         ["NUMBER ident ^ e", "$$ = env.eval('*', env.val($1), env.eval($3, $2, $4))", { prec: "UNITS" }],
         ["NUMBER ident ** e", "$$ = env.eval('*', env.val($1), env.eval('^', $2, $4))", { prec: "UNITS" }],
         ["ident", "$$ = $1"],
         ["NUMBER", "$$ = env.val($1)"],
         ["e IN e",    "$$ = env.convert($1, $3)"],
         ["e TO e",    "$$ = env.convert($1, $3)"],
         ["e OF e", "$$ = env.eval('*', $1, $3)"],
         ["e + e",  "$$ = env.eval($2, $1, $3)"],
         ["e - e",  "$$ = env.eval($2, $1, $3)"],
         ["e * e",  "$$ = env.eval($2, $1, $3)"],
         ["e / e",  "$$ = env.eval($2, $1, $3)"],
         ["e ^ e",  "$$ = env.eval($2, $1, $3)"],
         ["e ** e",  "$$ = env.eval('^', $1, $3)"],
         ["e %",    "$$ = env.eval('/', $1, env.val(100))"],
         ["- e",    "$$ = $2; $$.num = -$$.num", {"prec": "UMINUS"}],
         ["( e )",  "$$ = $2"],
      ],
      "elist": [
        ["e",        "$$ = [$1]"],
        ["e , elist", "$$ = [$1].concat($3)"],
      ],
      "ident": [
        ["IDENT", `
           if(env.funcs[$1]) {
             $$ = env.funcs[$1](env);
           } else if(env.vars[$1]) {
             $$ = env.vars[$1];
           } else {
             $$ = env.val(1, $1);
           }
        `],
      ],
      // "time" :[
      //    ["NUMBER ampm timezone", "$$ = env.time($2, $1, $3)"],
      //    ["NUMBER timezone", "$$ = env.time($2, $1, $3)"],
      //    ["NUMBER ampm", "$$ = env.time($2, $1, $3)"],
      //    ["NUMBER : NUMBER ampm timezone", "$$ = env.time($4, $1 + $2 + $3, $5)"],
      //    ["NUMBER : NUMBER timezone", "$$ = env.time($4, $1 + $2 + $3, $5)"],
      //    ["NUMBER : NUMBER ampm ", "$$ = env.time($4, $1 + $2 + $3, $5)"],
      //    // TODO: noon, dusk, dawn, midnight
      // ],
      // "ampm" :[
      //   ["AM", "$$ = 'am'"],
      //   ["PM", "$$ = 'pm'"],
      // ],
      // "timezone" :[
      //   ["IDENT", "$$ = $1"],
      // ],
      "date" :[
        ["NUMBER / NUMBER / NUMBER", "$$ = env.time(null, $1 + $2 + $3 + $4 + $5)", { prec: "DATE" }],
      ],
   }
};

export let parser = new Parser(grammar);
export let lexer = new Lexer(grammar.lex);

export function codegen(): string {
  return (new Generator(grammar, {})).generateCommonJSModule();
}
