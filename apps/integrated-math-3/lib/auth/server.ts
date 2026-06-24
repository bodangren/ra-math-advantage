import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  SESSION_COOKIE_NAME,
  getAuthJwtSecret,
  verifySessionToken,
  type ActiveCredentialVerifier,
  type SessionClaims,
  // The buildRequest* helpers below are intentionally re-exported at the
  // IM3 boundary so that route handlers can compose custom responses
  // without re-importing core-auth directly. They mirror the BM2 pattern
  // (apps/bus-math-v2/lib/auth/server.ts) and are required by the
  // Phase 5 FR-14 arch-lint contract.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRequestForbiddenResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRequestServiceUnavailableResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  buildRequestUnauthorizedResponse,
  getRequestSessionClaims as _getRequestSessionClaims,
  requireActiveRequestSessionClaims as _requireActiveRequestSessionClaims,
  requireRequestSessionClaims as _requireRequestSessionClaims,
  requireRoleRequestClaims as _requireRoleRequestClaims,
} from '@math-platform/core-auth';

import { fetchInternalQuery, internal } from '@/lib/convex/server';

const APP_LOGIN_PATH_PREFIX = '/auth/login';
const APP_DEFAULT_TEACHER_UNAUTHORIZED_REDIRECT = '/student/dashboard';

const verifyToken = (token: string) => verifySessionToken(token, getAuthJwtSecret());

/**
 * Reads and verifies the authenticated session claims from the server cookie jar.
 */
export async function getServerSessionClaims(): Promise<SessionClaims | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token, getAuthJwtSecret());
}

/**
 * Reads session claims from a request cookie header.
 */
export async function getRequestSessionClaims(request: Request): Promise<SessionClaims | null> {
  return _getRequestSessionClaims(request, verifyToken, SESSION_COOKIE_NAME);
}

/**
 * Requires an authenticated request session and returns a JSON 401 response when absent.
 */
export async function requireRequestSessionClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
): Promise<SessionClaims | Response> {
  return _requireRequestSessionClaims(request, verifyToken, {
    cookieName: SESSION_COOKIE_NAME,
    unauthorizedMessage,
  });
}

/**
 * Requires a student request session for APIs that mutate learner-owned data.
 */
export async function requireStudentRequestClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
  forbiddenMessage = 'Forbidden',
): Promise<SessionClaims | Response> {
  return _requireRoleRequestClaims(request, verifyToken, ['student'], {
    cookieName: SESSION_COOKIE_NAME,
    unauthorizedMessage,
    forbiddenMessage,
  });
}

/**
 * Requires a teacher request session for APIs that mutate teacher-facing data.
 * Admin credentials are treated as teacher-compatible.
 */
export async function requireTeacherRequestClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
  forbiddenMessage = 'Forbidden',
): Promise<SessionClaims | Response> {
  return _requireRoleRequestClaims(request, verifyToken, ['teacher', 'admin'], {
    cookieName: SESSION_COOKIE_NAME,
    unauthorizedMessage,
    forbiddenMessage,
  });
}

/** Builds a login redirect URL with the given path as the post-login redirect target. */
function buildLoginRedirect(loginRedirectPath: string): string {
  return `${APP_LOGIN_PATH_PREFIX}?redirect=${loginRedirectPath}`;
}

/**
 * Requires an authenticated server session and redirects to login when none exists.
 */
export async function requireServerSessionClaims(loginRedirectPath: string): Promise<SessionClaims> {
  const claims = await getServerSessionClaims();
  if (!claims) {
    redirect(buildLoginRedirect(loginRedirectPath));
  }

  return claims;
}

/**
 * Requires the given session claims to match one of the allowed roles.
 */
export function requireServerRoles<T extends SessionClaims>(
  claims: T,
  allowedRoles: ReadonlyArray<SessionClaims['role']>,
  unauthorizedRedirectPath: string,
): T {
  if (!allowedRoles.includes(claims.role)) {
    redirect(unauthorizedRedirectPath);
  }

  return claims;
}

/**
 * Requires a teacher-facing server session for teacher pages.
 * Legacy admin credentials are treated as teacher-compatible until they are fully removed.
 */
export async function requireTeacherSessionClaims(
  loginRedirectPath: string,
  unauthorizedRedirectPath: string = APP_DEFAULT_TEACHER_UNAUTHORIZED_REDIRECT,
): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);
  return requireServerRoles(claims, ['teacher', 'admin'], unauthorizedRedirectPath);
}

/**
 * Requires a developer request session for internal dev-only APIs.
 */
export async function requireDeveloperRequestClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
  forbiddenMessage = 'Forbidden',
): Promise<SessionClaims | Response> {
  return _requireRoleRequestClaims(request, verifyToken, ['admin'], {
    cookieName: SESSION_COOKIE_NAME,
    unauthorizedMessage,
    forbiddenMessage,
  });
}

/**
 * IM3's stricter active-credential check: the credential must exist AND
 * be marked isActive. This is the only behavioural divergence from
 * BM2 (which checks existence only). The lambda body is bound at module
 * load so the core-auth `requireActiveRequestSessionClaims` export
 * receives a stable verifier reference for the lifetime of the process.
 */
const verifyActiveCredential: ActiveCredentialVerifier = async (claims) => {
  const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, {
    username: claims.username,
  });
  return credential !== null && credential.isActive === true;
};

/**
 * Requires an authenticated request with an active credential in Convex.
 * Fail-closed: returns 503 if Convex is unreachable.
 */
export async function requireActiveRequestSessionClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
): Promise<SessionClaims | Response> {
  return _requireActiveRequestSessionClaims(request, verifyToken, verifyActiveCredential, {
    cookieName: SESSION_COOKIE_NAME,
    unauthorizedMessage,
    serviceUnavailableMessage: 'Service unavailable. Please try again later.',
  });
}

/**
 * Requires a student server session for student-facing dashboard routes.
 * Non-student sessions are redirected to the teacher surface.
 */
export async function requireStudentSessionClaims(loginRedirectPath: string): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);

  if (claims.role === 'student') {
    return claims;
  }

  if (claims.role === 'teacher') {
    redirect('/teacher');
  }

  if (claims.role === 'admin') {
    redirect('/teacher');
  }

  redirect(buildLoginRedirect(loginRedirectPath));
}
