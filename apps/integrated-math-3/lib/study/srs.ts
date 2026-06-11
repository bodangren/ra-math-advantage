import { createEmptyCard, Card, Rating, FSRS, Grade } from 'ts-fsrs';
import type { ScheduledTerm, ReviewResult, ProficiencyBand } from './types';

const fsrs = new FSRS({});

/** Creates a new scheduled term with an initial FSRS card state for the given slug. */
export function scheduleNewTerm(termSlug: string): ScheduledTerm {
  const card = createEmptyCard();
  const now = new Date();
  const schedulingCards = fsrs.repeat(card, now);
  const firstReview = schedulingCards[Rating.Again];
  return {
    termSlug,
    fsrsState: firstReview.card as unknown,
    scheduledFor: firstReview.card.due.getTime(),
  };
}

/** Processes an SRS review, returning the updated FSRS state and mastery delta. */
export function processReview(
  scheduledTerm: ScheduledTerm,
  rating: 'again' | 'hard' | 'good' | 'easy'
): ReviewResult {
  const card = scheduledTerm.fsrsState as Card;
  const now = new Date();
  const schedulingCards = fsrs.repeat(card, now);
  const ratingMap: Record<string, Grade> = {
    again: Rating.Again,
    hard: Rating.Hard,
    good: Rating.Good,
    easy: Rating.Easy,
  };
  const review = schedulingCards[ratingMap[rating]];

  const ratingDeltas = {
    again: -0.2,
    hard: -0.05,
    good: 0.1,
    easy: 0.2,
  };
  const masteryDelta = ratingDeltas[rating];

  return {
    masteryDelta,
    fsrsState: review.card as unknown,
    scheduledFor: review.card.due.getTime(),
  };
}

/** Filters scheduled terms to those due on or before the given timestamp. */
export function getDueTerms(
  scheduledTerms: ScheduledTerm[],
  now: number = Date.now()
): ScheduledTerm[] {
  return scheduledTerms.filter((term) => term.scheduledFor <= now);
}

/** Maps a mastery score to a discrete proficiency band. */
export function proficiencyBand(masteryScore: number): ProficiencyBand {
  if (masteryScore === 0) return 'new';
  if (masteryScore < 0.3) return 'learning';
  if (masteryScore < 0.7) return 'familiar';
  return 'mastered';
}

/** Applies a mastery delta and clamps the result to the [0, 1] range. */
export function updateMastery(currentScore: number, delta: number): number {
  const newScore = currentScore + delta;
  return Math.max(0, Math.min(1, newScore));
}
