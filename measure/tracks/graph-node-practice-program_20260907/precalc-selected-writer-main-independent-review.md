# Precalculus Q18 selected writer main reconciliation review

## Disposition

The selected writer reconciliation matches the accepted v5 writer behavior in commit `d7b735aa`. The main writer keeps the later-node exports. I found one route error-mapping defect. This defect does not change the stored replay transaction. It can return the wrong HTTP status for a conflicting retry through the real Convex client.

## Finding

### P1 — The production route does not reliably map a Convex conflict to HTTP 409

`apps/pre-calculus/app/api/activities/precalculus-pilot/submissions/route.ts` maps a conflict only when `error.message === "idempotency_conflict"`.

The production route calls `fetchInternalMutation`. That helper returns the Convex client mutation directly. A Convex client error can add function and server context to the message. The selected route test injects the handler directly. It has no realistic wrapped-error case. The test file also has no 409 assertion.

A valid stored replay remains durable. The writer returns the stored submission when the request body has the same canonical answers and assistance data. A changed request correctly throws `idempotency_conflict`. The route can map that wrapped error to HTTP 500 instead of HTTP 409.

Add one route test with a realistic wrapped message. Use the existing controlled public error response. Match the known conflict token without returning the private Convex message.

## Verified selected behavior

- The writer accepts only the two selected stable activity IDs.
- The writer validates `practice.v1` before a write.
- The route rejects top-level browser grade fields and part grade fields.
- The writer derives the grade from `gradeTopic11IntervalGraph` and the fixed variant seed.
- The writer checks the current node, blueprint, mode specifications, renderer mappings, generator key, grading specification, and exact geometry.
- The writer checks the stored activity display name, description, component key, node ID, mode, variant seed, and physical approval.
- The writer validates an active student credential against profile ID, username, role, and organization.
- The writer assigns the next attempt ordinal from the learner and physical activity index.
- The writer stores canonical raw answers and server grade parts.
- The writer preserves valid `practice.v1` optional fields.
- The writer authenticates the learner before it handles a replay.
- The writer validates the stored envelope, physical activity identity when that row still exists, canonical answers, assistance counts, server grade, ordinal, and timestamps before it returns a replay.
- The writer permits replay after later publication withdrawal or physical activity deletion. This behavior returns an existing durable result. It does not create a new result.
- The current schema keeps the selected stable activity ID, idempotency key, attempt ordinal, mastery contract version, and required indexes.

## Later-node preservation

The before and after `activities.ts` files each export 129 functions or constants. No exported name was removed or added by this reconciliation. The focused patch replaces the selected Topic 1.1 block and leaves the later-node export inventory present. The schema diff against `d7b735aa` contains later learning-evidence work and formatting changes. It keeps the selected submission fields and indexes.

This check confirms preservation at the export and selected-contract boundaries. It is not a full semantic review of all later-node branches.

## Test and snapshot evidence

The selected route test and selected writer test are byte-identical in the before snapshot, after snapshot, and current main worktree.

The following three fixture files occur only in the after snapshot and current main worktree:

- `activities-server-owned-submission.acceptance.test.ts`
- `topic11-trusted-teacher-flow.test.ts`
- `topic11-real-production-flow.test.ts`

They are untracked in the current repository. The supplied before snapshot has no copy of them. Their passing results show current behavior. They do not prove their exact pre-reconciliation content. I cannot verify the provenance of their fixture changes from the supplied snapshots.

The reconciliation report records 171 passing tests, lint, build, and standalone TypeScript before and after the build. Parent verification is separate.

## Scope

I made no source, test, staging, dependency, database, or deployment change during this review.

## Final conflict-mapping disposition

Parent changed the selected route to test `message.includes("idempotency_conflict")`. This matches the existing IM3 boundary pattern. The route now handles the direct writer error and the Convex client wrapper form.

The added parameterized test covers three cases:

- A direct `idempotency_conflict` returns HTTP 409.
- A wrapped Convex server error that contains `idempotency_conflict` returns HTTP 409.
- An unrelated database error returns HTTP 500.

Both error paths return controlled public text. They do not return the private Convex message. The recorded Red run proves that the wrapped case returned HTTP 500 before the source change. The production diff changes only the conflict condition. The test diff adds only these three cases.

This change resolves the P1 finding. I found no new blocking issue in these two files. Parent owns the final test, lint, build, and post-build TypeScript results.
