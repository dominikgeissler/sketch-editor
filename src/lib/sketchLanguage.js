CodeMirror.defineMode("sketch", () => {
  // Comments
  const comment = { style: "comment", regex: /\/\/.*/ };
  const blockComment = { style: "comment", regex: /\/\*/, next: "comment" };
  const commentEnd = { style: "comment", regex: /\*\//, next: "start" };
  const commentMode = [blockComment, commentEnd];

  // Strings
  const string = { style: "string", regex: /"(?:[^\\]|\\.)*?(?:"|$)/ };

  const keywords = [
    "if",
    "else",
    "for",
    "while",
    "void",
    "int",
    "float",
    "bit",
    "harness",
    "generator",
    "gen",
    "define"
  ];

  // Handle the keywords
  const keywordMapper = CodeMirror.makeKeywordMapper(
    {
      keyword: keywords.join("|")
    },
    "keyword"
  );

  // Handle the operators
  const operatorChars = /^[+\-*&%=<>!?|\/]/;
  const operators = ["+", "-", "*", "/", "=", "==", "!=", ">", "<", "&&", "||"];
  const operatorMapper = CodeMirror.makeWordMapper(operators.join("|"));

  // Handle the variables
  const variableChars = /^[a-zA-Z0-9_]/;
  const variableMapper = CodeMirror.makeWordMapper(variableChars);

  // Handle the numbers
  const numberChars = /^[0-9]/;
  const numberMapper = CodeMirror.makeWordMapper(numberChars);

  // Handle the punctuation
  const punctuationChars = /^[.,:;(){}[\]]/;
  const punctuationMapper = CodeMirror.makeWordMapper(punctuationChars);

  // Handle the brackets
  const bracketChars = /^[(){}[\]]/;
  const bracketMapper = CodeMirror.makeWordMapper(bracketChars);

  // Putting it all together
  const sketchMode = [
    comment,
    string,
    commentMode,
    { style: "keyword", regex: keywordMapper },
    { style: "operator", regex: operatorMapper },
    { style: "variable", regex: variableMapper },
    { style: "number", regex: numberMapper },
    { style: "punctuation", regex: punctuationMapper },
    { style: "bracket", regex: bracketMapper }
  ];

  // Return the mode
  return {
    startState: () => {
      return {
        inComment: false
      };
    },
    token: (stream, state) => {
      if (stream.eatSpace()) {
        return null;
      }

      if (stream.match(/^\/\*/)) {
        state.inComment = true;
        return null;
      }

      if (state.inComment) {
        if (stream.match(/\*\//)) {
          state.inComment = false;
        } else {
          stream.next();
        }
        return "comment";
      }

      // Keywords from above
      if (stream.match(/^(if|else|for|while|void|int|float|bit|harness|generator|gen|define)/)) {
        return "keyword";
      }


      if (stream.match(/^\/\/.*/)) {
        return "comment";
      }

      if (stream.match(/^[+\-*&%=<>!?|\/]/)) {
        return "operator";
      }

      if (stream.match(/^[a-zA-Z0-9_]/)) {
        return "variable";
      }

      if (stream.match(/^[0-9]/)) {
        return "number";
      }

      if (stream.match(/^[.,:;(){}[\]]/)) {
        return "punctuation";
      }

      if (stream.match(/^[(){}[\]]/)) {
        return "bracket";
      }

      stream.next();
      return null;
    }
  };

});
