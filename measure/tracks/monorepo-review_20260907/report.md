# Monorepo Review — 2026-09-07

## Scope

This is a risk-based review of the current working tree. It is not a full audit of every file. The initial tree had 193 changed tracked files and 418 untracked entries. The review covered shared authentication, IM3 submission and phase completion, grading, package boundaries, and quality commands. BM2 and other app paths received limited inspection. No production system was tested.

## Findings

### P1: Disabled IM3 accounts retain write access

File: `apps/integrated-math-3/lib/auth/server.ts:73`.

`requireStudentRequestClaims` checks the signed role only. Both `/api/activities/submit` and `/api/phases/complete` use this guard. Their mutations do not check the current credential or profile status. Account deactivation in `convex/auth.ts:643` sets `isActive` to false. An existing token remains accepted until it expires. The default token lifetime is 12 hours.

Use the existing active-credential check with the student role check. Test a valid token after account deactivation. The request must fail before it writes data.

Evidence: source trace through the route, guard, shared token verifier, deactivation mutation, and destination mutations. No live account was changed.

### P1: A wrong first answer creates mastery of 50

File: `apps/integrated-math-3/convex/activities.ts:1407`.

The generic submission handler inserts `masteryLevel: 50` when no competency row exists. It does this even when server grading returns zero. The update branch uses the score, but the insert branch does not. This records positive competency evidence for a fully incorrect answer.

Use the approved score policy for both insert and update. Do not assign positive mastery solely because the row is new.

Evidence: invoked the real `submitActivity._handler` with an in-memory database stub. A fill-in-the-blank activity expected `2`. The submitted answer was `999`. The handler returned score 0 and maxScore 1. It inserted a competency row with masteryLevel 50. The reproduction made no database or repository writes.

### P2: Malformed session signatures throw

File: `packages/core-auth/src/session.ts:176`.

Signature decoding occurs outside the error handler. `verifySessionToken('a.b.!', 'review-secret')` throws `InvalidCharacterError`. Shared request guards propagate the exception. IM3 submission routes call the guard before their error handler. A malformed cookie therefore causes an error response instead of an authentication rejection.

Catch invalid signature encoding and return null. Add a malformed-signature test to the shared auth suite.

### P1: Package boundary violations block CI

Example file: `packages/activity-components/src/components/graphing/GraphingExplorerActivity.tsx:10`.

The boundary command reports 172 violations. New activity components import math-content across a prohibited layer boundary. Other imports lack declared workspace dependencies. The example imports graphing-core without the corresponding declared dependency. The CI boundary job is a dependency of the application jobs.

Resolve the dependency direction and missing declarations under the architecture policy. Do not disable the gate or add broad exceptions. The 172 messages are not 172 independent design defects. Several messages share the same dependency cause.

### P2: The schema registry test has an obsolete key list

File: `packages/activity-components/src/__tests__/schemas.test.ts:121`.

The test expects exactly 20 activity keys. The registry now contains 25. The five added polynomial activity keys cause the root test command to stop in the first package. Later package suites do not run through that command.

Update the explicit expected list to the approved registry. Preserve behavioral schema tests for the added components.

## Verification

| Check | Result |
|---|---|
| Root package lint | Passed |
| Root package typecheck | Passed; runs tsc --noEmit |
| Root package build | Passed; package build commands run type checks |
| Root tests | Failed in activity-components: 252 passed, 1 failed; later packages not run |
| Shared core-auth tests | 54 passed |
| Selected IM3 auth, routes, and grading tests | 188 passed, 7 failed across 5 files |
| IM3 tsc --noEmit | Passed |
| Precalculus tsc --noEmit | Passed |
| IM3 application build | Passed |
| Monorepo boundary check | Failed: 172 violations |
| Browser checks | Skipped; browser-harness-js is not available |

The seven IM3 failures are in server-grading.test.ts. They expect no learning-evidence.v1 marker for activities that the implementation now marks. This is an unresolved contract/test mismatch. The review does not assume that either the implementation or the expected result is correct without the active curriculum decision.

Coverage was not measured. Full application suites, other application builds, live authorization, browser behavior, and all curriculum answers were not verified. A passing build does not resolve the access-control or grading findings.

## Changes

Only Measure review documents were intentionally edited. Existing application changes were preserved. No fixes were applied. No commit was created. Build commands can update generated files.
