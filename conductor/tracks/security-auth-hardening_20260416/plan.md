# Implementation Plan: Security & Auth Hardening

## Phase 1: Fail-Closed API Route Guards [checkpoint: f6d315c]

### Tasks

- [x] **Task: Port requireRequestSessionClaims and role-variant guards** [0411b33]
  - [x] Sub-task: Write unit tests for `requireRequestSessionClaims`, `requireStudentRequestClaims`, `requireTeacherRequestClaims` in `lib/auth/__tests__/server-guards.test.ts`
  - [x] Sub-task: Implement guards in `lib/auth/server.ts` following BM2 pattern (return `SessionClaims | Response`)
  - [x] Sub-task: Verify TypeScript discrimination forces caller handling

- [x] **Task: Port requireActiveRequestSessionClaims (credential revocation)** [5cbff6f]
  - [x] Sub-task: Write unit tests for credential revocation check (active, deactivated, Convex-down scenarios)
  - [x] Sub-task: Implement `requireActiveRequestSessionClaims` calling Convex `internal.auth.getCredentialByUsername`
  - [x] Sub-task: Verify fail-closed behavior when Convex is unreachable

- [x] **Task: Audit and update existing API routes** [e5d0b51]
  - [x] Sub-task: Identify all routes in `app/api/` that lack fail-closed guards
  - [x] Sub-task: Update each route to use appropriate guard function
  - [x] Sub-task: Add Zod `safeParse` validation where missing

- [x] **Task: Conductor - Phase Completion Verification 'Phase 1' (Protocol in workflow.md)** [f6d315c]

## Phase 2: Convex-Layer Authorization [checkpoint: 26b1e2e]

### Tasks

- [x] **Task: Port getAuthorizedTeacher helper**
  - [x] Write unit tests for `getAuthorizedTeacher` (valid teacher, valid admin, wrong role, missing profile)
  - [x] Implement in `convex/auth.ts` or shared internal helper
  - [x] Apply to teacher-scoped queries in `convex/teacher.ts`

- [x] **Task: Port getStudentInTeacherOrg helper**
  - [x] Write unit tests for org-scoped student access (same org, different org, wrong role, missing student)
  - [x] Implement org membership verification
  - [x] Apply to student-detail and submission queries

- [x] **Task: Verify org-scoped data access across all Convex functions**
  - [x] Audit `convex/student.ts` and `convex/teacher.ts` for missing org checks
  - [x] Add org scoping where gaps exist
  - [x] Document any deviations

### Deviations

1. **`getSubmissionDetail`** (line 626): Added `userId` argument and authorization check using `getAuthorizedTeacher`. Also added student org membership verification. API signature changed (added `userId` as first argument).

2. **`getLessonErrorSummary`** (line 863): Changed from `teacherOrgId` argument to `userId` argument with `getAuthorizedTeacher` check. The function now derives org from the authorized teacher instead of trusting client-supplied org ID. API signature changed (replaced `teacherOrgId` with `userId`).

3. **`getProfileWithOrg`** (line 845): Not modified. This query returns public profile information and is likely intentionally unauthenticated for general profile lookups.

4. **`getTeacherLessonPreview`** (line 965): Not modified. This query returns public curriculum content (lesson phases/sections) which is intentionally accessible without authentication.

## Phase 3: Middleware and Dev Route Protection

### Tasks

- [x] **Task: Extend middleware.ts for dev-route admin guard** [d07a2e6]
  - [x] Write tests for middleware admin-only route protection
  - [x] Implement matcher for `/dev/component-approval/:path*` with JWT extraction and admin role check
  - [x] Verify non-matching routes pass through unchanged

- [ ] **Task: Verify no stack trace leaks in production**
  - [ ] Audit all API route error handlers for stack trace exposure
  - [ ] Ensure production error responses are generic
  - [ ] Update any routes that leak sensitive info

- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**
