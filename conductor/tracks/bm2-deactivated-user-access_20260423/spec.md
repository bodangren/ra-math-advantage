# BM2 Deactivated-User Access

## Overview

Seven BM2 API routes currently verify authentication using `getRequestSessionClaims`, which only validates the JWT signature and expiry. A deactivated user's session token remains valid until expiration, allowing continued API access after deactivation.

This track replaces JWT-only verification with `requireActive*SessionClaims` helpers that query Convex to confirm the credential is still active before serving the request.

## Affected Endpoints

| # | Route | Current Auth | Target Auth | Role Check |
|---|-------|--------------|-------------|------------|
| 1 | `GET /api/activities/[activityId]` | `getRequestSessionClaims` | `requireActiveRequestSessionClaims` | Student/Teacher/Admin |
| 2 | `GET /api/activities/spreadsheet/[activityId]/submit` | `getRequestSessionClaims` | `requireActiveRequestSessionClaims` | Student/Teacher/Admin |
| 3 | `GET /api/lessons/[lessonId]/progress` | `getRequestSessionClaims` | `requireActiveStudentRequestClaims` | Student only |
| 4 | `POST /api/student/lesson-chatbot` | `getRequestSessionClaims` | `requireActiveStudentRequestClaims` | Student only |
| 5 | `GET /api/teacher/submission-detail` | `getRequestSessionClaims` | `requireActiveTeacherRequestClaims` | Teacher/Admin |
| 6 | `GET /api/teacher/error-summary` | `getRequestSessionClaims` | `requireActiveTeacherRequestClaims` | Teacher/Admin |
| 7 | `GET /api/teacher/ai-error-summary` | `getRequestSessionClaims` | `requireActiveTeacherRequestClaims` | Teacher/Admin |

## Functional Requirements

1. Each endpoint must reject requests from deactivated users with HTTP 401.
2. Endpoints that already perform role checks must continue to return 403 for wrong-role requests.
3. Endpoints that accept multiple roles (student/teacher/admin) must use the base `requireActiveRequestSessionClaims` and preserve existing role-check logic.
4. All existing tests must be updated to mock the new auth helper and assert deactivated-user rejection.
5. No functional changes to request/response shapes beyond auth behavior.

## Non-Functional Requirements

1. Minimal code change — swap import and call site only; preserve surrounding error handling.
2. Test coverage for deactivated-user path on every affected endpoint.

## Acceptance Criteria

- [ ] All 7 endpoints use active-credential verification.
- [ ] Existing test suites pass after mock updates.
- [ ] New tests verify 401 for deactivated users on each endpoint.
- [ ] `npm run test` in BM2 passes.
- [ ] `npx tsc --noEmit` in BM2 passes with 0 errors.

## Out of Scope

- Endpoints serving static/downloadable content (`/api/pdfs`, `/api/datasets`, `/api/workbooks/*`) — these remain JWT-only.
- Admin-only endpoints already using `requireAdminRequestClaims` — deferred to a separate admin-hardening track.
- Changes to the auth helper implementation itself (already exists in `lib/auth/server.ts`).
