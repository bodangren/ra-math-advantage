import { createCard as pkgCreateCard, reviewCard as pkgReviewCard, getDueCards as pkgGetDueCards } from '@math-platform/srs-engine';
import type { SrsCardState, SrsRating } from '@math-platform/srs-engine';

export type { SrsCardState, SrsRating };

export function createCard(params: {
  studentId: string;
  objectiveId: string;
  problemFamilyId: string;
  now?: string;
}) {
  return pkgCreateCard(params);
}

export function reviewCard(card: SrsCardState, rating: SrsRating, now?: string) {
  return pkgReviewCard(card, rating, now);
}

export function getDueCards(cards: SrsCardState[], now?: string): SrsCardState[] {
  return pkgGetDueCards(cards, now);
}

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