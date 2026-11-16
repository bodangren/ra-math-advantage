# IM3 Selected Quadratic Writer Dependency Review

## Required dependency order

1. Apply the selected grader patch.
2. Add optional schema fields for `stableActivityId`, `masteryNodeId`, `srsEligible`, `gradingConfig.partIds`, and `gradingConfig.rubric[].partId`.
3. Add optional submission fields for `attemptOrdinal`, `idempotencyKey`, and `masteryContractVersion`.
4. Add the exact `by_user_activity_attempt_ordinal` and `by_user_activity_idempotency_key` indexes. These indexes are required by the writer.
5. Add the internal selected writer and its validators.
6. Add the authenticated Next.js route after the generated `internal.activities.createServerOwnedSubmission` reference exists.

The route must derive `userId` from `requireStudentRequestClaims`. It must accept a nonempty `Idempotency-Key`. It must accept only a submitted Guided or Independent `practice.v1` envelope with exactly `table_values` and `placed_points`. Each value must be an array of five finite `{x,y}` objects. Each raw part must match its answer. It must reject client submission identity and grade fields.

The writer must load the activity by physical Convex ID. It must require the exact canonical node, `graphing-explorer`, `srsEligible: true`, and the stable activity ID that matches the submitted mode. It must also require approved current node and blueprint records. The real draft catalog must fail closed. The writer must grade before storage, replace client grade fields, allocate the attempt ordinal on the server, and store one immutable physical submission.

Idempotency uses `(userId, activityId, idempotencyKey)`. An identical replay returns the first physical submission. A changed canonical payload returns `idempotency_conflict`.

## Integration mismatch

The committed selected grader at `9951fa09` returns a stripped ungraded response for unsupported activities. This matches the broad app contract. The writer owns strict selected activity rejection before it calls the grader. Writer tests must cover wrong node, activity, component, and cross-mode identities.

## Exclusions

Do not include `learningEvidence.ts`, the dedicated evidence route, generated variants, seed expansion, queue changes, teacher UI, or later Lesson 1.1 nodes in this group.

## Current verification state

The scratch writer suite passes 15 tests. It covers draft publication, key presence, physical attempts, replay, payload conflict, answer shape, raw-answer matching, activity approval, node identity, component identity, and assistance-sensitive replay. The remaining credential-field matrix, cross-mode case, 81-character key, direct wrong-contract case, reordered-part replay, reveal change, and route authentication and transport tests are required before acceptance.
