# Implementation Plan: Graph Node Practice Program

Status: Implementation authorized on 2026-09-07. Graph correction is included. Initial contract and source review is in progress.

Read [spec.md](./spec.md) and [investigation.md](./investigation.md).

## Planning work

- [x] Inspect graph scope, reusable components, runtime paths, and existing tracks.
- [x] Prepare the draft specification and parallel execution plan.

## Orchestration rules

- The parent agent owns scope, shared integration, review decisions, and Measure updates.
- Use gpt-5.6-sol with `reasoning_effort: low` for all delegated work. This is the available setting that matches the requested low/light effort.
- The current limit is four concurrent agents, including the parent. Run at most three workers. Reuse worker slots as batches finish.
- Assign concrete tasks with exact node IDs, source pages, allowed paths, acceptance tests, and dependencies. Do not assign a whole course in one prompt.
- Start with one capability per pilot. After the pilot, use batches of three to five related capabilities. Expand to five to ten only when first-pass quality supports it.
- Each worker owns a complete Worked/Guided/Independent bundle for its capability set. Do not assign the three modes of one capability to separate authors.
- Different workers may read the same files. Only one worker may write a given file. Shared registries, exports, root course catalogs, projections, and plans have one integration owner.
- Two authors and one independent reviewer are the default after the pilots. Three authors may run while they have independent work and the review queue is empty. Reassign a slot to review before integration.
- Reviewers check source alignment and solve representative problems independently. Authors cannot approve their own work. Automated review does not replace required human curriculum approval.
- Preserve pending changes. Use isolated worktrees from an agreed integration baseline when needed. Do not create user-owned Codex tasks for subagents.
- Workers return bounded changes and test results. The integration owner handles atomic commits, Git notes, and plan updates under Measure. Do not stage unrelated changes or the full dirty registry.
- Keep the existing phase verification steps. Record human feedback where the workflow requires it. Do not mark a phase approved from test counts.

## Execution order clarification

The user authorized the full plan. Source inventory continues by bounded groups. Shared safety repairs with settled contracts can run while source review continues. This does not approve curriculum rows or activate broad practice. Manual curriculum review remains pending for source groups.

## Phase 1 — Contract and scope definition

- [x] Task 1.1: Refresh the working-tree baseline and assign overlap ownership.
  Record the current commit and relevant pending paths. Read current correction results. Assign every overlap to one existing track. Agree on the integration base before agents edit shared files.
- [~] Task 1.2: Complete the capability inventory through the existing graph tracks.
  Account for every node and every required source capability. Resolve concepts, missing source mappings, unstable IDs, and prerequisite decisions. Keep unresolved rows out of production eligibility. Use existing graph fields and Measure notes.
- [~] Task 1.3: Define each mode's observable behavior and grading policy.
  Reuse practice.v1, the blueprint schemas, and learning-evidence.v1. Resolve units, rounding, equivalence, hint/reveal behavior, retries, and teacher review. Specify only contract changes that a selected pilot requires.
- [~] Task 1.4: Trace the five course consumers and select exact pilot IDs.
  Candidate choices are an IM1 early algebra generator, IM2 perpendicular-bisector equidistance, an IM3 quadratic graph capability, Precalculus interval classification, and Business Math accounting equations. Confirm source and graph identity before selection. If the old BM pilot does not match the current capability, select a correct mapping instead of copying it.
- [ ] Task 1.5: Measure — User Manual Verification: Contract and scope.

Exit condition: agreed capability scope for pilot groups, exact contracts, and one owner per overlapping change. Whole-course graph review may continue separately. Broad rollout remains gated by the existing remediation plan.

## Phase 2 — Failing behavior tests

- [~] Task 2.1: Test blueprint-to-renderer behavior for the pilot groups.
  Cover empty/missing specs, actual app registration, per-mode props, and stable activity/part IDs. Add a mode-routing test only where a real capability requires different renderers.
- [ ] Task 2.2: Test generator mathematics and presentation.
  Use independently solved examples, deterministic replay, invalid inputs, domain limits, and varied seeds. Check that prompt, figure, solution, and canonical answer describe the same problem.
- [ ] Task 2.3: Test submissions and exact-node evidence.
  Exercise correct, incorrect, assisted, revealed, repeated, and mismatched submissions. Verify server-owned grading and identity. Reject client-provided correctness as authority. Preserve teacher review and first-exposure behavior.
- [~] Task 2.4: Test graph semantics at the decision boundary.
  Reproduce current identity, containment, prerequisite, equivalence, and evidence defects. Include valid positive relationships and missing-state cases. Use the existing semantic repair tests where they already cover the behavior.
- [ ] Task 2.5: Measure — User Manual Verification: Test coverage.

Record expected Red failures. Pair failing tests with their repair before a passing implementation commit. Do not treat the intentionally Red phase as a Green checkpoint.

## Phase 3 — Correct graph semantics and learning decisions

This is in-scope implementation. Use the existing graph repair plans as detailed execution checklists. The parent owns delivery across those tracks. Refresh old findings against the current working tree before changes.

- [~] Task 3.1: Correct the canonical graph assembly and review boundary.
  Reconcile standalone and embedded catalogs. Resolve missing standards and conflicting definitions. Prevent unreviewed graph suggestions from controlling learning decisions. Preserve valid node and evidence identities.
- [~] Task 3.2: Correct IM1 and IM2 capabilities and relationships from sources.
  Review all module and lesson capabilities. Correct mixed granularity, missing example mappings, unsupported prerequisites, and source coverage gaps. Execute the named lesson tasks in the semantic repair plan.
- [ ] Task 3.3: Correct IM3 and Precalculus capabilities and relationships from sources.
  Resolve the concept/skill contract before changing target types. Review all modules and units. Correct containment, capability bindings, and missing or overbroad skills. Do not assign a concept's evidence to an arbitrary child or all children without assessment support.
- [ ] Task 3.4: Correct cross-course prerequisites and equivalence.
  Compare actual capability scope, representations, conditions, and evidence demands. Reject standard overlap and lesson order as sufficient proof. Test direction, hard prerequisites, equivalence closure, and missing foreign learner state.
- [ ] Task 3.5: Correct the Business Math graph and activity relationships.
  Verify all 89 current lesson-based capability candidates against published objectives. Split or combine only where the sources require it. Reconcile prerequisite vocabulary, review status, three-mode mappings, and manual evidence. Preserve the existing limited adaptive activation policy until its runtime tests pass.
- [ ] Task 3.6: Verify graph corrections through actual learning decisions.
  Add failing cases before each repair. Show that a false prerequisite cannot block or unlock work, false equivalence cannot grant credit, a valid hard prerequisite still controls readiness, and unrelated skills do not receive evidence. Verify role projections and deterministic regeneration. Preserve valid positive behavior.
- [ ] Task 3.7: Measure — User Manual Verification: Corrected knowledge space graphs.

Scheduling: one worker owns shared graph mechanisms. Two workers can review disjoint course source groups. After shared repairs, assign separate course writers and retain one reviewer slot. The parent integrates cross-course edges after endpoint identities are resolved. Pilot work can prepare against reviewed bounded groups, but broad authoring cannot bypass graph acceptance.

### Bounded graph repair tasks

- [x] Task Q1: Declare the existing KaTeX stylesheet import for the shared lesson renderer. TypeScript, package lint, and both package tests pass. Commit `97b46bfc`.

- [x] Task G1: Repair IM1 objective extraction for repeated rows and absolute-value notation. Own the extraction parser and focused tests. Preserve compact Markdown tables. Verified with 55 extraction tests, package lint, and standalone TypeScript. Commit `ecedf2b1`.
- [x] Task G2: Restore IM1 Module 1 source capabilities 1b, 1d, 1f, 1h, 1j, and 1l as draft nodes. Keep existing node IDs. Map the six existing blueprints to exact available examples. Add source-supported containment. Do not approve readiness or invent source images. Commit: `67d972dc`.
- [x] Task G3: Restore IM1 Module 2 source capabilities 2b, 2d, 2f, 2h, 2l, and 2n as draft nodes. Repair the 2i title without changing its ID. Map available unambiguous examples. Preserve all unrelated graph rows. Commit: `6011c71d`. Duplicate source repair remains in G4.
- [~] Task G4: Reconcile missing and duplicate IM1 example identities after reference review. Do not renumber examples by regeneration.

- [~] Task G5: Reconcile the existing IM1 inventory reports and tests with source repairs. Remove frozen 138-node assertions. Distinguish a registered generator from a complete practice bundle. Derive existing report totals from the current graph. Record missing blueprints and incomplete modes without fabricating specifications. Preserve historical audit context.

## Phase 4 — Implement the minimum shared repairs and five pilots

- [~] Task 4.1: Repair shared projection and registration gaps required by pilots.
  Reuse the current projector and registries. Preserve app ownership. Avoid a new generated-instance framework or broad primitive program.
- [ ] Task 4.2: Complete and verify the IM3 reference pilot.
  Connect source, all three modes, generator, renderer, server grading, stored submission, and exact-node evidence. Verify the real student route.
- [ ] Task 4.3: Complete and verify the Precalculus pilot.
  Reuse current local corrections. Check the selected activity and exact evidence binding. Verify all three modes in the student route.
- [~] Task 4.4: Complete and verify the IM1 pilot.
  Reuse a valid existing algebra generator. Complete source mapping and the required app rendering/submission path.
- [ ] Task 4.5: Complete and verify the IM2 pilot.
  Reuse the current lesson runtime and perpendicular-bisector work where correct. Coordinate with the active correction track.
- [ ] Task 4.6: Complete and verify the Business Math pilot.
  Reconcile published activity mapping with the three modes. Preserve manual evidence for artifacts that require teacher review. Keep adaptive activation within the existing approved policy.
- [ ] Task 4.7: Measure — User Manual Verification: Five course pilots.

Scheduling: stabilize shared contracts first. IM1 pilot implementation starts with the completed Module 1 source review and available renderer. IM3 and Precalculus pilot integration remains pending. Run independent source and runtime work when paths do not overlap.

## Phase 5 — Implement complete capability batches

Before each batch, add named node tasks under the relevant course task. Each node task must include exact IDs, source locations, allowed files, Red/Green results, review findings, and completion evidence. Do not close a course task from a sample.

- [ ] Task 5.1: Complete IM1 capability batches.
- [ ] Task 5.2: Complete IM2 capability batches.
- [ ] Task 5.3: Complete IM3 capability batches.
- [ ] Task 5.4: Complete AP Precalculus capability batches.
- [ ] Task 5.5: Complete Business Math capability batches.
- [ ] Task 5.6: Reconcile complete source and three-mode coverage.
  Check every accepted node. Check unmatched sources, empty specs, placeholders, absent generators where required, unsupported renderers, and missing grading/evidence paths. Classify manual assessment explicitly.
- [ ] Task 5.7: Measure — User Manual Verification: Course coverage.

Use existing algebra, classification, and coordinate/function components first. Schedule geometry, transformation, proof, statistics, probability, trigonometry, and polar batches when their source-reviewed capabilities are ready. Add only the minimum missing interaction for the current batch. Business spreadsheet and model work remains app-owned where it is course-specific.

Workers may author different course files concurrently. Workers that share a course catalog must work sequentially or hand their bounded edits to the integration owner. Regenerate each approved course batch once after integration. Do not hand-edit generated outputs as source truth.

## Phase 6 — Application acceptance

- [ ] Task 6.1: Verify every accepted row against the real app registry and server grading path.
  Execute real seed/projection consumers in suitable tests. Assert rendered behavior and stored results. Do not rely on source-text searches alone.
- [ ] Task 6.2: Verify complete student journeys in all five apps.
  Check Worked, Guided, Independent, hints, incorrect answers, correction, fresh attempts, and return navigation. Check keyboard access, mobile layout, figures, and mathematical notation. Verify manual review where required.
- [ ] Task 6.3: Verify teacher results and learning-policy boundaries.
  Confirm exact-node evidence. Confirm that first exposure, completion, assistance, and teacher review produce only their allowed effects on knowledge state and spaced repetition.
- [ ] Task 6.4: Measure — User Manual Verification: Application acceptance.

## Phase 7 — Generate documents and run Doctor

- [ ] Task 7.1: Run required workspace quality gates.
  Run `npm run lint`, relevant tests, and `npm run build`. Run standalone `npx tsc --noEmit` in each affected app/package with its configuration. Root quality commands cover packages; run affected app gates separately. Apply the existing greater-than-80-percent coverage requirement to new code. Record unrelated failures with their current owner.
- [ ] Task 7.2: Update generated facts and check architecture.
  Run `npm run generate`, `npm run doctor`, `node scripts/check-monorepo-boundaries.mjs`, and `node scripts/architecture/check-quality-parity.mjs`. Inspect generated diffs. Preserve unrelated output.
- [ ] Task 7.3: Reconcile Measure plans and record remaining limits.
  Close only accepted node tasks. Update overlapping track status and relevant debt. Record commit IDs, test results, human feedback, and any hosted verification that remains outside scope.
- [ ] Task 7.4: Measure — User Manual Verification: Final acceptance.

## Worker task template

Use this plain-text structure in each agent assignment:

- Objective: complete one named capability bundle or one bounded shared repair.
- Model: gpt-5.6-sol. Reasoning effort: low.
- Context: active track, exact node IDs, source pages, relevant contracts, app design rules.
- Ownership: allowed files; integration-owned files that the worker must not edit.
- Behavior: required Worked, Guided, and Independent interaction and grading policy.
- Verification: failing cases first, independently solved fixtures, required focused tests.
- Output: changed files, observed Red/Green results, mathematical review notes, unresolved issues.
- Limits: no new dependencies, deployment, unrelated edits, automatic approval, or private orchestration framework.

## Schedule and cost estimation

Do not use the provisional 624 skill rows as the final workload. Count remaining accepted capability bundles after graph review. Separate reuse-only content tasks, generator tasks, new interaction tasks, and app integration tasks.

Record elapsed time, agent token use when available, review time, and rework for the five pilots and the first two small batches. Estimate each category from those observations. Total worker effort is the sum of remaining bundles multiplied by observed category effort. Elapsed time also includes serial integration and human review. Three worker slots set the concurrency ceiling; they do not guarantee a threefold speedup.

Task 1.1 is complete. The first bounded graph and projection repairs are in progress. Broad authoring starts only after the applicable graph and pilot gates pass.

## Accepted-equivalence repair checkpoint

The shared SRS and teacher projections now require an approved edge and approved skill endpoints (`b11b5032`). The focused regression has eight passing tests. Tasks 2.4 and 3.2 remain open for the full graph and evidence scope.

The exact-capability projection repair is committed as `ac4a6a4f`. The IM1 pilot still requires a real activity provider and server submission flow. The existing provider is an identifier display. A route test that replaces it cannot satisfy pilot acceptance.
