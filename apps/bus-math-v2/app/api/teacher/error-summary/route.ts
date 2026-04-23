import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireActiveTeacherRequestClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

const querySchema = z.object({
  lessonId: z.string().trim().min(1, 'lessonId is required'),
});

export async function GET(request: Request) {
  try {
    const claims = await requireActiveTeacherRequestClaims(request);
    if (claims instanceof Response) {
      return claims;
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      lessonId: searchParams.get('lessonId'),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { lessonId } = parsed.data;

    const teacher = await fetchInternalQuery(internal.teacher.getProfileWithOrg, {
      userId: claims.sub as Id<'profiles'>,
    });

    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const summary = await fetchInternalQuery(internal.teacher.getLessonErrorSummary, {
      lessonId: lessonId as Id<'lessons'>,
      teacherOrgId: teacher.organizationId,
    });

    if (!summary) {
      return NextResponse.json(
        { error: 'No practice submissions found for this lesson' },
        { status: 404 },
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[error-summary] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
