import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, getAuthJwtSecret } from '@/lib/auth/constants';
import { verifySessionToken } from '@/lib/auth/session';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const claims = await verifySessionToken(token, getAuthJwtSecret());
  if (!claims) {
    cookieStore.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
    return NextResponse.json({ authenticated: false });
  }

  const profile = await fetchInternalQuery(internal.auth.getAccountSettingsContext, {
    profileId: claims.sub,
  });

  if (!profile) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: claims.sub,
      username: claims.username,
      role: claims.role,
    },
    profile: {
      id: profile.id,
      organizationId: profile.organizationId,
      organizationName: profile.organizationName,
      username: profile.username,
      role: profile.role,
      displayName: profile.displayName ?? null,
    },
  });
}
