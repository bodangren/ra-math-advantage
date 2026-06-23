/**
 * Adversarial fixture 10: Function overload type (union of arrow functions).
 *
 * The @param type is a union of two function types. All braces and parens
 * balance. Expected behaviour of the FR-3 guard: PASS (balanced).
 *
 * @param {((x: number) => string) | ((x: string) => string)} coerce - Overloaded.
 */
export function example10(coerce: ((x: number) => string) | ((x: string) => string)): void {
  void coerce;
}
