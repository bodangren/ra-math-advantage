/**
 * Adversarial fixture 3: Embedded "{}" in descriptive prose.
 *
 * The type region @returns {string} is balanced. After the balanced type,
 * prose follows ("the result is") and then an orphaned {} block. Expected
 * behaviour of the FR-3 guard: detect STRAY_BLOCK.
 *
 * @returns {string} the result is {} - description with embedded braces.
 */
export function example3(): string {
  return "ok";
}
