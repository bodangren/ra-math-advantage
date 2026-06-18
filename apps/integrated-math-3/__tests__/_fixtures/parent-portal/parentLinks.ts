// Phase 2 — Parent Portal test fixtures: parent-link factories.
//
// Mirrors the shape produced by `convex/parent/links.ts::listParentLinks`:
// a list of `{ studentId, status: 'active' | 'revoked' }` records for a
// given parent. The fixtures exercise:
//   - a parent with one linked student (single-student dashboard),
//   - a parent with two linked students (switcher, cross-student isolation),
//   - a revoked link (regression: must be filtered out of the active set).
//
// These fixtures are intentionally minimal — they describe the link list the
// UI consumes, not the full Convex row (no organizationId, no createdAt, no
// revokedBy). The UI's privacy boundary is "which students can the parent
// see?" and that is exactly what the link list encodes.

export interface ParentLinkFixture {
  studentId: string;
  status: 'active' | 'revoked';
}

export const STUDENT_ALPHA_ID = 'student_alpha';
export const STUDENT_BETA_ID = 'student_beta';
export const STUDENT_REVOKED_ID = 'student_revoked';

export const singleStudentLinks: ParentLinkFixture[] = [
  { studentId: STUDENT_ALPHA_ID, status: 'active' },
];

export const multiStudentLinks: ParentLinkFixture[] = [
  { studentId: STUDENT_ALPHA_ID, status: 'active' },
  { studentId: STUDENT_BETA_ID, status: 'active' },
];

export const linksWithOneRevoked: ParentLinkFixture[] = [
  { studentId: STUDENT_ALPHA_ID, status: 'active' },
  { studentId: STUDENT_BETA_ID, status: 'active' },
  { studentId: STUDENT_REVOKED_ID, status: 'revoked' },
];
