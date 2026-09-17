import { NextResponse } from 'next/server';
import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import { practiceSubmissionEnvelopeSchema, PRACTICE_CONTRACT_VERSION } from '@math-platform/practice-core/contract';

/**
 * Handles POST requests to submit a practice activity result.
 * Validates the student session, parses the submission envelope
 * against the practice.v1 contract, and persists the result via Convex.
 *
 * @param {Request} request - The incoming request with a JSON submission envelope.
 * @returns {JSX.Element} A JSON response with the submission result or an error.
 */
export async function POST(request: Request) {
  const authResult = await requireStudentRequestClaims(request);

  if (authResult instanceof Response) {
    return authResult;
  }

  const idempotencyKey = request.headers.get('Idempotency-Key')?.trim();
  if (!idempotencyKey) {
    return NextResponse.json(
      { error: 'A non-empty Idempotency-Key is required' },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const validation = practiceSubmissionEnvelopeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid submission envelope', details: validation.error.format() },
        { status: 400 },
      );
    }

    const envelope = validation.data;

    if (envelope.contractVersion !== PRACTICE_CONTRACT_VERSION) {
      return NextResponse.json(
        { error: `Invalid contract version: ${envelope.contractVersion}. Expected: ${PRACTICE_CONTRACT_VERSION}` },
        { status: 400 },
      );
    }

    const result = await fetchInternalMutation(internal.activities.submitActivity, {
      userId: authResult.sub as `profiles:${string}`,
      activityId: envelope.activityId as `activities:${string}`,
      submissionData: envelope,
      idempotencyKey,
    });

    return NextResponse.json({
      success: true,
      submissionId: result.id,
      score: result.score,
      maxScore: result.maxScore,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'idempotency_conflict') {
      return NextResponse.json(
        { error: 'Idempotency key was already used for a different submission' },
        { status: 409 },
      );
    }
    console.error('Error submitting activity:', error);
    return NextResponse.json(
      { error: 'Failed to submit activity' },
      { status: 500 },
    );
  }
}
