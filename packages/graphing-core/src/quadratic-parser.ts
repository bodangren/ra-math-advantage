export interface QuadraticCoefficients {
  a: number;
  b: number;
  c: number;
}

/**
 * Parses a quadratic expression string into coefficients.
 * @param expression - Quadratic string (e.g., "2x^2+3x-1")
 * @returns QuadraticCoefficients or null if not parseable
 */
export function parseQuadratic(expression: string): QuadraticCoefficients | null {
  const match = expression.match(/(-?\d*\.?\d*)?x\^2(?:\s*([+-]\s*\d*\.?\d*)?x)?(?:\s*([+-]\s*\d*\.?\d*)?)?/);
  if (match) {
    let a = 1;
    if (match[1]) {
      const aStr = match[1];
      const aVal = parseFloat(aStr);
      a = isNaN(aVal) ? (aStr.startsWith('-') ? -1 : 1) : aVal;
    }
    let b = 0;
    if (match[2]) {
      const bStr = match[2].replace(/\s/g, '');
      const bVal = parseFloat(bStr);
      b = isNaN(bVal) ? (bStr.startsWith('-') ? -1 : 1) : bVal;
    }
    let c = 0;
    if (match[3]) {
      const cStr = match[3].replace(/\s/g, '');
      const cVal = parseFloat(cStr);
      c = isNaN(cVal) ? (cStr.startsWith('-') ? -1 : 1) : cVal;
    }
    return { a, b, c };
  }
  return null;
}