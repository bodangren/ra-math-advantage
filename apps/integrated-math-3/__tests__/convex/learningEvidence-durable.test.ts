import { describe, expect, it, vi } from 'vitest';
import {
  type LearningEvidenceV1,
} from '@math-platform/practice-core';

import type { Id } from '@/convex/_generated/dataModel';
import type { MutationCtx } from '@/convex/_generated/server';
import { createIm3ConvexLearningEvidenceHandler } from '@/convex/learningEvidence';

const LEARNER_A = 'student-im3-durable-a' as Id<'profiles'>;
const LEARNER_B = 'student-im3-durable-b' as Id<'profiles'>;
const PILOT_NODE_ID = 'math.im3.skill.1.1.graph-quadratic-functions';
const WORKED_EXAMPLE_ACTIVITY_ID = `${PILOT_NODE_ID}.worked_example`;

type Im3MasteryBridge = (input: {
  learnerId: string;
  evidence: LearningEvidenceV1;
}) => Promise<void>;

type LearningEvidenceDocument = {
  _id: Id<'learning_evidence'>;
  learnerId: Id<'profiles'>;
  contractVersion: 'learning-evidence.v1';
  nodeId: string;
  activityId: string;
  attemptOrdinal: number;
  origin: 'teacher_led' | 'mastery_advantage';
  mode: LearningEvidenceV1['mode'];
  occurredAt: number;
  gradedEvidence?: LearningEvidenceV1['gradedEvidence'];
  idempotencyKey: string;
  createdAt: number;
};

function makeEvidence(
  overrides: Partial<LearningEvidenceV1> = {},
): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PILOT_NODE_ID,
    activityId: WORKED_EXAMPLE_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'worked_example',
    occurredAt: '2026-08-19T08:30:00.000Z',
    idempotencyKey: 'im3-durable-evidence-1',
    ...overrides,
  };
}

function makeMockCtx(initialRows: readonly LearningEvidenceDocument[] = []) {
  const rows = initialRows.map((row) => ({ ...row }));
  let insertCount = rows.length;

  const query = vi.fn((tableName: string) => {
    if (tableName !== 'learning_evidence') {
      throw new Error(`Unexpected durable-learning-evidence query: ${tableName}`);
    }

    return {
      withIndex: vi.fn((
        indexName: string,
        configure: (index: {
          eq(field: string, value: unknown): unknown;
          lte(field: string, value: unknown): unknown;
        }) => unknown,
      ) => {
        if (
          indexName !== 'by_learner_and_idempotency_key'
          && indexName !== 'by_learner_and_node'
          && indexName !== 'by_learner_node_origin_occurred_at'
          && indexName !== 'by_learner_node_activity_origin_attempt'
        ) {
          throw new Error(`Unexpected learning_evidence index: ${indexName}`);
        }

        const conditions = new Map<string, unknown>();
        const upperBounds = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
          lte(field: string, value: unknown) {
            upperBounds.set(field, value);
            return index;
          },
        };
        configure(index);

        let order: 'asc' | 'desc' = 'asc';
        const matchingRows = () => rows
          .filter((row) => (
            [...conditions].every(([field, value]) => (
              (row as unknown as Record<string, unknown>)[field] === value
            ))
          ))
          .filter((row) => (
            [...upperBounds].every(([field, value]) => {
              const candidate = (row as unknown as Record<string, unknown>)[field];
              return typeof candidate === 'number'
                && typeof value === 'number'
                && candidate <= value;
            })
          ))
          .toSorted((left, right) => {
            const orderField = indexName.includes('attempt')
              ? 'attemptOrdinal'
              : indexName.includes('occurred')
                ? 'occurredAt'
                : 'createdAt';
            const leftValue = left[orderField] as number;
            const rightValue = right[orderField] as number;
            return order === 'desc' ? rightValue - leftValue : leftValue - rightValue;
          });

        const result = {
          unique: vi.fn(async () => matchingRows()[0] ?? null),
          first: vi.fn(async () => matchingRows()[0] ?? null),
          collect: vi.fn(async () => matchingRows()),
          take: vi.fn(async () => {
            throw new Error('Durable authority reads must not use fixed take limits');
          }),
          order: vi.fn((nextOrder: 'asc' | 'desc') => {
            order = nextOrder;
            return result;
          }),
        };
        return result;
      }),
    };
  });

  const insert = vi.fn(async (
    tableName: string,
    document: Record<string, unknown>,
  ): Promise<Id<'learning_evidence'>> => {
    if (tableName !== 'learning_evidence') {
      throw new Error(`Unexpected durable-learning-evidence write: ${tableName}`);
    }

    insertCount += 1;
    const id = `learning-evidence-${insertCount}` as Id<'learning_evidence'>;
    rows.push({
      ...document,
      _id: id,
    } as unknown as LearningEvidenceDocument);
    return id;
  });

  return {
    ctx: { db: { query, insert } } as unknown as MutationCtx,
    rows,
  };
}

async function createHarness(initialRows: readonly LearningEvidenceDocument[] = []) {
  const { ctx, rows } = makeMockCtx(initialRows);
  const masteryBridge = vi.fn(async (_input: Parameters<Im3MasteryBridge>[0]) => undefined);
  const handler = createIm3ConvexLearningEvidenceHandler({ ctx, masteryBridge });

  return { handler, masteryBridge, rows };
}

describe('IM3 durable learning-evidence Convex boundary', () => {
  it('persists one normalized teacher-led worked-example event with a numeric timestamp', async () => {
    const { handler, masteryBridge, rows } = await createHarness();
    const evidence = makeEvidence({
      nodeId: ` ${PILOT_NODE_ID} `,
      activityId: ` ${WORKED_EXAMPLE_ACTIVITY_ID} `,
      occurredAt: '2026-08-19T08:30:00Z',
      idempotencyKey: ' im3-durable-teacher-exposure ',
    });

    const result = await handler.process({ learnerId: LEARNER_A, evidence });

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: false,
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      learnerId: LEARNER_A,
      contractVersion: 'learning-evidence.v1',
      nodeId: PILOT_NODE_ID,
      activityId: WORKED_EXAMPLE_ACTIVITY_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: Date.parse('2026-08-19T08:30:00.000Z'),
      idempotencyKey: 'im3-durable-teacher-exposure',
    });
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('replays an equivalent normalized delivery for the same learner without a second row', async () => {
    const { handler, masteryBridge, rows } = await createHarness();
    const firstEvidence = makeEvidence({
      nodeId: ` ${PILOT_NODE_ID} `,
      activityId: ` ${WORKED_EXAMPLE_ACTIVITY_ID} `,
      occurredAt: '2026-08-19T08:30:00Z',
      idempotencyKey: ' im3-durable-replay ',
    });
    const replayEvidence = makeEvidence({
      idempotencyKey: 'im3-durable-replay',
    });

    await handler.process({ learnerId: LEARNER_A, evidence: firstEvidence });
    const replay = await handler.process({ learnerId: LEARNER_A, evidence: replayEvidence });

    expect(replay).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'replay',
        exposureState: 'introduced',
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(rows).toHaveLength(1);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('rejects same-key reuse when the normalized payload conflicts', async () => {
    const { handler, masteryBridge, rows } = await createHarness();
    const original = makeEvidence({ idempotencyKey: 'im3-durable-conflict' });

    await handler.process({ learnerId: LEARNER_A, evidence: original });
    const result = await handler.process({
      learnerId: LEARNER_A,
      evidence: makeEvidence({
        attemptOrdinal: 2,
        idempotencyKey: original.idempotencyKey,
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'conflict',
        reason: 'idempotency_conflict',
        masteryBearing: false,
      },
    });
    expect(rows).toHaveLength(1);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('scopes idempotency keys to the learner', async () => {
    const { handler, rows } = await createHarness();
    const evidence = makeEvidence({ idempotencyKey: 'im3-durable-learner-scope' });

    await handler.process({ learnerId: LEARNER_A, evidence });
    const secondLearner = await handler.process({ learnerId: LEARNER_B, evidence });

    expect(secondLearner).toMatchObject({
      persisted: true,
      decision: { idempotency: 'new', reason: 'teacher_led' },
    });
    expect(rows.map((row) => row.learnerId)).toEqual([LEARNER_A, LEARNER_B]);
  });

});
