import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

const phaseCompleteBodySchema = z.object({
  lessonId: z.string().min(1, 'lessonId is required'),
  phaseNumber: z.number({ message: 'phaseNumber must be a number' }),
  timeSpent: z.number({ message: 'timeSpent must be a number' }).nonnegative(),
  idempotencyKey: z.string().trim().min(1, 'idempotencyKey is required'),
  linkedStandardId: z.string().optional(),
});

const PHASE_COMPLETION_CONFLICTS = new Set([
  'idempotency_conflict',
  'phase_already_completed',
]);

/**
 * Handles POST requests to mark a lesson phase as completed.
 * Validates the student session and request body, then persists
 * the phase completion via Convex with the body idempotency key.
 *
 * @param {Request} request - The incoming request with a JSON body containing
 *   lessonId, phaseNumber, timeSpent, and idempotencyKey.
 * @returns {JSX.Element} A JSON response confirming the phase completion or an error.
 */
export async function POST(request: Request) {
  const claimsOrResponse = await requireStudentRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  const claims = claimsOrResponse as { sub?: unknown; role?: unknown } | null;
  if (!claims || typeof claims.sub !== 'string' || claims.sub.trim().length === 0) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (claims.role === undefined) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (claims.role !== 'student') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = phaseCompleteBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: validation.error.format() },
      { status: 400 },
    );
  }

  const {
    lessonId,
    phaseNumber,
    timeSpent,
    idempotencyKey,
    linkedStandardId,
  } = validation.data;

  try {
    const result = await fetchInternalMutation(internal.student.completePhase, {
      userId: claims.sub,
      lessonId,
      phaseNumber,
      timeSpent,
      idempotencyKey,
      ...(linkedStandardId ? { linkedStandardId } : {}),
    });

    if (
      !result
      || typeof result !== 'object'
      || Array.isArray(result)
    ) {
      throw new Error('Invalid phase completion result');
    }

    const resultRecord = result as Record<string, unknown>;
    if (resultRecord.success !== true) {
      throw new Error('Invalid phase completion result');
    }

    const hasAlreadyCompleted = typeof resultRecord.alreadyCompleted === 'boolean';
    const hasNextPhaseUnlocked = typeof resultRecord.nextPhaseUnlocked === 'boolean';
    if (hasAlreadyCompleted === hasNextPhaseUnlocked) {
      throw new Error('Invalid phase completion result');
    }

    return NextResponse.json({
      success: true,
      ...(hasAlreadyCompleted
        ? { alreadyCompleted: resultRecord.alreadyCompleted }
        : { nextPhaseUnlocked: resultRecord.nextPhaseUnlocked }),
    });
  } catch (error) {
    console.error('Phase completion failed', error);
    if (error instanceof Error && PHASE_COMPLETION_CONFLICTS.has(error.message)) {
      return NextResponse.json({ error: 'Phase completion conflict' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Phase completion failed' }, { status: 500 });
  }
}
