import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import {
  srsCardStatePickValidator,
  srsEvidenceValidator,
  srsRatingValidator,
} from "./validators";

type SrsStatePick = {
  stability: number;
  difficulty: number;
  state: "new" | "learning" | "review" | "relearning";
  reps: number;
  lapses: number;
};

// COPIED from packages/srs-engine/src/srs/transition-validator.ts — DO NOT EDIT WITHOUT SYNCING
const VALID_STATE_TRANSITIONS: Record<string, string[]> = {
  new: ['learning', 'review'],
  learning: ['learning', 'review'],
  review: ['learning', 'review'],
  relearning: ['learning', 'review'],
};

/**
 * Validates an SRS state transition by enforcing business rules.
 * @param {SrsStatePick} stateBefore - The SRS state before the review
 * @param {SrsStatePick} stateAfter - The SRS state after the review
 * @throws Error if reps does not increase by 1, lapses decreases,
 *         or state transition is invalid
 */
function validateSrsTransition(
  stateBefore: SrsStatePick,
  stateAfter: SrsStatePick,
): void {
  if (stateAfter.reps !== stateBefore.reps + 1) {
    throw new Error(
      `reps must increase by exactly 1 (before: ${stateBefore.reps}, after: ${stateAfter.reps})`
    );
  }
  if (stateAfter.lapses < stateBefore.lapses) {
    throw new Error(
      `lapses cannot decrease (before: ${stateBefore.lapses}, after: ${stateAfter.lapses})`
    );
  }
  const allowedNextStates = VALID_STATE_TRANSITIONS[stateBefore.state];
  if (!allowedNextStates?.includes(stateAfter.state)) {
    throw new Error(
      `invalid state transition: ${stateBefore.state} → ${stateAfter.state}`
    );
  }
}

/**
 * Saves a review log entry for an SRS card.
 * @param {MutationCtx} ctx - The mutation context
 * @param {{ reviewId?: string; cardId: Id<"srs_cards">; studentId: Id<"profiles">; rating: "Again" | "Hard" | "Good" | "Easy"; submissionId?: string; evidence: { action: "teacher_reset"; objectiveId: string } | { baseRating: "Again" | "Hard" | "Good" | "Easy"; timingAdjusted: boolean; reasons: string[]; misconceptionTags?: string[] }; stateBefore: { stability: number; difficulty: number; state: "new" | "learning" | "review" | "relearning"; reps: number; lapses: number }; stateAfter: { stability: number; difficulty: number; state: "new" | "learning" | "review" | "relearning"; reps: number; lapses: number }; reviewedAt: string }} args - Review details including card, student, rating, evidence, and state transitions
 * @returns {Promise<Id<"srs_review_log">>} The ID of the inserted review log entry
 * @throws Error if reviewedAt is an invalid date or if state transition validation fails
 */
export async function saveReviewHandler(
  ctx: MutationCtx,
  args: {
    reviewId?: string;
    cardId: Id<"srs_cards">;
    studentId: Id<"profiles">;
    rating: "Again" | "Hard" | "Good" | "Easy";
    submissionId?: string;
    evidence: { action: "teacher_reset"; objectiveId: string } | { baseRating: "Again" | "Hard" | "Good" | "Easy"; timingAdjusted: boolean; reasons: string[]; misconceptionTags?: string[] };
    stateBefore: { stability: number; difficulty: number; state: "new" | "learning" | "review" | "relearning"; reps: number; lapses: number };
    stateAfter: { stability: number; difficulty: number; state: "new" | "learning" | "review" | "relearning"; reps: number; lapses: number };
    reviewedAt: string;
  }
) {
  // Teacher resets bypass SRS transition validation because they are administrative
  // overrides, not learner reviews. The reset action reinitializes the card state.
  if (!('action' in args.evidence)) {
    validateSrsTransition(args.stateBefore, args.stateAfter);
  }

  const reviewedAtMs = new Date(args.reviewedAt).getTime();
  if (Number.isNaN(reviewedAtMs)) {
    throw new Error(`Invalid reviewedAt date: ${args.reviewedAt}`);
  }
  const id = await ctx.db.insert("srs_review_log", {
    cardId: args.cardId,
    studentId: args.studentId,
    rating: args.rating,
    reviewId: args.reviewId,
    submissionId: args.submissionId,
    evidence: args.evidence,
    stateBefore: args.stateBefore,
    stateAfter: args.stateAfter,
    reviewedAt: reviewedAtMs,
  });
  return id;
}

/**
 * Internal mutation for saving SRS review log entries. Delegates to
 * `saveReviewHandler`, which validates the SRS state transition (reps
 * delta, lapses monotonicity, state transition) and rejects invalid
 * `reviewedAt` timestamps.
 * @returns {Promise<Id<"srs_review_log">>} The ID of the inserted review log entry
 * @throws Error if `reviewedAt` is an invalid date or if the SRS state transition validation fails
 */
export const saveReview = internalMutation({
  args: {
    reviewId: v.optional(v.string()),
    cardId: v.id("srs_cards"),
    studentId: v.id("profiles"),
    rating: srsRatingValidator,
    submissionId: v.optional(v.string()),
    evidence: srsEvidenceValidator,
    stateBefore: srsCardStatePickValidator,
    stateAfter: srsCardStatePickValidator,
    reviewedAt: v.string(),
  },
  handler: saveReviewHandler,
});

/**
 * Retrieves all review log entries for a specific SRS card.
 * @param {QueryCtx} ctx - The query context
 * @param {{ cardId: Id<"srs_cards"> }} args - The card ID to query reviews for
 * @returns {Promise<Doc<"srs_review_log">[]>} Array of review entries sorted by reviewedAt timestamp
 */
export async function getReviewsByCardHandler(
  ctx: QueryCtx,
  args: { cardId: Id<"srs_cards"> }
) {
  const reviews = await ctx.db
    .query("srs_review_log")
    .withIndex("by_card", (q) =>
      q.eq("cardId", args.cardId)
    )
    .collect();
  return reviews
    .sort((a, b) => a.reviewedAt - b.reviewedAt)
    .map((review) => ({
      reviewId: review.reviewId ?? review._id,
      cardId: review.cardId,
      studentId: review.studentId,
      rating: review.rating,
      submissionId: review.submissionId ?? "",
      evidence: review.evidence,
      stateBefore: review.stateBefore,
      stateAfter: review.stateAfter,
      reviewedAt: new Date(review.reviewedAt).toISOString(),
    }));
}

/**
 * Internal query that returns every review log entry for a specific SRS
 * card, sorted by `reviewedAt` ascending.
 * @returns {Promise<Array<{ reviewId: string; cardId: Id<"srs_cards">; studentId: Id<"profiles">; rating: string; submissionId: string; evidence: object; stateBefore: object; stateAfter: object; reviewedAt: string }>>} Array of review entries
 */
export const getReviewsByCard = internalQuery({
  args: { cardId: v.id("srs_cards") },
  handler: getReviewsByCardHandler,
});

/**
 * Retrieves all review log entries for a specific student.
 * @param {QueryCtx} ctx - The query context
 * @param {{ studentId: Id<"profiles">; since?: string }} args - The student ID and optional since filter
 * @returns {Promise<Doc<"srs_review_log">[]>} Array of review entries sorted by reviewedAt timestamp
 * @throws Error if since date is invalid
 */
export async function getReviewsByStudentHandler(
  ctx: QueryCtx,
  args: { studentId: Id<"profiles">; since?: string }
) {
  let sinceMs: number | undefined;
  if (args.since) {
    sinceMs = new Date(args.since).getTime();
    if (Number.isNaN(sinceMs)) {
      throw new Error(`Invalid since date: ${args.since}`);
    }
  }
  const reviews = await ctx.db
    .query("srs_review_log")
    .withIndex("by_student", (q) =>
      q.eq("studentId", args.studentId)
    )
    .collect();
  return reviews
    .filter((review) =>
      sinceMs === undefined ? true : review.reviewedAt >= sinceMs
    )
    .sort((a, b) => a.reviewedAt - b.reviewedAt)
    .map((review) => ({
      reviewId: review.reviewId ?? review._id,
      cardId: review.cardId,
      studentId: review.studentId,
      rating: review.rating,
      submissionId: review.submissionId ?? "",
      evidence: review.evidence,
      stateBefore: review.stateBefore,
      stateAfter: review.stateAfter,
      reviewedAt: new Date(review.reviewedAt).toISOString(),
    }));
}

/**
 * Internal query that returns every review log entry for a specific
 * student, optionally filtered to reviews on/after the supplied
 * `since` timestamp. Sorted by `reviewedAt` ascending.
 * @returns {Promise<Array<{ reviewId: string; cardId: Id<"srs_cards">; studentId: Id<"profiles">; rating: string; submissionId: string; evidence: object; stateBefore: object; stateAfter: object; reviewedAt: string }>>} Array of review entries
 * @throws Error if `since` is supplied and is an invalid date
 */
export const getReviewsByStudent = internalQuery({
  args: { studentId: v.id("profiles"), since: v.optional(v.string()) },
  handler: getReviewsByStudentHandler,
});
