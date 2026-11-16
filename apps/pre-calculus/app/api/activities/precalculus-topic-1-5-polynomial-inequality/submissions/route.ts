import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type PracticeMode = 'guided_practice' | 'independent_practice';
type Sign = '+' | '-';
type Answers = {
  roots: number[];
  intervalSigns: Sign[];
  solution: string;
};
type SubmissionData = {
  contractVersion: 'practice.v1';
  activityId: string;
  mode: PracticeMode;
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: Answers;
  parts: [
    { partId: 'roots'; rawAnswer: number[] },
    { partId: 'intervalSigns'; rawAnswer: Sign[] },
    { partId: 'solution'; rawAnswer: string },
  ];
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
  if (activityId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_GUIDED_ACTIVITY_ID) {
    return 'guided_practice';
  }
  if (activityId === PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_INDEPENDENT_ACTIVITY_ID) {
    return 'independent_practice';
  }
  return null;
}

function sameNumberArray(left: unknown, right: number[]): left is number[] {
  return Array.isArray(left)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

function sameSignArray(left: unknown, right: Sign[]): left is Sign[] {
  return Array.isArray(left)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
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
  const expectedRootCount = mode === 'guided_practice' ? 2 : 3;
  if (
    !isRecord(answers)
    || !hasExactKeys(answers, 'intervalSigns|roots|solution')
    || !Array.isArray(answers.roots)
    || answers.roots.length !== expectedRootCount
    || !answers.roots.every((root) => typeof root === 'number' && Number.isFinite(root) && Math.abs(root) <= Number.MAX_SAFE_INTEGER)
    || !Array.isArray(answers.intervalSigns)
    || answers.intervalSigns.length !== expectedRootCount + 1
    || !answers.intervalSigns.every((sign) => sign === '+' || sign === '-')
    || typeof answers.solution !== 'string'
    || answers.solution.trim().length === 0
  ) {
    return null;
  }

  const parts = value.parts;
  if (!Array.isArray(parts) || parts.length !== 3) return null;
  const rootsPart = parts[0];
  const signsPart = parts[1];
  const solutionPart = parts[2];
  if (
    !isRecord(rootsPart)
    || !hasExactKeys(rootsPart, 'partId|rawAnswer')
    || rootsPart.partId !== 'roots'
    || !sameNumberArray(rootsPart.rawAnswer, answers.roots)
    || !isRecord(signsPart)
    || !hasExactKeys(signsPart, 'partId|rawAnswer')
    || signsPart.partId !== 'intervalSigns'
    || !sameSignArray(signsPart.rawAnswer, answers.intervalSigns)
    || !isRecord(solutionPart)
    || !hasExactKeys(solutionPart, 'partId|rawAnswer')
    || solutionPart.partId !== 'solution'
    || solutionPart.rawAnswer !== answers.solution
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
    || value.score > 3
    || value.maxScore !== 3
    || typeof value.attemptOrdinal !== 'number'
    || !Number.isSafeInteger(value.attemptOrdinal)
    || value.attemptOrdinal < 1
    || typeof value.feedback !== 'string'
    || value.feedback.trim().length === 0
  ) {
    throw new Error('Invalid server Topic 1.5 polynomial inequality submission result');
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
    return jsonResponse({ error: 'Invalid Topic 1.5 polynomial inequality submission' }, 400);
  }

  try {
    const result = validateSubmissionResult(await fetchInternalMutation(
      internal.activities.createTopic15PolynomialInequalitySubmission,
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
    return jsonResponse({ error: 'Unable to create Topic 1.5 polynomial inequality practice submission' }, 500);
  }
}

export default POST;
