/**
 * Adversarial fixture 2: Multi-line @returns type.
 *
 * The @returns tag starts a brace region on line 4 that never closes on the
 * same line. The type continues on the following line (line 5). Expected
 * behaviour of the FR-3 guard: detect UNBALANCED on line 4 (depth never
 * returns to 0 on that line).
 *
 * @returns {Promise<
 *             string | null>} The result, or null if not found.
 */
export async function example2(): Promise<string | null> {
  return null;
}
