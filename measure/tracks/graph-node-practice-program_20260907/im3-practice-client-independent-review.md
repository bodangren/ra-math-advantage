# IM3 Practice Client Independent Review

## Review scope

This review covers `/tmp/q14-client-head.patch` only. The patch changes the client submission helper and its direct tests. This review also checks the current `practice.v1` contract, the production IM3 learning-evidence route, the Convex return validator, the student completion consumer, and the separate Worked acknowledgement path.

## Result

The patch has no blocking defect in the reviewed scope.

The helper now treats an HTTP success as a completed progression only when the response confirms all required facts. It requires persisted evidence, mastery application, spaced-repetition application, an eligible mastery-bearing decision, the introduced exposure state, and valid delivery and idempotency values. This condition agrees with the current Convex success receipt in `apps/integrated-math-3/convex/learningEvidence.ts`.

The helper keeps the caller's create idempotency key when creation fails or when the create response is lost. After the server returns a submission ID, the helper keeps only the opaque ID and the server grade for a progression retry. It does not resend answers to the learning-evidence route. The direct tests verify these boundaries.

The student session does not complete after a failed progression. It stores the retry state and resets the submission lock. It uses the returned server score for feedback. It also rejects a successful progression result that has no usable server score or maximum score. Therefore, the client does not use a client answer to replace a missing server grade.

The Worked path remains separate. `LessonRenderer` calls `createServerOwnedActivitySubmission` for the selected Worked acknowledgement. It does not call `submitIm3PilotActivity`. The reviewed patch does not make a student Worked acknowledgement create learning evidence.

## Contract comparison

The production route accepts only `{ submissionId }`. It projects the same receipt fields that the helper checks. The Convex return validator permits a success receipt or one of two explicit rejection receipts. An exact stored receipt returns with `delivery: "replay"`. A new eligible submission returns `persisted: true`, `masteryApplied: true`, and `kstApplied: true`.

The strict client check intentionally rejects an awaiting-teacher receipt and a non-persisted eligibility decision. This behavior prevents the practice session from advancing before the server stores eligible evidence.

## Non-blocking test gaps

1. Add one positive opaque retry test with `delivery: "replay"`. The current predicate accepts this value, but the direct test uses only `delivery: "new"`. This test will cover a lost learning-evidence response followed by a server receipt replay.

2. Keep the existing `PracticeSessionProvider-server-authority` test in the integration gate. The helper return type permits an optional score. The provider is the component that prevents completion when the pilot grade is absent. A helper-only test cannot prove this final completion boundary.

3. Keep the existing `LessonRenderer-worked-review-action` test in the integration gate. It proves that the Worked action uses the acknowledgement create path and does not depend on the new progression helper.

No production change is required for these test gaps.

## Verification

The following focused suites passed on 2026-09-07:

- `submission-progress-authority.test.ts`: 16 tests
- `PracticeSessionProvider-server-authority.test.tsx`: 96 tests
- `LessonRenderer-worked-review-action.test.tsx`: 1 test

Total: 113 tests passed.

## Parent integration verification

The parent added the positive opaque retry case for both `new` and `replay` delivery. The three integration suites now pass 114 tests. App lint passes. The previous unchanged implementation also passed standalone TypeScript and build. The isolated helper run passed 30 tests before the additional replay case. It measured 93.87% statement coverage and 66.66% branch coverage across the full helper file. This result does not meet the 80% branch target.

This commit provides the strict client helper. The selected session connection remains open under Task Q14. The selected evidence backend and teacher interface require separate integration.
