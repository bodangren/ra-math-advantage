# IM2 Lesson 1.4 atomic practice scope review

## Decision

Accepted for implementation.

The revised 15-path scope resolves the prior lifecycle and teacher projection blockers. I found no remaining concrete scope defect.

## Reload and accepted prefix

The query now returns `acceptedAnswers`, `hintsUsed`, `revealStepsSeen`, and only the current public part.

`acceptedAnswers` contains only correct earlier learner responses. It does not contain a future answer, a private answer, a grade, an explanation, or a hint.

The component hydrates the accepted prefix and both cumulative counters after reload. The required tests cover reload after each correct Guided prefix and after an incorrect current-part attempt.

This contract lets the client send the next strict prefix after a reload. It does not require a new session table.

## Cumulative hint and reveal counters

The mutation derives the minimum counter values from the newest valid submission row. It rejects a decrease before a write.

When the server returns a Guided hint after a saved incorrect attempt, it increments and stores the cumulative hint count in that row. Both counters remain cumulative across incorrect retries, accepted prefixes, reloads, and the final receipt.

Each graded response returns the authoritative cumulative values. The final evidence decision uses these cumulative values.

The required tests cover a reset after a wrong answer, a reset after an accepted prefix, and a reset after reload.

## Last-part position and completion

The scope gives `finalPart` one meaning. It identifies the fixed last-part position.

An incorrect attempt on the last part has `finalPart: true` and `complete: false`. It stays on the same part. Its exact replay returns the same row and response.

Only a validated last-part row with all required parts correct has `complete: true`. The learner component advances to the next activity only when `complete` is true.

An intermediate correct response has `finalPart: false` and `complete: false`. It returns only the next public part.

The required tests cover intermediate correct, last-part incorrect, last-part correct, and exact replay for each response shape.

## Bounded history and retry contract

The existing `by_user_activity_attempt_ordinal` index has `userId`, `activityId`, and `attemptOrdinal`. It supports an equality prefix for learner and activity, descending order, and `.first()`.

The scope requires validation of the full newest stored envelope, fixed item identity, prefix, current part, counters, and `finalPart` value. It rejects a malformed newest row without a write. It does not require an unbounded history scan.

The existing `by_user_activity_idempotency_key` index supports exact retry. The scope requires the stored request and receipt to match before replay. A changed body with the same key causes a conflict.

The strict-prefix rule rejects a missing earlier key, a changed accepted answer, a future key, an extra key, and a malformed answer. It does not give JSON object key order authority.

## Teacher projection

The revised scope includes `apps/integrated-math-2/convex/teacher.ts` as production path 7.

The teacher attempt list keeps each saved triangle attempt. It projects the current public part ID and raw learner answer from the single current graded part for an intermediate or incorrect row. It projects the total score only for a complete last-part row.

Every triangle row has `canRecordExposure: false`. The perpendicular answer projection and teacher exposure authority remain unchanged.

The required regression proves that a triangle Guided row appears in the generic teacher list and cannot use the perpendicular exposure action.

## Evidence boundary

The two target nodes are the exact atomic skills. The missing-angle part in Problem 10 is a support gate. It does not produce separate learning evidence.

During this implementation batch, draft graph state and `srsEligible: false` keep correct and incorrect outcomes at zero evidence and SRS writes.

After separate readiness activation, a validated Independent last-part attempt can provide correct or incorrect evidence for the exact target node. For Problem 10, the stored `missing_angle` prefix must be correct before either outcome for `final_order` is eligible. The target graded evidence comes from `final_order`.

An incorrect `final_order` keeps `complete: false`. This does not conflict with its later use as incorrect target-node evidence. Completion and evidence outcome are separate facts.

The later evidence decision also requires zero cumulative hints and zero cumulative reveals. Guided and Worked rows cannot create mastery-bearing evidence.

## Activation order

The implementation keeps the two graph nodes, two blueprints, six activities, teacher projections, evidence, and SRS inactive.

The verification order is coherent:

1. Implement and test the unavailable draft state.
2. Review the six seeded activities and source projections.
3. Test the handler and component with injected approved publication fixtures.
4. Apply a separate graph and activity activation patch after review.
5. Run the real learner and teacher browser flows in a disposable local Convex database.
6. Keep Independent evidence and SRS inactive until their separate readiness proof passes.

The first activation keeps `independentPracticeReady` false and SRS eligibility false. A later readiness patch can enable exact-node Independent evidence and SRS after the real evidence test passes.

## Scope size

The 15 paths are sufficient for the specified change.

They include the fixed content module, learner component, page, query and mutation code, reviewed seed, route, teacher projection, and focused regression tests. The scope does not require a schema change, a new session model, a registry, a generic framework, a graph edit, or a source asset edit.

Implementation acceptance still requires the complete tests and the disposable local transaction and browser proof listed in the scope. Memory fixtures alone do not prove transaction behavior or real rendering.
