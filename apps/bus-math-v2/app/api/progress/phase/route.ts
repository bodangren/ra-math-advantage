/**
 * Records a phase progress update (deprecated — redirects to /api/phases/complete).
 *
 * @param request - The incoming request (unused, endpoint is deprecated).
 * @returns A 410 Gone response with the replacement endpoint URL.
 */
export async function POST(request: Request) {
  void request;
  return Response.json(
    {
      error: 'Deprecated endpoint',
      message: 'Use POST /api/phases/complete with lessonId, phaseNumber, timeSpent, and idempotencyKey.',
      replacement: '/api/phases/complete',
    },
    { status: 410 },
  );
}
