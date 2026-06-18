// Phase 2 — Parent Portal test fixtures: parent-link factories.
//
// Mirrors the shape produced by `convex/parent/links.ts::listParentLinks`:
// a list of `{ studentId, status: 'active' | 'pending' | 'revoked' }` records
// for a given parent. The fixtures exercise:
//   - a parent with one linked student (single-student dashboard),
//   - a parent with two linked students (switcher, cross-student isolation),
//   - a revoked link (regression: must be filtered out of the active set),
//   - a pending link (Phase 3 empty/pending-state branch — the link has
//     been created but is awaiting teacher approval; the parent UI shows
//     a "pending" empty state until it transitions to 'active').
//
// These fixtures are intentionally minimal — they describe the link list the
// UI consumes, not the full Convex row (no organizationId, no createdAt, no
// revokedBy). The UI's privacy boundary is "which students can the parent
// see?" and that is exactly what the link list encodes.
//
// The 'pending' status matches the Convex schema validator
// (`apps/integrated-math-3/convex/schema.ts` `parent_links.status`);
// Phase 1's `convex/parent/links.ts` only creates 'active' links, but the
// Phase 3 dispatcher UI must still handle 'pending' rows when they appear
// (e.g. from a future invite flow).

export interface ParentLinkFixture {
  studentId: string;
  status: 'active' | 'pending' | 'revoked';
}

export const STUDENT_ALPHA_ID = 'student_alpha';
export const STUDENT_BETA_ID = 'student_beta';
export const STUDENT_REVOKED_ID = 'student_revoked';
export const STUDENT_PENDING_ID = 'student_pending';

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

// Phase 3 — pending-link fixture (parent has been linked but the link is
// still awaiting teacher/admin approval). The dispatcher UI must show a
// "pending" empty state, not the active dashboard.
export const pendingParentLinks: ParentLinkFixture[] = [
  { studentId: STUDENT_PENDING_ID, status: 'pending' },
];
