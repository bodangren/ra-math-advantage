/**
 * Expression Equivalence Validator for Module 1 Algebra
 * 
 * This module provides pattern-matching based equivalence checking for
 * algebraic expressions commonly encountered in Integrated Math 3, Module 1.
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
 * 
 * This function uses pattern matching to determine equivalence for common cases:
 * - Identical expressions (after normalization)
 * - Factored vs expanded forms of polynomials
 * - Complex numbers, fractions, and radicals (basic handling)
 * - Rearranged terms (commutative addition/multiplication)
 * 
 * @param expr1 First expression to compare
 * @param expr2 Second expression to compare
 * @returns true if expressions are equivalent, false otherwise
 */
export function checkEquivalence(expr1: string, expr2: string): boolean {
  const normalized1 = normalizeExpression(expr1);
  const normalized2 = normalizeExpression(expr2);

  // Handle empty strings
  if (normalized1 === '' && normalized2 === '') return true;
  if (normalized1 === '' || normalized2 === '') return false;

  // Check for exact match after normalization
  if (normalized1 === normalized2) return true;

  // Check for rearranged terms (commutative addition)
  if (checkRearrangedTerms(normalized1, normalized2)) return true;

  // Check for polynomial equivalence (factored vs expanded)
  if (checkPolynomialEquivalence(normalized1, normalized2)) return true;

  // Check for complex number equivalence
  if (checkComplexNumberEquivalence(normalized1, normalized2)) return true;

  // Check for fraction equivalence
  if (checkFractionEquivalence(normalized1, normalized2)) return true;

  // Check for radical equivalence
  if (checkRadicalEquivalence(normalized1, normalized2)) return true;

  return false;
}

/**
 * Checks if two expressions are equivalent by checking if their terms
 * can be rearranged to match (commutative property of addition).
 */
function checkRearrangedTerms(expr1: string, expr2: string): boolean {
  // Split expressions by + or - and compare the sets of terms
  const splitTerms = (expr: string) => {
    const terms = expr.split(/(?=[+-])/).filter(t => t.trim() !== '');
    return terms.map(t => t.trim()).sort();
  };
  
  const terms1 = splitTerms(expr1);
  const terms2 = splitTerms(expr2);
  
  if (terms1.length !== terms2.length) return false;
  
  return JSON.stringify(terms1) === JSON.stringify(terms2);
}

/**
 * Checks if two polynomial expressions are equivalent by comparing
 * factored and expanded forms.
 */
function checkPolynomialEquivalence(expr1: string, expr2: string): boolean {
  // Try to expand both expressions and compare
  const expanded1 = expandPolynomial(expr1);
  const expanded2 = expandPolynomial(expr2);

  if (expanded1 === expanded2) return true;

  // Try to factor both expressions and compare
  const factored1 = factorPolynomial(expr1);
  const factored2 = factorPolynomial(expr2);

  if (factored1 === factored2) return true;

  // Check if expanding one matches the other
  if (expanded1 === expr2) return true;
  if (expanded2 === expr1) return true;

  // Check if factoring one matches the other
  if (factored1 === expr2) return true;
  if (factored2 === expr1) return true;

  return false;
}

/**
 * Expands a factored polynomial expression.
 * 
 * This is a simplified implementation that handles common patterns from Module 1:
 * - (x + a)(x + b) -> x^2 + (a+b)x + ab
 * - (x - a)(x - b) -> x^2 - (a+b)x + ab
 * - (x + a)(x - b) -> x^2 + (a-b)x - ab
 * - (ax + b)(cx + d) -> acx^2 + (ad+bc)x + bd
 * 
 * For more complex polynomials, this returns the original expression.
 */
function expandPolynomial(expr: string): string {
  // Pattern: (x ± a)(x ± b) - handles all four sign combinations
  const factoredPattern = /\(x([+-])(\d*\.?\d*)\)\(x([+-])(\d*\.?\d*)\)/;
  const match = expr.match(factoredPattern);
  if (match) {
    const sign1 = match[1];
    const a = parseFloat(match[2]) || 0;
    const sign2 = match[3];
    const b = parseFloat(match[4]) || 0;

    // Convert to signed numbers
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

  // Pattern: (ax + b)(cx + d)
  const factoredPattern4 = /\((\d*\.?\d*)x\+?([+-]?\d*\.?\d*)\)\((\d*\.?\d*)x\+?([+-]?\d*\.?\d*)\)/;
  const match4 = expr.match(factoredPattern4);
  if (match4) {
    const a = parseFloat(match4[1]) || 1;
    const b = parseFloat(match4[2]) || 0;
    const c = parseFloat(match4[3]) || 1;
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

/**
 * Factors an expanded polynomial expression.
 * 
 * This is a simplified implementation that handles common patterns from Module 1.
 * For more complex polynomials, this returns the original expression.
 */
function factorPolynomial(expr: string): string {
  // Pattern: x^2 + bx + c
  const expandedPattern1 = /x\^2\+?(\-?\d*\.?\d*)x\+?(\-?\d*\.?\d*)/;
  const match1 = expr.match(expandedPattern1);
  if (match1) {
    const b = parseFloat(match1[1]) || 0;
    const c = parseFloat(match1[2]) || 0;
    
    // Try to find factors of c that sum to b
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

  // Pattern: x^2 - bx + c (both factors negative)
  const expandedPattern2 = /x\^2\-(\d*\.?\d*)x\+?(\-?\d*\.?\d*)/;
  const match2 = expr.match(expandedPattern2);
  if (match2) {
    const b = parseFloat(match2[1]) || 0;
    const c = parseFloat(match2[2]) || 0;
    
    // Try to find negative factors of c that sum to -b
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

  // Pattern: x^2 + bx - c (one positive, one negative)
  const expandedPattern3 = /x\^2\+?(\-?\d*\.?\d*)x\-(\d*\.?\d*)/;
  const match3 = expr.match(expandedPattern3);
  if (match3) {
    const b = parseFloat(match3[1]) || 0;
    const c = parseFloat(match3[2]) || 0;
    
    // Try to find factors where one is positive and one is negative
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

  // Pattern: ax^2 + bx + c (GCF factoring)
  const gcfPattern = /(\d+)x\^2\+?(\-?\d*\.?\d*)x\+?(\-?\d*\.?\d*)/;
  const match4 = expr.match(gcfPattern);
  if (match4) {
    const a = parseInt(match4[1], 10);
    const b = parseFloat(match4[2]) || 0;
    const c = parseFloat(match4[3]) || 0;
    
    // Check if b and c are divisible by a
    if (b % a === 0 && c % a === 0) {
      const newB = b / a;
      const newC = c / a;
      const remaining = `x^2${newB >= 0 ? `+${newB}x` : `${newB}x`}${newC >= 0 ? `+${newC}` : `${newC}`}`;
      return `${a}(${remaining})`;
    }
  }

  return expr;
}

/**
 * Finds all integer factors of a number.
 */
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

/**
 * Checks if two complex numbers are equivalent.
 * Handles forms like a + bi, bi + a, a - bi, etc.
 */
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

/**
 * Checks if two fractions are equivalent.
 * Handles forms like a/b, (a/b), mixed numbers, fraction addition, etc.
 */
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
  
  // Check for fraction addition: a/b + c/d
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
  
  // Check for algebraic expressions with fractions: (a/b)x + c
  const algebraicFractionPattern = /\((\d+)\/(\d+)\)x\+?(\-?\d*\.?\d*)/;
  const parseAlgebraicFraction = (expr: string) => {
    const match = expr.match(algebraicFractionPattern);
    if (!match) return null;
    
    const num = parseInt(match[1], 10);
    const den = parseInt(match[2], 10);
    const constant = parseFloat(match[3]) || 0;
    
    return { value: (num / den) + constant, isAlgebraic: true };
  };
  
  const f1 = parseFraction(expr1) || parseFractionAddition(expr1) || parseAlgebraicFraction(expr1);
  const f2 = parseFraction(expr2) || parseFractionAddition(expr2) || parseAlgebraicFraction(expr2);
  
  if (!f1 || !f2) return false;
  
  // For algebraic expressions, we need a different comparison
  const f1IsAlgebraic = 'isAlgebraic' in f1 && f1.isAlgebraic;
  const f2IsAlgebraic = 'isAlgebraic' in f2 && f2.isAlgebraic;
  
  if (f1IsAlgebraic || f2IsAlgebraic) {
    return Math.abs(f1.value - f2.value) < 0.0001;
  }
  
  return Math.abs(f1.value - f2.value) < 0.0001;
}

/**
 * Checks if two radical expressions are equivalent.
 * Handles forms like √n, n√a, cube roots, radical addition, etc.
 */
function checkRadicalEquivalence(expr1: string, expr2: string): boolean {
  // Check for integer equivalence (e.g., √4 === 2)
  const integerPattern = /^-?\d+$/;
  if (integerPattern.test(expr1) && integerPattern.test(expr2)) {
    return parseInt(expr1, 10) === parseInt(expr2, 10);
  }
  
  // Check for cube roots first (before square roots to avoid conflicts)
  const cubeRootPattern = /³√(\d+)/;
  const parseCubeRoot = (expr: string) => {
    const match = expr.match(cubeRootPattern);
    if (!match) return null;
    
    const radicand = parseInt(match[1], 10);
    return { value: Math.cbrt(radicand) };
  };
  
  // Check if one is an integer and the other is a radical that simplifies to it
  const parseRadical = (expr: string) => {
    // Don't match cube roots
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
  
  // Check for radical addition: a√b + c√b
  const radicalAdditionPattern = /(\d*)√(\d+)\+(\d*)√(\d+)/;
  const parseRadicalAddition = (expr: string) => {
    const match = expr.match(radicalAdditionPattern);
    if (!match) return null;
    
    const coeff1 = parseInt(match[1], 10) || 1;
    const rad1 = parseInt(match[2], 10);
    const coeff2 = parseInt(match[3], 10) || 1;
    const rad2 = parseInt(match[4], 10);
    
    // Only combine if radicands are the same
    if (rad1 !== rad2) return null;
    
    const totalCoeff = coeff1 + coeff2;
    return { value: totalCoeff * Math.sqrt(rad1) };
  };
  
  const r1 = parseCubeRoot(expr1) || parseRadical(expr1) || parseRadicalAddition(expr1);
  const r2 = parseCubeRoot(expr2) || parseRadical(expr2) || parseRadicalAddition(expr2);
  
  if (!r1 || !r2) {
    // Try cross-checking integer vs radical
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
