/**
 * Phase 1 — Red test for the IM3 misconception → distractor detection mapping.
 *
 * Live behavior test. Exercises the `mapDistractorToMisconception` function
 * which maps a `(distractorType, answer)` pair to one or more IM3
 * misconception tag slugs. The function is the runtime seam between
 * `packages/math-content/src/algebraic/distractors.ts` and the authored
 * taxonomy — a wrong answer produced by the distractor generators should
 * surface as a tag from this mapping.
 *
 * Source under test: `apps/integrated-math-3/lib/practice/misconception-mapping.ts`
 * — does not exist yet at HEAD; this test will fail at module-resolution time
 * until the Green phase ships the mapping module.
 */

import { describe, expect, it } from 'vitest';

import { IM3_M1_SKILL_SET } from './misconception-content.fixtures';

import {
  IM3_MISCONCEPTION_TAGS,
  allIm3MisconceptionTagSlugs,
} from '@/lib/practice/misconception-taxonomy';

import {
  mapDistractorToMisconception,
  getDistractorTypesForMisconception,
} from '@/lib/practice/misconception-mapping';

import type { DistractorType } from '@math-platform/math-content/algebraic';

const ALL_VALID_SLUGS: ReadonlySet<string> = new Set(
  Object.keys(IM3_MISCONCEPTION_TAGS),
);

describe('mapDistractorToMisconception — live behavior', () => {
  it('returns a string array (never throws) for every known algebraic distractor type', () => {
    const types: DistractorType[] = [
      'factoring',
      'linear',
      'quadratic_formula',
      'complex',
      'completing_square',
      'discriminant',
      'system',
    ];
    for (const t of types) {
      const result = mapDistractorToMisconception(t, 'some answer string');
      expect(Array.isArray(result)).toBe(true);
    }
  });

  it('every returned tag slug is a canonical IM3 taxonomy entry', () => {
    const types: DistractorType[] = [
      'factoring',
      'linear',
      'quadratic_formula',
      'complex',
      'completing_square',
      'discriminant',
      'system',
    ];
    for (const t of types) {
      const result = mapDistractorToMisconception(t, 'x + 1');
      for (const slug of result) {
        expect(ALL_VALID_SLUGS.has(slug)).toBe(true);
      }
    }
  });

  it('returns an empty array for an unrecognized distractor type', () => {
    const result = mapDistractorToMisconception(
      'not-a-real-type' as unknown as DistractorType,
      'some answer',
    );
    expect(result).toEqual([]);
  });

  it('returns at least one tag for the factoring distractor type', () => {
    const result = mapDistractorToMisconception(
      'factoring',
      '(x + 2)(x - 3)',
    );
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns at least one tag for the quadratic_formula distractor type', () => {
    const result = mapDistractorToMisconception(
      'quadratic_formula',
      'x = 2, x = -3',
    );
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns at least one tag for the linear distractor type', () => {
    const result = mapDistractorToMisconception('linear', 'x = 4');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getDistractorTypesForMisconception — live behavior', () => {
  it('returns at least one distractor type for every taxonomy entry', () => {
    const slugs = allIm3MisconceptionTagSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) {
      const types = getDistractorTypesForMisconception(slug);
      expect(types.length).toBeGreaterThan(0);
    }
  });

  it('every returned distractor type is a valid algebraic DistractorType', () => {
    const validTypes: ReadonlySet<DistractorType> = new Set([
      'factoring',
      'linear',
      'quadratic_formula',
      'complex',
      'completing_square',
      'discriminant',
      'system',
    ]);
    for (const slug of allIm3MisconceptionTagSlugs()) {
      const types = getDistractorTypesForMisconception(slug);
      for (const t of types) {
        expect(validTypes.has(t)).toBe(true);
      }
    }
  });

  it('returns an empty array for an unknown slug', () => {
    expect(
      getDistractorTypesForMisconception('not-an-im3-tag'),
    ).toEqual([]);
  });
});

describe('taxonomy ↔ mapping coherence', () => {
  it('every taxonomy entry lists at least one distractor type that maps back to it', () => {
    const slugs = allIm3MisconceptionTagSlugs();
    for (const slug of slugs) {
      const types = getDistractorTypesForMisconception(slug);
      const roundTripped = new Set<string>();
      for (const t of types) {
        for (const mapped of mapDistractorToMisconception(t, 'any answer')) {
          roundTripped.add(mapped);
        }
      }
      expect(roundTripped.has(slug)).toBe(true);
    }
  });

  it('every IM3 M1 skill is referenced by at least one taxonomy entry that maps to a distractor type', () => {
    const entries = Object.values(IM3_MISCONCEPTION_TAGS);
    for (const skillId of IM3_M1_SKILL_SET) {
      const covering = entries.filter((e) =>
        e.affectedSkills.includes(skillId),
      );
      expect(covering.length).toBeGreaterThan(0);
      for (const entry of covering) {
        const types = getDistractorTypesForMisconception(entry.slug);
        expect(types.length).toBeGreaterThan(0);
      }
    }
  });
});