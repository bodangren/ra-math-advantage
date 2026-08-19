import {
  buildPracticeSubmissionEnvelope,
  evaluateLearningEvidenceV1,
  normalizeLearningEvidenceV1,
  type LearningEvidenceV1,
} from '@math-platform/practice-core';
import {
  InMemorySubmissionSrsAdapter,
  type SrsCardState,
  type SrsReviewLogEntryV31,
} from '@math-platform/srs-engine';

const BM2_PILOT_NODE_ID = 'math.bm2.skill.1.1.apply-accounting-equation';
const BM2_PILOT_LESSON_ID = 'd6b57545-65f6-4c39-80d5-000000000001';
const BM2_PILOT_LESSON_SLUG = 'unit-1-lesson-1';
const BM2_PILOT_ACTIVITY_ID = 'd6b57545-65f6-4c39-80d5-000100001002';
const BM2_PILOT_ACTIVITY_KEY = 'unit-1-lesson-1-activity-1';
const BM2_PILOT_VARIANT_KEY = 'accounting-equation';

/** The only BM2 learning-evidence node enabled by this pilot. */
export const BM2_PILOT_NODE = BM2_PILOT_NODE_ID;

/** The reviewed legacy BM2 SRS identifier for the pilot variant. */
export const BM2_PILOT_PROBLEM_FAMILY_ID = BM2_PILOT_VARIANT_KEY;

/**
 * Convert the BM2 storage identifier to the canonical SRS identifier.
 *
 * BM2 storage keeps `problemFamilyId` for compatibility. The conversion is
 * deliberately limited to the reviewed pilot mapping.
 */
export function bm2ProblemFamilyIdToVariantKey(problemFamilyId: string): string {
  if (problemFamilyId.trim() !== BM2_PILOT_PROBLEM_FAMILY_ID) {
    throw new Error(`Unsupported BM2 problemFamilyId: ${problemFamilyId}`);
  }
  return BM2_PILOT_VARIANT_KEY;
}

/** Convert the canonical pilot variant back to BM2's legacy storage field. */
export function bm2VariantKeyToProblemFamilyId(variantKey: string): string {
  if (variantKey.trim() !== BM2_PILOT_VARIANT_KEY) {
    throw new Error(`Unsupported BM2 variantKey: ${variantKey}`);
  }
  return BM2_PILOT_PROBLEM_FAMILY_ID;
}

/** Validate that the runtime manifest is exactly the reviewed one-node pilot. */
export function validateBm2LearningEvidencePilotManifest(): void {
  const [mapping] = BM2_LEARNING_EVIDENCE_PILOT.mappings;
  if (
    BM2_LEARNING_EVIDENCE_PILOT.enabledNodeIds.length !== 1
    || BM2_LEARNING_EVIDENCE_PILOT.enabledNodeIds[0] !== BM2_PILOT_NODE_ID
    || mapping === undefined
    || mapping.nodeId !== BM2_PILOT_NODE_ID
    || mapping.masteryAdvantage.variantKey !== BM2_PILOT_VARIANT_KEY
    || mapping.masteryAdvantage.problemFamilyId !== BM2_PILOT_PROBLEM_FAMILY_ID
  ) {
    throw new Error('BM2 learning-evidence pilot manifest is invalid.');
  }
}

export const BM2_LEARNING_EVIDENCE_PILOT = {
  enabledNodeIds: [BM2_PILOT_NODE_ID],
  mappings: [
    {
      nodeId: BM2_PILOT_NODE_ID,
      source: {
        lessonId: BM2_PILOT_LESSON_ID,
        lessonSlug: BM2_PILOT_LESSON_SLUG,
        activityId: BM2_PILOT_ACTIVITY_ID,
        activityKey: BM2_PILOT_ACTIVITY_KEY,
        mode: 'guided_practice',
      },
      masteryAdvantage: {
        activityId: BM2_PILOT_VARIANT_KEY,
        problemFamilyId: BM2_PILOT_VARIANT_KEY,
        variantKey: BM2_PILOT_VARIANT_KEY,
      },
    },
  ],
} as const;

type LearningEvidenceDecision = ReturnType<typeof evaluateLearningEvidenceV1>;

type ProcessInput = {
  learnerId: string;
  evidence: LearningEvidenceV1;
};

export type Bm2MasteryObservation = {
  nodeId: string;
  variantKey: string;
  activityId: string;
  attemptOrdinal: number;
  occurredAt: string;
  idempotencyKey: string;
  gradedEvidence: NonNullable<LearningEvidenceV1['gradedEvidence']>;
};

export type Bm2SrsRating = {
  nodeId: string;
  variantKey: string;
  cardId: string;
  reviewId: string;
  rating: SrsReviewLogEntryV31['rating'];
  reviewedAt: string;
};

export type Bm2SrsSchedule = {
  nodeId: string;
  variantKey: string;
  cardId: string;
  dueDate: string;
  scheduledDays: number;
  state: SrsCardState['state'];
};

export type Bm2LearningEvidenceSnapshot = {
  acceptedEvidence: readonly LearningEvidenceV1[];
  introduced: boolean;
  masteryObservations: readonly Bm2MasteryObservation[];
  masteryAttemptCount: number;
  srsCards: readonly SrsCardState[];
  srsRatings: readonly Bm2SrsRating[];
  srsSchedules: readonly Bm2SrsSchedule[];
};

export type Bm2LearningEvidenceProcessResult = {
  persisted: boolean;
  masteryApplied: boolean;
  decision: LearningEvidenceDecision;
};

type StoredEvidence = {
  learnerId: string;
  evidence: LearningEvidenceV1;
};

type StoredMasteryObservation = Bm2MasteryObservation & {
  learnerId: string;
};

type StoredSrsRating = Bm2SrsRating & {
  learnerId: string;
};

type StoredSrsSchedule = Bm2SrsSchedule & {
  learnerId: string;
};

/**
 * Creates the BM2 one-node learning-evidence runtime used by the pilot.
 *
 * The runtime owns only BM2 evidence persistence and the pilot boundary. It
 * sends eligible Mastery Advantage submissions to the shared SRS adapter.
 */
export function createBm2LearningEvidenceRuntime() {
  const srsAdapter = new InMemorySubmissionSrsAdapter();
  const masteryMapping = BM2_LEARNING_EVIDENCE_PILOT.mappings[0].masteryAdvantage;

  srsAdapter.getResolver().register(masteryMapping.activityId, {
    variantKey: masteryMapping.variantKey,
    objectiveId: BM2_PILOT_NODE_ID,
  });

  const acceptedEvidence: StoredEvidence[] = [];
  const masteryObservations: StoredMasteryObservation[] = [];
  const srsRatings: StoredSrsRating[] = [];
  const srsSchedules: StoredSrsSchedule[] = [];
  const inFlight = new Map<string, Promise<Bm2LearningEvidenceProcessResult>>();

  const processInternal = async ({ learnerId, evidence }: ProcessInput): Promise<Bm2LearningEvidenceProcessResult> => {
      const normalizedEvidence = normalizeLearningEvidenceV1(evidence);
      const learnerEvidence = acceptedEvidence
        .filter((entry) => entry.learnerId === learnerId)
        .map((entry) => entry.evidence);
      const decision = evaluateLearningEvidenceV1({
        evidence: normalizedEvidence,
        acceptedEvidence: learnerEvidence,
        enabledNodeIds: BM2_LEARNING_EVIDENCE_PILOT.enabledNodeIds,
      });

      if (decision.idempotency !== 'new') {
        return {
          persisted: false,
          masteryApplied: false,
          decision,
        };
      }

      if (decision.exposureState !== 'introduced') {
        return {
          persisted: false,
          masteryApplied: false,
          decision,
        };
      }

      if (decision.masteryBearing) {
        const gradedEvidence = normalizedEvidence.gradedEvidence;
        if (!gradedEvidence) {
          throw new Error('Mastery-bearing BM2 evidence must include graded evidence.');
        }

        const submission = buildMasterySubmission(normalizedEvidence, masteryMapping.activityId);
        const result = await srsAdapter.processSubmission({
          studentId: learnerId,
          activityId: masteryMapping.activityId,
          submission,
        });

        if (!result.ok || result.skipped) {
          throw new Error('The BM2 pilot could not forward eligible evidence to the shared SRS adapter.');
        }

        const card = result.card;
        acceptedEvidence.push({ learnerId, evidence: normalizedEvidence });
        masteryObservations.push({
          learnerId,
          nodeId: normalizedEvidence.nodeId,
          variantKey: masteryMapping.variantKey,
          activityId: masteryMapping.activityId,
          attemptOrdinal: normalizedEvidence.attemptOrdinal,
          occurredAt: normalizedEvidence.occurredAt,
          idempotencyKey: normalizedEvidence.idempotencyKey,
          gradedEvidence,
        });
        srsRatings.push({
          learnerId,
          nodeId: normalizedEvidence.nodeId,
          variantKey: card.variantKey,
          cardId: card.cardId,
          reviewId: result.reviewLog.reviewId,
          rating: result.reviewLog.rating,
          reviewedAt: result.reviewLog.reviewedAt,
        });
        srsSchedules.push({
          learnerId,
          nodeId: normalizedEvidence.nodeId,
          variantKey: card.variantKey,
          cardId: card.cardId,
          dueDate: card.dueDate,
          scheduledDays: card.scheduledDays,
          state: card.state,
        });

        return {
          persisted: true,
          masteryApplied: true,
          decision,
        };
      }

      acceptedEvidence.push({ learnerId, evidence: normalizedEvidence });
      return {
        persisted: true,
        masteryApplied: false,
        decision,
      };
  };

  const process = async (input: ProcessInput): Promise<Bm2LearningEvidenceProcessResult> => {
    const normalizedEvidence = normalizeLearningEvidenceV1(input.evidence);
    const key = `${input.learnerId}\u0000${normalizedEvidence.idempotencyKey}`;
    const previous = inFlight.get(key);
    const operation = (previous ?? Promise.resolve()).then(() => processInternal({
      ...input,
      evidence: normalizedEvidence,
    }));
    inFlight.set(key, operation);

    try {
      return await operation;
    } finally {
      if (inFlight.get(key) === operation) inFlight.delete(key);
    }
  };

  return {
    process,

    async snapshot({ learnerId, nodeId }: { learnerId: string; nodeId: string }): Promise<Bm2LearningEvidenceSnapshot> {
      const evidenceForNode = acceptedEvidence
        .filter((entry) => entry.learnerId === learnerId && entry.evidence.nodeId === nodeId)
        .map((entry) => entry.evidence);
      const cards = (await srsAdapter.getCardStore().getCardsByStudent(learnerId))
        .filter((card) => card.objectiveId === nodeId);

      return {
        acceptedEvidence: evidenceForNode,
        introduced: evidenceForNode.some((evidence) => evidence.origin === 'teacher_led'),
        masteryObservations: masteryObservations
          .filter((entry) => entry.learnerId === learnerId && entry.nodeId === nodeId),
        masteryAttemptCount: masteryObservations
          .filter((entry) => entry.learnerId === learnerId && entry.nodeId === nodeId)
          .length,
        srsCards: cards,
        srsRatings: srsRatings
          .filter((entry) => entry.learnerId === learnerId && entry.nodeId === nodeId),
        srsSchedules: srsSchedules
          .filter((entry) => entry.learnerId === learnerId && entry.nodeId === nodeId),
      };
    },

    enabledNodeIds(): readonly string[] {
      return [...BM2_LEARNING_EVIDENCE_PILOT.enabledNodeIds];
    },
  };
}

function buildMasterySubmission(
  evidence: LearningEvidenceV1,
  activityId: string,
) {
  const gradedEvidence = evidence.gradedEvidence;
  if (!gradedEvidence) {
    throw new Error('Mastery-bearing BM2 evidence must include graded evidence.');
  }

  return buildPracticeSubmissionEnvelope({
    activityId,
    mode: evidence.mode,
    attemptNumber: evidence.attemptOrdinal,
    submittedAt: evidence.occurredAt,
    answers: { learningEvidence: gradedEvidence },
    parts: [{
      partId: 'learning-evidence',
      rawAnswer: gradedEvidence,
      isCorrect: gradedEvidence.isCorrect,
      score: gradedEvidence.score,
      maxScore: gradedEvidence.maxScore,
    }],
  });
}
