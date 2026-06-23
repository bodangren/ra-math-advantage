/**
 * Malformed fixture: unbalanced @returns — stray {} after type.
 * Pattern: @returns {type {} description (closing brace missing before description).
 * @returns {string {} The result string
 */
export function example1(input: string): string {
  return input;
}
