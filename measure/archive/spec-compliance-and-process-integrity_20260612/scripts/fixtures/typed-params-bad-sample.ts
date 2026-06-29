/**
 * Constructed bad-sample fixture for check-jsdoc-typed-params.sh.
 *
 * Per measure/tracks/spec-compliance-and-process-integrity_20260612/test-strategy.md §2
 * ("a fake fixture dir is permitted ONLY to prove a guard script invokes the intended
 * command — runner plumbing") and §7 P3 closeout ("a constructed bad-sample fails —
 * bounded non-fake proof"), this file is the self-test target. It contains exactly:
 *
 *   - 2 untyped @param tags    (f: x, f: y is typed below)
 *   - 2 typed @param tags      (g: a typed, plus one typed in f)
 *   - 2 untyped @returns tags  (f: unttyped, g: typed)
 *   - 2 typed @returns tags    (f: untyped, g: typed below)
 *
 * Wait — recompute: this file has 2 untyped @param and 1 typed @param, plus 1
 * untyped @returns and 1 typed @returns. The contract is: guard run with
 * TYPED_PARAMS_SCOPE=<this-file> must report untyped=2, typed=2, exit 1.
 *
 * Expected:
 *   untyped = 2   (one @param in f, one @returns in f)
 *   typed   = 2   (one @param in g, one @returns in g)
 *
 * This file is the closeout runner-plumbing proof — it proves the guard's parser
 * and exit code both work without needing the full real-scope sweep. It is NOT
 * the production gate (that is the real-scope run documented in
 * phase-3-red-baseline.md).
 */

/**
 * Documented function with one untyped @param and one untyped @returns.
 *
 * @param x - the first input (intentionally untyped for the fixture)
 * @returns the concatenation result (intentionally untyped for the fixture)
 */
export function f(x: string): string {
  return x + "!";
}

/**
 * Documented function with one typed @param and one typed @returns.
 *
 * @param {string} a - the input string
 * @returns {number} the length of the input
 */
export function g(a: string): number {
  return a.length;
}
