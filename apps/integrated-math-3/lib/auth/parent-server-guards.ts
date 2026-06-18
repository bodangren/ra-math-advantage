import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, getAuthJwtSecret } from '@math-platform/core-auth';
import type { SessionClaims } from '@math-platform/core-auth';
import { verifySessionToken } from '@math-platform/core-auth';
import { fetchInternalQuery, internal } from '@/lib/convex/server';

function getCookieValueFromHeader(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;

  const entries = cookieHeader.split(';');
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) continue;

    const name = trimmed.slice(0, separatorIndex).trim();
    if (name !== key) continue;

    return decodeURIComponent(trimmed.slice(separatorIndex + 1));
  }

  return null;
}

export async function requireParentRequestClaims(
  request: Request,
  studentId: string,
): Promise<SessionClaims | Response> {
  const token = getCookieValueFromHeader(request.headers.get('cookie'), SESSION_COOKIE_NAME);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const claims = await verifySessionToken(token, getAuthJwtSecret());
  if (!claims) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (claims.role !== 'parent') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parentRef = (internal as Record<string, Record<string, unknown>>).parent.listParentLinks;
  const links = await fetchInternalQuery(parentRef, {
    parentId: claims.sub,
  });

  const hasActiveLink =
    Array.isArray(links) &&
    links.some(
      (link: { studentId: string; status: string }) =>
        link.studentId === studentId && link.status === 'active',
    );

  if (!hasActiveLink) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return claims;
}

export async function requireParentServerSessionClaims(
  loginRedirectPath: string,
): Promise<SessionClaims> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    redirect(`/auth/login?redirect=${loginRedirectPath}`);
  }

  const claims = await verifySessionToken(token, getAuthJwtSecret());
  if (!claims) {
    redirect(`/auth/login?redirect=${loginRedirectPath}`);
  }

  if (claims.role !== 'parent') {
    redirect(`/auth/login?redirect=${loginRedirectPath}`);
  }

  return claims;
}
