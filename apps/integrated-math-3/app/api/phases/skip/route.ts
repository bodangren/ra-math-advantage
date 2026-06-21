import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

const skipPhaseBodySchema = z.object({
  lessonId: z.string().min(1, 'lessonId is required'),
  phaseNumber: z.number({ message: 'phaseNumber must be a number' }),
  idempotencyKey: z.string().min(1, 'idempotencyKey is required'),
});

/**
 * Handles POST requests to skip a lesson phase. Validates the student
 * session and request body, then records the skip via Convex.
 *
 * @param {Request} request - The incoming request with a JSON body containing
 *   lessonId, phaseNumber, and idempotencyKey.
 * @returns {JSX.Element} A JSON response confirming the phase skip or an error.
 */
export async function POST(request: Request) {
  const claimsOrResponse = await requireStudentRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = skipPhaseBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: validation.error.format() },
      { status: 400 },
    );
  }

  const { lessonId, phaseNumber, idempotencyKey } = validation.data;

  try {
    const result = await fetchInternalMutation(
      internal.student.skipPhase,
      {
        userId: claimsOrResponse.sub,
        lessonId,
        phaseNumber,
        idempotencyKey,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Phase skip failed', error);
    return NextResponse.json({ error: 'Phase skip failed' }, { status: 500 });
  }
}