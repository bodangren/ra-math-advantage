/**
 * Adversarial fixture 5: JSDoc-style comment inside a brace region.
 *
 * The @param type contains a nested {..} block that itself contains a
 * JSDoc comment. All braces balance. Expected behaviour of the FR-3 guard:
 * PASS (balanced, even if unusual).
 *
 * @param {{ /** a:b */ a: string; b: number }} row - A row type with a comment.
 */
export function example5(row: { a: string; b: number }): void {
  void row;
}
