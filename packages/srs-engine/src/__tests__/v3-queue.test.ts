import { describe, expect, it } from 'vitest';
import type {
  ObjectivePracticePolicy,
  SrsCardState,
  SrsSessionConfig,
} from '../srs/contract';
import { buildDailyQueue, buildDailyQueueResult } from '../srs/queue';

const NOW = '2026-07-10T12:00:00.000Z';
const DAY_MS = 86_400_000;

const config: SrsSessionConfig = {
  newCardsPerDay: 4,
  maxReviewsPerDay: 20,
  prioritizeOverdue: true,
};

const policy = (
  objectiveId: string,
  priority: ObjectivePracticePolicy['priority'] = 'essential'
): ObjectivePracticePolicy => ({ objectiveId, priority });

const makeCard = (
  overrides: Partial<SrsCardState> & Pick<SrsCardState, 'cardId'>
): SrsCardState => {
  const { cardId, ...rest } = overrides;
  return {
    cardId,
    studentId: 'student-1',
    objectiveId: 'objective-a',
    variantKey: cardId,
    stability: 10,
    difficulty: 5,
    state: 'review',
    dueDate: '2026-07-10T11:00:00.000Z',
    elapsedDays: 0,
    scheduledDays: 10,
    reps: 2,
    lapses: 0,
    lastReview: '2026-06-30T12:00:00.000Z',
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-30T12:00:00.000Z',
    ...rest,
  };
};

const policiesFor = (cards: SrsCardState[]): Map<string, ObjectivePracticePolicy> =>
  new Map(cards.map((card) => [card.objectiveId, policy(card.objectiveId)]));

describe('v3.2 daily queue', () => {
  it('schedules due reviews before new cards by lowest current retention', () => {
    const cards = [
      makeCard({
        cardId: 'high-retention',
        stability: 100,
        lastReview: new Date(Date.parse(NOW) - 12 * DAY_MS).toISOString(),
      }),
      makeCard({
        cardId: 'new-card',
        objectiveId: 'objective-new',
        state: 'new',
        reps: 0,
        lastReview: null,
        dueDate: NOW,
      }),
      makeCard({
        cardId: 'low-retention',
        stability: 5,
        lastReview: new Date(Date.parse(NOW) - 8 * DAY_MS).toISOString(),
      }),
    ];

    const result = buildDailyQueueResult(cards, policiesFor(cards), config, NOW);

    expect(result.items.map((item) => item.card.cardId)).toEqual([
      'low-retention',
      'high-retention',
      'new-card',
    ]);
    expect(result).toMatchObject({
      backlog: false,
      dueReviewCount: 2,
      deferredReviewCount: 0,
      newCardsSuppressed: false,
    });
  });

  it('excludes future reviews, triaged cards, and cards without policies', () => {
    const due = makeCard({ cardId: 'due' });
    const future = makeCard({ cardId: 'future', dueDate: '2026-07-11T12:00:00.000Z' });
    const triaged = makeCard({ cardId: 'triaged', objectiveId: 'triaged-objective' });
    const missing = makeCard({ cardId: 'missing', objectiveId: 'missing-objective' });
    const policies = new Map([
      [due.objectiveId, policy(due.objectiveId)],
      [future.objectiveId, policy(future.objectiveId)],
      [triaged.objectiveId, policy(triaged.objectiveId, 'triaged')],
    ]);

    const result = buildDailyQueueResult([future, triaged, missing, due], policies, config, NOW);
    expect(result.items.map((item) => item.card.cardId)).toEqual(['due']);
  });

  it('enters backlog mode, caps reviews, suppresses new cards, and reports deferrals', () => {
    const reviews = Array.from({ length: 25 }, (_, index) =>
      makeCard({
        cardId: `review-${String(index).padStart(2, '0')}`,
        objectiveId: `objective-${index}`,
        stability: index + 1,
      })
    );
    const newCards = Array.from({ length: 6 }, (_, index) =>
      makeCard({
        cardId: `new-${index}`,
        objectiveId: `new-objective-${index}`,
        state: 'new',
        reps: 0,
        lastReview: null,
        dueDate: NOW,
      })
    );
    const cards = [...newCards, ...reviews];

    const result = buildDailyQueueResult(cards, policiesFor(cards), config, NOW);

    expect(result.items).toHaveLength(20);
    expect(result.items.every((item) => item.card.state !== 'new')).toBe(true);
    expect(result).toMatchObject({
      backlog: true,
      dueReviewCount: 25,
      deferredReviewCount: 5,
      newCardsSuppressed: true,
    });
  });

  it('enforces both caps and orders new cards deterministically by priority then IDs', () => {
    const reviews = Array.from({ length: 12 }, (_, index) =>
      makeCard({ cardId: `review-${index}`, objectiveId: `review-objective-${index}` })
    );
    const newCards = [
      makeCard({ cardId: 'new-z', objectiveId: 'supporting-z', state: 'new', reps: 0, lastReview: null }),
      makeCard({ cardId: 'new-b', objectiveId: 'essential-b', state: 'new', reps: 0, lastReview: null }),
      makeCard({ cardId: 'new-a', objectiveId: 'essential-a', state: 'new', reps: 0, lastReview: null }),
      makeCard({ cardId: 'new-extension', objectiveId: 'extension-a', state: 'new', reps: 0, lastReview: null }),
      makeCard({ cardId: 'new-supporting', objectiveId: 'supporting-a', state: 'new', reps: 0, lastReview: null }),
    ];
    const cards = [...newCards, ...reviews];
    const policies = policiesFor(cards);
    policies.set('supporting-z', policy('supporting-z', 'supporting'));
    policies.set('supporting-a', policy('supporting-a', 'supporting'));
    policies.set('extension-a', policy('extension-a', 'extension'));

    const result = buildDailyQueueResult(cards, policies, config, NOW);
    expect(result.items).toHaveLength(16);
    expect(result.items.slice(12).map((item) => item.card.cardId)).toEqual([
      'new-a',
      'new-b',
      'new-supporting',
      'new-z',
    ]);
  });

  it('breaks equal-retention review ties by objectiveId then cardId', () => {
    const cards = [
      makeCard({ cardId: 'card-z', objectiveId: 'objective-b' }),
      makeCard({ cardId: 'card-b', objectiveId: 'objective-a' }),
      makeCard({ cardId: 'card-a', objectiveId: 'objective-a' }),
    ];
    expect(
      buildDailyQueueResult(cards, policiesFor(cards), config, NOW).items.map(
        (item) => item.card.cardId
      )
    ).toEqual(['card-a', 'card-b', 'card-z']);
  });

  it('fails closed for an invalid clock and normalizes invalid caps to zero', () => {
    const cards = [makeCard({ cardId: 'due' })];
    expect(buildDailyQueueResult(cards, policiesFor(cards), config, 'not-an-iso-date')).toEqual({
      items: [],
      backlog: false,
      dueReviewCount: 0,
      deferredReviewCount: 0,
      newCardsSuppressed: false,
    });
    expect(
      buildDailyQueueResult(
        cards,
        policiesFor(cards),
        { ...config, maxReviewsPerDay: Number.NaN, newCardsPerDay: -4 },
        NOW
      ).items
    ).toEqual([]);
  });

  it('keeps the deprecated array API as a wrapper over the v3 result', () => {
    const cards = [makeCard({ cardId: 'due' })];
    const policies = policiesFor(cards);
    expect(buildDailyQueue(cards, policies, config, NOW)).toEqual(
      buildDailyQueueResult(cards, policies, config, NOW).items
    );
  });
});
