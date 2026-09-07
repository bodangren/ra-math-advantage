# IM3 Selected Writer Main-Hunk Review

Date: 2026-09-07

## Patch identity

`/tmp/im3-selected-quadratic-writer-head.patch` applies to the current main Git index. The check used `git apply --check --cached`. The patch does not apply over the dirty working files because those files already contain broader pending work. The two final tests are also saved as:

- `/tmp/im3-selected-quadratic-writer.test.ts`
- `/tmp/im3-selected-quadratic-route.test.ts`

## Minimum main writer hunks

Keep the current broad activity allow-list. Add these checks only to the selected graph path.

1. Load the submitted profile and its credential before the activity write. Require a student profile. Require one active credential selected by username. Require matching profile ID, username, role, and organization ID.
2. Require `activity.approval.status === "approved"` in `isEnabledIm3MasteryActivity`.
3. Require `practice.v1` and an idempotency key from 1 through 80 characters in the exported handler. Keep the registered mutation parse through `practiceSubmissionEnvelopeSchema`.
4. Add a selected-graph replay comparison. Sort parts by `partId`. Compare the semantic answers and each evidence-bearing field: `rawAnswer`, `hintsUsed`, `revealStepsSeen`, `changedCount`, `firstInteractionAt`, `answeredAt`, `wallClockMs`, and `activeMs`. Use this comparison for selected graph replay. Do not replace the broad helper without tests for every later node.
5. Keep strict stable activity and mode pairing before grading. The allowed pairs are Guided ID with Guided mode and Independent ID with Independent mode.
6. Preserve the first physical submission ID for an identical retry. Reject a changed response or assistance record with `idempotency_conflict`.

The current broad writer already has server attempt allocation, physical ID replay, server grading, and current graph publication checks. Preserve these paths.

## Minimum main route hunks

1. Accept the canonical selected graph keys `table_values` and `placed_points`. The current first two-part route shape uses camelCase keys. Align this selected shape with the component and writer contract without changing later shapes.
2. Reject an idempotency key longer than 80 characters before the mutation call.
3. Map a wrapped error that contains `idempotency_conflict` to the fixed 409 response.
4. Return the fixed private 503 response for an unknown backend error.
5. Preserve authentication before body processing. Continue to derive `userId` from the authenticated student claim.

## Verification

The selected main tests pass 39 of 39 cases. This total includes 31 writer cases and 8 route cases. The updated legacy idempotency tests pass 11 of 11 cases. The broad server grader tests pass 135 of 135 cases. The selected server grader tests pass 28 of 28 cases. The combined run passes 213 of 213 cases.

The app Oxlint command passes. `npx tsc --noEmit` passes. The Vinext production build passes. The build reports existing middleware deprecation and duplicate KaTeX asset warnings.

The committed grader returns a stripped ungraded result for unsupported activities. The broad writer must reject an invalid selected identity before it calls the grader. Do not change the grader fallback.

## Changed files

- `apps/integrated-math-3/convex/activities.ts`
- `apps/integrated-math-3/app/api/activities/submissions/route.ts`
- `apps/integrated-math-3/__tests__/convex/selected-quadratic-writer.test.ts`
- `apps/integrated-math-3/__tests__/app/api/activities/submissions/selected-route.test.ts`
- `apps/integrated-math-3/__tests__/convex/activities-create-idempotency.red.test.ts`

The legacy fixture now contains an approved stored activity. It also contains a matching active student profile and credential. Its 11 existing behavior assertions did not change.

## Integration limits

The main production files contain pending work for later IM3 nodes. The selected changes are narrow conditions for the two original stable activity IDs. The seed-2 activities and later node paths keep their existing behavior. The integrating reviewer must stage selected hunks instead of the full mixed-file diff.

## Parent final integration check

The parent repeated the 213-test app run, full lint, standalone TypeScript, and production build. These checks passed. The build log is `/tmp/im3-selected-writer-root-build.log`.

The final focused set adds a corrupt stored-attempt test and a registered-mutation boundary test. It now has 33 writer cases and eight route cases. The main app and isolated patch use different internal validation messages. Tests require the same rejection and no-write behavior. Public route error messages remain fixed.

The integration commit uses the reviewed HEAD patch for the selected writer, schema fields and indexes, authenticated route, and the two new test files. It preserves the broader pending app files in the working tree. The legacy fixture modernization remains working-tree verification until its own integration scope closes.

No live schema update, curriculum approval, seed, or deployment occurred. The selected draft catalog still rejects publication. Positive student-to-teacher evidence integration remains open.

Integration commit: `8470fd2b`. Final focused verification passed 41 tests in both the main app and isolated patch. Coverage includes 57 of 59 added writer statement entries and all 14 added writer functions. The route has 93.75 percent statement coverage and 100 percent function coverage. Existing unrelated activity handlers are outside this focused coverage result.
