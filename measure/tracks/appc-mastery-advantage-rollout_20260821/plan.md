# Implementation Plan: APPC Mastery Advantage Rollout

> **SUPERSEDED 2026-08-21:** Stop this plan. Do not execute any remaining task.
> Use `mastery-advantage-graph-remediation_20260821`.

**Track type:** Feature

**Scope:** 73 APPC mastery skills and 58 seeded lessons

**Execution order:** Graph -> Red Tests -> Daily Runtime -> KST -> Generators -> Verify

**Implementation status (2026-08-21):** The APPC graph projection is repaired, the
runtime graph excludes draft prerequisites, the read-only KST projection is live, and
the published lesson dashboard and lesson route are wired. The generic lesson
renderer and submission path, source-approved generator work, and transfer provider
remain incomplete. Review remediation is open for the lesson runtime and bounded
Convex reads.

## Junior Developer Rules

1. Read all files in the next section before the first edit.
2. Run `git diff -- <file>` before each edit.
3. Write a behavior test before production code.
4. Make one task Green before the next task starts.
5. Reuse existing schemas, seed data, packages, and routes.
6. Do not create a second graph, bridge, scheduler, or lesson model.
7. Do not add a dependency unless a Red test proves an installed dependency is
   insufficient and the user approves the dependency change.
8. Do not add a hash, fingerprint, checksum, or provenance field.
9. Commit only task-owned files after the task gates pass.

## Read Before Work

1. `AGENTS.md`
2. `measure/workflow.md`
3. `measure/tracks/appc-mastery-advantage-rollout_20260821/spec.md`
4. `measure/tracks/teacher-led-mastery-advantage_20260819/spec.md`
5. `measure/practice-component-contract.md`
6. `kst-srs.v3.2/SPECIFICATION.md`
7. `apps/pre-calculus/product.md`
8. `apps/pre-calculus/curriculum/README.md`
9. `apps/pre-calculus/curriculum/skill-graph/nodes.json`
10. `apps/pre-calculus/curriculum/skill-graph/edges.json`
11. `apps/pre-calculus/curriculum/skill-graph/draft-nodes.json`
12. `apps/pre-calculus/curriculum/skill-graph/generator-gap-queue.json`
13. `apps/pre-calculus/curriculum/skill-graph/projection/practice-v1-activity-map.json`
14. `scripts/generate-course-edges.ts`
15. `packages/knowledge-space-core/src/edge-suggestions.ts`
16. `apps/pre-calculus/convex/schema.ts`
17. `apps/pre-calculus/convex/student.ts`
18. `apps/pre-calculus/convex/activities.ts`
19. `apps/pre-calculus/convex/learningEvidence.ts`
20. `apps/pre-calculus/app/student/dashboard/page.tsx`

The required file `apps/pre-calculus/convex/_generated/ai/guidelines.md` is
absent in the 2026-08-21 baseline. Before any Convex edit, obtain approval to
run `npx convex ai-files install`, inspect its diff, and read that file. Stop if
the command changes a dependency or files outside managed Convex guidance.

## Phase 1: Repair the Existing Graph Projection

- [~] **Task 1.1: Lock the graph defect with tests.**
  - [ ] Assert 73 skill nodes in `nodes.json`.
  - [ ] Assert zero skill nodes in `draft-nodes.json`.
  - [ ] Assert the current generated edge file has zero `prerequisite_for`
    edges.
  - [ ] Add a generator fixture with `metadata.unit` and `lesson`.
  - [ ] Require APPC generation to produce a deterministic prerequisite
    candidate for sequential reviewed skills.
  - [ ] Require IM1, IM2, and IM3 fixture output to remain unchanged.
- [x] **Task 1.2: Make the minimum generator correction.**
  - [ ] Edit only the APPC course configuration and APPC preprocessing in
    `scripts/generate-course-edges.ts`.
  - [ ] Change the APPC input from `draft-nodes.json` to `nodes.json`.
  - [ ] Copy `metadata.unit` to `metadata.module` in memory.
  - [ ] Do not rewrite `nodes.json` to rename its authored metadata.
  - [ ] Reuse `suggestEdges` unchanged unless a test proves a general defect.
- [x] **Task 1.3: Regenerate APPC edges only.**
  - [ ] Add a course selector to the existing script only if it is needed to
    avoid unrelated output churn.
  - [ ] Do not regenerate IM1, IM2, or IM3 files.
  - [ ] Inspect every APPC edge diff.
  - [ ] Require all edge endpoints to exist in `nodes.json`.
  - [ ] Require stable output on a second run.
- [x] **Task 1.4: Create the curriculum review queue.**
  - [ ] Put each new low-confidence prerequisite candidate in the existing
    APPC standards or edge review artifact.
  - [ ] Include source node, target node, unit, topic, rationale, and status.
  - [ ] Do not add a checksum or a second review manifest.
  - [ ] Require a curriculum owner to mark each candidate approved or rejected.
- [x] **Task 1.5: Gate readiness on approved prerequisites only.**
  - [ ] Add a graph-loader test that excludes draft prerequisites from KST.
  - [ ] Add a graph-loader test that includes approved prerequisites.
  - [ ] Keep containment, standards, and support edges available for reporting.
- [ ] **Task 1.6: Measure - User Manual Verification 'Phase 1: Repair the Existing Graph Projection' (Protocol in `measure/workflow.md`).**

## Phase 2: Finish the Pilot KST Read

- [x] **Task 2.1: Review the existing Red tests.**
  - [ ] Keep these files unchanged unless a fixture is factually wrong:
    - `apps/pre-calculus/__tests__/lib/curriculum/skill-graph-loader.test.ts`
    - `apps/pre-calculus/__tests__/convex/precalculus-kst-consumer.red.test.ts`
    - `apps/pre-calculus/__tests__/convex/learning-evidence-production-flow.red.test.ts`
    - `apps/pre-calculus/__tests__/components/student/PrecalculusMasteryAdvantagePilot.acceptance.test.tsx`
  - [ ] Re-run the selector.
  - [ ] Record the expected 9 Green and 4 Red baseline.
- [x] **Task 2.2: Add the static APPC graph loader.**
  - [ ] Create `apps/pre-calculus/lib/curriculum/skill-graph-loader.ts`.
  - [ ] Copy the static-import pattern from the IM3 loader.
  - [ ] Import `nodes.json` and `edges.json` at module scope.
  - [ ] Filter readiness edges by review status.
  - [ ] Return the full APPC projection.
  - [ ] Do not read the file system at runtime.
- [x] **Task 2.3: Add the read-only APPC KST handler.**
  - [ ] Add the handler to `apps/pre-calculus/convex/learningEvidence.ts`.
  - [ ] Query SRS cards through the existing composite index.
  - [ ] Reuse `aggregateCardsToEvidence`, `computeObjectiveProficiency`, and
    `buildKstState`.
  - [ ] Accept server-owned learner ID and `now` only.
  - [ ] Return a safe student projection.
  - [ ] Do not persist another KST snapshot.
- [x] **Task 2.4: Register and render the pilot read.**
  - [ ] Register an `internalQuery` with exact argument and return validators.
  - [ ] Authenticate before the dashboard query.
  - [ ] Render only node title, status, and readiness.
  - [ ] Do not render SRS IDs, raw answers, graph edges, or query arguments.
- [x] **Task 2.5: Make the four-file selector Green.**
  - [ ] Run the exact four files from Task 2.1.
  - [ ] Require all 13 tests to pass unless an inspected test addition changes
    the count.
  - [ ] Keep APPC evidence receipts at `kstApplied: false`.
- [ ] **Task 2.6: Measure - User Manual Verification 'Phase 2: Finish the Pilot KST Read' (Protocol in `measure/workflow.md`).**

## Phase 3: Build the Real Daily Lesson Runtime

- [ ] **Task 3.1: Add lesson-query behavior tests.**
  - [ ] Test one seeded lesson from each unit.
  - [ ] Require published version, ordered phases, ordered sections, activities,
    and learner progress.
  - [ ] Require student ownership and role checks.
  - [ ] Require `notFound()` for an unknown slug.
  - [ ] Require bounded indexed queries. Do not permit unbounded history reads.
- [~] **Task 3.2: Implement the student lesson query in `convex/student.ts`.**
  - [ ] Replace the empty dashboard behavior with real lesson data.
  - [ ] Add one internal lesson-progress query.
  - [ ] Reuse the existing lesson, version, phase, activity, and progress tables.
  - [ ] Do not add a parallel curriculum schema.
- [~] **Task 3.3: Add `/student/lesson/[lessonSlug]`.**
  - [ ] Create
    `apps/pre-calculus/app/student/lesson/[lessonSlug]/page.tsx`.
  - [ ] Require `requireStudentSessionClaims` before data access.
  - [ ] Call the internal lesson query with `claims.sub` and the slug.
  - [ ] Render the current phase and progress.
  - [ ] Follow the IM3 route for flow and the APPC design file for appearance.
- [~] **Task 3.4: Add the minimum APPC lesson renderer adapter.**
  - [ ] First use exports from `@math-platform/lesson-renderer`.
  - [ ] Add one app-local adapter only for APPC phase and activity data.
  - [ ] Reuse `practice.v1` activity components.
  - [ ] Do not copy the full BM2 or IM3 renderer.
- [ ] **Task 3.5: Add one generic daily submission route.**
  - [ ] Use
    `apps/pre-calculus/app/api/activities/submissions/route.ts`.
  - [ ] Keep the Topic 1.1 route as a thin compatibility adapter.
  - [ ] Require a student session and bounded `Idempotency-Key`.
  - [ ] Accept raw response data and stable activity ID only.
  - [ ] Resolve score, ordinal, time, learner, origin, and node on the server.
  - [ ] Send only the stored opaque `submissionId` to teacher evidence.
- [x] **Task 3.6: Replace pilot-only dashboard navigation.**
  - [ ] List all 58 seeded lessons from `getDashboardData`.
  - [ ] Link each lesson to `/student/lesson/[lessonSlug]`.
  - [ ] Keep the Topic 1.1 pilot visible until the generic path has equivalent
    tests.
  - [ ] Put daily curriculum before supplementary Mastery Advantage.
- [ ] **Task 3.7: Prove phase completion and teacher exposure.**
  - [ ] Complete one real activity and phase through the public flow.
  - [ ] Require one source submission and one `teacher_led` evidence row.
  - [ ] Require no KST or SRS effect from the teacher event.
  - [ ] Require retry to reuse the same logical idempotency key.
- [ ] **Task 3.8: Measure - User Manual Verification 'Phase 3: Build the Real Daily Lesson Runtime' (Protocol in `measure/workflow.md`).**

## Phase 4: Generalize Mastery Advantage

- [~] **Task 4.1: Define projection-backed enablement tests.**
  - [ ] Require one decision for each of the 73 skill nodes.
  - [ ] Require daily source, real generator, renderer, and SRS row for enabled
    status.
  - [ ] Require STUB blueprints to stay disabled.
  - [ ] Keep the Topic 1.1 pilot row compatible.
- [ ] **Task 4.2: Generalize the existing server-owned writer.**
  - [ ] Start in `apps/pre-calculus/convex/activities.ts`.
  - [ ] Resolve the enabled activity from canonical projection data.
  - [ ] Grade raw answers on the server.
  - [ ] Assign ordinal and time on the server.
  - [ ] Compare normalized fields directly for idempotency conflict.
  - [ ] Do not add a request fingerprint.
- [ ] **Task 4.3: Generalize `convex/learningEvidence.ts`.**
  - [ ] Load the stored submission by opaque ID.
  - [ ] Verify owner, node, stable activity, mode, grade, ordinal, and time.
  - [ ] Reuse the shared teacher-first decision.
  - [ ] Reuse the existing SRS persistence adapter.
  - [ ] Keep receipt-first replay and bounded indexed reads.
- [ ] **Task 4.4: Generalize the supplementary UI.**
  - [ ] Convert `PrecalculusMasteryAdvantagePilot` into one queue-driven
    component after generic tests pass.
  - [ ] Keep a compatibility export for the pilot tests during migration.
  - [ ] Show `awaiting_teacher_exposure` when required.
  - [ ] Show an accessible error and opaque-only evidence retry.
  - [ ] Do not render one hard-coded card per skill.
- [ ] **Task 4.5: Make generic authority and progression tests Green.**
  - [ ] Test the pilot and one non-pilot enabled skill.
  - [ ] Test missing exposure, eligible evidence, replay, and conflict.
  - [ ] Test student-only producer and consumer boundaries.
  - [ ] Test no client authority fields.
- [ ] **Task 4.6: Measure - User Manual Verification 'Phase 4: Generalize Mastery Advantage' (Protocol in `measure/workflow.md`).**

## Phase 5: Author Source-Approved Generators

For every generator, use the authored curriculum source and the existing
renderer registry. Add a new renderer only when no existing renderer can express
the required interaction.

- [ ] **Task 5.1: Complete Unit 1.**
  - [ ] Replace 28 STUB blueprints with source-backed specifications.
  - [ ] Implement 28 deterministic skill generators.
  - [ ] Add golden-answer, invalid-answer, and renderer-contract tests.
- [ ] **Task 5.2: Complete Unit 2.**
  - [ ] Replace 16 STUB blueprints.
  - [ ] Implement and test 16 deterministic skill generators.
- [ ] **Task 5.3: Complete Unit 3 non-polar work.**
  - [ ] Replace source-backed STUB blueprints.
  - [ ] Implement the skills supported by existing renderers.
  - [ ] Keep unsupported polar skills disabled until Task 5.4 is Green.
- [ ] **Task 5.4: Fill the minimum Unit 3 renderer gap.**
  - [ ] Prove that no installed renderer supports the required polar activity.
  - [ ] Add one focused polar renderer only if the proof is Red.
  - [ ] Implement the remaining Unit 3 generators.
  - [ ] Require the Unit 3 total to reach 15.
- [ ] **Task 5.5: Resolve the Unit 4 source gate.**
  - [ ] Obtain an approved curriculum source and renderer decision for all 14
    Unit 4 skills.
  - [ ] If approved, replace STUB blueprints and implement generators.
  - [ ] If not approved, keep all 14 disabled and mark the track blocked.
  - [ ] Do not invent Unit 4 examples or answers.
- [ ] **Task 5.6: Regenerate readiness artifacts.**
  - [ ] Use existing generation commands.
  - [ ] Require `srsEligible: true` only for reviewed generator-backed skills.
  - [ ] Require the gap queue to match the unresolved source or component gaps.
  - [ ] Inspect every generated diff.
- [ ] **Task 5.7: Measure - User Manual Verification 'Phase 5: Author Source-Approved Generators' (Protocol in `measure/workflow.md`).**

## Phase 6: Course-Series Transfer Wiring

- [ ] **Task 6.1: Reuse the existing cross-course edge and transfer packages.**
  - [ ] Use the existing 5,024-edge asset.
  - [ ] Add one typed package export only if no export exists.
  - [ ] Use `computeEquivalenceComponents`, `computeTransferCredit`, and
    `flagTransferEligible`.
  - [ ] Do not create APPC transfer mathematics.
- [b] **Task 6.2: Require a trusted prior-course state provider.**
  - [ ] Accept only server-owned IM1, IM2, and IM3 KST state.
  - [ ] Match the authenticated learner on the server.
  - [ ] Reject client-provided mastery and course identity.
  - [ ] If no approved provider exists, mark this task blocked.
- [ ] **Task 6.3: Add APPC student and teacher production callers.**
  - [ ] Show transfer eligibility in the real supplementary-practice path.
  - [ ] Make skip visible, optional, and reversible.
  - [ ] Use a server-graded confirmation check when required.
  - [ ] Add an authorized teacher audit view.
  - [ ] Do not use equivalence edges as KST prerequisites.
- [ ] **Task 6.4: Measure - User Manual Verification 'Phase 6: Course-Series Transfer Wiring' (Protocol in `measure/workflow.md`).**

## Phase 7: Verification and Closeout

- [x] **Task 7.1: Run focused APPC gates.**
  - [ ] Run graph generation, graph loader, lesson runtime, authority, KST, SRS,
    queue, and transfer selectors.
  - [ ] Run every generator golden-answer selector.
  - [ ] Run the accepted Topic 1.1 pilot tests unchanged.
- [~] **Task 7.2: Run APPC quality gates.**
  - [ ] Run `CI=true npm run test --workspace=apps/pre-calculus`.
  - [ ] Run coverage and require at least 80% for track-created code.
  - [ ] Run `npm run lint --workspace=apps/pre-calculus`.
  - [ ] Run `npm run typecheck --workspace=apps/pre-calculus`.
  - [ ] Run `npm run build --workspace=apps/pre-calculus`.
- [ ] **Task 7.3: Run shared-package gates.**
  - [ ] Run test, lint, typecheck, and build for `lesson-renderer` when changed.
  - [ ] Run test, lint, typecheck, and build for `practice-core`.
  - [ ] Run test, lint, typecheck, and build for `srs-engine`.
  - [ ] Run test, lint, typecheck, and build for `knowledge-space-core`.
  - [ ] Run test, lint, typecheck, and build for `math-content` when changed.
- [x] **Task 7.4: Run repository gates.**
  - [ ] Run `node scripts/check-monorepo-boundaries.mjs`.
  - [ ] Run `node scripts/architecture/check-quality-parity.mjs`.
  - [ ] Run `npm run generate` and inspect generated diffs.
  - [ ] Run `npm run doctor`.
  - [ ] Run `git diff --check`.
- [ ] **Task 7.5: Run an approved local production-flow smoke.**
  - [ ] Start local Convex and the real Next app.
  - [ ] Authenticate through the real student session route.
  - [ ] Open one lesson from each source-approved unit.
  - [ ] Complete one daily and one supplementary attempt.
  - [ ] Retry evidence with the opaque submission ID.
  - [ ] Record count-only evidence, SRS, and KST results.
  - [ ] Do not run this write without user approval.
- [~] **Task 7.6: Reconcile Measure facts.**
  - [ ] Record the final enabled skill count by unit.
  - [ ] Record Unit 4 as Green or as an explicit source blocker.
  - [ ] Record transfer as Green or as an explicit provider blocker.
  - [ ] Update `measure/tech-debt.md`, `measure/tracks.md`, and metadata.
- [ ] **Task 7.7: Measure - User Manual Verification 'Phase 7: Verification and Closeout' (Protocol in `measure/workflow.md`).**
