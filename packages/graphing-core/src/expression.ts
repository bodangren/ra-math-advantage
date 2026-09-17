/** Evaluates the real-valued expression forms used in course graphs. */
export function evaluateRealExpression(input: string, x: number): number {
  const source = input.toLowerCase().replace(/^\s*(?:y|[a-z]\([xt]\))\s*[=≈]\s*/, '')
    .replace(/\s+/g, '').replace(/−/g, '-').replace(/π/g, 'pi').replace(/²/g, '^2').replace(/³/g, '^3');
  if (!source || source.length > 1000) return Number.NaN;
  const tokens = source.match(/(?:\d+(?:\.\d*)?|\.\d+)|[a-z]+|[()+\-*/^]/g) ?? [];
  if (tokens.join('') !== source) return Number.NaN;
  let position = 0;
  const functions: Record<string, (value: number) => number> = {
    sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, sin: Math.sin,
    cos: Math.cos, tan: Math.tan, ln: Math.log, log: Math.log10, exp: Math.exp,
  };
  function atom(): number {
    const token = tokens[position++];
    if (token === '(') {
      const value = sum();
      if (tokens[position++] !== ')') throw new Error('Missing parenthesis');
      return value;
    }
    if (token === 'x' || token === 't') return x;
    if (token === 'pi') return Math.PI;
    if (token === 'e') return Math.E;
    if (Object.hasOwn(functions, token)) {
      if (tokens[position++] !== '(') throw new Error('Missing function argument');
      const value = sum();
      if (tokens[position++] !== ')') throw new Error('Missing parenthesis');
      return functions[token](value);
    }
    if (token && /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) return Number(token);
    throw new Error('Unsupported expression');
  }
  function power(): number {
    const value = atom();
    if (tokens[position] !== '^') return value;
    position++;
    return value ** unary();
  }
  function unary(): number {
    if (tokens[position] === '+') { position++; return unary(); }
    if (tokens[position] === '-') { position++; return -unary(); }
    return power();
  }
  function product(): number {
    let value = unary();
    while (position < tokens.length) {
      const token = tokens[position];
      if (token === '*' || token === '/') {
        position++;
        const right = unary();
        value = token === '*' ? value * right : value / right;
      } else if (token === '(' || /^[a-z]/.test(token)) {
        value *= unary();
      } else break;
    }
    return value;
  }
  function sum(): number {
    let value = product();
    while (tokens[position] === '+' || tokens[position] === '-') {
      const operator = tokens[position++];
      const right = product();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }
  try {
    const value = sum();
    return position === tokens.length && Number.isFinite(value) ? value : Number.NaN;
  } catch { return Number.NaN; }
}
