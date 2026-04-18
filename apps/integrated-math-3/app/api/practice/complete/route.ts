import { NextResponse } from 'next/server';
import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

export async function POST(request: Request) {
  const authResult = await requireStudentRequestClaims(request);

  if (authResult instanceof Response) {
    return authResult;
  }

  let body: { sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  if (!body.sessionId) {
    return NextResponse.json(
      { error: 'Missing sessionId' },
      { status: 400 },
    );
  }

  try {
    const sessionId = await fetchInternalMutation(
      internal.queue.sessions.completeDailySession,
      { studentId: authResult.sub, sessionId: body.sessionId },
    );

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error('Error completing daily practice session:', error);
    return NextResponse.json(
      { error: 'Failed to complete session' },
      { status: 500 },
    );
  }
}
