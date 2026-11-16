import { describe, expect, it, vi } from 'vitest';

import type { LearningEvidenceV1 } from '@math-platform/practice-core';
import {
  generateTopic12QuadraticNegativeRateIntervalChoiceOutput,
  generateTopic13ConcavityFromRateChangeOutput,
  generateTopic13RatePatternClassificationOutput,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
} from '@math-platform/math-content/knowledge-space';

import { createPrecalculusSubmissionLearningEvidenceHandler } from '@/convex/learningEvidence';
import { gradeTopic14PolynomialDegreeLeadingCoefficient } from '@/lib/practice/topic14-polynomial-degree-leading-coefficient';
import {
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
  PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
  PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
  PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
  PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
  PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
  PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
} from '@/lib/learning-evidence/precalc-pilot';

const LEARNER_ID = 'precalc-owned-submission-learner';
const SUBMISSION_ID = 'precalc-opaque-activity-submission';
const PILOT_NODE_ID = 'math.precalc.skill.1.1.identify-intervals-of-increase-decrease-from-graphs';
const PILOT_ACTIVITY_ID = `${PILOT_NODE_ID}.guided_practice`;
const PILOT_INDEPENDENT_ACTIVITY_ID = `${PILOT_NODE_ID}.independent_practice`;

type ActivitySubmission = {
  submissionId: string;
  userId: string;
  activityId: string;
  stableActivityId?: string;
  masteryContractVersion?: string;
  attemptOrdinal?: number;
  submittedAt: number;
  submissionData: {
    contractVersion?: string;
    activityId: string;
    attemptNumber?: number;
    mode: LearningEvidenceV1['mode'];
    status?: string;
    submittedAt?: string;
    answers: {
      increasingIntervals: string;
      decreasingIntervals: string;
      constantIntervals: string;
    } | {
      selectedOptionId: string;
    } | {
      a: string;
      b: string;
      c: string;
    } | {
      classification: string;
    } | {
      a_degree: string;
      a_leading_coefficient: string;
      b_degree: string;
      b_leading_coefficient: string;
      c_degree: string;
      c_leading_coefficient: string;
    };
    parts: Array<{
      partId: string;
      rawAnswer: string;
      isCorrect: boolean;
      score: number;
      maxScore: number;
    }>;
  };
  score: number;
  maxScore: number;
  gradedAt?: number;
};

type EvidenceStore = {
  findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null>;
  listByLearnerAndNode(
    learnerId: string,
    nodeId: string,
  ): Promise<readonly LearningEvidenceV1[]>;
  append(learnerId: string, evidence: LearningEvidenceV1): Promise<void>;
};

type SubmissionReceipt = {
  persisted: boolean;
  masteryApplied: boolean;
  kstApplied: boolean;
  decision: {
    idempotency: 'new' | 'replay';
    exposureState: 'introduced';
    eligible: true;
    reason: 'eligible';
    masteryBearing: true;
  };
};

type ReceiptStore = {
  findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<SubmissionReceipt | null>;
  append(
    learnerId: string,
    submissionId: string,
    receipt: SubmissionReceipt,
  ): Promise<void>;
};

class InMemoryEvidenceStore implements EvidenceStore {
  readonly events: Array<{ learnerId: string; evidence: LearningEvidenceV1 }> = [];

  constructor(private readonly effectOrder: string[]) {}

  async findByIdempotencyKey(
    learnerId: string,
    idempotencyKey: string,
  ): Promise<LearningEvidenceV1 | null> {
    return this.events.find((entry) => (
      entry.learnerId === learnerId
      && entry.evidence.idempotencyKey === idempotencyKey
    ))?.evidence ?? null;
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
    this.effectOrder.push('evidence');
  }
}

class InMemoryReceiptStore implements ReceiptStore {
  readonly receipts = new Map<string, SubmissionReceipt>();

  constructor(private readonly effectOrder: string[]) {}

  async findBySubmissionId(
    learnerId: string,
    submissionId: string,
  ): Promise<SubmissionReceipt | null> {
    return this.receipts.get(`${learnerId}:${submissionId}`) ?? null;
  }

  async append(
    learnerId: string,
    submissionId: string,
    receipt: SubmissionReceipt,
  ): Promise<void> {
    this.receipts.set(`${learnerId}:${submissionId}`, receipt);
    this.effectOrder.push('receipt');
  }
}

function makeTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PILOT_NODE_ID,
    activityId: `${PILOT_NODE_ID}.teacher-led-exposure`,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T09:00:00.000Z',
    idempotencyKey: 'precalc-teacher-exposure-before-owned-submission',
  };
}

function makePhysicalTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
    activityId: `${PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID}.teacher-led-exposure`,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T09:00:00.000Z',
    idempotencyKey: 'precalc-physical-context-teacher-exposure',
  };
}

function makePhysicalSubmission(
  mode: 'guided_practice' | 'independent_practice' = 'guided_practice',
  overrides: Partial<ActivitySubmission> = {},
): ActivitySubmission {
  const stableActivityId = mode === 'guided_practice'
    ? PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID
    : PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID;
  const selectedOptionId = mode === 'guided_practice' ? 'C' : 'B';
  return {
    submissionId: 'precalc-physical-context-submission',
    userId: LEARNER_ID,
    activityId: 'precalc-physical-context-activity-document',
    stableActivityId,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submittedAt: Date.parse('2026-08-19T10:00:00.000Z'),
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: stableActivityId,
      attemptNumber: 2,
      mode,
      status: 'graded',
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers: { selectedOptionId },
      parts: [{ partId: 'selectedOptionId', rawAnswer: selectedOptionId, isCorrect: true, score: 1, maxScore: 1 }],
    },
    score: 1,
    maxScore: 1,
    gradedAt: Date.parse('2026-08-19T10:01:00.000Z'),
    ...overrides,
  };
}

function makeNegativeRateTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
    activityId: `${PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID}.teacher-led-exposure`,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T09:00:00.000Z',
    idempotencyKey: 'precalc-negative-rate-context-teacher-exposure',
  };
}

function makeNegativeRateSubmission(
  mode: 'guided_practice' | 'independent_practice' = 'guided_practice',
  overrides: Partial<ActivitySubmission> = {},
): ActivitySubmission {
  const stableActivityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID;
  const selectedOptionId = 'B';
  return {
    submissionId: `precalc-negative-rate-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-negative-rate-${mode}-activity-document`,
    stableActivityId,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 7,
    submittedAt: Date.parse('2026-08-19T10:00:00.000Z'),
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: stableActivityId,
      attemptNumber: 7,
      mode,
      status: 'graded',
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers: { selectedOptionId },
      parts: [{
        partId: 'selectedOptionId',
        rawAnswer: selectedOptionId,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
    },
    score: 1,
    maxScore: 1,
    gradedAt: Date.parse('2026-08-19T10:01:00.000Z'),
    ...overrides,
  };
}

function makeQuadraticNegativeRateTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
    activityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T09:00:00.000Z',
    idempotencyKey: 'precalc-quadratic-negative-rate-interval-teacher-exposure',
  };
}

function makeQuadraticNegativeRateSubmission(
  mode: 'guided_practice' | 'independent_practice' = 'guided_practice',
  overrides: Partial<ActivitySubmission> = {},
): ActivitySubmission {
  const stableActivityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID;
  const seed = mode === 'guided_practice' ? 1 : 2;
  const selectedOptionId = (generateTopic12QuadraticNegativeRateIntervalChoiceOutput(seed).expectedAnswer as {
    selectedOptionId: string;
  }).selectedOptionId;
  return {
    submissionId: `precalc-quadratic-negative-rate-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-quadratic-negative-rate-${mode}-activity-document`,
    stableActivityId,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 7,
    submittedAt: Date.parse('2026-08-19T10:00:00.000Z'),
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: stableActivityId,
      attemptNumber: 7,
      mode,
      status: 'graded',
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers: { selectedOptionId },
      parts: [{
        partId: 'selectedOptionId',
        rawAnswer: selectedOptionId,
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
    },
    score: 1,
    maxScore: 1,
    gradedAt: Date.parse('2026-08-19T10:01:00.000Z'),
    ...overrides,
  };
}

type RatePatternAnswers = { a: string; b: string; c: string };

function makeRatePatternTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
    activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T09:00:00.000Z',
    idempotencyKey: 'precalc-rate-pattern-classification-teacher-exposure',
  };
}

function makeRatePatternSubmission(
  mode: 'guided_practice' | 'independent_practice' = 'guided_practice',
  options: {
    answers?: Partial<RatePatternAnswers>;
    overrides?: Partial<ActivitySubmission>;
  } = {},
): ActivitySubmission {
  const stableActivityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID;
  const seed = mode === 'guided_practice' ? 1 : 2;
  const expected = generateTopic13RatePatternClassificationOutput(seed).expectedAnswer as RatePatternAnswers;
  const answers: RatePatternAnswers = {
    ...expected,
    ...options.answers,
  };
  const parts = (['a', 'b', 'c'] as const).map((partId) => ({
    partId,
    rawAnswer: answers[partId],
    isCorrect: answers[partId] === expected[partId],
    score: answers[partId] === expected[partId] ? 1 : 0,
    maxScore: 1,
  }));
  const score = parts.reduce((total, part) => total + part.score, 0);
  const base: ActivitySubmission = {
    submissionId: `precalc-rate-pattern-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-rate-pattern-${mode}-activity-document`,
    stableActivityId,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 7,
    submittedAt: Date.parse('2026-08-19T10:00:00.000Z'),
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: stableActivityId,
      attemptNumber: 7,
      mode,
      status: 'graded',
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers,
      parts,
    },
    score,
    maxScore: 3,
    gradedAt: Date.parse('2026-08-19T10:01:00.000Z'),
  };
  return { ...base, ...options.overrides };
}

function makeConcavityTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
    activityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T09:00:00.000Z',
    idempotencyKey: 'precalc-concavity-teacher-exposure',
  };
}

function makeConcavitySubmission(
  mode: 'guided_practice' | 'independent_practice' = 'guided_practice',
  options: {
    score?: number;
    overrides?: Partial<ActivitySubmission>;
  } = {},
): ActivitySubmission {
  const stableActivityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID;
  const seed = mode === 'guided_practice' ? 1 : 2;
  const expected = generateTopic13ConcavityFromRateChangeOutput(seed).expectedAnswer as {
    classification: string;
  };
  const score = options.score ?? 1;
  const base: ActivitySubmission = {
    submissionId: `precalc-concavity-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-concavity-${mode}-activity-document`,
    stableActivityId,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 7,
    submittedAt: Date.parse('2026-08-19T10:00:00.000Z'),
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: stableActivityId,
      attemptNumber: 7,
      mode,
      status: 'graded',
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers: { classification: expected.classification },
      parts: [{
        partId: 'classification',
        rawAnswer: expected.classification,
        isCorrect: score === 1,
        score,
        maxScore: 1,
      }],
    },
    score,
    maxScore: 1,
    gradedAt: Date.parse('2026-08-19T10:01:00.000Z'),
  };
  return { ...base, ...options.overrides };
}

type PolynomialAnswers = {
  a_degree: string;
  a_leading_coefficient: string;
  b_degree: string;
  b_leading_coefficient: string;
  c_degree: string;
  c_leading_coefficient: string;
};

function makePolynomialTeacherExposure(): LearningEvidenceV1 {
  return {
    contractVersion: 'learning-evidence.v1',
    nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
    activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
    attemptOrdinal: 1,
    origin: 'teacher_led',
    mode: 'teaching',
    occurredAt: '2026-08-19T09:00:00.000Z',
    idempotencyKey: 'precalc-polynomial-degree-leading-coefficient-teacher-exposure',
  };
}

function makePolynomialSubmission(
  mode: 'guided_practice' | 'independent_practice' = 'guided_practice',
  options: {
    answers?: Partial<PolynomialAnswers>;
    overrides?: Partial<ActivitySubmission>;
  } = {},
): ActivitySubmission {
  const stableActivityId = mode === 'guided_practice'
    ? PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID
    : PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID;
  const seed = mode === 'guided_practice' ? 1 : 2;
  const expected = generateTopic14PolynomialDegreeLeadingCoefficientOutput(seed).expectedAnswer as Record<keyof PolynomialAnswers, number>;
  const answers: PolynomialAnswers = {
    a_degree: String(expected.a_degree),
    a_leading_coefficient: String(expected.a_leading_coefficient),
    b_degree: String(expected.b_degree),
    b_leading_coefficient: String(expected.b_leading_coefficient),
    c_degree: String(expected.c_degree),
    c_leading_coefficient: String(expected.c_leading_coefficient),
    ...options.answers,
  };
  const graded = gradeTopic14PolynomialDegreeLeadingCoefficient(seed, answers);
  const parts = graded.parts.map((part) => ({ ...part }));
  const base: ActivitySubmission = {
    submissionId: `precalc-polynomial-${mode}-submission`,
    userId: LEARNER_ID,
    activityId: `precalc-polynomial-${mode}-activity-document`,
    stableActivityId,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 7,
    submittedAt: Date.parse('2026-08-19T10:00:00.000Z'),
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: stableActivityId,
      attemptNumber: 7,
      mode,
      status: 'graded',
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers,
      parts,
    },
    score: graded.score,
    maxScore: 6,
    gradedAt: Date.parse('2026-08-19T10:01:00.000Z'),
  };
  return { ...base, ...options.overrides };
}

function makeSubmission(overrides: Partial<ActivitySubmission> = {}): ActivitySubmission {
  return {
    submissionId: SUBMISSION_ID,
    userId: LEARNER_ID,
    activityId: 'precalc-pilot-activity-document',
    stableActivityId: PILOT_ACTIVITY_ID,
    masteryContractVersion: 'learning-evidence.v1',
    attemptOrdinal: 2,
    submittedAt: Date.parse('2026-08-19T10:00:00.000Z'),
    submissionData: {
      contractVersion: 'practice.v1',
      activityId: PILOT_ACTIVITY_ID,
      attemptNumber: 2,
      mode: 'guided_practice',
      status: 'graded',
      submittedAt: '2026-08-19T10:00:00.000Z',
      answers: {
        increasingIntervals: '[-3,-1]',
        decreasingIntervals: '[-1,3]',
        constantIntervals: '[3,5]',
      },
      parts: [
        { partId: 'increasingIntervals', rawAnswer: '[-3,-1]', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'decreasingIntervals', rawAnswer: '[-1,3]', isCorrect: true, score: 1, maxScore: 1 },
        { partId: 'constantIntervals', rawAnswer: '[3,5]', isCorrect: true, score: 1, maxScore: 1 },
      ],
    },
    score: 3,
    maxScore: 3,
    gradedAt: Date.parse('2026-08-19T10:01:00.000Z'),
    ...overrides,
  };
}

function createHarness(options: {
  submission?: ActivitySubmission | null;
  masteryFailure?: Error;
  teacherExposure?: LearningEvidenceV1;
} = {}) {
  const submission = Object.hasOwn(options, 'submission')
    ? options.submission ?? null
    : makeSubmission();
  const effectOrder: string[] = [];
  const evidenceStore = new InMemoryEvidenceStore(effectOrder);
  const receiptStore = new InMemoryReceiptStore(effectOrder);
  const teacherExposure = options.teacherExposure ?? makeTeacherExposure();
  evidenceStore.events.push({ learnerId: LEARNER_ID, evidence: teacherExposure });
  const loadActivitySubmission = vi.fn(async (submissionId: string) => (
    submission?.submissionId === submissionId ? submission : null
  ));
  const masteryBridge = vi.fn(async (): Promise<void> => {
    effectOrder.push('mastery');
    if (options.masteryFailure) throw options.masteryFailure;
  });
  const handler = createPrecalculusSubmissionLearningEvidenceHandler({
    evidenceStore,
    loadActivitySubmission,
    masteryBridge,
    receiptStore,
  });

  return {
    effectOrder,
    evidenceStore,
    handler,
    loadActivitySubmission,
    masteryBridge,
    receiptStore,
    teacherExposure,
  };
}

describe('AP Precalculus server-owned learning-evidence submissions', () => {
  it('derives the Guided server grade and stores non-mastery evidence before the receipt', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      loadActivitySubmission,
      masteryBridge,
      receiptStore,
    } = createHarness();

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(loadActivitySubmission).toHaveBeenCalledWith(SUBMISSION_ID);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual(['evidence', 'receipt']);
    expect(result).toEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: false,
      },
    });
    expect(JSON.stringify(result)).not.toContain('[-3,-1]');
    expect(evidenceStore.events[1]?.evidence).not.toHaveProperty('rawAnswer');
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(receiptStore.receipts.get(`${LEARNER_ID}:${SUBMISSION_ID}`)).toMatchObject({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
    });
  });

  it('fails closed before evidence or receipt persistence when the mastery effect fails', async () => {
    const guided = makeSubmission();
    const submission = makeSubmission({
      stableActivityId: PILOT_INDEPENDENT_ACTIVITY_ID,
      submissionData: {
        ...guided.submissionData,
        activityId: PILOT_INDEPENDENT_ACTIVITY_ID,
        mode: 'independent_practice',
      },
    });
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
      teacherExposure,
    } = createHarness({ masteryFailure: new Error('Mastery effect failed'), submission });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }))
      .rejects.toThrow('Mastery effect failed');

    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(effectOrder).toEqual(['mastery']);
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
    expect(receiptStore.receipts.size).toBe(0);
  });

  it.each([
    ['an unknown submission', null],
    ['a submission owned by another learner', makeSubmission({ userId: 'other-precalc-learner' })],
    ['a non-pilot stable activity', makeSubmission({
      stableActivityId: 'unapproved-precalc-activity',
    })],
    ['a legacy row without the server-owned stable activity ID', makeSubmission({
      stableActivityId: undefined,
    })],
  ])('rejects %s without evidence or a mastery effect', async (_label, submission) => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      teacherExposure,
    } = createHarness({ submission });

    const result = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(result).toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([{ learnerId: LEARNER_ID, evidence: teacherExposure }]);
  });

  it('returns the original logical result on replay without another downstream effect', async () => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness();

    const first = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });
    const replay = await handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID });

    expect(first).toEqual({
      persisted: true,
      masteryApplied: false,
      kstApplied: false,
      delivery: 'new',
      decision: {
        idempotency: 'new',
        exposureState: 'introduced',
        eligible: true,
        reason: 'eligible',
        masteryBearing: false,
      },
    });
    expect(replay).toEqual({ ...first, delivery: 'replay' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(effectOrder).toEqual(['evidence', 'receipt']);
  });

  it('refuses to synthesize a replay when evidence exists without its receipt', async () => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({ submission: makeSubmission({ attemptOrdinal: 3 }) });
    evidenceStore.events.push({
      learnerId: LEARNER_ID,
      evidence: {
        contractVersion: 'learning-evidence.v1',
        nodeId: PILOT_NODE_ID,
        activityId: PILOT_ACTIVITY_ID,
        attemptOrdinal: 2,
        origin: 'mastery_advantage',
        mode: 'guided_practice',
        occurredAt: '2026-08-19T10:01:00.000Z',
        gradedEvidence: { isCorrect: false, score: 0, maxScore: 3 },
        idempotencyKey: `precalc:mastery-advantage:submission:${SUBMISSION_ID}`,
      },
    });

    await expect(handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }))
      .rejects.toThrow('exists without a submission receipt');
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(receiptStore.receipts.size).toBe(0);
  });

  it.each([1, 2])(
    'rejects a non-increasing attempt ordinal (%s) in the exact mastery scope before effects',
    async (receivedAttemptOrdinal) => {
      const {
        effectOrder,
        evidenceStore,
        handler,
        masteryBridge,
      } = createHarness({
        submission: makeSubmission({
          attemptOrdinal: receivedAttemptOrdinal,
        }),
      });

      evidenceStore.events.push({
        learnerId: LEARNER_ID,
        evidence: {
          contractVersion: 'learning-evidence.v1',
          nodeId: PILOT_NODE_ID,
          activityId: PILOT_ACTIVITY_ID,
          attemptOrdinal: 2,
          origin: 'mastery_advantage',
          mode: 'guided_practice',
          occurredAt: '2026-08-19T09:30:00.000Z',
          gradedEvidence: { isCorrect: false, score: 0, maxScore: 3 },
          idempotencyKey: 'precalc-prior-mastery-attempt',
        },
      });

      await expect(
        handler.process({ learnerId: LEARNER_ID, submissionId: SUBMISSION_ID }),
      ).resolves.toEqual({
        accepted: false,
        reason: 'attempt_ordinal_conflict',
        latestAttemptOrdinal: 2,
        receivedAttemptOrdinal,
      });
      expect(masteryBridge).not.toHaveBeenCalled();
      expect(effectOrder).toEqual([]);
      expect(evidenceStore.events).toHaveLength(2);
    },
  );

  it.each([
    ['a missing practice contract version', makeSubmission({
      submissionData: {
        ...makeSubmission().submissionData,
        contractVersion: undefined,
      },
    })],
    ['a mismatched mastery contract version', makeSubmission({
      masteryContractVersion: 'legacy.learning-evidence.v1',
    })],
    ['an independent-practice stored mode', makeSubmission({
      submissionData: {
        ...makeSubmission().submissionData,
        mode: 'independent_practice',
      },
    })],
    ['an assessment stored mode', makeSubmission({
      submissionData: {
        ...makeSubmission().submissionData,
        mode: 'assessment',
      },
    })],
    ['a missing stored status', makeSubmission({
      submissionData: {
        ...makeSubmission().submissionData,
        status: undefined,
      },
    })],
    ['an ungraded stored status', makeSubmission({
      submissionData: {
        ...makeSubmission().submissionData,
        contractVersion: 'practice.v1',
        status: 'submitted',
      },
    })],
    ['an out-of-range server score', makeSubmission({
      score: 4,
      maxScore: 3,
      submissionData: {
        ...makeSubmission().submissionData,
        contractVersion: 'practice.v1',
      },
    })],
    ['a missing server grade timestamp', makeSubmission({
      gradedAt: undefined,
      submissionData: {
        ...makeSubmission().submissionData,
        contractVersion: 'practice.v1',
      },
    })],
  ])('rejects %s before mastery, evidence, or receipt effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({ submission });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: SUBMISSION_ID,
    })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });

    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([
      { learnerId: LEARNER_ID, evidence: makeTeacherExposure() },
    ]);
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual([]);
  });

  it.each([
    ['Guided', PRECALCULUS_PHYSICAL_CONTEXT_GUIDED_ACTIVITY_ID, 'guided_practice' as const],
    ['Independent', PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID, 'independent_practice' as const],
  ])('maps a trusted physical %s submission to its exact node', async (_label, activityId, mode) => {
    const submission = makePhysicalSubmission(mode);
    const {
      evidenceStore,
      handler,
      masteryBridge,
    } = createHarness({
      submission,
      teacherExposure: makePhysicalTeacherExposure(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    });

    expect(result).toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: {
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(masteryBridge).toHaveBeenCalledTimes(1);
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]?.evidence).toEqual(expect.objectContaining({
      nodeId: PRECALCULUS_PHYSICAL_CONTEXT_NODE_ID,
      activityId,
      mode,
      attemptOrdinal: 2,
      occurredAt: '2026-08-19T10:00:00.000Z',
      gradedEvidence: {
        isCorrect: true,
        score: 1,
        maxScore: 1,
      },
    }));
  });

  it.each([
    ['a cross-paired physical activity and mode', (() => {
      const submission = makePhysicalSubmission('guided_practice');
      submission.submissionData = {
        ...submission.submissionData,
        activityId: PRECALCULUS_PHYSICAL_CONTEXT_INDEPENDENT_ACTIVITY_ID,
        mode: 'independent_practice',
      };
      return submission;
    })()],
    ['a different learner', makePhysicalSubmission('guided_practice', { userId: 'other-precalc-learner' })],
    ['a different mastery contract', makePhysicalSubmission('guided_practice', {
      masteryContractVersion: 'legacy.learning-evidence.v1',
    })],
  ] as const)('rejects %s before physical evidence effects', async (_label, submission) => {
    const {
      evidenceStore,
      handler,
      masteryBridge,
    } = createHarness({
      submission,
      teacherExposure: makePhysicalTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toHaveLength(1);
  });

  it('enables the Example 4 node exactly once for the pilot allow-list', () => {
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
      (nodeId) => nodeId === PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
    )).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it('enables the Example 5 node exactly once for the pilot allow-list', () => {
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
      (nodeId) => nodeId === PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
    )).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it.each([
    ['Guided', 'guided_practice' as const],
    ['Independent', 'independent_practice' as const],
  ])('maps a trusted Example 4 %s submission to exact evidence', async (_label, mode) => {
    const submission = makeNegativeRateSubmission(mode);
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeNegativeRateTeacherExposure(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    });

    const expectedEvidence = {
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_NODE_ID,
      activityId: submission.stableActivityId,
      mode,
      attemptOrdinal: 7,
      origin: 'mastery_advantage',
      occurredAt: '2026-08-19T10:00:00.000Z',
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
      idempotencyKey: `precalc:mastery-advantage:submission:${submission.submissionId}`,
    };

    expect(result).toEqual({
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
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
      evidence: expectedEvidence,
    });
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]?.evidence).toEqual(expectedEvidence);
    expect(receiptStore.receipts.size).toBe(1);

    const replay = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    });
    expect(replay).toEqual({ ...result, delivery: 'replay' });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
  });

  it('waits for exact Example 4 teacher exposure without any effects', async () => {
    const submission = makeNegativeRateSubmission('guided_practice');
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({
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
    expect(evidenceStore.events).toHaveLength(1);
    expect(receiptStore.receipts.size).toBe(0);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual([]);
  });

  it.each([
    ['cross-paired Guided stable and Independent body IDs', (() => {
      const submission = makeNegativeRateSubmission('guided_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_INDEPENDENT_ACTIVITY_ID,
          mode: 'independent_practice' as const,
        },
      };
    })()],
    ['cross-paired Independent stable and Guided body IDs', (() => {
      const submission = makeNegativeRateSubmission('independent_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_GUIDED_ACTIVITY_ID,
          mode: 'guided_practice' as const,
        },
      };
    })()],
    ['a foreign learner', makeNegativeRateSubmission('guided_practice', { userId: 'other-precalc-learner' })],
    ['a different mastery contract', makeNegativeRateSubmission('guided_practice', {
      masteryContractVersion: 'legacy.learning-evidence.v1',
    })],
    ['a zero attempt ordinal', makeNegativeRateSubmission('guided_practice', {
      attemptOrdinal: 0,
    })],
    ['a fractional attempt ordinal', makeNegativeRateSubmission('guided_practice', {
      attemptOrdinal: 1.5,
    })],
    ['a Guided identity with Independent mode', (() => {
      const submission = makeNegativeRateSubmission('guided_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          mode: 'independent_practice' as const,
        },
      };
    })()],
    ['an Independent identity with Guided mode', (() => {
      const submission = makeNegativeRateSubmission('independent_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          mode: 'guided_practice' as const,
        },
      };
    })()],
    ['an ungraded stored status', makeNegativeRateSubmission('guided_practice', {
      submissionData: {
        ...makeNegativeRateSubmission().submissionData,
        status: 'submitted',
      },
    })],
    ['an invalid submitted timestamp', makeNegativeRateSubmission('guided_practice', {
      submittedAt: Number.NaN,
    })],
    ['an invalid graded timestamp', makeNegativeRateSubmission('guided_practice', {
      gradedAt: Number.NaN,
    })],
    ['an invalid server score', makeNegativeRateSubmission('guided_practice', {
      score: 2,
    })],
    ['an invalid server max score', makeNegativeRateSubmission('guided_practice', {
      maxScore: 0,
    })],
    ['a Worked activity', (() => {
      const submission = makeNegativeRateSubmission('guided_practice');
      return {
        ...submission,
        stableActivityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_12_NEGATIVE_RATE_CONTEXT_WORKED_ACTIVITY_ID,
          mode: 'teaching' as const,
        },
      };
    })()],
    ['an unrelated activity family', (() => {
      const submission = makeNegativeRateSubmission('guided_practice');
      return {
        ...submission,
        stableActivityId: 'math.precalc.other.guided_practice',
        submissionData: {
          ...submission.submissionData,
          activityId: 'math.precalc.other.guided_practice',
        },
      };
    })()],
  ] as const)('rejects %s before Example 4 evidence effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeNegativeRateTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toHaveLength(1);
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual([]);
  });

  it.each([
    ['Guided', 'guided_practice' as const],
    ['Independent', 'independent_practice' as const],
  ])('maps a trusted Example 5 %s submission to exact evidence', async (_label, mode) => {
    const submission = makeQuadraticNegativeRateSubmission(mode);
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeQuadraticNegativeRateTeacherExposure(),
    });

    const result = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    });

    const expectedEvidence = {
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_NODE_ID,
      activityId: submission.stableActivityId,
      mode,
      attemptOrdinal: 7,
      origin: 'mastery_advantage',
      occurredAt: '2026-08-19T10:00:00.000Z',
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
      idempotencyKey: `precalc:mastery-advantage:submission:${submission.submissionId}`,
    };

    expect(result).toEqual({
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
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
      evidence: expectedEvidence,
    });
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]?.evidence).toEqual(expectedEvidence);
    expect(receiptStore.receipts.size).toBe(1);

    const replay = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    });
    expect(replay).toEqual({ ...result, delivery: 'replay' });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
  });

  it('waits for exact Example 5 teacher exposure without any effects', async () => {
    const submission = makeQuadraticNegativeRateSubmission('guided_practice');
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({
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
    expect(evidenceStore.events).toHaveLength(1);
    expect(receiptStore.receipts.size).toBe(0);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual([]);
  });

  it.each([
    ['cross-paired Guided stable and Independent body IDs', (() => {
      const submission = makeQuadraticNegativeRateSubmission('guided_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_INDEPENDENT_ACTIVITY_ID,
          mode: 'independent_practice' as const,
        },
      };
    })()],
    ['cross-paired Independent stable and Guided body IDs', (() => {
      const submission = makeQuadraticNegativeRateSubmission('independent_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_GUIDED_ACTIVITY_ID,
          mode: 'guided_practice' as const,
        },
      };
    })()],
    ['a Guided identity with Independent mode', (() => {
      const submission = makeQuadraticNegativeRateSubmission('guided_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          mode: 'independent_practice' as const,
        },
      };
    })()],
    ['an Independent identity with Guided mode', (() => {
      const submission = makeQuadraticNegativeRateSubmission('independent_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          mode: 'guided_practice' as const,
        },
      };
    })()],
    ['a foreign learner', makeQuadraticNegativeRateSubmission('guided_practice', { userId: 'other-precalc-learner' })],
    ['a different mastery contract', makeQuadraticNegativeRateSubmission('guided_practice', {
      masteryContractVersion: 'legacy.learning-evidence.v1',
    })],
    ['a zero attempt ordinal', makeQuadraticNegativeRateSubmission('guided_practice', {
      attemptOrdinal: 0,
    })],
    ['a fractional attempt ordinal', makeQuadraticNegativeRateSubmission('guided_practice', {
      attemptOrdinal: 1.5,
    })],
    ['an ungraded stored status', makeQuadraticNegativeRateSubmission('guided_practice', {
      submissionData: {
        ...makeQuadraticNegativeRateSubmission().submissionData,
        status: 'submitted',
      },
    })],
    ['an invalid submitted timestamp', makeQuadraticNegativeRateSubmission('guided_practice', {
      submittedAt: Number.NaN,
    })],
    ['an invalid graded timestamp', makeQuadraticNegativeRateSubmission('guided_practice', {
      gradedAt: Number.NaN,
    })],
    ['an invalid server score', makeQuadraticNegativeRateSubmission('guided_practice', {
      score: 2,
    })],
    ['an invalid server max score', makeQuadraticNegativeRateSubmission('guided_practice', {
      maxScore: 0,
    })],
    ['a Worked activity', (() => {
      const submission = makeQuadraticNegativeRateSubmission('guided_practice');
      return {
        ...submission,
        stableActivityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_12_QUADRATIC_NEGATIVE_RATE_INTERVAL_WORKED_ACTIVITY_ID,
          mode: 'teaching' as const,
        },
      };
    })()],
    ['an unrelated activity family', (() => {
      const submission = makeQuadraticNegativeRateSubmission('guided_practice');
      return {
        ...submission,
        stableActivityId: 'math.precalc.other.guided_practice',
        submissionData: {
          ...submission.submissionData,
          activityId: 'math.precalc.other.guided_practice',
        },
      };
    })()],
  ] as const)('rejects %s before Example 5 evidence effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeQuadraticNegativeRateTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toHaveLength(1);
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual([]);
  });

  it('enables the Topic 1.3 rate-pattern node exactly once for the pilot allow-list', () => {
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
      (nodeId) => nodeId === PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
    )).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it.each([
    ['Guided', 'guided_practice' as const],
    ['Independent', 'independent_practice' as const],
  ])('maps a trusted Topic 1.3 %s submission to exact evidence', async (_label, mode) => {
    const submission = makeRatePatternSubmission(mode);
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeRatePatternTeacherExposure(),
    });

    const expectedEvidence = {
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      activityId: submission.stableActivityId,
      mode,
      attemptOrdinal: 7,
      origin: 'mastery_advantage',
      occurredAt: '2026-08-19T10:00:00.000Z',
      gradedEvidence: { isCorrect: true, score: 3, maxScore: 3 },
      idempotencyKey: `precalc:mastery-advantage:submission:${submission.submissionId}`,
    };

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({
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
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
      evidence: expectedEvidence,
    });
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]?.evidence).toEqual(expectedEvidence);
    expect(receiptStore.receipts.size).toBe(1);

    const replay = await handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    });
    expect(replay).toEqual({
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
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
  });

  it('preserves a trusted partial Topic 1.3 grade in exact evidence', async () => {
    const expected = generateTopic13RatePatternClassificationOutput(1).expectedAnswer as RatePatternAnswers;
    const wrongA = expected.a === 'linear' ? 'quadratic' : 'linear';
    const submission = makeRatePatternSubmission('guided_practice', {
      answers: { a: wrongA },
    });
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeRatePatternTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: {
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events[1]?.evidence).toEqual(expect.objectContaining({
      nodeId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_NODE_ID,
      activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
      mode: 'guided_practice',
      attemptOrdinal: 7,
      occurredAt: '2026-08-19T10:00:00.000Z',
      gradedEvidence: { isCorrect: false, score: 2, maxScore: 3 },
    }));
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('waits for exact Topic 1.3 teacher exposure without any effects', async () => {
    const submission = makeRatePatternSubmission('guided_practice');
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({
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
    expect(evidenceStore.events).toEqual([
      { learnerId: LEARNER_ID, evidence: makeTeacherExposure() },
    ]);
    expect(receiptStore.receipts.size).toBe(0);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual([]);
  });

  it.each([
    ['cross-paired Guided stable and Independent body IDs', (() => {
      const submission = makeRatePatternSubmission('guided_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_INDEPENDENT_ACTIVITY_ID,
          mode: 'independent_practice' as const,
        },
      };
    })()],
    ['cross-paired Independent stable and Guided body IDs', (() => {
      const submission = makeRatePatternSubmission('independent_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_GUIDED_ACTIVITY_ID,
          mode: 'guided_practice' as const,
        },
      };
    })()],
    ['a Guided identity with Independent mode', (() => {
      const submission = makeRatePatternSubmission('guided_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          mode: 'independent_practice' as const,
        },
      };
    })()],
    ['an Independent identity with Guided mode', (() => {
      const submission = makeRatePatternSubmission('independent_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          mode: 'guided_practice' as const,
        },
      };
    })()],
    ['a foreign learner', makeRatePatternSubmission('guided_practice', {
      overrides: { userId: 'other-precalc-learner' },
    })],
    ['a different mastery contract', makeRatePatternSubmission('guided_practice', {
      overrides: { masteryContractVersion: 'legacy.learning-evidence.v1' },
    })],
    ['a zero attempt ordinal', makeRatePatternSubmission('guided_practice', {
      overrides: { attemptOrdinal: 0 },
    })],
    ['a fractional attempt ordinal', makeRatePatternSubmission('guided_practice', {
      overrides: { attemptOrdinal: 1.5 },
    })],
    ['an ungraded stored status', makeRatePatternSubmission('guided_practice', {
      overrides: {
        submissionData: {
          ...makeRatePatternSubmission().submissionData,
          status: 'submitted',
        },
      },
    })],
    ['an invalid submitted timestamp', makeRatePatternSubmission('guided_practice', {
      overrides: { submittedAt: Number.NaN },
    })],
    ['an invalid graded timestamp', makeRatePatternSubmission('guided_practice', {
      overrides: { gradedAt: Number.NaN },
    })],
    ['an invalid server score', makeRatePatternSubmission('guided_practice', {
      overrides: { score: 4 },
    })],
    ['an invalid server max score', makeRatePatternSubmission('guided_practice', {
      overrides: { maxScore: 0 },
    })],
    ['a Worked activity', (() => {
      const submission = makeRatePatternSubmission('guided_practice');
      return {
        ...submission,
        stableActivityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID,
          mode: 'teaching' as const,
        },
      };
    })()],
  ] as const)('rejects %s before Topic 1.3 evidence effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeRatePatternTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([
      { learnerId: LEARNER_ID, evidence: makeRatePatternTeacherExposure() },
    ]);
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual([]);
  });

  it('enables the Topic 1.3 concavity node exactly once for the pilot allow-list', () => {
    expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
      (nodeId) => nodeId === PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
    )).toHaveLength(1);
    expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
      PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
    );
  });

  it.each([
    ['Guided', 'guided_practice' as const],
    ['Independent', 'independent_practice' as const],
  ])('maps a trusted Topic 1.3 concavity %s submission to exact evidence', async (_label, mode) => {
    const submission = makeConcavitySubmission(mode);
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeConcavityTeacherExposure(),
    });
    const expectedEvidence = {
      contractVersion: 'learning-evidence.v1',
      nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      activityId: submission.stableActivityId,
      mode,
      attemptOrdinal: 7,
      origin: 'mastery_advantage',
      occurredAt: '2026-08-19T10:00:00.000Z',
      gradedEvidence: { isCorrect: true, score: 1, maxScore: 1 },
      idempotencyKey: `precalc:mastery-advantage:submission:${submission.submissionId}`,
    };

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({
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
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(masteryBridge).toHaveBeenCalledWith({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
      evidence: expectedEvidence,
    });
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    expect(evidenceStore.events).toHaveLength(2);
    expect(evidenceStore.events[1]?.evidence).toEqual(expectedEvidence);
    expect(receiptStore.receipts.size).toBe(1);

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({
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
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events).toHaveLength(2);
    expect(receiptStore.receipts.size).toBe(1);
    expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
  });

  it('preserves a trusted zero Topic 1.3 concavity grade in exact evidence', async () => {
    const submission = makeConcavitySubmission('guided_practice', { score: 0 });
    const {
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeConcavityTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toMatchObject({
      persisted: true,
      masteryApplied: true,
      decision: {
        eligible: true,
        reason: 'eligible',
        masteryBearing: true,
      },
    });
    expect(masteryBridge).toHaveBeenCalledOnce();
    expect(evidenceStore.events[1]?.evidence).toEqual(expect.objectContaining({
      nodeId: PRECALCULUS_TOPIC_13_CONCAVITY_NODE_ID,
      activityId: PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
      mode: 'guided_practice',
      attemptOrdinal: 7,
      occurredAt: '2026-08-19T10:00:00.000Z',
      gradedEvidence: { isCorrect: false, score: 0, maxScore: 1 },
    }));
    expect(receiptStore.receipts.size).toBe(1);
  });

  it('waits for exact Topic 1.3 concavity teacher exposure without any effects', async () => {
    const submission = makeConcavitySubmission('guided_practice');
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({
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
    expect(evidenceStore.events).toEqual([
      { learnerId: LEARNER_ID, evidence: makeTeacherExposure() },
    ]);
    expect(receiptStore.receipts.size).toBe(0);
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(effectOrder).toEqual([]);
  });

  it.each([
    ['cross-paired Guided stable and Independent body IDs', (() => {
      const submission = makeConcavitySubmission('guided_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_13_CONCAVITY_INDEPENDENT_ACTIVITY_ID,
          mode: 'independent_practice' as const,
        },
      };
    })()],
    ['cross-paired Independent stable and Guided body IDs', (() => {
      const submission = makeConcavitySubmission('independent_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_13_CONCAVITY_GUIDED_ACTIVITY_ID,
          mode: 'guided_practice' as const,
        },
      };
    })()],
    ['a Guided identity with Independent mode', (() => {
      const submission = makeConcavitySubmission('guided_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          mode: 'independent_practice' as const,
        },
      };
    })()],
    ['an Independent identity with Guided mode', (() => {
      const submission = makeConcavitySubmission('independent_practice');
      return {
        ...submission,
        submissionData: {
          ...submission.submissionData,
          mode: 'guided_practice' as const,
        },
      };
    })()],
    ['a foreign learner', makeConcavitySubmission('guided_practice', {
      overrides: { userId: 'other-precalc-learner' },
    })],
    ['a different mastery contract', makeConcavitySubmission('guided_practice', {
      overrides: { masteryContractVersion: 'legacy.learning-evidence.v1' },
    })],
    ['a zero attempt ordinal', makeConcavitySubmission('guided_practice', {
      overrides: { attemptOrdinal: 0 },
    })],
    ['a fractional attempt ordinal', makeConcavitySubmission('guided_practice', {
      overrides: { attemptOrdinal: 1.5 },
    })],
    ['an invalid submitted timestamp', makeConcavitySubmission('guided_practice', {
      overrides: { submittedAt: Number.NaN },
    })],
    ['an invalid server score', makeConcavitySubmission('guided_practice', {
      overrides: { score: 2 },
    })],
    ['an invalid server max score', makeConcavitySubmission('guided_practice', {
      overrides: { maxScore: 0 },
    })],
    ['a Worked activity', (() => {
      const submission = makeConcavitySubmission('guided_practice');
      return {
        ...submission,
        stableActivityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
        submissionData: {
          ...submission.submissionData,
          activityId: PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID,
          mode: 'teaching' as const,
        },
      };
    })()],
  ] as const)('rejects %s before Topic 1.3 concavity evidence effects', async (_label, submission) => {
    const {
      effectOrder,
      evidenceStore,
      handler,
      masteryBridge,
      receiptStore,
    } = createHarness({
      submission,
      teacherExposure: makeConcavityTeacherExposure(),
    });

    await expect(handler.process({
      learnerId: LEARNER_ID,
      submissionId: submission.submissionId,
    })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
    expect(masteryBridge).not.toHaveBeenCalled();
    expect(evidenceStore.events).toEqual([
      { learnerId: LEARNER_ID, evidence: makeConcavityTeacherExposure() },
    ]);
    expect(receiptStore.receipts.size).toBe(0);
    expect(effectOrder).toEqual([]);
  });

  describe('Topic 1.4 polynomial degree and leading coefficient evidence', () => {
    it('enables the exact node once without duplicate allow-list entries', () => {
      expect(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.filter(
        (nodeId) => nodeId === PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
      )).toHaveLength(1);
      expect(new Set(PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS).size).toBe(
        PRECALCULUS_LEARNING_EVIDENCE_PILOT_NODE_IDS.length,
      );
    });

    it.each([
      ['Guided', 'guided_practice' as const],
      ['Independent', 'independent_practice' as const],
    ])('maps a trusted %s submission to exact evidence and replays from its receipt', async (_label, mode) => {
      const submission = makePolynomialSubmission(mode);
      const {
        effectOrder,
        evidenceStore,
        handler,
        masteryBridge,
        receiptStore,
      } = createHarness({
        submission,
        teacherExposure: makePolynomialTeacherExposure(),
      });
      const expectedEvidence = {
        contractVersion: 'learning-evidence.v1',
        nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
        activityId: submission.stableActivityId,
        mode,
        attemptOrdinal: 7,
        origin: 'mastery_advantage',
        occurredAt: '2026-08-19T10:00:00.000Z',
        gradedEvidence: { isCorrect: true, score: 6, maxScore: 6 },
        idempotencyKey: `precalc:mastery-advantage:submission:${submission.submissionId}`,
      };

      await expect(handler.process({
        learnerId: LEARNER_ID,
        submissionId: submission.submissionId,
      })).resolves.toEqual({
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
      expect(masteryBridge).toHaveBeenCalledOnce();
      expect(masteryBridge).toHaveBeenCalledWith({
        learnerId: LEARNER_ID,
        submissionId: submission.submissionId,
        evidence: expectedEvidence,
      });
      expect(evidenceStore.events[1]?.evidence).toEqual(expectedEvidence);
      expect(receiptStore.receipts.size).toBe(1);
      expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);

      await expect(handler.process({
        learnerId: LEARNER_ID,
        submissionId: submission.submissionId,
      })).resolves.toEqual({
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
      expect(masteryBridge).toHaveBeenCalledOnce();
      expect(evidenceStore.events).toHaveLength(2);
      expect(receiptStore.receipts.size).toBe(1);
      expect(effectOrder).toEqual(['mastery', 'evidence', 'receipt']);
    });

    it('preserves a trusted partial Guided grade and its false correctness', async () => {
      const submission = makePolynomialSubmission('guided_practice', {
        answers: {
          a_degree: '0',
          a_leading_coefficient: '0',
          b_degree: '0',
          b_leading_coefficient: '0',
        },
      });
      const { evidenceStore, handler, masteryBridge, receiptStore } = createHarness({
        submission,
        teacherExposure: makePolynomialTeacherExposure(),
      });

      await expect(handler.process({
        learnerId: LEARNER_ID,
        submissionId: submission.submissionId,
      })).resolves.toMatchObject({
        persisted: true,
        masteryApplied: true,
        decision: {
          eligible: true,
          reason: 'eligible',
          masteryBearing: true,
        },
      });
      expect(masteryBridge).toHaveBeenCalledOnce();
      expect(evidenceStore.events[1]?.evidence).toEqual(expect.objectContaining({
        nodeId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_NODE_ID,
        activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
        mode: 'guided_practice',
        gradedEvidence: { isCorrect: false, score: 2, maxScore: 6 },
      }));
      expect(receiptStore.receipts.size).toBe(1);
    });

    it('waits for exact Topic 1.4 teacher exposure without effects', async () => {
      const submission = makePolynomialSubmission('guided_practice');
      const {
        effectOrder,
        evidenceStore,
        handler,
        masteryBridge,
        receiptStore,
      } = createHarness({ submission });

      await expect(handler.process({
        learnerId: LEARNER_ID,
        submissionId: submission.submissionId,
      })).resolves.toEqual({
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
      expect(evidenceStore.events).toEqual([
        { learnerId: LEARNER_ID, evidence: makeTeacherExposure() },
      ]);
      expect(masteryBridge).not.toHaveBeenCalled();
      expect(receiptStore.receipts.size).toBe(0);
      expect(effectOrder).toEqual([]);
    });

    it.each([
      ['cross-paired Guided stable and Independent envelope identity', () => {
        const submission = makePolynomialSubmission('guided_practice');
        return {
          ...submission,
          submissionData: {
            ...submission.submissionData,
            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_INDEPENDENT_ACTIVITY_ID,
            mode: 'independent_practice' as const,
          },
        };
      }],
      ['cross-paired Independent stable and Guided envelope identity', () => {
        const submission = makePolynomialSubmission('independent_practice');
        return {
          ...submission,
          submissionData: {
            ...submission.submissionData,
            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_GUIDED_ACTIVITY_ID,
            mode: 'guided_practice' as const,
          },
        };
      }],
      ['Guided identity with Independent mode', () => {
        const submission = makePolynomialSubmission('guided_practice');
        return {
          ...submission,
          submissionData: {
            ...submission.submissionData,
            mode: 'independent_practice' as const,
          },
        };
      }],
      ['Independent identity with Guided mode', () => {
        const submission = makePolynomialSubmission('independent_practice');
        return {
          ...submission,
          submissionData: {
            ...submission.submissionData,
            mode: 'guided_practice' as const,
          },
        };
      }],
      ['foreign learner', () => makePolynomialSubmission('guided_practice', {
        overrides: { userId: 'other-precalc-learner' },
      })],
      ['wrong mastery contract', () => makePolynomialSubmission('guided_practice', {
        overrides: { masteryContractVersion: 'legacy.learning-evidence.v1' },
      })],
      ['zero server attempt ordinal', () => makePolynomialSubmission('guided_practice', {
        overrides: { attemptOrdinal: 0 },
      })],
      ['fractional server attempt ordinal', () => makePolynomialSubmission('guided_practice', {
        overrides: { attemptOrdinal: 1.5 },
      })],
      ['mismatched envelope attempt number', () => {
        const submission = makePolynomialSubmission('guided_practice');
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: 6 },
        };
      }],
      ['zero envelope attempt number', () => {
        const submission = makePolynomialSubmission('guided_practice');
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: 0 },
        };
      }],
      ['fractional envelope attempt number', () => {
        const submission = makePolynomialSubmission('guided_practice');
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: 1.5 },
        };
      }],
      ['missing envelope attempt number', () => {
        const submission = makePolynomialSubmission('guided_practice');
        return {
          ...submission,
          submissionData: { ...submission.submissionData, attemptNumber: undefined },
        };
      }],
      ['invalid envelope submittedAt', () => {
        const submission = makePolynomialSubmission('guided_practice');
        return {
          ...submission,
          submissionData: { ...submission.submissionData, submittedAt: 'not-a-time' },
        };
      }],
      ['mismatched envelope submittedAt', () => {
        const submission = makePolynomialSubmission('guided_practice');
        return {
          ...submission,
          submissionData: { ...submission.submissionData, submittedAt: '2026-08-19T10:01:00.000Z' },
        };
      }],
      ['invalid server submittedAt', () => makePolynomialSubmission('guided_practice', {
        overrides: { submittedAt: Number.NaN },
      })],
      ['invalid server gradedAt', () => makePolynomialSubmission('guided_practice', {
        overrides: { gradedAt: Number.NaN },
      })],
      ['ungraded status', () => {
        const submission = makePolynomialSubmission('guided_practice');
        return {
          ...submission,
          submissionData: { ...submission.submissionData, status: 'submitted' },
        };
      }],
      ['negative server score', () => makePolynomialSubmission('guided_practice', {
        overrides: { score: -1 },
      })],
      ['fractional server score', () => makePolynomialSubmission('guided_practice', {
        overrides: { score: 1.5 },
      })],
      ['above-maximum server score', () => makePolynomialSubmission('guided_practice', {
        overrides: { score: 7 },
      })],
      ['zero server maxScore', () => makePolynomialSubmission('guided_practice', {
        overrides: { maxScore: 0 },
      })],
      ['positive-wrong server maxScore', () => makePolynomialSubmission('guided_practice', {
        overrides: { maxScore: 5 },
      })],
      ['fractional server maxScore', () => makePolynomialSubmission('guided_practice', {
        overrides: { maxScore: 1.5 },
      })],
      ['Worked stable and envelope identity', () => {
        const submission = makePolynomialSubmission('guided_practice');
        return {
          ...submission,
          stableActivityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
          submissionData: {
            ...submission.submissionData,
            activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
            mode: 'worked_example' as const,
          },
        };
      }],
    ] as const)('rejects %s before Topic 1.4 evidence effects', async (_label, makeRejectedSubmission) => {
      const submission = makeRejectedSubmission();
      const {
        effectOrder,
        evidenceStore,
        handler,
        masteryBridge,
        receiptStore,
      } = createHarness({
        submission,
        teacherExposure: makePolynomialTeacherExposure(),
      });

      await expect(handler.process({
        learnerId: LEARNER_ID,
        submissionId: submission.submissionId,
      })).resolves.toEqual({ accepted: false, reason: 'submission_not_found' });
      expect(masteryBridge).not.toHaveBeenCalled();
      expect(evidenceStore.events).toEqual([
        { learnerId: LEARNER_ID, evidence: makePolynomialTeacherExposure() },
      ]);
      expect(receiptStore.receipts.size).toBe(0);
      expect(effectOrder).toEqual([]);
    });

  });
});
