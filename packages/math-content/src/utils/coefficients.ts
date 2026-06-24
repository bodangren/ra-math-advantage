/**
 * Build a coefficient array of the requested degree in ascending order
 * (index k = coefficient of x^k). The leading coefficient (last index)
 * is always non-zero; intermediate coefficients are uniform integers
 * drawn from `otherRange`.
 *
 * @param {() => number} rand - PRNG function returning [0, 1)
 * @param {number} degree - polynomial degree (number of terms - 1)
 * @param {[number, number]} leadingRange - [lo, hi] range for the leading coefficient magnitude
 * @param {[number, number]} otherRange - [lo, hi] range for intermediate coefficients
 */
export function generateCoefficients(
  rand: () => number,
  degree: number,
  leadingRange: [number, number],
  otherRange: [number, number],
): number[] {
  const poly: number[] = [];
  for (let i = 0; i < degree; i++) {
    const c =
      Math.floor(rand() * (otherRange[1] - otherRange[0] + 1)) + otherRange[0];
    poly.push(c);
  }
  const leadingMag =
    Math.floor(rand() * (leadingRange[1] - leadingRange[0] + 1)) +
    leadingRange[0];
  poly.push(rand() < 0.5 ? -leadingMag : leadingMag);
  return poly;
}
