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
 * FR5: Update all call sites, fixtures, and tests for the breaking rename.
 *
 * This is the Red-phase proof that the `apps/integrated-math-3/convex/srs/cards.ts`
 * surface still references the legacy `problemFamily*` identifier. Every runtime
 * assertion in this file is expected to fail at HEAD because the Convex card
 * handlers have not been renamed in P3.
 *
 * Strategy: `test-strategy.md` §5 row "P3" — "Add a contract test asserting
 * `convex/srs/cards.ts` writes `variantKey`, never `problemFamilyId`." Targeted
 * Red command:
 *   `./node_modules/.bin/vitest run apps/integrated-math-3/__tests__/convex/srs/cards-variant-key.test.ts`
 *
 * Pairing with live-behavior proof: the live gate for the Convex handler rename
 * is owned by the Green step per `test-strategy.md` §7 row "P3" — the full
 * Convex handler integration test (`npx vitest run apps/integrated-math-3/convex/srs`)
 * will exercise the renamed handlers once the source is updated. The artifact
 * assertions in this file are paired with that live gate per the directive
 * ("Artifact or markdown assertions are allowed only when the phase deliverable
 * is that artifact, and they must be paired with a live-behavior proof or an
 * explicit plan note saying which later role owns the live gate").
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readCardsSource(): string {
  // apps/integrated-math-3/__tests__/convex/srs/cards-variant-key.test.ts
  //   ^__tests__/convex/srs                 ^package root
  const path = resolve(__dirname, '../../../convex/srs/cards.ts');
  return readFileSync(path, 'utf-8');
}

function readProcessReviewSource(): string {
  const path = resolve(__dirname, '../../../convex/srs/processReview.ts');
  return readFileSync(path, 'utf-8');
}

describe('convex/srs/cards.ts (artifact rename, FR1/FR5)', () => {
  it('does not reference the legacy `problemFamilyId` identifier', () => {
    const content = readCardsSource();
    expect(
      content,
      'cards.ts must not reference the legacy problemFamilyId identifier',
    ).not.toMatch(/problemFamilyId/);
  });

  it('does not reference the legacy PascalCase `ProblemFamily` identifier', () => {
    const content = readCardsSource();
    expect(
      content,
      'cards.ts must not reference the legacy ProblemFamily identifier',
    ).not.toMatch(/ProblemFamily/);
  });

  it('references the renamed `variantKey` identifier (positive contract, FR1)', () => {
    const content = readCardsSource();
    expect(
      content,
      'cards.ts must reference the renamed variantKey identifier',
    ).toMatch(/variantKey/);
  });

  it('does not reference the legacy `by_student_and_problem_family` index name', () => {
    const content = readCardsSource();
    expect(
      content,
      'cards.ts must not reference the legacy by_student_and_problem_family index name',
    ).not.toMatch(/by_student_and_problem_family/);
  });

  it('references the renamed `by_student_and_variant` index name (positive contract, FR1)', () => {
    const content = readCardsSource();
    expect(
      content,
      'cards.ts must reference the renamed by_student_and_variant index name',
    ).toMatch(/by_student_and_variant/);
  });

  it('does not export the legacy `getCardByStudentAndFamily` handler (renamed to getCardByStudentAndVariant)', () => {
    const content = readCardsSource();
    expect(
      content,
      'cards.ts must not export the legacy getCardByStudentAndFamily handler',
    ).not.toMatch(/getCardByStudentAndFamily/);
  });
});

describe('convex/srs/processReview.ts (artifact rename, FR1/FR5)', () => {
  it('does not reference the legacy `problemFamilyId` identifier', () => {
    const content = readProcessReviewSource();
    expect(
      content,
      'processReview.ts must not reference the legacy problemFamilyId identifier',
    ).not.toMatch(/problemFamilyId/);
  });

  it('references the renamed `variantKey` identifier (positive contract, FR1)', () => {
    const content = readProcessReviewSource();
    expect(
      content,
      'processReview.ts must reference the renamed variantKey identifier',
    ).toMatch(/variantKey/);
  });
});
