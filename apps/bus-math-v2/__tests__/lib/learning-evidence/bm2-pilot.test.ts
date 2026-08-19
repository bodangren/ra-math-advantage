import { describe, expect, it } from 'vitest';

import {
  evaluateLearningEvidenceV1,
  learningEvidenceFingerprintV1,
  learningEvidenceV1Schema,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core';
import { AUTHORED_UNIT_1_LESSONS } from '@/lib/curriculum/generated/unit1-authored';
import {
  BM2_LEARNING_EVIDENCE_PILOT,
  createBm2LearningEvidenceRuntime,
} from '@/lib/learning-evidence/bm2-pilot';

const PILOT_NODE_ID = 'math.bm2.skill.1.1.apply-accounting-equation';
const NON_PILOT_NODE_ID = 'math.bm2.skill.1.2.classify-accounts';
const LEARNER_ID = 'student-bm2-pilot';
const LESSON_ID = 'd6b57545-65f6-4c39-80d5-000000000001';
const GUIDED_ACTIVITY_ID = 'd6b57545-65f6-4c39-80d5-000100001002';
const GUIDED_ACTIVITY_KEY = 'unit-1-lesson-1-activity-1';
const ACCOUNTING_EQUATION_VARIANT_KEY = 'accounting-equation';

function makeEvidence({
  origin,
  occurredAt,
  idempotencyKey,
  graded = false,
  nodeId = PILOT_NODE_ID,
  activityId = origin === 'teacher_led' ? GUIDED_ACTIVITY_KEY : ACCOUNTING_EQUATION_VARIANT_KEY,
  mode = origin === 'teacher_led' ? 'guided_practice' : 'independent_practice',
}: {
  origin: LearningEvidenceV1['origin'];
  occurredAt: string;
  idempotencyKey: string;
  graded?: boolean;
  nodeId?: string;
  activityId?: string;
  mode?: LearningEvidenceV1['mode'];
}): LearningEvidenceV1 {
  return normalizeLearningEvidenceV1({
    contractVersion: 'learning-evidence.v1',
    nodeId,
    activityId,
    attemptOrdinal: 1,
    origin,
    mode,
    occurredAt,
    ...(graded
      ? {
          gradedEvidence: {
            isCorrect: true,
            score: 1,
            maxScore: 1,
          },
        }
      : {}),
    idempotencyKey,
  });
}

function evaluate(
  evidence: LearningEvidenceV1,
  acceptedEvidence: readonly LearningEvidenceV1[] = [],
) {
  return evaluateLearningEvidenceV1({
    evidence,
    acceptedEvidence,
    enabledNodeIds: [PILOT_NODE_ID],
  });
}

describe('BM2 learning-evidence.v1 pilot', () => {
  it('freezes the one-node manifest to the reviewed Unit 1 Lesson 1 source and canonical accounting-equation mapping', () => {
    const lesson = AUTHORED_UNIT_1_LESSONS.find((candidate) => candidate.lesson.id === LESSON_ID);
    const guidedActivity = lesson?.activities.find((candidate) => candidate.id === GUIDED_ACTIVITY_ID);

    expect(lesson?.lesson).toMatchObject({
      id: LESSON_ID,
      slug: 'unit-1-lesson-1',
      title: 'Launch Unit: A = L + E',
      unitNumber: 1,
      orderIndex: 1,
    });
    expect(guidedActivity).toMatchObject({
      id: GUIDED_ACTIVITY_ID,
      componentKey: 'notebook-organizer',
    });

    expect(BM2_LEARNING_EVIDENCE_PILOT).toEqual({
      enabledNodeIds: [PILOT_NODE_ID],
      mappings: [
        {
          nodeId: PILOT_NODE_ID,
          source: {
            lessonId: LESSON_ID,
            lessonSlug: 'unit-1-lesson-1',
            activityId: GUIDED_ACTIVITY_ID,
            activityKey: GUIDED_ACTIVITY_KEY,
            mode: 'guided_practice',
          },
          masteryAdvantage: {
            activityId: ACCOUNTING_EQUATION_VARIANT_KEY,
            problemFamilyId: ACCOUNTING_EQUATION_VARIANT_KEY,
            variantKey: ACCOUNTING_EQUATION_VARIANT_KEY,
          },
        },
      ],
    });
  });

  it('uses the shared evaluator deterministically without treating teacher-led evidence as mastery-bearing', () => {
    const teacherExposure = makeEvidence({
      origin: 'teacher_led',
      occurredAt: '2026-08-19T08:00:00.000Z',
      idempotencyKey: 'bm2-teacher-led-u01l01-1',
      graded: true,
    });
    const beforeExposure = makeEvidence({
      origin: 'mastery_advantage',
      occurredAt: '2026-08-19T08:01:00.000Z',
      idempotencyKey: 'bm2-mastery-before-exposure-1',
      graded: true,
    });
    const afterExposure = makeEvidence({
      origin: 'mastery_advantage',
      occurredAt: '2026-08-19T08:02:00.000Z',
      idempotencyKey: 'bm2-mastery-after-exposure-1',
      graded: true,
    });
    const ungradedAfterExposure = makeEvidence({
      origin: 'mastery_advantage',
      occurredAt: '2026-08-19T08:03:00.000Z',
      idempotencyKey: 'bm2-mastery-ungraded-after-exposure-1',
    });

    expect(learningEvidenceV1Schema.parse(teacherExposure)).toEqual(teacherExposure);
    expect(learningEvidenceFingerprintV1(teacherExposure)).toBe(
      learningEvidenceFingerprintV1(normalizeLearningEvidenceV1({ ...teacherExposure })),
    );

    expect(evaluate(teacherExposure)).toMatchObject({
      exposureState: 'introduced',
      eligible: false,
      reason: 'teacher_led',
      masteryBearing: false,
    });
    expect(evaluate(beforeExposure)).toMatchObject({
      exposureState: 'awaiting_teacher_exposure',
      eligible: false,
      reason: 'awaiting_teacher_exposure',
      masteryBearing: false,
    });
    expect(evaluate(afterExposure, [teacherExposure])).toMatchObject({
      exposureState: 'introduced',
      eligible: true,
      reason: 'eligible',
      masteryBearing: true,
    });
    expect(evaluate(ungradedAfterExposure, [teacherExposure])).toMatchObject({
      exposureState: 'introduced',
      eligible: false,
      reason: 'ungraded_evidence',
      masteryBearing: false,
    });
  });

  it('denies Mastery Advantage before teacher exposure without creating a BM2 mastery or SRS effect', async () => {
    const runtime = createBm2LearningEvidenceRuntime();
    const evidence = makeEvidence({
      origin: 'mastery_advantage',
      occurredAt: '2026-08-19T08:01:00.000Z',
      idempotencyKey: 'bm2-mastery-before-exposure-runtime-1',
      graded: true,
    });

    await expect(runtime.process({ learnerId: LEARNER_ID, evidence })).resolves.toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        exposureState: 'awaiting_teacher_exposure',
        eligible: false,
        reason: 'awaiting_teacher_exposure',
        masteryBearing: false,
      },
    });
    await expect(runtime.snapshot({ learnerId: LEARNER_ID, nodeId: PILOT_NODE_ID })).resolves.toEqual({
      acceptedEvidence: [],
      introduced: false,
      masteryObservations: [],
      masteryAttemptCount: 0,
      srsCards: [],
      srsRatings: [],
      srsSchedules: [],
    });
  });

  it('records teacher-led exposure exactly once while leaving KST and SRS state untouched, even when graded', async () => {
    const runtime = createBm2LearningEvidenceRuntime();
    const evidence = makeEvidence({
      origin: 'teacher_led',
      occurredAt: '2026-08-19T08:00:00.000Z',
      idempotencyKey: 'bm2-teacher-led-runtime-1',
      graded: true,
    });

    await expect(runtime.process({ learnerId: LEARNER_ID, evidence })).resolves.toMatchObject({
      persisted: true,
      masteryApplied: false,
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    const afterFirstDelivery = await runtime.snapshot({ learnerId: LEARNER_ID, nodeId: PILOT_NODE_ID });

    expect(afterFirstDelivery).toEqual({
      acceptedEvidence: [teacherExposureRecord(evidence)],
      introduced: true,
      masteryObservations: [],
      masteryAttemptCount: 0,
      srsCards: [],
      srsRatings: [],
      srsSchedules: [],
    });

    await expect(runtime.process({ learnerId: LEARNER_ID, evidence })).resolves.toMatchObject({
      persisted: false,
      masteryApplied: false,
      decision: {
        idempotency: 'replay',
        exposureState: 'introduced',
        eligible: false,
        reason: 'teacher_led',
        masteryBearing: false,
      },
    });
    await expect(runtime.snapshot({ learnerId: LEARNER_ID, nodeId: PILOT_NODE_ID })).resolves.toEqual(afterFirstDelivery);
  });

  it('bridges exactly one post-exposure graded accounting-equation attempt with the canonical variant key and no second enabled BM2 node', async () => {
    const runtime = createBm2LearningEvidenceRuntime();
    const teacherExposure = makeEvidence({
      origin: 'teacher_led',
      occurredAt: '2026-08-19T08:00:00.000Z',
      idempotencyKey: 'bm2-teacher-led-before-mastery-runtime-1',
    });
    const masteryEvidence = makeEvidence({
      origin: 'mastery_advantage',
      occurredAt: '2026-08-19T08:02:00.000Z',
      idempotencyKey: 'bm2-mastery-after-exposure-runtime-1',
      graded: true,
    });

    await runtime.process({ learnerId: LEARNER_ID, evidence: teacherExposure });
    await expect(runtime.process({ learnerId: LEARNER_ID, evidence: masteryEvidence })).resolves.toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });

    await expect(runtime.snapshot({ learnerId: LEARNER_ID, nodeId: PILOT_NODE_ID })).resolves.toMatchObject({
      introduced: true,
      masteryAttemptCount: 1,
      masteryObservations: [
        expect.objectContaining({
          nodeId: PILOT_NODE_ID,
          variantKey: ACCOUNTING_EQUATION_VARIANT_KEY,
        }),
      ],
      srsCards: [
        expect.objectContaining({
          objectiveId: PILOT_NODE_ID,
          variantKey: ACCOUNTING_EQUATION_VARIANT_KEY,
        }),
      ],
      srsRatings: [expect.objectContaining({ variantKey: ACCOUNTING_EQUATION_VARIANT_KEY })],
      srsSchedules: [expect.objectContaining({ variantKey: ACCOUNTING_EQUATION_VARIANT_KEY })],
    });
    expect(runtime.enabledNodeIds()).toEqual([PILOT_NODE_ID]);
    expect(runtime.enabledNodeIds()).not.toContain(NON_PILOT_NODE_ID);
  });
});

function teacherExposureRecord(evidence: LearningEvidenceV1) {
  return expect.objectContaining({
    nodeId: PILOT_NODE_ID,
    origin: 'teacher_led',
    idempotencyKey: evidence.idempotencyKey,
  });
}
