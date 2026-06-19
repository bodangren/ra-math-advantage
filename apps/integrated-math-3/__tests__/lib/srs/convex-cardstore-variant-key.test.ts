/**
 * Phase 3 — Projection, App Rename, and Migration (Track 7: Practice-Variant Rename)
 *
 * FR1: Rename `problemFamilyId → variantKey`, `ProblemFamily → PracticeVariant`,
 *      `ProblemFamilyEvidence → PracticeVariantEvidence`, `minProblemFamilies →
 *      minVariants`, `ProblemFamilyResolver → PracticeVariantResolver`,
 *      `InMemoryProblemFamilyResolver → InMemoryPracticeVariantResolver`,
 *      `ProblemFamilyInfo → PracticeVariantInfo`, `getCardByStudentAndFamily →
 *      getCardByStudentAndVariant` across `practice-core`, `srs-engine`, and
 *      `knowledge-space-practice`.
 *
 * FR2: Single-variant default — when `variantKey` is omitted, it collapses
 *      to `objectiveId` (a domain that does not subdivide uses a single
 *      variant per objective).
 *
 * FR5: Update all call sites, fixtures, and tests for the breaking rename.
 *
 * This is the Red-phase proof that the `apps/integrated-math-3` lib/srs
 * Convex adapter surface still references the legacy `problemFamily*`
 * identifier. Every runtime assertion in this file is expected to fail at
 * HEAD because the adapters have not been renamed in P3.
 *
 * Strategy: `test-strategy.md` §7, row "P3". Targeted Red command:
 *   `./node_modules/.bin/vitest run apps/integrated-math-3/__tests__/lib/srs/convex-cardstore-variant-key.test.ts`
 *
 * Pairing with live-behavior proof: the live gate for the lib/srs rename
 * (`npm --workspace @math-platform/srs-engine run test` plus
 * `apps/integrated-math-3/__tests__/lib/srs/...` integration) is owned by
 * the Green step per `test-strategy.md` §7 row "P3" — those tests will
 * exercise the renamed adapter once the source is updated. The artifact
 * assertions in this file are paired with that live gate per the directive
 * ("Artifact or markdown assertions are allowed only when the phase
 * deliverable is that artifact, and they must be paired with a live-behavior
 * proof or an explicit plan note saying which later role owns the live gate").
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readConvexCardStoreSource(): string {
  // apps/integrated-math-3/__tests__/lib/srs/convex-cardstore-variant-key.test.ts
  //   ^__tests__                            ^projections
  //   ^lib                                  ^package root
  const path = resolve(__dirname, '../../../lib/srs/convexCardStore.ts');
  return readFileSync(path, 'utf-8');
}

function readConvexReviewLogStoreSource(): string {
  const path = resolve(__dirname, '../../../lib/srs/convexReviewLogStore.ts');
  return readFileSync(path, 'utf-8');
}

function readConvexSessionStoreSource(): string {
  const path = resolve(__dirname, '../../../lib/srs/convexSessionStore.ts');
  return readFileSync(path, 'utf-8');
}

describe('lib/srs/convexCardStore.ts (artifact rename, FR1/FR5)', () => {
  it('does not reference the legacy `problemFamilyId` identifier', () => {
    const content = readConvexCardStoreSource();
    expect(
      content,
      'convexCardStore.ts must not reference the legacy problemFamilyId identifier',
    ).not.toMatch(/problemFamilyId/);
  });

  it('does not reference the legacy PascalCase `ProblemFamily` identifier', () => {
    const content = readConvexCardStoreSource();
    expect(
      content,
      'convexCardStore.ts must not reference the legacy ProblemFamily identifier',
    ).not.toMatch(/ProblemFamily/);
  });

  it('references the renamed `variantKey` identifier (positive contract, FR1/FR2)', () => {
    const content = readConvexCardStoreSource();
    expect(
      content,
      'convexCardStore.ts must reference the renamed variantKey identifier',
    ).toMatch(/variantKey/);
  });
});

describe('lib/srs/convexReviewLogStore.ts (artifact rename, FR1/FR5)', () => {
  it('does not reference the legacy `problemFamilyId` identifier', () => {
    const content = readConvexReviewLogStoreSource();
    expect(
      content,
      'convexReviewLogStore.ts must not reference the legacy problemFamilyId identifier',
    ).not.toMatch(/problemFamilyId/);
  });

  it('does not reference the legacy PascalCase `ProblemFamily` identifier', () => {
    const content = readConvexReviewLogStoreSource();
    expect(
      content,
      'convexReviewLogStore.ts must not reference the legacy ProblemFamily identifier',
    ).not.toMatch(/ProblemFamily/);
  });
});

describe('lib/srs/convexSessionStore.ts (artifact rename, FR1/FR5)', () => {
  it('does not reference the legacy `problemFamilyId` identifier', () => {
    const content = readConvexSessionStoreSource();
    expect(
      content,
      'convexSessionStore.ts must not reference the legacy problemFamilyId identifier',
    ).not.toMatch(/problemFamilyId/);
  });

  it('does not reference the legacy PascalCase `ProblemFamily` identifier', () => {
    const content = readConvexSessionStoreSource();
    expect(
      content,
      'convexSessionStore.ts must not reference the legacy ProblemFamily identifier',
    ).not.toMatch(/ProblemFamily/);
  });
});
