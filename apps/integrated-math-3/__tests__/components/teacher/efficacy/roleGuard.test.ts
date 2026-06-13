/**
 * Phase 4 Red — Efficacy access role guard (Task 1 of Phase 4).
 *
 * Pinned contract (test-strategy §6 Phase 4 role-guard row + §4 Phase 4
 * unauthorized-role edge case):
 *
 *   guardEfficacyAccess(claims):
 *     - returns the claims object verbatim when role is 'teacher' or 'admin'
 *     - returns null when role is 'student', unknown, or claims is undefined/null
 *
 * This is the defense-in-depth helper used by the EfficacyView component
 * to short-circuit rendering for non-teacher roles (test-strategy §4:
 * "unauthorized role (student) → null"). The page-level
 * `requireTeacherSessionClaims` already redirects via Next.js layout, but
 * the component-level guard guarantees the surface cannot leak when
 * embedded in a non-gated context (mirrors `requireServerRoles` in
 * `apps/integrated-math-3/lib/auth/server.ts:140`).
 *
 * Module under test: `@/lib/efficacy/roleGuard` (does not exist at HEAD).
 */

import { describe, it, expect } from 'vitest';
import type { SessionClaims } from '@math-platform/core-auth';
import { guardEfficacyAccess } from '@/lib/efficacy/roleGuard';

const teacherClaims: SessionClaims = {
  sub: 'user_teacher_001',
  username: 'alice.teacher',
  role: 'teacher',
  organizationId: 'org_001',
  iat: 1_700_000_000,
  exp: 1_700_003_600,
};

const adminClaims: SessionClaims = {
  sub: 'user_admin_001',
  username: 'admin.user',
  role: 'admin',
  organizationId: 'org_001',
  iat: 1_700_000_000,
  exp: 1_700_003_600,
};

const studentClaims: SessionClaims = {
  sub: 'user_student_001',
  username: 'student.user',
  role: 'student',
  organizationId: 'org_001',
  iat: 1_700_000_000,
  exp: 1_700_003_600,
};

describe('guardEfficacyAccess', () => {
  describe('allowed roles', () => {
    it('returns the claims verbatim for a teacher session', () => {
      expect(guardEfficacyAccess(teacherClaims)).toEqual(teacherClaims);
    });

    it('returns the claims verbatim for an admin session (admin is teacher-compatible)', () => {
      expect(guardEfficacyAccess(adminClaims)).toEqual(adminClaims);
    });

    it('does not mutate the input claims', () => {
      const snapshot = { ...teacherClaims };
      guardEfficacyAccess(teacherClaims);
      expect(teacherClaims).toEqual(snapshot);
    });
  });

  describe('denied roles', () => {
    it('returns null for a student session', () => {
      expect(guardEfficacyAccess(studentClaims)).toBeNull();
    });

    it('returns null for an undefined claims input', () => {
      expect(guardEfficacyAccess(undefined)).toBeNull();
    });

    it('returns null for a null claims input', () => {
      expect(guardEfficacyAccess(null)).toBeNull();
    });

    it('does not throw on undefined input', () => {
      expect(() => guardEfficacyAccess(undefined)).not.toThrow();
    });
  });

  describe('return-type contract', () => {
    it('returns a SessionClaims object (not the input literal) when allowed', () => {
      const result = guardEfficacyAccess(teacherClaims);
      expect(result).not.toBeNull();
      expect(result).toBeTypeOf('object');
    });

    it('returns null (not undefined) when denied', () => {
      const result = guardEfficacyAccess(studentClaims);
      expect(result).toBeNull();
      expect(result).not.toBeUndefined();
    });
  });
});