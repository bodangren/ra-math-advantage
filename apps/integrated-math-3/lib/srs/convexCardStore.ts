import type { SrsCardState } from "./contract";
import type { CardStore } from "./adapters";
import { internal } from "@/convex/_generated/api";
import { type MutationCtx } from "@/convex/_generated/server";

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
      studentId,
    });
    return result;
  }

  async getCardByStudentAndFamily(studentId: string, problemFamilyId: string): Promise<SrsCardState | null> {
    const result = await this.ctx.runQuery(internal.srs.cards.getCardByStudentAndFamily, {
      studentId,
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
      studentId,
      asOfDate: now,
    });
    return result;
  }

  async saveCard(card: SrsCardState): Promise<void> {
    await this.ctx.runMutation(internal.srs.cards.saveCard, {
      cardId: card.cardId,
      studentId: card.studentId,
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
        studentId: card.studentId,
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
}

export function createConvexCardStore(
  ctx: MutationCtx
): ConvexCardStore {
  return new ConvexCardStore(ctx);
}