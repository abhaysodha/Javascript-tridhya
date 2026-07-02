
function tokenize(expression) {
  const tokens = [];
  let i = 0;  

  if (typeof expression !== "string" || expression.trim() === "") {
    throw new Error("Empty expression");
  }

  while (i < expression.length) {
    const ch = expression[i];

    // Skip whitespace
    if (ch === " " || ch === "\t") {
      i++;
      continue;
    }

    // Number: digits and at most one decimal point
    if (/[0-9.]/.test(ch)) { //
      let numStr = "";
      let dotCount = 0;

      while (i < expression.length && /[0-9.]/.test(expression[i])) { //
        if (expression[i] === ".") {
          dotCount++;
          if (dotCount > 1) {
            throw new Error(`Invalid number format near "${numStr}."`);
          }
        }
        numStr += expression[i];
        i++;
      }

      // Reject something like "." with no digits at all
      if (numStr === "." || numStr === "") {
        throw new Error("Invalid number format");
      }

      tokens.push({ type: "number", value: parseFloat(numStr) });
      continue;
    }

    // Operators
    if ("+-*/%^".includes(ch)) {
      tokens.push({ type: "operator", value: ch });
      i++;
      continue;
    }

    // Parentheses
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch });
      i++;
      continue;
    }

    // Anything else (letters, symbols, emojis, etc.) is invalid
    throw new Error(`Invalid character in expression: "${ch}"`);
  }

  return tokens;
}

function markUnaryOperators(tokens) { //
  const result = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prev = result[result.length - 1];

    const isUnaryPosition =
      token.type === "operator" &&
      (token.value === "+" || token.value === "-") &&
      (!prev ||
        prev.type === "operator" ||
        (prev.type === "paren" && prev.value === "("));

    if (isUnaryPosition) {
      result.push({ type: "operator", value: token.value === "-" ? "u-" : "u+" });
    } else {
      result.push(token);
    }
  }

  return result;
}

const OPERATORS = { //
  "u-": { precedence: 4, associativity: "right" },
  "u+": { precedence: 4, associativity: "right" },
  "^":  { precedence: 3, associativity: "right" },
  "*":  { precedence: 2, associativity: "left" },
  "/":  { precedence: 2, associativity: "left" },
  "%":  { precedence: 2, associativity: "left" },
  "+":  { precedence: 1, associativity: "left" },
  "-":  { precedence: 1, associativity: "left" },
};


function toPostfix(tokens) {
  const output = [];
  const opStack = [];

  for (const token of tokens) {
    // --- Case 1: numbers go straight to output ---
    if (token.type === "number") {
      output.push(token);
      continue;
    }

    // --- Case 2: operators ---
    if (token.type === "operator") {
      const current = OPERATORS[token.value];

      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1].type === "operator" &&
        opStack[opStack.length - 1].value !== "(" &&
        (
          OPERATORS[opStack[opStack.length - 1].value].precedence > current.precedence ||
          (OPERATORS[opStack[opStack.length - 1].value].precedence === current.precedence &&
            current.associativity === "left")
        )
      ) {
        output.push(opStack.pop());
      }

      opStack.push(token);
      continue;
    }

    // --- Case 3: left parenthesis, just push it as a marker ---
    if (token.type === "paren" && token.value === "(") {
      opStack.push(token);
      continue;
    }

    // --- Case 4: right parenthesis, unwind back to matching '(' ---
    if (token.type === "paren" && token.value === ")") {
      let foundMatch = false;

      while (opStack.length > 0) {
        const top = opStack.pop();
        if (top.type === "paren" && top.value === "(") {
          foundMatch = true;
          break;
        }
        output.push(top);
      }

      if (!foundMatch) {
        throw new Error("Mismatched parentheses: extra ')' found");
      }
      continue;
    }
  }

  // Drain whatever operators are left on the stack
  while (opStack.length > 0) {
    const top = opStack.pop();
    if (top.type === "paren") {
      throw new Error("Mismatched parentheses: missing ')'");
    }
    output.push(top);
  }

  return output;
}

function evaluatePostfix(postfixTokens) {
  const stack = [];

  for (const token of postfixTokens) {
    if (token.type === "number") {
      stack.push(token.value);
      continue;
    }

    // Unary operators: one operand
    if (token.value === "u-" || token.value === "u+") {
      if (stack.length < 1) {
        throw new Error("Invalid expression: missing operand for unary operator");
      }
      const a = stack.pop();
      stack.push(token.value === "u-" ? -a : a);
      continue;
    }

    // Binary operators: two operands
    if (stack.length < 2) {
      throw new Error(`Invalid expression: missing operand for "${token.value}"`);
    }

    const b = stack.pop();
    const a = stack.pop();

    switch (token.value) {
      case "+":
        stack.push(a + b);
        break;
      case "-":
        stack.push(a - b);
        break;
      case "*":
        stack.push(a * b);
        break;
      case "/":
        if (b === 0) throw new Error("Division by zero is not allowed");
        stack.push(a / b);
        break;
      case "%":
        if (b === 0) throw new Error("Division by zero is not allowed");
        stack.push(a % b);
        break;
      case "^":
        stack.push(Math.pow(a, b));
        break;
      default:
        throw new Error(`Unknown operator: "${token.value}"`);
    }
  }

  // A valid expression always collapses to exactly one number
  if (stack.length !== 1) {
    throw new Error("Invalid expression: check for missing operators or operands");
  }

  const result = stack[0];

  if (!isFinite(result)) {
    throw new Error("Result is not a finite number (overflow or invalid operation)");
  }

  return result;
}

//extra 
function validateTokenSequence(tokens) {
  if (tokens.length === 0) {
    throw new Error("Empty expression");
  }

  let parenDepth = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const prev = tokens[i - 1];

    if (token.type === "paren" && token.value === "(") parenDepth++;
    if (token.type === "paren" && token.value === ")") {
      parenDepth--;
      if (parenDepth < 0) {
        throw new Error("Mismatched parentheses: extra ')' found");
      }
    }

    // Two numbers in a row with nothing between them: "3 4"
    if (token.type === "number" && prev && prev.type === "number") {
      throw new Error("Invalid expression: two numbers in a row without an operator");
    }

    // Two binary operators in a row: "3 + * 4" (unary +/- is allowed after an operator)
    if (
      token.type === "operator" &&
      prev &&
      prev.type === "operator"
    ) {
      const isUnaryAllowed = token.value === "+" || token.value === "-";
      if (!isUnaryAllowed) {
        throw new Error(`Invalid expression: "${prev.value}${token.value}" is not allowed`);
      }
    }

    // Empty parentheses: "()"
    if (
      token.type === "paren" &&
      token.value === ")" &&
      prev &&
      prev.type === "paren" &&
      prev.value === "("
    ) {
      throw new Error("Invalid expression: empty parentheses '()'");
    }
  }

  if (parenDepth !== 0) {
    throw new Error("Mismatched parentheses: missing ')'");
  }

  // Expression cannot end on an operator: "3 +"
  const last = tokens[tokens.length - 1];
  if (last.type === "operator") {
    throw new Error("Invalid expression: cannot end with an operator");
  }

  // Expression cannot start with a binary-only operator like * / % ^
  const first = tokens[0];
  if (first.type === "operator" && !["+", "-"].includes(first.value)) {
    throw new Error(`Invalid expression: cannot start with "${first.value}"`);
  }
}


function calculate(expression) {
  const rawTokens = tokenize(expression);          // string -> tokens
  validateTokenSequence(rawTokens);                 // catch structural mistakes early
  const tokens = markUnaryOperators(rawTokens);      // fix unary +/-
  const postfix = toPostfix(tokens);                 // shunting yard: infix -> postfix
  const result = evaluatePostfix(postfix);           // postfix -> final number
  return result;
}



