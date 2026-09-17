import { NextResponse } from 'next/server';
import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import { z } from 'zod';

const completeSchema = z.object({
  attemptId: z.string().min(1).max(100),
  moduleNumber: z.number().int().min(1).max(9),
  answers: z.array(z.object({ questionId: z.string().min(1).max(64), answer: z.string().max(2000) })).min(1).max(100),
  durationSeconds: z.number().int().min(0).max(86400),
});

/** Records a student test from its answers. The backend calculates the score. */
export async function POST(request: Request) {
  const claims = await requireStudentRequestClaims(request);
  if (claims instanceof Response) return claims;
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  try {
    const result = await fetchInternalMutation(internal.study.completePracticeTest, { userId: claims.sub, ...parsed.data });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Failed to save practice test:', error);
    return NextResponse.json({ error: 'The test result was not saved.' }, { status: 500 });
  }
}
