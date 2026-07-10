/**
 * Intentional Red — v3.1 FSRS fitting and release behavior (§12.10).
 *
 * Phase 1 pins the artifact schemas. These tests specify the missing lifecycle
 * decisions and released-parameter lookup without re-testing schema shape.
 */
import { describe, expect, it } from 'vitest';

import {
  FSRS_FIT_HOLDOUT_FRACTION,
  type FsrsFitArtifactV31,
  type FsrsHumanRelease,
  type FsrsParameterResolutionV31,
} from '../srs/fsrs-fitting-contract';
import {
  evaluateFsrsFitLifecycle,
  resolveReleasedFsrsParameters,
} from '../srs/fsrs-fitting';

const population = {
  domain: 'english.gse',
  ageBand: 'primary',
} as const;

const incumbent = {
  paramsVersion: 'fsrs-params.english.gse.primary.v1',
  contentSha256: 'b'.repeat(64),
} as const;

const candidate = {
  paramsVersion: 'fsrs-params.english.gse.primary.v2',
  contentSha256: 'c'.repeat(64),
  optimizerVersion: 'fsrs-optimizer.v3.1.0',
} as const;

function dataset(reviewCount: number, distinctStudentCount: number) {
  return {
    datasetId: `english-gse-primary-${reviewCount}-${distinctStudentCount}`,
    contentSha256: 'a'.repeat(64),
    window: {
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-04-01T00:00:00.000Z',
    },
    reviewCount,
    distinctStudentCount,
    holdoutFraction: FSRS_FIT_HOLDOUT_FRACTION,
  } as const;
}

function fitInput(
  reviewCount = 10_000,
  distinctStudentCount = 100,
  candidateLogLoss = 0.412,
  incumbentLogLoss = 0.446,
) {
  return {
    artifactId: 'fit-english-gse-primary-2026-t1-v2',
    population,
    dataset: dataset(reviewCount, distinctStudentCount),
    incumbent,
    fitResult: {
      candidate,
      candidateLogLoss,
      incumbentLogLoss,
    },
  } as const;
}

const approval: FsrsHumanRelease = {
  decision: 'approved',
  reviewId: 'release-review-2026-t1-v2',
  humanReviewerId: 'curriculum-lead-17',
  paramsVersion: candidate.paramsVersion,
  decidedAt: '2026-04-08T09:30:00.000Z',
  rationale: 'Holdout loss improved and release evidence was reviewed.',
};

describe('v3.1 FSRS fit lifecycle (intentional Red)', () => {
  it('admits the exact 10,000-review and 100-student boundary with a held-out 20% split', () => {
    const artifact: FsrsFitArtifactV31 = evaluateFsrsFitLifecycle(fitInput());

    expect(artifact.volumeGate).toMatchObject({
      passed: true,
      failureReasons: [],
    });
    expect(artifact.dataset.holdoutFraction).toBe(0.2);
    expect(artifact.holdoutComparison).toMatchObject({
      candidateLogLoss: 0.412,
      incumbentLogLoss: 0.446,
      absoluteImprovement: 0.034,
      improvesIncumbent: true,
    });
  });

  it.each([
    { reviews: 9_999, students: 100, reason: 'insufficient_reviews' },
    { reviews: 10_000, students: 99, reason: 'insufficient_students' },
  ] as const)(
    'rejects $reviews reviews and $students students before fitting',
    ({ reviews, students, reason }) => {
      const input = fitInput(reviews, students);
      const artifact: FsrsFitArtifactV31 = evaluateFsrsFitLifecycle({
        ...input,
        fitResult: undefined,
      });

      expect(artifact.volumeGate.passed).toBe(false);
      expect(artifact.volumeGate.failureReasons).toEqual([reason]);
      expect(artifact.candidate).toBeNull();
      expect(artifact.holdoutComparison).toBeNull();
      expect(artifact.approvalState).toBe('blocked_volume_gate');
    },
  );

  it('keeps an improving candidate pending until a named human explicitly approves it', () => {
    const pending: FsrsFitArtifactV31 = evaluateFsrsFitLifecycle(fitInput());
    const approved: FsrsFitArtifactV31 = evaluateFsrsFitLifecycle({
      ...fitInput(),
      humanRelease: approval,
    });

    expect(pending.approvalState).toBe('pending_human_review');
    expect(pending.humanRelease).toBeNull();
    expect(approved.approvalState).toBe('approved');
    expect(approved.humanRelease).toEqual(approval);
  });

  it('blocks a non-improving candidate and refuses a human override', () => {
    const regressing = fitInput(10_000, 100, 0.46, 0.446);
    const blocked: FsrsFitArtifactV31 = evaluateFsrsFitLifecycle(regressing);

    expect(blocked.holdoutComparison).toMatchObject({
      absoluteImprovement: -0.014,
      improvesIncumbent: false,
    });
    expect(blocked.approvalState).toBe('blocked_holdout_regression');
    expect(blocked.humanRelease).toBeNull();
    expect(() => evaluateFsrsFitLifecycle({
      ...regressing,
      humanRelease: approval,
    })).toThrow(/improve|approval|release/i);
  });
});

describe('v3.1 released-parameter resolution (intentional Red)', () => {
  const defaults = {
    paramsVersion: 'fsrs-defaults.ts-fsrs.v5',
    availability: 'built_in',
  } as const;

  function resolve(
    populationAvailability: 'released' | 'missing' | 'unapproved',
    domainAvailability: 'released' | 'missing' | 'ineligible',
  ): FsrsParameterResolutionV31 {
    return resolveReleasedFsrsParameters({
      requestedPopulation: { domain: 'math.im3', ageBand: 'secondary' },
      population: {
        paramsVersion: populationAvailability === 'missing'
          ? null
          : 'fsrs-params.math.im3.secondary.v2',
        availability: populationAvailability,
      },
      domain: {
        paramsVersion: domainAvailability === 'missing'
          ? null
          : 'fsrs-params.math.im3.v3',
        availability: domainAvailability,
      },
      defaults,
    });
  }

  it('selects the first released set in population, domain, defaults order', () => {
    expect(resolve('released', 'released').selected).toMatchObject({
      paramsVersion: 'fsrs-params.math.im3.secondary.v2',
      reason: 'exact_population',
    });
    expect(resolve('unapproved', 'released').selected).toMatchObject({
      paramsVersion: 'fsrs-params.math.im3.v3',
      reason: 'domain_fallback',
    });
    expect(resolve('missing', 'ineligible').selected).toMatchObject({
      paramsVersion: 'fsrs-defaults.ts-fsrs.v5',
      reason: 'fsrs_defaults',
    });
  });

  it('records the rejected population candidate instead of silently selecting it', () => {
    const resolution = resolve('unapproved', 'released');

    expect(resolution.attempts[0]).toMatchObject({
      paramsVersion: 'fsrs-params.math.im3.secondary.v2',
      availability: 'unapproved',
    });
    expect(resolution.selected.paramsVersion)
      .not.toBe('fsrs-params.math.im3.secondary.v2');
  });
});
