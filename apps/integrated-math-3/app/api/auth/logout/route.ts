import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME } from '@math-platform/core-auth';

/**
 * Handles POST requests to log the user out by clearing the session
 * cookie with an expired expiration date.
 *
 * @returns {JSX.Element} A JSON response confirming successful logout.
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });

  return NextResponse.json({ ok: true });
}
