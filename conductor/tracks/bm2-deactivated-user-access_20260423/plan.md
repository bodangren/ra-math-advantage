# Implementation Plan

## Phase 1: Swap Auth Helpers and Update Tests [checkpoint: 8210db8]

### Task 1: Add active-auth tests for `lib/auth/server`
- [x] Write tests for `requireActiveRequestSessionClaims` returning 401 when credential is missing/deactivated
- [x] Write tests for `requireActiveStudentRequestClaims` returning 401/403 appropriately
- [x] Write tests for `requireActiveTeacherRequestClaims` returning 401/403 appropriately

### Task 2: Update Student-Facing Routes
- [x] `GET /api/lessons/[lessonId]/progress` — swap to `requireActiveStudentRequestClaims`, update test mocks
- [x] `POST /api/student/lesson-chatbot` — swap to `requireActiveStudentRequestClaims`, update test mocks

### Task 3: Update Teacher-Facing Routes
- [x] `GET /api/teacher/submission-detail` — swap to `requireActiveTeacherRequestClaims`, update test mocks
- [x] `GET /api/teacher/error-summary` — swap to `requireActiveTeacherRequestClaims`, update test mocks
- [x] `GET /api/teacher/ai-error-summary` — swap to `requireActiveTeacherRequestClaims`, update test mocks

### Task 4: Update Multi-Role Routes
- [x] `GET /api/activities/[activityId]` — swap to `requireActiveRequestSessionClaims`, preserve role checks, add/update tests
- [x] `GET /api/activities/spreadsheet/[activityId]/submit` — swap GET handler to `requireActiveRequestSessionClaims`, preserve role checks, add/update tests
- [x] `GET /api/datasets/[filename]` — swap to `requireActiveRequestSessionClaims`

### Task 5: Verification
- [x] Run BM2 test suite (`CI=true npm run test` in BM2 app context) — auth-related failures resolved; 27 pre-existing failures remain (convex-auth-boundary, component-approvals-auth, dev-stack-script, progress/assessment 422)
- [x] Run BM2 typecheck (`npx tsc --noEmit`) — 0 errors
- [x] Run BM2 lint (`npm run lint`) — no linter configured (pre-existing tooling gap)
