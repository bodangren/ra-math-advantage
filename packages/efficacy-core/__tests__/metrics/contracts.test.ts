/**
 * Phase 1 Red — Outcome-metric contract tests (Task 1).
 *
 * These tests assert the contract shape and version of every metric output
 * defined by FR1 + the test-strategy §7 (artifact/contract tests). They
 * intentionally import from `../../src/contracts` (which does not yet exist
 * at HEAD); the Red command must fail with ERR_MODULE_NOT_FOUND. Once the
 * implementer ships `src/contracts.ts`, these schemas + version are the
 * frozen surface for FR1.
 *
 * No-PII rule (test-strategy §5): every metric output schema must contain
 * only ids + counts + ratios + bucketed timestamps. The rejection cases
 * below pin that intent.
 */

import { describe, it, expect } from 'vitest';

import {
  EFFICACY_CONTRACT_VERSION,
  RetentionPointSchema,
  TimeToMasteryStatSchema,
  AccuracyTrendPointSchema,
  ReviewSuccessRateSchema,
  MetricResultSchema,
  type RetentionPoint,
  type TimeToMasteryStat,
  type AccuracyTrendPoint,
  type ReviewSuccessRate,
  type MetricResult,
} from '../../src/contracts';

describe('EFFICACY_CONTRACT_VERSION', () => {
  it('is the canonical v1 string', () => {
    expect(EFFICACY_CONTRACT_VERSION).toBe('efficacy.contract.v1');
  });
});

describe('RetentionPointSchema', () => {
  it('accepts a valid bucketed retention point', () => {
    const point: RetentionPoint = {
      bucketStartMs: Date.UTC(2026, 3, 1),
      bucketEndMs: Date.UTC(2026, 3, 2),
      averageRetention: 0.72,
      cardCount: 17,
    };
    expect(RetentionPointSchema.parse(point)).toEqual(point);
  });

  it('rejects averageRetention outside [0, 1]', () => {
    expect(() =>
      RetentionPointSchema.parse({
        bucketStartMs: 0,
        bucketEndMs: 1,
        averageRetention: 1.5,
        cardCount: 1,
      }),
    ).toThrow();
    expect(() =>
      RetentionPointSchema.parse({
        bucketStartMs: 0,
        bucketEndMs: 1,
        averageRetention: -0.01,
        cardCount: 1,
      }),
    ).toThrow();
  });

  it('rejects negative or non-integer cardCount', () => {
    expect(() =>
      RetentionPointSchema.parse({
        bucketStartMs: 0,
        bucketEndMs: 1,
        averageRetention: 0.5,
        cardCount: -1,
      }),
    ).toThrow();
    expect(() =>
      RetentionPointSchema.parse({
        bucketStartMs: 0,
        bucketEndMs: 1,
        averageRetention: 0.5,
        cardCount: 1.5,
      }),
    ).toThrow();
  });

  it('rejects PII-like extra fields (no PII rule, strict shape)', () => {
    expect(() =>
      RetentionPointSchema.parse({
        bucketStartMs: 0,
        bucketEndMs: 1,
        averageRetention: 0.5,
        cardCount: 1,
        studentName: 'Jane Doe',
      }),
    ).toThrow();
  });
});

describe('TimeToMasteryStatSchema', () => {
  it('accepts a reached-mastery stat', () => {
    const stat: TimeToMasteryStat = {
      objectiveId: 'obj_quadratic',
      daysToMastery: 12.5,
      reviewsToMastery: 8,
      reachedMastery: true,
    };
    expect(TimeToMasteryStatSchema.parse(stat)).toEqual(stat);
  });

  it('accepts a not-yet-reached stat with null daysToMastery', () => {
    const stat: TimeToMasteryStat = {
      objectiveId: 'obj_quadratic',
      daysToMastery: null,
      reviewsToMastery: 3,
      reachedMastery: false,
    };
    expect(TimeToMasteryStatSchema.parse(stat)).toEqual(stat);
  });

  it('rejects negative daysToMastery', () => {
    expect(() =>
      TimeToMasteryStatSchema.parse({
        objectiveId: 'obj_x',
        daysToMastery: -1,
        reviewsToMastery: 1,
        reachedMastery: true,
      }),
    ).toThrow();
  });

  it('rejects PII-like extra fields', () => {
    expect(() =>
      TimeToMasteryStatSchema.parse({
        objectiveId: 'obj_x',
        daysToMastery: 1,
        reviewsToMastery: 1,
        reachedMastery: true,
        studentEmail: 'a@b.com',
      }),
    ).toThrow();
  });
});

describe('AccuracyTrendPointSchema', () => {
  it('accepts a valid bucketed trend point', () => {
    const point: AccuracyTrendPoint = {
      bucketStartMs: Date.UTC(2026, 3, 1),
      bucketEndMs: Date.UTC(2026, 3, 8),
      firstAttemptAccuracy: 0.83,
      firstAttemptCount: 42,
    };
    expect(AccuracyTrendPointSchema.parse(point)).toEqual(point);
  });

  it('accepts null firstAttemptAccuracy when count is 0', () => {
    const point: AccuracyTrendPoint = {
      bucketStartMs: 0,
      bucketEndMs: 1,
      firstAttemptAccuracy: null,
      firstAttemptCount: 0,
    };
    expect(AccuracyTrendPointSchema.parse(point)).toEqual(point);
  });

  it('rejects firstAttemptAccuracy outside [0, 1]', () => {
    expect(() =>
      AccuracyTrendPointSchema.parse({
        bucketStartMs: 0,
        bucketEndMs: 1,
        firstAttemptAccuracy: 1.01,
        firstAttemptCount: 1,
      }),
    ).toThrow();
  });
});

describe('ReviewSuccessRateSchema', () => {
  it('accepts a populated success rate with rating breakdown', () => {
    const rate: ReviewSuccessRate = {
      successCount: 80,
      totalCount: 100,
      successRate: 0.8,
      ratingBreakdown: { Again: 10, Hard: 10, Good: 60, Easy: 20 },
    };
    expect(ReviewSuccessRateSchema.parse(rate)).toEqual(rate);
  });

  it('accepts an empty-evidence rate with null successRate', () => {
    const rate: ReviewSuccessRate = {
      successCount: 0,
      totalCount: 0,
      successRate: null,
      ratingBreakdown: { Again: 0, Hard: 0, Good: 0, Easy: 0 },
    };
    expect(ReviewSuccessRateSchema.parse(rate)).toEqual(rate);
  });

  it('rejects successCount > totalCount (logical impossibility)', () => {
    expect(() =>
      ReviewSuccessRateSchema.parse({
        successCount: 5,
        totalCount: 4,
        successRate: 1,
        ratingBreakdown: { Again: 0, Hard: 0, Good: 4, Easy: 0 },
      }),
    ).toThrow();
  });

  it('rejects ratingBreakdown missing a canonical SrsRating key', () => {
    expect(() =>
      ReviewSuccessRateSchema.parse({
        successCount: 0,
        totalCount: 0,
        successRate: null,
        ratingBreakdown: { Good: 0 },
      }),
    ).toThrow();
  });
});

describe('MetricResultSchema (traceability wrapper)', () => {
  it('wraps any value with n and inputs descriptor', () => {
    const schema = MetricResultSchema(RetentionPointSchema.array());
    const result: MetricResult<RetentionPoint[], { cardCount: number; windowMs: [number, number] }> = {
      value: [
        {
          bucketStartMs: Date.UTC(2026, 3, 1),
          bucketEndMs: Date.UTC(2026, 3, 2),
          averageRetention: 0.5,
          cardCount: 3,
        },
      ],
      n: 3,
      inputs: { cardCount: 3, windowMs: [Date.UTC(2026, 3, 1), Date.UTC(2026, 3, 2)] },
    };
    expect(schema.parse(result)).toEqual(result);
  });

  it('rejects negative n', () => {
    const schema = MetricResultSchema(RetentionPointSchema.array());
    expect(() =>
      schema.parse({
        value: [],
        n: -1,
        inputs: { cardCount: 0, windowMs: [0, 1] },
      }),
    ).toThrow();
  });
});
