import { NextResponse } from 'next/server';
import { requireRequestSessionClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

export async function POST(request: Request) {
  const claims = await requireRequestSessionClaims(request);
  if (claims instanceof Response) return claims;
  if (claims.role !== 'teacher') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const key = request.headers.get('Idempotency-Key')?.trim();
  if (!key) return NextResponse.json({ error: 'Idempotency-Key is required' }, { status: 400 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Invalid exposure' }, { status: 400 });
  const value = body as Record<string, unknown>;
  if (Object.keys(value).some((field) => !['classId', 'studentId', 'submissionId'].includes(field))
    || typeof value.classId !== 'string' || typeof value.studentId !== 'string' || typeof value.submissionId !== 'string') {
    return NextResponse.json({ error: 'Invalid exposure' }, { status: 400 });
  }
  try {
    return NextResponse.json(await fetchInternalMutation(internal.learningEvidence.recordIm3GraphTeacherExposure, {
      teacherId: claims.sub, classId: value.classId, studentId: value.studentId,
      submissionId: value.submissionId, idempotencyKey: key,
    }));
  } catch (error) {
    if (error instanceof Error && error.message.includes('idempotency_conflict')) return NextResponse.json({ error: 'Idempotency key conflict' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to record exposure' }, { status: 403 });
  }
}
