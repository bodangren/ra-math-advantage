// Phase 1.1 — Parent role widening + fail-closed parent guards (Red phase, TDD).
//
// Contract under test (per spec.md FR1 + AC1 and test-strategy.md §5):
//
//   "A `parent` role in the auth model with fail-closed guards;
//    parents see only linked students."
//
// Concretely:
//   1. The `UserRole` type in `packages/core-auth/src/session.ts` must widen
//      from `'student' | 'teacher' | 'admin'` to also include `'parent'`.
//   2. A new request-scoped guard `requireParentRequestClaims(request, studentId)`
//      must:
//        a. return a 401 JSON response when the session cookie is missing or
//           invalid (no authenticated claims),
//        b. return a 403 JSON response when the authenticated session is not a
//           parent (fail-closed role check),
//        c. return a 403 JSON response when the parent is authenticated but the
//           requested `studentId` does not have an active link in the
//           `parent_links` Convex table (fail-closed link check),
//        d. return the parent claims verbatim when the parent is authenticated
//           AND an active `parent_links` row exists for the requested student.
//   3. A new redirect-based server guard `requireParentServerSessionClaims`
//      must:
//        a. redirect unauthenticated requests to the login surface,
//        b. redirect non-parent roles to the appropriate surface,
//        c. return parent claims verbatim when the role is 'parent'.
//
// Red signal (per test-strategy.md §7, Phase 1 red command):
//   `npm run ws:im3:test -- __tests__/lib/auth/parent-role-guard.test.ts`
// All value imports from `@/lib/auth/parent-server-guards` and `@math-platform/core-auth`
// widen-target are intentional and force a module-resolution / type-narrowing
// failure today. The harness mirrors `__tests__/lib/auth/server-guards.test.ts`
// (verified Green pattern), so the same fixtures and mock pattern are reused.

import { describe, it, expect, expectTypeOf, vi, beforeEach, afterEach } from 'vitest';

import type { SessionClaims, UserRole } from '@math-platform/core-auth';

// ---------------------------------------------------------------------------
// Adversarial Audit (2026-06-19): real behavior tests for
// requireParentServerSessionClaims. The original Phase-1 Green suite only
// asserted "is a function" / "is async" (smoke tests that pass even for a
// stub that throws). Those are the "documentation assertions standing in
// for live gate proof" pattern. This block wires next/headers + next/navigation
// mocks (the actual surfaces the guard calls) and proves:
//   (a) missing cookie → redirects to /auth/login?redirect=<path>
//   (b) invalid token → redirects to /auth/login?redirect=<path>
//   (c) non-parent role → redirects to /auth/login?redirect=<path>
//   (d) parent role → returns the parent claims verbatim
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Mocks (mirrors __tests__/lib/auth/server-guards.test.ts)
// ---------------------------------------------------------------------------

const mockVerifySessionToken = vi.fn();
const mockGetAuthJwtSecret = vi.fn(() => 'test-secret');
const mockFetchInternalQuery = vi.fn();

vi.mock('@math-platform/core-auth', async () => {
  const actual =
    await vi.importActual<typeof import('@math-platform/core-auth')>('@math-platform/core-auth');
  return {
    ...actual,
    verifySessionToken: mockVerifySessionToken,
    SESSION_COOKIE_NAME: 'session',
    getAuthJwtSecret: mockGetAuthJwtSecret,
  };
});

vi.mock('@/lib/convex/server', () => ({
  fetchInternalQuery: mockFetchInternalQuery,
  internal: {
    parent: {
      links: {
        listParentLinksQuery: 'parent:links:listParentLinksQuery',
      },
    },
  },
}));

const makeRequest = (cookie?: string) =>
  new Request('http://localhost/api/parent/dashboard', {
    headers: cookie ? { cookie } : {},
  });

// ---------------------------------------------------------------------------
// Type-level invariants (AC1 surface) — fail at TypeScript compile time if
// UserRole does not include the parent literal. expectTypeOf is compile-time;
// vite-node will fail to transform the file if the type narrowing is wrong,
// surfacing as a Red.
// ---------------------------------------------------------------------------

describe('UserRole widening (parent)', () => {
  it('UserRole is assignable from the literal "parent"', () => {
    expectTypeOf<'parent'>().toMatchTypeOf<UserRole>();
  });

  it('UserRole still includes the existing roles (no regression)', () => {
    expectTypeOf<'student'>().toMatchTypeOf<UserRole>();
    expectTypeOf<'teacher'>().toMatchTypeOf<UserRole>();
    expectTypeOf<'admin'>().toMatchTypeOf<UserRole>();
  });

  it('SessionClaims["role"] is the widened UserRole', () => {
    expectTypeOf<SessionClaims['role']>().toEqualTypeOf<UserRole>();
  });
});

// ---------------------------------------------------------------------------
// Runtime helper — construct a parent claim without type-level leakage.
// Today UserRole does not include 'parent', so we cast at the boundary to
// exercise runtime behavior. The runtime check verifies the function under
// test is generic over the role and behaves correctly when role='parent'.
// ---------------------------------------------------------------------------

function makeParentClaim(): SessionClaims {
  return {
    sub: 'parent_profile_1',
    username: 'parent.test',
    role: 'parent' as unknown as SessionClaims['role'],
    iat: 1,
    exp: 9_999_999_999,
  };
}

function makeNonParentClaim(role: 'student' | 'teacher' | 'admin'): SessionClaims {
  return {
    sub: `${role}_profile_1`,
    username: `${role}.test`,
    role,
    iat: 1,
    exp: 9_999_999_999,
  };
}

// ---------------------------------------------------------------------------
// requireParentRequestClaims — request-scoped, returns Response | SessionClaims
// ---------------------------------------------------------------------------

describe('requireParentRequestClaims', () => {
  type ParentGuardFn = (request: Request, studentId: string) => Promise<SessionClaims | Response>;
  let requireParentRequestClaims: ParentGuardFn;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/lib/auth/parent-server-guards');
    requireParentRequestClaims = mod.requireParentRequestClaims;
  });

  it('returns 401 when no cookie is present', async () => {
    const res = await requireParentRequestClaims(makeRequest(), 'student_1');
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it('returns 401 when token verification fails', async () => {
    mockVerifySessionToken.mockResolvedValue(null);
    const res = await requireParentRequestClaims(makeRequest('session=bad-token'), 'student_1');
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });

  it('returns 403 when the authenticated session is a student (fail-closed role)', async () => {
    mockVerifySessionToken.mockResolvedValue(makeNonParentClaim('student'));
    const res = await requireParentRequestClaims(makeRequest('session=valid-token'), 'student_1');
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
  });

  it('returns 403 when the authenticated session is a teacher (fail-closed role)', async () => {
    mockVerifySessionToken.mockResolvedValue(makeNonParentClaim('teacher'));
    const res = await requireParentRequestClaims(makeRequest('session=valid-token'), 'student_1');
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
  });

  it('returns 403 when the authenticated session is an admin (fail-closed role)', async () => {
    mockVerifySessionToken.mockResolvedValue(makeNonParentClaim('admin'));
    const res = await requireParentRequestClaims(makeRequest('session=valid-token'), 'student_1');
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
  });

  it('returns 403 when a parent session has no active link to the requested student', async () => {
    mockVerifySessionToken.mockResolvedValue(makeParentClaim());
    mockFetchInternalQuery.mockResolvedValue([]); // no active links
    const res = await requireParentRequestClaims(makeRequest('session=valid-token'), 'student_1');
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
    expect(mockFetchInternalQuery).toHaveBeenCalledWith(
      'parent:links:listParentLinksQuery',
      expect.objectContaining({ parentProfileId: 'parent_profile_1' }),
    );
  });

  it('returns 403 when only revoked links exist for the requested student', async () => {
    mockVerifySessionToken.mockResolvedValue(makeParentClaim());
    mockFetchInternalQuery.mockResolvedValue([
      { studentId: 'student_1', status: 'revoked' },
    ]);
    const res = await requireParentRequestClaims(makeRequest('session=valid-token'), 'student_1');
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(403);
  });

  it('returns the parent claims when an active link exists for the requested student', async () => {
    const claims = makeParentClaim();
    mockVerifySessionToken.mockResolvedValue(claims);
    mockFetchInternalQuery.mockResolvedValue([
      { studentId: 'student_1', status: 'active' },
    ]);
    const res = await requireParentRequestClaims(makeRequest('session=valid-token'), 'student_1');
    expect(res).toEqual(claims);
  });

  it('returns 401 (does not throw) when the session cookie value has malformed percent-encoding', async () => {
    // Adversarial boundary: a malicious or truncated client could send
    // `session=%ZZ` (invalid percent escape). The internal cookie parser
    // calls decodeURIComponent on the value, which throws URIError on bad
    // input. The guard must convert that into a 401, not propagate the
    // throw (which would surface as a 500 in Next.js).
    const res = await requireParentRequestClaims(
      makeRequest('session=%ZZ'),
      'student_1',
    );
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// requireParentServerSessionClaims — page-level, redirect-based
// ---------------------------------------------------------------------------

describe('requireParentServerSessionClaims', () => {
  type ParentServerGuardFn = (loginRedirectPath: string) => Promise<SessionClaims>;
  let requireParentServerSessionClaims: ParentServerGuardFn;

  // The guard calls next/headers (cookies()), next/navigation (redirect), and
  // @math-platform/core-auth (verifySessionToken, getAuthJwtSecret). All four
  // are mocked here so the test exercises the real guard, not a stub.
  const mockCookieGet = vi.fn();
  const mockRedirect = vi.fn((href: string) => {
    // next/navigation's redirect throws a sentinel error; the guard propagates
    // it. Tests assert via mockRedirect.mock.calls.
    const err = new Error(`NEXT_REDIRECT:${href}`);
    (err as Error & { __isRedirect: true }).__isRedirect = true;
    throw err;
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    // vi.doMock only takes effect for subsequent dynamic imports; the guard
    // module was already loaded by an earlier `requireParentRequestClaims`
    // describe block, so its cached `next/headers` and `next/navigation`
    // bindings still point at the unmocked real modules. vi.resetModules
    // forces a fresh import of the guard with the new mocks in place.
    vi.resetModules();
    vi.doMock('next/headers', () => ({
      cookies: () => Promise.resolve({ get: mockCookieGet }),
    }));
    vi.doMock('next/navigation', () => ({
      redirect: mockRedirect,
    }));
    const mod = await import('@/lib/auth/parent-server-guards');
    requireParentServerSessionClaims = mod.requireParentServerSessionClaims;
  });

  afterEach(() => {
    vi.doUnmock('next/headers');
    vi.doUnmock('next/navigation');
    vi.resetModules();
  });

  it('redirects to /auth/login?redirect=<path> when no session cookie is present', async () => {
    mockCookieGet.mockReturnValue(undefined);
    await expect(requireParentServerSessionClaims('/parent/dashboard')).rejects.toMatchObject({
      message: 'NEXT_REDIRECT:/auth/login?redirect=/parent/dashboard',
    });
    expect(mockRedirect).toHaveBeenCalledWith('/auth/login?redirect=/parent/dashboard');
  });

  it('redirects to /auth/login?redirect=<path> when the token fails to verify', async () => {
    mockCookieGet.mockReturnValue({ value: 'bad-token' });
    mockVerifySessionToken.mockResolvedValue(null);
    await expect(requireParentServerSessionClaims('/parent/dashboard')).rejects.toMatchObject({
      message: 'NEXT_REDIRECT:/auth/login?redirect=/parent/dashboard',
    });
    expect(mockRedirect).toHaveBeenCalledWith('/auth/login?redirect=/parent/dashboard');
  });

  it('redirects to /auth/login?redirect=<path> when the role is not parent', async () => {
    mockCookieGet.mockReturnValue({ value: 'valid-token' });
    mockVerifySessionToken.mockResolvedValue(makeNonParentClaim('student'));
    await expect(requireParentServerSessionClaims('/parent/dashboard')).rejects.toMatchObject({
      message: 'NEXT_REDIRECT:/auth/login?redirect=/parent/dashboard',
    });
    expect(mockRedirect).toHaveBeenCalledWith('/auth/login?redirect=/parent/dashboard');
  });

  it('returns the parent claims verbatim when the role is parent', async () => {
    const claims = makeParentClaim();
    mockCookieGet.mockReturnValue({ value: 'valid-token' });
    mockVerifySessionToken.mockResolvedValue(claims);
    const result = await requireParentServerSessionClaims('/parent/dashboard');
    expect(result).toEqual(claims);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Phase 1 Acceptance Audit (2026-06-19) — Regression test for cross-module
// argument-name contract.
//
// Bug found and fixed: the guard previously called the Convex internal query
// with `{ parentId }`, but the registered validator in
// `convex/parent/links.ts::listParentLinksQuery` declares the key as
// `parentProfileId`. Convex argument validation would have rejected every
// real call at runtime with ArgumentValidationError (manifesting as a 500,
// not the intended fail-closed 403). The original test asserted the bug.
//
// This regression test reads the implementation source files and asserts
// that the key the guard sends to Convex matches the key the Convex
// validator declares. It is intentionally source-text based (not
// runtime-introspection based) so it survives Convex codegen changes and
// catches drift on either side of the boundary.
// ---------------------------------------------------------------------------

describe('parent guard ↔ Convex validator argument contract', () => {
  it('the guard calls listParentLinksQuery with the same key the Convex validator declares', async () => {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const { dirname, resolve } = await import('node:path');

    const here = dirname(fileURLToPath(import.meta.url));
    const guardPath = resolve(here, '../../../lib/auth/parent-server-guards.ts');
    const linksPath = resolve(here, '../../../convex/parent/links.ts');

    const guardSrc = await readFile(guardPath, 'utf8');
    const linksSrc = await readFile(linksPath, 'utf8');

    // Convex validator side: extract the args block of listParentLinksQuery.
    const queryMatch = linksSrc.match(/listParentLinksQuery\s*=\s*internalQuery\(\{[\s\S]*?args:\s*\{([\s\S]*?)\}/);
    expect(queryMatch, 'listParentLinksQuery validator block must be present').not.toBeNull();
    const validatorBlock = queryMatch![1];
    const validatorKeys = Array.from(validatorBlock.matchAll(/(\w+)\s*:\s*v\./g)).map((m) => m[1]);
    expect(validatorKeys).toContain('parentProfileId');
    expect(validatorKeys).not.toContain('parentId');

    // Guard caller side: extract the args object passed to fetchInternalQuery
    // for listParentLinksQuery.
    const callMatch = guardSrc.match(/fetchInternalQuery\(\s*internal\.parent\.links\.listParentLinksQuery\s*,\s*\{([\s\S]*?)\}\s*\)/);
    expect(callMatch, 'guard must invoke fetchInternalQuery against listParentLinksQuery').not.toBeNull();
    const callBlock = callMatch![1];
    const callKeys = Array.from(callBlock.matchAll(/(\w+)\s*:/g)).map((m) => m[1]);

    // Every key the guard sends must be a key the validator declared, and
    // every required validator key must be present in the guard's call.
    for (const key of callKeys) {
      expect(validatorKeys, `guard sent key "${key}" that validator does not declare`).toContain(key);
    }
    for (const key of validatorKeys) {
      expect(callKeys, `validator requires key "${key}" but guard does not send it`).toContain(key);
    }
  });
});

// ---------------------------------------------------------------------------
// Adversarial Audit (2026-06-19) — Same source-text contract regression
// applied to every Convex export in convex/parent/links.ts. The original
// regression test only covered the guard→listParentLinksQuery edge. The
// same class of bug (`{ parentId }` vs `{ parentProfileId }`) could exist
// in the mutation wrappers; this test closes that class by checking the
// validator keys declared on each internalMutation / internalQuery match
// the typed-args keys of the bound handler.
// ---------------------------------------------------------------------------

function extractValidatorArgs(src: string, exportName: string): string[] {
  const re = new RegExp(
    `${exportName}\\s*=\\s*internal(?:Mutation|Query)\\(\\{[\\s\\S]*?args:\\s*\\{([\\s\\S]*?)\\}\\s*,\\s*handler`,
  );
  const m = src.match(re);
  expect(m, `${exportName} validator block must be present`).not.toBeNull();
  return Array.from(m![1].matchAll(/(\w+)\s*:\s*v\./g)).map((match) => match[1]);
}

function extractHandlerArgsKeys(src: string, exportName: string): string[] {
  // Find `function NAME(`, then collect the `args: { ... }` shape inside
  // the first argument's type annotation.
  const re = new RegExp(
    `function\\s+${exportName}\\s*\\(\\s*[^,]+,\\s*args:\\s*\\{([\\s\\S]*?)\\}`,
  );
  const m = src.match(re);
  expect(m, `${exportName} handler args block must be present`).not.toBeNull();
  return Array.from(m![1].matchAll(/(\w+)\s*:/g)).map((mm) => mm[1]);
}

describe('Convex parent/links handler ↔ validator argument contract', () => {
  it('every key the handler declares in args is also declared by its Convex validator', async () => {
    const { readFile } = await import('node:fs/promises');
    const { fileURLToPath } = await import('node:url');
    const { dirname, resolve } = await import('node:path');
    const here = dirname(fileURLToPath(import.meta.url));
    const linksPath = resolve(here, '../../../convex/parent/links.ts');
    const linksSrc = await readFile(linksPath, 'utf8');

    // Pair every handler with its real Convex registration name.
    const pairs: Array<{ handler: string; registration: string }> = [
      { handler: 'createParentLink', registration: 'createParentLinkMutation' },
      { handler: 'revokeParentLink', registration: 'revokeParentLinkMutation' },
      { handler: 'listParentLinks', registration: 'listParentLinksQuery' },
    ];

    for (const { handler, registration } of pairs) {
      const validatorKeys = extractValidatorArgs(linksSrc, registration);
      const handlerKeys = extractHandlerArgsKeys(linksSrc, handler);

      // Every handler key must be declared by the validator.
      for (const key of handlerKeys) {
        expect(
          validatorKeys,
          `handler "${handler}" declares key "${key}" not present in validator "${registration}"`,
        ).toContain(key);
      }
    }
  });
});
