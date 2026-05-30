import { createEmptyCard, Card, Rating, FSRS } from 'ts-fsrs';
import type { Grade } from 'ts-fsrs';

export type SerializedCardState = {
  due: string | number;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  learning_steps?: number;
  last_review?: string | number | null;
};

export interface ScheduledTerm {
  termSlug: string;
  fsrsState: SerializedCardState;
  scheduledFor: number;
}

export interface ReviewResult {
  masteryDelta: number;
  fsrsState: SerializedCardState;
  scheduledFor: number;
}

const fsrs = new FSRS({});

/**
 * Serializes a card state to a JSON-compatible format for storage.
 * @param card - The FSRS card state to serialize
 * @returns Serialized card state with string dates
 */
export function serializeCard(card: Card): SerializedCardState {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    learning_steps: card.learning_steps,
    last_review: card.last_review ? card.last_review.toISOString() : null,
  };
}

/**
 * Deserializes a stored card state back into an FSRS Card object.
 * @param state - The serialized card state
 * @returns Deserialized Card object
 */
export function deserializeCard(state: SerializedCardState): Card {
  return {
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsed_days,
    scheduled_days: state.scheduled_days,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state,
    learning_steps: state.learning_steps ?? 0,
    last_review: state.last_review ? new Date(state.last_review) : undefined,
  };
}

/**
 * Creates a new scheduled term with initial FSRS card state.
 * @param termSlug - The term slug identifier
 * @returns Scheduled term with initial card state and due time
 */
export function scheduleNewTerm(termSlug: string): ScheduledTerm {
  const card = createEmptyCard();
  const now = new Date();
  const schedulingCards = fsrs.repeat(card, now);
  const firstReview = schedulingCards[Rating.Again];
  return {
    termSlug,
    fsrsState: serializeCard(firstReview.card),
    scheduledFor: firstReview.card.due.getTime(),
  };
}

/**
 * Processes a review rating for a scheduled term and returns updated state.
 * @param scheduledTerm - The scheduled term being reviewed
 * @param rating - The review rating (again, hard, good, easy)
 * @returns Review result with mastery delta and updated card state
 */
export function processReview(
  scheduledTerm: ScheduledTerm,
  rating: 'again' | 'hard' | 'good' | 'easy'
): ReviewResult {
  const card = deserializeCard(scheduledTerm.fsrsState);
  const now = new Date();
  const schedulingCards = fsrs.repeat(card, now);
  const ratingMap: Record<string, Rating> = {
    again: Rating.Again,
    hard: Rating.Hard,
    good: Rating.Good,
    easy: Rating.Easy,
  };
  const review = schedulingCards[ratingMap[rating] as Grade];

  const ratingDeltas = {
    again: -0.2,
    hard: -0.05,
    good: 0.1,
    easy: 0.2,
  };
  const masteryDelta = ratingDeltas[rating];

  return {
    masteryDelta,
    fsrsState: serializeCard(review.card),
    scheduledFor: review.card.due.getTime(),
  };
}

/**
 * Filters scheduled terms to find those that are due for review.
 * @param scheduledTerms - Array of scheduled terms
 * @param now - Current timestamp in milliseconds (defaults to Date.now())
 * @returns Array of terms that are due
 */
export function getDueTerms(
  scheduledTerms: ScheduledTerm[],
  now: number = Date.now()
): ScheduledTerm[] {
  return scheduledTerms.filter((term) => term.scheduledFor <= now);
}

/**
 * Maps a numeric mastery score to a proficiency band category.
 * @param masteryScore - Numeric mastery score (0-1 range)
 * @returns Proficiency band category string
 */
export function proficiencyBand(masteryScore: number): 'new' | 'learning' | 'familiar' | 'mastered' {
  if (masteryScore === 0) return 'new';
  if (masteryScore < 0.3) return 'learning';
  if (masteryScore < 0.7) return 'familiar';
  return 'mastered';
}

/**
 * Applies a delta to the current mastery score, clamped to [0, 1].
 * @param currentScore - The current mastery score
 * @param delta - The delta to apply
 * @returns Updated mastery score clamped to valid range
 */
export function updateMastery(currentScore: number, delta: number): number {
  const newScore = currentScore + delta;
  return Math.max(0, Math.min(1, newScore));
}
