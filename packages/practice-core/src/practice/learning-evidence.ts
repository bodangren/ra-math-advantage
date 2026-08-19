import { z } from 'zod';

import { PRACTICE_MODE_VALUES } from './contract';

/** The versioned learning-evidence contract identifier. */
export const LEARNING_EVIDENCE_CONTRACT_VERSION = 'learning-evidence.v1' as const;

/** The origins that can produce learning evidence. */
export const LEARNING_EVIDENCE_ORIGIN_VALUES = [
  'teacher_led',
  'mastery_advantage',
] as const;

const utcTimestampPattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/;

function canonicalUtcTimestamp(value: string): string | null {
  const match = utcTimestampPattern.exec(value);
  if (match === null) return null;

  const [, year, month, day, hour, minute, second, fraction] = match;
  const milliseconds = (fraction ?? '').padEnd(3, '0');
  const canonicalInput = `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}Z`;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;

  const canonical = new Date(timestamp).toISOString();
  return canonical === canonicalInput ? canonical : null;
}

const nonBlankStringSchema = z.string().trim().min(1);

const occurredAtSchema = z.string().refine(
  (value) => canonicalUtcTimestamp(value) !== null,
  'occurredAt must be a valid ISO-8601 UTC timestamp ending in Z',
);

const safeNumberSchema = z.number().refine(
  Number.isFinite,
  'value must be finite',
);

const attemptOrdinalSchema = safeNumberSchema
  .int()
  .positive()
  .refine(Number.isSafeInteger, 'attemptOrdinal must be a safe integer');

const gradedEvidenceSchema = z
  .object({
    isCorrect: z.boolean().optional(),
    score: safeNumberSchema.optional(),
    maxScore: safeNumberSchema.optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      value.isCorrect === undefined
      && value.score === undefined
      && value.maxScore === undefined
    ) {
      context.addIssue({
        code: 'custom',
        message: 'gradedEvidence must contain at least one outcome',
      });
    }

    const score = value.score;
    const maxScore = value.maxScore;
    const hasScore = score !== undefined;
    const hasMaxScore = maxScore !== undefined;
    if (hasScore !== hasMaxScore) {
      context.addIssue({
        code: 'custom',
        message: 'score and maxScore must be provided together',
        path: [hasScore ? 'maxScore' : 'score'],
      });
    }

    if (hasScore && hasMaxScore) {
      if (score < 0) {
        context.addIssue({
          code: 'custom',
          message: 'score must be non-negative',
          path: ['score'],
        });
      }
      if (maxScore < 0) {
        context.addIssue({
          code: 'custom',
          message: 'maxScore must be non-negative',
          path: ['maxScore'],
        });
      }
      if (score > maxScore) {
        context.addIssue({
          code: 'custom',
          message: 'score cannot exceed maxScore',
          path: ['score'],
        });
      }
    }
  });

/** Strict schema for the domain-neutral learning-evidence.v1 envelope. */
export const learningEvidenceV1Schema = z
  .object({
    contractVersion: z.literal(LEARNING_EVIDENCE_CONTRACT_VERSION),
    nodeId: nonBlankStringSchema,
    activityId: nonBlankStringSchema,
    attemptOrdinal: attemptOrdinalSchema,
    origin: z.enum(LEARNING_EVIDENCE_ORIGIN_VALUES),
    mode: z.enum(PRACTICE_MODE_VALUES),
    occurredAt: occurredAtSchema,
    gradedEvidence: gradedEvidenceSchema.optional(),
    idempotencyKey: nonBlankStringSchema,
  })
  .strict();

/** A validated learning-evidence.v1 record. */
export type LearningEvidenceV1 = z.infer<typeof learningEvidenceV1Schema>;

/** The idempotency result for a candidate evidence record. */
export type LearningEvidenceIdempotencyV1 = 'new' | 'replay' | 'conflict';

/** The exposure state used by the teacher-first policy. */
export type LearningEvidenceExposureStateV1 =
  | 'awaiting_teacher_exposure'
  | 'introduced';

/** Deterministic reasons returned by the learning-evidence policy. */
export type LearningEvidenceDecisionReasonV1 =
  | 'node_not_enabled'
  | 'idempotency_conflict'
  | 'teacher_led'
  | 'awaiting_teacher_exposure'
  | 'ungraded_evidence'
  | 'eligible';

/** The pure policy result consumed by app persistence adapters. */
export interface LearningEvidenceDecisionV1 {
  readonly idempotency: LearningEvidenceIdempotencyV1;
  readonly exposureState: LearningEvidenceExposureStateV1;
  readonly eligible: boolean;
  readonly reason: LearningEvidenceDecisionReasonV1;
  readonly masteryBearing: boolean;
}

/** Inputs for the pure learning-evidence.v1 policy evaluator. */
export interface EvaluateLearningEvidenceV1Input {
  readonly evidence: LearningEvidenceV1;
  readonly acceptedEvidence: readonly LearningEvidenceV1[];
  readonly enabledNodeIds?: readonly string[];
}

function normalizeGradedEvidence(
  gradedEvidence: LearningEvidenceV1['gradedEvidence'],
): LearningEvidenceV1['gradedEvidence'] {
  if (gradedEvidence === undefined) return undefined;

  return {
    ...(gradedEvidence.isCorrect === undefined
      ? {}
      : { isCorrect: gradedEvidence.isCorrect }),
    ...(gradedEvidence.score === undefined
      ? {}
      : { score: gradedEvidence.score }),
    ...(gradedEvidence.maxScore === undefined
      ? {}
      : { maxScore: gradedEvidence.maxScore }),
  };
}

/**
 * Parses and canonicalizes a learning-evidence.v1 record.
 *
 * IDs and opaque keys lose surrounding whitespace. UTC timestamps use the
 * canonical millisecond form returned by `Date.toISOString()`.
 */
export function normalizeLearningEvidenceV1(
  input: LearningEvidenceV1,
): LearningEvidenceV1 {
  const parsed = learningEvidenceV1Schema.parse(input);
  const occurredAt = canonicalUtcTimestamp(parsed.occurredAt);
  if (occurredAt === null) {
    throw new Error('occurredAt must be a valid ISO-8601 UTC timestamp ending in Z');
  }
  const gradedEvidence = normalizeGradedEvidence(parsed.gradedEvidence);

  return {
    contractVersion: parsed.contractVersion,
    nodeId: parsed.nodeId.trim(),
    activityId: parsed.activityId.trim(),
    attemptOrdinal: parsed.attemptOrdinal,
    origin: parsed.origin,
    mode: parsed.mode,
    occurredAt,
    ...(gradedEvidence === undefined
      ? {}
      : { gradedEvidence }),
    idempotencyKey: parsed.idempotencyKey.trim(),
  };
}

/**
 * Returns a deterministic payload fingerprint for idempotency comparisons.
 * The result is a redacted contract representation and contains no learner
 * answer data because that data is not part of learning-evidence.v1.
 */
export function learningEvidenceFingerprintV1(
  input: LearningEvidenceV1,
): string {
  const evidence = normalizeLearningEvidenceV1(input);
  const gradedEvidence = evidence.gradedEvidence;

  return JSON.stringify({
    contractVersion: evidence.contractVersion,
    nodeId: evidence.nodeId,
    activityId: evidence.activityId,
    attemptOrdinal: evidence.attemptOrdinal,
    origin: evidence.origin,
    mode: evidence.mode,
    occurredAt: evidence.occurredAt,
    gradedEvidence: gradedEvidence === undefined
      ? null
      : {
          ...(gradedEvidence.isCorrect === undefined
            ? {}
            : { isCorrect: gradedEvidence.isCorrect }),
          ...(gradedEvidence.score === undefined
            ? {}
            : { score: gradedEvidence.score }),
          ...(gradedEvidence.maxScore === undefined
            ? {}
            : { maxScore: gradedEvidence.maxScore }),
        },
    idempotencyKey: evidence.idempotencyKey,
  });
}

function getIdempotency(
  evidence: LearningEvidenceV1,
  acceptedEvidence: readonly LearningEvidenceV1[],
): LearningEvidenceIdempotencyV1 {
  const matching = acceptedEvidence.filter(
    (accepted) => accepted.idempotencyKey === evidence.idempotencyKey,
  );
  if (matching.length === 0) return 'new';

  const fingerprint = learningEvidenceFingerprintV1(evidence);
  return matching.every(
    (accepted) => learningEvidenceFingerprintV1(accepted) === fingerprint,
  )
    ? 'replay'
    : 'conflict';
}

function hasTeacherExposureAtOrBefore(
  evidence: LearningEvidenceV1,
  acceptedEvidence: readonly LearningEvidenceV1[],
): boolean {
  if (evidence.origin === 'teacher_led') return true;

  const occurredAt = Date.parse(evidence.occurredAt);
  return acceptedEvidence.some(
    (accepted) => accepted.origin === 'teacher_led'
      && accepted.nodeId === evidence.nodeId
      && Date.parse(accepted.occurredAt) <= occurredAt,
  );
}

function decision(
  idempotency: LearningEvidenceIdempotencyV1,
  exposureState: LearningEvidenceExposureStateV1,
  reason: LearningEvidenceDecisionReasonV1,
  eligible: boolean,
): LearningEvidenceDecisionV1 {
  return {
    idempotency,
    exposureState,
    eligible,
    reason,
    masteryBearing: eligible,
  };
}

/**
 * Evaluates teacher-first exposure and Mastery Advantage eligibility.
 *
 * Teacher-led evidence always introduces only. Only graded Mastery Advantage
 * evidence with accepted teacher exposure at or before its event time is
 * eligible to enter a mastery bridge.
 */
export function evaluateLearningEvidenceV1({
  evidence: rawEvidence,
  acceptedEvidence: rawAcceptedEvidence,
  enabledNodeIds,
}: EvaluateLearningEvidenceV1Input): LearningEvidenceDecisionV1 {
  const evidence = normalizeLearningEvidenceV1(rawEvidence);
  const acceptedEvidence = rawAcceptedEvidence.map(normalizeLearningEvidenceV1);
  const idempotency = getIdempotency(evidence, acceptedEvidence);

  if (
    enabledNodeIds !== undefined
    && !enabledNodeIds.some((nodeId) => nodeId.trim() === evidence.nodeId)
  ) {
    return decision(
      idempotency,
      'awaiting_teacher_exposure',
      'node_not_enabled',
      false,
    );
  }

  const introduced = hasTeacherExposureAtOrBefore(evidence, acceptedEvidence);
  const exposureState: LearningEvidenceExposureStateV1 = introduced
    ? 'introduced'
    : 'awaiting_teacher_exposure';

  if (idempotency === 'conflict') {
    return decision(
      idempotency,
      exposureState,
      'idempotency_conflict',
      false,
    );
  }

  if (!introduced) {
    return decision(
      idempotency,
      exposureState,
      'awaiting_teacher_exposure',
      false,
    );
  }

  if (evidence.origin === 'teacher_led') {
    return decision(idempotency, exposureState, 'teacher_led', false);
  }

  if (evidence.gradedEvidence === undefined) {
    return decision(idempotency, exposureState, 'ungraded_evidence', false);
  }

  return decision(idempotency, exposureState, 'eligible', true);
}
