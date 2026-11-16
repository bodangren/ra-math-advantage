import { describe, expect, it } from 'vitest';

import type { Id } from '@/convex/_generated/dataModel';
import type { QueryCtx } from '@/convex/_generated/server';
import {
  getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState,
  getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeStateHandler,
} from '@/convex/learningEvidence';
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:topic15-real-zeros-kst-learner' as Id<'profiles'>;
const FOREIGN_LEARNER_ID = 'profiles:topic15-real-zeros-kst-foreign' as Id<'profiles'>;
const NOW = Date.parse('2026-08-21T12:00:00.000Z');
const TITLE = 'Find real zeros and multiplicities from factored form';
const DAY = 24 * 60 * 60 * 1000;

type Row = Record<string, unknown> & { _id: string };

function createQueryHarness(cards: readonly Row[] = []) {
  const queryEvents: string[] = [];
  const queryConditions: Array<Record<string, unknown>> = [];
  const writes: string[] = [];
  let collectCalls = 0;

  const query = (tableName: string) => ({
    withIndex: (
      indexName: string,
      configure: (query: { eq(field: string, value: unknown): unknown }) => unknown,
    ) => {
      queryEvents.push(`${tableName}:${indexName}`);
      if (tableName !== 'srs_cards' || indexName !== 'by_student_and_objective') {
        throw new Error('The Topic 1.5 KST query must use the exact student/objective SRS index.');
      }

      const conditions = new Map<string, unknown>();
      const index = {
        eq(field: string, value: unknown) {
          conditions.set(field, value);
          return index;
        },
      };
      configure(index);
      queryConditions.push(Object.fromEntries(conditions));

      return {
        collect: async () => {
          collectCalls += 1;
          return cards.filter((card) => (
            [...conditions].every(([field, value]) => card[field] === value)
          ));
        },
      };
    },
  });

  const failWrite = (operation: string) => async () => {
    writes.push(operation);
    throw new Error(`The read-only KST query must not ${operation}.`);
  };

  return {
    ctx: {
      db: {
        query,
        insert: failWrite('insert'),
        patch: failWrite('patch'),
        delete: failWrite('delete'),
      },
    } as unknown as QueryCtx,
    queryEvents,
    queryConditions,
    writes,
    get collectCalls() {
      return collectCalls;
    },
  };
}

function makeCard(
  problemFamilyId: string,
  overrides: Partial<Row> = {},
): Row {
  return {
    _id: `srs_cards:topic15-real-zeros-${problemFamilyId.split('.').at(-1) ?? 'variant'}`,
    studentId: LEARNER_ID,
    objectiveId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
    problemFamilyId,
    stability: 1,
    difficulty: 5,
    state: 'review',
    dueDate: '2026-08-22T12:00:00.000Z',
    elapsedDays: 0,
    scheduledDays: 1,
    reps: 1,
    lapses: 0,
    lastReview: '2026-08-21T11:00:00.000Z',
    createdAt: NOW - 60_000,
    updatedAt: NOW - 60_000,
    ...overrides,
  };
}

function expectReadOnlyQuery(
  harness: ReturnType<typeof createQueryHarness>,
  expectedCalls = 1,
) {
  expect(harness.queryEvents).toEqual(
    Array.from({ length: expectedCalls }, () => 'srs_cards:by_student_and_objective'),
  );
  expect(harness.queryConditions).toEqual(
    Array.from({ length: expectedCalls }, () => ({
      studentId: LEARNER_ID,
      objectiveId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
    })),
  );
  expect(harness.collectCalls).toBe(expectedCalls);
  expect(harness.writes).toEqual([]);
}

function expectState(status: 'not_started' | 'in_progress' | 'mastered' | 'decaying') {
  return {
    nodeId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID,
    title: TITLE,
    status,
    readiness: 'ready' as const,
  };
}

describe('getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState', () => {
  it('exports the internal query and returns the exact bounded no-card state', async () => {
    expect(getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeState).toBeDefined();

    const harness = createQueryHarness();
    const result = await getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });

    expect(result).toStrictEqual(expectState('not_started'));
    expect(Object.keys(result).sort()).toEqual(['nodeId', 'readiness', 'status', 'title']);
    expectReadOnlyQuery(harness);
  });

  it.each([
    ['no card', []],
    ['Worked-only card', [makeCard(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID)]],
    ['unknown family', [makeCard(`${PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID}.unknown`)]],
    ['other objective', [makeCard(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID, {
      objectiveId: 'math.precalc.skill.1.4.identify-relative-and-absolute-extrema-from-graphs',
    })]],
    ['foreign learner', [makeCard(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID, {
      studentId: FOREIGN_LEARNER_ID,
    })]],
  ] as const)('ignores %s and returns not started', async (_label, cards) => {
    const harness = createQueryHarness(cards);

    await expect(getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    })).resolves.toStrictEqual(expectState('not_started'));

    expectReadOnlyQuery(harness);
  });

  it.each([
    ['Guided', PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID],
    ['Independent', PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID],
  ] as const)('returns in progress for one exact %s family', async (_label, problemFamilyId) => {
    const harness = createQueryHarness([makeCard(problemFamilyId)]);

    await expect(getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    })).resolves.toStrictEqual(expectState('in_progress'));

    expectReadOnlyQuery(harness);
  });

  it('returns mastered for both exact fresh families, ignores Worked and unknown cards, and is replay-stable', async () => {
    const harness = createQueryHarness([
      makeCard(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID),
      makeCard(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID, {
        _id: 'srs_cards:topic15-real-zeros-independent',
      }),
      makeCard(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID, {
        _id: 'srs_cards:topic15-real-zeros-worked',
      }),
      makeCard(`${PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_NODE_ID}.unknown`, {
        _id: 'srs_cards:topic15-real-zeros-unknown',
      }),
    ]);

    const first = await getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });
    const replay = await getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    });

    expect(first).toStrictEqual(expectState('mastered'));
    expect(replay).toStrictEqual(first);
    expectReadOnlyQuery(harness, 2);
  });

  it('uses numeric and ISO lastReview values with the query time for aged cards', async () => {
    const oldReview = NOW - 365 * DAY;
    const harness = createQueryHarness([
      makeCard(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID, {
        stability: 1,
        elapsedDays: 0,
        lastReview: oldReview,
      }),
      makeCard(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID, {
        _id: 'srs_cards:topic15-real-zeros-aged-independent',
        stability: 1,
        elapsedDays: 0,
        lastReview: new Date(oldReview).toISOString(),
      }),
    ]);

    await expect(getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    })).resolves.toStrictEqual(expectState('in_progress'));

    expectReadOnlyQuery(harness);
  });

  it('uses stored elapsed days when lastReview is invalid', async () => {
    const harness = createQueryHarness([
      makeCard(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID, {
        elapsedDays: 0,
        lastReview: 'not-a-valid-review-time',
      }),
      makeCard(PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID, {
        _id: 'srs_cards:topic15-real-zeros-invalid-independent',
        elapsedDays: 0,
        lastReview: 'not-a-valid-review-time',
      }),
    ]);

    await expect(getPrecalculusTopic15RealZerosAndMultiplicitiesKnowledgeStateHandler(harness.ctx, {
      learnerId: LEARNER_ID,
      now: NOW,
    })).resolves.toStrictEqual(expectState('mastered'));

    expectReadOnlyQuery(harness);
  });
});
