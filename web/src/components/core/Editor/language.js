import CodeMirror from 'codemirror';

CodeMirror.defineMode('calcu', () => ({
  startState() {
    return {
      inComment: false,
      lhs: true,
      inForm: false,
    };
  },

  token(stream, state) {
    const c = stream.next();
    const isWord = /\w/;
    const isNumber = /\d/;
    const isOperator = /[+\-*\/=]/;
    const isComment = /^[^:\[]*:/;

    if(c === '#') {
      stream.skipToEnd();
      return "comment";
    } else if(c === '[') {
      stream.eatWhile(/[^\]]/);
      stream.next();
      return "atom";
    } else if(stream.match(isComment)) {
      return "comment";
    } else if(isNumber.test(c)) {
      stream.eatWhile(isNumber);
      return 'number';
    } else if(isWord.test(c)) {
      stream.eatWhile(isWord);
      const word = stream.current();
      if(['to', 'in'].indexOf(word.toLowerCase()) !== -1) {
        return 'keyword';
      }
      return 'identifier';
    } else if(isOperator.test(c)) {
      stream.eatWhile(isOperator);
      return 'operator';
    }

    return null;
  }
}));
