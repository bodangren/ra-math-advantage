# Specification: PracticeSessionProvider sessionId Fix

## Overview

`PracticeSessionProvider` currently calls `fetch('/api/practice/complete')` with no request body. The API route then calls `completeDailySession` using only `studentId`, forcing the Convex mutation to look up "whatever active session this student has". This creates a race condition where the wrong session could be completed if a new session is created between start and completion.

## Issues Addressed

1. **Wrong-session completion risk** — `completeDailySession` resolves the active session by `studentId` at completion time, not the session that was actually started.
2. **Silent failure on submission errors** — `handleSubmit` catches errors with only `console.error`; the user sees no feedback and has no retry path.

## Functional Requirements

### 1. Pass sessionId from Client to API

- `PracticeSessionProvider` must include `sessionId` in the POST body to `/api/practice/complete`.
- The API route must read `sessionId` from the JSON body and forward it to the Convex mutation.

### 2. Verify sessionId in Convex Mutation

- `completeDailySession` must accept `sessionId` as an argument.
- It must verify that the provided `sessionId` exists and belongs to the authenticated student.
- If no matching active session is found, throw an explicit error.

### 3. Surface Submission Errors (Optional Scope-Creep Guard)

- Keep the existing `console.error` for now; do not expand scope to full UI error banners unless trivial.

## Acceptance Criteria

- [ ] `PracticeSessionProvider` sends `{ sessionId }` in the completion fetch body.
- [ ] API route parses and validates `sessionId` from request body.
- [ ] `completeDailySession` uses `sessionId` to locate and complete the exact session.
- [ ] All existing tests pass.
- [ ] New/updated tests verify the sessionId flow at component, route, and Convex layers.
- [ ] TypeScript compiles without errors.
- [ ] No new lint errors.

## Out of Scope

- UI error banners or toast notifications for network failures.
- Retry logic for failed submissions.
- Changes to session creation or queue building logic.
