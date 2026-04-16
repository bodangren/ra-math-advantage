import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

const phaseCompleteBodySchema = z.object({
  lessonId: z.string().min(1, 'lessonId is required'),
  phaseNumber: z.number({ message: 'phaseNumber must be a number' }),
  timeSpent: z.number({ message: 'timeSpent must be a number' }),
  idempotencyKey: z.string().min(1, 'idempotencyKey is required'),
  linkedStandardId: z.string().optional(),
});

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

  const validation = phaseCompleteBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: validation.error.format() },
      { status: 400 },
    );
  }

  const { lessonId, phaseNumber, timeSpent, idempotencyKey, linkedStandardId } = validation.data;

  try {
    const result = await fetchInternalMutation(internal.student.completePhase, {
      userId: claimsOrResponse.sub,
      lessonId,
      phaseNumber,
      timeSpent,
      idempotencyKey,
      ...(linkedStandardId ? { linkedStandardId } : {}),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Phase completion failed', error);
    return NextResponse.json({ error: 'Phase completion failed' }, { status: 500 });
  }
}
