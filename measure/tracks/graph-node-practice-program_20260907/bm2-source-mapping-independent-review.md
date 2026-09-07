# BM2 source mapping boundary independent review

Date: 2026-09-07

## Scope

This review covers the bounded change to `isBm2PilotSourcePublished`. It checks the removed Lesson 1 notebook mapping and the registered teacher exposure mutation. It does not approve a graph, activity, or adaptive mode.

## Finding

The prior helper checked the node, published lesson, manifest activity, and authored activity. It did not check whether the reviewed blueprint still mapped that activity to the exact node. The physical notebook remained published after the graph mapping was removed. The helper therefore returned `true` for a source that no longer had an exact evidence mapping.

The bounded production fix is correct. It now requires all of these conditions:

- The selected node remains a reviewed skill.
- The selected blueprint remains reviewed.
- The blueprint `metadata.activityIds` includes `unit-1-lesson-1-activity-1`.
- The lesson version remains published.
- The published and authored activities remain the expected notebook component.

The current blueprint activity list is empty. The helper now returns `false`. The broader adaptive publication helper also returns `false` because it depends on the source helper.

## Teacher consumer verification

The registered `verifyTeacherExposure` internal mutation calls `isBm2PilotSourcePublished` before it patches the source submission or processes learning evidence. A focused test supplies an otherwise valid teacher, learner, active enrollment, class, published lesson version, linked phase section, student progress, activity, and source submission.

The mutation returns `{ accepted: false, reason: "submission_not_found" }`. It does not patch the submission. It does not insert learning evidence. This proves that the removed graph mapping closes the actual teacher evidence boundary.

The test file is `apps/bus-math-v2/__tests__/lib/learning-evidence/bm2-source-mapping-teacher-boundary.test.ts`.

## Compatibility

`BM2_LEARNING_EVIDENCE_PILOT.mappings` still names the former notebook source. This static mapping remains inert because the publication gate is closed. Keep it until the exact replacement source mapping is reviewed. Do not infer approval from the physical manifest activity.

The parent updated `bm2-pilot-publication.test.ts` after review. It now expects both source and adaptive publication to be false after the source mapping is withdrawn. The physical notebook activity remains published.

## Result

The parent passed 33 tests across the helper, registered teacher boundary, publication, and related evidence suites. App lint, standalone TypeScript, and the production build passed. The workbook manifest was restored from its exact pre-build copy after a content comparison. The fix remains pending catalog integration because the committed `HEAD` does not contain the current graph catalog.
