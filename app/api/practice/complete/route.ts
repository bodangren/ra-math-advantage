import { NextResponse } from 'next/server';
import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

export async function POST(request: Request) {
  const authResult = await requireStudentRequestClaims(request);

  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const sessionId = await fetchInternalMutation(
      internal.queue.sessions.completeDailySession,
      { studentId: authResult.sub },
    );

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error('Error completing daily practice session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete session' },
      { status: 500 },
    );
  }
}
