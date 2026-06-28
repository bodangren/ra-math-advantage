/**
 * Adversarial fixture 7: Generic with TypeScript-style default.
 *
 * The @param type is Map<string, T = string>. All braces balance.
 * Expected behaviour of the FR-3 guard: PASS (balanced, `=` inside angle
 * brackets is a TS default, which the guard does not interpret).
 *
 * @param {Map<string, T = string>} defaults - Generic with TS-style default.
 */
export function example7<T = string>(defaults: Map<string, T>): void {
  void defaults;
}
