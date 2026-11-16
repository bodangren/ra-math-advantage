import { describe, expect, it } from 'vitest';

import {
  evaluateLearningEvidenceV1,
  learningEvidenceV1Schema,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core';
import { AUTHORED_UNIT_1_LESSONS } from '@/lib/curriculum/generated/unit1-authored';
import {
  BM2_LEARNING_EVIDENCE_PILOT,
  BM2_PILOT_PROBLEM_FAMILY_ID,
  bm2ProblemFamilyIdToVariantKey,
  bm2VariantKeyToProblemFamilyId,
} from '@/lib/learning-evidence/bm2-pilot';

const PILOT_NODE_ID = 'math.bm2.skill.1.1.apply-accounting-equation';
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
  it('preserves the legacy problemFamilyId mapping and validates the exact manifest', () => {
    expect(bm2ProblemFamilyIdToVariantKey(BM2_PILOT_PROBLEM_FAMILY_ID)).toBe(
      ACCOUNTING_EQUATION_VARIANT_KEY,
    );
    expect(bm2VariantKeyToProblemFamilyId(ACCOUNTING_EQUATION_VARIANT_KEY)).toBe(
      BM2_PILOT_PROBLEM_FAMILY_ID,
    );
    expect(() => bm2ProblemFamilyIdToVariantKey('another-problem-family')).toThrow(
      'Unsupported BM2 problemFamilyId',
    );
    expect(() => bm2VariantKeyToProblemFamilyId('another-variant')).toThrow(
      'Unsupported BM2 variantKey',
    );
  });

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

});
