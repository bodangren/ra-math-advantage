import { createCard as pkgCreateCard, reviewCard as pkgReviewCard, getDueCards as pkgGetDueCards } from '@math-platform/srs-engine';
import type { SrsCardState, SrsRating } from '@math-platform/srs-engine';

export type { SrsCardState, SrsRating };

/**
 * Creates a new SRS card for a student problem.
 * @param params - Card creation parameters (studentId, objectiveId, problemFamilyId, now)
 * @returns The created card state
 */
export function createCard(params: {
  studentId: string;
  objectiveId: string;
  problemFamilyId: string;
  now?: string;
}) {
  return pkgCreateCard(params);
}

/**
 * Reviews an SRS card with a rating and returns updated state.
 * @param card - The card state to review
 * @param rating - The review rating (Again, Hard, Good, Easy)
 * @param now - Optional current time ISO string
 * @returns Updated card state after review
 */
export function reviewCard(card: SrsCardState, rating: SrsRating, now?: string) {
  return pkgReviewCard(card, rating, now);
}

/**
 * Filters cards to only those due for review.
 * @param cards - Array of card states
 * @param now - Optional current time ISO string
 * @returns Array of cards that are due
 */
export function getDueCards(cards: SrsCardState[], now?: string): SrsCardState[] {
  return pkgGetDueCards(cards, now);
}

/**
 * Creates a new card with legacy format compatibility.
 * @param problemFamilyId - The problem family identifier
 * @param studentId - The student identifier
 * @returns Legacy-formatted card object with due date and review data
 */
export function createNewCard(problemFamilyId: string, studentId: string): {
  problemFamilyId: string;
  studentId: string;
  card: Record<string, unknown>;
  due: number;
  lastReview: number;
  reviewCount: number;
  createdAt: number;
} {
  const now = new Date().toISOString();
  const newCard = pkgCreateCard({
    studentId,
    objectiveId: problemFamilyId,
    problemFamilyId,
    now,
  });
  return {
    problemFamilyId: newCard.problemFamilyId,
    studentId: newCard.studentId,
    card: {
      due: newCard.dueDate,
      stability: newCard.stability,
      difficulty: newCard.difficulty,
      elapsed_days: newCard.elapsedDays,
      scheduled_days: newCard.scheduledDays,
      reps: newCard.reps,
      lapses: newCard.lapses,
      learning_steps: 0,
      state: newCard.state === 'new' ? 0 : newCard.state === 'learning' ? 1 : newCard.state === 'review' ? 2 : 3,
      last_review: newCard.lastReview,
    },
    due: new Date(newCard.dueDate).getTime(),
    lastReview: newCard.lastReview ? new Date(newCard.lastReview).getTime() : 0,
    reviewCount: newCard.reps,
    createdAt: new Date(newCard.createdAt).getTime(),
  };
}

/**
 * Reviews a card using the legacy format.
 * @param card - Legacy card format with problemFamilyId, studentId, card data, due, etc.
 * @param rating - The review rating (Again, Hard, Good, Easy)
 * @returns Updated legacy card format after review
 */
export function reviewCardLegacy(card: {
  problemFamilyId: string;
  studentId: string;
  card: Record<string, unknown>;
  due: number;
  lastReview: number;
  reviewCount: number;
  createdAt: number;
}, rating: 'Again' | 'Hard' | 'Good' | 'Easy'): {
  problemFamilyId: string;
  studentId: string;
  card: Record<string, unknown>;
  due: number;
  lastReview: number;
  reviewCount: number;
  createdAt: number;
} {
  const stateMap: Record<number, 'new' | 'learning' | 'review' | 'relearning'> = {
    0: 'new',
    1: 'learning',
    2: 'review',
    3: 'relearning',
  };
  const newCard = pkgReviewCard({
    cardId: `legacy_${Date.now()}`,
    studentId: card.studentId,
    objectiveId: card.problemFamilyId,
    problemFamilyId: card.problemFamilyId,
    stability: card.card.stability as number ?? 0,
    difficulty: card.card.difficulty as number ?? 0,
    state: stateMap[card.card.state as number] ?? 'new',
    dueDate: new Date(card.due).toISOString(),
    elapsedDays: card.card.elapsed_days as number ?? 0,
    scheduledDays: card.card.scheduled_days as number ?? 0,
    reps: card.reviewCount,
    lapses: card.card.lapses as number ?? 0,
    lastReview: card.lastReview ? new Date(card.lastReview).toISOString() : null,
    createdAt: new Date(card.createdAt).toISOString(),
    updatedAt: new Date().toISOString(),
  }, rating);

  return {
    problemFamilyId: newCard.problemFamilyId,
    studentId: newCard.studentId,
    card: {
      due: newCard.dueDate,
      stability: newCard.stability,
      difficulty: newCard.difficulty,
      elapsed_days: newCard.elapsedDays,
      scheduled_days: newCard.scheduledDays,
      reps: newCard.reps,
      lapses: newCard.lapses,
      learning_steps: 0,
      state: newCard.state === 'new' ? 0 : newCard.state === 'learning' ? 1 : newCard.state === 'review' ? 2 : 3,
      last_review: newCard.lastReview,
    },
    due: new Date(newCard.dueDate).getTime(),
    lastReview: newCard.lastReview ? new Date(newCard.lastReview).getTime() : 0,
    reviewCount: newCard.reps,
    createdAt: card.createdAt,
  };
}

/**
 * Returns all cards that are due for review, sorted by due date.
 * @param cards - Array of legacy card format objects
 * @param now - Optional cutoff timestamp in milliseconds
 * @returns Array of due cards sorted by due date
 */
export function getCardsDue(cards: {
  problemFamilyId: string;
  studentId: string;
  card: Record<string, unknown>;
  due: number;
  lastReview: number;
  reviewCount: number;
  createdAt: number;
}[], now?: number): {
  problemFamilyId: string;
  studentId: string;
  card: Record<string, unknown>;
  due: number;
  lastReview: number;
  reviewCount: number;
  createdAt: number;
}[] {
  const cutoff = now ?? Date.now();
  return cards
    .filter((c) => c.due <= cutoff)
    .sort((a, b) => a.due - b.due);
}