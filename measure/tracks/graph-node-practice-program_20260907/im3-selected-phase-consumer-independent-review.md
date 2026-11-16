# IM3 Q16 selected Worked phase consumer independent review

Reviewer: graph_inventory  
Author under review: Maxwell  
Review date: 2026-09-08

## Initial review result

The first patch was not ready for integration. The server links the seeded physical activity to the current published lesson phase. The server also requires the exact stored acknowledgement before first completion. However, the real student renderer does not consume the projected activity props and does not render the selected activity as a Worked example.

## Findings

### P1 — The real phase renderer drops the verified activity props

The query adds `activityProps` from the verified activity at `apps/integrated-math-3/convex/student.ts:43-53` in the patch. `PhaseRenderer` does not pass `section.content.activityProps` to `ActivityRenderer` at `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx:168-177`. `ActivityRenderer` can accept and forward these props at `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx:19-22,73-82`, but this path does not use that support.

The selected consumer test cannot detect this defect. It replaces `PhaseRenderer` with a paragraph at `apps/integrated-math-3/__tests__/convex/selected-worked-lesson-consumer.test.tsx:27-30`. The test at lines 77-96 proves only that `LessonRenderer` builds the acknowledgement request. It does not prove that the seeded equation or variant reaches `GraphingExplorerActivity`.

The current seed uses `f(x) = x^2`, while the activity wrapper defaults to the equivalent `y = x^2`. This coincidence hides the missing data flow. Pass the verified `activityProps` through `PhaseRenderer`. Add a test that uses the real `PhaseRenderer`, `ActivityRenderer`, and registered graph component. Assert the displayed equation and Worked steps from the physical activity.

### P1 — The student receives the practice variant instead of the Worked display

`LessonRenderer` defaults to `mode="practice"` at `apps/integrated-math-3/components/lesson/LessonRenderer.tsx:46-54`. It passes that mode unchanged to `PhaseRenderer` at lines 302-310. `GraphingExplorerActivity` passes the mode to the shared graph component at `apps/integrated-math-3/components/activities/graphing/GraphingExplorerActivity.tsx:22-43`.

The shared component creates its Worked calculation only when `mode === "teaching"` at `packages/activity-components/src/components/graphing/GraphingExplorer.tsx:380-408`. In practice mode, it shows the interactive submission path. Thus, a student in the Worked phase does not receive the committed Worked calculation and step display.

This also creates a client dead end. The practice graph can call `handleActivitySubmit`, which adds the physical activity ID to `completedActivities` at `LessonRenderer.tsx:133-161`. `selectedWorkedSource` then becomes null because it excludes completed activity IDs at lines 85-96. The separate “I reviewed this worked example” action disappears before it creates the strict acknowledgement. The server then rejects phase completion.

Render this exact selected activity with the Worked presentation while keeping the student acknowledgement action available. Add a real component test that interacts with the graph before acknowledgement and proves that the acknowledgement action remains available until the strict acknowledgement succeeds.

### P1 — Completion replay runs current source checks before the existing completion check

The patch validates the current physical activity and current acknowledgement at `apps/integrated-math-3/convex/student.ts:230-255`. It reads the existing completed `student_progress` row only afterward at lines 257-267.

A learner can complete the phase successfully and lose the HTTP response. If the activity approval or graph publication is then withdrawn, the identical retry throws “Selected Worked activity is not available” or “Selected Worked acknowledgement is required.” It does not return `{ success: true, alreadyCompleted: true }`. This breaks the existing idempotent completion contract. It can also block a valid historical completion after a seed repair removes or replaces the physical source row.

Read the current completed row before the first-completion guard. Return the existing completion without new evidence or other writes. Add a regression for a successful completion, publication withdrawal, and an identical replay with unchanged row counts.

### P2 — The withdrawal sanitizer depends on untrusted cached identity

`withoutSelectedIdentity` removes selected fields only when stored `content.stableActivityId` already equals the selected stable ID at `apps/integrated-math-3/convex/student.ts:33-43`. The real seed stores only `componentKey` and `activityId` at `apps/integrated-math-3/convex/seed/seed_lesson_1_1.ts:288-291`. A stale section with an invalid physical activity and a different cached stable ID keeps all cached mastery and activity props. The current withdrawal test first writes the expected stable ID into the section at `selected-worked-lesson-consumer.test.tsx:123-137`, so it does not cover this case.

Treat stored projection fields as untrusted for the selected physical section. Strip them when the physical row does not satisfy the selected activity predicate. Add a case with a mismatched cached stable ID, mastery node, and props.

## Verified behavior

- `upsertIm3SelectedPilotSeed` validates the latest published Lesson 1.1 version, unique Worked Phase 4, exact source markdown, and exact sequence-2 activity section before it replaces the physical link. See `apps/integrated-math-3/convex/seed/seed_lesson_1_1.ts:192-293`.
- `isSelectedWorkedActivity` checks the stable activity ID, node ID, component, mode, SRS setting, approval, exact equation props, and grading configuration. See `apps/integrated-math-3/convex/activities.ts:556-570`.
- The acknowledgement writer accepts an empty-answer `practice.v1` Worked envelope. It stores no score and creates no learning evidence. The lookup checks the active student credential, exact physical activity, publication, idempotency key, attempt ordinal, timestamp, and ungraded envelope. See `apps/integrated-math-3/convex/activities.ts:572-674,742-775`.
- The patch removes the old student phase-completion call that fabricated `teacher_led` evidence. The downstream test uses literal points for `y = -x^2 - 1` and confirms that Independent evidence remains `awaiting_teacher_exposure` after student acknowledgement and phase completion. See `selected-worked-lesson-consumer.test.tsx:149-172`.
- Current draft graph publication fails closed. First completion cannot succeed when the graph or blueprint is not approved because the acknowledgement lookup checks current publication.

## Required test additions

1. Use the real renderer chain and assert that the physical activity props and Worked calculation reach the graph UI.
2. Interact with the graph before acknowledgement and prove that the acknowledgement action does not disappear.
3. Complete once, withdraw publication, and replay without new writes.
4. Reject or sanitize invalid physical activity data when cached identity fields are absent or mismatched.

## Revised patch review — 2026-09-08

### Result

The revision resolves the four findings from the first review, except for one withdrawal behavior defect. Do not accept the revised patch until the remaining P1 defect is fixed.

### P1 — A withdrawn selected activity still renders and can use the generic submission path

The revised sanitizer removes `stableActivityId`, `masteryNodeId`, `learningEvidenceMode`, `srsEligible`, and `activityProps`. It keeps `componentKey` and `activityId` at `apps/integrated-math-3/convex/student.ts:42-54`. The real seeded section already contains `componentKey: "graphing-explorer"` and the physical activity ID.

`PhaseRenderer` renders every activity section from these two retained fields at `apps/integrated-math-3/components/lesson/PhaseRenderer.tsx:161-179`. Because the selected stable ID is absent, it passes the normal student mode. `GraphingExplorerActivity` then uses its default `y = x^2` equation. The withdrawn selected source is still visible as an interactive graph.

`LessonRenderer` also does not identify this row as `selectedWorkedSource`. Therefore, its generic-submit exclusion at `apps/integrated-math-3/components/lesson/LessonRenderer.tsx:133-135` does not apply. A learner can send the withdrawn physical activity through the generic activity submission route. The server correctly blocks selected phase completion, but the client still exposes and submits the withdrawn activity.

The revised test at `apps/integrated-math-3/__tests__/convex/selected-worked-lesson-consumer.test.tsx:122-137` checks only that the acknowledgement button is absent. It does not assert that the graph and its generic submission action are absent.

Make the invalid or withdrawn selected physical section non-renderable as an activity. Preserve the phase guard. Add a real renderer test that asserts no graph UI and no submission call after physical approval or graph publication withdrawal. Test the normal seed shape, which contains only `componentKey` and `activityId`, and the stale-claim shape.

### Resolved findings

- The query props now reach `ActivityRenderer` through `PhaseRenderer`.
- The selected activity now uses the shared Worked display. The real test checks both Worked step headings and the absence of the graph check action.
- A generic submit from the selected Worked activity is ignored. The acknowledgement action remains available.
- Existing completion replay now runs before current source and acknowledgement checks. The new test proves no additional records after withdrawal.
- The sanitizer now recognizes stale selected claims by the physical stable ID or pilot node ID. This resolves the narrow stale-identity case from the first review.
- Student phase completion still creates no `teacher_led` evidence. Independent evidence still remains `awaiting_teacher_exposure` until a trusted teacher action occurs.

## Final withdrawal patch review — 2026-09-08

### Result

The final patch resolves the withdrawal behavior defect. The selected graph does not render. The acknowledgement control does not render. No selected or generic submission callback runs. New completion remains blocked. A completed phase still replays without new effects.

One user-facing copy defect remains before acceptance.

### P2 — The unavailable state exposes the internal sentinel key

The projection sets `componentKey: "unavailable"` at `apps/integrated-math-3/convex/student.ts:42-54`. The key is not registered. Thus, no activity fallback can run and no submission callback is attached. This behavior is correct.

However, the generic missing-component UI prints the key at `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx:63-69`. The student sees “Activity unavailable is not yet available.” The word `unavailable` is an internal sentinel value. The sentence is repetitive and unclear.

Show a short message such as “This activity is not available.” Do not show the sentinel key for this state. Update the real renderer tests to assert the student message instead of selecting the internal `code` value at `apps/integrated-math-3/__tests__/convex/selected-worked-lesson-consumer.test.tsx:147,170`.

### Final verification

- `unavailable` is not registered in the activity registry. The renderer returns before it creates an activity component or submission callback.
- The physical activity ID remains in the section. Therefore, the existing client phase gate remains closed.
- The physical-withdrawal test asserts no graph heading, Submit control, acknowledgement control, or server-owned submission call.
- The graph-publication-withdrawal test uses the normal seed section. It asserts the exact unavailable projection, no Submit control, no submission call, and no new completion.
- The completion replay check remains before all current source checks and preserves row counts.

## Final physical-source patch review — 2026-09-08

### Acceptance

Accepted for integration. No open Q16 finding remains.

The query now marks the exact Lesson 1.1, Phase 4, sequence-2 activity section as unavailable when its physical activity row is missing, changed, unapproved, or blocked by graph publication. It retains the physical activity ID for phase gating. It does not render a registered activity component. It does not call the selected acknowledgement writer or the generic submission writer.

The context predicate at `apps/integrated-math-3/convex/student.ts:164-172` limits the missing-physical-row fallback to the selected source position. Normal unrelated sections keep their content. A section outside that position changes only if its physical or cached metadata claims the selected stable activity or pilot node. This is a valid fail-closed identity rule.

The unknown-component branch at `apps/integrated-math-3/components/lesson/ActivityRenderer.tsx:61-68` uses the plain message `This activity is not available.` It does not show the internal component key.

The real-renderer tests cover missing physical activity, changed physical stable ID, physical approval withdrawal, graph publication withdrawal, no graph, no submit action, no acknowledgement action, blocked first completion, and preserved completed-phase replay. The existing downstream test still proves that student acknowledgement and phase completion do not create teacher exposure or SRS effects.

## Parent integration decision

Accept the selected HEAD patch after the final independent review. All reported Q16 findings are resolved in this patch. Parent verification passes 38 tests in seven files, app lint, a fresh app build, and post-build standalone TypeScript with candidate source mappings.

The shared worktree reconciliation remains under Q16. Source approval and the complete signed-in student journey remain open under Task 4.2. These checks do not approve the draft curriculum.
