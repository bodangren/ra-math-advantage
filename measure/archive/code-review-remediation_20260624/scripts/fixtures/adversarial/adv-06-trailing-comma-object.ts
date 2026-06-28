/**
 * Adversarial fixture 6: Trailing comma inside object type.
 *
 * The @param type is an object literal with a trailing semicolon (legal in
 * JSDoc/TS). All braces balance. Expected behaviour of the FR-3 guard:
 * PASS (balanced, trailing comma is fine).
 *
 * @param {{ a: string; b: number; }} opts - Options with trailing semicolon.
 */
export function example6(opts: { a: string; b: number }): void {
  void opts;
}
