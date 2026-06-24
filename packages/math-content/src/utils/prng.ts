/**
 * Deterministic seeded PRNG using the glibc LCG constants
 * (1103515245, 12345) under JavaScript double-precision arithmetic.
 *
 * Important: JS doubles can only represent integers up to 2^53.
 * Multiplying a 31-bit state by 1103515245 produces intermediate
 * values that overflow 2^53 long before the `& 0x7fffffff` mask
 * is applied, so the bit pattern is NOT identical to a true 32-bit
 * glibc LCG. The output is still uniform-ish in [0, 1), strictly
 * deterministic (same seed → same sequence), and adequate for
 * problem-generation reproducibility. Do not use for cryptographic
 * or statistical work that requires the canonical 32-bit LCG.
 */
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}
