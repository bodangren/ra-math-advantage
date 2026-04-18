/**
 * SRS Persistence Adapter Interfaces
 *
 * Defines `CardStore` and `ReviewLogStore` interfaces for SRS card and review
 * log persistence. These interfaces are intentionally agnostic to the
 * underlying storage layer so that the SRS core library remains pure and
 * testable.
 *
 * ## In-Memory Implementations
 *
 * `InMemoryCardStore` and `InMemoryReviewLogStore` are provided for unit
 * testing and local development. They are not suitable for production use.
 *
 * ## Convex Implementations (Track 5)
 *
 * Track 5 will provide Convex-backed adapters that implement these interfaces.
 * A Convex adapter should:
 *
 * 1. Map `SrsCardState` fields to/from Convex `srs_cards` table columns.
 * 2. Map `SrsReviewLogEntry` fields to/from Convex `srs_review_log` table
 *    columns.
 * 3. Use Convex indexes for efficient queries:
 *    - `by_student_due`: query due cards by studentId and dueDate
 *    - `by_card`: query review logs by cardId
 *    - `by_student_reviewedAt`: query review logs by studentId and reviewedAt
 * 4. Treat `saveCard`/`saveCards` as upserts (insert or overwrite).
 * 5. Keep all date fields as ISO strings for serialization safety.
 */

import type { SrsCardState, SrsReviewLogEntry } from './contract';

/**
 * Persistence adapter for SRS card state.
 *
 * Implementations may be backed by Convex, a REST API, an in-memory map,
 * or any other storage layer. The interface is intentionally simple to
 * keep the SRS core library storage-agnostic.
 *
 * @example
 * ```ts
 * const store: CardStore = new InMemoryCardStore();
 * await store.saveCard(card);
 * const retrieved = await store.getCard(card.cardId);
 * ```
 */
export interface CardStore {
  /**
   * Retrieve a single card by its unique cardId.
   * Returns null if not found.
   */
  getCard(id: string): Promise<SrsCardState | null>;

  /**
   * Retrieve all cards belonging to a student.
   */
  getCardsByStudent(studentId: string): Promise<SrsCardState[]>;

  /**
   * Retrieve all cards for a specific objective.
   */
  getCardsByObjective(objectiveId: string): Promise<SrsCardState[]>;

  /**
   * Retrieve a single card by student and problem family.
   * Returns null if not found.
   */
  getCardByStudentAndFamily(studentId: string, problemFamilyId: string): Promise<SrsCardState | null>;

  /**
   * Retrieve cards due for review for a given student at the given time.
   * Filters cards where dueDate <= now.
   */
  getDueCards(studentId: string, now: string): Promise<SrsCardState[]>;

  /**
   * Save (upsert) a single card.
   */
  saveCard(card: SrsCardState): Promise<void>;

  /**
   * Save (upsert) multiple cards in one call.
   */
  saveCards(cards: SrsCardState[]): Promise<void>;
}

/**
 * Persistence adapter for SRS review log entries.
 *
 * @example
 * ```ts
 * const store: ReviewLogStore = new InMemoryReviewLogStore();
 * await store.saveReview(reviewLogEntry);
 * const history = await store.getReviewsByCard(card.cardId);
 * ```
 */
export interface ReviewLogStore {
  /**
   * Save a single review log entry.
   */
  saveReview(entry: SrsReviewLogEntry): Promise<void>;

  /**
   * Retrieve all review log entries for a specific card.
   * Ordered by reviewedAt ascending.
   */
  getReviewsByCard(cardId: string): Promise<SrsReviewLogEntry[]>;

  /**
   * Retrieve all review log entries for a specific student.
   * Optionally filter to entries reviewed at or after `since`.
   * Ordered by reviewedAt ascending.
   */
  getReviewsByStudent(studentId: string, since?: string): Promise<SrsReviewLogEntry[]>;
}

/**
 * In-memory implementation of `CardStore` for testing and local development.
 *
 * @example
 * ```ts
 * const store = new InMemoryCardStore();
 * await store.saveCard(card);
 * const due = await store.getDueCards('stu_001', new Date().toISOString());
 * ```
 */
export class InMemoryCardStore implements CardStore {
  private cards = new Map<string, SrsCardState>();

  async getCard(id: string): Promise<SrsCardState | null> {
    return this.cards.get(id) ?? null;
  }

  async getCardsByStudent(studentId: string): Promise<SrsCardState[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.studentId === studentId
    );
  }

  async getCardByStudentAndFamily(studentId: string, problemFamilyId: string): Promise<SrsCardState | null> {
    return Array.from(this.cards.values()).find(
      (card) => card.studentId === studentId && card.problemFamilyId === problemFamilyId
    ) ?? null;
  }

  async getCardsByObjective(objectiveId: string): Promise<SrsCardState[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.objectiveId === objectiveId
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
}

/**
 * In-memory implementation of `ReviewLogStore` for testing and local
 * development.
 *
 * @example
 * ```ts
 * const store = new InMemoryReviewLogStore();
 * await store.saveReview(entry);
 * const recent = await store.getReviewsByStudent('stu_001', '2026-01-01T00:00:00Z');
 * ```
 */
export class InMemoryReviewLogStore implements ReviewLogStore {
  private reviews: SrsReviewLogEntry[] = [];

  async saveReview(entry: SrsReviewLogEntry): Promise<void> {
    this.reviews.push(entry);
  }

  async getReviewsByCard(cardId: string): Promise<SrsReviewLogEntry[]> {
    return this.reviews
      .filter((review) => review.cardId === cardId)
      .sort((a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime());
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
      .sort((a, b) => new Date(a.reviewedAt).getTime() - new Date(b.reviewedAt).getTime());
  }
}
