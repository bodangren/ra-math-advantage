import { describe, expect, it, vi } from 'vitest';
import {
  learningEvidenceFingerprintV1,
  normalizeLearningEvidenceV1,
  type LearningEvidenceDecisionV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core';

import type { Id } from '@/convex/_generated/dataModel';
import type { MutationCtx } from '@/convex/_generated/server';

const LEARNING_EVIDENCE_MODULE = '@/convex/learningEvidence';
const LEARNER_A = 'student-im3-durable-a' as Id<'profiles'>;
const LEARNER_B = 'student-im3-durable-b' as Id<'profiles'>;
const PILOT_NODE_ID = 'math.im3.skill.1.1.graph-quadratic-functions';
const NON_PILOT_NODE_ID = 'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change';
const WORKED_EXAMPLE_ACTIVITY_ID = `${PILOT_NODE_ID}.worked_example`;
const INDEPENDENT_PRACTICE_ACTIVITY_ID = `${PILOT_NODE_ID}.independent_practice`;

type Im3MasteryBridge = (input: {
  learnerId: string;
  evidence: LearningEvidenceV1;
}) => Promise<void>;

interface Im3LearningEvidenceProcessResult {
  persisted: boolean;
  masteryApplied: boolean;
  decision: LearningEvidenceDecisionV1;
}

interface Im3LearningEvidenceHandler {
  process(input: {
    learnerId: string;
    evidence: LearningEvidenceV1;
  }): Promise<Im3LearningEvidenceProcessResult>;
}

type Im3DurableHandlerFactory = (dependencies: {
  ctx: MutationCtx;
  masteryBridge: Im3MasteryBridge;
}) => Im3LearningEvidenceHandler;

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
  fingerprint: string;
  createdAt: number;
};

/**
 * Loads the concrete Convex-bound handler without requiring convex-test.
 *
 * The current pure handler intentionally has no database binding. This Red
 * test requires the smallest production seam: a factory that binds a Convex
 * mutation context to the existing IM3 handler and an injected mastery bridge.
 */
async function loadDurableHandlerFactory(): Promise<Im3DurableHandlerFactory> {
  let loadedModule: Record<string, unknown>;

  try {
    loadedModule = await vi.importActual<Record<string, unknown>>(
      LEARNING_EVIDENCE_MODULE,
    );
  } catch (error) {
    const detail = error instanceof Error ? ` ${error.message}` : '';
    throw new Error(
      'Missing IM3 durable learning-evidence Convex boundary. Export '
      + 'createIm3ConvexLearningEvidenceHandler({ ctx, masteryBridge }) from '
      + `apps/integrated-math-3/convex/learningEvidence.ts.${detail}`,
    );
  }

  const factory = loadedModule.createIm3ConvexLearningEvidenceHandler;
  if (typeof factory !== 'function') {
    throw new Error(
      'IM3 durable learning-evidence tests require '
      + 'createIm3ConvexLearningEvidenceHandler({ ctx, masteryBridge }).',
    );
  }

  return factory as Im3DurableHandlerFactory;
}

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
        configure: (index: { eq(field: string, value: unknown): unknown }) => unknown,
      ) => {
        if (
          indexName !== 'by_learner_and_idempotency_key'
          && indexName !== 'by_learner_and_node'
        ) {
          throw new Error(`Unexpected learning_evidence index: ${indexName}`);
        }

        const conditions = new Map<string, unknown>();
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
        };
        configure(index);

        const matchingRows = () => rows.filter((row) => (
          [...conditions].every(([field, value]) => (
            (row as unknown as Record<string, unknown>)[field] === value
          ))
        ));

        if (indexName === 'by_learner_and_idempotency_key') {
          return {
            unique: vi.fn(async () => matchingRows()[0] ?? null),
          };
        }

        return {
          collect: vi.fn(async () => matchingRows()),
        };
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
    insert,
    query,
    rows,
  };
}

async function createHarness(initialRows: readonly LearningEvidenceDocument[] = []) {
  const { ctx, insert, query, rows } = makeMockCtx(initialRows);
  const masteryBridge = vi.fn(async (_input: Parameters<Im3MasteryBridge>[0]) => undefined);
  const factory = await loadDurableHandlerFactory();
  const handler = factory({ ctx, masteryBridge });

  return { handler, insert, masteryBridge, query, rows };
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
    const normalized = normalizeLearningEvidenceV1(evidence);

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
      occurredAt: Date.parse(normalized.occurredAt),
      idempotencyKey: 'im3-durable-teacher-exposure',
      fingerprint: learningEvidenceFingerprintV1(normalized),
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

  it('keeps a non-pilot teacher-led event outside durable persistence', async () => {
    const { handler, masteryBridge, rows } = await createHarness();

    const result = await handler.process({
      learnerId: LEARNER_A,
      evidence: makeEvidence({
        nodeId: NON_PILOT_NODE_ID,
        activityId: `${NON_PILOT_NODE_ID}.worked_example`,
        idempotencyKey: 'im3-durable-non-pilot',
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'new',
        reason: 'node_not_enabled',
        masteryBearing: false,
      },
    });
    expect(rows).toHaveLength(0);
    expect(masteryBridge).not.toHaveBeenCalled();
  });

  it('does not call the bridge for the independent-practice candidate before exposure', async () => {
    const { handler, masteryBridge, rows } = await createHarness();

    const result = await handler.process({
      learnerId: LEARNER_A,
      evidence: makeEvidence({
        activityId: INDEPENDENT_PRACTICE_ACTIVITY_ID,
        origin: 'mastery_advantage',
        mode: 'independent_practice',
        occurredAt: '2026-08-19T09:00:00.000Z',
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
        idempotencyKey: 'im3-durable-before-exposure',
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(rows).toHaveLength(0);
    expect(masteryBridge).not.toHaveBeenCalled();
  });
});
