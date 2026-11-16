import { afterEach, describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core';
import {
  generateTopic16EquationEndBehaviorOutput,
  type Topic16EquationEndBehaviorAnswers,
} from '@math-platform/math-content/knowledge-space';
import type { MutationCtx } from '@/convex/_generated/server';
import {
  createPrecalculusSubmissionLearningEvidenceHandler,
  type PrecalculusActivitySubmission,
  type PrecalculusSubmissionEffect,
  type PrecalculusSubmissionReceipt,
  type PrecalculusSubmissionReceiptStore,
} from '@/convex/learningEvidence';
import { gradeTopic16EquationEndBehavior } from '@/lib/practice/topic16-equation-end-behavior';
import {
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
  PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID,
  type PrecalculusLearningEvidenceHistoryOptions,
  type PrecalculusLearningEvidenceStore,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'profiles:topic16-equation-end-behavior-enablement-learner';
const GUIDED_ID = PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_GUIDED_ACTIVITY_ID;
const INDEPENDENT_ID = PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_INDEPENDENT_ACTIVITY_ID;
const WORKED_ID = PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_WORKED_ACTIVITY_ID;
const WORKED_DOCUMENT_ID = 'activities:topic16-equation-end-behavior-enablement-worked';
const SUBMITTED_AT = Date.parse('2026-08-30T09:00:00.000Z');
const SUBMITTED_AT_ISO = '2026-08-30T09:00:00.000Z';
const PART_IDS = [
  'a_leftEnd', 'a_rightEnd', 'b_leftEnd', 'b_rightEnd',
  'c_leftEnd', 'c_rightEnd', 'd_leftEnd', 'd_rightEnd',
  'e_leftEnd', 'e_rightEnd', 'f_leftEnd', 'f_rightEnd',
] as const;
const WORKED_OUTPUT = generateTopic16EquationEndBehaviorOutput(0);
const WORKED_ANSWERS = WORKED_OUTPUT.expectedAnswer as Record<string, unknown>;
const WORKED_PARTS = PART_IDS.map((partId) => ({
  partId,
  rawAnswer: WORKED_ANSWERS[partId],
}));
const WORKED_PROPS = {
  ...(WORKED_OUTPUT.data.rendererProps as Record<string, unknown>),
  presentationMode: 'worked_example',
  correctAnswers: WORKED_OUTPUT.expectedAnswer,
  steps: WORKED_OUTPUT.solutionSteps.map((step) => step.description),
  finalAnswer: 'The six polynomial end behaviors are shown above.',
};

type SubmissionData = Record<string, unknown>;
type Row = Record<string, unknown> & { _id: string };
type Mode = 'guided_practice' | 'independent_practice';

type ProducerInput = {
  userId: string;
  activityId: string;
  idempotencyKey: string;
  submissionData: SubmissionData;
};

function makeWorkedEnvelope(): SubmissionData {
  return {
    contractVersion: 'practice.v1',
    activityId: WORKED_ID,
    mode: 'worked_example',
    status: 'submitted',
    attemptNumber: 1,
    submittedAt: SUBMITTED_AT_ISO,
    answers: WORKED_ANSWERS,
    parts: WORKED_PARTS,
  };
}

function createConvexHarness() {
  const rows: Record<string, Row[]> = {
    activities: [{
      _id: WORKED_DOCUMENT_ID,
      stableActivityId: WORKED_ID,
      componentKey: 'polynomial-equation-end-behavior',
      props: structuredClone(WORKED_PROPS),
      gradingConfig: {
        generatorKey: 'topic16-equation-end-behavior',
        variantSeed: 0,
      },
    }],
    activity_submissions: [],
    learning_evidence: [],
    learning_evidence_receipts: [],
    kst_states: [],
    srs_cards: [],
    srs_review_log: [],
    mastery_effects: [],
  };
  const insertTrace: string[] = [];
  const queryTrace: string[] = [];
  const getTrace: string[] = [];
  const select = (tableName: string, conditions: ReadonlyMap<string, unknown>) => (
    (rows[tableName] ?? []).filter((row) => (
      [...conditions].every(([field, value]) => row[field] === value)
    ))
  );
  const ctx = {
    db: {
      get: async (tableName: string, id: string) => {
        getTrace.push(`${tableName}:${id}`);
        return (rows[tableName] ?? []).find((row) => row._id === id) ?? null;
      },
      query: (tableName: string) => {
        const conditions = new Map<string, unknown>();
        let orderDirection: 'asc' | 'desc' = 'asc';
        const index = {
          eq(field: string, value: unknown) {
            conditions.set(field, value);
            return index;
          },
          lte(field: string, value: unknown) {
            conditions.set(`${field}__lte`, value);
            return index;
          },
        };
        const selectRows = () => {
          const upperBounds = [...conditions]
            .filter(([field]) => field.endsWith('__lte'))
            .map(([field, value]) => [field.slice(0, -'__lte'.length), value] as const);
          const exact = new Map([...conditions].filter(([field]) => !field.endsWith('__lte')));
          return select(tableName, exact).filter((row) => (
            upperBounds.every(([field, value]) => (
              typeof row[field] === 'number'
              && typeof value === 'number'
              && row[field] <= value
            ))
          ));
        };
        const result = {
          unique: async () => {
            const matches = selectRows();
            if (matches.length > 1) throw new Error(`Duplicate ${tableName} rows`);
            return matches[0] ?? null;
          },
          first: async () => {
            const matches = selectRows();
            if (orderDirection === 'desc') matches.reverse();
            return matches[0] ?? null;
          },
          order: (direction: 'asc' | 'desc') => {
            orderDirection = direction;
            return result;
          },
        };
        return {
          withIndex: (indexName: string, configure: (query: typeof index) => unknown) => {
            queryTrace.push(indexName);
            configure(index);
            return result;
          },
          ...result,
        };
      },
      insert: async (tableName: string, document: Record<string, unknown>) => {
        const tableRows = rows[tableName] ?? (rows[tableName] = []);
        const id = `${tableName}:${tableRows.length + 1}`;
        insertTrace.push(`${tableName}:${id}`);
        tableRows.push({ _id: id, ...document });
        return id;
      },
    },
  } as unknown as MutationCtx;
  return { ctx, getTrace, insertTrace, queryTrace, rows };
}

async function loadProducer() {
  const imported = await vi.importActual<Record<string, unknown>>('@/convex/activities');
  const mutation = imported.createTopic16EquationEndBehaviorWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('The Topic 1.6 Worked producer is not available.');
  }
  return mutation._handler as (ctx: MutationCtx, args: ProducerInput) => Promise<{
    submissionId: string;
    attemptOrdinal: number;
    submittedAt: string;
  }>;
}

async function loadWorkedConsumer() {
  const imported = await vi.importActual<Record<string, unknown>>('@/convex/learningEvidence');
  const mutation = imported.submitTopic16EquationEndBehaviorWorkedSubmission as {
    _handler?: unknown;
  } | undefined;
  if (typeof mutation?._handler !== 'function') {
    throw new Error('The Topic 1.6 Worked consumer is not available.');
  }
  return mutation._handler as (ctx: MutationCtx, args: {
    learnerId: string;
    submissionId: string;
  }) => Promise<Record<string, unknown>>;
}

async function createWorkedSubmission() {
  const harness = createConvexHarness();
  const producer = await loadProducer();
  vi.spyOn(Date, 'now').mockReturnValue(SUBMITTED_AT);
  const created = await producer(harness.ctx, {
    userId: LEARNER_ID,
    activityId: WORKED_ID,
    idempotencyKey: 'topic16-equation-end-behavior-enablement-create',
    submissionData: makeWorkedEnvelope(),
  });
  return { ...harness, created };
}

function teacherEvidenceFromStoredRow(row: Row): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: row.nodeId as string,
    activityId: row.activityId as string,
    attemptOrdinal: row.attemptOrdinal as number,
    origin: row.origin as 'teacher_led',
    mode: row.mode as 'worked_example',
    occurredAt: new Date(row.occurredAt as number).toISOString(),
    idempotencyKey: row.idempotencyKey as string,
  };
}

function sourceAnswers(seed: 1 | 2): Topic16EquationEndBehaviorAnswers {
  return {
    ...generateTopic16EquationEndBehaviorOutput(seed).expectedAnswer,
  } as Topic16EquationEndBehaviorAnswers;
}

function makeGradedSubmission(
  mode: Mode,
  answers: Topic16EquationEndBehaviorAnswers = sourceAnswers(mode === 'guided_practice' ? 1 : 2),
): PrecalculusActivitySubmission {
  const seed = mode === 'guided_practice' ? 1 : 2;
  const stableActivityId = mode === 'guided_practice' ? GUIDED_ID : INDEPENDENT_ID;
  const graded = gradeTopic16EquationEndBehavior(seed, answers);
  return {
    submissionId: `topic16-equation-end-behavior-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `activities:topic16-equation-end-behavior-${mode}`,
    stableActivityId,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 7,
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: stableActivityId,
      attemptNumber: 7,
      mode,
      status: 'graded',
      submittedAt: '2026-08-30T10:00:00.000Z',
      answers,
      parts: graded.parts,
    },
    score: graded.score,
    maxScore: 12,
    feedback: `${graded.score}/12 polynomial equation end-behavior responses matched the server rubric.`,
    gradedAt: Date.parse('2026-08-30T10:00:00.000Z'),
    submittedAt: Date.parse('2026-08-30T10:00:00.000Z'),
  };
}

class InMemoryEvidenceStore implements PrecalculusLearningEvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];
  readonly idempotencyLookups: string[] = [];
  readonly nodeLookups: string[] = [];

  async findByIdempotencyKey(learnerId: string, idempotencyKey: string) {
    this.idempotencyLookups.push(`${learnerId}:${idempotencyKey}`);
    return this.events.find((entry) => (
      entry.learnerId === learnerId && entry.evidence.idempotencyKey === idempotencyKey
    ))?.evidence ?? null;
  }

  async listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
    _options: PrecalculusLearningEvidenceHistoryOptions,
  ) {
    this.nodeLookups.push(`${learnerId}:${nodeId}`);
    return this.events
      .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
      .map((entry) => entry.evidence);
  }

  async append(learnerId: string, evidence: LearningEvidenceV1) {
    this.events.push({ learnerId, evidence });
  }
}

class InMemoryReceiptStore implements PrecalculusSubmissionReceiptStore {
  readonly receipts = new Map<string, PrecalculusSubmissionReceipt>();

  async findBySubmissionId(learnerId: string, submissionId: string) {
    return this.receipts.get(`${learnerId}:${submissionId}`) ?? null;
  }

  async append(learnerId: string, submissionId: string, receipt: PrecalculusSubmissionReceipt) {
    this.receipts.set(`${learnerId}:${submissionId}`, receipt);
  }
}

function createGradedHarness(
  submission: PrecalculusActivitySubmission,
  teacherEvidence?: LearningEvidenceV1,
) {
  const evidenceStore = new InMemoryEvidenceStore();
  if (teacherEvidence) evidenceStore.events.push({ learnerId: LEARNER_ID, evidence: teacherEvidence });
  const receiptStore = new InMemoryReceiptStore();
  const effectOrder: string[] = [];
  const masteryEffects: PrecalculusSubmissionEffect[] = [];
  const submissionLookups: string[] = [];
  const handler = createPrecalculusSubmissionLearningEvidenceHandler({
    evidenceStore,
    loadActivitySubmission: async (submissionId) => {
      submissionLookups.push(submissionId);
      return submissionId === submission.submissionId ? submission : null;
    },
    masteryBridge: async (effect) => {
      masteryEffects.push(effect);
      effectOrder.push('mastery');
    },
    receiptStore: {
      findBySubmissionId: receiptStore.findBySubmissionId.bind(receiptStore),
      append: async (learnerId, submissionId, receipt) => {
        await receiptStore.append(learnerId, submissionId, receipt);
        effectOrder.push('receipt');
      },
    },
  });
  const originalAppend = evidenceStore.append.bind(evidenceStore);
  evidenceStore.append = async (learnerId, evidence) => {
    await originalAppend(learnerId, evidence);
    effectOrder.push('evidence');
  };
  return {
    effectOrder,
    evidenceStore,
    handler,
    masteryEffects,
    receiptStore,
    submissionLookups,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Topic 1.6 evidence-node enablement', () => {
  it('enables the exact node once without duplicate allow-list entries', () => {
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
      (nodeId) => (nodeId as string) === PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
    )).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it('persists one exact Worked teacher event and replays without duplicate effects', async () => {
    const harness = await createWorkedSubmission();
    const consumer = await loadWorkedConsumer();
    const stored = harness.rows.activity_submissions[0]!;

    await expect(consumer(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: stored._id,
    })).resolves.toStrictEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(harness.rows.learning_evidence).toHaveLength(1);
    expect(harness.rows.learning_evidence[0]).toEqual({
      _id: 'learning_evidence:1',
      learnerId: LEARNER_ID,
      nodeId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
      activityId: WORKED_ID,
      attemptOrdinal: 1,
      origin: 'teacher_led',
      mode: 'worked_example',
      occurredAt: SUBMITTED_AT,
      idempotencyKey: `precalc:topic-1-6-equation-end-behavior:teacher-led:submission:${stored._id}`,
      gradedEvidence: undefined,
      createdAt: SUBMITTED_AT,
    });
    expect(harness.rows.learning_evidence_receipts).toHaveLength(0);
    expect(harness.rows.kst_states).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.mastery_effects).toHaveLength(0);

    const beforeReplay = {
      evidenceCount: harness.rows.learning_evidence.length,
      receiptCount: harness.rows.learning_evidence_receipts.length,
      queryCount: harness.queryTrace.length,
      insertCount: harness.insertTrace.length,
    };
    await expect(consumer(harness.ctx, {
      learnerId: LEARNER_ID,
      submissionId: stored._id,
    })).resolves.toStrictEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'replay',
      decision: {
        idempotency: 'replay',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(harness.rows.learning_evidence).toHaveLength(beforeReplay.evidenceCount);
    expect(harness.rows.learning_evidence_receipts).toHaveLength(beforeReplay.receiptCount);
    expect(harness.queryTrace.slice(beforeReplay.queryCount)).toEqual([
      'by_learner_and_idempotency_key',
      'by_learner_node_origin_occurred_at',
      'by_learner_node_activity_origin_attempt',
    ]);
    expect(harness.insertTrace.length).toBe(beforeReplay.insertCount);
    expect(harness.rows.kst_states).toHaveLength(0);
    expect(harness.rows.srs_cards).toHaveLength(0);
    expect(harness.rows.mastery_effects).toHaveLength(0);
  });

  it.each([
    ['Guided', 'guided_practice' as const],
    ['Independent', 'independent_practice' as const],
  ])('keeps %s gated before Worked exposure without effects', async (_label, mode) => {
    const submission = makeGradedSubmission(mode);
    const harness = createGradedHarness(submission);

    await expect(harness.handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toStrictEqual({
      persisted: false,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(harness.masteryEffects).toEqual([]);
    expect(harness.evidenceStore.events).toEqual([]);
    expect(harness.receiptStore.receipts.size).toBe(0);
    expect(harness.effectOrder).toEqual([]);
  });

  it.each([
    ['Guided correct', 'guided_practice' as const, sourceAnswers(1), 12],
    ['Guided one-answer-wrong', 'guided_practice' as const, (() => {
      const answers = sourceAnswers(1);
      answers.a_leftEnd = answers.a_leftEnd === 'up' ? 'down' : 'up';
      return answers;
    })(), 11],
    ['Independent correct', 'independent_practice' as const, sourceAnswers(2), 12],
  ])('accepts %s after the exact Worked teacher event', async (
    _label,
    mode,
    answers,
    expectedScore,
  ) => {
    const worked = await createWorkedSubmission();
    const consumer = await loadWorkedConsumer();
    const workedRow = worked.rows.activity_submissions[0]!;
    await expect(consumer(worked.ctx, {
      learnerId: LEARNER_ID,
      submissionId: workedRow._id,
    })).resolves.toMatchObject({
      persisted: true,
      decision: { reason: 'teacher_led' },
    });
    expect(worked.rows.learning_evidence).toHaveLength(1);
    const teacherEvidence = teacherEvidenceFromStoredRow(worked.rows.learning_evidence[0]!);
    const submission = makeGradedSubmission(mode, answers);
    expect(Date.parse(teacherEvidence.occurredAt)).toBeLessThanOrEqual(submission.submittedAt);
    const harness = createGradedHarness(submission, teacherEvidence);
    const graded = gradeTopic16EquationEndBehavior(mode === 'guided_practice' ? 1 : 2, answers);
    expect(graded.score).toBe(expectedScore);

    await expect(harness.handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toStrictEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(harness.evidenceStore.events).toHaveLength(2);
    expect(harness.evidenceStore.events[1]?.evidence).toEqual({
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_16_POLYNOMIAL_EQUATION_END_BEHAVIOR_NODE_ID,
      activityId: submission.stableActivityId,
      attemptOrdinal: submission.attemptOrdinal,
      origin: 'mastery_advantage',
      mode,
      occurredAt: '2026-08-30T10:00:00.000Z',
      gradedEvidence: {
        isCorrect: expectedScore === 12,
        score: expectedScore,
        maxScore: 12,
      },
      idempotencyKey: `precalc:mastery-advantage:submission:${submission.submissionId}`,
    });
    expect(harness.masteryEffects).toHaveLength(1);
    expect(harness.receiptStore.receipts.size).toBe(1);
    expect(harness.effectOrder).toEqual(['mastery', 'evidence', 'receipt']);

    const beforeReplay = {
      eventCount: harness.evidenceStore.events.length,
      receiptCount: harness.receiptStore.receipts.size,
      submissionLookups: harness.submissionLookups.length,
      idempotencyLookups: harness.evidenceStore.idempotencyLookups.length,
      nodeLookups: harness.evidenceStore.nodeLookups.length,
      effects: harness.effectOrder.length,
    };
    await expect(harness.handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toStrictEqual({
      persisted: true,
      masteryApplied: true,
      kstApplied: false,
      delivery: 'replay',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(harness.evidenceStore.events).toHaveLength(beforeReplay.eventCount);
    expect(harness.receiptStore.receipts.size).toBe(beforeReplay.receiptCount);
    expect(harness.submissionLookups).toHaveLength(beforeReplay.submissionLookups);
    expect(harness.evidenceStore.idempotencyLookups).toHaveLength(beforeReplay.idempotencyLookups);
    expect(harness.evidenceStore.nodeLookups).toHaveLength(beforeReplay.nodeLookups);
    expect(harness.effectOrder).toHaveLength(beforeReplay.effects);
  });
});
