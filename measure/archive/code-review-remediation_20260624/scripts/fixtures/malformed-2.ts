/**
 * Malformed fixture: truncated @param function type.
 * Pattern: @param {(expression: string, problemType: string} props
 * (closing `)` and `=> string[]` lost — braces balanced but parens unbalanced).
 * @param {(expression: string, problemType: string} props - The props object.
 */
export function example2(props: { expression: string; problemType: string }): string[] {
  return [props.expression];
}
