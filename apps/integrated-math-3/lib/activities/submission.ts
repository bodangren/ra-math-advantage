import { z } from 'zod';
import { buildPracticeSubmissionEnvelope, practiceModeSchema, practiceSubmissionStatusSchema, type PracticeSubmissionEnvelope, type PracticeTimingSummary } from '@math-platform/practice-core/contract';

export type PracticeMode = z.infer<typeof practiceModeSchema>;
export type PracticeSubmissionStatus = z.infer<typeof practiceSubmissionStatusSchema>;
export type QuadraticFormulaMode = 'guided_practice' | 'independent_practice';
const answerSchema = z.union([z.string(), z.number().finite()]);
const fieldHelpSchema = z.object({ discriminant: z.string().min(1), x1: z.string().min(1), x2: z.string().min(1) }).strict();
const propsSchema = z.union([
  z.object({ prompt: z.string().min(1), equation: z.string().min(1), presentationMode: z.literal('guided'), fieldHelp: fieldHelpSchema }).strict(),
  z.object({ prompt: z.string().min(1), equation: z.string().min(1), presentationMode: z.literal('independent') }).strict(),
]);
const partSchema = z.object({ partId: z.enum(['discriminant', 'x1', 'x2']), rawAnswer: answerSchema, isCorrect: z.boolean(), score: z.number().finite().nonnegative(), maxScore: z.number().finite().nonnegative() }).strict()
  .refine(part => part.score <= part.maxScore);
const pendingAttemptSchema = z.object({ state: z.literal('pending'), pendingSubmissionId: z.string().min(1), activityId: z.string().min(1), mode: z.enum(['guided_practice', 'independent_practice']), attemptOrdinal: z.number().int().positive().safe(), idempotencyKey: z.string().min(1), props: propsSchema }).strict();
const finalAttemptSchema = z.object({ state: z.literal('final'), activityId: z.string().min(1), mode: z.enum(['guided_practice', 'independent_practice']), attemptOrdinal: z.number().int().positive().safe(), props: propsSchema, submissionId: z.string().min(1), score: z.number().finite().nonnegative(), maxScore: z.number().finite().positive(), answers: z.object({ discriminant: answerSchema, x1: answerSchema, x2: answerSchema }).strict(), parts: z.array(partSchema).length(3) }).strict().superRefine((value, ctx) => {
  const score = value.parts.reduce((sum, part) => sum + part.score, 0);
  const maxScore = value.parts.reduce((sum, part) => sum + part.maxScore, 0);
  const coherent = value.parts.every(part => Object.is(part.rawAnswer, value.answers[part.partId]));
  if (value.score > value.maxScore || value.score !== score || value.maxScore !== maxScore || !coherent || new Set(value.parts.map(part => part.partId)).size !== 3) ctx.addIssue({ code: 'custom', message: 'Invalid final score or parts' });
});
export type QuadraticFormulaPendingAttempt = z.infer<typeof pendingAttemptSchema>;
export type QuadraticFormulaFinalAttempt = z.infer<typeof finalAttemptSchema>;
export type QuadraticFormulaAttempt = { state: 'no_attempt' } | { state: 'exhausted' } | { state: 'unavailable' } | QuadraticFormulaPendingAttempt | QuadraticFormulaFinalAttempt;

async function requestQuadraticFormulaAttempt(activityId: string, mode: QuadraticFormulaMode, method: 'GET' | 'POST'): Promise<QuadraticFormulaAttempt> {
  try {
    const response = await fetch(`/api/activities/quadratic-formula/attempt?activityId=${encodeURIComponent(activityId)}&mode=${mode}`, { method });
    if (!response.ok) return { state: 'unavailable' };
    const data: unknown = await response.json();
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const record = data as Record<string, unknown>;
      if (record.state === 'no_attempt' && method === 'GET' && Object.keys(record).length === 1) return { state: 'no_attempt' };
      if (record.state === 'exhausted' && method === 'POST' && Object.keys(record).length === 1) return { state: 'exhausted' };
    }
    const parsed = (method === 'GET' ? z.union([pendingAttemptSchema, finalAttemptSchema]) : pendingAttemptSchema).safeParse(data);
    if (!parsed.success || parsed.data.activityId !== activityId || parsed.data.mode !== mode) return { state: 'unavailable' };
    if (parsed.data.props.presentationMode !== (mode === 'guided_practice' ? 'guided' : 'independent')) return { state: 'unavailable' };
    if (parsed.data.state === 'pending' && parsed.data.idempotencyKey !== `qf:${parsed.data.pendingSubmissionId}`) return { state: 'unavailable' };
    return parsed.data;
  } catch { return { state: 'unavailable' }; }
}
export const getQuadraticFormulaAttempt = (activityId: string, mode: QuadraticFormulaMode) => requestQuadraticFormulaAttempt(activityId, mode, 'GET');
export const startQuadraticFormulaAttempt = (activityId: string, mode: QuadraticFormulaMode) => requestQuadraticFormulaAttempt(activityId, mode, 'POST');

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
  /** Server-owned pending row for one allocated Quadratic Formula attempt. */
  pendingSubmissionId?: string;
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

const lesson16QuizReceiptSchema = z.object({
  submissionId: z.string().min(1),
  score: z.number().int().min(0).max(2),
  maxScore: z.literal(2),
  answers: z.object({
    'discriminant-purpose': z.string(),
    'zero-discriminant-real-solution-count': z.string(),
  }).strict(),
}).strict();
export type Lesson16QuizReceipt = z.infer<typeof lesson16QuizReceiptSchema>;

/** Reads the newest authoritative Lesson 1.6 quiz receipt. */
export async function getLesson16QuizReceipt(activityId: string): Promise<Lesson16QuizReceipt | null> {
  try {
    const response = await fetch(`/api/activities/submissions?activityId=${encodeURIComponent(activityId)}&receipt=lesson-1-6-quiz`);
    if (!response.ok) return null;
    const parsed = lesson16QuizReceiptSchema.safeParse(await response.json());
    return parsed.success ? parsed.data : null;
  } catch { return null; }
}

export function isLesson16QuizSubmitReceipt(value: unknown): value is Pick<Lesson16QuizReceipt, 'submissionId' | 'score' | 'maxScore'> {
  return z.object({ submissionId: z.string().min(1), score: z.number().int().min(0).max(2), maxScore: z.literal(2) }).strict().safeParse(value).success;
}

/** Checks one Guided discriminant without exposing the generated answer. */
export async function checkQuadraticFormulaDiscriminant(input: {
  activityId: string;
  pendingSubmissionId: string;
  rawAnswer: string;
}): Promise<boolean> {
  if (!input.pendingSubmissionId?.trim()) throw new Error('Discriminant check requires a pending attempt');
  const response = await fetch('/api/activities/quadratic-formula/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      activityId: input.activityId,
      fieldId: 'discriminant',
      rawAnswer: input.rawAnswer,
      pendingSubmissionId: input.pendingSubmissionId,
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
        ...(input.pendingSubmissionId ? { 'X-Pending-Submission-Id': input.pendingSubmissionId } : {}),
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
    const lesson16Quiz = Object.keys(input.answers).sort().join('|') === 'discriminant-purpose|zero-discriminant-real-solution-count';
    if (lesson16Quiz && !isLesson16QuizSubmitReceipt(data)) {
      return { success: false, error: 'Submission creation returned an invalid quiz receipt', ...(idempotencyKey ? { idempotencyKey } : {}) };
    }
    if (input.pendingSubmissionId && data.submissionId !== input.pendingSubmissionId) {
      return { success: false, error: 'Submission receipt does not match the pending attempt', ...(idempotencyKey ? { idempotencyKey } : {}) };
    }
    if (input.pendingSubmissionId && (
      Object.keys(data).sort().join('|') !== 'maxScore|score|submissionId'
      || typeof data.score !== 'number' || !Number.isFinite(data.score) || data.score < 0
      || typeof data.maxScore !== 'number' || !Number.isFinite(data.maxScore) || data.maxScore <= 0
      || data.score > data.maxScore
    )) {
      return { success: false, error: 'Submission creation returned an invalid allocated receipt', ...(idempotencyKey ? { idempotencyKey } : {}) };
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
