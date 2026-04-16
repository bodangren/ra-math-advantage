# Implementation Plan: Security & Auth Hardening

## Phase 1: Fail-Closed API Route Guards

### Tasks

- [x] **Task: Port requireRequestSessionClaims and role-variant guards** [0411b33]
  - [x] Write unit tests for `requireRequestSessionClaims`, `requireStudentRequestClaims`, `requireTeacherRequestClaims` in `lib/auth/__tests__/server-guards.test.ts`
  - [x] Implement guards in `lib/auth/server.ts` following BM2 pattern (return `SessionClaims | Response`)
  - [x] Verify TypeScript discrimination forces caller handling

- [ ] **Task: Port requireActiveRequestSessionClaims (credential revocation)**
  - [ ] Write unit tests for credential revocation check (active, deactivated, Convex-down scenarios)
  - [ ] Implement `requireActiveRequestSessionClaims` calling Convex `internal.auth.getCredentialByUsername`
  - [ ] Verify fail-closed behavior when Convex is unreachable

- [ ] **Task: Audit and update existing API routes**
  - [ ] Identify all routes in `app/api/` that lack fail-closed guards
  - [ ] Update each route to use appropriate guard function
  - [ ] Add Zod `safeParse` validation where missing

- [ ] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)**

## Phase 2: Convex-Layer Authorization

### Tasks

- [ ] **Task: Port getAuthorizedTeacher helper**
  - [ ] Write unit tests for `getAuthorizedTeacher` (valid teacher, valid admin, wrong role, missing profile)
  - [ ] Implement in `convex/auth.ts` or shared internal helper
  - [ ] Apply to teacher-scoped queries in `convex/teacher.ts`

- [ ] **Task: Port getStudentInTeacherOrg helper**
  - [ ] Write unit tests for org-scoped student access (same org, different org, wrong role, missing student)
  - [ ] Implement org membership verification
  - [ ] Apply to student-detail and submission queries

- [ ] **Task: Verify org-scoped data access across all Convex functions**
  - [ ] Audit `convex/student.ts` and `convex/teacher.ts` for missing org checks
  - [ ] Add org scoping where gaps exist
  - [ ] Document any deviations

- [ ] **Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)**

## Phase 3: Middleware and Dev Route Protection

### Tasks

- [ ] **Task: Extend middleware.ts for dev-route admin guard**
  - [ ] Write tests for middleware admin-only route protection
  - [ ] Implement matcher for `/dev/component-review/:path*` with JWT extraction and admin role check
  - [ ] Verify non-matching routes pass through unchanged

- [ ] **Task: Verify no stack trace leaks in production**
  - [ ] Audit all API route error handlers for stack trace exposure
  - [ ] Ensure production error responses are generic
  - [ ] Update any routes that leak sensitive info

- [ ] **Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)**
