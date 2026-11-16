/**
 * SRS Queue Primitives
 *
 * Provides the v3 result API and a deprecated array-returning compatibility
 * wrapper for ordering SRS cards into a daily practice session.
 *
 * Queue ordering rules (per spec.md):
 * 1. Exclude cards for triaged objectives and cards with no policy.
 * 2. Select due reviews before new cards.
 * 3. Sort due reviews by current predicted retention ascending.
 * 4. Fill remaining capacity with priority-ordered new cards.
 * 5. Suppress new cards when due reviews exceed the daily cap.
 *
 * All functions are pure — no side effects, no browser/convex imports.
 */

import type {
  DailyQueueResult,
  ObjectivePracticePolicy,
  ObjectivePriority,
  SrsCardState,
  SrsSessionConfig,
} from './contract';
import { stabilityToRetention } from './srs-proficiency';
import { composeSessionV3_2 } from './session-composition';

/**
 * A single item in the daily practice queue.
 */
export type QueueItem = {
  /** The SRS card to be reviewed. */
  card: SrsCardState;
  /** Priority of the objective this card belongs to. */
  objectivePriority: ObjectivePriority;
  /** Whether the card is past its due date. */
  isOverdue: boolean;
  /** Number of whole days the card is overdue (0 if not overdue). */
  daysOverdue: number;
};

const PRIORITY_ORDER: Record<ObjectivePriority, number> = {
  essential: 0,
  supporting: 1,
  extension: 2,
  triaged: 3,
};

const DAY_MS = 24 * 60 * 60 * 1000;

const EMPTY_QUEUE_RESULT: DailyQueueResult<QueueItem> = {
  items: [],
  backlog: false,
  dueReviewCount: 0,
  deferredReviewCount: 0,
  newCardsSuppressed: false,
};

function normalizeCap(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function currentElapsedDays(card: SrsCardState, nowMs: number): number {
  if (card.lastReview !== null) {
    const lastReviewMs = Date.parse(card.lastReview);
    if (Number.isFinite(lastReviewMs)) {
      return Math.max(0, (nowMs - lastReviewMs) / DAY_MS);
    }
  }
  return Number.isFinite(card.elapsedDays) && card.elapsedDays >= 0
    ? card.elapsedDays
    : 0;
}

/**
 * Determine if a card is overdue (past its due date and in review/relearning state).
 */
export function isOverdue(card: SrsCardState, now: string): boolean {
  if (card.state === 'new' || card.state === 'learning') {
    return false;
  }
  const dueMs = new Date(card.dueDate).getTime();
  const nowMs = new Date(now).getTime();
  return dueMs < nowMs;
}

/**
 * Calculate how many days overdue a card is.
 * Returns 0 for non-overdue cards.
 */
export function daysOverdue(card: SrsCardState, now: string): number {
  if (!isOverdue(card, now)) {
    return 0;
  }
  const dueMs = new Date(card.dueDate).getTime();
  const nowMs = new Date(now).getTime();
  const diffMs = nowMs - dueMs;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Build a v3 daily practice queue with explicit backlog metadata.
 *
 * @param {SrsCardState[]} cards - Candidate cards
 * @param {Map<string, ObjectivePracticePolicy>} policies - Policies by objective
 * @param {SrsSessionConfig} config - Daily caps and legacy options
 * @param {string} now - ISO timestamp used for due and retention calculations
 * @returns {DailyQueueResult<QueueItem>} Ordered items and backlog metadata
 */
export function buildDailyQueueResult(
  cards: SrsCardState[],
  policies: Map<string, ObjectivePracticePolicy>,
  config: SrsSessionConfig,
  now: string
): DailyQueueResult<QueueItem> {
  const nowMs = Date.parse(now);
  if (cards.length === 0 || !Number.isFinite(nowMs)) {
    return { ...EMPTY_QUEUE_RESULT, items: [] };
  }

  const newCardsPerDay = normalizeCap(config.newCardsPerDay);
  const maxReviewsPerDay = normalizeCap(config.maxReviewsPerDay);
  const eligibleCards = cards.filter((card) => {
    const policy = policies.get(card.objectiveId);
    return policy !== undefined && policy.priority !== 'triaged';
  });

  const dueReviewCards = eligibleCards.filter((card) => {
    if (card.state === 'new') return false;
    const dueMs = Date.parse(card.dueDate);
    return Number.isFinite(dueMs) && dueMs <= nowMs;
  });
  const dueReviewCount = dueReviewCards.length;
  const backlog = dueReviewCount > maxReviewsPerDay;

  const sortedReviews = dueReviewCards
    .map((card) => ({
      card,
      retention: stabilityToRetention(card.stability, currentElapsedDays(card, nowMs)),
    }))
    .sort((a, b) => {
      if (a.retention !== b.retention) return a.retention - b.retention;
      const objectiveOrder = compareStrings(a.card.objectiveId, b.card.objectiveId);
      if (objectiveOrder !== 0) return objectiveOrder;
      return compareStrings(a.card.cardId, b.card.cardId);
    })
    .slice(0, maxReviewsPerDay)
    .map(({ card }): QueueItem => ({
      card,
      objectivePriority: policies.get(card.objectiveId)!.priority,
      isOverdue: isOverdue(card, now),
      daysOverdue: daysOverdue(card, now),
    }));

  const remainingCapacity = Math.max(0, maxReviewsPerDay - sortedReviews.length);
  const newAllowance = backlog ? 0 : Math.min(newCardsPerDay, remainingCapacity);
  const sortedNew = eligibleCards
    .filter((card) => card.state === 'new')
    .sort((a, b) => {
      const priorityOrder = PRIORITY_ORDER[policies.get(a.objectiveId)!.priority]
        - PRIORITY_ORDER[policies.get(b.objectiveId)!.priority];
      if (priorityOrder !== 0) return priorityOrder;
      const objectiveOrder = compareStrings(a.objectiveId, b.objectiveId);
      if (objectiveOrder !== 0) return objectiveOrder;
      return compareStrings(a.cardId, b.cardId);
    })
    .slice(0, newAllowance)
    .map((card): QueueItem => ({
      card,
      objectivePriority: policies.get(card.objectiveId)!.priority,
      isOverdue: false,
      daysOverdue: 0,
    }));

  const selectedItems = [...sortedReviews, ...sortedNew];
  const itemByCardId = new Map(selectedItems.map((item) => [item.card.cardId, item]));
  const composition = composeSessionV3_2(
    selectedItems.map((item, index) => {
      if (item.objectivePriority === 'triaged') {
        throw new Error('Triaged objectives cannot enter session composition');
      }
      return {
        cardId: item.card.cardId,
        objectiveId: item.card.objectiveId,
        objectivePriority: item.objectivePriority,
        queueKind: item.card.state === 'new' ? 'new' : 'review',
        selectionRank: index + 1,
      };
    }),
  );
  const composedItems = composition.presented.map((presented) => {
    const item = itemByCardId.get(presented.cardId);
    if (!item) throw new Error(`Composed card missing from selected queue: ${presented.cardId}`);
    return item;
  });

  return {
    items: composedItems,
    backlog,
    dueReviewCount,
    deferredReviewCount: Math.max(0, dueReviewCount - sortedReviews.length),
    newCardsSuppressed: backlog,
  };
}

/**
 * Build an array-only daily queue for legacy callers.
 *
 * @deprecated Use `buildDailyQueueResult` to observe backlog metadata.
 */
export function buildDailyQueue(
  cards: SrsCardState[],
  policies: Map<string, ObjectivePracticePolicy>,
  config: SrsSessionConfig,
  now: string
): QueueItem[] {
  return buildDailyQueueResult(cards, policies, config, now).items;
}
