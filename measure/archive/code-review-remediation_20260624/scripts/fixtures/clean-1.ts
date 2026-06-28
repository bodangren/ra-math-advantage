/**
 * Clean fixture: properly balanced @returns and @param types.
 * Must NOT be flagged by the FR-3 guard.
 *
 * @param {string} input - The input string.
 * @param {Map<string, number>} config - Configuration map.
 * @returns {Promise<string | null>} The result, or null if not found.
 */
export async function cleanExample(input: string, config: Map<string, number>): Promise<string | null> {
  return input;
}

/**
 * Also clean: no type annotation at all (prose-only @returns).
 * @returns A descriptive string.
 */
export function proseOnly(): string {
  return "hello";
}

/**
 * Clean: nested generics with multiple braces.
 * @param {Promise<Map<string, { a: number; b: number }>>} data - Complex input.
 * @returns {{ valid: boolean; errors?: string[] }} Validation result.
 */
export function nestedGenerics(data: Promise<Map<string, { a: number; b: number }>>): { valid: boolean; errors?: string[] } {
  return { valid: true };
}
