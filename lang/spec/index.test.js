import { run, lex } from '../src/runtime';
import fs from 'fs';
import expect from 'expect';

describe('run', () => {
  let tests = [];
  let fileNum = 1;
  while(true) {
    try {
      const code = fs.readFileSync(
        __dirname + '/examples/' + fileNum + '.calcu',
        { encoding: 'utf8' }
      );
      const parts = code.split(/\n/g).map(line => {
        return line.split(/\|/).map(part => part.trim());
      });
      const input = parts.map(line => line[0]).join('\n');
      const output = parts.map(line => line[1]).join('\n');

      tests.push({ input, output, filename: `${fileNum}.calcu` });
      fileNum ++;
    } catch(e) {
      break;
    }
  }

  tests.map(({ input, output, filename }) => {
    it(`works for ${filename}`, () => {
      const output1 = run(input);
      const output2 = run(output);

      expect(output1).toEqual(
        output2,
        "Unexpected output. Here are the tokens: \n\n" + lex(input).join('\n')
      );
    });
  });
});
