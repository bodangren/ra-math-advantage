/**
 * Adversarial fixture 1: Multi-line @param type.
 *
 * The @param tag starts a brace region on line 4 that never closes on the
 * same line. The type continues on the following line (line 5). Expected
 * behaviour of the FR-3 guard: detect UNBALANCED on line 4 (depth never
 * returns to 0 on that line).
 *
 * @param {Map<string,
 *            number>} config - The configuration map.
 */
export function example1(config: Map<string, number>): void {
  void config;
}
