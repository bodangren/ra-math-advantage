import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type StudentClaims = {
  sub: string;
  role: string;
};

const ANSWER_IDS = [
  'relative_minimum_x',
  'relative_maximum_x',
  'absolute_minimum_x',
] as const;
type AnswerId = (typeof ANSWER_IDS)[number];
type RawAnswers = Record<AnswerId, string>;
type RawPart = { partId: AnswerId; rawAnswer: string };

type WorkedSubmissionData = {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: RawAnswers;
  parts: [RawPart, RawPart, RawPart];
};

type WorkedSubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

type TeacherLedEvidenceResult = {
  persisted: boolean;
  masteryApplied: false;
  kstApplied: false;
  delivery: 'new' | 'replay';
  decision: {
    idempotency: 'new' | 'replay';
    exposureState: 'introduced';
    eligible: false;
    reason: 'teacher_led';
    masteryBearing: false;
  };
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string): boolean {
  return Object.keys(value).sort().join('|') === keys;
}

function parseIdempotencyKey(request: Request): string | null {
  const key = request.headers.get('Idempotency-Key')?.trim() ?? '';
  return key.length > 0 ? key : null;
}

function parseWorkedSubmissionData(value: unknown): WorkedSubmissionData | null {
  if (!isRecord(value) || !hasExactKeys(value, 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt')) {
    return null;
  }
  if (
    value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID
    || value.mode !== 'worked_example'
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) {
    return null;
  }

  const answers = value.answers;
  if (
    !isRecord(answers)
    || !hasExactKeys(answers, 'absolute_minimum_x|relative_maximum_x|relative_minimum_x')
    || !ANSWER_IDS.every((answerId) => typeof answers[answerId] === 'string')
  ) {
    return null;
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== ANSWER_IDS.length) return null;
  if (ANSWER_IDS.some((partId, index) => {
    const part = parts[index];
    return (
      !isRecord(part)
      || !hasExactKeys(part, 'partId|rawAnswer')
      || part.partId !== partId
      || typeof part.rawAnswer !== 'string'
      || part.rawAnswer !== answers[partId]
    );
  })) return null;

  return value as unknown as WorkedSubmissionData;
}

function validateWorkedSubmissionResult(value: unknown): WorkedSubmissionResult {
  if (
    !isRecord(value)
    || !hasExactKeys(value, 'attemptOrdinal|submissionId|submittedAt')
    || typeof value.submissionId !== 'string'
    || value.submissionId.trim().length === 0
    || typeof value.attemptOrdinal !== 'number'
    || !Number.isInteger(value.attemptOrdinal)
    || value.attemptOrdinal < 1
    || typeof value.submittedAt !== 'string'
    || !Number.isFinite(Date.parse(value.submittedAt))
    || new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) {
    throw new Error('Invalid server Topic 1.4 extrema Worked submission result');
  }
  return value as unknown as WorkedSubmissionResult;
}

function validateTeacherLedEvidenceResult(value: unknown): TeacherLedEvidenceResult {
  if (!isRecord(value) || !hasExactKeys(value, 'decision|delivery|kstApplied|masteryApplied|persisted')) {
    throw new Error('Invalid server Topic 1.4 extrema Worked evidence result');
  }
  const decision = value.decision;
  if (
    typeof value.persisted !== 'boolean'
    || value.masteryApplied !== false
    || value.kstApplied !== false
    || (value.delivery !== 'new' && value.delivery !== 'replay')
    || !isRecord(decision)
    || !hasExactKeys(decision, 'eligible|exposureState|idempotency|masteryBearing|reason')
    || (decision.idempotency !== 'new' && decision.idempotency !== 'replay')
    || decision.exposureState !== 'introduced'
    || decision.eligible !== false
    || decision.reason !== 'teacher_led'
    || decision.masteryBearing !== false
    || value.delivery !== decision.idempotency
    || value.persisted !== (value.delivery === 'new')
  ) {
    throw new Error('Invalid server Topic 1.4 extrema Worked evidence result');
  }
  return value as unknown as TeacherLedEvidenceResult;
}

export async function POST(request: Request): Promise<Response> {
  let claimsOrResponse: StudentClaims | Response;
  try {
    claimsOrResponse = await requireStudentRequestClaims(request);
  } catch {
    return jsonResponse({ error: 'Unable to authenticate request' }, 500);
  }
  if (claimsOrResponse instanceof Response) return claimsOrResponse;
  if (typeof claimsOrResponse.sub !== 'string' || claimsOrResponse.sub.trim().length === 0) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  if (claimsOrResponse.role !== 'student') return jsonResponse({ error: 'Forbidden' }, 403);

  const idempotencyKey = parseIdempotencyKey(request);
  if (!idempotencyKey) return jsonResponse({ error: 'Idempotency-Key is required' }, 400);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }
  const submissionData = parseWorkedSubmissionData(body);
  if (!submissionData) {
    return jsonResponse({ error: 'Only the raw Topic 1.4 polynomial extrema Worked envelope is accepted' }, 400);
  }

  let submission: WorkedSubmissionResult;
  try {
    submission = validateWorkedSubmissionResult(await fetchInternalMutation(
      internal.activities.createTopic14PolynomialExtremaWorkedSubmission,
      {
        userId: claimsOrResponse.sub,
        activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
        idempotencyKey,
        submissionData,
      },
    ));
  } catch (error) {
    if (error instanceof Error && error.message === 'idempotency_conflict') {
      return jsonResponse({ error: 'Idempotency key was already used for a different submission' }, 409);
    }
    return jsonResponse({ error: 'Unable to record the Topic 1.4 polynomial extrema Worked submission' }, 500);
  }

  try {
    validateTeacherLedEvidenceResult(await fetchInternalMutation(
      internal.learningEvidence.submitTopic14PolynomialExtremaWorkedSubmission,
      {
        learnerId: claimsOrResponse.sub,
        submissionId: submission.submissionId,
      },
    ));
  } catch {
    return jsonResponse({ error: 'Unable to record the Topic 1.4 polynomial extrema Worked submission' }, 500);
  }
  return jsonResponse(submission, 200);
}

export default POST;
