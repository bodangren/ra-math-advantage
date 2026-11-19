import { describe, it, expect } from "vitest";
import { shuffleArray } from "../study/shuffle";

describe("shuffleArray", () => {
  it("returns an array with the same length as input", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    expect(result.length).toBe(input.length);
  });

  it("contains all original elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffleArray(input);
    for (const item of input) {
      expect(result).toContain(item);
    }
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffleArray(input);
    expect(input).toEqual(original);
  });

  it("works with empty array", () => {
    const result = shuffleArray([]);
    expect(result).toEqual([]);
  });

  it("works with single element", () => {
    const result = shuffleArray([1]);
    expect(result).toEqual([1]);
  });

  it("produces potentially different order (probabilistic)", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(shuffleArray(input).join(","));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
