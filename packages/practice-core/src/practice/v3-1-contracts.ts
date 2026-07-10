import { z } from 'zod';

export const SRS_RATING_POLICY_VERSION = 'srs-rating.v3.1' as const;
export const TIMING_BASELINE_POLICY_VERSION = 'timing-baseline.v3.1' as const;

const srsRatingSchema = z.enum(['Again', 'Hard', 'Good', 'Easy']);
const timingConfidenceSchema = z.enum(['low', 'medium', 'high']);

export const timingZBaselineSchema = z.strictObject({
  policyVersion: z.literal(TIMING_BASELINE_POLICY_VERSION),
  variantKey: z.string().min(1),
  sampleCount: z.number().int().nonnegative(),
  meanMs: z.number().finite().nonnegative(),
  stdDevMs: z.number().finite().nonnegative(),
  computedAt: z.string().datetime(),
});

export const ratingCapDecisionSchema = z.strictObject({
  stage: z.enum(['hint', 'reveal', 'misconception']),
  maxRating: z.enum(['Again', 'Hard', 'Good']),
  applied: z.boolean(),
  reason: z.string().min(1),
});

export const timingPartDecisionSchema = z.strictObject({
  partId: z.string().min(1),
  zScore: z.number().finite().nullable(),
  band: z.enum(['fast', 'expected', 'slow', 'unavailable']),
});

export const timingRatingDecisionSchema = z.strictObject({
  eligible: z.boolean(),
  confidence: timingConfidenceSchema,
  baselineSampleCount: z.number().int().nonnegative(),
  partDecisions: z.array(timingPartDecisionSchema),
  adjustment: z.enum(['none', 'upgrade_to_easy', 'downgrade_one_step']),
  changedRating: z.boolean(),
  reasons: z.array(z.string().min(1)),
});

export const srsRatingResultV31Schema = z.strictObject({
  policyVersion: z.literal(SRS_RATING_POLICY_VERSION),
  rating: srsRatingSchema,
  baseRating: srsRatingSchema,
  caps: z.strictObject({
    hint: ratingCapDecisionSchema.nullable(),
    reveal: ratingCapDecisionSchema.nullable(),
    misconception: ratingCapDecisionSchema.nullable(),
    effective: z.enum(['Again', 'Hard', 'Good']).nullable(),
  }),
  timingDecision: timingRatingDecisionSchema,
  timingAdjusted: z.boolean(),
  misconceptionCapped: z.boolean(),
  reasons: z.array(z.string().min(1)),
});

export type TimingZBaseline = z.infer<typeof timingZBaselineSchema>;
export type RatingCapDecision = z.infer<typeof ratingCapDecisionSchema>;
export type TimingRatingDecision = z.infer<typeof timingRatingDecisionSchema>;
export type SrsRatingResultV31 = z.infer<typeof srsRatingResultV31Schema>;
