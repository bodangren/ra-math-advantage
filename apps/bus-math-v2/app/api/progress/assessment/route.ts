import { NextResponse } from 'next/server';

import { calculateScore } from '@/lib/assessments/scoring';
import { requireActiveStudentRequestClaims } from '@/lib/auth/server';
import { submissionDataSchema } from '@/lib/db/schema/activity-submissions';
import { selectActivitySchema } from '@/lib/db/schema/validators';
import { fetchInternalQuery, fetchInternalMutation, fetchMutation, api, internal } from '@/lib/convex/server';
import { formatRateLimitError } from '@/convex/apiRateLimits';
import { normalizePracticeSubmissionInput } from '@math-platform/practice-core/contract';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const apiAny = api as any;

function buildBadRequest(details: Record<string, unknown> | string) {
  return NextResponse.json(
    typeof details === 'string'
      ? { error: details }
      : {
          error: 'Invalid payload',
          details,
        },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  try {
    const claimsOrResponse = await requireActiveStudentRequestClaims(request);
    if (claimsOrResponse instanceof Response) {
      return claimsOrResponse;
    }

    const rateLimitResult = await fetchMutation(apiAny.apiRateLimits.checkAndIncrementApiRateLimit, {
      endpoint: 'assessment',
    });
    if (!rateLimitResult.allowed) {
      return formatRateLimitError(rateLimitResult.windowExpiresAt);
    }

    let submission;
    try {
      const body = await request.json();
      submission = submissionDataSchema.parse(normalizePracticeSubmissionInput(body));
    } catch (parseError) {
      console.error('Invalid practice submission payload', parseError);
      return buildBadRequest('Invalid payload');
    }

    if (Object.keys(submission.answers).length === 0) {
      return buildBadRequest('answers must include at least one entry.');
    }

    const activityRecord = await fetchInternalQuery(internal.activities.getActivityById, {
      activityId: submission.activityId as never,
    });

    if (!activityRecord) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    let activity;
    try {
      activity = selectActivitySchema.parse({
        ...activityRecord,
        createdAt: new Date(activityRecord.createdAt),
        updatedAt: new Date(activityRecord.updatedAt),
      });
    } catch (error) {
      console.error('Invalid activity configuration', error);
      return NextResponse.json({ error: 'Activity configuration is invalid.' }, { status: 500 });
    }

    let score;
    try {
      score = calculateScore(activity, submission.answers);
    } catch (error) {
      console.error('[assessment] Scoring error:', error);
      return NextResponse.json({ error: 'Unable to score submission' }, { status: 422 });
    }

    const userId = claimsOrResponse.sub;

    await fetchInternalMutation(internal.activities.submitAssessment, {
      userId: userId as never,
      activityId: submission.activityId as never,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      submissionData: submission as any,
      score: score.score,
      maxScore: score.maxScore,
      feedback: score.feedback,
    });

    return NextResponse.json({
      score: score.score,
      maxScore: score.maxScore,
      percentage: score.percentage,
      feedback: score.feedback,
    });
  } catch (error) {
    console.error('[assessment] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
