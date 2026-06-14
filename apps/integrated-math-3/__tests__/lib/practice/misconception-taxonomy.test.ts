/**
 * Phase 1 — Red test for the IM3 misconception taxonomy schema.
 *
 * This is a document/artifact contract test: it proves the taxonomy file is
 * well-formed (every required field present, slugs unique, categories closed,
 * detection signals reference valid algebraic distractor types), not that any
 * runtime consumes it. Live behavior for the taxonomy is exercised in
 * `misconception-mapping.test.ts` and the loop-wiring tests in Phase 3.
 *
 * Source under test: `apps/integrated-math-3/lib/practice/misconception-taxonomy.ts`
 * — does not exist yet at HEAD; this test will fail at module-resolution time
 * until the Green phase ships the taxonomy module.
 */

import { describe, expect, it } from 'vitest';

import {
  IM3_M1_SKILL_SET,
  MISCONCEPTION_CATEGORIES,
  ALGEBRAIC_DISTRACTOR_TYPES,
} from './misconception-content.fixtures';

import {
  IM3_MISCONCEPTION_TAGS,
  getIm3MisconceptionTag,
  isCanonicalIm3MisconceptionTag,
  allIm3MisconceptionTagSlugs,
  type Im3MisconceptionTagDefinition,
  type Im3MisconceptionTagSlug,
} from '@/lib/practice/misconception-taxonomy';

describe('IM3 misconception taxonomy — schema & integrity', () => {
  it('exports a non-empty IM3_MISCONCEPTION_TAGS registry', () => {
    expect(IM3_MISCONCEPTION_TAGS).toBeDefined();
    expect(Object.keys(IM3_MISCONCEPTION_TAGS).length).toBeGreaterThan(0);
  });

  it('every tag entry has all required schema fields populated', () => {
    const entries = Object.values(
      IM3_MISCONCEPTION_TAGS,
    ) as Im3MisconceptionTagDefinition[];
    for (const entry of entries) {
      expect(typeof entry.slug).toBe('string');
      expect(entry.slug.length).toBeGreaterThan(0);

      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);

      expect(typeof entry.description).toBe('string');
      expect(entry.description.length).toBeGreaterThan(0);

      expect(MISCONCEPTION_CATEGORIES).toContain(entry.category);

      expect(Array.isArray(entry.affectedSkills)).toBe(true);
      expect(entry.affectedSkills.length).toBeGreaterThan(0);
      for (const skillId of entry.affectedSkills) {
        expect(typeof skillId).toBe('string');
        expect(skillId.length).toBeGreaterThan(0);
      }

      expect(Array.isArray(entry.detectionSignals)).toBe(true);
      expect(entry.detectionSignals.length).toBeGreaterThan(0);
      for (const signal of entry.detectionSignals) {
        expect(typeof signal.distractorType).toBe('string');
        expect(ALGEBRAIC_DISTRACTOR_TYPES).toContain(signal.distractorType);
        expect(typeof signal.description).toBe('string');
        expect(signal.description.length).toBeGreaterThan(0);
      }
    }
  });

  it('the slug field matches the registry key for every entry', () => {
    for (const [key, entry] of Object.entries(IM3_MISCONCEPTION_TAGS)) {
      expect(entry.slug).toBe(key);
    }
  });

  it('slugs are unique across the registry', () => {
    const slugs = Object.keys(IM3_MISCONCEPTION_TAGS);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every category used is from the closed set', () => {
    const entries = Object.values(
      IM3_MISCONCEPTION_TAGS,
    ) as Im3MisconceptionTagDefinition[];
    for (const entry of entries) {
      expect(MISCONCEPTION_CATEGORIES).toContain(entry.category);
    }
  });

  it('every detection signal references a valid algebraic DistractorType', () => {
    const entries = Object.values(
      IM3_MISCONCEPTION_TAGS,
    ) as Im3MisconceptionTagDefinition[];
    for (const entry of entries) {
      for (const signal of entry.detectionSignals) {
        expect(ALGEBRAIC_DISTRACTOR_TYPES).toContain(signal.distractorType);
      }
    }
  });

  it('covers the prioritized IM3 M1 + common-algebra skill set', () => {
    const coveredSkills = new Set<string>();
    const entries = Object.values(
      IM3_MISCONCEPTION_TAGS,
    ) as Im3MisconceptionTagDefinition[];
    for (const entry of entries) {
      for (const skill of entry.affectedSkills) {
        coveredSkills.add(skill);
      }
    }
    for (const skillId of IM3_M1_SKILL_SET) {
      expect(coveredSkills.has(skillId)).toBe(true);
    }
  });

  it('getIm3MisconceptionTag returns the definition for a known slug', () => {
    const firstSlug = allIm3MisconceptionTagSlugs()[0];
    const tag = getIm3MisconceptionTag(firstSlug);
    expect(tag).toBeDefined();
    expect(tag?.slug).toBe(firstSlug);
    expect(tag?.affectedSkills.length).toBeGreaterThan(0);
  });

  it('getIm3MisconceptionTag returns undefined for an unknown slug', () => {
    expect(getIm3MisconceptionTag('not-an-im3-tag')).toBeUndefined();
  });

  it('isCanonicalIm3MisconceptionTag narrows the slug type', () => {
    const firstSlug = allIm3MisconceptionTagSlugs()[0];
    if (!isCanonicalIm3MisconceptionTag(firstSlug)) {
      throw new Error(
        `Expected ${firstSlug} to be a canonical IM3 misconception tag`,
      );
    }
    const typed: Im3MisconceptionTagSlug = firstSlug;
    expect(typeof typed).toBe('string');
    expect(isCanonicalIm3MisconceptionTag('not-an-im3-tag')).toBe(false);
  });

  it('allIm3MisconceptionTagSlugs returns every registry key', () => {
    const slugs = allIm3MisconceptionTagSlugs();
    expect(slugs).toHaveLength(Object.keys(IM3_MISCONCEPTION_TAGS).length);
    for (const slug of slugs) {
      expect(IM3_MISCONCEPTION_TAGS[slug]).toBeDefined();
    }
  });
});