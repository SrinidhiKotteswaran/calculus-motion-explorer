export type Ast =
  | { type: 'num'; value: number }
  | { type: 'var'; name: string }
  | { type: 'const'; name: string; value: number }
  | { type: 'binop'; op: '+' | '-' | '*' | '/' | '^'; left: Ast; right: Ast }
  | { type: 'neg'; arg: Ast }
  | { type: 'call'; name: string; arg: Ast }
  | { type: 'abs'; arg: Ast };

export const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const FUNCS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sec: (x) => 1 / Math.cos(x),
  csc: (x) => 1 / Math.sin(x),
  cot: (x) => 1 / Math.tan(x),
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  ln: Math.log,
  log: (x) => Math.log(x) / Math.LN10,
  sqrt: Math.sqrt,
};

const KNOWN_FUNCS = new Set(Object.keys(FUNCS));

class ParseError extends Error {}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  input = input.replace(/\s+/g, '');
  while (i < input.length) {
    const c = input[i];
    if (/[0-9.]/.test(c)) {
      let num = '';
      while (i < input.length && /[0-9.]/.test(input[i])) num += input[i++];
      if (input[i] === '.') {
        num += input[i++];
        while (i < input.length && /[0-9.]/.test(input[i])) num += input[i++];
      }
      if (input[i] === 'e' || input[i] === 'E') {
        let j = i + 1;
        if (input[j] === '+' || input[j] === '-') j++;
        if (/[0-9]/.test(input[j] || '')) {
          num += input[i++];
          while (i < input.length && /[0-9+\-]/.test(input[i]) && (input[i] !== 'e' && input[i] !== 'E')) {
            // stop at next letter
            if (/[a-zA-Z]/.test(input[i])) break;
            num += input[i++];
          }
        }
      }
      tokens.push(num);
    } else if (/[a-zA-Z]/.test(c)) {
      let name = '';
      while (i < input.length && /[a-zA-Z]/.test(input[i])) name += input[i++];
      tokens.push(name);
    } else if ('+-*/^()|'.includes(c)) {
      tokens.push(c);
      i++;
    } else {
      throw new ParseError(`Unexpected character: ${c}`);
    }
  }
  return tokens;
}

class Parser {
  tokens: string[];
  pos = 0;
  constructor(tokens: string[]) {
    this.tokens = tokens;
  }
  peek() {
    return this.tokens[this.pos];
  }
  consume() {
    return this.tokens[this.pos++];
  }
  parse(): Ast {
    const result = this.parseExpr();
    if (this.pos < this.tokens.length) throw new ParseError(`Unexpected token: ${this.peek()}`);
    return result;
  }
  parseExpr(): Ast {
    let left = this.parseTerm();
    while (this.peek() === '+' || this.peek() === '-') {
      const op = this.consume() as '+' | '-';
      const right = this.parseTerm();
      left = { type: 'binop', op, left, right };
    }
    return left;
  }
  parseTerm(): Ast {
    let left = this.parseFactor();
    while (true) {
      const t = this.peek();
      if (t === '*') {
        this.consume();
        left = { type: 'binop', op: '*', left, right: this.parseFactor() };
      } else if (t === '/') {
        this.consume();
        left = { type: 'binop', op: '/', left, right: this.parseFactor() };
      } else if (t && !'+-*/)^|'.includes(t) && t !== undefined) {
        // implicit multiplication: number, variable, function, or open paren
        left = { type: 'binop', op: '*', left, right: this.parseFactor() };
      } else {
        break;
      }
    }
    return left;
  }
  parseFactor(): Ast {
    let left = this.parseUnary();
    while (this.peek() === '^') {
      this.consume();
      const right = this.parseUnary();
      left = { type: 'binop', op: '^', left, right };
    }
    return left;
  }
  parseUnary(): Ast {
    if (this.peek() === '-') {
      this.consume();
      return { type: 'neg', arg: this.parseUnary() };
    }
    if (this.peek() === '+') {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePrimary();
  }
  parsePrimary(): Ast {
    const t = this.peek();
    if (t === '(') {
      this.consume();
      const expr = this.parseExpr();
      if (this.consume() !== ')') throw new ParseError('Expected )');
      return expr;
    }
    if (t === '|') {
      this.consume();
      const expr = this.parseExpr();
      if (this.consume() !== '|') throw new ParseError('Expected |');
      return { type: 'abs', arg: expr };
    }
    if (t === undefined) throw new ParseError('Unexpected end of input');
    if (/^[0-9.]/.test(t)) {
      this.consume();
      return { type: 'num', value: parseFloat(t) };
    }
    if (KNOWN_FUNCS.has(t)) {
      this.consume();
      if (this.consume() !== '(') throw new ParseError(`Expected ( after ${t}`);
      const arg = this.parseExpr();
      if (this.consume() !== ')') throw new ParseError('Expected )');
      return { type: 'call', name: t, arg };
    }
    if (t in CONSTANTS) {
      this.consume();
      return { type: 'const', name: t, value: CONSTANTS[t] };
    }
    if (/^[a-zA-Z]$/.test(t)) {
      this.consume();
      return { type: 'var', name: t };
    }
    throw new ParseError(`Unexpected token: ${t}`);
  }
}

export function parse(input: string): Ast {
  const tokens = tokenize(input);
  if (tokens.length === 0) throw new ParseError('Empty expression');
  return new Parser(tokens).parse();
}

export function evaluate(ast: Ast, vars: Record<string, number> = {}): number {
  switch (ast.type) {
    case 'num':
      return ast.value;
    case 'var':
      if (ast.name in vars) return vars[ast.name];
      throw new Error(`Undefined variable: ${ast.name}`);
    case 'const':
      return ast.value;
    case 'binop': {
      const l = evaluate(ast.left, vars);
      const r = evaluate(ast.right, vars);
      switch (ast.op) {
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return l / r;
        case '^': return Math.pow(l, r);
      }
      break;
    }
    case 'neg':
      return -evaluate(ast.arg, vars);
    case 'abs':
      return Math.abs(evaluate(ast.arg, vars));
    case 'call': {
      const fn = FUNCS[ast.name];
      if (!fn) throw new Error(`Unknown function: ${ast.name}`);
      return fn(evaluate(ast.arg, vars));
    }
  }
}

export function makeEvaluator(ast: Ast): (t: number) => number {
  return (t: number) => {
    try {
      return evaluate(ast, { t });
    } catch {
      return NaN;
    }
  };
}

// Symbolic differentiation
export function differentiate(ast: Ast, varName = 't'): Ast {
  switch (ast.type) {
    case 'num':
    case 'const':
      return { type: 'num', value: 0 };
    case 'var':
      return ast.name === varName ? { type: 'num', value: 1 } : { type: 'num', value: 0 };
    case 'neg':
      return { type: 'neg', arg: differentiate(ast.arg, varName) };
    case 'abs':
      // d/dt|f| = f'*f/|f|, but simplify to sign(f)*f'
      return mul(
        div(ast.arg, abs(ast.arg)),
        differentiate(ast.arg, varName)
      );
    case 'binop': {
      switch (ast.op) {
        case '+':
          return add(diff(ast.left), diff(ast.right));
        case '-':
          return sub(diff(ast.left), diff(ast.right));
        case '*':
          return add(mul(diff(ast.left), ast.right), mul(ast.left, diff(ast.right)));
        case '/':
          return div(
            sub(mul(diff(ast.left), ast.right), mul(ast.left, diff(ast.right))),
            pow(ast.right, { type: 'num', value: 2 })
          );
        case '^': {
          // If right is constant: d/dt(f^c) = c * f^(c-1) * f'
          if (ast.right.type === 'num' || ast.right.type === 'const') {
            const c = ast.right.type === 'num' ? ast.right.value : ast.right.value;
            return mul(
              mul(num(c), pow(ast.left, num(c - 1))),
              diff(ast.left)
            );
          }
          // General: d/dt(f^g) = f^g * (g'*ln(f) + g*f'/f)
          return mul(
            ast,
            add(
              mul(diff(ast.right), ln(ast.left)),
              mul(ast.right, div(diff(ast.left), ast.left))
            )
          );
        }
      }
      break;
    }
    case 'call': {
      const f = ast.arg;
      const df = differentiate(f, varName);
      const rules: Record<string, Ast> = {
        sin: cos(f),
        cos: neg(sin(f)),
        tan: div(num(1), pow(cos(f), num(2))),
        sec: mul(sec(f), tan(f)),
        csc: mul(neg(csc(f)), cot(f)),
        cot: neg(pow(csc(f), num(2))),
        asin: div(num(1), sqrt(sub(num(1), pow(f, num(2))))),
        acos: div(neg(num(1)), sqrt(sub(num(1), pow(f, num(2))))),
        atan: div(num(1), add(num(1), pow(f, num(2)))),
        sinh: cosh(f),
        cosh: sinh(f),
        tanh: div(num(1), pow(cosh(f), num(2))),
        exp: exp(f),
        ln: div(num(1), f),
        log: div(num(1), mul(f, num(Math.LN10))),
        sqrt: div(num(1), mul(num(2), sqrt(f))),
      };
      const rule = rules[ast.name];
      if (!rule) throw new Error(`Cannot differentiate: ${ast.name}`);
      return mul(rule, df);
    }
  }
  throw new Error('Cannot differentiate');
}

function diff(ast: Ast): Ast {
  return differentiate(ast);
}

// Simplification
export function simplify(ast: Ast): Ast {
  switch (ast.type) {
    case 'num':
    case 'var':
    case 'const':
      return ast;
    case 'neg': {
      const a = simplify(ast.arg);
      if (a.type === 'num') return num(-a.value);
      if (a.type === 'neg') return a.arg;
      return { type: 'neg', arg: a };
    }
    case 'abs': {
      const a = simplify(ast.arg);
      if (a.type === 'num') return num(Math.abs(a.value));
      return { type: 'abs', arg: a };
    }
    case 'binop': {
      const l = simplify(ast.left);
      const r = simplify(ast.right);
      const lv = l.type === 'num' ? l.value : null;
      const rv = r.type === 'num' ? r.value : null;
      switch (ast.op) {
        case '+':
          if (lv === 0) return r;
          if (rv === 0) return l;
          if (lv !== null && rv !== null) return num(lv + rv);
          return { type: 'binop', op: '+', left: l, right: r };
        case '-':
          if (rv === 0) return l;
          if (lv === 0) return simplify({ type: 'neg', arg: r });
          if (lv !== null && rv !== null) return num(lv - rv);
          return { type: 'binop', op: '-', left: l, right: r };
        case '*':
          if (lv === 0 || rv === 0) return num(0);
          if (lv === 1) return r;
          if (rv === 1) return l;
          if (lv === -1) return simplify({ type: 'neg', arg: r });
          if (rv === -1) return simplify({ type: 'neg', arg: l });
          if (lv !== null && rv !== null) return num(lv * rv);
          return { type: 'binop', op: '*', left: l, right: r };
        case '/':
          if (lv === 0) return num(0);
          if (rv === 1) return l;
          if (rv === -1) return simplify({ type: 'neg', arg: l });
          if (lv !== null && rv !== null && rv !== 0) return num(lv / rv);
          return { type: 'binop', op: '/', left: l, right: r };
        case '^':
          if (rv === 0) return num(1);
          if (rv === 1) return l;
          if (lv === 0) return num(0);
          if (lv === 1) return num(1);
          if (lv !== null && rv !== null) return num(Math.pow(lv, rv));
          return { type: 'binop', op: '^', left: l, right: r };
      }
      break;
    }
    case 'call': {
      const a = simplify(ast.arg);
      if (a.type === 'num') {
        const fn = FUNCS[ast.name];
        if (fn) {
          const v = fn(a.value);
          if (isFinite(v)) return num(v);
        }
      }
      return { type: 'call', name: ast.name, arg: a };
    }
  }
  return ast;
}

// AST constructors
export function num(n: number): Ast { return { type: 'num', value: n }; }
export function add(l: Ast, r: Ast): Ast { return { type: 'binop', op: '+', left: l, right: r }; }
export function sub(l: Ast, r: Ast): Ast { return { type: 'binop', op: '-', left: l, right: r }; }
export function mul(l: Ast, r: Ast): Ast { return { type: 'binop', op: '*', left: l, right: r }; }
export function div(l: Ast, r: Ast): Ast { return { type: 'binop', op: '/', left: l, right: r }; }
export function pow(l: Ast, r: Ast): Ast { return { type: 'binop', op: '^', left: l, right: r }; }
export function neg(a: Ast): Ast { return { type: 'neg', arg: a }; }
export function abs(a: Ast): Ast { return { type: 'abs', arg: a }; }
export function sin(a: Ast): Ast { return { type: 'call', name: 'sin', arg: a }; }
export function cos(a: Ast): Ast { return { type: 'call', name: 'cos', arg: a }; }
export function tan(a: Ast): Ast { return { type: 'call', name: 'tan', arg: a }; }
export function sec(a: Ast): Ast { return { type: 'call', name: 'sec', arg: a }; }
export function csc(a: Ast): Ast { return { type: 'call', name: 'csc', arg: a }; }
export function cot(a: Ast): Ast { return { type: 'call', name: 'cot', arg: a }; }
export function exp(a: Ast): Ast { return { type: 'call', name: 'exp', arg: a }; }
export function ln(a: Ast): Ast { return { type: 'call', name: 'ln', arg: a }; }
export function sqrt(a: Ast): Ast { return { type: 'call', name: 'sqrt', arg: a }; }
export function sinh(a: Ast): Ast { return { type: 'call', name: 'sinh', arg: a }; }
export function cosh(a: Ast): Ast { return { type: 'call', name: 'cosh', arg: a }; }

// LaTeX rendering
export function toLatex(ast: Ast): string {
  switch (ast.type) {
    case 'num':
      return formatNum(ast.value);
    case 'var':
      return ast.name;
    case 'const':
      return ast.name === 'pi' ? '\\pi' : 'e';
    case 'neg':
      return `-${toLatex(ast.arg)}`;
    case 'abs':
      return `\\left|${toLatex(ast.arg)}\\right|`;
    case 'binop': {
      const l = toLatex(ast.left);
      const r = toLatex(ast.right);
      switch (ast.op) {
        case '+': return `${l} + ${r}`;
        case '-': return `${l} - ${r}`;
        case '*': return `${l} \\cdot ${r}`;
        case '/': return `\\frac{${l}}{${r}}`;
        case '^': {
          const lb = needsParens(ast.left) ? `\\left(${l}\\right)` : l;
          return `${lb}^{${r}}`;
        }
      }
      break;
    }
    case 'call': {
      const arg = toLatex(ast.arg);
      const names: Record<string, string> = {
        sin: '\\sin', cos: '\\cos', tan: '\\tan',
        sec: '\\sec', csc: '\\csc', cot: '\\cot',
        asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan',
        sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh',
        exp: 'e', ln: '\\ln', log: '\\log', sqrt: '\\sqrt',
      };
      const name = names[ast.name] || ast.name;
      if (ast.name === 'exp') return `e^{${arg}}`;
      if (ast.name === 'sqrt') return `\\sqrt{${arg}}`;
      return `${name}\\left(${arg}\\right)`;
    }
  }
  return '';
}

function needsParens(ast: Ast): boolean {
  return ast.type === 'binop' && (ast.op === '+' || ast.op === '-');
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 10000) / 10000);
}

// Nth derivative
export function nthDerivative(ast: Ast, n: number): Ast {
  let result = ast;
  for (let i = 0; i < n; i++) {
    result = simplify(differentiate(result));
  }
  return result;
}

// Domain detection: find points where function is undefined in [a, b]
export function findDiscontinuities(fn: (t: number) => number, a: number, b: number, steps = 2000): number[] {
  const disc: number[] = [];
  const dt = (b - a) / steps;
  let prev = fn(a);
  let prevT = a;
  for (let i = 1; i <= steps; i++) {
    const t = a + i * dt;
    const val = fn(t);
    if (isNaN(val) || !isFinite(val)) {
      disc.push(t);
    } else if (isFinite(prev) && !isNaN(prev)) {
      // Check for large jumps (potential asymptotes/discontinuities)
      if (Math.abs(val - prev) > 1000 * Math.max(1, Math.abs(prev))) {
        disc.push((prevT + t) / 2);
      }
    }
    prev = val;
    prevT = t;
  }
  return disc;
}
