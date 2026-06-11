import { redirect } from 'next/navigation';

import { getServerSessionClaims } from '@/lib/auth/server';
import type { SessionClaims } from '@math-platform/core-auth';

/** Checks whether developer approval flows are enabled based on the NODE_ENV value. */
export function isDevApprovalEnabledForRequest(env: Record<string, string | undefined> = process.env): boolean {
  const nodeEnv = env.NODE_ENV?.trim();

  if (nodeEnv === 'production' || nodeEnv === 'preview') {
    return false;
  }

  return nodeEnv === 'development' || nodeEnv === 'test';
}

/** Requires an admin server session for developer pages, redirecting on failure. */
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

/** Returns admin session claims if dev approval is enabled, or null otherwise. */
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

/** Builds a login redirect URL with the given path as the post-login target. */
function buildLoginRedirect(loginRedirectPath: string): string {
  return `/auth/login?redirect=${loginRedirectPath}`;
}