import { describe, it, expect } from 'vitest';
import type {
  SrsCardState,
  SrsSessionConfig,
  ObjectivePracticePolicy,
  ObjectivePriority,
} from '@/lib/srs/contract';
import { buildDailyQueue, isOverdue, daysOverdue } from '@/lib/srs/queue';

const mockNow = '2026-04-16T12:00:00.000Z';

function createCard(overrides: Partial<SrsCardState>): SrsCardState {
  const objectiveId = overrides.objectiveId ?? 'obj-default';
  return {
    cardId: `card-${Math.random().toString(36).slice(2)}`,
    studentId: 'student-1',
    objectiveId,
    problemFamilyId: 'pf-1',
    stability: 5,
    difficulty: 4,
    state: 'new',
    dueDate: mockNow,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    lastReview: null,
    createdAt: mockNow,
    updatedAt: mockNow,
    ...overrides,
  };
}

function createPolicy(objectiveId: string, priority: ObjectivePriority): ObjectivePracticePolicy {
  return { objectiveId, priority };
}

describe('isOverdue', () => {
  it('should return true when dueDate is in the past', () => {
    const pastDue = createCard({
      objectiveId: 'obj-1',
      dueDate: '2026-04-15T12:00:00.000Z',
      state: 'review',
    });
    expect(isOverdue(pastDue, mockNow)).toBe(true);
  });

  it('should return false when dueDate is in the future', () => {
    const futureDue = createCard({
      objectiveId: 'obj-1',
      dueDate: '2026-04-17T12:00:00.000Z',
      state: 'review',
    });
    expect(isOverdue(futureDue, mockNow)).toBe(false);
  });

  it('should return false when dueDate equals now', () => {
    const exactDue = createCard({
      objectiveId: 'obj-1',
      dueDate: mockNow,
      state: 'review',
    });
    expect(isOverdue(exactDue, mockNow)).toBe(false);
  });

  it('should return false for new cards (not yet in review)', () => {
    const newCard = createCard({ objectiveId: 'obj-1', state: 'new' });
    expect(isOverdue(newCard, mockNow)).toBe(false);
  });
});

describe('daysOverdue', () => {
  it('should return positive days for past due cards', () => {
    const pastDue = createCard({
      objectiveId: 'obj-1',
      dueDate: '2026-04-14T12:00:00.000Z',
      state: 'review',
    });
    expect(daysOverdue(pastDue, mockNow)).toBe(2);
  });

  it('should return 0 for future due cards', () => {
    const futureDue = createCard({
      objectiveId: 'obj-1',
      dueDate: '2026-04-18T12:00:00.000Z',
      state: 'review',
    });
    expect(daysOverdue(futureDue, mockNow)).toBe(0);
  });

  it('should return 0 for cards due exactly now', () => {
    const exactDue = createCard({
      objectiveId: 'obj-1',
      dueDate: mockNow,
      state: 'review',
    });
    expect(daysOverdue(exactDue, mockNow)).toBe(0);
  });
});

describe('buildDailyQueue', () => {
  const essentialPolicy = createPolicy('obj-essential', 'essential');
  const supportingPolicy = createPolicy('obj-supporting', 'supporting');
  const extensionPolicy = createPolicy('obj-extension', 'extension');
  const triagedPolicy = createPolicy('obj-triaged', 'triaged');
  const policies = new Map([
    [essentialPolicy.objectiveId, essentialPolicy],
    [supportingPolicy.objectiveId, supportingPolicy],
    [extensionPolicy.objectiveId, extensionPolicy],
    [triagedPolicy.objectiveId, triagedPolicy],
  ]);

  const defaultConfig: SrsSessionConfig = {
    newCardsPerDay: 5,
    maxReviewsPerDay: 50,
    prioritizeOverdue: true,
  };

  describe('empty input', () => {
    it('should return empty queue for empty cards array', () => {
      const queue = buildDailyQueue([], policies, defaultConfig, mockNow);
      expect(queue).toHaveLength(0);
    });
  });

  describe('triaged objectives excluded', () => {
    it('should exclude cards for triaged objectives entirely', () => {
      const triagedCard = createCard({
        objectiveId: 'obj-triaged',
        state: 'new',
      });
      const queue = buildDailyQueue([triagedCard], policies, defaultConfig, mockNow);
      expect(queue).toHaveLength(0);
    });

    it('should still include cards for non-triaged objectives', () => {
      const essentialCard = createCard({
        objectiveId: 'obj-essential',
        state: 'new',
      });
      const queue = buildDailyQueue([essentialCard], policies, defaultConfig, mockNow);
      expect(queue).toHaveLength(1);
      expect(queue[0].card.objectiveId).toBe('obj-essential');
    });
  });

  describe('new cards ordering', () => {
    it('should place essential new cards before supporting new cards', () => {
      const essentialCard = createCard({
        objectiveId: 'obj-essential',
        state: 'new',
      });
      const supportingCard = createCard({
        objectiveId: 'obj-supporting',
        state: 'new',
      });
      const queue = buildDailyQueue(
        [supportingCard, essentialCard],
        policies,
        defaultConfig,
        mockNow
      );
      expect(queue[0].card.objectiveId).toBe('obj-essential');
      expect(queue[1].card.objectiveId).toBe('obj-supporting');
    });

    it('should place supporting new cards before extension new cards', () => {
      const supportingCard = createCard({
        objectiveId: 'obj-supporting',
        state: 'new',
      });
      const extensionCard = createCard({
        objectiveId: 'obj-extension',
        state: 'new',
      });
      const queue = buildDailyQueue(
        [extensionCard, supportingCard],
        policies,
        defaultConfig,
        mockNow
      );
      expect(queue[0].card.objectiveId).toBe('obj-supporting');
      expect(queue[1].card.objectiveId).toBe('obj-extension');
    });
  });

  describe('newCardsPerDay cap', () => {
    it('should respect newCardsPerDay cap', () => {
      const cards = Array.from({ length: 10 }, () =>
        createCard({ objectiveId: 'obj-essential', state: 'new' })
      );
      const config: SrsSessionConfig = { ...defaultConfig, newCardsPerDay: 3 };
      const queue = buildDailyQueue(cards, policies, config, mockNow);
      const newCards = queue.filter((item) => item.card.state === 'new');
      expect(newCards).toHaveLength(3);
    });

    it('should allow new cards from multiple priorities within the combined quota', () => {
      const essentialCards = Array.from({ length: 3 }, () =>
        createCard({ objectiveId: 'obj-essential', state: 'new' })
      );
      const supportingCards = Array.from({ length: 3 }, () =>
        createCard({ objectiveId: 'obj-supporting', state: 'new' })
      );
      const config: SrsSessionConfig = { ...defaultConfig, newCardsPerDay: 5 };
      const queue = buildDailyQueue(
        [...essentialCards, ...supportingCards],
        policies,
        config,
        mockNow
      );
      const newCards = queue.filter((item) => item.card.state === 'new');
      expect(newCards).toHaveLength(5);
    });
  });

  describe('overdue cards ordering', () => {
    it('should sort overdue cards by days overdue descending', () => {
      const slightlyOverdue = createCard({
        objectiveId: 'obj-essential',
        state: 'review',
        dueDate: '2026-04-15T12:00:00.000Z',
      });
      const veryOverdue = createCard({
        objectiveId: 'obj-essential',
        state: 'review',
        dueDate: '2026-04-10T12:00:00.000Z',
      });
      const queue = buildDailyQueue(
        [slightlyOverdue, veryOverdue],
        policies,
        defaultConfig,
        mockNow
      );
      expect(queue[0].daysOverdue).toBeGreaterThan(queue[1].daysOverdue);
    });
  });

  describe('due cards ordering', () => {
    it('should sort due cards by due date ascending', () => {
      const laterDue = createCard({
        objectiveId: 'obj-essential',
        state: 'review',
        dueDate: '2026-04-17T12:00:00.000Z',
      });
      const earlierDue = createCard({
        objectiveId: 'obj-essential',
        state: 'review',
        dueDate: '2026-04-15T12:00:00.000Z',
      });
      const queue = buildDailyQueue(
        [laterDue, earlierDue],
        policies,
        defaultConfig,
        mockNow
      );
      expect(new Date(queue[0].card.dueDate).getTime()).toBeLessThan(
        new Date(queue[1].card.dueDate).getTime()
      );
    });
  });

  describe('maxReviewsPerDay cap', () => {
    it('should respect maxReviewsPerDay cap', () => {
      const cards = Array.from({ length: 100 }, () =>
        createCard({
          objectiveId: 'obj-essential',
          state: 'review',
          dueDate: '2026-04-15T12:00:00.000Z',
        })
      );
      const config: SrsSessionConfig = { ...defaultConfig, maxReviewsPerDay: 20 };
      const queue = buildDailyQueue(cards, policies, config, mockNow);
      expect(queue).toHaveLength(20);
    });
  });

  describe('mixed queue ordering', () => {
    it('should interleave new, overdue, and due cards in correct priority order', () => {
      const newEssential = createCard({ objectiveId: 'obj-essential', state: 'new' });
      const newSupporting = createCard({ objectiveId: 'obj-supporting', state: 'new' });
      const overdue = createCard({
        objectiveId: 'obj-essential',
        state: 'review',
        dueDate: '2026-04-10T12:00:00.000Z',
      });
      const dueSoon = createCard({
        objectiveId: 'obj-essential',
        state: 'review',
        dueDate: '2026-04-16T12:00:00.000Z',
      });

      const queue = buildDailyQueue(
        [newSupporting, dueSoon, overdue, newEssential],
        policies,
        defaultConfig,
        mockNow
      );

      const essentialNewIndex = queue.findIndex(
        (item) => item.card.objectiveId === 'obj-essential' && item.card.state === 'new'
      );
      const supportingNewIndex = queue.findIndex(
        (item) => item.card.objectiveId === 'obj-supporting' && item.card.state === 'new'
      );
      const overdueIndex = queue.findIndex((item) => item.isOverdue);
      const dueIndex = queue.findIndex(
        (item) => !item.isOverdue && item.card.state === 'review'
      );

      expect(essentialNewIndex).toBeLessThan(supportingNewIndex);
      expect(essentialNewIndex).toBeLessThan(overdueIndex);
      expect(supportingNewIndex).toBeLessThan(overdueIndex);
      expect(overdueIndex).toBeLessThan(dueIndex);
    });
  });

  describe('cards with no policy', () => {
    it('should exclude new cards with no policy', () => {
      const noPolicyCard = createCard({ objectiveId: 'obj-nopolicy', state: 'new' });
      const queue = buildDailyQueue([noPolicyCard], policies, defaultConfig, mockNow);
      expect(queue).toHaveLength(0);
    });

    it('should exclude review cards with no policy', () => {
      const noPolicyReview = createCard({
        objectiveId: 'obj-nopolicy',
        state: 'review',
        dueDate: '2026-04-15T12:00:00.000Z',
      });
      const queue = buildDailyQueue([noPolicyReview], policies, defaultConfig, mockNow);
      expect(queue).toHaveLength(0);
    });
  });

  describe('prioritizeOverdue: false', () => {
    it('should sort overdue cards by due date ascending when prioritizeOverdue is false', () => {
      const laterOverdue = createCard({
        objectiveId: 'obj-essential',
        state: 'review',
        dueDate: '2026-04-14T12:00:00.000Z',
      });
      const earlierOverdue = createCard({
        objectiveId: 'obj-supporting',
        state: 'review',
        dueDate: '2026-04-12T12:00:00.000Z',
      });
      const config: SrsSessionConfig = { ...defaultConfig, prioritizeOverdue: false };
      const queue = buildDailyQueue(
        [laterOverdue, earlierOverdue],
        policies,
        config,
        mockNow
      );
      expect(new Date(queue[0].card.dueDate).getTime()).toBeLessThan(
        new Date(queue[1].card.dueDate).getTime()
      );
    });
  });

  describe('isOverdue edge cases', () => {
    it('should return false for learning state', () => {
      const learningCard = createCard({
        objectiveId: 'obj-1',
        state: 'learning',
        dueDate: '2026-04-15T12:00:00.000Z',
      });
      expect(isOverdue(learningCard, mockNow)).toBe(false);
    });

    it('should return true for relearning state when past due', () => {
      const relearningCard = createCard({
        objectiveId: 'obj-1',
        state: 'relearning',
        dueDate: '2026-04-15T12:00:00.000Z',
      });
      expect(isOverdue(relearningCard, mockNow)).toBe(true);
    });
  });
});