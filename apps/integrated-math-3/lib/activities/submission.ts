import { z } from 'zod';
import { buildPracticeSubmissionEnvelope, practiceModeSchema, practiceSubmissionStatusSchema, type PracticeSubmissionEnvelope, type PracticeTimingSummary } from '@math-platform/practice-core/contract';

export type PracticeMode = z.infer<typeof practiceModeSchema>;
export type PracticeSubmissionStatus = z.infer<typeof practiceSubmissionStatusSchema>;

export interface SubmitActivityInput {
  activityId: string;
  mode: PracticeMode;
  answers: Record<string, unknown>;
  attemptNumber: number;
  status?: PracticeSubmissionStatus;
  /** Preserve the caller's valid practice.v1 timestamp on the envelope. */
  submittedAt?: string;
  parts?: PracticeSubmissionEnvelope['parts'];
  artifact?: Record<string, unknown>;
  interactionHistory?: unknown[];
  analytics?: Record<string, unknown>;
  studentFeedback?: string;
  teacherSummary?: string;
  timing?: PracticeTimingSummary;
  /** Stable opaque key for recovering a create response that was lost. */
  idempotencyKey?: string;
  /** Reuse the server-owned submission after a progression retry. */
  submissionId?: string;
  /** Client-side cache of the original server grade for an opaque retry. */
  knownScore?: number;
  knownMaxScore?: number;
}

export interface SubmitActivityResultSuccess {
  success: true;
  submissionId: string;
  score?: number;
  maxScore?: number;
  idempotencyKey?: string;
}

export interface SubmitActivityResultError {
  success: false;
  error: string;
  /** Preserve the opaque ID so the caller can retry progression. */
  submissionId?: string;
  /** Preserve the create key when the create response was lost. */
  idempotencyKey?: string;
  /** Preserve the original server grade across a progression retry. */
  score?: number;
  maxScore?: number;
}

export type SubmitActivityResult = SubmitActivityResultSuccess | SubmitActivityResultError;

/** Checks one Guided discriminant without exposing the generated answer. */
export async function checkQuadraticFormulaDiscriminant(input: {
  activityId: string;
  rawAnswer: string;
}): Promise<boolean> {
  const response = await fetch('/api/activities/quadratic-formula/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activityId: input.activityId,
      fieldId: 'discriminant',
      rawAnswer: input.rawAnswer,
    }),
  });
  const data: unknown = await response.json();
  if (!response.ok || typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Discriminant check failed');
  }
  const record = data as Record<string, unknown>;
  if (Object.keys(record).length !== 1 || typeof record.isCorrect !== 'boolean') {
    throw new Error('Discriminant check returned an invalid response');
  }
  return record.isCorrect;
}

/** Creates one server-owned submission without applying learning-evidence progression. */
export async function createServerOwnedActivitySubmission(
  input: SubmitActivityInput,
): Promise<SubmitActivityResult> {
  const idempotencyKey = input.idempotencyKey?.trim() || undefined;
  try {
    const envelope = buildPracticeSubmissionEnvelope({
      activityId: input.activityId,
      mode: input.mode,
      status: input.status,
      attemptNumber: input.attemptNumber,
      submittedAt: input.submittedAt,
      answers: input.answers,
      parts: input.parts,
      artifact: input.artifact,
      interactionHistory: input.interactionHistory,
      analytics: input.analytics,
      studentFeedback: input.studentFeedback,
      teacherSummary: input.teacherSummary,
      timing: input.timing,
    });
    const response = await fetch('/api/activities/submissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify(envelope),
    });
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Submission creation failed',
        ...(idempotencyKey ? { idempotencyKey } : {}),
      };
    }
    if (typeof data.submissionId !== 'string' || data.submissionId.trim().length === 0) {
      return {
        success: false,
        error: 'Submission creation did not return a server-owned submission ID',
        ...(idempotencyKey ? { idempotencyKey } : {}),
      };
    }
    return {
      success: true,
      submissionId: data.submissionId,
      ...(data.score === undefined ? {} : { score: data.score }),
      ...(data.maxScore === undefined ? {} : { maxScore: data.maxScore }),
      ...(idempotencyKey ? { idempotencyKey } : {}),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...(idempotencyKey ? { idempotencyKey } : {}),
    };
  }
}

/** Reads one authenticated selected Worked acknowledgement. */
export async function getSelectedWorkedAcknowledgement(activityId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/activities/submissions?activityId=${encodeURIComponent(activityId)}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data?.acknowledged === true;
  } catch {
    return false;
  }
}

/** Submits a practice activity to the server and returns a success or error result. */
export async function submitActivity(input: SubmitActivityInput): Promise<SubmitActivityResult> {
  try {
    const envelope = buildPracticeSubmissionEnvelope({
      activityId: input.activityId,
      mode: input.mode,
      status: input.status,
      attemptNumber: input.attemptNumber,
      submittedAt: input.submittedAt,
      answers: input.answers,
      parts: input.parts,
      artifact: input.artifact,
      interactionHistory: input.interactionHistory,
      analytics: input.analytics,
      studentFeedback: input.studentFeedback,
      teacherSummary: input.teacherSummary,
      timing: input.timing,
    });

    const response = await fetch('/api/activities/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envelope),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Submission failed',
      };
    }

    return {
      success: true,
      submissionId: data.submissionId,
      score: data.score,
      maxScore: data.maxScore,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Creates the pilot submission and delivers only its opaque Convex ID. */
export async function submitIm3PilotActivity(
  input: SubmitActivityInput | {
    submissionId: string;
    knownScore?: number;
    knownMaxScore?: number;
    idempotencyKey?: string;
  },
): Promise<SubmitActivityResult> {
  let ownedSubmissionId = input.submissionId;
  let score = input.knownScore;
  let maxScore = input.knownMaxScore;
  const idempotencyKey = input.idempotencyKey?.trim() || undefined;

  try {
    if (!ownedSubmissionId && 'activityId' in input) {
      const created = await createServerOwnedActivitySubmission(input);
      if (!created.success) return created;
      ownedSubmissionId = created.submissionId;
      score = created.score;
      maxScore = created.maxScore;
    }

    if (typeof ownedSubmissionId !== 'string' || ownedSubmissionId.trim().length === 0) {
      return {
        success: false,
        error: 'Submission progression did not receive a server-owned submission ID',
        score,
        maxScore,
      };
    }

    const progressionResponse = await fetch('/api/learning-evidence/im3-pilot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ submissionId: ownedSubmissionId }),
    });

    const progression = await progressionResponse.json();
    if (!progressionResponse.ok) {
      return {
        success: false,
        error: progression.error || 'Submission progression failed',
        submissionId: ownedSubmissionId,
        score,
        maxScore,
      };
    }

    const decision = progression?.decision;
    if (
      progression?.persisted !== true
      || progression.masteryApplied !== true
      || progression.kstApplied !== true
      || (progression.delivery !== 'new' && progression.delivery !== 'replay')
      || decision?.eligible !== true
      || decision.reason !== 'eligible'
      || decision.masteryBearing !== true
      || decision.exposureState !== 'introduced'
      || (decision.idempotency !== 'new' && decision.idempotency !== 'replay')
    ) {
      return {
        success: false,
        error: 'Submission progression was rejected',
        submissionId: ownedSubmissionId,
        score,
        maxScore,
      };
    }

    return {
      success: true,
      submissionId: ownedSubmissionId,
      score,
      maxScore,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      ...(ownedSubmissionId ? { submissionId: ownedSubmissionId } : {}),
      ...(score === undefined ? {} : { score }),
      ...(maxScore === undefined ? {} : { maxScore }),
      ...(!ownedSubmissionId && idempotencyKey ? { idempotencyKey } : {}),
    };
  }
}
