import type { SrsCardState, CardStore, SrsReviewLogEntry } from "@math-platform/srs-engine";
import { internal } from "../../convex/_generated/api";
import { type MutationCtx } from "../../convex/_generated/server";
import { processReviewHandler } from "../../convex/srs/processReview";
import type { Id } from "../../convex/_generated/dataModel";

export class ConvexCardStore implements CardStore {
  private ctx: MutationCtx;

  constructor(ctx: MutationCtx) {
    this.ctx = ctx;
  }

  async getCard(id: string): Promise<SrsCardState | null> {
    const result = await this.ctx.runQuery(internal.srs.cards.getCard, { id });
    return result;
  }

  async getCardsByStudent(studentId: string): Promise<SrsCardState[]> {
    const result = await this.ctx.runQuery(internal.srs.cards.getCardsByStudent, {
      studentId: studentId as Id<"profiles">,
    });
    return result;
  }

  async getCardByStudentAndFamily(studentId: string, problemFamilyId: string): Promise<SrsCardState | null> {
    const result = await this.ctx.runQuery(internal.srs.cards.getCardByStudentAndFamily, {
      studentId: studentId as Id<"profiles">,
      problemFamilyId,
    });
    return result;
  }

  async getCardsByObjective(objectiveId: string): Promise<SrsCardState[]> {
    const result = await this.ctx.runQuery(internal.srs.cards.getCardsByObjective, {
      objectiveId,
    });
    return result;
  }

  async getDueCards(studentId: string, now: string): Promise<SrsCardState[]> {
    const result = await this.ctx.runQuery(internal.srs.cards.getDueCards, {
      studentId: studentId as Id<"profiles">,
      asOfDate: now,
    });
    return result;
  }

  async saveCard(card: SrsCardState): Promise<void> {
    await this.ctx.runMutation(internal.srs.cards.saveCard, {
      cardId: card.cardId,
      studentId: card.studentId as Id<"profiles">,
      objectiveId: card.objectiveId,
      problemFamilyId: card.problemFamilyId,
      stability: card.stability,
      difficulty: card.difficulty,
      state: card.state,
      dueDate: card.dueDate,
      elapsedDays: card.elapsedDays,
      scheduledDays: card.scheduledDays,
      reps: card.reps,
      lapses: card.lapses,
      lastReview: card.lastReview,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
    });
  }

  async saveCards(cards: SrsCardState[]): Promise<void> {
    await this.ctx.runMutation(internal.srs.cards.saveCards, {
      cards: cards.map((card) => ({
        cardId: card.cardId,
        studentId: card.studentId as Id<"profiles">,
        objectiveId: card.objectiveId,
        problemFamilyId: card.problemFamilyId,
        stability: card.stability,
        difficulty: card.difficulty,
        state: card.state,
        dueDate: card.dueDate,
        elapsedDays: card.elapsedDays,
        scheduledDays: card.scheduledDays,
        reps: card.reps,
        lapses: card.lapses,
        lastReview: card.lastReview,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      })),
    });
  }

  /**
   * Atomically save both the updated card and the review log entry in a single
   * Convex transaction. This avoids the non-atomic pattern of separate
   * `runMutation` calls for card and review log.
   */
  async saveCardAndReview(card: SrsCardState, reviewLog: SrsReviewLogEntry): Promise<void> {
    await processReviewHandler(this.ctx, {
      cardState: {
        ...card,
        studentId: card.studentId as Id<"profiles">,
      },
      reviewEntry: {
        reviewId: reviewLog.reviewId,
        cardId: reviewLog.cardId,
        studentId: reviewLog.studentId as Id<"profiles">,
        rating: reviewLog.rating,
        submissionId: reviewLog.submissionId,
        evidence: reviewLog.evidence,
        stateBefore: reviewLog.stateBefore,
        stateAfter: reviewLog.stateAfter,
        reviewedAt: reviewLog.reviewedAt,
      },
    });
  }
}

export function createConvexCardStore(
  ctx: MutationCtx
): ConvexCardStore {
  return new ConvexCardStore(ctx);
}