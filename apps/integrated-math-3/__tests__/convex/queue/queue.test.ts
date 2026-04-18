import { describe, it, expect, vi } from 'vitest';
import { getDailyPracticeQueueHandler } from '@/convex/queue/queue';
import type { Id } from '@/convex/_generated/dataModel';
import type { SrsCardState } from '@/lib/srs/contract';

function makeMockCtx(overrides: {
  cards?: SrsCardState[];
  policies?: Array<{
    _id: Id<'objective_policies'>;
    standardId: Id<'competency_standards'>;
    policy: string;
    courseKey: string;
    priority: number;
  }>;
  standards?: Record<string, { _id: Id<'competency_standards'>; code: string }>;
  practiceItems?: Array<{
    _id: Id<'practice_items'>;
    problemFamilyId: string;
    activityId: Id<'activities'>;
    practiceItemId: string;
    variantLabel: string;
  }>;
  activities?: Record<string, {
    _id: Id<'activities'>;
    componentKey: string;
    props: Record<string, unknown>;
    displayName: string;
  }>;
} = {}) {
  const { cards = [], policies = [], standards = {}, practiceItems = [], activities = {} } = overrides;

  const cardQueryMock = {
    withIndex: vi.fn().mockReturnValue({
      collect: vi.fn().mockResolvedValue(cards.map((card) => ({
        _id: card.cardId as Id<'srs_cards'>,
        studentId: card.studentId as Id<'profiles'>,
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
        lastReview: card.lastReview ?? undefined,
        createdAt: new Date(card.createdAt).getTime(),
        updatedAt: new Date(card.updatedAt).getTime(),
      }))),
      take: vi.fn().mockImplementation((n: number) => {
        const mapped = cards.map((card) => ({
          _id: card.cardId as Id<'srs_cards'>,
          studentId: card.studentId as Id<'profiles'>,
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
          lastReview: card.lastReview ?? undefined,
          createdAt: new Date(card.createdAt).getTime(),
          updatedAt: new Date(card.updatedAt).getTime(),
        }));
        return Promise.resolve(mapped.slice(0, n));
      }),
    }),
  };

  const policyQueryMock = {
    withIndex: vi.fn().mockReturnValue({
      collect: vi.fn().mockResolvedValue(policies),
    }),
  };

  let lastQueriedProblemFamilyId: string | null = null;
  const practiceItemQueryMock = {
    withIndex: vi.fn().mockImplementation((_indexName: string, fn: (q: { eq: (field: string, value: string) => unknown }) => void) => {
      const mockQ = {
        eq: vi.fn().mockImplementation((field: string, value: string) => {
          if (field === 'problemFamilyId') {
            lastQueriedProblemFamilyId = value;
          }
          return {};
        }),
      };
      fn(mockQ);
      const capturedId = lastQueriedProblemFamilyId;
      return {
        collect: vi.fn().mockResolvedValue(practiceItems),
        first: vi.fn().mockImplementation(() => {
          const found = practiceItems.find(pi => pi.problemFamilyId === capturedId);
          return Promise.resolve(found ?? null);
        }),
      };
    }),
  };

  const mockGet = vi.fn().mockImplementation((id: Id<'competency_standards'> | Id<'activities'>) => {
    if (id in standards) return Promise.resolve(standards[id] ?? null);
    if (id in activities) return Promise.resolve(activities[id] ?? null);
    return Promise.resolve(null);
  });

  const mockQuery = vi.fn().mockImplementation((tableName: string) => {
    if (tableName === 'srs_cards') return cardQueryMock;
    if (tableName === 'objective_policies') return policyQueryMock;
    if (tableName === 'practice_items') return practiceItemQueryMock;
    return { withIndex: vi.fn().mockReturnValue({ collect: vi.fn().mockResolvedValue([]) }) };
  });

  return {
    db: {
      query: mockQuery,
      get: mockGet,
    },
    cardQueryMock,
    policyQueryMock,
    practiceItemQueryMock,
    mockGet,
  };
}

const baseCard: SrsCardState = {
  cardId: 'card-1',
  studentId: 'student-1',
  objectiveId: 'HSA-SSE.B.3',
  problemFamilyId: 'm1-qf-factoring-1',
  stability: 0,
  difficulty: 0,
  state: 'new',
  dueDate: new Date().toISOString(),
  elapsedDays: 0,
  scheduledDays: 0,
  reps: 0,
  lapses: 0,
  lastReview: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('getDailyPracticeQueueHandler', () => {
  it('returns empty queue for student with no cards', async () => {
    const { db } = makeMockCtx({ cards: [] });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: new Date().toISOString() }
    );

    expect(result).toEqual([]);
  });

  it('returns ordered queue items for a student with cards', async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: 'card-1', state: 'new', objectiveId: 'HSA-SSE.B.3' },
    ];
    const policies = [
      {
        _id: 'policy-1' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
    ];
    const standards = {
      'std-1': { _id: 'std-1' as Id<'competency_standards'>, code: 'HSA-SSE.B.3' },
    };
    const practiceItems = [
      {
        _id: 'pi-1' as Id<'practice_items'>,
        problemFamilyId: 'm1-qf-factoring-1',
        activityId: 'act-1' as Id<'activities'>,
        practiceItemId: 'pi-a',
        variantLabel: 'variant-1',
      },
    ];
    const activities = {
      'act-1': {
        _id: 'act-1' as Id<'activities'>,
        componentKey: 'step-by-step-solver',
        props: { problemType: 'factoring' },
        displayName: 'Factoring Practice',
      },
    };

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: new Date().toISOString() }
    );

    expect(result).toHaveLength(1);
    expect(result[0].card.cardId).toBe('card-1');
    expect(result[0].card.problemFamilyId).toBe('m1-qf-factoring-1');
    expect(result[0].objectivePriority).toBe('essential');
    expect(result[0].isOverdue).toBe(false);
  });

  it('joins card data with objective policy from competency_standards', async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: 'card-1', problemFamilyId: 'm1-family-a', state: 'new', objectiveId: 'HSA-SSE.B.3' },
      { ...baseCard, cardId: 'card-2', problemFamilyId: 'm1-family-b', state: 'review', dueDate: '2024-01-01T00:00:00.000Z', objectiveId: 'HSA-REI.B.4' },
    ];
    const policies = [
      {
        _id: 'policy-1' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
      {
        _id: 'policy-2' as Id<'objective_policies'>,
        standardId: 'std-2' as Id<'competency_standards'>,
        policy: 'supporting',
        courseKey: 'integrated-math-3',
        priority: 2,
      },
    ];
    const standards = {
      'std-1': { _id: 'std-1' as Id<'competency_standards'>, code: 'HSA-SSE.B.3' },
      'std-2': { _id: 'std-2' as Id<'competency_standards'>, code: 'HSA-REI.B.4' },
    };
    const practiceItems = [
      {
        _id: 'pi-1' as Id<'practice_items'>,
        problemFamilyId: 'm1-family-a',
        activityId: 'act-1' as Id<'activities'>,
        practiceItemId: 'pi-a',
        variantLabel: 'variant-1',
      },
      {
        _id: 'pi-2' as Id<'practice_items'>,
        problemFamilyId: 'm1-family-b',
        activityId: 'act-2' as Id<'activities'>,
        practiceItemId: 'pi-b',
        variantLabel: 'variant-1',
      },
    ];
    const activities = {
      'act-1': {
        _id: 'act-1' as Id<'activities'>,
        componentKey: 'step-by-step-solver',
        props: { problemType: 'factoring' },
        displayName: 'Factoring Practice',
      },
      'act-2': {
        _id: 'act-2' as Id<'activities'>,
        componentKey: 'graphing-explorer',
        props: { problemType: 'graphing' },
        displayName: 'Graphing Practice',
      },
    };

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: '2024-01-15T00:00:00.000Z' }
    );

    expect(result).toHaveLength(2);
    const newItem = result.find((r: { card: { problemFamilyId: string } }) => r.card.problemFamilyId === 'm1-family-a');
    const reviewItem = result.find((r: { card: { problemFamilyId: string } }) => r.card.problemFamilyId === 'm1-family-b');
    expect(newItem?.objectivePriority).toBe('essential');
    expect(reviewItem?.objectivePriority).toBe('supporting');
    expect(reviewItem?.isOverdue).toBe(true);
  });

  it('calls buildDailyQueue with correct arguments', async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: 'card-1', state: 'new', objectiveId: 'HSA-SSE.B.3' },
    ];
    const policies = [
      {
        _id: 'policy-1' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
    ];
    const standards = {
      'std-1': { _id: 'std-1' as Id<'competency_standards'>, code: 'HSA-SSE.B.3' },
    };
    const practiceItems = [
      {
        _id: 'pi-1' as Id<'practice_items'>,
        problemFamilyId: 'm1-qf-factoring-1',
        activityId: 'act-1' as Id<'activities'>,
        practiceItemId: 'pi-a',
        variantLabel: 'variant-1',
      },
    ];
    const activities = {
      'act-1': {
        _id: 'act-1' as Id<'activities'>,
        componentKey: 'step-by-step-solver',
        props: { problemType: 'factoring' },
        displayName: 'Factoring Practice',
      },
    };

    const { db, cardQueryMock, policyQueryMock } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: '2024-01-15T00:00:00.000Z' }
    );

    expect(cardQueryMock.withIndex).toHaveBeenCalledWith('by_student', expect.any(Function));
    expect(policyQueryMock.withIndex).toHaveBeenCalledWith('by_courseKey', expect.any(Function));
  });
});

describe('getDailyPracticeQueueHandler - Phase 2: Queue Item Resolution', () => {
  it('resolves queue item to practice activity with componentKey and props', async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: 'card-1', problemFamilyId: 'm1-family-a', state: 'new', objectiveId: 'HSA-SSE.B.3' },
    ];
    const policies = [
      {
        _id: 'policy-1' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
    ];
    const standards = {
      'std-1': { _id: 'std-1' as Id<'competency_standards'>, code: 'HSA-SSE.B.3' },
    };
    const practiceItems = [
      {
        _id: 'pi-1' as Id<'practice_items'>,
        problemFamilyId: 'm1-family-a',
        activityId: 'act-1' as Id<'activities'>,
        practiceItemId: 'pi-a',
        variantLabel: 'variant-1',
      },
    ];
    const activities = {
      'act-1': {
        _id: 'act-1' as Id<'activities'>,
        componentKey: 'step-by-step-solver',
        props: { problemType: 'factoring', difficulty: 'easy' },
        displayName: 'Factoring Practice',
      },
    };

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: new Date().toISOString() }
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('componentKey', 'step-by-step-solver');
    expect(result[0]).toHaveProperty('props');
    expect(result[0].props).toEqual({ problemType: 'factoring', difficulty: 'easy' });
  });

  it('skips card when no practice item exists for its problem family', async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: 'card-1', problemFamilyId: 'm1-no-practice-item', state: 'new', objectiveId: 'HSA-SSE.B.3' },
    ];
    const policies = [
      {
        _id: 'policy-1' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
    ];
    const standards = {
      'std-1': { _id: 'std-1' as Id<'competency_standards'>, code: 'HSA-SSE.B.3' },
    };
    const practiceItems: Array<{
      _id: Id<'practice_items'>;
      problemFamilyId: string;
      activityId: Id<'activities'>;
      practiceItemId: string;
      variantLabel: string;
    }> = [];
    const activities = {};

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: new Date().toISOString() }
    );

    expect(result).toHaveLength(0);
  });

  it('skips card gracefully when practice item has no activity', async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: 'card-1', problemFamilyId: 'm1-family-no-activity', state: 'new', objectiveId: 'HSA-SSE.B.3' },
    ];
    const policies = [
      {
        _id: 'policy-1' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
    ];
    const standards = {
      'std-1': { _id: 'std-1' as Id<'competency_standards'>, code: 'HSA-SSE.B.3' },
    };
    const practiceItems = [
      {
        _id: 'pi-1' as Id<'practice_items'>,
        problemFamilyId: 'm1-family-no-activity',
        activityId: 'act-nonexistent' as Id<'activities'>,
        practiceItemId: 'pi-no-act',
        variantLabel: 'variant-1',
      },
    ];
    const activities = {};

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: new Date().toISOString() }
    );

    expect(result).toHaveLength(0);
  });

  it('resolves multiple items with correct ordering preserved', async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: 'card-1', problemFamilyId: 'm1-family-a', state: 'new', objectiveId: 'HSA-SSE.B.3' },
      { ...baseCard, cardId: 'card-2', problemFamilyId: 'm1-family-b', state: 'review', dueDate: '2024-01-01T00:00:00.000Z', objectiveId: 'HSA-REI.B.4' },
    ];
    const policies = [
      {
        _id: 'policy-1' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'supporting',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
      {
        _id: 'policy-2' as Id<'objective_policies'>,
        standardId: 'std-2' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
    ];
    const standards = {
      'std-1': { _id: 'std-1' as Id<'competency_standards'>, code: 'HSA-SSE.B.3' },
      'std-2': { _id: 'std-2' as Id<'competency_standards'>, code: 'HSA-REI.B.4' },
    };
    const practiceItems = [
      {
        _id: 'pi-1' as Id<'practice_items'>,
        problemFamilyId: 'm1-family-a',
        activityId: 'act-1' as Id<'activities'>,
        practiceItemId: 'pi-a',
        variantLabel: 'variant-1',
      },
      {
        _id: 'pi-2' as Id<'practice_items'>,
        problemFamilyId: 'm1-family-b',
        activityId: 'act-2' as Id<'activities'>,
        practiceItemId: 'pi-b',
        variantLabel: 'variant-1',
      },
    ];
    const activities = {
      'act-1': {
        _id: 'act-1' as Id<'activities'>,
        componentKey: 'step-by-step-solver',
        props: { problemType: 'factoring' },
        displayName: 'Factoring',
      },
      'act-2': {
        _id: 'act-2' as Id<'activities'>,
        componentKey: 'graphing-explorer',
        props: { problemType: 'quadratic' },
        displayName: 'Graphing',
      },
    };

    const { db } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: '2024-01-15T00:00:00.000Z' }
    );

    expect(result).toHaveLength(2);
    expect(result[0].componentKey).toBe('step-by-step-solver');
    expect(result[1].componentKey).toBe('graphing-explorer');
    expect(result[0].props).toEqual({ problemType: 'factoring' });
    expect(result[1].props).toEqual({ problemType: 'quadratic' });
  });
});

describe('getDailyPracticeQueueHandler - batch resolution performance', () => {
  it('batches standard lookups instead of one per policy record', async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: 'card-1', state: 'new', objectiveId: 'HSA-SSE.B.3' },
    ];
    const policies = [
      {
        _id: 'policy-1' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
      {
        _id: 'policy-2' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
      {
        _id: 'policy-3' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
    ];
    const standards = {
      'std-1': { _id: 'std-1' as Id<'competency_standards'>, code: 'HSA-SSE.B.3' },
    };
    const practiceItems = [
      {
        _id: 'pi-1' as Id<'practice_items'>,
        problemFamilyId: 'm1-qf-factoring-1',
        activityId: 'act-1' as Id<'activities'>,
        practiceItemId: 'pi-a',
        variantLabel: 'variant-1',
      },
    ];
    const activities = {
      'act-1': {
        _id: 'act-1' as Id<'activities'>,
        componentKey: 'step-by-step-solver',
        props: { problemType: 'factoring' },
        displayName: 'Factoring Practice',
      },
    };

    const { db, mockGet } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: new Date().toISOString() }
    );

    const standardGetCalls = mockGet.mock.calls.filter((call) =>
      String(call[0]).startsWith('std-')
    );
    expect(standardGetCalls).toHaveLength(1);
  });

  it('batches practice item and activity lookups by unique problem family', async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: 'card-1', problemFamilyId: 'm1-family-a', state: 'new', objectiveId: 'HSA-SSE.B.3' },
      { ...baseCard, cardId: 'card-2', problemFamilyId: 'm1-family-a', state: 'new', objectiveId: 'HSA-SSE.B.3' },
      { ...baseCard, cardId: 'card-3', problemFamilyId: 'm1-family-a', state: 'new', objectiveId: 'HSA-SSE.B.3' },
    ];
    const policies = [
      {
        _id: 'policy-1' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
    ];
    const standards = {
      'std-1': { _id: 'std-1' as Id<'competency_standards'>, code: 'HSA-SSE.B.3' },
    };
    const practiceItems = [
      {
        _id: 'pi-1' as Id<'practice_items'>,
        problemFamilyId: 'm1-family-a',
        activityId: 'act-1' as Id<'activities'>,
        practiceItemId: 'pi-a',
        variantLabel: 'variant-1',
      },
    ];
    const activities = {
      'act-1': {
        _id: 'act-1' as Id<'activities'>,
        componentKey: 'step-by-step-solver',
        props: { problemType: 'factoring' },
        displayName: 'Factoring Practice',
      },
    };

    const { db, practiceItemQueryMock, mockGet } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: new Date().toISOString() }
    );

    const practiceItemCalls = practiceItemQueryMock.withIndex.mock.calls.filter(
      (call: unknown[]) => call[0] === 'by_problemFamilyId'
    );
    expect(practiceItemCalls).toHaveLength(1);

    const activityGetCalls = mockGet.mock.calls.filter((call) =>
      String(call[0]).startsWith('act-')
    );
    expect(activityGetCalls).toHaveLength(1);
  });

  it('resolves multiple unique problem families in parallel', async () => {
    const cards: SrsCardState[] = [
      { ...baseCard, cardId: 'card-1', problemFamilyId: 'm1-family-a', state: 'new', objectiveId: 'HSA-SSE.B.3' },
      { ...baseCard, cardId: 'card-2', problemFamilyId: 'm1-family-b', state: 'new', objectiveId: 'HSA-REI.B.4' },
      { ...baseCard, cardId: 'card-3', problemFamilyId: 'm1-family-c', state: 'new', objectiveId: 'HSA-REI.B.4' },
    ];
    const policies = [
      {
        _id: 'policy-1' as Id<'objective_policies'>,
        standardId: 'std-1' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
      {
        _id: 'policy-2' as Id<'objective_policies'>,
        standardId: 'std-2' as Id<'competency_standards'>,
        policy: 'essential',
        courseKey: 'integrated-math-3',
        priority: 1,
      },
    ];
    const standards = {
      'std-1': { _id: 'std-1' as Id<'competency_standards'>, code: 'HSA-SSE.B.3' },
      'std-2': { _id: 'std-2' as Id<'competency_standards'>, code: 'HSA-REI.B.4' },
    };
    const practiceItems = [
      {
        _id: 'pi-1' as Id<'practice_items'>,
        problemFamilyId: 'm1-family-a',
        activityId: 'act-1' as Id<'activities'>,
        practiceItemId: 'pi-a',
        variantLabel: 'variant-1',
      },
      {
        _id: 'pi-2' as Id<'practice_items'>,
        problemFamilyId: 'm1-family-b',
        activityId: 'act-2' as Id<'activities'>,
        practiceItemId: 'pi-b',
        variantLabel: 'variant-1',
      },
      {
        _id: 'pi-3' as Id<'practice_items'>,
        problemFamilyId: 'm1-family-c',
        activityId: 'act-3' as Id<'activities'>,
        practiceItemId: 'pi-c',
        variantLabel: 'variant-1',
      },
    ];
    const activities = {
      'act-1': {
        _id: 'act-1' as Id<'activities'>,
        componentKey: 'step-by-step-solver',
        props: { problemType: 'factoring' },
        displayName: 'Factoring Practice',
      },
      'act-2': {
        _id: 'act-2' as Id<'activities'>,
        componentKey: 'graphing-explorer',
        props: { problemType: 'quadratic' },
        displayName: 'Graphing Practice',
      },
      'act-3': {
        _id: 'act-3' as Id<'activities'>,
        componentKey: 'comprehension-quiz',
        props: { topic: 'sampling' },
        displayName: 'Comprehension Quiz',
      },
    };

    const { db, practiceItemQueryMock, mockGet } = makeMockCtx({ cards, policies, standards, practiceItems, activities });

    const result = await getDailyPracticeQueueHandler(
      { db } as unknown as import('@/convex/_generated/server').QueryCtx,
      { studentId: 'student-1', asOfDate: new Date().toISOString() }
    );

    expect(result).toHaveLength(3);

    const practiceItemCalls = practiceItemQueryMock.withIndex.mock.calls.filter(
      (call: unknown[]) => call[0] === 'by_problemFamilyId'
    );
    expect(practiceItemCalls).toHaveLength(3);

    const activityGetCalls = mockGet.mock.calls.filter((call) =>
      String(call[0]).startsWith('act-')
    );
    expect(activityGetCalls).toHaveLength(3);
  });
});
