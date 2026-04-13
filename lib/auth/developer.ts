import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE_NAME, getAuthJwtSecret } from '@/lib/auth/constants';
import { SessionClaims, verifySessionToken } from '@/lib/auth/session';

async function getServerSessionClaims(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token, getAuthJwtSecret());
}

export function isDevApprovalEnabledForRequest(env: Record<string, string | undefined> = process.env): boolean {
  const nodeEnv = env.NODE_ENV?.trim();

  if (nodeEnv === 'production' || nodeEnv === 'preview') {
    return false;
  }

  return nodeEnv === 'development' || nodeEnv === 'test';
}

export async function requireDeveloperSessionClaims(
  loginRedirectPath: string,
  unauthorizedRedirectPath = '/',
): Promise<SessionClaims> {
  const claims = await getServerSessionClaims();
  if (!claims) {
    redirect(buildLoginRedirect(loginRedirectPath));
  }

  if (claims.role !== 'admin') {
    redirect(unauthorizedRedirectPath);
  }

  return claims;
}

export async function requireDeveloperSessionClaimsOrRedirect(): Promise<SessionClaims | null> {
  if (!isDevApprovalEnabledForRequest()) {
    return null;
  }

  const claims = await getServerSessionClaims();
  if (!claims) {
    return null;
  }

  if (claims.role !== 'admin') {
    return null;
  }

  return claims;
}

export function buildLoginRedirect(loginRedirectPath: string): string {
  return `/auth/login?redirect=${loginRedirectPath}`;
}