import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_NAME, getAuthJwtSecret, verifySessionToken } from '@math-platform/core-auth';
import type { SessionClaims } from '@math-platform/core-auth';

export async function getServerSessionClaims(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token, getAuthJwtSecret());
}

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

export async function getRequestSessionClaims(request: Request): Promise<SessionClaims | null> {
  const token = getCookieValueFromHeader(request.headers.get('cookie'), SESSION_COOKIE_NAME);
  if (!token) return null;

  return verifySessionToken(token, getAuthJwtSecret());
}

function buildRequestUnauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

function buildRequestForbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function requireRequestSessionClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
): Promise<SessionClaims | Response> {
  const claims = await getRequestSessionClaims(request);
  if (!claims) {
    return buildRequestUnauthorizedResponse(unauthorizedMessage);
  }

  return claims;
}

export async function requireTeacherRequestClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
  forbiddenMessage = 'Forbidden',
): Promise<SessionClaims | Response> {
  const claimsOrResponse = await requireRequestSessionClaims(request, unauthorizedMessage);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  if (claimsOrResponse.role !== 'teacher' && claimsOrResponse.role !== 'admin') {
    return buildRequestForbiddenResponse(forbiddenMessage);
  }

  return claimsOrResponse;
}

export async function requireServerSessionClaims(
  loginRedirectPath: string,
): Promise<SessionClaims> {
  const claims = await getServerSessionClaims();
  if (!claims) {
    redirect(`/auth/login?redirect=${loginRedirectPath}`);
  }

  return claims;
}

export async function requireTeacherSessionClaims(
  loginRedirectPath: string,
  unauthorizedRedirectPath = '/student/dashboard',
): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);

  if (claims.role !== 'teacher' && claims.role !== 'admin') {
    redirect(unauthorizedRedirectPath);
  }

  return claims;
}

export async function requireStudentSessionClaims(
  loginRedirectPath: string,
): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);

  if (claims.role === 'student') {
    return claims;
  }

  redirect('/teacher');
}
