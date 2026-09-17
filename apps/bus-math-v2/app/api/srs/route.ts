import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireActiveStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalQuery, fetchInternalMutation, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';
const submissionSchema = z.object({ cardId: z.string().min(1), activityId: z.string().min(1),
  answers: z.record(z.string(), z.string()), idempotencyKey: z.string().min(1) });
export async function GET(request: Request) {
  const claims = await requireActiveStudentRequestClaims(request);
  if (claims instanceof Response) return claims;
  const cards = await fetchInternalQuery(internal.srs.getDueCards, { studentId: claims.sub as Id<'profiles'> });
  return NextResponse.json(cards, { headers: { 'Cache-Control': 'private, no-store' } });
}
export async function POST(request: Request) {
  const claims = await requireActiveStudentRequestClaims(request);
  if (claims instanceof Response) return claims;
  try {
    const body = submissionSchema.parse(await request.json());
    const result = await fetchInternalMutation(internal.srs.submitDailyReview, { ...body, studentId: claims.sub as Id<'profiles'> });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Daily review failed', error);
    return NextResponse.json({ error: 'Unable to save this review. Reload the practice session.' }, { status: 409 });
  }
}
