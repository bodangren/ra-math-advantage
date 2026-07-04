import { describe, it, expect, vi } from 'vitest';
import { mulberry32, seededRandom } from '../utils/prng';
// @ts-ignore — node:fs is used only in vitest tests; @types/node is not installed in this package
import { readFileSync } from 'node:fs';

describe('mulberry32', () => {
  it('returns a function', () => {
    expect(typeof mulberry32(1)).toBe('function');
  });

  it('is deterministic: same seed produces identical first 10 draws', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const drawsA = Array.from({ length: 10 }, () => a());
    const drawsB = Array.from({ length: 10 }, () => b());
    expect(drawsA).toEqual(drawsB);
  });

  it('produces values in [0, 1) for 500 consecutive draws across 10 seeds', () => {
    const seeds = [0, 1, 42, 99, 2 ** 31, -1, 123, 9999, 1_000_000, -42];
    for (const seed of seeds) {
      const rand = mulberry32(seed);
      for (let i = 0; i < 500; i++) {
        const v = rand();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
        expect(Number.isNaN(v)).toBe(false);
      }
    }
  });

  it('produces different first draws for different seeds', () => {
    const firsts = new Set<number>();
    for (let seed = 0; seed < 20; seed++) {
      firsts.add(mulberry32(seed)());
    }
    expect(firsts.size).toBe(20);
  });

  it('is well-defined for zero and negative seeds', () => {
    expect(Number.isFinite(mulberry32(0)())).toBe(true);
    expect(Number.isFinite(mulberry32(-1)())).toBe(true);
  });

  it('does not invoke Math.random()', () => {
    const spy = vi.spyOn(Math, 'random');
    try {
      const rand = mulberry32(7);
      for (let i = 0; i < 100; i++) rand();
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it('does not contain Math.random() in prng.ts source outside comments', () => {
    const src = readFileSync('packages/math-content/src/utils/prng.ts', 'utf8');
    // Remove single-line comments to avoid matching mentions in comments.
    const code = src.replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/Math\.random\s*\(/);
  });

  it('does not replace or break existing seededRandom (seed=1 regression guard)', () => {
    // Historical first draw of seededRandom(1)() under the glibc LCG constants.
    expect(seededRandom(1)()).toBe(0.5138700783782965);
  });
});
