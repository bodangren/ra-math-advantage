import { NextResponse } from 'next/server';

import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

interface PhaseCompleteBody {
  lessonId?: string;
  phaseNumber?: number;
  timeSpent?: number;
  idempotencyKey?: string;
  linkedStandardId?: string;
}

export async function POST(request: Request) {
  const claimsOrResponse = await requireStudentRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  let body: PhaseCompleteBody;
  try {
    body = (await request.json()) as PhaseCompleteBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { lessonId, phaseNumber, timeSpent, idempotencyKey, linkedStandardId } = body;

  if (!lessonId || phaseNumber == null || timeSpent == null || !idempotencyKey) {
    return NextResponse.json(
      { error: 'lessonId, phaseNumber, timeSpent, and idempotencyKey are required' },
      { status: 400 },
    );
  }

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
