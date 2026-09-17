import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type PracticeMode = 'guided_practice' | 'independent_practice';
type SubmissionData = {
  contractVersion: 'practice.v1';
  activityId: string;
  mode: PracticeMode;
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: { leastDegree: number };
  parts: [{ partId: 'leastDegree'; rawAnswer: number }];
};

type SubmissionResult = {
  submissionId: string;
  score: number;
  maxScore: number;
  attemptOrdinal: number;
  feedback: string;
};

type StudentClaims = { sub: string; role: string };

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

function expectedMode(activityId: string): PracticeMode | null {
  if (activityId === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_GUIDED_ACTIVITY_ID) {
    return 'guided_practice';
  }
  if (activityId === PRECALCULUS_TOPIC_15_LEAST_POLYNOMIAL_DEGREE_INDEPENDENT_ACTIVITY_ID) {
    return 'independent_practice';
  }
  return null;
}

function parseSubmissionData(value: unknown): SubmissionData | null {
  if (
    !isRecord(value)
    || !hasExactKeys(value, 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt')
    || value.contractVersion !== 'practice.v1'
    || typeof value.activityId !== 'string'
    || value.activityId.trim().length === 0
    || value.status !== 'submitted'
    || typeof value.attemptNumber !== 'number'
    || !Number.isSafeInteger(value.attemptNumber)
    || value.attemptNumber < 1
    || typeof value.submittedAt !== 'string'
    || value.submittedAt.trim().length === 0
    || !Number.isFinite(Date.parse(value.submittedAt))
  ) {
    return null;
  }

  const mode = expectedMode(value.activityId);
  if (mode === null || value.mode !== mode) return null;

  const answers = value.answers;
  if (
    !isRecord(answers)
    || !hasExactKeys(answers, 'leastDegree')
    || typeof answers.leastDegree !== 'number'
    || !Number.isFinite(answers.leastDegree)
    || !Number.isSafeInteger(answers.leastDegree)
  ) {
    return null;
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== 1) return null;
  const part = parts[0];
  if (
    !isRecord(part)
    || !hasExactKeys(part, 'partId|rawAnswer')
    || part.partId !== 'leastDegree'
    || typeof part.rawAnswer !== 'number'
    || !Number.isFinite(part.rawAnswer)
    || !Number.isSafeInteger(part.rawAnswer)
    || part.rawAnswer !== answers.leastDegree
  ) {
    return null;
  }

  return value as unknown as SubmissionData;
}

function parseIdempotencyKey(request: Request): string | null {
  const key = request.headers.get('Idempotency-Key')?.trim() ?? '';
  return key.length > 0 ? key : null;
}

function validateSubmissionResult(value: unknown): SubmissionResult {
  if (
    !isRecord(value)
    || !hasExactKeys(value, 'attemptOrdinal|feedback|maxScore|score|submissionId')
    || typeof value.submissionId !== 'string'
    || value.submissionId.trim().length === 0
    || typeof value.score !== 'number'
    || !Number.isSafeInteger(value.score)
    || value.score < 0
    || value.score > 1
    || value.maxScore !== 1
    || typeof value.attemptOrdinal !== 'number'
    || !Number.isSafeInteger(value.attemptOrdinal)
    || value.attemptOrdinal < 1
    || typeof value.feedback !== 'string'
  ) {
    throw new Error('Invalid server Topic 1.5 least polynomial degree submission result');
  }
  return value as unknown as SubmissionResult;
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
  const submissionData = parseSubmissionData(body);
  if (!submissionData) {
    return jsonResponse({ error: 'Invalid Topic 1.5 least polynomial degree submission' }, 400);
  }

  try {
    const result = validateSubmissionResult(await fetchInternalMutation(
      internal.activities.createTopic15LeastPolynomialDegreeSubmission,
      {
        userId: claimsOrResponse.sub,
        activityId: submissionData.activityId,
        submissionData,
        idempotencyKey,
      },
    ));
    return jsonResponse(result, 200);
  } catch (error) {
    if (error instanceof Error && error.message === 'idempotency_conflict') {
      return jsonResponse({ error: 'Idempotency key was already used for a different submission' }, 409);
    }
    return jsonResponse({ error: 'Unable to create Topic 1.5 least polynomial degree practice submission' }, 500);
  }
}

export default POST;
