import { describe, expect, it } from 'vitest';
import {
  buildPracticeSubmissionEnvelope,
} from '@math-platform/practice-core';
import type { LearningEvidenceV1 } from '@math-platform/practice-core/learning-evidence';
import {
  InMemorySubmissionSrsAdapter,
} from '@math-platform/srs-engine';
import { buildKstState } from '@math-platform/knowledge-space-core';

import { loadFullCurriculumGraph } from '@/lib/curriculum/skill-graph-loader';

// Green target for Task 3.2. The app-owned adapter does not exist at the Red
// baseline. It must persist exposure separately and invoke the established
// IM3 SRS-to-KST path only for an eligible mastery_advantage event.
import {
  createIm3LearningEvidenceAdapter,
  IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  type Im3LearningEvidenceStore,
  type Im3MasteryAdvantageBridge,
} from '@/lib/practice/learning-evidence-pilot';

const LEARNER_ID = 'student-im3-pilot';
const PILOT_NODE_ID = 'math.im3.skill.1.1.graph-quadratic-functions';
const NON_PILOT_NODE_ID = 'math.im3.skill.1.1.find-and-interpret-the-average-rate-of-change';
const PILOT_ACTIVITY_ID = `${PILOT_NODE_ID}.independent_practice`;
const KST_NOW = Date.parse('2026-08-19T12:00:00.000Z');

class InMemoryEvidenceStore implements Im3LearningEvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  async findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null> {
    return this.events.find((entry) =>
      entry.learnerId === learnerId
      && entry.evidence.idempotencyKey === idempotencyKey,
    )?.evidence ?? null;
  }

  async listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]> {
    return this.events
      .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
      .map((entry) => entry.evidence);
  }

  async append(learnerId: string, evidence: LearningEvidenceV1): Promise<void> {
    this.events.push({ learnerId, evidence });
  }
}

function makeEvidence(
  overrides: Partial<LearningEvidenceV1> = {},
): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PILOT_NODE_ID,
    activityId: PILOT_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T08:30:00.000Z',
    idempotencyKey: 'teacher-led-pilot-001',
    ...overrides,
  };
}

function makeFullScoreSubmission() {
  return buildPracticeSubmissionEnvelope({
    activityId: PILOT_ACTIVITY_ID,
    mode: 'independent_practice',
    attemptNumber: 1,
    submittedAt: '2026-08-19T09:00:00.000Z',
    answers: { graph: 'complete' },
    parts: [{
      partId: 'graph',
      rawAnswer: 'complete',
      isCorrect: true,
      score: 6,
      maxScore: 6,
    }],
  });
}

async function snapshotKstAndSrs(adapter: InMemorySubmissionSrsAdapter) {
  const [cards, reviews] = await Promise.all([
    adapter.getCardStore().getCardsByStudent(LEARNER_ID),
    adapter.getReviewLogStore().getReviewsByStudent(LEARNER_ID),
  ]);
  const proficiencies = cards.map((card) => ({
    objectiveId: card.objectiveId,
    retentionStrength: card.reps > 0 ? 1 : 0,
    practiceCoverage: card.reps > 0 ? 1 : 0,
    isProficient: card.reps > 0,
  }));
  const kst = buildKstState(
    cards,
    proficiencies,
    loadFullCurriculumGraph(),
    KST_NOW,
  );
  const state = Array.from(kst.state.values())
    .sort((left, right) => left.nodeId.localeCompare(right.nodeId));

  return {
    cards,
    reviews,
    state,
    serialized: JSON.stringify({
      cards: [...cards].sort((left, right) => left.cardId.localeCompare(right.cardId)),
      reviews: [...reviews].sort((left, right) => left.reviewId.localeCompare(right.reviewId)),
      state,
      fringe: [...kst.fringe].sort((left, right) => left.nodeId.localeCompare(right.nodeId)),
    }),
  };
}

function createHarness() {
  const store = new InMemoryEvidenceStore();
  const srsAdapter = new InMemorySubmissionSrsAdapter();
  srsAdapter.getResolver().register(PILOT_ACTIVITY_ID, {
    variantKey: PILOT_ACTIVITY_ID,
    objectiveId: PILOT_NODE_ID,
  });
  const masteryEvents: LearningEvidenceV1[] = [];
  const masteryBridge: Im3MasteryAdvantageBridge = async ({ learnerId, evidence }) => {
    masteryEvents.push(evidence);
    const result = await srsAdapter.processSubmission({
      studentId: learnerId,
      activityId: PILOT_ACTIVITY_ID,
      submission: makeFullScoreSubmission(),
    });
    if (!result.ok) {
      throw new Error('the established IM3 SRS path rejected eligible evidence');
    }
  };

  return {
    store,
    srsAdapter,
    masteryEvents,
    adapter: createIm3LearningEvidenceAdapter({ store, masteryBridge }),
  };
}

describe('IM3 teacher-led Mastery Advantage pilot boundary', () => {
  it('freezes exactly one enabled IM3 pilot node', () => {
    expect(IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS).toEqual([PILOT_NODE_ID]);
    expect(IM3_LEARNING_EVIDENCE_PILOT_NODE_IDS).not.toContain(NON_PILOT_NODE_ID);
  });

  it('introduces a full-score teacher-led pilot exactly once without changing KST or SRS bytes', async () => {
    const { adapter, masteryEvents, srsAdapter, store } = createHarness();
    const before = await snapshotKstAndSrs(srsAdapter);

    const first = await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });
    const afterFirst = await snapshotKstAndSrs(srsAdapter);
    const replay = await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });

    expect(first).toMatchObject({
      persisted: true,
      masteryApplied: false,
      decision: {
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    expect(replay).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: { idempotency: 'replay' },
    });
    expect(store.events).toHaveLength(1);
    expect(masteryEvents).toHaveLength(0);
    expect(afterFirst.serialized).toBe(before.serialized);
    expect((await snapshotKstAndSrs(srsAdapter)).serialized).toBe(before.serialized);
  });

  it('returns awaiting_teacher_exposure before exposure and performs no KST or SRS write', async () => {
    const { adapter, masteryEvents, srsAdapter } = createHarness();
    const before = await snapshotKstAndSrs(srsAdapter);

    const result = await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        origin: 'mastery_advantage',
        mode: 'independent_practice',
        occurredAt: '2026-08-19T09:00:00.000Z',
        idempotencyKey: 'mastery-before-teacher',
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    expect(masteryEvents).toHaveLength(0);
    expect((await snapshotKstAndSrs(srsAdapter)).serialized).toBe(before.serialized);
  });

  it('sends one later graded Mastery Advantage event through the established IM3 SRS-to-KST path', async () => {
    const { adapter, masteryEvents, srsAdapter } = createHarness();
    const before = await snapshotKstAndSrs(srsAdapter);

    await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence(),
    });
    const result = await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        origin: 'mastery_advantage',
        mode: 'independent_practice',
        occurredAt: '2026-08-19T09:00:00.000Z',
        idempotencyKey: 'mastery-after-teacher',
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });
    const after = await snapshotKstAndSrs(srsAdapter);

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: {
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(masteryEvents).toHaveLength(1);
    expect(masteryEvents[0]).toMatchObject({ nodeId: PILOT_NODE_ID });
    expect(after.cards).toHaveLength(1);
    expect(after.reviews).toHaveLength(1);
    expect(after.serialized).not.toBe(before.serialized);
    expect(after.state.find((entry) => entry.nodeId === PILOT_NODE_ID)).toMatchObject({
      mastery: 1,
      retention: 1,
      isProficient: true,
      state: 'mastered',
    });
  });

  it('keeps a non-pilot IM3 node disabled without persistence or mastery effects', async () => {
    const { adapter, masteryEvents, srsAdapter, store } = createHarness();
    const before = await snapshotKstAndSrs(srsAdapter);

    const result = await adapter.process({
      learnerId: LEARNER_ID,
      evidence: makeEvidence({
        nodeId: NON_PILOT_NODE_ID,
        activityId: `${NON_PILOT_NODE_ID}.independent_practice`,
        idempotencyKey: 'non-pilot-teacher-exposure',
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
      }),
    });

    expect(result).toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'pilot_node_disabled',
        masteryBearing: false,
      },
    });
    expect(store.events).toHaveLength(0);
    expect(masteryEvents).toHaveLength(0);
    expect((await snapshotKstAndSrs(srsAdapter)).serialized).toBe(before.serialized);
  });
});
