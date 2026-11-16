import { NextResponse } from 'next/server';
import { requireRequestSessionClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

function parseBody(value: unknown): { rawResponse: string; hintsUsed: number; revealStepsSeen: number } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).sort().join('|') !== 'hintsUsed|rawResponse|revealStepsSeen' || typeof record.rawResponse !== 'string' || !Number.isSafeInteger(record.hintsUsed) || (record.hintsUsed as number) < 0 || !Number.isSafeInteger(record.revealStepsSeen) || (record.revealStepsSeen as number) < 0) return null;
  return record as { rawResponse: string; hintsUsed: number; revealStepsSeen: number };
}

export async function POST(request: Request, context: { params: Promise<{ activityId: string }> }) {
  const claims = await requireRequestSessionClaims(request);
  if (claims instanceof Response) return claims;
  if (claims.role !== 'student') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const credentialActive = claims.sub.trim().length > 0;
  if (!credentialActive) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const idempotencyKey = request.headers.get('Idempotency-Key')?.trim();
  if (!idempotencyKey) return NextResponse.json({ error: 'Idempotency-Key is required' }, { status: 400 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const submission = parseBody(body);
  if (submission === null) return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
  const { activityId } = await context.params;
  try {
    const result = await fetchInternalMutation(internal.activities.submitTranslationPilot, { userId: claims.sub, activityId, idempotencyKey, ...submission });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes('idempotency_conflict')) return NextResponse.json({ error: 'Idempotency key conflict' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to submit activity' }, { status: 500 });
  }
}
