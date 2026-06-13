import { z } from 'zod';

export const EFFICACY_CONTRACT_VERSION = 'efficacy.contract.v1' as const;

// ── RetentionPoint ──────────────────────────────────────────────────

export const RetentionPointSchema = z
  .object({
    bucketStartMs: z.number(),
    bucketEndMs: z.number(),
    averageRetention: z.number().min(0).max(1),
    cardCount: z.number().int().nonnegative(),
  })
  .strict();

export type RetentionPoint = z.infer<typeof RetentionPointSchema>;

// ── TimeToMasteryStat ───────────────────────────────────────────────

export const TimeToMasteryStatSchema = z
  .object({
    objectiveId: z.string(),
    daysToMastery: z.number().nonnegative().nullable(),
    reviewsToMastery: z.number().int().nonnegative(),
    reachedMastery: z.boolean(),
  })
  .strict();

export type TimeToMasteryStat = z.infer<typeof TimeToMasteryStatSchema>;

// ── AccuracyTrendPoint ──────────────────────────────────────────────

export const AccuracyTrendPointSchema = z
  .object({
    bucketStartMs: z.number(),
    bucketEndMs: z.number(),
    firstAttemptAccuracy: z.number().min(0).max(1).nullable(),
    firstAttemptCount: z.number().int().nonnegative(),
  })
  .strict();

export type AccuracyTrendPoint = z.infer<typeof AccuracyTrendPointSchema>;

// ── ReviewSuccessRate ───────────────────────────────────────────────

export const ReviewSuccessRateSchema = z
  .object({
    successCount: z.number().int().nonnegative(),
    totalCount: z.number().int().nonnegative(),
    successRate: z.number().min(0).max(1).nullable(),
    ratingBreakdown: z.object({
      Again: z.number().int().nonnegative(),
      Hard: z.number().int().nonnegative(),
      Good: z.number().int().nonnegative(),
      Easy: z.number().int().nonnegative(),
    }),
  })
  .refine((data) => data.successCount <= data.totalCount, {
    message: 'successCount cannot exceed totalCount',
    path: ['successCount'],
  });

export type ReviewSuccessRate = z.infer<typeof ReviewSuccessRateSchema>;

// ── MetricResult (traceability wrapper) ─────────────────────────────

export type MetricResult<V, I = Record<string, unknown>> = {
  value: V;
  n: number;
  inputs: I;
};

export function MetricResultSchema<V extends z.ZodTypeAny>(valueSchema: V) {
  return z.object({
    value: valueSchema,
    n: z.number().int().nonnegative(),
    inputs: z.record(z.string(), z.unknown()),
  });
}
