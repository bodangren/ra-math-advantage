import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const serverSrc = readFileSync(
  resolve(here, '../../../lib/auth/server.ts'),
  'utf8',
);
const techDebtSrc = readFileSync(
  resolve(here, '../../../../../measure/tech-debt.md'),
  'utf8',
);

// ---------------------------------------------------------------------------
// Task 5.1 — FR-14 arch-lint: IM3 server.ts composes core-auth
//
// At HEAD (d023ce7b) the IM3 server retains inline getCookieValueFromHeader
// (lines 14-36) and the inline 401/403/503 response builders (lines 39-51).
// No core-auth request-guard exports are imported. These tests fail at
// HEAD and pass after the Green refactor.
//
// Per FR-20, the architectural contract for FR-14 IS the import surface;
// the source-grep is the contract, not a parity oracle. The behavioral
// complement is in Task 5.2 below.
// ---------------------------------------------------------------------------

describe('IM3 auth server composition (FR-14) — arch-lint', () => {
  it('imports requireRequestSessionClaims from @math-platform/core-auth', () => {
    expect(serverSrc).toMatch(
      /import\s*\{[^}]*\brequireRequestSessionClaims\b[^}]*\}\s*from\s*['"]@math-platform\/core-auth['"]/,
    );
  });

  it('imports requireRoleRequestClaims from @math-platform/core-auth', () => {
    expect(serverSrc).toMatch(
      /import\s*\{[^}]*\brequireRoleRequestClaims\b[^}]*\}\s*from\s*['"]@math-platform\/core-auth['"]/,
    );
  });

  it('imports requireActiveRequestSessionClaims from @math-platform/core-auth', () => {
    expect(serverSrc).toMatch(
      /import\s*\{[^}]*\brequireActiveRequestSessionClaims\b[^}]*\}\s*from\s*['"]@math-platform\/core-auth['"]/,
    );
  });

  it('imports getRequestSessionClaims from @math-platform/core-auth', () => {
    expect(serverSrc).toMatch(
      /import\s*\{[^}]*\bgetRequestSessionClaims\b[^}]*\}\s*from\s*['"]@math-platform\/core-auth['"]/,
    );
  });

  it('imports buildRequestUnauthorizedResponse from @math-platform/core-auth', () => {
    expect(serverSrc).toMatch(
      /import\s*\{[^}]*\bbuildRequestUnauthorizedResponse\b[^}]*\}\s*from\s*['"]@math-platform\/core-auth['"]/,
    );
  });

  it('imports buildRequestForbiddenResponse from @math-platform/core-auth', () => {
    expect(serverSrc).toMatch(
      /import\s*\{[^}]*\bbuildRequestForbiddenResponse\b[^}]*\}\s*from\s*['"]@math-platform\/core-auth['"]/,
    );
  });

  it('imports buildRequestServiceUnavailableResponse from @math-platform/core-auth', () => {
    expect(serverSrc).toMatch(
      /import\s*\{[^}]*\bbuildRequestServiceUnavailableResponse\b[^}]*\}\s*from\s*['"]@math-platform\/core-auth['"]/,
    );
  });

  it('does not redeclare the inline getCookieValueFromHeader helper', () => {
    expect(serverSrc).not.toMatch(/function\s+getCookieValueFromHeader\s*\(/);
  });

  it('does not redeclare the inline buildRequestUnauthorizedResponse helper', () => {
    expect(serverSrc).not.toMatch(/function\s+buildRequestUnauthorizedResponse\s*\(/);
  });

  it('does not redeclare the inline buildRequestForbiddenResponse helper', () => {
    expect(serverSrc).not.toMatch(/function\s+buildRequestForbiddenResponse\s*\(/);
  });

  it('does not redeclare the inline buildRequestServiceUnavailableResponse helper', () => {
    expect(serverSrc).not.toMatch(/function\s+buildRequestServiceUnavailableResponse\s*\(/);
  });
});

// ---------------------------------------------------------------------------
// Task 5.2 — FR-14 test harness stubs the new core-auth exports
//
// The IM3 auth test harness must mock the new core-auth request-guard
// exports. The behavioral proof is end-to-end: a test that stubs the
// new export, calls the IM3 function, and asserts the mock was reached
// + the Response propagates. At HEAD, the IM3 server has no
// `requireActiveRequestSessionClaims` import (or any other new export),
// so the mock is never called and the assertions fail.
// ---------------------------------------------------------------------------

const mockGetRequestSessionClaims = vi.fn();
const mockRequireRequestSessionClaims = vi.fn();
const mockRequireRoleRequestClaims = vi.fn();
const mockRequireActiveRequestSessionClaims = vi.fn();
const mockBuildRequestUnauthorizedResponse = vi.fn(
  (msg = 'Unauthorized') =>
    new Response(JSON.stringify({ error: msg }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    }),
);
const mockBuildRequestForbiddenResponse = vi.fn(
  (msg = 'Forbidden') =>
    new Response(JSON.stringify({ error: msg }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    }),
);
const mockBuildRequestServiceUnavailableResponse = vi.fn(
  (msg = 'Service unavailable') =>
    new Response(JSON.stringify({ error: msg }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    }),
);

vi.mock('@math-platform/core-auth', async () => {
  const actual = await vi.importActual<typeof import('@math-platform/core-auth')>(
    '@math-platform/core-auth',
  );
  return {
    ...actual,
    SESSION_COOKIE_NAME: 'session',
    getAuthJwtSecret: () => 'test-secret',
    getRequestSessionClaims: mockGetRequestSessionClaims,
    requireRequestSessionClaims: mockRequireRequestSessionClaims,
    requireRoleRequestClaims: mockRequireRoleRequestClaims,
    requireActiveRequestSessionClaims: mockRequireActiveRequestSessionClaims,
    buildRequestUnauthorizedResponse: mockBuildRequestUnauthorizedResponse,
    buildRequestForbiddenResponse: mockBuildRequestForbiddenResponse,
    buildRequestServiceUnavailableResponse: mockBuildRequestServiceUnavailableResponse,
  };
});

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: vi.fn(),
  internal: {
    auth: {
      getCredentialByUsername: 'auth:getCredentialByUsername',
    },
  },
}));

const makeRequest = (cookie?: string) =>
  new Request('http://localhost/api/test', {
    headers: cookie ? { cookie } : {},
  });

describe('IM3 auth server composition (FR-14) — delegation to core-auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requireActiveRequestSessionClaims delegates to core-auth and propagates a 503 Response', async () => {
    const serviceUnavailable = mockBuildRequestServiceUnavailableResponse(
      'Service unavailable',
    );
    mockRequireActiveRequestSessionClaims.mockResolvedValue(serviceUnavailable);

    const { requireActiveRequestSessionClaims } = await import('@/lib/auth/server');
    const result = await requireActiveRequestSessionClaims(makeRequest('session=tok'));

    expect(mockRequireActiveRequestSessionClaims).toHaveBeenCalledTimes(1);
    expect(result).toBe(serviceUnavailable);
  });

  it('requireStudentRequestClaims delegates to requireRoleRequestClaims for [student]', async () => {
    const claims = {
      sub: 'p1',
      username: 'alice',
      role: 'student' as const,
      iat: 1,
      exp: 9999999999,
    };
    mockRequireRoleRequestClaims.mockResolvedValue(claims);

    const { requireStudentRequestClaims } = await import('@/lib/auth/server');
    const result = await requireStudentRequestClaims(makeRequest('session=tok'));

    expect(mockRequireRoleRequestClaims).toHaveBeenCalledTimes(1);
    expect(result).toEqual(claims);
  });

  it('requireTeacherRequestClaims delegates to requireRoleRequestClaims for [teacher, admin]', async () => {
    const claims = {
      sub: 'p1',
      username: 'alice',
      role: 'teacher' as const,
      iat: 1,
      exp: 9999999999,
    };
    mockRequireRoleRequestClaims.mockResolvedValue(claims);

    const { requireTeacherRequestClaims } = await import('@/lib/auth/server');
    const result = await requireTeacherRequestClaims(makeRequest('session=tok'));

    expect(mockRequireRoleRequestClaims).toHaveBeenCalledTimes(1);
    expect(result).toEqual(claims);
  });

  it('requireRequestSessionClaims delegates to core-auth', async () => {
    const claims = {
      sub: 'p1',
      username: 'alice',
      role: 'student' as const,
      iat: 1,
      exp: 9999999999,
    };
    mockRequireRequestSessionClaims.mockResolvedValue(claims);

    const { requireRequestSessionClaims } = await import('@/lib/auth/server');
    const result = await requireRequestSessionClaims(makeRequest('session=tok'));

    expect(mockRequireRequestSessionClaims).toHaveBeenCalledTimes(1);
    expect(result).toEqual(claims);
  });
});

// ---------------------------------------------------------------------------
// Task 5.3 — FR-14 tech-debt entry is Resolved
//
// Per spec FR-14 AC13 and the spec.md "no silent drops" rule, the
// matching tech-debt row must be marked Resolved with a closing-commit
// note. The registry text is the source of truth. At HEAD the row is
// Open; after Green it is Resolved.
// ---------------------------------------------------------------------------

describe('IM3 auth server composition (FR-14) — tech-debt registry', () => {
  it('IM3 auth wrapper inline duplication entry is Resolved', () => {
    const rowMatch = techDebtSrc.match(
      /IM3 auth wrapper inline duplication\s*\|\s*Medium\s*\|\s*(Open|Resolved)\s*\|/,
    );
    expect(rowMatch, 'FR-14 tech-debt row must be present').not.toBeNull();
    expect(rowMatch![1]).toBe('Resolved');
  });
});
