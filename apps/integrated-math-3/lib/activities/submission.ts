import { z } from 'zod';
import { buildPracticeSubmissionEnvelope, practiceModeSchema, practiceSubmissionStatusSchema, type PracticeSubmissionEnvelope, type PracticeTimingSummary } from '@/lib/practice/contract';

export type PracticeMode = z.infer<typeof practiceModeSchema>;
export type PracticeSubmissionStatus = z.infer<typeof practiceSubmissionStatusSchema>;

export interface SubmitActivityInput {
  activityId: string;
  mode: PracticeMode;
  answers: Record<string, unknown>;
  attemptNumber: number;
  status?: PracticeSubmissionStatus;
  parts?: PracticeSubmissionEnvelope['parts'];
  artifact?: Record<string, unknown>;
  interactionHistory?: unknown[];
  analytics?: Record<string, unknown>;
  studentFeedback?: string;
  teacherSummary?: string;
  timing?: PracticeTimingSummary;
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

export async function submitActivity(input: SubmitActivityInput): Promise<SubmitActivityResult> {
  try {
    const envelope = buildPracticeSubmissionEnvelope({
      activityId: input.activityId,
      mode: input.mode,
      status: input.status,
      attemptNumber: input.attemptNumber,
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
