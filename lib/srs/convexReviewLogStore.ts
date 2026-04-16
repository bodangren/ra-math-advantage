import type { SrsReviewLogEntry } from "./contract";
import type { ReviewLogStore } from "./adapters";
import { internal } from "@/convex/_generated/api";
import { type MutationCtx, type QueryCtx } from "@/convex/_generated/server";

export class ConvexReviewLogStore implements ReviewLogStore {
  private ctx: MutationCtx | QueryCtx;

  constructor(ctx: MutationCtx | QueryCtx) {
    this.ctx = ctx;
  }

  async saveReview(entry: SrsReviewLogEntry): Promise<void> {
    await this.ctx.runMutation(internal.srs.reviews.saveReview, {
      reviewId: entry.reviewId,
      cardId: entry.cardId,
      studentId: entry.studentId,
      rating: entry.rating,
      submissionId: entry.submissionId,
      evidence: entry.evidence,
      stateBefore: entry.stateBefore,
      stateAfter: entry.stateAfter,
      reviewedAt: entry.reviewedAt,
    });
  }

  async getReviewsByCard(cardId: string): Promise<SrsReviewLogEntry[]> {
    const result = await this.ctx.runQuery(internal.srs.reviews.getReviewsByCard, {
      cardId,
    });
    return result;
  }

  async getReviewsByStudent(
    studentId: string,
    since?: string
  ): Promise<SrsReviewLogEntry[]> {
    const result = await this.ctx.runQuery(
      internal.srs.reviews.getReviewsByStudent,
      {
        studentId,
        since,
      }
    );
    return result;
  }
}

export function createConvexReviewLogStore(
  ctx: MutationCtx | QueryCtx
): ConvexReviewLogStore {
  return new ConvexReviewLogStore(ctx);
}
