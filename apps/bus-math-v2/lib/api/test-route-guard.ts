import { NextResponse } from 'next/server';

/**
 * Enforces test route guard restrictions for API endpoints.
 * In production, test APIs are disabled. In development, an API key may be required.
 * @param request - The incoming request object
 * @returns Error NextResponse if restricted, null if allowed
 */
export function enforceTestRouteGuard(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Test API cannot be used in production' },
      { status: 403 },
    );
  }

  const expectedApiKey = process.env.TEST_API_KEY?.trim();
  if (expectedApiKey) {
    const providedKey = request.headers.get('x-test-api-key')?.trim();
    if (providedKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized test API access' },
        { status: 401 },
      );
    }
  }

  return null;
}
