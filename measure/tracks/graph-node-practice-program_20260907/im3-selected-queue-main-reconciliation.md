# IM3 Q14 main reconciliation

Date: 2026-09-08

## Result

The mixed main queue now applies the committed Q14 identity guard to the two original selected quadratic activities. It preserves the pending seed 2 and later-node queue branches.

The guard treats the original card variant, practice-item variant, activity stable identifier, activity node, or selected card objective as a selected claim. It excludes the row unless the current graph publication, physical activity approval, node, component, SRS flag, variant identities, and exact committed seed props and grading configuration agree.

The guard also treats an activity with the selected mastery node as a selected claim. A seed 2 exception applies only when the card, practice item, and activity use the same known seed 2 identifier and the selected node and component are exact. One malformed seed 2 field cannot route the row through the generic path. The existing 95-test first-offer suite confirms that valid seed 2 and later-node order still works.

The queue supplies `practiceMode` only for the two original selected activities. The mixed `PracticeCardRenderer` keeps its existing envelope builder and later-mode handling. The mixed graph wrapper already forwards the complete shared props. I did not change either component.

## Owned source delta

- `apps/integrated-math-3/convex/learningEvidence.ts`: Export `hasCurrentSelectedActivityIdentity`. Narrow its input to the existing activity and activity-ID fields. Do not change its serializer.
- `apps/integrated-math-3/convex/queue/queue.ts`: Add the original selected guard, the publication test seam, exact current activity identity reuse, and original selected `practiceMode` metadata.

## Test delta

- `apps/integrated-math-3/__tests__/convex/queue/queue.test.ts`: Modernize the original selected fixture for the approved publication and physical activity contract. Add selected card-node fallback, selected activity-node fallback, malformed seed 2, changed props, and changed grading regressions.
- `apps/integrated-math-3/__tests__/components/student/PracticeCardRenderer-selected-graph-real.test.tsx`: Make the memory query support the existing teacher-exposure chain. Keep the actual resolver, graph component, five points, hint telemetry, and server-grader proof.
- `apps/integrated-math-3/__tests__/convex/queue/im3-first-offer-queue.red.test.ts`: Add approved status to the two original selected activity fixtures. This file was already untracked before this task. The two fixture additions are the only Q14 changes in it.

## Preserved files

I saved the mixed-file state before the source changes in `/tmp/20260908_q14_main_before`.

- `queue.ts`
- `learningEvidence.ts`
- `PracticeCardRenderer.tsx`
- `GraphingExplorerActivity.tsx`
- `mixed.diff`

The exact source delta is in `queue.own.diff` and `learningEvidence.own.diff`. The component comparison files are empty because I did not change the mixed components.

## Verification

The focused run passed 186 tests:

- Queue: 17
- Pending first-offer queue: 95
- Practice card renderer: 59
- Real selected graph composition: 1
- Selected practice provider: 14

Oxlint passed. `npx tsc --noEmit` passed. `git diff --check` passed for the changed source and test paths.

The provider retry test writes its expected simulated network failure to standard error. The test passes.

## Parent acceptance

The parent inspected both source deltas and the two follow-up fallback regressions. The selected activity node is a selected claim. A later-graph exception requires the exact consistent tuple. The parent production build passed. The report records equivalent selected behavior in the shared worktree. Pending later-node code remains outside the selected commit.
