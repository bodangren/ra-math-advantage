import { NextResponse } from 'next/server';
import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import { practiceSubmissionEnvelopeSchema, PRACTICE_CONTRACT_VERSION } from '@math-platform/practice-core/contract';

/**
 * Handles POST requests to submit a practice activity result.
 * Validates the student session, parses the submission envelope
 * against the practice.v1 contract, and persists the result via Convex.
 *
 * @param request - The incoming request with a JSON submission envelope.
 * @returns A JSON response with the submission result or an error.
 */
export async function POST(request: Request) {
  const authResult = await requireStudentRequestClaims(request);

  if (authResult instanceof Response) {
    return authResult;
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
    });

    return NextResponse.json({
      success: true,
      submissionId: result.id,
      score: result.score,
      maxScore: result.maxScore,
    });
  } catch (error) {
    console.error('Error submitting activity:', error);
    return NextResponse.json(
      { error: 'Failed to submit activity' },
      { status: 500 },
    );
  }
}
