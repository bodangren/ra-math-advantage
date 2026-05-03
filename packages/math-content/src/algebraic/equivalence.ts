/**
 * Expression Equivalence Validator
 *
 * This module provides pattern-matching based equivalence checking for
 * algebraic expressions commonly encountered in Integrated Math courses.
 *
 * Note: For production use with arbitrary mathematical expressions,
 * consider integrating a symbolic math library like math.js or algebra.js.
 */

/**
 * Normalizes an expression for comparison by:
 * - Converting to lowercase
 * - Removing all whitespace
 * - Standardizing operators (collapsing repeated operators)
 * - Removing unnecessary multiplication symbols
 * - Removing implicit coefficients (1x -> x)
 * - Handling edge cases with parentheses
 */
export function normalizeExpression(expr: string): string {
  if (!expr || expr.trim() === '') return '';

  return expr
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\++/g, '+')
    .replace(/-+/g, '-')
    .replace(/\*/g, '')
    .replace(/\(\+/g, '(')
    .replace(/\(-/g, '(-')
    .replace(/(^|\+)1x/g, '$1x')
    .replace(/-1x/g, '-x');
}

/**
 * Checks if two algebraic expressions are equivalent.
 */
export function checkEquivalence(expr1: string, expr2: string): boolean {
  const normalized1 = normalizeExpression(expr1);
  const normalized2 = normalizeExpression(expr2);

  if (normalized1 === '' && normalized2 === '') return true;
  if (normalized1 === '' || normalized2 === '') return false;
  if (normalized1 === normalized2) return true;
  if (checkRearrangedTerms(normalized1, normalized2)) return true;
  if (checkPolynomialEquivalence(normalized1, normalized2)) return true;
  if (checkComplexNumberEquivalence(normalized1, normalized2)) return true;
  if (checkFractionEquivalence(normalized1, normalized2)) return true;
  if (checkRadicalEquivalence(normalized1, normalized2)) return true;

  return false;
}

function checkRearrangedTerms(expr1: string, expr2: string): boolean {
  const splitTerms = (expr: string) => {
    const terms = expr.split(/(?=[+-])/).filter(t => t.trim() !== '');
    return terms.map(t => {
      t = t.trim();
      return t.startsWith('+') || t.startsWith('-') ? t : '+' + t;
    }).sort();
  };

  const terms1 = splitTerms(expr1);
  const terms2 = splitTerms(expr2);

  if (terms1.length !== terms2.length) return false;
  return JSON.stringify(terms1) === JSON.stringify(terms2);
}

function checkPolynomialEquivalence(expr1: string, expr2: string): boolean {
  const expanded1 = expandPolynomial(expr1);
  const expanded2 = expandPolynomial(expr2);
  if (expanded1 === expanded2) return true;

  const factored1 = factorPolynomial(expr1);
  const factored2 = factorPolynomial(expr2);
  if (factored1 === factored2) return true;

  if (expanded1 === expr2) return true;
  if (expanded2 === expr1) return true;
  if (factored1 === expr2) return true;
  if (factored2 === expr1) return true;

  return false;
}

function expandPolynomial(expr: string): string {
  const perfectSquarePattern = /\(x([+-])(\d*\.?\d*)\)\^2/;
  const psMatch = expr.match(perfectSquarePattern);
  if (psMatch) {
    const sign = psMatch[1];
    const a = parseFloat(psMatch[2]) || 0;
    const num = sign === '-' ? -a : a;

    const sum = 2 * num;
    const product = num * num;

    let sumStr = '';
    if (sum !== 0) {
      const absSum = Math.abs(sum);
      const signStr = sum >= 0 ? '+' : '-';
      sumStr = sum === 1 ? '+x' : sum === -1 ? '-x' : `${signStr}${absSum}x`;
    }

    const productStr = product === 0 ? '' : product >= 0 ? `+${product}` : `${product}`;
    return `x^2${sumStr}${productStr}`;
  }

  const factoredPattern = /\(x([+-])(\d*\.?\d*)\)\(x([+-])(\d*\.?\d*)\)/;
  const match = expr.match(factoredPattern);
  if (match) {
    const sign1 = match[1];
    const a = parseFloat(match[2]) || 0;
    const sign2 = match[3];
    const b = parseFloat(match[4]) || 0;

    const num1 = sign1 === '-' ? -a : a;
    const num2 = sign2 === '-' ? -b : b;

    const sum = num1 + num2;
    const product = num1 * num2;

    let sumStr = '';
    if (sum !== 0) {
      const absSum = Math.abs(sum);
      const sign = sum >= 0 ? '+' : '-';
      sumStr = sum === 1 ? '+x' : sum === -1 ? '-x' : `${sign}${absSum}x`;
    }

    const productStr = product === 0 ? '' : product >= 0 ? `+${product}` : `${product}`;
    return `x^2${sumStr}${productStr}`;
  }

  const factoredPattern4 = /\(([+-]?\d*\.?\d*)x\+?([+-]?\d*\.?\d*)\)\(([+-]?\d*\.?\d*)x\+?([+-]?\d*\.?\d*)\)/;
  const match4 = expr.match(factoredPattern4);
  if (match4) {
    const parseCoeff = (s: string, fallback: number) => {
      if (s === '' || s === '+') return fallback;
      if (s === '-') return -fallback;
      return parseFloat(s) || fallback;
    };
    const a = parseCoeff(match4[1], 1);
    const b = parseFloat(match4[2]) || 0;
    const c = parseCoeff(match4[3], 1);
    const d = parseFloat(match4[4]) || 0;
    const ac = a * c;
    const adbc = a * d + b * c;
    const bd = b * d;
    const acStr = ac === 1 ? 'x^2' : ac === -1 ? '-x^2' : `${ac}x^2`;
    const adbcStr = adbc === 0 ? '' : adbc >= 0 ? `+${adbc}x` : `${adbc}x`;
    const bdStr = bd === 0 ? '' : bd >= 0 ? `+${bd}` : `${bd}`;
    return `${acStr}${adbcStr}${bdStr}`;
  }

  return expr;
}

function factorPolynomial(expr: string): string {
  const expandedPattern1 = /x\^2\+?(\-?\d*\.?\d*)x\+?(\-?\d*\.?\d*)/;
  const match1 = expr.match(expandedPattern1);
  if (match1) {
    const b = parseFloat(match1[1]) || 0;
    const c = parseFloat(match1[2]) || 0;
    const factors = findFactors(c);
    for (let i = 0; i < factors.length; i++) {
      for (let j = 0; j < factors.length; j++) {
        if (factors[i] + factors[j] === b) {
          const aStr = factors[i] >= 0 ? `+${factors[i]}` : `${factors[i]}`;
          const bStr = factors[j] >= 0 ? `+${factors[j]}` : `${factors[j]}`;
          return `(x${aStr})(x${bStr})`;
        }
      }
    }
  }

  const expandedPattern2 = /x\^2\-(\d*\.?\d*)x\+?(\-?\d*\.?\d*)/;
  const match2 = expr.match(expandedPattern2);
  if (match2) {
    const b = parseFloat(match2[1]) || 0;
    const c = parseFloat(match2[2]) || 0;
    const factors = findFactors(c);
    for (let i = 0; i < factors.length; i++) {
      for (let j = 0; j < factors.length; j++) {
        if (-factors[i] - factors[j] === -b) {
          const aStr = factors[i] >= 0 ? `-${factors[i]}` : `+${Math.abs(factors[i])}`;
          const bStr = factors[j] >= 0 ? `-${factors[j]}` : `+${Math.abs(factors[j])}`;
          return `(x${aStr})(x${bStr})`;
        }
      }
    }
  }

  const expandedPattern3 = /x\^2\+?(\-?\d*\.?\d*)x\-(\d*\.?\d*)/;
  const match3 = expr.match(expandedPattern3);
  if (match3) {
    const b = parseFloat(match3[1]) || 0;
    const c = parseFloat(match3[2]) || 0;
    const factors = findFactors(c);
    for (let i = 0; i < factors.length; i++) {
      for (let j = 0; j < factors.length; j++) {
        if (factors[i] - factors[j] === b) {
          const aStr = factors[i] >= 0 ? `+${factors[i]}` : `${factors[i]}`;
          const bStr = factors[j] >= 0 ? `-${factors[j]}` : `+${Math.abs(factors[j])}`;
          return `(x${aStr})(x${bStr})`;
        }
      }
    }
  }

  const gcfPattern = /(\d+)x\^2\+?(\-?\d*\.?\d*)x\+?(\-?\d*\.?\d*)/;
  const match4 = expr.match(gcfPattern);
  if (match4) {
    const a = parseInt(match4[1], 10);
    const b = parseFloat(match4[2]) || 0;
    const c = parseFloat(match4[3]) || 0;
    if (b % a === 0 && c % a === 0) {
      const newB = b / a;
      const newC = c / a;
      const remaining = `x^2${newB >= 0 ? `+${newB}x` : `${newB}x`}${newC >= 0 ? `+${newC}` : `${newC}`}`;
      return `${a}(${remaining})`;
    }
  }

  return expr;
}

function findFactors(n: number): number[] {
  const factors: number[] = [];
  const absN = Math.abs(n);

  for (let i = 1; i <= Math.sqrt(absN); i++) {
    if (absN % i === 0) {
      factors.push(i);
      factors.push(-i);
      if (i !== absN / i) {
        factors.push(absN / i);
        factors.push(-absN / i);
      }
    }
  }

  return factors.sort((a, b) => a - b);
}

function checkComplexNumberEquivalence(expr1: string, expr2: string): boolean {
  const complexPattern = /([+-]?\d*\.?\d*)\*?i\+?([+-]?\d*\.?\d*)|([+-]?\d*\.?\d*)\+?([+-]?\d*\.?\d*)\*?i/;

  const parseComplex = (expr: string) => {
    const match = expr.match(complexPattern);
    if (!match) return null;

    let real = 0;
    let imag = 0;

    if (match[1] !== undefined && match[2] !== undefined) {
      imag = parseFloat(match[1]) || (match[1]?.startsWith('-') ? -1 : 1);
      real = parseFloat(match[2]) || 0;
    } else if (match[3] !== undefined && match[4] !== undefined) {
      real = parseFloat(match[3]) || 0;
      imag = parseFloat(match[4]) || (match[4]?.startsWith('-') ? -1 : 1);
    }

    return { real, imag };
  };

  const c1 = parseComplex(expr1);
  const c2 = parseComplex(expr2);

  if (!c1 || !c2) return false;
  return c1.real === c2.real && c1.imag === c2.imag;
}

function checkFractionEquivalence(expr1: string, expr2: string): boolean {
  const fractionPattern = /(\d+)\s*(\d+\/\d+)|(\d+)\/(\d+)/;

  const parseFraction = (expr: string) => {
    const match = expr.match(fractionPattern);
    if (!match) return null;

    if (match[1] !== undefined && match[2] !== undefined) {
      const whole = parseInt(match[1], 10);
      const [num, den] = match[2].split('/').map(Number);
      return { value: (whole * den + num) / den, numerator: whole * den + num, denominator: den };
    } else if (match[3] !== undefined && match[4] !== undefined) {
      const num = parseInt(match[3], 10);
      const den = parseInt(match[4], 10);
      return { value: num / den, numerator: num, denominator: den };
    }

    return null;
  };

  const fractionAdditionPattern = /(\d+)\/(\d+)\+(\d+)\/(\d+)/;
  const parseFractionAddition = (expr: string) => {
    const match = expr.match(fractionAdditionPattern);
    if (!match) return null;

    const num1 = parseInt(match[1], 10);
    const den1 = parseInt(match[2], 10);
    const num2 = parseInt(match[3], 10);
    const den2 = parseInt(match[4], 10);

    const commonDen = den1 * den2;
    const newNum = num1 * den2 + num2 * den1;
    return { value: newNum / commonDen, numerator: newNum, denominator: commonDen };
  };

  const algebraicFractionPattern = /\((\d+)\/(\d+)\)x\+?(\-?\d*\.?\d*)/;
  const parseAlgebraicFraction = (expr: string) => {
    const match = expr.match(algebraicFractionPattern);
    if (!match) return null;

    const num = parseInt(match[1], 10);
    const den = parseInt(match[2], 10);
    const constant = parseFloat(match[3]) || 0;
    return { value: (num / den) + constant, isAlgebraic: true };
  };

  const f1 = parseFractionAddition(expr1) || parseAlgebraicFraction(expr1) || parseFraction(expr1);
  const f2 = parseFractionAddition(expr2) || parseAlgebraicFraction(expr2) || parseFraction(expr2);

  if (!f1 || !f2) return false;

  const f1IsAlgebraic = 'isAlgebraic' in f1 && f1.isAlgebraic;
  const f2IsAlgebraic = 'isAlgebraic' in f2 && f2.isAlgebraic;

  if (f1IsAlgebraic || f2IsAlgebraic) {
    return Math.abs(f1.value - f2.value) < 0.0001;
  }

  return Math.abs(f1.value - f2.value) < 0.0001;
}

function checkRadicalEquivalence(expr1: string, expr2: string): boolean {
  const integerPattern = /^-?\d+$/;
  if (integerPattern.test(expr1) && integerPattern.test(expr2)) {
    return parseInt(expr1, 10) === parseInt(expr2, 10);
  }

  const cubeRootPattern = /³√(\d+)/;
  const parseCubeRoot = (expr: string) => {
    const match = expr.match(cubeRootPattern);
    if (!match) return null;
    const radicand = parseInt(match[1], 10);
    return { value: Math.cbrt(radicand) };
  };

  const parseRadical = (expr: string) => {
    if (expr.includes('³√')) return null;

    const radicalPattern = /(\d*)\*?√(\d+)|√(\d+)/;
    const match = expr.match(radicalPattern);
    if (!match) return null;

    let coefficient = 1;
    let radicand = 0;

    if (match[1] !== undefined && match[2] !== undefined) {
      coefficient = parseInt(match[1], 10) || 1;
      radicand = parseInt(match[2], 10);
    } else if (match[3] !== undefined) {
      radicand = parseInt(match[3], 10);
    }

    return { coefficient, radicand, value: coefficient * Math.sqrt(radicand) };
  };

  const radicalAdditionPattern = /(\d*)√(\d+)\+(\d*)√(\d+)/;
  const parseRadicalAddition = (expr: string) => {
    const match = expr.match(radicalAdditionPattern);
    if (!match) return null;

    const coeff1 = parseInt(match[1], 10) || 1;
    const rad1 = parseInt(match[2], 10);
    const coeff2 = parseInt(match[3], 10) || 1;
    const rad2 = parseInt(match[4], 10);

    if (rad1 !== rad2) return null;

    const totalCoeff = coeff1 + coeff2;
    return { value: totalCoeff * Math.sqrt(rad1) };
  };

  const r1 = parseCubeRoot(expr1) || parseRadicalAddition(expr1) || parseRadical(expr1);
  const r2 = parseCubeRoot(expr2) || parseRadicalAddition(expr2) || parseRadical(expr2);

  if (!r1 || !r2) {
    const int1 = integerPattern.test(expr1) ? parseInt(expr1, 10) : null;
    const int2 = integerPattern.test(expr2) ? parseInt(expr2, 10) : null;

    if (int1 !== null) {
      const rad = parseCubeRoot(expr2) || parseRadical(expr2);
      if (rad) return Math.abs(int1 - rad.value) < 0.0001;
    }

    if (int2 !== null) {
      const rad = parseCubeRoot(expr1) || parseRadical(expr1);
      if (rad) return Math.abs(int2 - rad.value) < 0.0001;
    }

    return false;
  }

  return Math.abs(r1.value - r2.value) < 0.0001;
}
