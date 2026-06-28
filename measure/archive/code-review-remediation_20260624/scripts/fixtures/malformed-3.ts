/**
 * Malformed fixture: stray {} after a balanced type block.
 * Pattern: @returns {JSX.Element} {Promise<string | null> {} extra
 * (first {JSX.Element} is balanced, but followed by orphaned {Promise...} {} block).
 * @returns {string} {Promise<string | null> {} The result
 */
export function example3(input: string): string {
  return input;
}
