/**
 * Pure-function builders for linear and quadratic display strings used by
 * the core algebra generators (T17).
 *
 * Formatting conventions (mirror `exp-log-solver.ts` style):
 *   - Coefficient of 1 on x collapses to just the variable name.
 *   - Coefficient of -1 on x collapses to `-x` (no `-1x`).
 *   - Zero coefficient on x omits the term entirely.
 *   - Negative constants are emitted with a leading " - " sign so we
 *     never produce "+ -3" or "1x + -2".
 *   - No leading "+" on the first term.
 *   - Trailing "+ 0" constant is omitted.
 *
 * These helpers complement (do not duplicate) `formatPolynomial` in
 * `utils/polynomial-format.ts`, which handles ascending-order
 * coefficient arrays; `formatLinearTerm` and `formatQuadratic` handle
 * piecewise named-coefficient formats.
 */

const FORBIDDEN_VARIABLE_DEFAULT = 'x';

/**
 * Format a linear term `a*x + b` as a display string with no forbidden
 * substrings (`1x`, `-1x`, `+ -`, `0x`, `+ 0`, or leading `+`).
 *
 * @param a coefficient of the x term (use 0 to omit the x term entirely).
 * @param b constant term (use 0 to omit the constant). Negative values
 *          render with a leading space and minus sign.
 * @param variable symbol used for the variable; defaults to `"x"`.
 */
export function formatLinearTerm(
  a: number,
  b: number,
  variable: string = FORBIDDEN_VARIABLE_DEFAULT,
): string {
  const xPart = formatX(a, variable);
  if (xPart === null && b === 0) return '0';
  if (xPart === null) return String(b);
  if (b === 0) return xPart;
  return `${xPart} ${signSeparator(b)} ${Math.abs(b)}`;
}

/**
 * Format a quadratic term `a*x^2 + b*x + c` using the same conventions as
 * `formatLinearTerm`. If `a === 0` the result degenerates to the linear
 * form `formatLinearTerm(b, c)`; if `b === c === 0` the result is just
 * the quadratic term.
 */
export function formatQuadratic(
  a: number,
  b: number,
  c: number,
  variable: string = FORBIDDEN_VARIABLE_DEFAULT,
): string {
  const x2Part = formatXSquared(a, variable);
  const xPart = formatX(b, variable);
  const constValue = c;
  // Build a list of "raw" signed pieces: first piece verbatim, rest with
  // explicit " - " / " + " separators. Pieces that are negative are stored
  // with a leading "-"; joinSignedParts handles the separator logic.
  const parts: string[] = [];
  if (x2Part !== null) parts.push(x2Part);
  if (xPart !== null) parts.push(xPart);
  if (constValue !== 0) parts.push(String(constValue));
  return joinSignedParts(parts);
}

/**
 * Render an "N*x" term with the 1/-1 collapse rule. Returns `null` when
 * the coefficient is 0 (caller should omit the term entirely).
 */
function formatX(coeff: number, variable: string): string | null {
  if (coeff === 0) return null;
  if (coeff === 1) return variable;
  if (coeff === -1) return `-${variable}`;
  return `${coeff}${variable}`;
}

/**
 * Render an "N*x^2" term with the 1/-1 collapse rule. Returns `null`
 * when the coefficient is 0.
 */
function formatXSquared(
  coeff: number,
  variable: string,
): string | null {
  if (coeff === 0) return null;
  if (coeff === 1) return `${variable}^2`;
  if (coeff === -1) return `-${variable}^2`;
  return `${coeff}${variable}^2`;
}

/**
 * Build "x" or "+ x" depending on sign so `formatLinearTerm` can join
 * pieces with consistent separators.
 */
function signSeparator(n: number): '+' | '-' {
  return n < 0 ? '-' : '+';
}

/**
 * Join pre-signed parts. The first part is used verbatim; subsequent
 * parts starting with `-` get a space-prefixed ` - `, otherwise a
 * ` + ` separator is inserted. Used by `formatQuadratic` so that
 * any mix of negative/positive subterms joins cleanly.
 */
function joinSignedParts(parts: string[]): string {
  if (parts.length === 0) return '0';
  const first = parts[0];
  const tail = parts.slice(1).map((p) => {
    if (p.startsWith('-')) return ` - ${p.slice(1)}`;
    return ` + ${p}`;
  });
  return first + tail.join('');
}
