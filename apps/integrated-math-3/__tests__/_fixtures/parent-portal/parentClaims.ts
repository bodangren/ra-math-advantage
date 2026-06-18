// Phase 2 — Parent Portal test fixtures: SessionClaims builder.
//
// Wraps the `SessionClaims` shape with a `role: 'parent'` default so each
// test can build a valid claim in one line. Mirrors the existing
// `parent-role-guard.test.ts` builder so the fixtures stay consistent across
// the phase.
//
// The `role: 'parent' as unknown as SessionClaims['role']` cast exists for
// the same reason as in the auth-guard test: the fixture file compiles in
// isolation, and we want the runtime shape to be what the production code
// consumes. If the surrounding `UserRole` widening has not been applied
// (i.e. `'parent'` is not a valid `UserRole` literal), the type cast is the
// boundary the test crosses deliberately. Today, Phase 1 already widened
// `UserRole` in `packages/core-auth/src/session.ts`, so the cast is only a
// safety net for older typecheck contexts.

import type { SessionClaims } from '@math-platform/core-auth';

export type ParentSessionClaims = SessionClaims & { role: 'parent' };

export const PARENT_PROFILE_ID = 'parent_profile_id_alpha';
export const PARENT_USERNAME = 'parent.alpha';

export function makeParentClaims(overrides: Partial<SessionClaims> = {}): SessionClaims {
  return {
    sub: PARENT_PROFILE_ID,
    username: PARENT_USERNAME,
    role: 'parent' as unknown as SessionClaims['role'],
    iat: 1,
    exp: 9_999_999_999,
    ...overrides,
  };
}

export function makeNonParentClaims(
  role: 'student' | 'teacher' | 'admin',
  overrides: Partial<SessionClaims> = {},
): SessionClaims {
  return {
    sub: `${role}_profile_id`,
    username: `${role}.alpha`,
    role,
    iat: 1,
    exp: 9_999_999_999,
    ...overrides,
  };
}
