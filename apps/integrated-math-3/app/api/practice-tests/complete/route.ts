import { NextResponse } from 'next/server';
import { requireStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalMutation, internal } from '@/lib/convex/server';
import { z } from 'zod';

const completeSchema = z.object({
  moduleNumber: z.number().int().min(1).max(9),
  lessonsTested: z.array(z.string().min(1).max(64)).max(20),
  questionCount: z.number().int().min(1).max(100),
  score: z.number().int().nonnegative(),
  perLessonBreakdown: z.array(
    z.object({
      lessonId: z.string().min(1).max(64),
      lessonTitle: z.string().min(1).max(128),
      correct: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    })
  ).max(20),
  durationSeconds: z.number().int().nonnegative().max(86400),
}).refine((data) => data.score <= data.questionCount, {
  message: 'Score cannot exceed question count',
  path: ['score'],
});

export async function POST(request: Request) {
  const authResult = await requireStudentRequestClaims(request);

  if (authResult instanceof Response) {
    return authResult;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = completeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const {
    moduleNumber,
    lessonsTested,
    questionCount,
    score,
    perLessonBreakdown,
    durationSeconds,
  } = parsed.data;

  try {
    await Promise.all([
      fetchInternalMutation(internal.study.savePracticeTestResult, {
        userId: authResult.sub,
        moduleNumber,
        lessonsTested,
        questionCount,
        score,
        perLessonBreakdown,
      }),
      fetchInternalMutation(internal.study.recordStudySession, {
        userId: authResult.sub,
        activityType: 'practice_test',
        curriculumScope: {
          type: 'module',
          moduleNumber,
        },
        results: {
          itemsSeen: questionCount,
          itemsCorrect: score,
          itemsIncorrect: questionCount - score,
          durationSeconds,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving practice test result:', error);
    return NextResponse.json(
      { error: 'Failed to save result' },
      { status: 500 }
    );
  }
}
