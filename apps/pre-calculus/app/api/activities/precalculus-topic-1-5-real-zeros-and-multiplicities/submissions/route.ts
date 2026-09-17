import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID,
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type PracticeMode = 'guided_practice' | 'independent_practice';
type AnswerId = 'a' | 'b';
type Pair = { zero: number; multiplicity: number };
type Answers = Record<AnswerId, Pair[]>;
type Part = { partId: AnswerId; rawAnswer: Pair[] };

type SubmissionData = {
  contractVersion: 'practice.v1';
  activityId: string;
  mode: PracticeMode;
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: Answers;
  parts: [Part, Part];
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
  if (activityId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_GUIDED_ACTIVITY_ID) {
    return 'guided_practice';
  }
  if (activityId === PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_INDEPENDENT_ACTIVITY_ID) {
    return 'independent_practice';
  }
  return null;
}

function parsePairs(value: unknown): Pair[] | null {
  if (!Array.isArray(value) || value.length < 2 || value.length > 3) return null;
  const pairs: Pair[] = [];
  for (const pair of value) {
    if (
      !isRecord(pair)
      || !hasExactKeys(pair, 'multiplicity|zero')
      || typeof pair.zero !== 'number'
      || !Number.isFinite(pair.zero)
      || typeof pair.multiplicity !== 'number'
      || !Number.isFinite(pair.multiplicity)
    ) {
      return null;
    }
    pairs.push({ zero: pair.zero, multiplicity: pair.multiplicity });
  }
  return pairs;
}

function samePairs(left: Pair[], right: Pair[]): boolean {
  return left.length === right.length && left.every((pair, index) => (
    pair.zero === right[index]?.zero && pair.multiplicity === right[index]?.multiplicity
  ));
}

function parseSubmissionData(value: unknown): SubmissionData | null {
  if (
    !isRecord(value)
    || !hasExactKeys(value, 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt')
    || value.contractVersion !== 'practice.v1'
    || typeof value.activityId !== 'string'
    || value.activityId.trim().length === 0
    || (value.mode !== 'guided_practice' && value.mode !== 'independent_practice')
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

  const rawAnswers = value.answers;
  if (!isRecord(rawAnswers) || !hasExactKeys(rawAnswers, 'a|b')) return null;
  const a = parsePairs(rawAnswers.a);
  const b = parsePairs(rawAnswers.b);
  if (!a || !b) return null;

  const rawParts = value.parts;
  if (!Array.isArray(rawParts) || rawParts.length !== 2) return null;
  for (const [index, partId] of (['a', 'b'] as const).entries()) {
    const rawPart = rawParts[index];
    if (!isRecord(rawPart) || !hasExactKeys(rawPart, 'partId|rawAnswer') || rawPart.partId !== partId) {
      return null;
    }
    const rawAnswer = parsePairs(rawPart.rawAnswer);
    if (!rawAnswer || !samePairs(rawAnswer, partId === 'a' ? a : b)) return null;
  }

  const mode = expectedMode(value.activityId);
  if (mode === null || value.mode !== mode) return null;
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
    || value.score > 2
    || value.maxScore !== 2
    || typeof value.attemptOrdinal !== 'number'
    || !Number.isSafeInteger(value.attemptOrdinal)
    || value.attemptOrdinal < 1
    || typeof value.feedback !== 'string'
  ) {
    throw new Error('Invalid server Topic 1.5 real zeros and multiplicities submission result');
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
    return jsonResponse({ error: 'Invalid Topic 1.5 real zeros and multiplicities submission' }, 400);
  }

  try {
    const result = validateSubmissionResult(await fetchInternalMutation(
      internal.activities.createTopic15RealZerosAndMultiplicitiesSubmission,
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
    return jsonResponse({ error: 'Unable to create Topic 1.5 real zeros and multiplicities practice submission' }, 500);
  }
}

export default POST;
