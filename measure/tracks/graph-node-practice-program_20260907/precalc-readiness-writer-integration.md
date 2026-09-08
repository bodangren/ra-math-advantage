# Precalculus Topic 1.1 writer readiness repair

## Result

The candidate is frozen in `/tmp/precalc-ready-writer-head-1pe0k432`.

The patch is `/tmp/precalc-ready-writer-final.patch`.

The patch changes five paths. The fifth path was necessary because the separate writer-to-evidence fixture did not contain the now-required learner prerequisites. Root authorized this test-only scope increase.

- `apps/pre-calculus/convex/activities.ts`
- `apps/pre-calculus/__tests__/convex/selected-topic11-submission-writer.test.ts`
- `apps/pre-calculus/__tests__/convex/selected-topic11-writer-evidence-flow.test.ts`
- `apps/pre-calculus/app/api/activities/precalculus-pilot/submissions/route.ts`
- `apps/pre-calculus/__tests__/app/api/activities/precalculus-pilot-selected-route.test.ts`

## Behavior

The writer keeps the accepted same-tuple replay branch before the new readiness check.

A new Guided or Independent insert calls `getTopic11LearnerDeliveryStateHandler`.

The writer requires `ready_for_practice`.

The writer throws `practice_unavailable` for every other delivery state.

The route maps direct and wrapped `practice_unavailable` errors to HTTP 409 with `{ "error": "Practice is not available" }`.

The route keeps the existing idempotency-conflict response. It keeps the generic HTTP 500 response for unrelated backend errors.

## Test coverage

The writer tests cover no acknowledgement, no teacher confirmation, a stale Worked source, ready Guided and Independent inserts, and accepted replay after the source becomes stale.

The writer-to-evidence fixture uses an actual source activity, lesson link, acknowledgement, and exact teacher-confirmation record. Its negative case proves that an unintroduced learner cannot create a new physical submission.

## Gates

Red test command:

`npm test --workspace=apps/pre-calculus -- --run __tests__/convex/selected-topic11-submission-writer.test.ts __tests__/app/api/activities/precalculus-pilot-selected-route.test.ts`

Expected red result: 6 failures. The three writer readiness cases resolved before implementation. The two route mappings returned HTTP 500. One existing replay test exposed an initial fixture-order error, which was corrected before the green run.

Related test command:

`npm test --workspace=apps/pre-calculus -- --run __tests__/convex/selected-topic11-submission-writer.test.ts __tests__/convex/selected-topic11-writer-evidence-flow.test.ts __tests__/convex/selected-topic11-evidence.test.ts __tests__/convex/topic11-selected-teacher-backend.test.ts __tests__/app/api/activities/precalculus-pilot-selected-route.test.ts`

Result: 5 files passed. 148 tests passed.

Lint command:

`npm run lint --workspace=apps/pre-calculus`

Result: passed with zero warnings.

Build command:

`npm run build --workspace=apps/pre-calculus`

Result: passed.

Post-build TypeScript command from `apps/pre-calculus`:

`npx tsc --noEmit`

Result: passed.

## Patch verification

The patch contains five diff headers.

It applies cleanly to a fresh archive of current main `HEAD`.

After application, `cmp` confirmed exact bytes for all five candidate paths.

The candidate contains no source publication, schema, graph, seed, dependency, or live-environment change.

## Parent verification

All five staged files match the reviewed candidate. Parent verification passed 148 related tests, lint, build, and post-build standalone TypeScript. All 21 workspace dependencies resolve from the app to candidate packages. The actual stale-source browser case must be rerun after local integration.
