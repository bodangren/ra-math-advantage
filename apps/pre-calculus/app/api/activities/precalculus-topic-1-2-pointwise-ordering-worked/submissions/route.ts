import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import {
  PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
} from '@/lib/learning-evidence/precalc-pilot';

type StudentClaims = {
  sub: string;
  role: string;
};

type PointwiseOrderingWorkedSubmissionResult = {
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

function parseOrderedPointIds(value: unknown): ['B', 'C', 'A'] | null {
  if (
    !isRecord(value)
    || !hasExactKeys(value, 'orderedPointIds')
    || !Array.isArray(value.orderedPointIds)
    || value.orderedPointIds.length !== 3
    || value.orderedPointIds[0] !== 'B'
    || value.orderedPointIds[1] !== 'C'
    || value.orderedPointIds[2] !== 'A'
  ) return null;
  return ['B', 'C', 'A'];
}

function validateSubmissionResult(value: unknown): PointwiseOrderingWorkedSubmissionResult {
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
    throw new Error('Invalid server pointwise rate-ordering Worked submission result');
  }
  return value as unknown as PointwiseOrderingWorkedSubmissionResult;
}

function validateTeacherLedEvidenceResult(value: unknown): TeacherLedEvidenceResult {
  if (!isRecord(value)) {
    throw new Error('Invalid server pointwise rate-ordering Worked evidence result');
  }
  if (Object.keys(value).sort().join('|') !== 'decision|delivery|kstApplied|masteryApplied|persisted') {
    throw new Error('Invalid server pointwise rate-ordering Worked evidence result');
  }
  const decision = value.decision;
  if (
    typeof value.persisted !== 'boolean'
    || value.masteryApplied !== false
    || value.kstApplied !== false
    || (value.delivery !== 'new' && value.delivery !== 'replay')
    || !isRecord(decision)
    || Object.keys(decision).sort().join('|') !== 'eligible|exposureState|idempotency|masteryBearing|reason'
    || (decision.idempotency !== 'new' && decision.idempotency !== 'replay')
    || decision.exposureState !== 'introduced'
    || decision.eligible !== false
    || decision.reason !== 'teacher_led'
    || decision.masteryBearing !== false
    || value.delivery !== decision.idempotency
    || value.persisted !== (value.delivery === 'new')
  ) {
    throw new Error('Invalid server pointwise rate-ordering Worked evidence result');
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
  const orderedPointIds = parseOrderedPointIds(body);
  if (!orderedPointIds) {
    return jsonResponse({ error: 'Only the source point ordering is accepted' }, 400);
  }

  try {
    const submission = validateSubmissionResult(await fetchInternalMutation(
      internal.activities.createTopic12PointwiseRateOrderingWorkedSubmission,
      {
        userId: claimsOrResponse.sub,
        activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
        idempotencyKey,
        submissionData: {
          contractVersion: 'practice.v1' as const,
          activityId: PRECALCULUS_TOPIC_12_POINTWISE_RATE_ORDERING_WORKED_ACTIVITY_ID,
          mode: 'worked_example' as const,
          status: 'submitted' as const,
          attemptNumber: 1,
          submittedAt: new Date().toISOString(),
          answers: { orderedPointIds },
          parts: [{ partId: 'orderedPointIds' as const, rawAnswer: orderedPointIds }],
        },
      },
    ));
    validateTeacherLedEvidenceResult(await fetchInternalMutation(
      internal.learningEvidence.submitTopic12PointwiseRateOrderingWorkedSubmission,
      {
        learnerId: claimsOrResponse.sub,
        submissionId: submission.submissionId,
      },
    ));
    return jsonResponse(submission, 200);
  } catch (error) {
    if (error instanceof Error && error.message === 'idempotency_conflict') {
      return jsonResponse({ error: 'Idempotency key was already used for a different submission' }, 409);
    }
    return jsonResponse({ error: 'Unable to record the Topic 1.2 pointwise rate-ordering Worked submission' }, 500);
  }
}

export default POST;
