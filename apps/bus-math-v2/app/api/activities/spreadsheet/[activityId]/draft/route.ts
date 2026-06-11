import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireActiveStudentRequestClaims } from '@/lib/auth/server';
import { fetchInternalQuery, fetchInternalMutation, internal } from '@/lib/convex/server';

const draftSchema = z.object({
  draftData: z.array(z.array(z.any())),
});

/**
 * Fetches the latest draft for a spreadsheet activity.
 *
 * @param request - The incoming request with session cookie.
 * @param params - Route params containing the activityId string.
 * @returns A JSON response with draftData and updatedAt, or null if no draft exists.
 * @throws Returns 400 for invalid IDs, 500 on internal errors.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;

    if (!activityId?.trim()) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    const claimsOrResponse = await requireActiveStudentRequestClaims(request);
    if (claimsOrResponse instanceof Response) {
      return claimsOrResponse;
    }

    const userId = claimsOrResponse.sub;

    const response = await fetchInternalQuery(internal.activities.getSpreadsheetDraft, {
      userId: userId as never,
      activityId: activityId as never,
    });

    if (!response?.draftData) {
      return NextResponse.json({ draftData: null });
    }

    return NextResponse.json({
      draftData: response.draftData,
      updatedAt: response.updatedAt,
    });
  } catch (error) {
    console.error('Draft retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Creates or updates a draft submission for a spreadsheet activity.
 *
 * @param request - The incoming request with session cookie and JSON body
 *   containing draftData (2D array of cell values).
 * @param params - Route params containing the activityId string.
 * @returns A JSON response with success flag and updatedAt timestamp.
 * @throws Returns 400 for invalid payload, 500 on internal errors.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;

    if (!activityId?.trim()) {
      return NextResponse.json(
        { error: 'Invalid activity ID format' },
        { status: 400 }
      );
    }

    const claimsOrResponse = await requireActiveStudentRequestClaims(request);
    if (claimsOrResponse instanceof Response) {
      return claimsOrResponse;
    }

    const userId = claimsOrResponse.sub;

    let payload: z.infer<typeof draftSchema>;
    try {
      const body = await request.json();
      const parsed = draftSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: 'Invalid payload',
            details: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }
      payload = parsed.data;
    } catch {
      return NextResponse.json(
        {
          error: 'Unable to parse request body',
        },
        { status: 400 }
      );
    }

    const result = await fetchInternalMutation(internal.activities.saveSpreadsheetDraft, {
      userId: userId as never,
      activityId: activityId as never,
      draftData: payload.draftData,
    });

    return NextResponse.json({
      success: true,
      updatedAt: result.updatedAt,
    });
  } catch (error) {
    console.error('Draft save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
