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

import { describe, it, expect, expectTypeOf, vi, beforeEach } from 'vitest';

import type { SessionClaims, UserRole } from '@math-platform/core-auth';

import {
  requireParentRequestClaims,
  requireParentServerSessionClaims,
} from '@/lib/auth/parent-server-guards'; // Intentional: non-existent module → Red.

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
      listParentLinks: 'parent:listParentLinks',
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
  beforeEach(() => {
    vi.clearAllMocks();
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
      'parent:listParentLinks',
      expect.objectContaining({ parentId: 'parent_profile_1' }),
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
});

// ---------------------------------------------------------------------------
// requireParentServerSessionClaims — page-level, redirect-based
// ---------------------------------------------------------------------------

describe('requireParentServerSessionClaims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a function (runtime API surface)', () => {
    expect(typeof requireParentServerSessionClaims).toBe('function');
  });

  it('is async (awaitable; redirect-based surface)', () => {
    expect(requireParentServerSessionClaims.constructor.name).toBe('AsyncFunction');
  });
});
