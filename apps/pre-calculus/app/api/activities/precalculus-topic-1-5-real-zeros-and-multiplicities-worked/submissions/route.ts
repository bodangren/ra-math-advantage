import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type StudentClaims = {
  sub: string;
  role: string;
};

type Pair = { zero: number; multiplicity: number };
type Answers = { a: Pair[]; b: Pair[] };
type Part = { partId: 'a' | 'b'; rawAnswer: Pair[] };

type WorkedSubmissionData = {
  contractVersion: 'practice.v1';
  activityId: typeof PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID;
  mode: 'worked_example';
  status: 'submitted';
  attemptNumber: number;
  submittedAt: string;
  answers: Answers;
  parts: [Part, Part];
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

function parseWorkedSubmissionData(value: unknown): WorkedSubmissionData | null {
  if (
    !isRecord(value)
    || !hasExactKeys(value, 'activityId|answers|attemptNumber|contractVersion|mode|parts|status|submittedAt')
    || value.contractVersion !== 'practice.v1'
    || value.activityId !== PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID
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

  const rawAnswers = value.answers;
  if (!isRecord(rawAnswers) || !hasExactKeys(rawAnswers, 'a|b')) return null;
  const a = parsePairs(rawAnswers.a);
  const b = parsePairs(rawAnswers.b);
  if (!a || !b) return null;

  const rawParts = value.parts;
  if (!Array.isArray(rawParts) || rawParts.length !== 2) return null;
  const answerValues = { a, b };
  for (const [index, partId] of (['a', 'b'] as const).entries()) {
    const rawPart = rawParts[index];
    if (
      !isRecord(rawPart)
      || !hasExactKeys(rawPart, 'partId|rawAnswer')
      || rawPart.partId !== partId
    ) {
      return null;
    }
    const rawAnswer = parsePairs(rawPart.rawAnswer);
    if (!rawAnswer || !samePairs(rawAnswer, answerValues[partId])) return null;
  }

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
    throw new Error('Invalid server Topic 1.5 real zeros and multiplicities Worked submission result');
  }
  return value as unknown as WorkedSubmissionResult;
}

function validateTeacherLedEvidenceResult(value: unknown): TeacherLedEvidenceResult {
  if (!isRecord(value) || !hasExactKeys(value, 'decision|delivery|kstApplied|masteryApplied|persisted')) {
    throw new Error('Invalid server Topic 1.5 real zeros and multiplicities Worked evidence result');
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
    throw new Error('Invalid server Topic 1.5 real zeros and multiplicities Worked evidence result');
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
    return jsonResponse({ error: 'Invalid Topic 1.5 real zeros and multiplicities Worked submission' }, 400);
  }

  let submission: WorkedSubmissionResult;
  try {
    submission = validateWorkedSubmissionResult(await fetchInternalMutation(
      internal.activities.createTopic15RealZerosAndMultiplicitiesWorkedSubmission,
      {
        userId: claimsOrResponse.sub,
        activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
        idempotencyKey,
        submissionData,
      },
    ));
  } catch (error) {
    if (error instanceof Error && error.message === 'idempotency_conflict') {
      return jsonResponse({ error: 'Idempotency key was already used for a different submission' }, 409);
    }
    return jsonResponse({ error: 'Unable to record the Topic 1.5 real zeros and multiplicities Worked submission' }, 500);
  }

  try {
    validateTeacherLedEvidenceResult(await fetchInternalMutation(
      internal.learningEvidence.submitTopic15RealZerosAndMultiplicitiesWorkedSubmission,
      {
        learnerId: claimsOrResponse.sub,
        submissionId: submission.submissionId,
      },
    ));
  } catch {
    return jsonResponse({ error: 'Unable to record the Topic 1.5 real zeros and multiplicities Worked submission' }, 500);
  }
  return jsonResponse(submission, 200);
}

export default POST;
