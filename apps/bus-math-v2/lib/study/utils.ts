/**
 * Shuffles an array using Fisher-Yates algorithm.
 * @param array - The array to shuffle
 * @returns A new shuffled array (does not mutate original)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deterministically shuffles an array using a string seed.
 * Useful for producing stable, reproducible orderings inside React
 * renders (e.g. useMemo) where Math.random is disallowed.
 * @param array - The array to shuffle
 * @param seed - Seed string that determines the permutation
 * @returns A new shuffled array (does not mutate original)
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  let hash = seed.split('').reduce((a, b) => {
    const next = ((a << 5) - a + b.charCodeAt(0)) | 0
    return next < 0 ? -next : next
  }, 0)
  const rng = () => {
    hash = (hash * 9301 + 49297) % 233280
    return hash / 233280
  }
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const safeJ = Math.max(0, Math.min(j, i))
    ;[shuffled[i], shuffled[safeJ]] = [shuffled[safeJ], shuffled[i]]
  }
  return shuffled
}