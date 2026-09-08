import { NextResponse } from 'next/server';
import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

const headers = { 'Cache-Control': 'private, no-store' };

export async function POST(request: Request) {
  const claims = await requireStudentRequestClaims(request);
  if (claims instanceof Response) return claims;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid check request' }, { status: 400, headers });
  }
  const value = body as Record<string, unknown>;
  if (Object.keys(value).sort().join('|') !== 'activityId|fieldId|rawAnswer'
    || typeof value.activityId !== 'string' || !value.activityId.trim()
    || value.fieldId !== 'discriminant' || typeof value.rawAnswer !== 'string' || value.rawAnswer.length > 160) {
    return NextResponse.json({ error: 'Invalid check request' }, { status: 400, headers });
  }
  try {
    const result: unknown = await fetchInternalQuery(internal.activities.checkQuadraticFormulaDiscriminant, {
      userId: claims.sub as Id<'profiles'>,
      activityId: value.activityId as Id<'activities'>,
      fieldId: 'discriminant',
      rawAnswer: value.rawAnswer,
    });
    if (!result || typeof result !== 'object' || !('isCorrect' in result) || typeof result.isCorrect !== 'boolean') {
      throw new Error('Invalid check response');
    }
    return NextResponse.json({ isCorrect: result.isCorrect }, { headers });
  } catch {
    return NextResponse.json({ error: 'The answer could not be checked. Try again.' }, { status: 503, headers });
  }
}
