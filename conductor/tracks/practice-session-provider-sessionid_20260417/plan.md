# Implementation Plan: PracticeSessionProvider sessionId Fix

## Phase 1: Wire sessionId Through Completion Flow

### Tasks

- [ ] **Task: Update component and API route tests for sessionId body**
  - [ ] Update `__tests__/components/student/PracticeSessionProvider.test.tsx` to assert that `fetch` is called with `{ sessionId }` body
  - [ ] Update `__tests__/app/api/practice/complete/route.test.ts` to assert that `sessionId` is parsed from body and passed to `completeDailySession`
  - [ ] Add route test for missing/invalid `sessionId` returning 400

- [ ] **Task: Update PracticeSessionProvider to send sessionId**
  - [ ] Modify `handleCompleteSession` to include `body: JSON.stringify({ sessionId: initialSession.sessionId })`

- [ ] **Task: Update API route to parse and forward sessionId**
  - [ ] Parse JSON body in `app/api/practice/complete/route.ts`
  - [ ] Validate `sessionId` presence; return 400 if missing
  - [ ] Forward `sessionId` to `completeDailySession` mutation

- [ ] **Task: Update Convex mutation and tests**
  - [ ] Add `sessionId: v.string()` to `completeDailySession` args
  - [ ] Replace "lookup active by student" with `ctx.db.get(args.sessionId)` + verify `studentId` match and `completedAt === undefined`
  - [ ] Update `__tests__/convex/queue/sessions.test.ts` to test exact-session completion and mismatch errors

- [ ] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)**
