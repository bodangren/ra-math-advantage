import { describe, it, expect } from 'vitest';
import { problemFamilySchema } from '@math-platform/practice-core/problem-family';
import { MODULE6_PROBLEM_FAMILIES } from '@/convex/seed/problem-families/module-6';
import { MODULE7_PROBLEM_FAMILIES } from '@/convex/seed/problem-families/module-7';
import { MODULE8_PROBLEM_FAMILIES } from '@/convex/seed/problem-families/module-8';
import { MODULE9_PROBLEM_FAMILIES } from '@/convex/seed/problem-families/module-9';
import { OBJECTIVE_POLICIES } from '@/convex/seed/objective-policies';

const ALL_MODULE_PROBLEM_FAMILIES = [
  ...MODULE6_PROBLEM_FAMILIES,
  ...MODULE7_PROBLEM_FAMILIES,
  ...MODULE8_PROBLEM_FAMILIES,
  ...MODULE9_PROBLEM_FAMILIES,
];

const VALID_STANDARD_CODES = new Set(OBJECTIVE_POLICIES.map((p) => p.standardId));

describe('Modules 6-9 problem families', () => {
  it('all problem family records pass problemFamilySchema', () => {
    for (const family of ALL_MODULE_PROBLEM_FAMILIES) {
      const result = problemFamilySchema.safeParse(family);
      expect(result.success).toBe(true);
    }
  });

  it('no duplicate problemFamilyId values within seed data', () => {
    const ids = ALL_MODULE_PROBLEM_FAMILIES.map((f) => f.problemFamilyId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all referenced objectiveIds exist in competency standards', () => {
    for (const family of ALL_MODULE_PROBLEM_FAMILIES) {
      for (const objectiveId of family.objectiveIds) {
        expect(VALID_STANDARD_CODES.has(objectiveId)).toBe(true);
      }
    }
  });

  it('Module 6 has at least 6 problem families', () => {
    expect(MODULE6_PROBLEM_FAMILIES.length).toBeGreaterThanOrEqual(6);
  });

  it('Module 7 has at least 6 problem families', () => {
    expect(MODULE7_PROBLEM_FAMILIES.length).toBeGreaterThanOrEqual(6);
  });

  it('Module 8 has at least 4 problem families', () => {
    expect(MODULE8_PROBLEM_FAMILIES.length).toBeGreaterThanOrEqual(4);
  });

  it('Module 9 has at least 6 problem families', () => {
    expect(MODULE9_PROBLEM_FAMILIES.length).toBeGreaterThanOrEqual(6);
  });

  describe('Module 6 problem families', () => {
    it('covers logarithmic and exponential topics', () => {
      const topics = new Set(MODULE6_PROBLEM_FAMILIES.map((f) => (f.metadata as { topic: string }).topic));
      expect(topics).toContain('logarithmic-functions');
      expect(topics).toContain('solving-log-equations');
      expect(topics).toContain('natural-logarithms');
    });
  });

  describe('Module 7 problem families', () => {
    it('covers rational function topics', () => {
      const topics = new Set(MODULE7_PROBLEM_FAMILIES.map((f) => (f.metadata as { topic: string }).topic));
      expect(topics).toContain('rational-expressions');
      expect(topics).toContain('rational-functions');
      expect(topics).toContain('rational-equations');
    });
  });

  describe('Module 8 problem families', () => {
    it('covers statistics topics', () => {
      const topics = new Set(MODULE8_PROBLEM_FAMILIES.map((f) => (f.metadata as { topic: string }).topic));
      expect(topics).toContain('sampling');
      expect(topics).toContain('probability');
      expect(topics).toContain('distributions');
    });
  });

  describe('Module 9 problem families', () => {
    it('covers trigonometric function topics', () => {
      const topics = new Set(MODULE9_PROBLEM_FAMILIES.map((f) => (f.metadata as { topic: string }).topic));
      expect(topics).toContain('unit-circle');
      expect(topics).toContain('trig-graphs');
      expect(topics).toContain('inverse-trig');
    });
  });
});
