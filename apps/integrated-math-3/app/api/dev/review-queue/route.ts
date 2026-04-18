import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireDeveloperRequestClaims } from '@/lib/auth/server';
import { fetchInternalQuery, fetchInternalMutation, internal } from '@/lib/convex/server';

const reviewQueueQuerySchema = z.object({
  componentKind: z.enum(['example', 'activity', 'practice']).optional(),
  status: z.enum(['unreviewed', 'approved', 'needs_changes', 'rejected']).optional(),
  onlyStale: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

const submitReviewBodySchema = z.object({
  componentKind: z.enum(['example', 'activity', 'practice']),
  componentId: z.string().min(1, 'componentId is required'),
  componentKey: z.string().optional(),
  status: z.enum(['approved', 'needs_changes', 'rejected']),
  comment: z.string().optional(),
  issueTags: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  placement: z
    .object({
      lessonId: z.string().optional(),
      lessonVersionId: z.string().optional(),
      phaseId: z.string().optional(),
      phaseNumber: z.number().optional(),
      sectionId: z.string().optional(),
    })
    .optional(),
});

export async function GET(request: Request) {
  const claimsOrResponse = await requireDeveloperRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  const { searchParams } = new URL(request.url);

  const queryValidation = reviewQueueQuerySchema.safeParse({
    componentKind: searchParams.get('componentKind') ?? undefined,
    status: searchParams.get('status') ?? undefined,
    onlyStale: searchParams.get('onlyStale') ?? undefined,
  });

  if (!queryValidation.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: queryValidation.error.format() },
      { status: 400 },
    );
  }

  const query = queryValidation.data;

  try {
    const items = await fetchInternalQuery(internal.dev.listReviewQueue, query as Record<string, unknown>);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json({ error: 'Failed to fetch review queue' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const claimsOrResponse = await requireDeveloperRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const validation = submitReviewBodySchema.safeParse(rawBody);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: validation.error.format() },
      { status: 400 },
    );
  }

  const { componentKind, componentId, componentKey, status, comment, issueTags, priority, placement } = validation.data;

  if ((status === 'needs_changes' || status === 'rejected') && !comment) {
    return NextResponse.json({ error: 'Comment is required for needs_changes or rejected status' }, { status: 400 });
  }

  try {
    const profileId = await resolveProfileId(claimsOrResponse.sub);
    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const result = await fetchInternalMutation(internal.dev.submitReview, {
      componentKind,
      componentId,
      componentKey,
      status,
      comment,
      issueTags,
      priority,
      placement,
      createdBy: profileId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

async function resolveProfileId(userId: string): Promise<string | null> {
  const profile = await fetchInternalQuery(internal.activities.getProfileByUserId, { userId });
  return profile?.id ?? null;
}