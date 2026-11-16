import { z } from 'zod';

const EPSILON = 1e-9;

export const reviewLoadStateV3_2Schema = z.enum(['normal', 'elevated', 'saturated']);

export const reviewLoadConfigV3_2Schema = z
  .object({
    horizonDays: z.literal(7).default(7),
    maxReviewsPerDay: z.number().int().positive(),
    loadBudgetFactor: z.literal(0.8).default(0.8),
    elevatedBudgetFraction: z.literal(0.6).default(0.6),
  })
  .strict();

export const reviewLoadAssessmentV3_2Schema = z
  .object({
    schemaVersion: z.literal('planner.review-load.v3.2'),
    asOf: z.string().datetime({ offset: true }),
    dueWithinHorizon: z.number().int().min(0),
    horizonDays: z.literal(7),
    projectedDailyLoad: z.number().finite().min(0),
    maxReviewsPerDay: z.number().int().positive(),
    loadBudgetFactor: z.literal(0.8),
    budgetPerDay: z.number().finite().positive(),
    elevatedBudgetFraction: z.literal(0.6),
    reviewLoadState: reviewLoadStateV3_2Schema,
    newSkillAllowance: z.enum(['allowed', 'zero']),
    guidance: z.enum(['continue', 'review-day']),
  })
  .strict()
  .superRefine((assessment, ctx) => {
    const projected = assessment.dueWithinHorizon / assessment.horizonDays;
    const budget = assessment.maxReviewsPerDay * assessment.loadBudgetFactor;
    const state =
      projected > budget
        ? 'saturated'
        : projected >= budget * assessment.elevatedBudgetFraction
          ? 'elevated'
          : 'normal';
    if (Math.abs(assessment.projectedDailyLoad - projected) > EPSILON) {
      ctx.addIssue({ code: 'custom', path: ['projectedDailyLoad'], message: 'Projected load must be due cards divided by seven' });
    }
    if (Math.abs(assessment.budgetPerDay - budget) > EPSILON) {
      ctx.addIssue({ code: 'custom', path: ['budgetPerDay'], message: 'Budget must be max reviews times 0.8' });
    }
    if (assessment.reviewLoadState !== state) {
      ctx.addIssue({ code: 'custom', path: ['reviewLoadState'], message: 'State does not match the load thresholds' });
    }
    const saturated = state === 'saturated';
    if (
      assessment.newSkillAllowance !== (saturated ? 'zero' : 'allowed') ||
      assessment.guidance !== (saturated ? 'review-day' : 'continue')
    ) {
      ctx.addIssue({ code: 'custom', message: 'Saturated load must suppress new skills and surface review-day guidance' });
    }
  });

export type ReviewLoadStateV3_2 = z.infer<typeof reviewLoadStateV3_2Schema>;
export type ReviewLoadConfigV3_2 = z.infer<typeof reviewLoadConfigV3_2Schema>;
export type ReviewLoadAssessmentV3_2 = z.infer<typeof reviewLoadAssessmentV3_2Schema>;
