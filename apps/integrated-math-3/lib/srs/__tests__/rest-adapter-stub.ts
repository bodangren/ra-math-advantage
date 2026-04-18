/**
 * REST API-backed CardStore / ReviewLogStore stub
 *
 * Simulates a remote REST API using in-memory maps. All methods return
 * Promises to mimic async network round-trips.
 */

import type { CardStore, ReviewLogStore } from '@/lib/srs/adapters';
import type { SrsCardState, SrsReviewLogEntry } from '@/lib/srs/contract';

export class RestAdapterStub implements CardStore, ReviewLogStore {
  private cards = new Map<string, SrsCardState>();
  private reviews: SrsReviewLogEntry[] = [];

  async getCard(id: string): Promise<SrsCardState | null> {
    return this.cards.get(id) ?? null;
  }

  async getCardsByStudent(studentId: string): Promise<SrsCardState[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.studentId === studentId
    );
  }

  async getCardsByObjective(objectiveId: string): Promise<SrsCardState[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.objectiveId === objectiveId
    );
  }

  async getCardByStudentAndFamily(
    studentId: string,
    problemFamilyId: string
  ): Promise<SrsCardState | null> {
    return (
      Array.from(this.cards.values()).find(
        (card) =>
          card.studentId === studentId && card.problemFamilyId === problemFamilyId
      ) ?? null
    );
  }

  async getDueCards(studentId: string, now: string): Promise<SrsCardState[]> {
    const nowMs = new Date(now).getTime();
    return Array.from(this.cards.values()).filter((card) => {
      if (card.studentId !== studentId) return false;
      const dueMs = new Date(card.dueDate).getTime();
      return dueMs <= nowMs;
    });
  }

  async saveCard(card: SrsCardState): Promise<void> {
    this.cards.set(card.cardId, card);
  }

  async saveCards(cards: SrsCardState[]): Promise<void> {
    for (const card of cards) {
      this.cards.set(card.cardId, card);
    }
  }

  async saveReview(entry: SrsReviewLogEntry): Promise<void> {
    this.reviews.push(entry);
  }

  async getReviewsByCard(cardId: string): Promise<SrsReviewLogEntry[]> {
    return this.reviews
      .filter((review) => review.cardId === cardId)
      .sort(
        (a, b) =>
          new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime()
      );
  }

  async getReviewsByStudent(
    studentId: string,
    since?: string
  ): Promise<SrsReviewLogEntry[]> {
    const sinceMs = since ? new Date(since).getTime() : undefined;
    return this.reviews
      .filter((review) => {
        if (review.studentId !== studentId) return false;
        if (sinceMs === undefined) return true;
        return new Date(review.reviewedAt).getTime() >= sinceMs;
      })
      .sort(
        (a, b) =>
          new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime()
      );
  }
}
