import { SESSION_COOKIE_NAME } from './constants';
import { SessionClaims } from './session';

export type RequestGuardResult = SessionClaims | Response;

export type ActiveCredentialVerifier = (claims: SessionClaims) => Promise<boolean>;

export type SessionTokenVerifier = (token: string) => Promise<SessionClaims | null>;

/**
 * Parses a cookie header string and extracts the value for the given key.
 * Returns null when the header is null/empty or the key is absent.
 */
export function getCookieValueFromHeader(cookieHeader: string | null, key: string): string | null {
  if (!cookieHeader) return null;

  const entries = cookieHeader.split(';');
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (!trimmed) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) continue;

    const name = trimmed.slice(0, separatorIndex).trim();
    if (name !== key) continue;

    try {
      return decodeURIComponent(trimmed.slice(separatorIndex + 1));
    } catch {
      return null;
    }
  }

  return null;
}

/** Creates a 401 Unauthorized JSON response with the given message. */
export function buildRequestUnauthorizedResponse(message = 'Unauthorized'): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });
}

/** Creates a 403 Forbidden JSON response with the given message. */
export function buildRequestForbiddenResponse(message = 'Forbidden'): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'content-type': 'application/json' },
  });
}

/** Creates a 503 Service Unavailable JSON response with the given message. */
export function buildRequestServiceUnavailableResponse(
  message = 'Service temporarily unavailable',
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 503,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * Reads session claims from a request cookie header using the supplied verifier.
 * The verifier is app-supplied so the test suite can mock it via local re-exports.
 */
export async function getRequestSessionClaims(
  request: Request,
  verifyToken: SessionTokenVerifier,
  cookieName: string = SESSION_COOKIE_NAME,
): Promise<SessionClaims | null> {
  const token = getCookieValueFromHeader(request.headers.get('cookie'), cookieName);
  if (!token) return null;

  return verifyToken(token);
}

/**
 * Requires an authenticated request session.
 * Returns claims on success, or a 401 Response when absent.
 */
export async function requireRequestSessionClaims(
  request: Request,
  verifyToken: SessionTokenVerifier,
  options: {
    cookieName?: string;
    unauthorizedMessage?: string;
  } = {},
): Promise<RequestGuardResult> {
  const claims = await getRequestSessionClaims(request, verifyToken, options.cookieName);
  if (!claims) {
    return buildRequestUnauthorizedResponse(options.unauthorizedMessage);
  }

  return claims;
}

/**
 * Requires a request session whose role is in the allowed list.
 * Returns 401 (from underlying guard) or 403 (role mismatch) Response, or claims.
 */
export async function requireRoleRequestClaims(
  request: Request,
  verifyToken: SessionTokenVerifier,
  allowedRoles: ReadonlyArray<SessionClaims['role']>,
  options: {
    cookieName?: string;
    unauthorizedMessage?: string;
    forbiddenMessage?: string;
  } = {},
): Promise<RequestGuardResult> {
  const claimsOrResponse = await requireRequestSessionClaims(request, verifyToken, options);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  if (!allowedRoles.includes(claimsOrResponse.role)) {
    return buildRequestForbiddenResponse(options.forbiddenMessage);
  }

  return claimsOrResponse;
}

/**
 * Requires a request session with an active (non-deactivated) credential.
 * The verifier is app-specific (BM2: existence only; IM3: existence + isActive).
 * Returns 401 if session is missing or credential is inactive, 503 if verifier throws.
 */
export async function requireActiveRequestSessionClaims(
  request: Request,
  verifyToken: SessionTokenVerifier,
  verifyActive: ActiveCredentialVerifier,
  options: {
    cookieName?: string;
    unauthorizedMessage?: string;
    serviceUnavailableMessage?: string;
  } = {},
): Promise<RequestGuardResult> {
  const claimsOrResponse = await requireRequestSessionClaims(request, verifyToken, options);
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  try {
    const isActive = await verifyActive(claimsOrResponse);
    if (!isActive) {
      return buildRequestUnauthorizedResponse(options.unauthorizedMessage);
    }
    return claimsOrResponse;
  } catch {
    return buildRequestServiceUnavailableResponse(options.serviceUnavailableMessage);
  }
}

/**
 * Requires a request session with active credential and role in the allowed list.
 */
export async function requireActiveRoleRequestClaims(
  request: Request,
  verifyToken: SessionTokenVerifier,
  allowedRoles: ReadonlyArray<SessionClaims['role']>,
  verifyActive: ActiveCredentialVerifier,
  options: {
    cookieName?: string;
    unauthorizedMessage?: string;
    forbiddenMessage?: string;
    serviceUnavailableMessage?: string;
  } = {},
): Promise<RequestGuardResult> {
  const claimsOrResponse = await requireActiveRequestSessionClaims(
    request,
    verifyToken,
    verifyActive,
    options,
  );
  if (claimsOrResponse instanceof Response) {
    return claimsOrResponse;
  }

  if (!allowedRoles.includes(claimsOrResponse.role)) {
    return buildRequestForbiddenResponse(options.forbiddenMessage);
  }

  return claimsOrResponse;
}
