import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type StudentClaims = {
  sub: string;
  role: string;
};

type PolynomialDegreeLeadingCoefficientWorkedSubmissionResult = {
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

const ANSWER_IDS = [
  'a_degree',
  'a_leading_coefficient',
  'b_degree',
  'b_leading_coefficient',
  'c_degree',
  'c_leading_coefficient',
] as const;

type AnswerId = typeof ANSWER_IDS[number];
type RawAnswers = Record<AnswerId, string>;

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

function parseAnswers(body: unknown): RawAnswers | null {
  if (!isRecord(body) || !hasExactKeys(body, 'a_degree|a_leading_coefficient|b_degree|b_leading_coefficient|c_degree|c_leading_coefficient')) {
    return null;
  }
  if (!ANSWER_IDS.every((id) => typeof body[id] === 'string')) return null;
  return {
    a_degree: body.a_degree as string,
    a_leading_coefficient: body.a_leading_coefficient as string,
    b_degree: body.b_degree as string,
    b_leading_coefficient: body.b_leading_coefficient as string,
    c_degree: body.c_degree as string,
    c_leading_coefficient: body.c_leading_coefficient as string,
  };
}

function validateSubmissionResult(value: unknown): PolynomialDegreeLeadingCoefficientWorkedSubmissionResult {
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
  ) {
    throw new Error('Invalid server Topic 1.4 polynomial Worked submission result');
  }
  return value as unknown as PolynomialDegreeLeadingCoefficientWorkedSubmissionResult;
}

function validateTeacherLedEvidenceResult(value: unknown): TeacherLedEvidenceResult {
  if (!isRecord(value)) {
    throw new Error('Invalid server Topic 1.4 polynomial Worked evidence result');
  }
  if (!hasExactKeys(value, 'decision|delivery|kstApplied|masteryApplied|persisted')) {
    throw new Error('Invalid server Topic 1.4 polynomial Worked evidence result');
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
    throw new Error('Invalid server Topic 1.4 polynomial Worked evidence result');
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

  const contentType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
  if (contentType !== 'application/json') {
    return jsonResponse({ error: 'Content-Type must be application/json' }, 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }
  const answers = parseAnswers(body);
  if (!answers) {
    return jsonResponse({ error: 'Only raw polynomial degree and leading coefficient answers are accepted' }, 400);
  }

  let submission: PolynomialDegreeLeadingCoefficientWorkedSubmissionResult;
  try {
    submission = validateSubmissionResult(await fetchInternalMutation(
      internal.activities.createTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission,
      {
        userId: claimsOrResponse.sub,
        activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
        idempotencyKey,
        submissionData: {
          contractVersion: 'practice.v1' as const,
          activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID,
          mode: 'worked_example' as const,
          status: 'submitted' as const,
          attemptNumber: 1,
          submittedAt: new Date().toISOString(),
          answers,
          parts: ANSWER_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
        },
      },
    ));
  } catch (error) {
    if (error instanceof Error && error.message === 'idempotency_conflict') {
      return jsonResponse({ error: 'Idempotency key was already used for a different submission' }, 409);
    }
    return jsonResponse({ error: 'Unable to record the Topic 1.4 polynomial Worked submission' }, 500);
  }

  try {
    validateTeacherLedEvidenceResult(await fetchInternalMutation(
      internal.learningEvidence.submitTopic14PolynomialDegreeLeadingCoefficientWorkedSubmission,
      {
        learnerId: claimsOrResponse.sub,
        submissionId: submission.submissionId,
      },
    ));
  } catch {
    return jsonResponse({ error: 'Unable to record the Topic 1.4 polynomial Worked submission' }, 500);
  }
  return jsonResponse(submission, 200);
}

export default POST;
