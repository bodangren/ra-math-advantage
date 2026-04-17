# Implementation Plan: PracticeSessionProvider sessionId Fix

## Phase 1: Wire sessionId Through Completion Flow

### Tasks

- [x] **Task: Update component and API route tests for sessionId body**
  - [x] Update `__tests__/components/student/PracticeSessionProvider.test.tsx` to assert that `fetch` is called with `{ sessionId }` body
  - [x] Update `__tests__/app/api/practice/complete/route.test.ts` to assert that `sessionId` is parsed from body and passed to `completeDailySession`
  - [x] Add route test for missing/invalid `sessionId` returning 400

- [x] **Task: Update PracticeSessionProvider to send sessionId**
  - [x] Modify `handleCompleteSession` to include `body: JSON.stringify({ sessionId: initialSession.sessionId })`

- [x] **Task: Update API route to parse and forward sessionId**
  - [x] Parse JSON body in `app/api/practice/complete/route.ts`
  - [x] Validate `sessionId` presence; return 400 if missing
  - [x] Forward `sessionId` to `completeDailySession` mutation

- [x] **Task: Update Convex mutation and tests**
  - [x] Add `sessionId: v.string()` to `completeDailySession` args
  - [x] Replace "lookup active by student" with `ctx.db.get(args.sessionId)` + verify `studentId` match and `completedAt === undefined`
  - [x] Update `__tests__/convex/queue/sessions.test.ts` to test exact-session completion and mismatch errors

- [~] **Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)**
