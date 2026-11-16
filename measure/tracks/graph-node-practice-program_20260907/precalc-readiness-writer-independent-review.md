# Q37 Topic 1.1 readiness writer independent review

## Verdict

Accept the frozen five-path candidate.

## Findings

- `createServerOwnedSubmission` keeps the strict accepted-replay branch before the current readiness check. A same-tuple retry can return the accepted historical result after the Worked source becomes stale, withdrawn, deleted, or reseeded. Existing replay integrity checks remain in force.
- A new insert calls the existing `getTopic11LearnerDeliveryStateHandler` after publication validation and before the physical activity lookup and insert.
- The writer requires the exact `ready_for_practice` state. It throws `practice_unavailable` for `null`, `needs_acknowledgement`, and `awaiting_teacher_confirmation`.
- The gate applies to both Guided and Independent modes through the shared writer path. Tests create successful new submissions in both modes.
- The delivery-state handler reuses the current approved Worked source, exact learner acknowledgement, and exact teacher-confirmation checks. The change does not add a second readiness rule.
- The negative tests cover no acknowledgement, no teacher confirmation, and a stale Worked source. They assert that no physical submission is inserted.
- The writer-to-evidence fixture now includes the actual Worked activity identity, current lesson source link, learner acknowledgement, and exact teacher evidence. This test-only correction is necessary for the new writer precondition.
- The writer-to-evidence negative case proves that a learner without teacher introduction creates no submission, evidence, receipt, or SRS record.
- The route maps direct and Convex-wrapped `practice_unavailable` errors to HTTP 409 with the exact safe body `{ "error": "Practice is not available" }`.
- The existing idempotency-conflict response remains unchanged. An unrelated backend error remains a generic HTTP 500 response. The route does not expose a stack, request ID, or internal marker.
- The patch changes exactly the five authorized paths. It does not change schema, UI, source publication, graph, seed, dependencies, or evidence writer runtime.

## Focused verification

Command:

`npm test --workspace=apps/pre-calculus -- --run __tests__/convex/selected-topic11-submission-writer.test.ts __tests__/convex/selected-topic11-writer-evidence-flow.test.ts __tests__/convex/selected-topic11-evidence.test.ts __tests__/convex/topic11-selected-teacher-backend.test.ts __tests__/app/api/activities/precalculus-pilot-selected-route.test.ts`

Result: 5 files passed. All 148 tests passed.

The candidate report also records successful application lint, build, and post-build TypeScript checks.
