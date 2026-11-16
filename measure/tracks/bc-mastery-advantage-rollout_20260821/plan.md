# Implementation Plan: BC Mastery Advantage Rollout

> **SUPERSEDED 2026-08-21:** Stop this plan. Do not execute any remaining task.
> Use `mastery-advantage-graph-remediation_20260821`.

**Track type:** Feature

**Scope:** 19 registered Business Math problem families

**Execution order:** Map -> Graph -> Red Tests -> Inputs -> Runtime -> KST -> Verify

**Implementation status (2026-08-21):** The 19-family inventory, minimum graph,
generic part-input adapter, no-auto-answer path, and read-only BC KST projection are
implemented. Only the accounting-equation family has an approved daily source. The
remaining source review and all-family queue and server-runtime expansion remain
blocked or incomplete. Review remediation is open for structured answer shapes,
server grading, legacy objective mapping, and provisional skill IDs.

## Junior Developer Rules

1. Read all files in the next section before the first edit.
2. Run `git diff -- <file>` before each edit.
3. Write a behavior test before production code.
4. Make one task Green before the next task starts.
5. Reuse the family registry, lesson route, assessment route, SRS engine, and
   shared KST bridge.
6. Do not add a challenge store. The 19 families are reconstructable.
7. Do not add a dependency without user approval.
8. Do not add a hash, fingerprint, checksum, or provenance field.
9. Commit only task-owned files after the task gates pass.

## Read Before Work

1. `AGENTS.md`
2. `measure/workflow.md`
3. `measure/tracks/bc-mastery-advantage-rollout_20260821/spec.md`
4. `measure/tracks/teacher-led-mastery-advantage_20260819/spec.md`
5. `measure/practice-component-contract.md`
6. `kst-srs.v3.2/SPECIFICATION.md`
7. `apps/bus-math-v2/product.md`
8. `apps/bus-math-v2/lib/curriculum/published-manifest.ts`
9. `apps/bus-math-v2/lib/practice/engine/family-registry.ts`
10. `apps/bus-math-v2/lib/practice/engine/types.ts`
11. `apps/bus-math-v2/lib/srs/answer-inputs/registry.ts`
12. `apps/bus-math-v2/components/student/DailyPracticeSession.tsx`
13. `apps/bus-math-v2/app/student/lesson/[lessonSlug]/page.tsx`
14. `apps/bus-math-v2/app/api/progress/assessment/route.ts`
15. `apps/bus-math-v2/convex/activities.ts`
16. `apps/bus-math-v2/convex/learningEvidence.ts`
17. `apps/bus-math-v2/lib/learning-evidence/bm2-pilot.ts`
18. `packages/math-content/src/knowledge-space/ids.ts`

The required file `apps/bus-math-v2/convex/_generated/ai/guidelines.md` is
absent in the 2026-08-21 baseline. Before any Convex edit, obtain approval to
run `npx convex ai-files install`, inspect its diff, and read that file. Stop if
the command changes a dependency or files outside managed Convex guidance.

## Phase 1: Approve the Family-to-Curriculum Map

- [x] **Task 1.1: Freeze the 19-family inventory in a test.**
  - [ ] Assert the exact registry keys:
    `accounting-equation`, `adjustment-effects`, `adjusting-calculations`,
    `classification`, `cvp-analysis`, `cycle-decisions`,
    `depreciation-presentation`, `depreciation-schedules`,
    `financial-analysis`, `interest-schedules`, `journal-entry`,
    `merchandising-entries`, `normal-balance`, `posting-balances`,
    `statement-construction`, `statement-subtotals`, `transaction-effects`,
    `transaction-matrix`, and `trial-balance-errors`.
  - [ ] Require each family to generate with seed `12345` and server mode
    `independent_practice`.
  - [ ] Require deterministic output on a repeated call.
- [x] **Task 1.2: Create one app-owned rollout map.**
  - [ ] Create
    `apps/bus-math-v2/curriculum/skill-graph/rollout-map.json`.
  - [ ] Add exactly 19 rows.
  - [ ] Give each row `familyKey`, `nodeId`, `sourceLessonSlug`,
    `sourceStableActivityId`, and `status`.
  - [ ] Keep the current accounting-equation pilot IDs unchanged.
  - [ ] Do not copy prompts, answers, rubrics, or generator definitions into
    the map.
- [b] **Task 1.3: Map each family to a real daily source.**
  - [ ] Inspect the published lesson manifest and seeded activities.
  - [ ] Select one authored source activity for each family.
  - [ ] Record exact lesson slug and stable activity ID.
  - [ ] Mark an unmapped family `blocked`.
  - [ ] Do not infer a mapping from title similarity alone.
- [b] **Task 1.4: Obtain curriculum-owner review.**
  - [ ] Review all 19 family-to-source rows.
  - [ ] Correct unit, lesson, activity, and node slug errors.
  - [ ] Change `status` to `approved` only after review.
  - [ ] Keep blocked rows out of production eligibility.
- [x] **Task 1.5: Add rollout-map validation tests.**
  - [ ] Require exactly one row per registry family.
  - [ ] Require no unknown family.
  - [ ] Require unique node IDs and source activity IDs.
  - [ ] Require each approved source lesson and activity to exist.
- [ ] **Task 1.6: Measure - User Manual Verification 'Phase 1: Approve the Family-to-Curriculum Map' (Protocol in `measure/workflow.md`).**

## Phase 2: Create the Minimum BC Graph

- [x] **Task 2.1: Extend math IDs only as required.**
  - [ ] Add a failing `validateMathId` test for the existing pilot node.
  - [ ] Add `bm2` to `MATH_COURSES`.
  - [ ] Do not change another ID format.
  - [ ] Run all `math-content` knowledge-space ID tests.
- [x] **Task 2.2: Author the 19 graph nodes.**
  - [ ] Create `apps/bus-math-v2/curriculum/skill-graph/nodes.json`.
  - [ ] Derive each node ID and title from the approved rollout map.
  - [ ] Include one domain node and only the minimum structure needed by the
    graph schema.
  - [ ] Keep exactly 19 nodes with `kind: skill`.
- [~] **Task 2.3: Author reviewed prerequisite edges.**
  - [ ] Create `apps/bus-math-v2/curriculum/skill-graph/edges.json`.
  - [ ] Use the approved curriculum sequence and accounting dependencies.
  - [ ] Give every prerequisite a rationale and review status.
  - [ ] Do not generate title-similarity edges.
  - [ ] Do not add a generic edge-generation framework for 19 nodes.
- [x] **Task 2.4: Add graph validation tests.**
  - [ ] Run `validateKnowledgeSpace` with the app-owned nodes and edges.
  - [ ] Require every edge endpoint to exist.
  - [ ] Require an acyclic prerequisite graph.
  - [ ] Require the exact family-to-skill bijection.
  - [ ] Require no IM1, IM2, IM3, or APPC node.
- [x] **Task 2.5: Add a static BC graph loader.**
  - [ ] Create `apps/bus-math-v2/lib/curriculum/skill-graph-loader.ts`.
  - [ ] Use module-scope JSON imports.
  - [ ] Return the full approved graph.
  - [ ] Do not read the file system at runtime.
- [ ] **Task 2.6: Measure - User Manual Verification 'Phase 2: Create the Minimum BC Graph' (Protocol in `measure/workflow.md`).**

## Phase 3: Replace the Auto-Answer Fallback

- [x] **Task 3.1: Add a failing no-auto-answer test.**
  - [ ] Use one of the 16 families without a specialized input.
  - [ ] Render `DailyPracticeSession`.
  - [ ] Prove `family.solve()` is not used as the student response.
  - [ ] Require a visible input for each required problem part.
  - [ ] Require the submitted envelope to contain the student's raw values.
- [~] **Task 3.2: Inventory the six part kinds.**
  - [ ] Cover `numeric`, `selection`, `journal-entry`, `statement-row`,
    `categorization`, and `explanation`.
  - [ ] Map each kind to an existing native input or shared accounting control.
  - [ ] Record only the kinds that need a small wrapper.
- [~] **Task 3.3: Implement one generic part-input adapter.**
  - [ ] Create one component under
    `apps/bus-math-v2/components/student/answer-inputs/`.
  - [ ] Render controls from `definition.parts`.
  - [ ] Keep answer state by `part.id`.
  - [ ] Build a `practice.v1` envelope with raw answers only.
  - [ ] Do not display or read `canonicalAnswer` in the browser.
- [x] **Task 3.4: Keep specialized inputs as overrides.**
  - [ ] Keep `AccountingEquationInput`, `NormalBalanceInput`, and
    `ClassificationInput` in the registry.
  - [ ] Use the generic adapter when no specialized input is registered.
  - [ ] Delete the `ProblemRenderer` auto-answer submission path.
- [~] **Task 3.5: Add all-family input conformance tests.**
  - [ ] Generate one definition for each of the 19 families.
  - [ ] Require every required part kind to render.
  - [ ] Require submit to contain user-entered raw answers.
  - [ ] Require no family to submit its solved response automatically.
- [ ] **Task 3.6: Measure - User Manual Verification 'Phase 3: Replace the Auto-Answer Fallback' (Protocol in `measure/workflow.md`).**

## Phase 4: Generalize Server-Owned Practice

- [ ] **Task 4.1: Add all-family reconstruction tests.**
  - [ ] Generate each family with a fixed seed and
    `{ mode: 'independent_practice' }`.
  - [ ] Resolve the family key from the registered prefix.
  - [ ] Extract the final numeric seed token from the activity ID.
  - [ ] Regenerate the definition on the server.
  - [ ] Require exact generated activity ID equality.
  - [ ] Reject an unknown family, altered seed, altered variant, wrong mode, and
    non-submitted status.
- [~] **Task 4.2: Generalize the assessment route.**
  - [ ] Edit `apps/bus-math-v2/app/api/progress/assessment/route.ts`.
  - [ ] Replace the accounting-only regular expression branch with a registry
    lookup and reconstruction helper.
  - [ ] Require a bounded non-blank `Idempotency-Key` for all generated
    Mastery Advantage submissions.
  - [ ] Pass raw answers and the opaque key to the existing writer.
  - [ ] Return safe HTTP 409 for idempotency conflict.
- [~] **Task 4.3: Generalize the Convex writer.**
  - [ ] Edit the existing writer in `apps/bus-math-v2/convex/activities.ts`.
  - [ ] Reconstruct with server-owned `independent_practice` mode.
  - [ ] Require exact activity ID equality.
  - [ ] Grade with the selected family.
  - [ ] Store server-owned parts, score, status, ordinal, and timestamp.
  - [ ] Compare normalized fields directly for replay conflict.
  - [ ] Do not add a request fingerprint.
- [~] **Task 4.4: Generalize the learning-evidence consumer.**
  - [ ] Replace the one-family allowlist with approved rollout-map lookup.
  - [ ] Load the stored submission by opaque ID.
  - [ ] Verify learner, node, family, activity, mode, grade, ordinal, and time.
  - [ ] Reuse teacher-first evaluation and existing SRS persistence.
  - [ ] Keep bounded indexed reads and receipt-first replay.
- [~] **Task 4.5: Generalize `DailyPracticeSession`.**
  - [ ] Treat every approved family as Mastery Advantage work.
  - [ ] Generate each definition with server-owned contract mode
    `independent_practice`.
  - [ ] Keep one create idempotency key per logical answer.
  - [ ] Cache the opaque `submissionId` after create.
  - [ ] Retry evidence with only `{ submissionId }`.
  - [ ] Keep accessible pending and error states.
- [~] **Task 4.6: Preserve ordinary daily curriculum assessment.**
  - [ ] Keep authored activity scoring and response shape unchanged.
  - [ ] For an approved source activity, send only its stored submission ID to
    the teacher-led consumer.
  - [ ] Derive teacher evidence ordinal and time from stored server fields.
  - [ ] Prove browser attempt number and submitted time have no effect.
- [ ] **Task 4.7: Measure - User Manual Verification 'Phase 4: Generalize Server-Owned Practice' (Protocol in `measure/workflow.md`).**

## Phase 5: Add BC KST Read and Eligibility

- [~] **Task 5.1: Normalize legacy SRS objective IDs.**
  - [ ] New cards use the graph node ID as `objectiveId`.
  - [ ] Keep the family key in the existing `problemFamilyId` field.
  - [ ] Map an existing family-key `objectiveId` to its graph node on read.
  - [ ] Do not add a schema field when the current string fields are sufficient.
- [~] **Task 5.2: Add a read-only BC KST query.**
  - [ ] Add the handler to `apps/bus-math-v2/convex/learningEvidence.ts` or the
    existing student progress module when that is the current read owner.
  - [ ] Query SRS cards through existing indexes.
  - [ ] Reuse the shared SRS-to-KST bridge and BC graph loader.
  - [ ] Return a safe 19-node student projection.
  - [ ] Do not persist a second KST state model.
- [b] **Task 5.3: Gate the practice queue.**
  - [ ] Require prior teacher-led exposure for the learner and node.
  - [ ] Require an approved rollout-map row.
  - [ ] Keep due SRS ordering for eligible cards.
  - [ ] Return `awaiting_teacher_exposure` for blocked cards.
- [x] **Task 5.4: Render proficiency in an existing progress surface.**
  - [ ] Prefer `/student/study/progress` or the student dashboard.
  - [ ] Show safe node title, state, readiness, and review status.
  - [ ] Do not add a new route when the existing progress page is sufficient.
  - [ ] Do not render raw answers, card IDs, or graph edges.
- [~] **Task 5.5: Add KST and SRS effect tests.**
  - [ ] Teacher-led evidence changes neither KST nor SRS.
  - [ ] Eligible evidence updates one SRS review.
  - [ ] The KST read reflects the updated SRS state.
  - [ ] Replay runs no duplicate bridge or review.
- [ ] **Task 5.6: Measure - User Manual Verification 'Phase 5: Add BC KST Read and Eligibility' (Protocol in `measure/workflow.md`).**

## Phase 6: Verification and Closeout

- [x] **Task 6.1: Run focused BC gates.**
  - [ ] Run family inventory, rollout map, graph, input, reconstruction,
    authority, teacher-first, KST, SRS, queue, replay, and retry selectors.
  - [ ] Run the accepted accounting-equation pilot tests unchanged.
  - [ ] Require all 19 families in the focused matrix.
- [~] **Task 6.2: Run BC quality gates.**
  - [ ] Run `CI=true npm run test --workspace=apps/bus-math-v2`.
  - [ ] Run coverage and require at least 80% for track-created code.
  - [ ] Run `npm run lint --workspace=apps/bus-math-v2`.
  - [ ] Run `npx tsc --noEmit -p apps/bus-math-v2/tsconfig.json`.
  - [ ] Run `npm run build --workspace=apps/bus-math-v2`.
  - [ ] Compare standing failures with the recorded pre-track baseline.
- [~] **Task 6.3: Run shared-package gates.**
  - [ ] Run test, lint, typecheck, and build for `practice-core`.
  - [ ] Run test, lint, typecheck, and build for `srs-engine`.
  - [ ] Run test, lint, typecheck, and build for `knowledge-space-core`.
  - [ ] Run test, lint, typecheck, and build for `knowledge-space-practice`.
  - [ ] Run test, lint, typecheck, and build for `math-content`.
- [x] **Task 6.4: Run repository gates.**
  - [ ] Run `node scripts/check-monorepo-boundaries.mjs`.
  - [ ] Run `node scripts/architecture/check-quality-parity.mjs`.
  - [ ] Run `npm run generate` and inspect generated diffs.
  - [ ] Run `npm run doctor`.
  - [ ] Run `git diff --check`.
- [ ] **Task 6.5: Run an approved local production-flow smoke.**
  - [ ] Start local Convex and the real Next app.
  - [ ] Authenticate through the real student session route.
  - [ ] Complete one mapped daily activity.
  - [ ] Complete supplementary work for three different part kinds.
  - [ ] Retry evidence with the opaque submission ID.
  - [ ] Record count-only evidence, SRS, KST, and receipt results.
  - [ ] Do not run this write without user approval.
- [~] **Task 6.6: Reconcile Measure facts.**
  - [ ] Record the final approved family count.
  - [ ] Record blocked family mappings, if any.
  - [ ] Record all-family input and reconstruction evidence.
  - [ ] Update `measure/tech-debt.md`, `measure/tracks.md`, and metadata.
- [ ] **Task 6.7: Measure - User Manual Verification 'Phase 6: Verification and Closeout' (Protocol in `measure/workflow.md`).**
