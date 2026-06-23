/**
 * Adversarial fixture 8: Tagged template / ReturnType<typeof fetch>.
 *
 * The @returns type uses ReturnType<typeof fetch> — nested generics, no
 * stray braces. Expected behaviour of the FR-3 guard: PASS (balanced).
 *
 * @returns {Promise<ReturnType<typeof fetch>>} The fetched data.
 */
export async function example8(): Promise<ReturnType<typeof fetch>> {
  return fetch("https://example.com");
}
