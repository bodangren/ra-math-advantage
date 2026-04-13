import { NextResponse } from 'next/server';
import { requireDeveloperRequestClaims } from '@/lib/auth/server';
import { fetchInternalQuery, fetchInternalMutation, internal } from '@/lib/convex/server';

interface ReviewQueueQuery {
  componentKind?: 'example' | 'activity' | 'practice';
  status?: 'unreviewed' | 'approved' | 'needs_changes' | 'rejected';
  onlyStale?: boolean;
}

export async function GET(request: Request) {
  const claimsOrResponse = await requireDeveloperRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  const { searchParams } = new URL(request.url);
  const query: ReviewQueueQuery = {};

  const componentKind = searchParams.get('componentKind');
  if (componentKind) query.componentKind = componentKind as ReviewQueueQuery['componentKind'];

  const status = searchParams.get('status');
  if (status) query.status = status as ReviewQueueQuery['status'];

  const onlyStale = searchParams.get('onlyStale');
  if (onlyStale === 'true') query.onlyStale = true;

  try {
    const items = await fetchInternalQuery(internal.dev.listReviewQueue, query as Record<string, unknown>);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return NextResponse.json({ error: 'Failed to fetch review queue' }, { status: 500 });
  }
}

interface SubmitReviewBody {
  componentKind: 'example' | 'activity' | 'practice';
  componentId: string;
  componentKey?: string;
  status: 'approved' | 'needs_changes' | 'rejected';
  comment?: string;
  issueTags?: string[];
  priority?: 'low' | 'medium' | 'high';
  placement?: {
    lessonId?: string;
    lessonVersionId?: string;
    phaseId?: string;
    phaseNumber?: number;
    sectionId?: string;
  };
}

export async function POST(request: Request) {
  const claimsOrResponse = await requireDeveloperRequestClaims(request);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  let body: SubmitReviewBody;
  try {
    body = (await request.json()) as SubmitReviewBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { componentKind, componentId, componentKey, status, comment, issueTags, priority, placement } = body;

  if (!componentKind || !componentId || !status) {
    return NextResponse.json(
      { error: 'componentKind, componentId, and status are required' },
      { status: 400 },
    );
  }

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
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to submit review' }, { status: 500 });
  }
}

async function resolveProfileId(userId: string): Promise<string | null> {
  const profile = await fetchInternalQuery(internal.activities.getProfileByUserId, { userId });
  return profile?.id ?? null;
}