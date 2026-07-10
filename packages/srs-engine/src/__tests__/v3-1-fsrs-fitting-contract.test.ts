import { describe, expect, it } from 'vitest';

import {
  FSRS_FITTING_CONTRACT_VERSION,
  FSRS_FIT_HOLDOUT_FRACTION,
  FSRS_FIT_MIN_REVIEW_COUNT,
  FSRS_FIT_MIN_STUDENT_COUNT,
  fsrsFitArtifactSchema,
  fsrsFitDatasetSchema,
  fsrsParameterResolutionSchema,
  isFsrsFitArtifactV31,
  isFsrsParameterResolutionV31,
} from '../srs/fsrs-fitting-contract';

const population = {
  domain: 'english.gse',
  ageBand: 'primary',
} as const;

const dataset = {
  datasetId: 'english-gse-primary-2026-t1',
  contentSha256: 'a'.repeat(64),
  window: {
    startsAt: '2026-01-01T00:00:00.000Z',
    endsAt: '2026-04-01T00:00:00.000Z',
  },
  reviewCount: 41_300,
  distinctStudentCount: 220,
  holdoutFraction: FSRS_FIT_HOLDOUT_FRACTION,
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

const improvingArtifact = {
  contractVersion: FSRS_FITTING_CONTRACT_VERSION,
  artifactId: 'fit-english-gse-primary-2026-t1-v2',
  population,
  dataset,
  volumeGate: {
    minimumReviewCount: FSRS_FIT_MIN_REVIEW_COUNT,
    minimumStudentCount: FSRS_FIT_MIN_STUDENT_COUNT,
    passed: true,
    failureReasons: [],
  },
  incumbent,
  candidate,
  holdoutComparison: {
    candidateLogLoss: 0.412,
    incumbentLogLoss: 0.446,
    absoluteImprovement: 0.034,
    improvesIncumbent: true,
  },
  approvalState: 'pending_human_review',
  humanRelease: null,
} as const;

describe('v3.1 FSRS fitting artifact contract', () => {
  it('pins the normative population-fitting gates', () => {
    expect(FSRS_FITTING_CONTRACT_VERSION).toBe('fsrs-fitting.v3.1');
    expect(FSRS_FIT_MIN_REVIEW_COUNT).toBe(10_000);
    expect(FSRS_FIT_MIN_STUDENT_COUNT).toBe(100);
    expect(FSRS_FIT_HOLDOUT_FRACTION).toBe(0.2);
  });

  it('accepts the upstream improving holdout example but keeps it pending', () => {
    const parsed = fsrsFitArtifactSchema.parse(improvingArtifact);

    expect(parsed.population).toEqual(population);
    expect(parsed.holdoutComparison?.candidateLogLoss).toBe(0.412);
    expect(parsed.approvalState).toBe('pending_human_review');
    expect(parsed.humanRelease).toBeNull();
    expect(isFsrsFitArtifactV31(parsed)).toBe(true);
  });

  it('validates immutable input provenance and exact volume-gate outcomes', () => {
    expect(fsrsFitDatasetSchema.safeParse({
      ...dataset,
      contentSha256: 'not-a-sha256',
    }).success).toBe(false);

    expect(fsrsFitArtifactSchema.safeParse({
      ...improvingArtifact,
      dataset: { ...dataset, reviewCount: 3_800 },
    }).success).toBe(false);

    expect(fsrsFitArtifactSchema.safeParse({
      ...improvingArtifact,
      dataset: { ...dataset, distinctStudentCount: 99 },
      volumeGate: {
        ...improvingArtifact.volumeGate,
        passed: false,
        failureReasons: ['insufficient_students'],
      },
      candidate: null,
      holdoutComparison: null,
      approvalState: 'blocked_volume_gate',
    }).success).toBe(true);

    expect(fsrsFitDatasetSchema.safeParse({
      ...dataset,
      window: {
        startsAt: dataset.window.endsAt,
        endsAt: dataset.window.startsAt,
      },
    }).success).toBe(false);
  });

  it('requires an independently versioned candidate and consistent holdout comparison', () => {
    expect(fsrsFitArtifactSchema.safeParse({
      ...improvingArtifact,
      candidate: { ...candidate, paramsVersion: incumbent.paramsVersion },
    }).success).toBe(false);

    expect(fsrsFitArtifactSchema.safeParse({
      ...improvingArtifact,
      holdoutComparison: {
        candidateLogLoss: 0.5,
        incumbentLogLoss: 0.446,
        absoluteImprovement: 0.034,
        improvesIncumbent: true,
      },
    }).success).toBe(false);
  });

  it('requires a named human release before an improving candidate is approved', () => {
    expect(fsrsFitArtifactSchema.safeParse({
      ...improvingArtifact,
      approvalState: 'approved',
    }).success).toBe(false);

    expect(fsrsFitArtifactSchema.safeParse({
      ...improvingArtifact,
      approvalState: 'approved',
      humanRelease: {
        decision: 'approved',
        reviewId: 'release-review-2026-t1-v2',
        humanReviewerId: 'curriculum-lead-17',
        paramsVersion: candidate.paramsVersion,
        decidedAt: '2026-04-08T09:30:00.000Z',
        rationale: 'Holdout log-loss improved and replay review passed.',
      },
    }).success).toBe(true);
  });

  it('blocks a non-improving holdout and forbids human override', () => {
    const blocked = {
      ...improvingArtifact,
      holdoutComparison: {
        candidateLogLoss: 0.46,
        incumbentLogLoss: 0.446,
        absoluteImprovement: -0.014,
        improvesIncumbent: false,
      },
      approvalState: 'blocked_holdout_regression',
    } as const;

    expect(fsrsFitArtifactSchema.safeParse(blocked).success).toBe(true);
    expect(fsrsFitArtifactSchema.safeParse({
      ...blocked,
      approvalState: 'approved',
      humanRelease: {
        decision: 'approved',
        reviewId: 'override',
        humanReviewerId: 'reviewer',
        paramsVersion: candidate.paramsVersion,
        decidedAt: '2026-04-08T09:30:00.000Z',
        rationale: 'Attempted override.',
      },
    }).success).toBe(false);
  });
});

describe('v3.1 fail-closed parameter resolution contract', () => {
  const attempts = [
    {
      scope: { kind: 'population', domain: 'math.im3', ageBand: 'secondary' },
      paramsVersion: null,
      availability: 'unapproved',
    },
    {
      scope: { kind: 'domain', domain: 'math.im3' },
      paramsVersion: 'fsrs-params.math.im3.v3',
      availability: 'released',
    },
    {
      scope: { kind: 'defaults' },
      paramsVersion: 'fsrs-defaults.ts-fsrs.v5',
      availability: 'built_in',
    },
  ] as const;

  it('falls back from an unapproved population candidate to released domain parameters', () => {
    const resolution = {
      contractVersion: FSRS_FITTING_CONTRACT_VERSION,
      requestedPopulation: { domain: 'math.im3', ageBand: 'secondary' },
      attempts,
      selected: {
        scope: { kind: 'domain', domain: 'math.im3' },
        paramsVersion: 'fsrs-params.math.im3.v3',
        reason: 'domain_fallback',
      },
    } as const;

    expect(fsrsParameterResolutionSchema.parse(resolution).selected.reason)
      .toBe('domain_fallback');
    expect(isFsrsParameterResolutionV31(resolution)).toBe(true);
  });

  it('rejects selection of an unapproved candidate even when its version is known', () => {
    expect(fsrsParameterResolutionSchema.safeParse({
      contractVersion: FSRS_FITTING_CONTRACT_VERSION,
      requestedPopulation: { domain: 'math.im3', ageBand: 'secondary' },
      attempts: [
        { ...attempts[0], paramsVersion: 'fsrs-params.math.im3.secondary.v2' },
        attempts[1],
        attempts[2],
      ],
      selected: {
        scope: { kind: 'population', domain: 'math.im3', ageBand: 'secondary' },
        paramsVersion: 'fsrs-params.math.im3.secondary.v2',
        reason: 'exact_population',
      },
    }).success).toBe(false);
  });

  it('selects built-in defaults only when population and domain releases are unavailable', () => {
    const defaultResolution = {
      contractVersion: FSRS_FITTING_CONTRACT_VERSION,
      requestedPopulation: { domain: 'math.im3', ageBand: 'secondary' },
      attempts: [
        { ...attempts[0], availability: 'missing' },
        { ...attempts[1], paramsVersion: null, availability: 'ineligible' },
        attempts[2],
      ],
      selected: {
        scope: { kind: 'defaults' },
        paramsVersion: 'fsrs-defaults.ts-fsrs.v5',
        reason: 'fsrs_defaults',
      },
    } as const;

    expect(isFsrsParameterResolutionV31(defaultResolution)).toBe(true);
  });

  it('prefers a released population artifact and rejects out-of-order provenance', () => {
    const exact = {
      contractVersion: FSRS_FITTING_CONTRACT_VERSION,
      requestedPopulation: { domain: 'math.im3', ageBand: 'secondary' },
      attempts: [
        {
          ...attempts[0],
          paramsVersion: 'fsrs-params.math.im3.secondary.v2',
          availability: 'released',
        },
        attempts[1],
        attempts[2],
      ],
      selected: {
        scope: { kind: 'population', domain: 'math.im3', ageBand: 'secondary' },
        paramsVersion: 'fsrs-params.math.im3.secondary.v2',
        reason: 'exact_population',
      },
    } as const;

    expect(isFsrsParameterResolutionV31(exact)).toBe(true);
    expect(fsrsParameterResolutionSchema.safeParse({
      ...exact,
      attempts: [exact.attempts[1], exact.attempts[0], exact.attempts[2]],
    }).success).toBe(false);
  });
});
