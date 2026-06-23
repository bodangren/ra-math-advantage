import { describe, it, expect, vi } from 'vitest';
import {
  getRequestSessionClaims,
  requireRequestSessionClaims,
  requireRoleRequestClaims,
  requireActiveRequestSessionClaims,
  requireActiveRoleRequestClaims,
  getCookieValueFromHeader,
  buildRequestUnauthorizedResponse,
  buildRequestForbiddenResponse,
  buildRequestServiceUnavailableResponse,
  SESSION_COOKIE_NAME,
  signSessionToken,
} from '../index.js';

const TEST_SECRET = 'unified-auth-monorepo-test-secret';

async function signedCookie(value: { sub: string; username: string; role: 'student' | 'teacher' | 'admin' }) {
  return signSessionToken(value, TEST_SECRET);
}

describe('unified-auth-monorepo: getCookieValueFromHeader', () => {
  it('returns null on null header', () => {
    expect(getCookieValueFromHeader(null, SESSION_COOKIE_NAME)).toBeNull();
  });

  it('extracts the requested key from a multi-cookie header', () => {
    const header = `foo=bar; ${SESSION_COOKIE_NAME}=abc123; baz=qux`;
    expect(getCookieValueFromHeader(header, SESSION_COOKIE_NAME)).toBe('abc123');
  });

  it('returns null when key absent', () => {
    expect(getCookieValueFromHeader('foo=bar', SESSION_COOKIE_NAME)).toBeNull();
  });

  it('decodes URL-encoded values', () => {
    expect(getCookieValueFromHeader(`${SESSION_COOKIE_NAME}=hello%20world`, SESSION_COOKIE_NAME)).toBe(
      'hello world',
    );
  });

  it('handles malformed cookies (missing =) by skipping', () => {
    expect(getCookieValueFromHeader(`badcookie; ${SESSION_COOKIE_NAME}=valid`, SESSION_COOKIE_NAME)).toBe(
      'valid',
    );
  });
});

describe('unified-auth-monorepo: getRequestSessionClaims', () => {
  it('returns null when cookie absent', async () => {
    const req = new Request('https://example.com', { headers: { cookie: '' } });
    expect(await getRequestSessionClaims(req, TEST_SECRET)).toBeNull();
  });

  it('returns claims when token is valid', async () => {
    const token = await signedCookie({ sub: 'u-1', username: 'alice', role: 'student' });
    const req = new Request('https://example.com', { headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` } });
    const claims = await getRequestSessionClaims(req, TEST_SECRET);
    expect(claims?.sub).toBe('u-1');
    expect(claims?.role).toBe('student');
  });

  it('returns null when token is invalid', async () => {
    const req = new Request('https://example.com', {
      headers: { cookie: `${SESSION_COOKIE_NAME}=not-a-token` },
    });
    expect(await getRequestSessionClaims(req, TEST_SECRET)).toBeNull();
  });
});

describe('unified-auth-monorepo: requireRequestSessionClaims', () => {
  it('returns 401 Response when no claims', async () => {
    const req = new Request('https://example.com', { headers: { cookie: '' } });
    const result = await requireRequestSessionClaims(req, TEST_SECRET);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });

  it('returns claims when valid', async () => {
    const token = await signedCookie({ sub: 'u-1', username: 'alice', role: 'student' });
    const req = new Request('https://example.com', { headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` } });
    const result = await requireRequestSessionClaims(req, TEST_SECRET);
    expect(result).not.toBeInstanceOf(Response);
    expect((result as { sub: string }).sub).toBe('u-1');
  });
});

describe('unified-auth-monorepo: requireRoleRequestClaims', () => {
  it('returns 403 when role not in allowed list', async () => {
    const token = await signedCookie({ sub: 'u-1', username: 'alice', role: 'student' });
    const req = new Request('https://example.com', { headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` } });
    const result = await requireRoleRequestClaims(req, TEST_SECRET, ['admin']);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(403);
  });

  it('returns claims when role is in allowed list', async () => {
    const token = await signedCookie({ sub: 'u-1', username: 'alice', role: 'teacher' });
    const req = new Request('https://example.com', { headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` } });
    const result = await requireRoleRequestClaims(req, TEST_SECRET, ['teacher', 'admin']);
    expect(result).not.toBeInstanceOf(Response);
    expect((result as { role: string }).role).toBe('teacher');
  });

  it('passes through 401 from underlying requireRequestSessionClaims', async () => {
    const req = new Request('https://example.com', { headers: { cookie: '' } });
    const result = await requireRoleRequestClaims(req, TEST_SECRET, ['student']);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });
});

describe('unified-auth-monorepo: requireActiveRequestSessionClaims', () => {
  it('returns 401 when no claims', async () => {
    const req = new Request('https://example.com', { headers: { cookie: '' } });
    const verifier = vi.fn();
    const result = await requireActiveRequestSessionClaims(req, TEST_SECRET, verifier);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
    expect(verifier).not.toHaveBeenCalled();
  });

  it('returns claims when verifier says active', async () => {
    const token = await signedCookie({ sub: 'u-1', username: 'alice', role: 'student' });
    const req = new Request('https://example.com', { headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` } });
    const verifier = vi.fn().mockResolvedValue(true);
    const result = await requireActiveRequestSessionClaims(req, TEST_SECRET, verifier);
    expect(result).not.toBeInstanceOf(Response);
    expect(verifier).toHaveBeenCalledWith({ sub: 'u-1', username: 'alice', role: 'student' });
  });

  it('returns 401 when verifier says inactive (existence-only)', async () => {
    const token = await signedCookie({ sub: 'u-1', username: 'alice', role: 'student' });
    const req = new Request('https://example.com', { headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` } });
    const verifier = vi.fn().mockResolvedValue(false);
    const result = await requireActiveRequestSessionClaims(req, TEST_SECRET, verifier);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });

  it('returns 503 when verifier throws', async () => {
    const token = await signedCookie({ sub: 'u-1', username: 'alice', role: 'student' });
    const req = new Request('https://example.com', { headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` } });
    const verifier = vi.fn().mockRejectedValue(new Error('Convex down'));
    const result = await requireActiveRequestSessionClaims(req, TEST_SECRET, verifier);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(503);
  });
});

describe('unified-auth-monorepo: requireActiveRoleRequestClaims', () => {
  it('returns 401 when no claims', async () => {
    const req = new Request('https://example.com', { headers: { cookie: '' } });
    const verifier = vi.fn();
    const result = await requireActiveRoleRequestClaims(req, TEST_SECRET, ['student'], verifier);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });

  it('returns 403 when role not in allowed list', async () => {
    const token = await signedCookie({ sub: 'u-1', username: 'alice', role: 'student' });
    const req = new Request('https://example.com', { headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` } });
    const verifier = vi.fn().mockResolvedValue(true);
    const result = await requireActiveRoleRequestClaims(req, TEST_SECRET, ['teacher', 'admin'], verifier);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(403);
  });

  it('returns claims when active and role allowed', async () => {
    const token = await signedCookie({ sub: 'u-1', username: 'alice', role: 'teacher' });
    const req = new Request('https://example.com', { headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` } });
    const verifier = vi.fn().mockResolvedValue(true);
    const result = await requireActiveRoleRequestClaims(req, TEST_SECRET, ['teacher', 'admin'], verifier);
    expect(result).not.toBeInstanceOf(Response);
    expect((result as { role: string }).role).toBe('teacher');
  });
});

describe('unified-auth-monorepo: response builders', () => {
  it('buildRequestUnauthorizedResponse defaults to 401 with "Unauthorized"', async () => {
    const r = buildRequestUnauthorizedResponse();
    expect(r.status).toBe(401);
    expect(await r.json()).toEqual({ error: 'Unauthorized' });
  });

  it('buildRequestForbiddenResponse defaults to 403 with "Forbidden"', async () => {
    const r = buildRequestForbiddenResponse();
    expect(r.status).toBe(403);
    expect(await r.json()).toEqual({ error: 'Forbidden' });
  });

  it('buildRequestServiceUnavailableResponse defaults to 503', async () => {
    const r = buildRequestServiceUnavailableResponse();
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: 'Service temporarily unavailable' });
  });
});
