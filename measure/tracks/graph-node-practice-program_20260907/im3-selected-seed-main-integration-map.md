# IM3 Selected Seed Main Integration Map

Date: 2026-09-07

## Integration boundary

Apply the selected seed behavior inside `apps/integrated-math-3/convex/seed/seed_lesson_1_1.ts`. Do not replace this mixed file. It contains later-node and seed-2 work.

The proposed scratch patch is `/tmp/im3-selected-quadratic-seed-head.patch`. Its baseline is `deb0137e`. The current main tree already contains many of its dependencies and broader implementations.

## Existing selected symbols

Keep these current symbols and replace their selected behavior with the required invariants:

- `buildIm3PilotSeedDocuments`, near line 331.
- `buildIm3GuidedPilotSeedDocuments`, near line 396.
- `upsertIm3PilotSeed`, near line 3951.
- `ensureIm3TeacherLedSourceActivity`, near line 4119.
- `seedLesson1`, near line 4250.
- The selected calls near lines 4620 and 4657.
- The Guided calls near lines 4661 through 4663.

Use one selected consumer at the existing post-phase upsert point. Remove the duplicate selected Worked, Guided, and Independent calls after the new consumer is in place. Keep every later-node and seed-2 call.

## Source reconciliation

The authoritative Phase 4 source near line 4357 uses `f(x) = x^2`. Align only the selected Worked activity with this source.

Change these selected locations from `f(x) = x^2 + 2x - 3` to `f(x) = x^2`:

- The selected source-link markdown near line 4063.
- The selected Worked description and props near lines 4169 and 4172.
- The selected teacher acknowledgement matcher in `apps/integrated-math-3/convex/learningEvidence.ts`, near line 2793.

Do not change `buildIm3DomainRangeWorkedSeedDocument`, near lines 650 through 690. That separate capability intentionally uses `f(x) = x^2 + 2x - 3` and asks for domain and range.

## Fail-closed invariants

The selected consumer must:

- Require the exact `module-1-lesson-1` lesson.
- Require the unique highest published lesson version.
- Reject a lesson that has versions but no published version.
- Reject duplicate latest published versions.
- Require one Phase 4 with `phaseType = "worked_example"`.
- Require the exact sequence-1 source text for `f(x) = x^2`.
- Require one sequence-2 activity section.
- Accept that activity section only when it contains the original `step-by-step-solver` source for `f(x) = x^2` or the canonical selected Worked activity.
- Create new physical activities with `approval.status = "unreviewed"` and `srsEligible = false`.
- Preserve approval and SRS state only when reviewed content is structurally identical.
- Reject changed approved content.
- Reset changed unreviewed content to unreviewed and SRS-disabled.
- Compare nested content with canonical structural equality.
- Reject duplicate or conflicting practice-item rows across both variant and activity indexes.
- Use a real inserted activity ID. Do not use `activities:pending`.

## Existing dependencies

Keep the current constants in `apps/integrated-math-3/lib/practice/learning-evidence-pilot.ts`, near lines 81 through 105. They already include the selected Worked, Guided, and Independent stable IDs and variant keys.

Keep the current activity fields in `apps/integrated-math-3/convex/schema.ts`, near lines 466 through 483. They already include `stableActivityId`, `masteryNodeId`, `srsEligible`, `learningEvidenceMode`, and `approval`. Do not duplicate these schema fields.

## Tests that require alignment

Add the proposed focused test as `apps/integrated-math-3/__tests__/convex/selected-quadratic-seed.test.ts`.

Update only selected `f(x) = x^2 + 2x - 3` fixtures in:

- `apps/integrated-math-3/__tests__/convex/im3-graph-real-production-flow.test.ts`.
- `apps/integrated-math-3/__tests__/convex/im3-graph-teacher-exposure.test.ts`.
- `apps/integrated-math-3/__tests__/convex/seed/im3-example-1-graph-worked-source.test.ts`.
- `apps/integrated-math-3/__tests__/convex/seed/teacher-led-source-preservation.test.ts`.
- `apps/integrated-math-3/__tests__/convex/seed/seed-lesson-1-pilot-upgrade.test.ts`.

Do not change domain-range fixtures that use the same equation. They test a separate node.

The proposed focused seed suite has five tests. It covers actual `seedLesson1` invocation, repeated invocation, reordered nested keys, stale SRS reset, changed approved content, version authority, source ownership, and practice-item conflicts.

## Current main integration verification

The selected source uses the normalized original solver props. The domain-range helper now owns Phase 4 sequences 4 and 5. The selected graph source retains sequences 1 and 2. Sequence 3 remains intact. The real lesson seed test verifies both physical Worked links and identical sections after replay. Both stable Worked sources appear once.

The main selected seed and seeded-submission tests pass. The production build passes. A separate regression proved that a student domain-range Worked acknowledgement incorrectly produced teacher-led evidence. That branch now returns no evidence. Verified teacher integration for that capability remains open.

The first broader compatibility run had 17 failures and 162 passes. Explicit test-only physical approval and SRS eligibility, corrected x² fixtures, and draft seed assertions resolved 15 failures. The two active-identity fixtures now include matching active credentials. The combined main run passes 186 tests. Independent helper review also passes 16 related tests, including source conflicts and the complete linked-activity contract. The full main integration is not accepted yet. No publication, database seed, or deployment occurred.

The root package test command was started in error during compatibility verification and was stopped. Its result does not support app acceptance. The compatibility counts above come from the IM3 app directory.
