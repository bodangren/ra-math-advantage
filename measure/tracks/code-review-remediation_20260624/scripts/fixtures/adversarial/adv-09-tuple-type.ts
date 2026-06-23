/**
 * Adversarial fixture 9: Tuple type.
 *
 * The @param type is a tuple [string, number]. All braces balance.
 * Expected behaviour of the FR-3 guard: PASS (balanced).
 *
 * @param {[string, number]} entry - A tuple of [label, count].
 */
export function example9(entry: [string, number]): void {
  void entry;
}
