import { describe, it, expect } from 'vitest';
import { shuffleArray } from '@/lib/study/utils';

describe('utils', () => {
  describe('shuffleArray', () => {
    it('returns an array of the same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled.length).toBe(arr.length);
    });

    it('contains all original elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      arr.forEach((item) => {
        expect(shuffled).toContain(item);
      });
    });

    it('does not modify the original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffleArray(arr);
      expect(arr).toEqual(original);
    });

    it('works with empty array', () => {
      const shuffled = shuffleArray([]);
      expect(shuffled).toEqual([]);
    });

    it('works with single element', () => {
      const shuffled = shuffleArray([1]);
      expect(shuffled).toEqual([1]);
    });

    it('works with strings', () => {
      const arr = ['a', 'b', 'c', 'd'];
      const shuffled = shuffleArray(arr);
      expect(shuffled.length).toBe(arr.length);
      arr.forEach((item) => {
        expect(shuffled).toContain(item);
      });
    });

    it('produces different orders (probabilistically)', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const results = new Set<string>();
      for (let i = 0; i < 50; i++) {
        results.add(shuffleArray(arr).join(','));
      }
      expect(results.size).toBeGreaterThan(1);
    });
  });
});
