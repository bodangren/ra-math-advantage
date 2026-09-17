# IM3 Pilot Integration Scope

Date: 2026-09-07

## Purpose

This audit compares the verified IM3 graph pilot in the working tree with `HEAD` at `ca26fe49`. It defines the minimum integration groups. It does not approve or publish the draft curriculum.

## Integration Rule

Do not stage the complete modified app files as one group. Several files contain large changes for other IM3 capabilities and other active tracks. Extract the named symbols and their direct schema fields. Then run the complete pilot test set.

## Group 1: Shared Contracts and Renderer

These changes are not in `HEAD`. The app pilot cannot compile or render without them.

- `packages/math-content/src/knowledge-space/generators/registry.ts`: keep the existing `quadratic-graph-analysis` generator and registry entry. The exact Independent seed uses `seed: 0`, `difficulty: 0.5`, and `y = -x^2 - 1`.
- `packages/math-content/src/knowledge-space/index.ts` and `packages/math-content/src/index.ts`: export the generator lookup used by the seed.
- `packages/math-content/src/schemas/graphing-explorer.schema.ts` and its schema exports: keep `responseVariant: table_graph` and the public graph props.
- `packages/activity-components/src/components/graphing/GraphingExplorerActivity.tsx`, `GraphingExplorer.tsx`, and `InteractiveTableOfValues.tsx`: keep table entry, point entry, and submission output for `table_values` and `placed_points`.
- `packages/activity-components/src/schemas/graphing-explorer.schema.ts`, schema exports, and package exports: keep the matching renderer contract.
- `packages/practice-core/src/practice/learning-evidence.ts` and its exports: keep the teacher-first evidence decision and normalized `learning-evidence.v1` contract.
- `packages/srs-engine/src/srs/submission-srs-adapter.ts`: keep the receipt-safe submission-to-SRS behavior used by the IM3 evidence bridge.

These package files contain work for many other capabilities. Stage only the pilot symbols and required shared contract changes. Include their focused tests. Do not stage unrelated new component families.

## Group 2: App Activity Contract and Server Grader

Required files:

- `apps/integrated-math-3/lib/activities/server-grading.ts` is a new file. Keep the pilot branch in `gradeServerOwnedSubmission`, `expectedPilotPoints`, `matchesPilotPoints`, and the exact two-part rubric validation.
- `apps/integrated-math-3/lib/activities/seed-props.ts` is a new direct dependency of the grader. Keep only the normalization required by supported activity props.
- `apps/integrated-math-3/lib/activities/submission.ts`: keep the opaque server submission call, the idempotency key, and the returned server grade fields used by the student UI.
- `apps/integrated-math-3/convex/activities.ts`: keep the pilot publication predicate, exact activity identity checks, snake_case part mapping, `createServerOwnedSubmissionHandler`, internal `createServerOwnedSubmission`, and the Worked acknowledgement rules in `submitActivity`.
- `apps/integrated-math-3/convex/schema.ts`: keep the pilot graph props, grading `partIds` and rubric `partId`, activity stable identity fields, submission mastery and attempt fields, and the two submission idempotency indexes.

`activities.ts`, `submission.ts`, and `schema.ts` contain broad work for other modes and security tasks. A whole-file commit would include unrelated changes. Use symbol-level extraction.

Minimum tests:

- `__tests__/lib/activities/server-grading.test.ts`
- `__tests__/convex/activities-create-idempotency.red.test.ts`
- `__tests__/convex/activities-server-owned-recovery.red.test.ts`
- Pilot cases from `__tests__/convex/activities-public-create-boundary.red.test.ts`
- `__tests__/app/api/activities/submissions/route.test.ts`

## Group 3: Seed and Draft Publication Gate

Required files:

- `apps/integrated-math-3/convex/seed/seed_lesson_1_1.ts`: keep `buildIm3PilotSeedDocuments` and the exact Worked, Guided, and Independent seed/upsert calls for the selected node.
- `apps/integrated-math-3/lib/practice/learning-evidence-pilot.ts`: keep the selected node IDs, stable activity IDs, pilot allow-list entry, and evidence decision types.
- `apps/integrated-math-3/lib/curriculum/skill-graph-loader.ts`: keep the current canonical node and blueprint status reader used by production gates.
- The selected rows in `curriculum/skill-graph/module-1/nodes.json`, `blueprints.json`, and `projection/practice-v1-activity-map.json`.
- The selected row in `curriculum/skill-graph/projection/srs-input.json` if the seed/readiness tests require it.

The selected node and blueprint must stay `draft`. Runtime publication must stay false for the real catalog. Tests can inject a hypothetical approved publication fixture.

The seed file contains more than 4,000 added lines for other Lesson 1.1 capabilities. Do not stage the full file without a separate review. Extract the pilot builders and their direct upsert calls.

Minimum tests:

- `__tests__/convex/seed/im3-pilot-seed.test.ts`
- `__tests__/convex/seed/seed-im3-pilot-mapping.red.test.ts`
- `__tests__/convex/seed/seed-lesson-1-pilot-upgrade.test.ts`
- `__tests__/convex/seed/teacher-led-source-preservation.test.ts`
- `__tests__/lib/practice/learning-evidence-pilot.test.ts`

## Group 4: Student Writer and UI

Required production files:

- `apps/integrated-math-3/app/api/activities/submissions/route.ts`: authenticated opaque activity write.
- `apps/integrated-math-3/app/api/learning-evidence/im3-pilot/route.ts`: authenticated opaque evidence processing.
- `apps/integrated-math-3/components/activities/graphing/GraphingExplorerActivity.tsx`: app wrapper that emits the two snake_case parts.
- `apps/integrated-math-3/components/student/PracticeCardRenderer.tsx`: renderer selection and submission callback.
- `apps/integrated-math-3/components/student/PracticeSessionProvider.tsx`: durable write, evidence call, retry, and server-result handling.

`PracticeCardRenderer.tsx` and `PracticeSessionProvider.tsx` contain many changes outside the exact pilot. Keep only the graph activity and durable server-authority paths plus their direct timing dependencies. Do not include other activity families in this commit.

Required tests:

- `__tests__/components/activities/graphing/GraphingExplorerActivity-pilot.test.tsx`
- `__tests__/components/student/PracticeCardRenderer.test.tsx` pilot cases
- `__tests__/components/student/PracticeSessionProvider-server-authority.test.tsx`
- `__tests__/components/student/PracticeSessionProvider-retry-acceptance.test.tsx`
- API route tests under `__tests__/app/api/activities/submissions/` and `__tests__/app/api/learning-evidence/im3-pilot/`

## Group 5: Teacher Action, Evidence, and SRS

Required production files:

- `apps/integrated-math-3/app/api/teacher/graph-exposure/route.ts`: teacher-only route with strict body fields and idempotency key.
- `apps/integrated-math-3/components/teacher/Im3GraphExposureForm.tsx`: teacher action UI.
- The three small IM3 exposure hunks in `apps/integrated-math-3/app/teacher/students/page.tsx`: import, candidate query, and filtered form render.
- `apps/integrated-math-3/convex/learningEvidence.ts`: keep exact Worked acknowledgement validation, current lesson publication validation, teacher candidate query, teacher attestation mutation, canonical replay validation, stored Independent evidence construction, receipt-first wrapper, and `applyIm3SrsReview` for the selected activity.
- `apps/integrated-math-3/convex/schema.ts`: keep `learning_evidence.submissionId`, the evidence indexes, `learning_evidence_receipts`, and the SRS card objective/variant index.
- `apps/integrated-math-3/convex/_generated/api.d.ts`: regenerate after the selected Convex functions exist. Do not hand-select stale generated declarations.

The current `learningEvidence.ts` differs from `HEAD` by approximately 3,000 added lines. Most of that file supports other IM3 graph capabilities. A whole-file stage is not a bounded pilot commit. Extract the selected graph node path and its common receipt/SRS dependencies. Keep the new canonical replay predicate from the independent repair.

Minimum tests:

- `__tests__/convex/im3-graph-teacher-exposure.test.ts`
- `__tests__/app/api/teacher/graph-exposure-route.test.ts`
- `__tests__/convex/learningEvidence-submission-authority.red.test.ts` selected-pilot and replay cases
- `__tests__/convex/im3-graph-real-production-flow.test.ts`

## Optional Queue and Knowledge-State Group

The verified writer, teacher, evidence, and SRS flow does not require the current broad queue or knowledge-state changes to prove persistence. Files such as `convex/queue/queue.ts`, `convex/queue/sessions.ts`, `convex/student/knowledge_state.ts`, and `app/student/knowledge-state/page.tsx` belong to later offer/read-model integration unless the selected UI entry point calls them directly.

Do not include these whole files in the pilot production-flow commit. If the commit must expose the activity through the practice queue, extract only the selected node readiness gate and exact activity selection. Keep the real draft publication result unavailable.

## Blockers and Dependencies

1. The shared generator, renderer contract, learning-evidence contract, and SRS adapter are not in `HEAD`. The app changes cannot be isolated from these exact package changes.
2. The app seed, activity writer, evidence file, schema, and student practice files mix the pilot with other pending work. A normal whole-file stage would include unrelated changes.
3. The generated Convex API declaration depends on the final selected Convex source. Regenerate it after hunk extraction.
4. The current catalog is intentionally draft. A local commit needs no approval or deployment. Runtime tests must continue to prove fail-closed behavior with the real catalog.

## Recommended Commit Order

1. Commit the shared generator, graph renderer contract, evidence contract, and SRS adapter with focused package tests.
2. Commit the app schema, selected seed, writer, grader, and authenticated student routes.
3. Commit the teacher route, teacher UI, evidence wrapper, and SRS bridge.
4. Commit the selected draft graph catalog rows and integration tests.

After each extraction, run the selected tests. After the final group, run app lint, `tsc --noEmit`, build, and the full IM3 pilot test set. Keep all publication assertions false for the current catalog.
