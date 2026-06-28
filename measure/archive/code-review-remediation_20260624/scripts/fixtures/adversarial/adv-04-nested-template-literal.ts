/**
 * Adversarial fixture 4: Nested template literal inside @param type.
 *
 * The type contains a balanced template literal with backticks. Backticks
 * are not JSDoc-valid in type expressions, but the guard's syntactic brace
 * counter treats `${x}` as an inner {..} block. Expected behaviour: the
 * guard sees depth=0 after the outer closing brace, so it reports the tag
 * as balanced (PASSES the guard). This is a documented limitation — the
 * guard checks syntactic balance, not JSDoc-spec validity of backticks.
 *
 * @param {(x: string) => `hello ${x}`} formatter - A template-literal typed param.
 */
export function example4(formatter: (x: string) => `hello ${x}`): void {
  void formatter;
}
