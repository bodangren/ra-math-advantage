# Implementation Plan: IM3 Mastery Advantage Rollout

> **SUPERSEDED 2026-08-21:** Stop this plan. Do not execute any remaining task.
> Use `mastery-advantage-graph-remediation_20260821`.

**Track type:** Feature

**Scope:** 96 IM3 mastery skills

**Execution order:** Contract -> Red Tests -> Runtime -> Generator Waves -> Verify

**Implementation status (2026-08-21):** The projection-backed rollout map, generic
server-owned submission path, teacher-first evidence path, SRS bridge, and queue
eligibility path are implemented for the 96-skill projection. Thirteen skills have
generators. The remaining 83 generators and the trusted prior-course state provider
remain incomplete. Review remediation is open for daily teacher-evidence delivery,
generic submission markers, and seed-complete enablement.

## Junior Developer Rules

1. Read all files in the next section before the first edit.
2. Run `git diff -- <file>` before each edit.
3. Write a behavior test before production code.
4. Make one task Green before the next task starts.
5. Reuse an existing production path before you create a file.
6. Do not add a dependency, schema field, public route, or package export unless
   a task below requires it and a Red test proves the need.
7. Do not add a hash, fingerprint, checksum, or provenance field.
8. Commit only task-owned files after the task gates pass.

## Read Before Work

1. `AGENTS.md`
2. `measure/workflow.md`
3. `measure/tracks/im3-mastery-advantage-rollout_20260821/spec.md`
4. `measure/tracks/teacher-led-mastery-advantage_20260819/spec.md`
5. `measure/practice-component-contract.md`
6. `kst-srs.v3.2/SPECIFICATION.md`
7. `apps/integrated-math-3/product.md`
8. `apps/integrated-math-3/curriculum/skill-graph/nodes.json`
9. `apps/integrated-math-3/curriculum/skill-graph/edges.json`
10. `apps/integrated-math-3/curriculum/skill-graph/projection/practice-v1-activity-map.json`
11. `apps/integrated-math-3/curriculum/skill-graph/projection/srs-input.json`
12. `apps/integrated-math-3/curriculum/skill-graph/generator-gap-queue.json`
13. `apps/integrated-math-3/lib/practice/learning-evidence-pilot.ts`
14. `apps/integrated-math-3/convex/activities.ts`
15. `apps/integrated-math-3/convex/learningEvidence.ts`
16. `apps/integrated-math-3/convex/student/knowledge_state.ts`
17. `apps/integrated-math-3/convex/queue/queue.ts`

The required file
`apps/integrated-math-3/convex/_generated/ai/guidelines.md` is absent in the
2026-08-21 baseline. Before any Convex edit, obtain approval to run
`npx convex ai-files install`, inspect its diff, and read that file. Stop if the
command changes a dependency or files outside managed Convex guidance.

## Phase 1: Freeze the Rollout Contract

- [x] **Task 1.1: Recompute the readiness baseline from canonical artifacts.**
  - [ ] Count `kind: skill` nodes in `nodes.json`.
  - [ ] Intersect those IDs with `generator-gap-queue.json`.
  - [ ] Require 96 skills, 83 missing skill generators, and 13 served skills.
  - [ ] Require the module gap counts in the specification.
  - [ ] Stop and update this plan if the canonical artifacts changed.
- [x] **Task 1.2: Prove whether the existing projection is the rollout map.**
  - [ ] For each of the 96 skill IDs, find its `worked_example` and
    `guided_practice` rows in `practice-v1-activity-map.json`.
  - [ ] Compare the `worked_example` stable ID with the real seeded daily
    activity for that lesson.
  - [ ] Compare generator-ready rows with `srs-input.json`.
  - [ ] Reuse the projection when these fields are sufficient.
  - [ ] Add one app-owned exception map only for rows that cannot be derived.
  - [ ] Do not copy the full projection into TypeScript.
- [x] **Task 1.3: Freeze the generic production flow.**
  - [ ] Daily page:
    `apps/integrated-math-3/app/student/lesson/[lessonSlug]/page.tsx`.
  - [ ] Daily activity route:
    `apps/integrated-math-3/app/api/activities/submit/route.ts` or the existing
    route used by `ActivityRenderer`.
  - [ ] Server-owned Mastery Advantage create route:
    `apps/integrated-math-3/app/api/activities/submissions/route.ts`.
  - [ ] Evidence consumer:
    `apps/integrated-math-3/app/api/learning-evidence/im3-pilot/route.ts` until
    the route is renamed in Task 3.4.
  - [ ] Do not add one route per node.
- [x] **Task 1.4: Freeze the enablement record.**
  - [ ] Each enabled row needs `nodeId`, daily stable activity ID, Mastery
    Advantage stable activity ID, mode, renderer key, and generator key.
  - [ ] Derive these fields from existing projections where possible.
  - [ ] Treat a stub, missing generator, or missing source activity as disabled.
  - [ ] Keep the pilot row byte-compatible.
- [~] **Task 1.5: Freeze the course-series transfer boundary.**
  - [ ] Record that `cross-course-edges.json` has 5,024 `equivalent_to` edges.
  - [ ] Record that no production TypeScript caller imports it.
  - [ ] Record that `TransferCreditPrompt` and `TransferCreditAuditPanel` have
    no production caller.
  - [ ] Do not mix `equivalent_to` edges into KST prerequisite traversal.
  - [ ] Record the missing trusted prior-course learner-state provider as an
    external dependency. Do not fake it with client data.
- [ ] **Task 1.6: Measure - User Manual Verification 'Phase 1: Freeze the Rollout Contract' (Protocol in `measure/workflow.md`).**

## Phase 2: Write Red Tests

- [x] **Task 2.1: Add graph-to-rollout completeness tests.**
  - [ ] Assert one enablement decision for every `kind: skill` node.
  - [ ] Assert no concept, lesson, standard, or worked-example node is enabled.
  - [ ] Assert each enabled row references an existing projection row.
  - [ ] Assert the pilot node remains enabled.
  - [ ] Assert a generator-gap skill remains disabled.
- [~] **Task 2.2: Add generic teacher-first tests.**
  - [ ] Use one current pilot skill and one non-pilot served skill.
  - [ ] Submit the real daily activity through the generic route.
  - [ ] Prove the stored source submission creates `teacher_led` evidence.
  - [ ] Prove that teacher evidence changes no KST or SRS row.
  - [ ] Prove Mastery Advantage returns `awaiting_teacher_exposure` before it.
- [x] **Task 2.3: Add generic server-authority tests.**
  - [ ] Reject missing, blank, and oversized `Idempotency-Key` values.
  - [ ] Reject client learner, role, score, grade, ordinal, time, and origin.
  - [ ] Grade the raw answer on the server.
  - [ ] Require one server-owned ordinal per learner, node, activity, and origin.
  - [ ] Require replay and safe HTTP 409 conflict behavior.
  - [ ] Require opaque-only evidence retry.
- [~] **Task 2.4: Add KST and SRS effect tests.**
  - [ ] Prove one eligible attempt reaches the existing SRS bridge.
  - [ ] Prove one eligible attempt reaches the existing KST update path.
  - [ ] Prove a receipt-first replay runs neither bridge again.
  - [ ] Prove failure before durable KST persistence creates no evidence receipt.
- [x] **Task 2.5: Add queue and planner eligibility tests.**
  - [ ] Prove the queue returns only introduced and generator-ready skills.
  - [ ] Prove it excludes a skill before teacher exposure.
  - [ ] Prove it excludes an 83-gap skill until its generator wave completes.
  - [ ] Prove due SRS work keeps its current priority rules.
- [b] **Task 2.6: Add transfer production-caller tests only after the provider exists.**
  - [ ] Require server-owned prior-course KST state.
  - [ ] Require the existing transfer-credit package functions.
  - [ ] Require the existing student prompt and teacher audit panel to have real
    production callers.
  - [ ] Require skip to be reversible.
  - [ ] Skip this task as blocked when the trusted provider is absent. Do not
    write a test-only provider and call it production.
- [ ] **Task 2.7: Record the Red baseline.**
  - [ ] Run each new test file alone.
  - [ ] Confirm each failure is missing production behavior.
  - [ ] Record the exact command and failed assertion in this plan.
  - [ ] Do not use source-text matching as production-flow proof.
- [ ] **Task 2.8: Measure - User Manual Verification 'Phase 2: Write Red Tests' (Protocol in `measure/workflow.md`).**

## Phase 3: Generalize the Existing Pilot

- [x] **Task 3.1: Replace the one-node allowlist with projection-backed lookup.**
  - [ ] Start in
    `apps/integrated-math-3/lib/practice/learning-evidence-pilot.ts`.
  - [ ] Rename the file only if its exported pilot name blocks generic use.
  - [ ] Keep a compatibility export for existing pilot imports during the
    migration.
  - [ ] Resolve enabled rows from the canonical projection.
  - [ ] Reject disabled or unknown nodes before grading or evidence effects.
- [~] **Task 3.2: Generalize the server-owned submission writer.**
  - [ ] Edit the existing writer in `convex/activities.ts`.
  - [ ] Resolve the stable activity from the enabled row.
  - [ ] Load or reconstruct the server-owned problem.
  - [ ] Grade with the registered generator.
  - [ ] Assign the ordinal and timestamp on the server.
  - [ ] Compare normalized fields directly for an idempotency conflict.
  - [ ] Do not add a request fingerprint.
- [~] **Task 3.3: Generalize the evidence consumer.**
  - [ ] Edit `convex/learningEvidence.ts`.
  - [ ] Load the stored submission by opaque ID.
  - [ ] Verify owner, activity, node, mode, grade, ordinal, and timestamp.
  - [ ] Reuse the existing teacher-first decision function.
  - [ ] Reuse the existing KST and SRS adapters.
  - [ ] Keep bounded indexed history reads.
  - [ ] Keep receipt-first replay.
- [ ] **Task 3.4: Rename pilot-only public names after compatibility tests pass.**
  - [ ] Prefer the existing route when its URL can remain compatible.
  - [ ] If a generic URL is required, add it and keep the pilot URL as a thin
    compatibility adapter for one release.
  - [ ] Do not duplicate route logic.
  - [ ] Update production callers before removing a pilot export.
- [~] **Task 3.5: Wire the existing queue and lesson runtime.**
  - [ ] Keep the normal daily lesson path as the teacher-led producer.
  - [ ] Add supplementary work to the existing practice queue.
  - [ ] Pass stable IDs and raw answers through `ActivityRenderer`.
  - [ ] Do not place 96 hard-coded cards on the dashboard.
  - [ ] Preserve phase completion and lesson unlock behavior.
- [x] **Task 3.6: Make the Phase 2 tests Green.**
  - [ ] Run each test file alone.
  - [ ] Run the combined focused selector.
  - [ ] Run the existing pilot tests unchanged.
  - [ ] Stop if ordinary IM3 phase completion or lesson submission regresses.
- [ ] **Task 3.7: Measure - User Manual Verification 'Phase 3: Generalize the Existing Pilot' (Protocol in `measure/workflow.md`).**

## Phase 4: Implement the 83 Missing Skill Generators

For each task below, use the existing blueprint, renderer, and math-content
generator registry. Add the minimum generator needed for the authored skill.
Do not implement concept-node generators in this track.

- [ ] **Task 4.1: Complete Module 1.**
  - [ ] Implement the 3 missing skill generators.
  - [ ] Add deterministic golden-answer tests.
  - [ ] Remove only those 3 skill rows from the gap queue through the existing
    generator command.
- [ ] **Task 4.2: Complete Module 2.**
  - [ ] Implement and test 9 skill generators.
- [ ] **Task 4.3: Complete Module 3.**
  - [ ] Implement and test 7 skill generators.
- [ ] **Task 4.4: Complete Module 4.**
  - [ ] Implement and test 13 skill generators.
- [ ] **Task 4.5: Complete Module 5.**
  - [ ] Implement and test 8 skill generators.
- [ ] **Task 4.6: Complete Module 6.**
  - [ ] Implement and test 7 skill generators.
- [ ] **Task 4.7: Complete Module 7.**
  - [ ] Implement and test 12 skill generators.
- [ ] **Task 4.8: Complete Module 8.**
  - [ ] Implement and test 10 skill generators.
- [ ] **Task 4.9: Complete Module 9.**
  - [ ] Implement and test 14 skill generators.
- [~] **Task 4.10: Regenerate and verify readiness artifacts.**
  - [ ] Use the existing generation command.
  - [ ] Require zero `kind: skill` rows in the generator gap queue.
  - [ ] Permit concept rows to remain.
  - [ ] Require all 96 skills to be generator-ready in the SRS projection.
  - [ ] Inspect every generated diff.
- [ ] **Task 4.11: Measure - User Manual Verification 'Phase 4: Implement the 83 Missing Skill Generators' (Protocol in `measure/workflow.md`).**

## Phase 5: Course-Series Transfer Wiring

- [ ] **Task 5.1: Expose the existing cross-course edge asset with one typed export.**
  - [ ] First check `@math-platform/math-content/knowledge-space` for an export.
  - [ ] If absent, add one read-only typed export for the existing JSON asset.
  - [ ] Do not copy the edge file into IM3.
  - [ ] Do not regenerate or broaden the edge set.
- [ ] **Task 5.2: Connect the existing transfer UI to production state.**
  - [ ] Require the approved trusted prior-course state provider.
  - [ ] Compute equivalence and transfer through existing package functions.
  - [ ] Render `TransferCreditPrompt` in the real practice path.
  - [ ] Render `TransferCreditAuditPanel` in an authorized teacher path.
  - [ ] Persist skip and revert through a server-owned app adapter.
  - [ ] If the provider is absent, mark this task blocked and stop here.
- [ ] **Task 5.3: Prove that transfer does not bypass teacher-first policy silently.**
  - [ ] A transfer skip must be visible and reversible.
  - [ ] A confirmation check uses a server-owned graded submission.
  - [ ] Client claims cannot seed mastery.
  - [ ] Local KST prerequisites still use `prerequisite_for` edges only.
- [ ] **Task 5.4: Measure - User Manual Verification 'Phase 5: Course-Series Transfer Wiring' (Protocol in `measure/workflow.md`).**

## Phase 6: Verification and Closeout

- [x] **Task 6.1: Run focused behavior gates.**
  - [ ] Run rollout completeness, authority, teacher-first, KST, SRS, queue,
    phase-completion, and transfer tests.
  - [ ] Run all generator golden-answer tests.
  - [ ] Run each flaky UI selector in five isolated processes before you label
    it stable.
- [~] **Task 6.2: Run IM3 quality gates.**
  - [ ] Run `CI=true npm run test --workspace=apps/integrated-math-3`.
  - [ ] Run changed-code coverage and require at least 80% for track code.
  - [ ] Run `npm run lint --workspace=apps/integrated-math-3`.
  - [ ] Run `npm run typecheck --workspace=apps/integrated-math-3`.
  - [ ] Run `npm run build --workspace=apps/integrated-math-3`.
- [~] **Task 6.3: Run shared-package gates.**
  - [ ] Run test, lint, typecheck, and build for `practice-core`.
  - [ ] Run test, lint, typecheck, and build for `srs-engine`.
  - [ ] Run test, lint, typecheck, and build for `knowledge-space-core`.
  - [ ] Run test, lint, typecheck, and build for `knowledge-space-practice`.
  - [ ] Run test, lint, typecheck, and build for `math-content` when it changed.
- [x] **Task 6.4: Run repository gates.**
  - [ ] Run `node scripts/check-monorepo-boundaries.mjs`.
  - [ ] Run `node scripts/architecture/check-quality-parity.mjs`.
  - [ ] Run `npm run generate` and inspect generated diffs.
  - [ ] Run `npm run doctor`.
  - [ ] Run `git diff --check`.
- [ ] **Task 6.5: Run an approved local production-flow smoke.**
  - [ ] Start local Convex and the real Next app.
  - [ ] Authenticate through the real student session route.
  - [ ] Complete one daily attempt and one supplementary attempt in two modules.
  - [ ] Retry the evidence call with the opaque submission ID.
  - [ ] Record count-only evidence, KST, SRS, and receipt results.
  - [ ] Do not run this write without user approval.
- [~] **Task 6.6: Reconcile Measure facts.**
  - [ ] Record the final enabled skill count.
  - [ ] Record the remaining concept-generator count separately.
  - [ ] Record transfer wiring as Green or as an explicit provider blocker.
  - [ ] Update `measure/tech-debt.md`.
  - [ ] Update `measure/tracks.md` and `metadata.json`.
- [ ] **Task 6.7: Measure - User Manual Verification 'Phase 6: Verification and Closeout' (Protocol in `measure/workflow.md`).**
