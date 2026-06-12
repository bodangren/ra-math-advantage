import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, getAuthJwtSecret, verifySessionToken } from '@math-platform/core-auth';

const DEV_COMPONENT_APPROVAL_PATTERN = /^\/dev\/component-approval/;

/**
 * Extracts the value of a specific cookie key from a raw Cookie header
 * string. Intentionally duplicated from lib/auth/server.ts because
 * middleware runs in Edge Runtime and cannot import Node.js modules.
 *
 * @param cookieHeader - The raw Cookie header value, or null.
 * @param key - The cookie name to look up.
 * @returns The decoded cookie value, or null if not found.
 */
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

/**
 * Next.js middleware that gates access to /dev/component-approval routes.
 * Redirects unauthenticated users to login and rejects non-admin roles
 * with a 403 Forbidden response.
 *
 * @param request - The incoming Next.js request.
 * @returns A Next.js response (redirect, 403, or pass-through).
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!DEV_COMPONENT_APPROVAL_PATTERN.test(pathname)) {
    return NextResponse.next();
  }

  const token = getCookieValueFromHeader(
    request.headers.get('cookie'),
    SESSION_COOKIE_NAME,
  );

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const claims = await verifySessionToken(token, getAuthJwtSecret());

  if (!claims) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (claims.role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dev/component-approval/:path*'],
};
