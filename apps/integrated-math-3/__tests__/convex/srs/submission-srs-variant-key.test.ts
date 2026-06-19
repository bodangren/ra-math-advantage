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
 * This is the Red-phase proof that the `apps/integrated-math-3/convex/srs/submissionSrs.ts`
 * surface still references the legacy `problemFamily*` identifier (and the
 * `problem_families` / `by_problemFamilyId` Convex table/index name pair).
 * Every runtime assertion in this file is expected to fail at HEAD because
 * the Convex submission handler has not been renamed in P3.
 *
 * Strategy: `test-strategy.md` §5 row "P3" — "Projection rename + Convex
 * call-site rename together (they share field shape)." Targeted Red command:
 *   `./node_modules/.bin/vitest run apps/integrated-math-3/__tests__/convex/srs/submission-srs-variant-key.test.ts`
 *
 * Pairing with live-behavior proof: the live gate for the submission handler
 * rename is owned by the Green step per `test-strategy.md` §7 row "P3" — the
 * full Convex handler integration test (`npx vitest run
 * apps/integrated-math-3/convex/srs`) will exercise the renamed handler once
 * the source is updated. The artifact assertions in this file are paired with
 * that live gate per the directive ("Artifact or markdown assertions are allowed
 * only when the phase deliverable is that artifact, and they must be paired
 * with a live-behavior proof or an explicit plan note saying which later role
 * owns the live gate").
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readSubmissionSrsSource(): string {
  // apps/integrated-math-3/__tests__/convex/srs/submission-srs-variant-key.test.ts
  //   ^__tests__/convex/srs                 ^package root
  const path = resolve(__dirname, '../../../convex/srs/submissionSrs.ts');
  return readFileSync(path, 'utf-8');
}

describe('convex/srs/submissionSrs.ts (artifact rename, FR1/FR5)', () => {
  it('does not reference the legacy `problemFamilyId` identifier', () => {
    const content = readSubmissionSrsSource();
    expect(
      content,
      'submissionSrs.ts must not reference the legacy problemFamilyId identifier',
    ).not.toMatch(/problemFamilyId/);
  });

  it('does not reference the legacy PascalCase `ProblemFamily` identifier', () => {
    const content = readSubmissionSrsSource();
    expect(
      content,
      'submissionSrs.ts must not reference the legacy ProblemFamily identifier',
    ).not.toMatch(/ProblemFamily/);
  });

  it('references the renamed `variantKey` identifier (positive contract, FR1)', () => {
    const content = readSubmissionSrsSource();
    expect(
      content,
      'submissionSrs.ts must reference the renamed variantKey identifier',
    ).toMatch(/variantKey/);
  });

  it('does not query the legacy `problem_families` Convex table', () => {
    const content = readSubmissionSrsSource();
    expect(
      content,
      'submissionSrs.ts must not query the legacy problem_families table',
    ).not.toMatch(/problem_families/);
  });

  it('does not reference the legacy `by_problemFamilyId` Convex index name', () => {
    const content = readSubmissionSrsSource();
    expect(
      content,
      'submissionSrs.ts must not reference the legacy by_problemFamilyId index name',
    ).not.toMatch(/by_problemFamilyId/);
  });

  it('does not reference the legacy `by_problem_family` Convex index name', () => {
    const content = readSubmissionSrsSource();
    expect(
      content,
      'submissionSrs.ts must not reference the legacy by_problem_family index name',
    ).not.toMatch(/by_problem_family/);
  });
});
