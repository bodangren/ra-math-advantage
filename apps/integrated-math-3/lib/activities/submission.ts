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
  submittedAt?: string;
  parts?: PracticeSubmissionEnvelope['parts'];
  artifact?: Record<string, unknown>;
  interactionHistory?: unknown[];
  analytics?: Record<string, unknown>;
  studentFeedback?: string;
  teacherSummary?: string;
  timing?: PracticeTimingSummary;
  idempotencyKey?: string;
}

export interface SubmitActivityResultSuccess {
  success: true;
  submissionId: string;
  score?: number;
  maxScore?: number;
}

export interface SubmitActivityResultError {
  success: false;
  error: string;
}

export type SubmitActivityResult = SubmitActivityResultSuccess | SubmitActivityResultError;

/** Creates one server-owned submission without learning-evidence progression. */
export async function createServerOwnedActivitySubmission(
  input: SubmitActivityInput,
): Promise<SubmitActivityResult> {
  const idempotencyKey = input.idempotencyKey?.trim();
  try {
    const envelope = buildPracticeSubmissionEnvelope({
      activityId: input.activityId,
      mode: input.mode,
      status: input.status,
      attemptNumber: input.attemptNumber,
      submittedAt: input.submittedAt,
      answers: input.answers,
      parts: input.parts,
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
    if (!response.ok || typeof data.submissionId !== 'string') {
      return { success: false, error: data.error || 'Submission creation failed' };
    }
    return { success: true, submissionId: data.submissionId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
