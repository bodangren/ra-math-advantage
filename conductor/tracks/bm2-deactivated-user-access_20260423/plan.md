# Implementation Plan

## Phase 1: Swap Auth Helpers and Update Tests

### Task 1: Add active-auth tests for `lib/auth/server`
- [ ] Write tests for `requireActiveRequestSessionClaims` returning 401 when credential is missing/deactivated
- [ ] Write tests for `requireActiveStudentRequestClaims` returning 401/403 appropriately
- [ ] Write tests for `requireActiveTeacherRequestClaims` returning 401/403 appropriately

### Task 2: Update Student-Facing Routes
- [ ] `GET /api/lessons/[lessonId]/progress` — swap to `requireActiveStudentRequestClaims`, update test mocks
- [ ] `POST /api/student/lesson-chatbot` — swap to `requireActiveStudentRequestClaims`, update test mocks

### Task 3: Update Teacher-Facing Routes
- [ ] `GET /api/teacher/submission-detail` — swap to `requireActiveTeacherRequestClaims`, update test mocks
- [ ] `GET /api/teacher/error-summary` — swap to `requireActiveTeacherRequestClaims`, update test mocks
- [ ] `GET /api/teacher/ai-error-summary` — swap to `requireActiveTeacherRequestClaims`, update test mocks

### Task 4: Update Multi-Role Routes
- [ ] `GET /api/activities/[activityId]` — swap to `requireActiveRequestSessionClaims`, preserve role checks, add/update tests
- [ ] `GET /api/activities/spreadsheet/[activityId]/submit` — swap GET handler to `requireActiveRequestSessionClaims`, preserve role checks, add/update tests

### Task 5: Verification
- [ ] Run BM2 test suite (`CI=true npm run test` in BM2 app context)
- [ ] Run BM2 typecheck (`npx tsc --noEmit`)
- [ ] Run BM2 lint (`npm run lint`)
