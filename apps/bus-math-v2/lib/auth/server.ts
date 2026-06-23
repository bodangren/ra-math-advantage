import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE_NAME, getAuthJwtSecret } from '@/lib/auth/constants';
import { verifySessionToken, type SessionClaims } from '@/lib/auth/session';

import {
  type ActiveCredentialVerifier,
  getRequestSessionClaims as _getRequestSessionClaims,
  requireRequestSessionClaims as _requireRequestSessionClaims,
  requireRoleRequestClaims as _requireRoleRequestClaims,
  requireActiveRequestSessionClaims as _requireActiveRequestSessionClaims,
  buildRequestUnauthorizedResponse,
  buildRequestForbiddenResponse,
  buildRequestServiceUnavailableResponse,
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

function buildLoginRedirect(loginRedirectPath: string): string {
  return `${APP_LOGIN_PATH_PREFIX}?redirect=${loginRedirectPath}`;
}

export async function requireServerSessionClaims(loginRedirectPath: string): Promise<SessionClaims> {
  const claims = await getServerSessionClaims();
  if (!claims) {
    redirect(buildLoginRedirect(loginRedirectPath));
  }

  return claims;
}

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

export async function requireTeacherSessionClaims(
  loginRedirectPath: string,
  unauthorizedRedirectPath: string = APP_DEFAULT_TEACHER_UNAUTHORIZED_REDIRECT,
): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);
  return requireServerRoles(claims, ['teacher', 'admin'], unauthorizedRedirectPath);
}

export async function requireStudentSessionClaims(loginRedirectPath: string): Promise<SessionClaims> {
  const claims = await requireServerSessionClaims(loginRedirectPath);

  if (claims.role === 'student') {
    return claims;
  }

  if (claims.role === 'teacher' || claims.role === 'admin') {
    redirect('/teacher');
  }

  redirect(buildLoginRedirect(loginRedirectPath));
}

const verifyActiveCredential: ActiveCredentialVerifier = async (claims) => {
  const credential = await fetchInternalQuery(internal.auth.getCredentialByUsername, {
    username: claims.username,
  });
  return credential !== null;
};

export async function requireActiveRequestSessionClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
): Promise<SessionClaims | Response> {
  return _requireActiveRequestSessionClaims(request, verifyToken, verifyActiveCredential, {
    cookieName: SESSION_COOKIE_NAME,
    unauthorizedMessage,
    serviceUnavailableMessage: 'Credential verification temporarily unavailable',
  });
}

export async function requireActiveStudentRequestClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
  forbiddenMessage = 'Forbidden',
): Promise<SessionClaims | Response> {
  const result = await requireActiveRequestSessionClaims(request, unauthorizedMessage);
  if (result instanceof Response) return result;
  if (result.role !== 'student') {
    return buildRequestForbiddenResponse(forbiddenMessage);
  }
  return result;
}

export async function requireActiveTeacherRequestClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
  forbiddenMessage = 'Forbidden',
): Promise<SessionClaims | Response> {
  const result = await requireActiveRequestSessionClaims(request, unauthorizedMessage);
  if (result instanceof Response) return result;
  if (result.role !== 'teacher' && result.role !== 'admin') {
    return buildRequestForbiddenResponse(forbiddenMessage);
  }
  return result;
}

export async function getRequestSessionClaims(request: Request): Promise<SessionClaims | null> {
  return _getRequestSessionClaims(request, verifyToken, SESSION_COOKIE_NAME);
}

export async function requireRequestSessionClaims(
  request: Request,
  unauthorizedMessage = 'Unauthorized',
): Promise<SessionClaims | Response> {
  return _requireRequestSessionClaims(request, verifyToken, {
    cookieName: SESSION_COOKIE_NAME,
    unauthorizedMessage,
  });
}

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

export async function requireAdminRequestClaims(
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
