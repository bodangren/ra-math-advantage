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

export const srsRatingPartV31Schema = z.strictObject({
  partId: z.string().min(1),
  isCorrect: z.boolean(),
  hintsUsed: z.number().int().nonnegative(),
  revealStepsSeen: z.number().int().nonnegative(),
  totalRevealSteps: z.number().int().nonnegative(),
  misconceptionTags: z.array(z.string().min(1)),
}).refine(
  ({ revealStepsSeen, totalRevealSteps }) => revealStepsSeen <= totalRevealSteps,
  {
    message: 'revealStepsSeen cannot exceed totalRevealSteps',
    path: ['revealStepsSeen'],
  },
);

export const srsRatingInputV31Schema = z.strictObject({
  parts: z.array(srsRatingPartV31Schema).min(1),
  timing: z.strictObject({
    confidence: timingConfidenceSchema,
    perPartMs: z.record(z.string().min(1), z.number().finite().nonnegative()),
    baselinesByPart: z.record(z.string().min(1), timingZBaselineSchema),
  }).optional(),
  severityByTag: z.record(z.string().min(1), z.enum(['minor', 'severe'])),
}).refine(
  ({ parts }) => new Set(parts.map(({ partId }) => partId)).size === parts.length,
  {
    message: 'partId values must be unique',
    path: ['parts'],
  },
);

export const ratingCapDecisionSchema = z.strictObject({
  stage: z.enum(['hint', 'reveal', 'misconception']),
  maxRating: z.enum(['Again', 'Hard', 'Good']),
  applied: z.boolean(),
  reason: z.string().min(1),
});

const hintRatingCapDecisionSchema = ratingCapDecisionSchema.extend({
  stage: z.literal('hint'),
});
const revealRatingCapDecisionSchema = ratingCapDecisionSchema.extend({
  stage: z.literal('reveal'),
});
const misconceptionRatingCapDecisionSchema = ratingCapDecisionSchema.extend({
  stage: z.literal('misconception'),
});

export const timingPartDecisionSchema = z.strictObject({
  partId: z.string().min(1),
  zScore: z.number().finite().nullable(),
  band: z.enum(['fast', 'expected', 'slow', 'unavailable']),
}).superRefine(({ zScore, band }, context) => {
  if (band === 'unavailable') {
    if (zScore !== null) {
      context.addIssue({
        code: 'custom',
        message: 'unavailable timing decisions require a null zScore',
        path: ['zScore'],
      });
    }
    return;
  }
  if (zScore === null) {
    context.addIssue({
      code: 'custom',
      message: 'available timing decisions require a numeric zScore',
      path: ['zScore'],
    });
    return;
  }
  const bandMatches = band === 'fast'
    ? zScore <= -1
    : band === 'slow'
      ? zScore >= 2
      : zScore > -1 && zScore < 2;
  if (!bandMatches) {
    context.addIssue({
      code: 'custom',
      message: 'timing band must match the normative z-score thresholds',
      path: ['band'],
    });
  }
});

export const timingRatingDecisionSchema = z.strictObject({
  eligible: z.boolean(),
  confidence: timingConfidenceSchema,
  baselineSampleCount: z.number().int().nonnegative(),
  partDecisions: z.array(timingPartDecisionSchema),
  adjustment: z.enum(['none', 'upgrade_to_easy', 'downgrade_one_step']),
  changedRating: z.boolean(),
  reasons: z.array(z.string().min(1)),
}).superRefine((decision, context) => {
  if (!decision.eligible) {
    if (decision.adjustment !== 'none' || decision.changedRating) {
      context.addIssue({
        code: 'custom',
        message: 'ineligible timing cannot adjust a rating',
        path: ['adjustment'],
      });
    }
    return;
  }

  if (
    decision.confidence === 'low'
    || decision.baselineSampleCount < 10
    || decision.partDecisions.length === 0
    || decision.partDecisions.some(({ band }) => band === 'unavailable')
  ) {
    context.addIssue({
      code: 'custom',
      message: 'eligible timing requires reliable evidence for every part',
      path: ['eligible'],
    });
  }
  if ((decision.adjustment === 'none') === decision.changedRating) {
    context.addIssue({
      code: 'custom',
      message: 'changedRating must reflect whether an adjustment was applied',
      path: ['changedRating'],
    });
  }
  if (
    decision.adjustment === 'upgrade_to_easy'
    && !decision.partDecisions.every(({ band }) => band === 'fast')
  ) {
    context.addIssue({
      code: 'custom',
      message: 'fast upgrade requires every participating part to be fast',
      path: ['adjustment'],
    });
  }
  if (
    decision.adjustment === 'downgrade_one_step'
    && !decision.partDecisions.some(({ band }) => band === 'slow')
  ) {
    context.addIssue({
      code: 'custom',
      message: 'slow downgrade requires at least one slow part',
      path: ['adjustment'],
    });
  }
});

export const srsRatingResultV31Schema = z.strictObject({
  policyVersion: z.literal(SRS_RATING_POLICY_VERSION),
  rating: srsRatingSchema,
  baseRating: srsRatingSchema,
  caps: z.strictObject({
    hint: hintRatingCapDecisionSchema.nullable(),
    reveal: revealRatingCapDecisionSchema.nullable(),
    misconception: misconceptionRatingCapDecisionSchema.nullable(),
    effective: z.enum(['Again', 'Hard', 'Good']).nullable(),
  }),
  timingDecision: timingRatingDecisionSchema,
  timingAdjusted: z.boolean(),
  misconceptionCapped: z.boolean(),
  reasons: z.array(z.string().min(1)),
}).superRefine((result, context) => {
  const ratingOrder = ['Again', 'Hard', 'Good', 'Easy'] as const;
  const capRatings = [result.caps.hint, result.caps.reveal, result.caps.misconception]
    .filter((cap) => cap !== null)
    .map(({ maxRating }) => maxRating);
  const expectedEffective = capRatings.length === 0
    ? null
    : capRatings.reduce((lowest, rating) =>
      ratingOrder.indexOf(rating) < ratingOrder.indexOf(lowest) ? rating : lowest);

  if (result.caps.effective !== expectedEffective) {
    context.addIssue({
      code: 'custom',
      message: 'effective must equal the lowest declared cap',
      path: ['caps', 'effective'],
    });
  }
  if (
    result.caps.effective !== null
    && ratingOrder.indexOf(result.rating) > ratingOrder.indexOf(result.caps.effective)
  ) {
    context.addIssue({
      code: 'custom',
      message: 'rating cannot exceed the effective cap',
      path: ['rating'],
    });
  }
  if (result.timingAdjusted !== result.timingDecision.changedRating) {
    context.addIssue({
      code: 'custom',
      message: 'timingAdjusted must match timingDecision.changedRating',
      path: ['timingAdjusted'],
    });
  }
  if (result.misconceptionCapped !== (result.caps.misconception !== null)) {
    context.addIssue({
      code: 'custom',
      message: 'misconceptionCapped must match misconception cap presence',
      path: ['misconceptionCapped'],
    });
  }
});

export type TimingZBaseline = z.infer<typeof timingZBaselineSchema>;
export type SrsRatingPartV31 = z.infer<typeof srsRatingPartV31Schema>;
export type SrsRatingInputV31 = z.infer<typeof srsRatingInputV31Schema>;
export type RatingCapDecision = z.infer<typeof ratingCapDecisionSchema>;
export type TimingRatingDecision = z.infer<typeof timingRatingDecisionSchema>;
export type SrsRatingResultV31 = z.infer<typeof srsRatingResultV31Schema>;
