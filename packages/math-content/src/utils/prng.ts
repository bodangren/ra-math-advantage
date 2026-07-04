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

/**
 * Mulberry32 — a fast, deterministic 32-bit PRNG with good distribution
 * for non-cryptographic use. The reference implementation is by Tommy
 * Ettinger (public domain), adapted to use `Math.imul` for 32-bit signed
 * multiplication under JS doubles.
 *
 * Properties:
 *   - Same seed → identical sequence.
 *   - Output is uniformly distributed in [0, 1).
 *   - Never invokes the platform `Math.random`; runs entirely from the
 *     provided seed.
 *   - Negative and zero seeds are coerced to 32-bit unsigned integers
 *     via `>>> 0`, so all seeds are well-defined.
 *
 * Additive alongside `seededRandom`. New T17 generators use mulberry32 per
 * spec; existing generators that depend on `seededRandom`'s exact sequence
 * remain untouched.
 */
export function mulberry32(seed: number): () => number {
  // Coerce to a 32-bit unsigned integer state. `| 0` truncates to a JS
  // 32-bit signed int; `>>> 0` then reinterprets as unsigned.
  let state = (seed | 0) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
