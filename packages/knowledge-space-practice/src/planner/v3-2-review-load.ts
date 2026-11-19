import { z } from "zod";

import {
  reviewLoadAssessmentV3_2Schema,
  reviewLoadConfigV3_2Schema,
  type ReviewLoadAssessmentV3_2,
} from "./v3-2-review-load-contract";

const reviewLoadInputSchema = z
  .object({
    asOf: z.string().datetime({ offset: true }),
    maxReviewsPerDay: z.number().int().positive(),
    cards: z.array(
      z
        .object({
          cardId: z
            .string()
            .min(1)
            .refine((value) => value.trim() === value),
          dueDate: z.string().datetime({ offset: true }),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((input, ctx) => {
    const ids = new Set(input.cards.map((card) => card.cardId));
    if (ids.size !== input.cards.length) {
      ctx.addIssue({
        code: "custom",
        path: ["cards"],
        message: "Review-load cards must have unique IDs",
      });
    }
  });

export type AssessReviewLoadInputV3_2 = z.input<typeof reviewLoadInputSchema>;

export function assessReviewLoadV3_2(
  rawInput: AssessReviewLoadInputV3_2,
): ReviewLoadAssessmentV3_2 {
  const input = reviewLoadInputSchema.parse(rawInput);
  const config = reviewLoadConfigV3_2Schema.parse({
    maxReviewsPerDay: input.maxReviewsPerDay,
  });
  const horizonEnd = Date.parse(input.asOf) + config.horizonDays * 86_400_000;
  const dueWithinHorizon = input.cards.filter(
    (card) => Date.parse(card.dueDate) <= horizonEnd,
  ).length;
  const projectedDailyLoad = dueWithinHorizon / config.horizonDays;
  const budgetPerDay = config.maxReviewsPerDay * config.loadBudgetFactor;
  const reviewLoadState =
    projectedDailyLoad > budgetPerDay
      ? "saturated"
      : projectedDailyLoad >= budgetPerDay * config.elevatedBudgetFraction
        ? "elevated"
        : "normal";
  const saturated = reviewLoadState === "saturated";
  return reviewLoadAssessmentV3_2Schema.parse({
    schemaVersion: "planner.review-load.v3.2",
    asOf: input.asOf,
    dueWithinHorizon,
    horizonDays: config.horizonDays,
    projectedDailyLoad,
    maxReviewsPerDay: config.maxReviewsPerDay,
    loadBudgetFactor: config.loadBudgetFactor,
    budgetPerDay,
    elevatedBudgetFraction: config.elevatedBudgetFraction,
    reviewLoadState,
    newSkillAllowance: saturated ? "zero" : "allowed",
    guidance: saturated ? "review-day" : "continue",
  });
}
