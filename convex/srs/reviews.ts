import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const saveReview = internalMutation({
  args: {
    reviewId: v.string(),
    cardId: v.string(),
    studentId: v.string(),
    rating: v.string(),
    submissionId: v.string(),
    evidence: v.any(),
    stateBefore: v.any(),
    stateAfter: v.any(),
    reviewedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("srs_review_log", {
      cardId: args.cardId as Id<"srs_cards">,
      studentId: args.studentId as Id<"profiles">,
      rating: args.rating,
      reviewId: args.reviewId || undefined,
      submissionId: args.submissionId || undefined,
      evidence: args.evidence,
      stateBefore: args.stateBefore,
      stateAfter: args.stateAfter,
      reviewedAt: new Date(args.reviewedAt).getTime(),
    });
    return id;
  },
});

export const getReviewsByCard = internalQuery({
  args: { cardId: v.string() },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("srs_review_log")
      .withIndex("by_card", (q) =>
        q.eq("cardId", args.cardId as Id<"srs_cards">)
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
  },
});

export const getReviewsByStudent = internalQuery({
  args: { studentId: v.string(), since: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const sinceMs = args.since ? new Date(args.since).getTime() : undefined;
    const reviews = await ctx.db
      .query("srs_review_log")
      .withIndex("by_student", (q) =>
        q.eq("studentId", args.studentId as Id<"profiles">)
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
  },
});
