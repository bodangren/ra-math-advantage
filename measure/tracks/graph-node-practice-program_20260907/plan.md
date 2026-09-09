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
- [~] Task 2.3: Test submissions and exact-node evidence.
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
- [~] Task 3.3: Correct IM3 and Precalculus capabilities and relationships from sources.
  Resolve the concept/skill contract before changing target types. Review all modules and units. Correct containment, capability bindings, and missing or overbroad skills. Do not assign a concept's evidence to an arbitrary child or all children without assessment support.
- [ ] Task 3.4: Correct cross-course prerequisites and equivalence.
  Compare actual capability scope, representations, conditions, and evidence demands. Reject standard overlap and lesson order as sufficient proof. Test direction, hard prerequisites, equivalence closure, and missing foreign learner state.
- [~] Task 3.5: Correct the Business Math graph and activity relationships.
  Unit 1 source review found incorrect exact-event evidence mappings and an unsupported prerequisite. The bounded repair preserves physical lesson activities. Nine focused tests and app gates pass. Source review report commit `e3cc8eec`. Lessons 4-11 source review is recorded in `3e20e0d0`. Incorrect whole-activity mappings and the Lesson 11 assessment aggregate remain under repair. Catalog-wide acceptance remains open.
  Verify all 89 current lesson-based capability candidates against published objectives. Split or combine only where the sources require it. Reconcile prerequisite vocabulary, review status, three-mode mappings, and manual evidence. Preserve the existing limited adaptive activation policy until its runtime tests pass.
- [~] Task 3.6: Verify graph corrections through actual learning decisions.
  Add failing cases before each repair. Show that a false prerequisite cannot block or unlock work, false equivalence cannot grant credit, a valid hard prerequisite still controls readiness, and unrelated skills do not receive evidence. Verify role projections and deterministic regeneration. Preserve valid positive behavior.
- [ ] Task 3.7: Measure — User Manual Verification: Corrected knowledge space graphs.

Scheduling: one worker owns shared graph mechanisms. Two workers can review disjoint course source groups. After shared repairs, assign separate course writers and retain one reviewer slot. The parent integrates cross-course edges after endpoint identities are resolved. Pilot work can prepare against reviewed bounded groups, but broad authoring cannot bypass graph acceptance.

### Bounded graph repair tasks

- [x] Task Q5: Add the Precalculus Topic 1.1 teacher confirmation control. The standalone control is committed as 3459b282. The bounded teacher query and durable candidate state are committed as a40ca6e2. The authenticated route, frozen retry tuple, pending-request guard, dashboard integration, and exact selected writer are committed as 9de80ba8. The accepted Unit 7 browser matrix in 7838c6a7a verifies the real teacher action, candidate removal, durable learner readiness, and no teacher-created receipt or SRS effect.

- [x] Task Q4: Make IM1 teacher confirmation usable and stable during retries. Show source context. Freeze selection during a save. Preserve the request key after failure. Remove confirmed work from choices. Four UI tests and full app lint, standalone TypeScript, and build pass. Commit `7860fc43`. Backend integration and live verification remain open.

- [x] Task Q3: Add the interval component and strict mode schema. Await durable submission. Retain answers after a failed save. Describe actual graph points without giving classification answers. Two regressions failed before the fix. Thirteen focused tests, package lint, standalone TypeScript, and build pass. Commit `b9e7cb21`. App integration remains open.

- [x] Task Q2: Use the existing Next Link component for the IM1 login and registration links. The two observed app lint errors are resolved. Full app lint, standalone TypeScript, and build pass. Commit `fae19087`.

- [x] Task Q1: Declare the existing KaTeX stylesheet import for the shared lesson renderer. TypeScript, package lint, and both package tests pass. Commit `97b46bfc`.

- [x] Task G1: Repair IM1 objective extraction for repeated rows and absolute-value notation. Own the extraction parser and focused tests. Preserve compact Markdown tables. Verified with 55 extraction tests, package lint, and standalone TypeScript. Commit `ecedf2b1`.
- [x] Task G2: Restore IM1 Module 1 source capabilities 1b, 1d, 1f, 1h, 1j, and 1l as draft nodes. Keep existing node IDs. Map the six existing blueprints to exact available examples. Add source-supported containment. Do not approve readiness or invent source images. Commit: `67d972dc`.
- [x] Task G3: Restore IM1 Module 2 source capabilities 2b, 2d, 2f, 2h, 2l, and 2n as draft nodes. Repair the 2i title without changing its ID. Map available unambiguous examples. Preserve all unrelated graph rows. Commit: `6011c71d`. Duplicate source repair remains in G4.
- [x] Task G4: Reconcile missing and duplicate IM1 example identities after reference review. Do not renumber examples by regeneration. Commit: `3df086f6`.

- [x] Task G5: Reconcile the existing IM1 inventory reports and tests with source repairs. Remove frozen 138-node assertions. Distinguish a registered generator from a complete practice bundle. Derive existing report totals from the current graph. Record missing blueprints and incomplete modes without fabricating specifications. Preserve historical audit context. Commit: `6f595dd4`.

- [x] Task G6: Review IM2 Module 1 capability and source-example identities against current lesson sources. Prepare bounded graph corrections. Preserve the perpendicular-bisector pilot identity. The source review and bounded Lesson 1.1 and 1.3 corrections are committed as `bf57ae6a`. Remaining Module 1 taxonomy work stays open under Task 3.2.

- [x] Task G7: Align the IM1 translation blueprint and saved mode projection with expression-only grading. Preserve source identity and draft review status. Correct remaining current-count claims in the debt registry. Commit `43c0ac98`.

- [~] Task G8: Review IM1 Module 3 capabilities against the full current lesson bodies and class-period objectives. Correct missing or mixed draft capabilities and exact source references. Preserve stable identities and keep unreviewed relationships inactive. The bounded objective and source restoration is committed as `7b9b4993`. Atomic capability splitting and source-image review remain open.

- [x] Task G9: Split IM1 objective 3d into source-based numerical evaluation, algebraic evaluation, and contextual interpretation capabilities. Preserve the legacy objective ID as an inactive aggregate. Use Lesson 3-2 Examples 3 and 4. No prerequisites or approval were added. Independent review, 10 source/pilot tests, 42 inventory tests, app/package lint, standalone TypeScript, and builds pass. Commit `4c29f791`.

- [x] Task G10: Reconcile IM1 Lesson 4-1 example titles and the duplicate Example 2. Preserve retained IDs. Correct all graph and projection references. Independent review and 13 source tests pass. Full app lint, standalone TypeScript, and build pass. Commit `f86a265b`. Capability review and practice authoring remain open.

- [x] Task G11: Restore IM1 Lesson 4-1 contextual intercept interpretation and equivalent-form objective candidates. Keep both as inactive drafts. Independent review rejected the rewrite example mapping; its blueprint has no example links. This task completes inventory restoration only. Eleven source tests, 20 inventory tests, IM1/package lint, standalone TypeScript, and builds pass. Commit `76e7654c`. Full rewrite teaching and assessment remain Phase 5 work.

- [x] Task G12: Restore IM1 Lesson 4-2 draft capability and source-example identities. Independent review passed. Real-world-data example mapping remains empty. Twelve source tests, 20 inventory tests, app/package lint, TypeScript, and builds pass. Commit `cadf514e`.

- [x] Task G13: Reconcile IM1 embedded node catalogs from current draft nodes and canonical standards. Resolve 17 dangling endpoint references. Preserve edge arrays and review states. Correct existing current counts. Independent review, source/inventory tests, full app lint, TypeScript, and build pass. Commit `001b410b`.

- [x] Task G14: Restore IM1 Lesson 4-3 capability and source-example identities. Four draft goals and exact available source links passed independent review. Existing IDs and edges remain intact. Inventory and app gates passed. Commit `73280b7b`.
- [x] Task G15: Record IM1 Lesson 4-4 goals and example identities from the full extraction. Preserve existing IDs. Six provisional draft candidates and the notation caveat passed source inventory review. Commit `fe6476d9`. Assessable boundaries remain unapproved.
- [x] Task G16: Verify the original Lesson 4-4 worksheet and correct the extraction note. The source confirms the linear parent and intentional equivalent descriptions. Commit `501c5952`.
- [x] Task G17: Review Lesson 4-5 goals and example identities against the full extraction and original worksheet. Correct the cooler indexing error. Preserve all previous IDs and edges. Nine source tests, 40 inventory tests, and app gates pass. Commit `de78dbca`. New capabilities remain draft.
- [x] Task G18: Restore Lesson 4-6 source goals and example identities. Correct the rounding domains and record the Problem 17 mismatch. Preserve existing IDs and edges. Ten source tests, 40 inventory tests, and app gates pass. Commit `ec9e0b71`. Candidates remain draft.
- [x] Task G19: Correct Lesson 4-7 source extraction and preserve retained example identities. Eight draft candidates passed source inventory review. Nine source tests, 40 inventory tests, and app gates pass. Commit `4c4797ef`.
- [x] Task G20: Restore Lesson 5-1 source capability candidates and retained example descriptions. Independent source review and app gates pass. Commit `228082b5`. Ten candidates remain draft.
- [x] Task G21: Restore Lesson 5-2 goals and source-example identities from the original worksheet. Correct combined Examples 7 and 8 mapping. Preserve previous IDs. Twelve draft candidates, 58 curriculum tests, 40 inventory tests, and app gates pass. Commit `7d98d7a6`.

- [x] Task G22: Restore IM1 Lesson 5-3 source capabilities and example identities. Twelve draft candidates passed independent review. Current metadata totals match arrays. Source, inventory, lint, TypeScript, and build checks pass. Commit `a23c5951`. Approval and complete practice remain open.

- [x] Task G23: Review IM1 Lesson 5-4 correlation and causation from the original worksheet. Commit `7e388118` adds five draft candidates and reuses two Lesson 5-3 capabilities. Source data and causal evidence limits are corrected. Seven focused tests, lint, standalone TypeScript, and build pass. Curriculum approval remains open.
- [x] Task G24: Review and repair IM1 Lesson 5-5 from the original source. Commit `d469e472` adds ten draft capabilities, reuses four prior capabilities, and restores thirteen source tables. Parent mathematical and mapping review, thirteen focused tests, lint, standalone TypeScript, and build pass. Curriculum approval remains open.
- [x] Task G25: Restore IM1 Lesson 5-6 source mathematics and capability boundaries. Commit `6b51add7` preserves existing identities and adds 17 inactive draft candidates. Independent source review, five focused tests, lint, standalone TypeScript, and build pass. Curriculum approval remains open.
- [x] Task G26: Restore IM1 Lesson 6-1 source and capability scope. Commit `6ebde003` adds 15 inactive draft candidates and three source identities. Parent and independent reviews correct Problem 29 and negative-factor classification. Five focused tests, lint, standalone TypeScript, and build pass. Curriculum approval remains open.
- [x] Task G27: Repair IM1 Lesson 6-2 from the original worksheet. Commit `16632f68` adds seven draft capabilities and seven supported reuses. Independent review removed one unsupported error-diagnosis edge. All 2,366 prior edges remain intact. Focused, curriculum, inventory, audit, lint, standalone TypeScript, and build checks pass. Source approval remains open.
- [~] Task B2: Correct the Business Math Unit 2 Lesson 11 assessment aggregate. The working-tree repair preserves physical activities and removes seven prerequisite edges and two aggregate mappings. Source review is committed as `bda89f3d`. Parent review and eleven consumer tests pass. Catalog integration and broader source review remain open.
- [~] Task B3: Make Business Math source publication honor withdrawn exact-node mappings. Verify that the old notebook cannot establish exposure to the event-analysis capability. The regression returned true before the guard repair and false afterward. Independent review and the actual registered teacher boundary pass. Thirty-three related tests, lint, standalone TypeScript, and build pass. Full catalog integration remains open.
- [~] Task Q9: Integrate the selected IM3 three-mode seed with idempotent upsert and draft phase links. Preserve approval boundaries. The selected seed foundation is committed as `ee844bab`. Six isolated tests and independent review pass. Main now preserves selected Phase 4 sequences 1 and 2 and links domain-range at sequences 4 and 5. Seven focused seed, submission, and trust tests pass. Lint, standalone TypeScript, and build pass. A student domain-range acknowledgement no longer creates teacher-led evidence. The combined main integration now passes 186 tests. Helper conflict review found an incomplete linked-activity guard; the repair now validates exact mode, props, grading, and SRS policy. The helper now passes independent review and 16 related tests. Later-node integration and complete teacher and student acceptance remain open.

- [x] Task Q10: Integrate the exact selected IM3 Worked acknowledgement through the existing server writer. Require active student identity, reviewed physical content, published catalog, exact source props, empty acknowledgement, and replay safety. Persist no teacher evidence or SRS result. The main integration passes 283 related tests, lint, standalone TypeScript, and build. Commit `db30a4d1` saves the selected writer patch. Thirty-eight isolated tests and lint pass. Replay rejects stored grade fields. Strict caller connection and reload recovery are committed in `be52b841`. Teacher attestation remains under Task Q13.
- [x] Task Q11: Preserve Guided table-and-graph assistance through the selected IM3 evidence consumer. Commit `745faac0` records each hint once. Commit `927dcf0a` integrates stored grade and part parity, current physical approval and content checks, and SRS assistance caps. Unsupported reveal telemetry is rejected. The clean combined candidate passes 118 tests, lint, build, and standalone TypeScript with explicit candidate package source paths. Hint counts remain learner telemetry. Source approval and the real student journey remain under Task 4.2.

- [x] Task Q12: Require an explicit student action before recording selected Worked review. Preserve durable retry payloads and phase completion gating. Opening a phase no longer submits an acknowledgement in main. The new regression and 76 existing renderer tests pass. Lint, standalone TypeScript, and build pass. Independent review found that the caller still uses the legacy route and that remount can conflict on timestamp replay. Main now connects the strict route and restores stored acknowledgements. Four parent regressions hardened lookup contract, physical activity, and attempt checks. The combined 138 tests, lint, standalone TypeScript, and build pass. Commit `be52b841` integrates the selected-only caller and lookup. Thirty-three isolated tests and lint pass. The pending practice client reuses the create-only helper; 17 client and route composition tests, lint, standalone TypeScript, and build pass. The full approved student journey remains in Task 4.2.

## Phase 4 — Implement the minimum shared repairs and five pilots

- [~] Task 4.1: Repair shared projection and registration gaps required by pilots.
  Reuse the current projector and registries. Preserve app ownership. Avoid a new generated-instance framework or broad primitive program. The selected quadratic generator projection is committed as `07630ba0`. The shared SRS submission link and timestamp repair is committed as `3420e8c4`.
  The current interval component repair must await durable submission and describe actual graph coordinates without revealing the classification.
- [x] Task Q7: Integrate the selected IM3 quadratic server grader. Commit `9951fa09` preserves the stripped ungraded fallback. The selected 28 tests pass in the isolated patch and current app. App lint, standalone TypeScript, and build pass. Isolated statement coverage is 96.15 percent. Strict writer rejection and evidence integration remain open.
- [x] Task Q8: Integrate the selected IM3 physical submission writer and authenticated route. Commit `8470fd2b` adds identity, approval, response, and replay checks. Final focused tests pass 41 cases. The broader 213-test run and app gates pass. All 14 added writer functions are covered. Live schema rollout, seed, evidence, and browser acceptance remain open.
- [~] Task 4.2: Complete and verify the IM3 reference pilot.
  Connect source, all three modes, generator, renderer, server grading, stored submission, and exact-node evidence. Verify the real student route. Current parent review covers organization boundaries, candidate identity parity, and conflicting replay keys. Shared table-graph save and response contract committed as `4146100a`. Rendered answers reach the real server grader. Valid SVG curve coordinates and the complete Worked view are committed as `1128aef8` and `83d0710d`.
- [~] Task 4.3: Complete and verify the Precalculus pilot.
  Reuse current local corrections. Check the selected activity and exact evidence binding. Verify all three modes in the student route. The parent is adding teacher source context and durable confirmation controls, plus accurate student acknowledgement text.
- [~] Task 4.4: Complete and verify the IM1 pilot.
  Reuse a valid existing algebra generator. Complete source mapping and the required app rendering/submission path.
- [x] Task Q6: Verify the IM2 teacher page, source query, form, route, and durable exposure handler together. Check response loss after storage and exact-key retry. Keep live positive acceptance separate. Two tests and app gates pass. Commit `1b65e178`.
- [~] Task 4.5: Complete and verify the IM2 pilot.
  Reuse the current lesson runtime and perpendicular-bisector work where correct. Coordinate with the active correction track. Parent verification covers actual Worked/Guided/teacher/Independent flow and accurate replay evidence state. Student save and retry controls are committed as `bca8c9e6`. The local mode projector and private grader are committed as `c2e8813d`. Five generator tests and app gates pass. Trusted storage and evidence are committed as `fc6c3870`. Root verification passed 65 focused tests and app gates. The query preserves a fresh eligible attempt after teacher confirmation. The authenticated student route and page are committed as `5c7a48d7`. Teacher candidate display and confirmation are committed as `3b1b5206`. The real signed-in student page rejects the current draft publication. Positive three-mode browser acceptance remains pending.
- [~] Task 4.6: Complete and verify the Business Math pilot.
  Reconcile published activity mapping with the three modes. Preserve manual evidence for artifacts that require teacher review. Keep adaptive activation within the existing approved policy. The app-owned event draft is committed as `469787a9`. The pure grader is committed as `41a5c5c9`. Category-choice assessment is committed as `a9a38498`. Strict props and real registry integration are committed as `093386d2`. The lesson save callback is committed as `292621b2`. Forty-two event tests, 21 renderer tests, and app gates pass. Trusted persistence, source mapping, teacher model review, and full student flow remain open.
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

## Workspace preservation follow-up

A Business Math build check restored `apps/bus-math-v2/lib/workbooks-manifest.json` from HEAD without a recorded pre-build copy or status for that file. Recovery found a pre-build dirty status and earlier logs that list 71 workbooks. HEAD had only 66. The parent ran the existing generator and verified all non-timestamp fields against the current workbook directories. The five missing entries are restored. The previous timestamp could not be recovered; the file has a new generation timestamp. Keep this recovered working-tree file outside practice commits.

- [x] Task G28: Repair IM1 Lesson 6-3 from the original worksheet. Commit `3a3cad78` adds ten draft capabilities, three source identities, and five supported reuses. All 2,380 prior edges remain unchanged. Independent and parent review confirm the strict Problem 3 endpoint. Sixteen focused, 92 curriculum, five inventory, and 36 audit tests pass. App/package lint, standalone TypeScript, and final app build pass. Source approval remains open.

- [x] Task Q13: Require the exact selected IM3 Worked source for teacher exposure. Commit `927dcf0a` integrates physical source and grading checks, teacher and class authorization, assignment timing, exact teacher candidates, and the receipt-validated teacher form. The clean combined candidate passes 118 tests, lint, build, and source-mapped standalone TypeScript. No curriculum approval or deployment occurred. Shared worktree reconciliation remains under Task Q15.

- [x] Task G29: Review IM1 Lesson 6-4 against its original worksheet and the current graph. Identify source-supported capability boundaries, exact example mappings, and mathematical limits before authoring changes. Commit `a17b9552` preserves five source IDs and adds 11 draft inactive capabilities with five reuses. All prior edges and the queue prefix remain intact. Source mathematics and list formatting pass parent review. Gates pass: 98 curriculum tests, 36 audit tests, 17 focused tests, app/package lint and standalone TypeScript, and app build. The optional scaffold retains one pre-existing Module 1 gap failure.

- [x] Task Q14: Connect selected Guided and Independent practice through the actual queue consumers. Commits `eed70b28` and `927dcf0a` integrate strict receipts and server grading. Commit `9462dcd1` connects the exact selected seed to the real graph component and preserves physical identity, mode, parts, and hints. The queue rejects generic fallback and altered selected props or grading. Parent checks pass: 46 tests, lint, build, and source-mapped standalone TypeScript. Shared worktree reconciliation passes 186 tests, lint, standalone TypeScript, parent diff review, and parent build. It preserves later-node edits. See `im3-selected-queue-main-reconciliation.md`. Keep the full approved student journey open under Task 4.2. The Worked lesson path is Task Q16.

- [x] Task G30: Review AP Precalculus Topic 1.1 source capability boundaries. Commit `f464484c` restores all 12 source examples, exact capability mappings, vocabulary, graph descriptions, and authored-content labels. Five draft candidates remain inactive. The graph-construction objective remains an explicit coverage gap. Source publication is not approved.

- [x] Task Q15: Reconcile the committed selected IM3 evidence and teacher interface fixes with the shared worktree. Preserve pending later-node changes. Snapshot owned files. Apply only missing selected behavior. Verify the actual shared worktree with focused regressions. The worker reports 153 passing tests, lint, and standalone TypeScript. Parent diff review, 11 general provider tests, and app build pass. See `im3-selected-main-reconciliation.md`.

- [x] Task Q16: Repair the selected IM3 Worked lesson path. Commit `0605917c` joins verified physical props, uses the Worked display, requires the stored acknowledgement, preserves completed replay, and removes student-created teacher exposure. Missing, altered, and withdrawn sources do not render a graph. Independent review has no open findings. Parent candidate checks pass: 38 tests, lint, fresh build, and standalone TypeScript. Shared worktree reconciliation passes 107 author tests and app gates. Parent review and 74 selected/later-node tests pass after stale-claim and duplicate-source repairs. See `im3-selected-phase-main-reconciliation.md`. Source approval and the complete signed-in journey remain open under Task 4.2.

- [x] Task G31: Reconcile the Precalculus Topic 1.1 source repair with committed identities. Commit `f464484c` preserves the rejected legacy ID and all prior edges. Five committed blueprints remain source-only while pending pilot dependencies stay in the shared worktree. Eight isolated source tests, 15 shared-worktree tests, lint, build, and source-mapped standalone TypeScript pass. Existing authority-route failures remain under Q18. See `precalc-topic11-source-integration.md`.

- [x] Task Q17: Integrate the existing Precalculus quality-gate prerequisites. Commit `d72209ee` reuses the Next Link correction and typed submission-authority mock. Candidate lint, build, and source-mapped standalone TypeScript pass. Three existing authority test failures remain because the committed route expects browser evidence. Task Q18 owns that production repair.

- [~] Task Q18: Integrate the exact Precalculus pilot submission boundary. Generator and grader commit `078603f8`, selected writer commit `d7b735aa`, and wrapped conflict correction `ad228e5a` are accepted. Shared-worktree writer reconciliation is complete. Commit `78201f36` adds the independently reviewed selected evidence transaction and opaque-ID route. Parent verification passes 62 tests, lint, a fresh build, and source-mapped post-build TypeScript. Guided participation stays ungraded; Independent evidence uses real stored grades and assistance. See `precalc-selected-evidence-integration.md`. Main shared-handler reconciliation is verified under Q20. The independently reviewed older evidence-fixture repair is applied in the shared worktree. The parent also applied the independently reviewed source-test reconciliation. All 216 combined Q18/Q22 tests pass. Q35 completed real local rollback and concurrency checks. Commit `c8358384` supplies the required public exports. The final Unit 7 browser matrix verifies trusted teacher delivery and the positive signed-in flow. Source approval remains open.

- [x] Task G32: Correct IM1 Lesson 6-5 from the original worksheet. Commit `be27e193` restores complete givens, preserves all stable IDs and standards edges, keeps changed sources draft, and adds 11 inactive capabilities with 14 containment edges. It removes six placeholder activities and only the two unsupported sequence prerequisites. Both SRS projections remove the withdrawn downstream prerequisite. Parent verification passes 105 curriculum tests, lint, build, post-build standalone TypeScript, and 15 shared-worktree focused tests. The author coverage and audit suite passes 36 tests. See `im1-lesson65-integration.md`. Source approval and practice implementation remain open.

- [x] Task G33: Restore IM1 Lesson 7-1 source and atomic inventory. Commit `0175218e` preserves all prior graph identities and standard edges. It adds 12 draft inactive capabilities and 13 draft containment edges, with exact existing line-graphing reuse. Full worksheet givens, all five figures, and seven stable source references are repaired. The three legacy placeholder activities are removed. Parent verification passes 110 curriculum tests and all app gates; 12 main focused tests pass. The final legacy standard-reference preservation correction passes focused tests and app gates. See `im1-lesson71-integration.md`. New capability source approval and three-mode practice remain open.

- [~] Task Q19: Integrate the selected Precalculus trusted teacher backend. Commit `da95212c` adds the independently reviewed Worked acknowledgement and teacher mutation to the committed baseline. The acknowledgement checks published source availability in the same transaction. Teacher confirmation checks active credentials, organization, class, enrollment, assignment, source identity, and occurrence time. Combined parent verification passes 134 tests and all app gates. Worked publication checks are scoped to acknowledgement and teacher paths. Parent main reconciliation now passes 117 backend tests, three teacher route tests, lint, a fresh build, and post-build TypeScript. The production teacher route uses the accepted camel-case handler and preserves the selected evidence dispatcher. The exact selected seed is committed as `923bf572`. Learner delivery, the teacher provider and interface, and the positive signed-in flow pass the final Unit 7 matrix. Source approval remains open. See `precalc-selected-teacher-main-reconciliation.md` and `precalc-topic11-teacher-delivery-integration-plan.md`.

- [x] Task Q20: Reconcile the accepted selected evidence transaction with the main Precalculus shared handler. Acceptance record: `2a4602a0`. The parent applied the independently reviewed dispatcher and strict selected route. Durable selected replays preserve active authentication. Current-worktree focused verification passes 189 tests; all 42 selected writer tests pass. Lint, a fresh build, and post-build standalone TypeScript pass. Pending later-topic code and schema remain intact. Four curriculum failures and seven older evidence-fixture failures remain visible under Q21 and Q18. Q19 teacher reconciliation remains separate. See `precalc-selected-evidence-main-reconciliation.md`.

- [x] Task G34: Repair IM1 Lesson 7-2 from the original worksheet. Commit `4f8cafc4` preserves all original systems, contextual conditions, figures, and manual tasks. Six new draft capabilities and five reused capabilities replace the broad practice boundary. Eleven draft containment edges are added; only sequence edges 1260 and 1261 and three placeholders are removed. Parent metadata and audit corrections pass supplemental independent review. All 115 parent curriculum tests, lint, a fresh build, and post-build TypeScript pass. Source approval and new practice components remain open. See `im1-lesson72-integration.md`.

- [x] Task Q21: Correct Precalculus Topic 1.1 source assertions and stale draft activity eligibility. Source-test commit: `a6121256`. Independent review accepts the four-file application patch. The parent applied exactly 32 eligibility corrections without changing activity identities or standalone SRS inputs. All 373 current-worktree curriculum tests and app gates pass. Two source-test corrections also apply to HEAD; four older HEAD class-period assertions remain outside this patch. Other assessed-topic keyword and line-count checks remain technical debt. See `precalc-curriculum-correction-integration.md`.

- [x] Task Q22: Integrate the exact Precalculus Topic 1.1 Worked source seed. Acceptance record: `c0c80591`. The independently reviewed seed and stale source-test repairs are applied in the shared worktree. All 216 combined Q18/Q22 tests pass. Parent lint, a fresh build, and post-build standalone TypeScript pass. Source identity, replay approval, duplicate rows, wrong phase ownership, and occupied sequence are checked. The source remains unreviewed. No live seed ran. See `precalc-selected-seed-and-fixture-main-verification.md`. This completes Integration 1 in `precalc-topic11-teacher-delivery-integration-plan.md`; learner and teacher delivery remain open.

- [x] Task Q23: Correct Precalculus Lesson 1.1 and ordinary seed text together. Source and acceptance record: `7aabe987`. The parent applied the independently reviewed correction, resolved the four implementation findings, and preserved the accepted definition wording. All 394 curriculum and seed tests, lint, a fresh build, and post-build standalone TypeScript pass. The recovered Passwater section is unchanged. The selected source remains unreviewed. The lesson is included in the bounded source commit; the seed and new parity test remain applied with pending runtime dependencies. See `precalc-seed-source-parity-integration.md`.

- [x] Task G35: Correct IM1 Lesson 7-3 from the original worksheet. Commit `ec5647ee` restores all 49 problems and adds two draft direct-elimination capabilities with five exact reuse links. It preserves stable source IDs, rejects duplicate `.012`, deactivates the legacy aggregate, removes three empty activities, and removes only three reviewed edges. The current queue, matrix, and audit agree. Parent verification passes 139 curriculum and seed tests, eight standards tests, 36 coverage tests, lint, build, and post-build standalone TypeScript. See `im1-lesson73-integration.md`. Source approval, practice, and the mixed Problem 47 capability decision remain open.


- [x] Task Q24: Integrate the exact Precalculus Topic 1.1 Worked projection and remove client fallback content. Independent review accepts the corrected source ownership predicate and consumer wiring. The parent verifies the combined Q24/Q25 result with 123 tests, lint, a fresh build, and post-build standalone TypeScript. Runtime integration remains in the shared worktree with pending dependencies. See `precalc-worked-projection-route-integration.md`.

Additional observed test debt: `topic11-interval-blueprint.acceptance.test.ts` expects a null preview, while the pending preview helper returns an unavailable summary. Review this contract before correction. It is outside the four accepted G31 source assertion repairs.


- [x] Task G36: Restore IM1 Lesson 7-4 source and capability boundaries. Commit `d21f39ed` preserves all 25 worksheet problems, adds six draft inactive atoms with six reuses, corrects source identities and exact references, and removes unsupported placeholders and dependencies. Final independent review accepts the result. All 145 parent curriculum and seed tests, 36 coverage tests, lint, build, and post-build standalone TypeScript pass. See `im1-lesson74-integration.md`.


- [x] Task Q25: Harden the selected Precalculus Worked acknowledgement route. The parent corrected the final review fixture field and regenerated the current-worktree patch. The combined Q24/Q25 run verifies the real writer, opaque keys, exact receipts, conflict mapping, and source ownership. All 123 tests and app gates pass. See `precalc-worked-projection-route-integration.md`.


- [x] Task Q26: Validate the selected Precalculus Worked receipt in the real learner component. Independent review accepts the exact receipt and durable retry behavior. Parent verification passes 80 tests in seven files, lint, a fresh build, and post-build standalone TypeScript. The patch is applied in the shared worktree. See `precalc-worked-client-receipt-integration.md`.

- [x] Task Q27: Derive Precalculus learner delivery state from exact acknowledgement and trusted teacher evidence. The corrected query checks source authority at acknowledgement time and uses uncapped existing indexes. Independent review accepts the actual writer, teacher, and early-practice tests. Parent verification passes 72 tests, lint, build, and post-build TypeScript. The query is applied in the shared worktree. Consumer integration remains Q28. See `precalc-learner-state-integration.md`.

- [x] Task G37: Restore IM1 Lesson 7-5 source and repair its graph. Source commit `fedfa50e` restores all 28 prompts and four original graphs. Graph commit `28326b9b` repairs 7i, adds seven draft capabilities, preserves rejected stable identities, removes unsupported prerequisites and six placeholders, and excludes rejected 7k from current coverage. Parent verification passes 155 curriculum and seed tests, 37 coverage tests, app lint, build, and standalone TypeScript. Shared math-content lint and TypeScript pass. See `im1-lesson75-graph-integration.md`. Source approval and usable practice remain open.

- [x] Task Q28: Connect Precalculus learner state to the lesson and dashboard. The parent accepts the corrected actual state-to-page composition and pending dashboard test. All 89 parent tests, lint, build, and post-build TypeScript pass. Runtime changes are applied in the shared worktree. See `precalc-learner-ui-integration.md`.

- [x] Task Q29: Harden the Precalculus teacher route and form. Independent review accepts the exact actual new/replay result contract, strict request, safe receipt, locked retry tuple, and real route-to-writer proof. Parent verification passes 63 tests, lint, build, and post-build TypeScript. Runtime changes are applied in the shared worktree. See `precalc-teacher-route-form-integration.md`.

- [x] Task Q30: Add the exact Precalculus teacher candidate query. The shared worktree passes independent review, 73 parent tests, lint, build, and post-build TypeScript. It uses uncapped existing indexes and exact source, acknowledgement, credential, class, enrollment, and assignment authority. Duplicate enrollment rows exclude the affected class. See `precalc-teacher-candidates-integration.md`. Q31 page composition remains open.

- [x] Task G38: Restore and repair IM1 Lesson 8-1. Source commit `f62ef3fa` restores all 19 problems and exact tables and grid. Graph commit `e724a276` adds eight draft capabilities, repairs stable 8a, reuses 8e, preserves the rejected duplicate identity, and removes three placeholders. Independent review accepts the corrected direct domain-and-range references. Parent verification passes 183 curriculum and seed tests, 37 coverage tests, lint, build, and post-build TypeScript. See `im1-lesson81-graph-integration.md`. Source approval and usable practice remain open.

- [x] Task Q31: Connect exact teacher candidates to both Precalculus pages. Parent review accepts the corrected real acknowledgement, query, page, form, POST, teacher writer, and fresh-page removal flow with 125 unrelated submissions. Combined Q31 and Q32 verification passes 83 tests, lint, build, and post-build TypeScript. See `precalc-teacher-candidate-ui-integration.md`. Live browser verification remains open.

- [x] Task Q32: Add a fresh lesson-status request to both pending Precalculus learner views. Two assertions failed before implementation. Parent tests and independent review pass. The existing real pending-to-ready lesson transition remains verified. See `precalc-learner-status-check-integration.md`.

- [x] Task Q33: Validate exact Precalculus submission and evidence receipts before client success. Preserve opaque retry identity and guard synchronous submissions. Parent and independent review accept corrected mode and enum checks and current acceptance fixtures. All 30 tests, lint, build, and post-build TypeScript pass in the shared worktree. See `precalc-practice-receipts-integration.md`. Signed-in browser verification remains open.

- [x] Task G39: Restore IM1 Lesson 8-2 from its original worksheet and review its graph boundaries. Restore all 50 prompts and original figures. Parent review corrected the proposed answers for Problems 15 and 40 from original graph assets. Parent and independent review accept the corrected eight-atom proposal. Source restoration is committed as `dd38c4c7` after seven parent tests, independent review, lint, build, and TypeScript. Graph repair is committed as `1f6471e7` after independent review, 196 parent curriculum and seed tests, 37 coverage tests, lint, build, and standalone TypeScript. Preserve source identities and exact reuse.

- [x] Task Q34: Verify one complete Precalculus teacher-first learner sequence in the shared integration test context. Connect actual lesson, acknowledgement, teacher candidate page and action, refreshed lesson, Guided and Independent components, routes, writers, evidence, and SRS stores. Create teacher evidence through the actual teacher action. Do not substitute a hand-authored teacher event or receipt. Keep isolated source publication and authentication fixtures explicit. This does not replace signed-in browser verification. Parent verification passes one complete composed test, lint, build, and standalone TypeScript. Independent review accepts the in-process flow. See `precalc-full-learner-sequence-integration.md`.

- [x] Task G40: Review IM1 Lesson 8-3 against its original worksheet. Identify separately assessable exponential-model operations and exact reuse. Verify each mathematical result and stated financial-model assumption from the source. Parent and independent review accept the corrected five-new-skill and six-reuse proposal. Independent review accepts the complete source restoration. Source repair is committed as `a4314eed` after six parent tests, lint, build, and standalone TypeScript. Graph repair is committed as `e7f4f0d5` after independent review, 208 parent curriculum and seed tests, 37 coverage tests, lint, build, and standalone TypeScript.

- [x] Task Q35: Check whether the installed Convex test tools can verify selected Precalculus evidence rollback and concurrent replay. Trace the actual transaction boundary. The installed CLI and cached local backend permit a disposable local verification without new dependencies. Initial local verification proved basic rollback and existing receipt replay only. Fresh selected evidence and SRS rollback and concurrent first delivery remain open. The compatible selectedLearningEvidence rename is applied in the shared worktree and passes 151 parent tests and app gates. The parent executed fresh actual grading/evidence, rollback of actual effects, and concurrent first delivery on the real local backend. Independent review accepts the local transaction results and verifies the logged conflict retry. Independent review also accepts Guided concurrency, stored assistance, and disabled-credential fresh/replay rejection. The local backend records conflicts and retries for both modes. Executed fixtures and row snapshots are saved under `evidence/precalc-q35-local/`. This completes the local transaction verification, not browser or cloud verification. See `precalc-real-transaction-parent-results.md`. See `precalc-local-transaction-partial-review.md`. Confirm the target before each code or data write. Do not substitute an in-memory store for real transaction evidence.

- [x] Task G41: Review IM1 Lesson 8-4 from its original worksheet. Verify model-rate interval assumptions, exact capabilities, prior reuse, and manual tasks before source or graph implementation. Source repair is committed as `63781185` after independent review, seven parent tests, lint, build, and standalone TypeScript. Parent review records interest-rate ambiguity and nonconstant table ratios in `im1-lesson84-parent-rate-review.md`. Graph repair is committed as `61bebf4d` after independent review, 219 parent curriculum and seed tests, 37 coverage tests, lint, build, and standalone TypeScript.

- [x] Task G42: Review IM1 Lesson 8-5 from its original worksheet. Verify geometric-sequence operations, exact reuse, source identities, and manual tasks before implementation. Source restoration is committed as `7f988634`. All 52 prompts and five original images passed independent review, seven parent tests, lint, build, and standalone TypeScript. The source review records the tests-after-code deviation. The corrected graph is committed as `e67e5521`. Independent source-boundary review, 239 parent curriculum and seed tests, 37 coverage tests, lint, build, and standalone TypeScript passed.

- [x] Task Q36: Prepare and verify the actual signed-in Precalculus student and teacher sequence on the disposable local backend. Use real authentication, pages, routes, and teacher action. Keep hypothetical source approval and local-only credentials explicit. Do not substitute Q34 render tests for browser verification.

- [x] Task G43: Review IM1 Lesson 8-6 from its original worksheet. Verify recursive and explicit sequence operations, exact prior reuse, stable source identities, and manual tasks before implementation. Parent inspection and independent review accepted the corrected proposal. It contains six new candidates, including four conversion operations and two rule-writing operations, and three exact reuses. Problem 40 is direct affine rule-writing evidence. Source restoration is committed as `b6b545bd` after independent review, six parent source tests, lint, build, standalone TypeScript, and 11 original-image byte comparisons. Graph repair is committed as `d29ce0ef`. Independent review accepted it. Parent verification passed 255 curriculum and seed tests, 37 coverage tests, lint, build, and standalone TypeScript. The new records remain draft and source-only.

Q36 positive browser actions and persisted local effects passed independent review. The generic Worked response form is corrected in the shared worktree. A fresh signed-in lesson reload and independent review confirm that the extra form is absent. Evidence is saved under `evidence/precalc-q36-local/`. This completes the bounded local positive browser sequence. It does not establish production source approval, committed runtime integration, or browser coverage for wrong answers, assistance, or ambiguous-network retries. Q37 remains open. See `precalc-worked-form-independent-review.md`.

- [x] Task Q37: Identify and integrate the Precalculus runtime files required by the selected Topic 1.1 lesson flow. Units 1 through 6, the selected seed, learner surface, teacher query, public exports, teacher surface, and later bounded runtime repairs are committed. The final nine-row local browser matrix is accepted in 7838c6a7a. This proves the selected local flow only. It does not approve the curriculum source or prove full-course coverage.

Q37 dependency tracing is complete. See `precalc-runtime-integration-dependencies.md`. The isolated first-unit check found the selected contracts, grader, schema, and writers already present in HEAD. Its 95 focused tests pass. Independent verification accepted this reuse. Unit 2 is committed as `04e6dbd1`. It renames the existing selected evidence module with no production-body change. Independent review and 77 focused tests pass, with lint, build, and mapped standalone TypeScript. The next unit traces the remaining course and teacher-flow dependencies. See `precalc-runtime-unit1-report.md`.

- [x] Task G44: Review IM1 Lesson 9-1 from the original worksheet. Verify center-measure capabilities, percentile-rank conventions, source tables, exact existing reuse, and manual reasoning tasks before implementation. The current summary uses conflicting percentile definitions and omits source tables. Parent inspection and independent review accepted the four-candidate proposal. Source restoration is committed as `092901ac` after independent review, five parent source tests, lint, build, standalone TypeScript, and 10 original-media byte comparisons. Graph repair is committed as `9a3a8ef4`. It removes only unsupported prerequisite edges 1270 and 1271. Parent verification passed 267 curriculum and seed tests, 37 coverage and audit tests, lint, build, and standalone TypeScript. Independent review accepted the final graph and derived artifacts. See `im1-lesson91-graph-integration.md`.

Q37 unit 3 is committed as `37617752`. It adds the three selected learner queries and exact source-layout checks. Parent and independent verification passed 151 tests. Parent lint, build, and mapped standalone TypeScript passed. Unit 4 learner-surface integration is committed as `177d65d4`. See `precalc-runtime-unit3-parent-integration.md` and `precalc-runtime-unit3-plan.md`.

- [x] Task G45: Review IM1 Lesson 9-2 from its original worksheet. Verify each prompt, existing exact reuse, stable identities, and manual or ambiguous response boundaries before implementation. Parent review accepted the revised 16-candidate proposal after it split four bundled data-reading operations and removed invented source groups. The first source candidate failed review. It omitted two orchestra ages and changed source wording and table labels. Six passing source tests did not cover those errors. Source restoration is committed as `ffb14971` after final independent review, six parent source tests, lint, build, standalone TypeScript, and seven native-image byte comparisons. The graph repair is committed as `e4cd1d34`. Final parent verification passed 292 curriculum and seed tests, 37 coverage and audit tests, lint, build, and standalone TypeScript. Independent review accepted the two corrected exact source references. See `im1-lesson92-graph-integration.md`, `im1-lesson92-source-integration.md`, `im1-lesson92-source-first-review.md`, `im1-lesson92-capabilities-review.md` and `im1-lesson92-proposal-parent-review.md`.

- [x] Task G46: Review IM1 Lesson 9-3 from the original worksheet. Verify all prompts, native figures, exact prior reuse, stable identities, and distinct response boundaries before implementation. Parent inspection and independent review accepted the corrected 20-candidate proposal with three exact Lesson 9-1 reuses. Problem 21 remains a false-premise correction boundary. Source restoration is committed as `09da2c6f`. Six parent source tests, lint, build, standalone TypeScript, and two native-image byte comparisons passed. Independent review accepted the final text correction. Graph repair is committed as `a161f18b`. Parent verification passed 321 curriculum and seed tests, 37 coverage and audit tests, lint, build, and standalone TypeScript. See `im1-lesson93-graph-integration.md`, `im1-lesson93-source-integration.md` and `im1-lesson93-capabilities-review.md` and `im1-lesson93-proposal-independent-review.md`.

Q37 unit 4 is committed as `177d65d4`. It includes the selected lesson surface, ordinary response history, and the required `lesson_responses` table with two indexes. No deployment occurred. See `precalc-runtime-unit4-plan.md`.

G46 graph review found one source-reference defect. Problem 5 requests selection without an explicit justification. Problem 6 requests both. The corrected graph is committed as `a161f18b`. Edge 1273 is an unsupported lesson-order dependency from survey bias to statistical spread. Its removal is supported by the inspected rationale. See `im1-lesson93-graph-first-review.md`.

Q37 unit 4 review rejected raw section content in the learner query. Real seeded sections contain fields outside the public return contract. The committed unit 4 correction adds an explicit projection and a real committed-seed regression. The selected Q22 seed remains pending work and is a separate integration prerequisite. Unit 4 does not prove the complete selected seeded flow.

G46 graph correction is committed as `a161f18b`. The parent accepted the corrected Problem 5 and Problem 6 references after independent review identified the defect.

- [x] Task G47: Review IM1 Lesson 9-4 from its original worksheet. Inspect all prompts and native figures. Propose exact capabilities, reuse, source identities, and manual boundaries before source or graph implementation.

Q37 unit 5 seed dependency review is recorded in `precalc-runtime-unit5-seed-review.md`. Unit 4 is accepted and committed. Unit 5 integration remains open.

Q37 unit 4 parent inspection also found a browser-generated Guided and Independent fallback that conflicts with the selected server-props contract. The accepted unit 4 commit removes it. The unit 4 plan now distinguishes the committed legacy seed from the pending selected seed. Unit 5 is specified in `precalc-runtime-unit5-plan.md` and follows committed unit 4.

G47 parent inspection verified all three native figures. The first proposal needs separate Problem 27 responses, removal of an added independence assumption, and an odd-size quartile convention boundary. Conditional prerequisite proposals remain unaccepted. See `im1-lesson94-parent-source-review.md`.

G47 parent review accepts the revised ten-candidate source proposal for source restoration. Problem 27 has two separate responses. A supplied-summary box plot does not require summary calculation; that proposed prerequisite is removed. Independent review accepted median-to-summary. Source restoration is committed as `fbc8d457`. See `im1-lesson94-capabilities-review.md`.

Q37 unit 4 is committed as `177d65d4`. Parent verification passed 200 tests in 14 files, lint, build, and mapped standalone TypeScript. Independent review accepted 49 learner tests and the final source-props and public-content corrections. The 18 runtime patch paths match the tested candidate. Later shared-worktree changes remain separate. Unit 5 selected-seed integration is in progress. See `precalc-runtime-unit4-parent-integration.md`.

Q37 unit 6 dependency tracing found the selected teacher writer already committed in `selectedLearningEvidence.ts`. The pending route uses a different uncommitted module name. The teacher dashboard is still a committed placeholder. A bounded teacher query, route, form, and dashboard integration is specified in `precalc-runtime-unit6-plan.md`. Unit 5 remains in progress.

Independent review accepted the G47 ten-candidate proposal and the median-to-five-number-summary prerequisite proposal. Edge 1273 is absent from the active graph but remains in a review queue. Its consumer and historical status are under inspection before any queue change. See `im1-lesson94-proposal-independent-review.md`.

G47 first source candidate failed parent review. It changed several mathematical variables and contexts despite six passing source tests. No source patch was applied. Complete original wording and full-context regressions are required. See `im1-lesson94-source-first-review.md`.

Q37 unit 5 first candidate failed parent source review. Its ordinary bodies predate the accepted Q23 lesson. The required version-2 layout and exact seven-body parity dependency are now explicit. Use the committed lesson from `7aabe987`; preserve all selected activity data. See `precalc-runtime-unit5-first-review.md`.

G47 Lesson 9-4 source restoration is committed as `fbc8d457`. Final parent and independent checks passed seven source tests, lint, build, standalone TypeScript, and three native-image comparisons. The first rejected wording and invalid Green claim are corrected. Graph implementation is in progress. See `im1-lesson94-source-integration.md`.

- [x] Task G48: Inspect IM1 Lesson 9-5 original worksheet while G47 graph and selected-seed checks run. Record source tasks, native figures, stable identities, and ambiguity boundaries before proposing capabilities.

Execution recovery: the execution context changed after the unit 5 independent review. Temporary candidate directories, logs, and agent sessions are absent. Committed source and runtime changes remain intact. Reconstruct the uncommitted unit 5 seed and G47 graph patches from HEAD and the accepted source records. Repeat verification before integration. G48 proposal work continues in parallel. Prior temporary results do not prove the reconstructed files.

Q37 unit 6 query preparation is in progress in an isolated HEAD candidate. The query uses already committed activity and evidence handlers. Its baseline tests can run before unit 5 integration. The final teacher surface and composed seed flow still require unit 5. No main runtime file is changed by this preparation.

Unit 6 query preparation now has a valid 21-test missing-query baseline. The first pending fixture failed publication before reaching that boundary. The corrected fixture reuses the complete committed hypothetical publication. See `precalc-runtime-unit6-query-preparation.md`.

G48 first proposal includes incorrect box-plot construction references for comparison, histogram, and matching tasks. Correct exact evidence references and review combined response boundaries before acceptance. See `im1-lesson95-proposal-first-review.md`.

## Worktree cleanup — 2026-09-08

- [x] Remove 85 stale worktree records. All directories were absent. All recorded commits are ancestors of HEAD. The 26 remaining records include the main checkout, one active graph candidate, and 24 saved Codex worktrees with uncommitted changes. Preserve those changes.
- [~] Commit each verified integration before removing its temporary checkout. Review saved worktree changes before cleanup.

G47 source and graph review is complete. Source commit: `fbc8d457`. Graph commit: `c1cf77d9`. Parent 339 curriculum/seed tests, 37 coverage/audit tests, lint, build, and standalone TypeScript passed. All ten new capabilities remain inactive. See `im1-lesson94-graph-integration.md`.

Q37 unit 5 is committed as `923bf572`. Parent and independent review passed the corrected valid historical fixtures and exact source parity. Unit 6 query is committed as `a40ca6e2`. Parent and independent authority checks passed. Unit 6 route, form, dashboard, and full composed browser sequence remain open. A fresh candidate now implements the teacher surface.

Cleanup after integration: removed the completed G47 worktree and both completed Precalculus archive candidates. Compared each owned file against the committed blob before removal. Shared dependency directories remain intact. Review of the 24 saved Codex worktrees continues without removal of uncommitted work.

G48 second proposal review accepts the complete prompt inventory for source restoration. Graph review remains open because several proposed nodes repeat existing component operations or combine separate comparisons. Exact source restoration is in progress in an isolated candidate. See `im1-lesson95-proposal-second-review.md`.

- [x] Task Q37 unit 7: Prepare and run the full committed selected-seed browser flow after the teacher surface integration. Cached backend and installed headless Chrome readiness are verified. See `precalc-runtime-unit7-verification-plan.md`.

Saved-worktree review checked 54d1, bda5, and b5f1. Each retains distinct IM3 graph states that are not preserved in the current worktree or reachable commits. Retain them pending reconciliation. This finding does not block the active program candidates.

G48 parent and independent review accept the corrected 18-candidate graph proposal for later implementation. Removed the duplicate mean/median comparison and unsupported exact range/IQR calculation claims. Source restoration must pass review and commit first. See `im1-lesson95-capabilities-review.md` and `im1-lesson95-proposal-independent-review.md`.

Q37 true workspace isolation found two missing committed public exports. The selected component and schema files already exist. A bounded dependency correction is in progress before teacher surface acceptance. Earlier shared-link builds do not prove wholly committed workspace builds. See `precalc-runtime-workspace-resolution-review.md`. The actual local backend seed and zero-effect initial state are verified; browser verification remains open.

G48 first source review found a changed native label, an invented unit, missing visible A/B/C labels, and incomplete figure descriptions. Exact prompt text and image bytes pass. Corrections and regression tests are in progress. See `im1-lesson95-source-first-review.md`.

G48 exact source restoration is committed as `f6eaf15c`. Final parent and independent source checks pass. All 11 native images were inspected. Seven focused tests, lint, build, and standalone TypeScript passed with candidate-local workspace packages. Graph implementation now follows the accepted 18-candidate proposal.

Q37 public exports are committed as `c8358384`. The schema has one owner in math-content. Teacher surface integration is committed as `9de80ba8`. Independent review, 15 public package tests, 16 teacher surface tests, lint, build, and standalone TypeScript pass with isolated workspace resolution. Full browser verification remains in progress on the disposable local backend. Both real login forms now succeed.

Cleanup: removed the completed G48 source archive after comparing all 13 source paths with committed bytes. Its extra review and plan text are preserved in HEAD. Only generated build files and dependency links remained. Rechecked all 24 saved Codex worktrees. None is clean; each has 348–365 changed paths. They remain intact. The completed teacher surface candidate is under final cleanup review.

- [x] Task G49: Review and restore IM1 Lesson 9-6 from Int1_0906_practice.docx. Exact source restoration is committed as 67131a0b9. Graph repair is committed as 334f17643. Parent and independent review accept all 33 prompts, ten native figures, four stable source identities, ten draft capabilities, exact reuse stages, signed center transformation rules, spread rules, manual explanations, and derived counts. The new capabilities remain draft and source-only.

Removed the completed Q37 teacher surface archive after independent cleanup review and parent comparison of all changed source files with HEAD. All 14 patch paths match committed bytes. See `candidate-cleanup-20260908.md`. Active graph and browser candidates remain in use.

G49 parent source inspection is complete. Read all 33 problems and all 10 native data figures. Confirmed Office Math multiplication signs and the Celsius fraction. Recorded the negative-multiplier correction, ordered transformations, and price-table, outlier, and representativeness boundaries. See `im1-lesson96-parent-source-review.md`. Capability proposal review remains in progress.

Q37 unit 7 browser verification found two gaps. Worked acknowledgement replay returns a conflict after a successful first request. The committed handler compares nested JSON fields by reference through `sameRecord`. Reuse its existing `sameJson` comparison and add a regression that recreates persisted values through a JSON round trip. The interval component has no visible hint or reveal controls. Add the required assistance through existing practice contracts and verify counters, eligibility, and rating effects separately. Preserve the baseline browser evidence before changes.

Repository maintenance packed 26,398 loose objects. The total object count remains 77,443. Unreachable objects and reflogs were retained. Object storage fell from about 739 MB to 282 MB. The connectivity check passes. The Git maintenance warning is cleared. No saved worktree was removed.

G49 first proposal review accepts the prompt inventory for source work but rejects the stated two-identity inventory. HEAD has four existing identities. Separate Example 1 and Example 2, and review combined Examples 3 and 4 explicitly. Transformation response boundaries and duplicate evidence claims also need correction. See `im1-lesson96-proposal-first-review.md`.

Q37 unit 7 baseline confirms real seven-phase rendering, an ordinary response, Worked acknowledgement and waiting state, teacher confirmation, practice unlock, a wrong Guided submission, and stale-source lock. Corrected Guided submission returns HTTP 500 before insertion. This is a third open browser defect. The acknowledgement comparison fix passes parent tests and app gates in an isolated candidate and is under independent review. See `precalc-runtime-unit7-browser-baseline.md`.

Acknowledgement replay correction is committed as `097d16a01`. Independent 68-test verification and parent 76-test verification pass. Lint, build, and post-build standalone TypeScript pass. The completed candidate was removed after its two changed files matched committed bytes and independent review classified the remaining generated files. The actual browser retry check remains in progress.

The Guided HTTP 500 diagnosis found empty outgoing answers caused by pre-hydration browser input. No mutation or evidence-bridge repair is required for this failure. After the script waited for page readiness, corrected Guided scored 3/3; Independent wrong and correct attempts scored 0/3 and 3/3 with Again and Good reviews. Reload preserved the recorded identities. See `precalc-runtime-unit7-guided-request-diagnosis.md`. Assistance controls and the complete retry matrix remain open.

G48 broad parent tests found 14 failures in derived counts and audit text. The corrected counts must follow semantic state. Both legacy aggregates remain draft and inactive. Do not restore their approval or executable specifications to match old counts. The derived approved-skill and source-only-blueprint counts are 110 and 349. Independent review corrected its earlier numeric estimate. The graph candidate remains uncommitted pending correction and full verification.

- [x] Task Q37 assistance: Add per-part hints and answer reveals to the selected interval activity. Commit 20c8dd821 preserves the counters, blank-answer guard, immediate freeze guard, and exact retry tuple. The accepted browser proof records Guided non-mastery behavior and a correct assisted Independent result with rating Hard. See precalc-runtime-assistance-browser.md and the final Unit 7 acceptance in 7838c6a7a.

G49 corrected source inventory is accepted for exact source restoration. It preserves separate Example 1 and Example 2 identities and explicitly treats combined Examples 3 and 4. The 11-candidate graph count remains provisional pending combined-operation and explanation review. See `im1-lesson96-capabilities-review.md`.

- [x] Task Q37 Worked pending guard: Commit 116b0ac6d adds the immediate in-flight guard. The real browser sent one pending POST for two synchronous clicks. After accepted response loss, the visible retry used the same key and body. Exactly one acknowledgement persisted with no other learner effect. See precalc-runtime-worked-pending-guard-browser.md and 7838c6a7a.

Q37 actual browser confirms the committed acknowledgement replay fix. The first accepted response was aborted. Visible retry used the same key and body and succeeded with one submission and no mastery effects. The pending double-click defect remains separate. Parent inspection confirms the post-Independent state is exactly equal after lesson reload: five submissions, five evidence rows, four receipts, one card, and two reviews. See `precalc-runtime-unit7-browser-progress.md`. Requested assistance implementation is now in progress in a separate candidate.

G48 source and graph repair are committed as `f6eaf15c` and `df7883c69`. Final independent review accepts the corrected content and derived inventory. Parent verification passed 368 curriculum and seed tests, 37 coverage and audit tests, lint, build, and standalone TypeScript. See `im1-lesson95-graph-integration.md`. The completed graph candidate is under cleanup review.

The Worked in-flight guard is committed as `116b0ac6d`. Parent verification passed 73 tests and all app gates. Removed its completed candidate after both changed files matched committed bytes. Actual browser verification of the guard remains open.

G49 first source review found one native-data transcription error. The seventh monthly temperature is 86°F, not 88°F. The test repeated the same incorrect value. The candidate is under correction, with complete accessible-table checks required. Source restoration remains uncommitted.

- [x] Task G50: Review IM1 Lesson 9-7 from `Int1_0907_practice.docx`. Inventory all source prompts, native figures, exact prior reuse, stable source identities, and manual response boundaries before source or graph implementation.

G49 exact source restoration is committed as `67131a0b9`. Parent verification passed all 373 curriculum and seed tests, lint, build, and standalone TypeScript after the committed G48 graph overlay. The corrected ten-candidate graph proposal is accepted for draft implementation. It removes duplicate ordered-affine spread evidence and requires explicit Problem 30 and Problem 32 explanations. See `im1-lesson96-proposal-independent-review.md`.

Removed the completed G48 graph candidate after independent cleanup review and parent checks of all 17 committed patch paths. The archive had 16 modified existing files and one new test. All were preserved.

Assistance parent review requires two corrections before acceptance: prevent blank first submissions before the attempt freezes, and use an immediate ref to keep same-event callbacks from changing the frozen attempt. The author is adding these regressions within the four-path scope.

Q37 assistance is committed as `20c8dd821`. Independent review accepts the blank-answer validation and immediate freeze guard. Parent verification passed 105 tests, lint, build, and standalone TypeScript with all 21 candidate-local workspace packages. Actual assisted browser verification is in progress.

The Worked pending guard passed actual browser verification. Two synchronous clicks sent one pending POST. After server acceptance and response interruption, visible retry used the same key and body. The database retained exactly one acknowledgement and no other learner effects. See `precalc-runtime-worked-pending-guard-browser.md`.

Removed the completed G49 source archive. All 12 source patch paths match commit `67131a0b9`. Independent review found no unpreserved authored content. The G49 graph and local browser candidates remain active. All 24 saved dirty Codex worktrees remain intact.

G50 parent source review accepts all 38 prompts and eight native figures for exact restoration. First graph review requires corrected joint and marginal mappings and a bounded Problem 33 conversion contract. Exact source restoration is in progress in a fresh archive. See `im1-lesson97-parent-source-review.md`.

Removed the completed assistance archive after parent comparison of all tracked source files. All four owned paths match `20c8dd821`; all 22 older source states match `fbaf88a93`. See `precalc-runtime-assistance-cleanup-review.md`. The live browser candidate remains active.

G49 graph repair is committed as `334f17643`. Parent and independent review accept all ten draft capabilities, exact source identities, nonzero multiplier limits, reuse stages, and derived counts. Parent 377 curriculum/seed tests, 37 audit tests, and app gates pass. The completed candidate is under cleanup review.

G50 corrected 17-capability proposal and exact source restoration passed independent review. Parent source checks passed all native prompts and tables. The parent is running app gates after overlaying all 20 committed G49 files into the source candidate.

Q37 actual assistance browser verification passed. Guided retry preserved its key, body, and counters without mastery effects. Correct assisted Independent scored 3/3 and created one Hard review. Parent inspection confirms three submissions, three evidence rows, two receipts, one card, and one review. See `precalc-runtime-assistance-browser.md`.

- [x] Task Q37 teacher date rendering: Commit cd6c8ba5d uses a fixed en-US locale, UTC timezone, and explicit UTC label without changing the stored timestamp or query. The Asia/Shanghai browser proof found no hydration error or overlay. The real teacher form remained usable and created only the expected teacher-led evidence. See precalc-runtime-teacher-date-browser-proof.md and 7838c6a7a.

G50 exact source restoration is committed as `9b3a7c1bd`. Parent 382 curriculum/seed tests and all app gates pass after committed G49 graph integration. Independent review accepts the source and corrected 17-capability proposal. The completed source archive will be refreshed from HEAD and reused for the bounded G50 graph implementation.

Removed the completed G49 graph archive after independent cleanup review and parent comparison of all 18 committed patch files. All authored content is preserved in `334f17643`.

- [x] Task G50 graph: Implement the accepted 17-capability Lesson 9-7 proposal from the restored source. Preserve exact prior table-construction reuse, observed response stages, stable source identities, and Problem 33 ambiguity. Do not add lesson-order prerequisites or executable placeholders. Derive all graph counts from the corrected records.

The bounded 54d1 review classified seven IM3 graph files as superseded by the accepted current repair. Their only valid unique source addition is already preserved in main. Do not integrate these stale rows. The remaining dirty files are outside this review, so retain the saved worktree. See `saved-54d1-im3-reconciliation-review.md`.

Teacher date rendering is committed as `cd6c8ba5d`. Parent 17 related tests, lint, build, and standalone TypeScript pass. Independent review accepts the cross-timezone hydration test. Removed the completed candidate and two helper archives after committed-byte checks and cleanup review. The live browser environment remains active for normal-timezone and remaining full-flow checks.

Q37 teacher date rendering passed the actual Asia/Shanghai browser check with no hydration error or development overlay. The real confirmation form remained usable and created one teacher-led evidence row without receipts or SRS effects. The parent inspected the screenshot and persisted state. Stale-source submission rejection and both-dashboard reload checks remain in progress.

- [x] Task G51: Review IM1 Lesson 10-1 from Int1_1001_practice.docx. Inventory all source prompts, axioms, diagrams, valid logical conclusions, synthetic and analytic distinctions, exact prior reuse, stable source identities, and manual response boundaries. Check the current lesson's price-to-category converse inference against the actual source axioms before source or graph changes.

Removed saved worktree 54d1 after the complete 360-path preservation audit, independent semantic review, parent byte checks, ignored-file check, and commit-ancestry check. Current files or reachable Git history preserve 346 paths. The remaining paths were reviewed deletions, rejected stale states, or a generated source image. The other 23 saved worktrees remain intact. See `saved-54d1-full-preservation-review.md`.

Q37 row 8 failed at the server boundary. A browser request inserted Guided practice while the current source was stale. The source was restored after the test. Row 9 preserved stored identities across reload, but the lesson did not restore physical practice results and the student dashboard still showed a placeholder. These are open runtime requirements, not a completed browser flow.

- [x] Task Q37 new-submission readiness: Reuse getTopic11LearnerDeliveryStateHandler before a new Guided or Independent insert. Require ready_for_practice. Preserve the accepted replay branch. Return a safe practice-unavailable response from the existing route. Test no acknowledgement, no teacher confirmation, stale source, a valid new attempt, and historical accepted replay. See `precalc-runtime-stale-writer-fix-plan.md`.
- [x] Task Q38 saved practice views: Restore the selected physical practice result on lesson reload and replace the student dashboard placeholder with the relevant persisted learner view. Trace the existing queries, receipts, and UI before implementation. Preserve ordinary responses, source gating, and accepted attempt identities. Do not infer physical completion from submission count alone.
- [x] Task G52 projected prerequisites: Inspect and remove stale SRS prerequisite entries whose canonical edges were removed in earlier repairs. Parent inspection found 14 existing residues in HEAD. G50 separately removes the Lesson 9-7 to Lesson 10-1 residue. Keep one writer per projection file. Add a relationship consistency regression and preserve valid prerequisites.

Q38 parent investigation confirms that the saved physical result is absent from server page data and exists only in client state. Existing indexed submissions and receipts can supply the missing read. The bounded proposal preserves explicit retry and separates historical results from new-attempt and lesson-completion state. See `precalc-saved-practice-views-investigation.md`.

G51 parent source review inspected all 23 prompts and 17 native figures. Exact source restoration is accepted to proceed. The corrected six-capability proposal remains provisional. Preserve average-time, combined-route, curved-line, and complete-premise boundaries. See `im1-lesson101-parent-source-review.md`.

G50 graph repair is committed as `2bfeb9796`. Parent 387 curriculum and seed tests, 37 audit tests, and all app gates pass. Independent review accepts the final source bindings and removal of edge 1277 from both projections. All 13 candidate paths match the commit. The archive is refreshed from HEAD for G52 reuse.

G52 independent review confirms 14 stale projected sequence pairs. The valid median-to-five-number-summary relationship remains separate. Repair both projections and normalize its canonical prerequisite type to the existing contract. Do not add a second prerequisite authority. See `im1-projected-prerequisites-independent-review.md`.

Q37 new-submission readiness is committed as `91bfd0320`. Parent and independent 148 tests and all app gates pass. The local browser retest is in progress. The completed candidate is under review for Q38 reuse.

G51 independent review removed duplicate game-role evidence. Parent accepts five new draft capabilities plus the two exact existing skill reuses. Problem 21 records one failing-diagram selection and justification. Problem 22 records all three conclusion judgments. Exact source restoration is in progress in one fresh candidate.

Q38 independent review accepts the bounded indexed read and saved-result UI proposal. Reuse stored submissions and validated receipts. Keep reload read-only and missing-receipt retry explicit. See `precalc-saved-practice-views-independent-review.md`.

G52 is committed as `c808c365f`. Both projections now equal the 66 direct canonical prerequisite pairs. Parent 389 curriculum and seed tests and all app gates pass. The completed graph archive is under cleanup review.

Removed saved worktree 32fb after its complete preservation review and parent semantic, inventory, ignored-file, and ancestry checks. The other 22 saved worktrees remain intact. See `saved-32fb-full-preservation-review.md`. Removed the completed Q37 readiness archive after all five changed files matched `91bfd0320` and independent review found no unique authored content. Q38 uses a fresh current-HEAD archive.

Q37 row 8 now passes after `91bfd0320`. Actual stale-source browser requests reject new Guided and Independent attempts with safe HTTP 409. Historical accepted retries return their original IDs with HTTP 200. Parent complete-row comparisons are unchanged in both tests. See `precalc-readiness-writer-browser-verification.md`.

- [x] Task Q39 lesson math layout: Investigate the actual 1280-pixel lesson viewport with a 6641-pixel document and 6400-pixel SVG. Identify the responsible math output and CSS before implementation. Do not hide all overflow without fixing its cause. Keep this full-page defect separate from accepted readiness behavior.

G51 exact source restoration is committed as `8bca01b6f`. Parent 393 curriculum and seed tests and all app gates pass. Final independent review accepts the corrected source and accessible coordinates. All 19 source paths match the commit. The candidate is refreshed from HEAD for graph reuse.

- [x] Task G51 graph: Implement the accepted five-atom Lesson 10-1 draft scope. Reuse existing axiom-role and geometry-method skills only for exact observed responses. Preserve source identities, all premise and manual-review boundaries, and the existing approval states. Remove empty executable placeholders where present. Derive current graph counts.

Q39 reuses the completed G50/G52 archive after its committed-file checks and a fresh HEAD overlay. The one-file repair imports the existing KaTeX stylesheet in the root layout. Independent review accepts the repair. The parent is completing browser and app verification.

Q39 is committed as `1fe8529a4`. The actual stale-source browser layout now fits the 1280-pixel viewport. Parent lint, build, and post-build TypeScript pass. The square-root expression is visually correct. Removed the completed G50/G52/Q39 archive after complete tracked-file and extra-file checks. See `precalc-lesson-layout-candidate-cleanup.md`.

Removed saved worktree 2711 after independent semantic review and parent checks of all 360 paths. Main preserves 219 exact states, and retained sibling 18ee preserves 127 exact states. Four deletions and ten unique obsolete or reproducible paths were reviewed. The other 21 saved worktrees remain intact. See `saved-2711-full-preservation-review.md`.

Q38 first implementation is rejected. Parent review found hidden historical work, shared saved-retry/new-attempt identity state, unlabeled dashboard results, and source-string-only query tests. Corrections require executed handler and user-action regressions. See `precalc-saved-practice-views-parent-first-review.md`.

Removed saved worktree dd99 after independent semantic review and parent comparison of all 360 paths. Main preserves 219 exact states; retained sibling 02d6 preserves 128 exact states. The other 20 saved worktrees remain intact. See `saved-dd99-full-preservation-review.md`.

Removed the completed parent native-image directories for G49 and G50. All 18 image files match their committed public source assets. No authored content was removed. G51 native figures remain available while its graph review is active.

Removed ten completed verification/base helpers and one G51 media extraction directory after full baseline and owned-file comparisons. The active G51 graph, Q38 saved-view, and live browser candidates remain intact. See `completed-verification-helper-cleanup-review.md`.

G51 graph is committed as `2ee8bcc1a`. The format repair is committed as `3e1d0097a`. The repair preserves all record values and nested order. Parent 397 tests and independent 31 tests pass. See `im1-lesson101-format-independent-review.md`. The completed archive is under final cleanup review.

Q38 final review found a saved-result state defect. A new saved submission could retain the previous submission's delivery state. The bounded correction keys the existing saved-result component by submission identity. Add an actual rerender regression and invalid creation/update timestamp query cases before final integration.

Removed the completed G51 source/graph archive and its 17-image native extraction directory. Every authored byte is committed. See `im1-lesson101-final-cleanup-review.md`. The 20 saved Codex worktrees remain intact.

Q38 saved-result implementation is committed as `ffca7ea29`. Final independent review accepts all eight paths. Parent 114 tests, lint, build, post-build TypeScript, and 21 workspace resolutions pass. Actual saved-result browser verification is in progress. See `precalc-saved-practice-views-integration.md`.

- [x] Task Q40 Precalculus brand symbol: Correct the literal Unicode escape visible in the actual header and footer. Reuse the existing integral-symbol prop. Verify both rendered symbols and the browser result. Keep this separate from Q38 saved-result acceptance.

Removed saved worktree 0485 after full state and semantic review. Retained 02d6 preserves 355 of its 356 states. The sole unique aggregate is superseded. Branch `codex/preserve-0485-im3-lesson17` preserves four committed Lesson 1.7 changes that were not in main history. The other 19 saved worktrees remain intact. See `saved-0485-full-preservation-review.md`.

Removed the completed Q38 applied verification archive after exact committed-file checks and parent browser success. Reused the author archive for Q40 after preservation checks and a fresh HEAD overlay. See `precalc-saved-practice-views-cleanup-review.md`.

- [x] Task G53: Review IM1 Lesson 10-2 from `Int1_1002_practice.docx`. Inventory every source prompt and diagram. Identify exact assessable responses, existing stable source identities, valid skill reuse, manual-review boundaries, and evidence for prerequisite claims. Do not use lesson order as a prerequisite. Produce a bounded proposal before source or graph edits.

Q38 browser verification is accepted. Lesson and dashboard reads preserve all learner records with zero POSTs. Saved receipt retry preserves attempt identity; new attempt 3 uses a new identity. Independent review accepts the full evidence. See `precalc-saved-practice-views-browser-verification.md`. The full Q37 matrix review remains in progress.

Q40 is committed as `e8770f29b`. Parent and independent render tests and all app gates pass. Actual browser checks show the integral symbol in header and footer. Unit 7 independent review closes all nine required browser rows for the selected Topic 1.1 flow. Evidence preservation and live-environment cleanup are in progress. See `precalc-unit7-final-matrix-independent-review.md`.

Preserved the 20 remaining accepted Unit 7 browser method and visual files. Parent checks found no local credential, session token, or admin key in the selected text files. The owned backend and frontend are stopped. Ports 43160, 43161, and 43162 have no listener. Full archive cleanup review remains in progress.

Removed the completed Q38/Q40 author archive after full independent tree review, exact committed-byte checks, and actual browser acceptance. See `precalc-brand-symbol-cleanup-review.md`. The stopped Unit 7 environment is under final tree review before deletion.

Q37 Unit 7 is complete for the selected Topic 1.1 flow. All nine required rows passed independent review. Accepted runtime fixes and useful evidence are committed. The parent removed the stopped local archive, database, credentials, and generated output after full review. Ports 43160, 43161, and 43162 are clear. See `precalc-unit7-final-cleanup-review.md`. The 19 saved worktrees remain intact.

- [x] Task G53 source: Restore all 50 original Lesson 10-2 prompts and all 14 native figures in the extensionless lesson source. Preserve the five existing Example groups and Mixed Exercises. Add exact source regressions. Do not add answers, extra response requirements, source approval, or graph changes. The corrected source inventory is in final independent review.

G53 corrected inventory is accepted. It preserves 50 prompts, five existing Example identities, and 14 native figures. It proposes one inactive maximum-count atom with separate line and plane evidence variants. No new prerequisite is accepted. Problem 49 remains task-local manual evidence. Exact source restoration is in progress in one isolated candidate. See `im1-lesson102-inventory-independent-review.md`.

Removed saved worktree 4e21 after parent and independent checks of all 355 states. All states are preserved in main, 02d6, or 18ee. Branch `codex/preserve-saved-4e21-im3-lesson11` preserves its two detached commits. The other 18 saved worktrees remain intact. See `saved-4e21-full-preservation-review.md`.

G53 graph preparation found draft standard placeholders in the existing alignment fields. Review the exact standard scope for the two Lesson 10-2 skills and the reused Lesson 12-4 postulate skill before graph implementation. Do not copy those alignments to the new maximum-count atom without evidence. This review does not change the source-restoration scope.

Removed saved worktrees 4f74 and 54ed after full parent and independent review of 712 states. The superseded source candidates need no integration. Branch `codex/preserve-saved-54ed-im3-projection-repair` preserves two detached commits. The other 16 saved worktrees remain intact. See `saved-4f74-54ed-preservation-review.md`.

G53 source review corrected the triangular-prism interpretation. Problems 25-27 use five face planes, two planes through F and E, and valid four-point face sets. These review answers stay outside the restored worksheet. The final source candidate must improve Figures 8-10 accessible descriptions. The later graph stage will remove eight unsupported transformation-standard alignments and clear three blueprint alignment arrays. Preserve unrelated alignments and standard nodes. See `im1-lesson102-source-first-review.md` and `im1-lesson102-standards-alignment-review.md`.

G53 source is committed as `63886deda`. Final independent review passed. Parent checks passed 68 test files and 400 tests, lint, build, and post-build standalone TypeScript. All 14 image files match the worksheet bytes. See `im1-lesson102-source-final-review.md`.

- [x] Task G53 graph: Reuse the two Lesson 10-2 skills and the Lesson 12-4 postulate skill for exact source tasks. Add one inactive maximum-count atom with separate evidence variants. Remove eight unsupported standard alignments and empty activity placeholders for the touched skills. Update affected projections. Preserve stable identities, approval states, row order, and unrelated fields. Add no prerequisite or executable practice claim.

Removed saved worktrees 61c4 and 6457 after independent and parent review of all 719 states. Branch `codex/preserve-saved-61c4-im3-lesson18` preserves two accepted detached commits. Their Lesson 1.8 source remains pending integration review against committed HEAD. The other 14 saved worktrees remain intact. See `saved-61c4-6457-preservation-review.md`.

- [x] Task G54 inventory: Review IM1 Lesson 10-3 from committed `Int1_1003_practice.docx`. Inventory all original prompts and native figures. Compare exact graph identities and assessable responses. Propose bounded source and graph corrections. This task does not authorize graph changes before review.

Cleanup review started for saved worktrees 2968 and 64b9. Parent comparison found 720 working states. The Lesson 1.5 reconciliation in 2968 has two blueprint records preserved in the main working tree but absent from committed HEAD. Worktree 64b9 has an older executable Example candidate. Keep both directories until independent semantic review and detached-history preservation are complete.

Lesson 1.8 recovery proposal passed direct PDF review of all seven examples and their mathematical results. The saved accepted source is useful. Integrate object-level changes against committed HEAD after a separate source review. Do not copy old aggregate files. No executable practice is supported by these inactive blueprints. See `im3-lesson18-detached-integration-proposal.md`.

- [x] Task IM3-L18 recovery: Integrate the verified seven Lesson 1.8 source records and two inactive blueprints from preserved commit `0b5392a36`. Synchronize only the affected existing catalogs. Preserve later records and all approval states. Add source and projection regressions. Keep unsupported runtime modes unavailable.

Removed saved worktrees 2968 and 64b9 after independent and parent review of 720 states. Preservation branches retain their three detached commits. Twelve saved worktrees remain. Lesson 1.5 recovery remains open. See `saved-2968-64b9-preservation-review.md`.

IM3 Lesson 1.8 projection review corrected the recovery scope to 12 paths. Add two inactive SRS inventory rows, the missing teacher skill rows, and seven source attempt-artifact rows. Add no activities. The new app-discovered source test failed three cases before source repair and then passed all three. Further parity tests and projection repair are in progress. See `im3-lesson18-recovery-independent-scope.md`.

G54 inventory passed final independent review. Preserve 51 prompts, 23 native figures, the shared Examples 1-2 source group, and append-only Example 5 identity. Five new draft capabilities are proposed. Problems 1 and 4 remain task-local supplied-measure reading. No source or graph edit is included in this acceptance. See `im1-lesson103-inventory-proposal.md` and `im1-lesson103-inventory-final-review.md`.

G53 first graph review found four bounded defects: missing prompt-level reused-skill references, a vacuous prerequisite test, an incorrect teacher prerequisite status, and 15 unrelated embedded SRS rewrites. The corrected candidate now passes parent verification: 69 test files, 406 tests, lint, build, and post-build standalone TypeScript. Final independent review is pending. The 15 older embedded-versus-standalone rendererKey differences remain separate technical debt. See `im1-lesson102-graph-first-review.md`.

G53 graph is committed as `123c142b5`. All 13 staged paths matched the reviewed candidate. Final independent review and parent checks passed. The source and graph repairs for Lesson 10-2 are complete. These inactive records do not establish executable practice coverage. See `im1-lesson102-graph-final-review.md`.

- [x] Task G54 source: Restore the 51 original Lesson 10-3 prompts and all 23 native figures from the accepted inventory. Preserve the combined Examples 1-2 heading and all other source boundaries. Add an app-discovered source regression. Reuse the completed G53 candidate directory. Add no graph change, answer key, source approval, or executable practice.

Removed saved worktrees 68f8 and 74da after independent and parent review of 715 states. Branch `codex/preserve-saved-68f8-im3-lesson12` preserves two detached commits. Ten saved worktrees remain. Lesson 1.2 recovery remains open. See `saved-68f8-74da-preservation-review.md`.

IM3 Lesson 1.8 recovery is committed as `efbbdb2ed`. All 13 staged paths matched the accepted candidate. Parent lint, build, and post-build TypeScript passed. Independent reconciliation/projection tests passed 32 cases. Provenance tests passed nine cases. The full curriculum/seed run had 850 passing cases and nine failures reproduced unchanged on the committed baseline. The remaining baseline pilot eligibility failure has a separate correction task. See `im3-lesson18-recovery-final-review.md`.

- [x] Task IM3-P1 eligibility: Correct the obsolete universal Independent SRS-eligibility test. Synchronize the three affected pilot activities in the module and course stored projections with the current approval gate. Preserve node and blueprint review states, all other activity fields, unrelated rows, and order. Review each derived field before changing artifacts. Reuse the completed Lesson 1.8 candidate.

G54 parent native-image review withdraws the P1/P4 direct-reading classification. The brackets span PS and HK, respectively. Both tasks require segment subtraction. Source descriptions, inventory results, and approved-skill mappings are being corrected before source commit. All other native bracket spans are under final review. See `im1-lesson103-parent-bracket-review.md`.

G54 source is committed as `84bfbef58`. Final review accepted the corrected bracket interpretation and the native segment overlines in Problems 37 and 46. All 25 staged paths matched the reviewed candidate after removal of one extra EOF blank line. Parent checks passed 70 files and 410 tests, lint, build, and post-build TypeScript. The corrected inventory restores approved segment-addition reuse for Problems 1 and 4. See `im1-lesson103-source-final-review.md`.

IM3-P1 eligibility is committed as `9d1afd4de`. Six stored booleans now match the approval gate. All 54 legacy pilot tests pass. Independent review and 26 shared projection tests pass. Parent lint, build, and post-build TypeScript pass. The nine unrelated curriculum baseline failures remain open. See `im3-pilot-eligibility-final-review.md`.

- [x] Task G54 graph: Implement the corrected Lesson 10-3 inventory after source commit. Preserve existing source IDs and the shared Examples 1-2 group. Add the reviewed Example 5 identity and five draft inactive capabilities. Use exact approved and draft capability reuse only at the accepted response stages. Remove unsupported edge 1193. Leave edge 1194 unresolved for Lesson 10-4 review. Review standard links before changes. Preserve unrelated graph state and add no executable practice or approval claim.

G54 standards review confirms twelve unsupported transformation or coordinate-proof alignments across four Example nodes and both existing skills. Remove these edges and clear two blueprint alignment arrays. Preserve identities and unrelated fields. See `im1-lesson103-standards-alignment-review.md`.

Removed the completed G53 native extraction after all 14 files matched committed public images. Removed the eight reproducible Lesson 1.8 PDF review derivatives after source integration and final review. The original PDF and all accepted source details remain committed. Two current candidate directories remain in use. Saved worktrees 8111 and 8d87 remain intact because committed HEAD does not yet preserve all useful source states.

Removed saved worktree 8d87 after full preservation review of 361 states. Its seven blueprint objects have exact retained copies. Branch `codex/preserve-saved-8d87-im3-lesson14` preserves both detached recovery commits. Nine saved worktrees remain. Keep 8111 because its 14 useful dirty paths are not fully committed. See `saved-8111-8d87-preservation-review.md`.

- [x] Task IM3-L16 contract review: Review the complete Lesson 1.6 source group and trace the quadratic-formula generator, renderer, attempt, grading, receipt, and exact-node evidence flow. Define the minimum usable Worked, Guided, and Independent implementation. Preserve saved worktree 8111. Do not enable draft nodes or infer practice readiness from fixed source solutions. See `im3-lesson16-saved-recovery-proposal.md`.

- [x] Task IM3-QF generator: Correct distinct symbolic-root values and complete Worked solution results in the existing quadratic-formula generator. Write mathematical regressions before repair. Verify both real and imaginary residuals, root count, both final results, negative-coefficient notation, deterministic seeds, and adapter answer fields. Correct obsolete tests that require duplicate combined answers. Keep runtime grading equivalence and mode integration under the Lesson 1.6 contract task.

Parent review found that the current generator puts the same combined ± expression in both symbolic-root entries. Its final Worked step displays only the first integer root. Existing tests require the duplicate symbolic format and do not test the complete solution set. The test-only complex parser also omits the square root in the imaginary part. These defects prevent reliable quadratic-formula practice.

- [x] Task 8111 preservation: Preserve the 14 unique dirty paths in a separate Git recovery branch. Verify exact file bytes and modes. Preserve the earlier detached Lesson 1.6 history. Obtain independent review of all 365 states before directory removal. The recovery snapshot does not approve or integrate the saved runtime.

Saved worktree 8111 is removed after full parent and independent review of 365 states. Its 14 unique paths are preserved in recovery commit `3eef7ee59`. The earlier Lesson 1.6 history is preserved at `571b1c9a3`. Eight saved worktrees remain. Source and runtime recovery work will use these references. See `saved-8111-final-cleanup-review.md`.

IM3-QF generator repair is committed as `6e56fa80f`. All three staged paths matched the reviewed candidate. Independent focused tests passed 130 cases. Parent package lint, build, and separate TypeScript passed. IM3 app gates passed. Two unrelated IM1 derived-data failures remain in the full package run. The generator now returns complete distinct root sets and complete Worked results. This does not establish runtime practice readiness. See `im3-quadratic-formula-generator-report.md` and `im3-quadratic-formula-generator-independent-review.md`.

Lesson 1.6 runtime review is complete. The current solver submits step-index answers that do not match generator root fields. It exposes solution steps to the browser. The generic writer cannot establish server-owned exact-node evidence for this activity. The full required outcome remains usable approved-node practice and exact-node evidence. Draft verification is an interim stage. See `im3-lesson16-runtime-proposal.md`.

- [x] Task IM3-QF response contract: Find and reuse existing expression parsing, root equivalence, protected attempt, grading, and receipt contracts. Define one public answer contract for all supported quadratic root regimes. Preserve unordered root equivalence and strict invalid-input rejection. Do not add a separate permanent pilot or new registry.

- [x] Task G55 inventory: Review IM1 Lesson 10-4 from its committed worksheet. Inventory all prompts and native figures. Identify exact assessable responses, stable source identities, and supported prerequisite dispositions, including unresolved edge 1194. Propose bounded source and graph corrections before implementation.

G54 graph is committed as `2d8bf1df6`. Parent and final independent review passed. All 16 staged paths matched the accepted candidate. Parent tests passed 71 files and 415 cases, followed by lint, build, and post-build TypeScript. The missing Example 5 link was corrected before acceptance. Lesson 10-3 source and graph repairs are complete. Executable practice remains separate work. See `im1-lesson103-graph-final-review.md`.

Removed the completed G54 native extraction after all 23 image files matched committed public images exactly. The worksheet, accessible source, and graph review remain committed. The IM1 and IM3 candidate directories remain in use for the next authorized tasks.

The public quadratic-formula response uses the fixed fields `discriminant`, `x1`, and `x2`. Do not expose canonical root count. A one-field repeated-root variant would reveal that the discriminant is zero. The learner enters each distinct root once and can leave the second field blank. The server validates that blank. A repeated-root second slot has zero score weight.

- [x] Task IM3-QF exact grader: Implement the required restricted exact-root parser and unordered root grader in the IM3 app. Reuse the repaired generator output as server authority. Accept equivalent supported fractions and radicals. Reject malformed or unsupported forms. Keep all public response fields fixed. This pure grader is the next part of the existing server-owned submission integration. It does not activate a route or approve content.

- [x] Task IM3-QF component: Add one shared activity using existing MathInputField and practice.v1 contracts. Show source steps only in Worked mode. Guided and Independent public props must exclude solutions and canonical root count. Use fixed answer fields, per-field assistance telemetry, accessible native form controls, and an exact frozen retry envelope. Register the component in the existing IM3 registry. Do not activate draft content. See `im3-quadratic-formula-component-reuse.md`.

G55 parent source review accepts 54 prompts and 15 native images for restoration. It corrected the baseball extension and symbolic figure description. Mixed Exercises use the existing lesson identity. The proposed seven-atom graph inventory remains provisional pending equivalence review. See `im1-lesson104-parent-source-review.md`.

- [x] Task G55 source: Restore all 54 original Lesson 10-4 prompts and 15 native figures in the extensionless lesson file. Preserve headings, exact response demands, native notation, and figure semantics. Add app-discovered source regressions. Reuse the current IM1 candidate. Add no graph change, answer key, approval, or executable mode.

IM3-QF component integration also requires a bounded ActivityRenderer correction. The current renderer discards the asynchronous submission result and recomputes timing on each retry. Forward the promise and preserve the first timing-enriched QF envelope. Prevent activity props from replacing the trusted QF mode, identity, and callbacks. Test deferred rejection and exact retry through the real renderer before acceptance.

Cleanup review found 718 working states across saved worktrees b5f1 and b615. Worktree b5f1 has 11 files without exact copies in main, 02d6, or 18ee. Worktree b615 has one mixed blueprint file; each of its seven objects has an exact preserved copy in its history or the retained sources. Keep both directories pending independent full-state review and any needed preservation.

G55 source is committed as `e207af2d1`. Parent and independent source review passed. All 17 staged paths matched the final candidate. Parent checks passed 419 tests, lint, build, and separate TypeScript. The graph atom inventory remains provisional. See `im1-lesson104-source-final-review.md`.

QF component first review found two defects in the real renderer: absent timing could become timing on retry, and a new activity ID could retain old answer state. Correct both before integration. Full shared-activity tests also found the directly affected six-key registry expectation and one unrelated legacy blank-answer schema expectation. See `im3-quadratic-formula-component-first-review.md`.

Parent direct probes reject the first frozen QF grader despite its passing 19-test suite. Global removal of multiplication signs gave false full credit to discriminant `1*6` and root `0*2`. The earlier independent acceptance is withdrawn. Correct token semantics and add adversarial regressions before integration. See `im3-quadratic-formula-grader-parent-first-review.md`.

Removed seven artificial reverse differences from the main working copy. Each owned file was clean before integration and still matched its pre-change committed bytes. Parent and independent review confirmed that no unique working content would be lost. All seven now match HEAD. Previously dirty and mixed files remain unchanged. See `owned-working-copy-cleanup-review.md`.

QF exact grader is committed as `39ce57af4`. The component and renderer correction are committed as `e0290726c`. All 20 staged paths matched the accepted candidate. Final grader tests passed 25 cases. Independent component checks passed 30 cases. Parent app lint, build, and separate post-build TypeScript passed. Seven new files and three previously clean files now match HEAD. Ten mixed working files remain intact.

Broader tests retain baseline failures. The shared activity suite passed 159 of 160 cases. Its missing-correctAnswer schema expectation also fails on unchanged HEAD. The app schema suite has the same baseline expectation failure. Three older renderer failures also reproduce on unchanged HEAD: comprehension submission, fill-blank label, and graphing placeholder text. These failures remain open. The focused QF tests pass. These commits do not establish server integration or student-flow readiness.

G55 capability review replaces the provisional seven-atom proposal with four draft inactive capabilities. Merge the inverse-distance response variants. Reuse the approved Distance Formula capability for Problems 52 and 54 at the stated response stages. Remove unsupported sequence edge 1194 without replacement. Preserve all source identities and approval states. See `im1-lesson104-capability-equivalence-review.md`.

- [x] Task G55 graph scope: Review existing Lesson 10-4 standard alignments and placeholder fields against the source. Update the graph proposal to the accepted four-atom inventory. Define exact bounded graph changes before authoring.

- [x] Task IM3-QF server integration scope: Trace the stored activity and protected attempt contracts after the grader and component commits. Define the minimum extension to the existing server-owned route, writer, grading, and receipt flow. Preserve fixed public fields and draft no-progression behavior. Reuse existing activity storage. Add no parallel pilot or evidence system.

- [x] Task b615 cleanup: Independently verify all saved states, modes, links, ignored files, history, and active processes. Confirm exact preservation of the mixed blueprint objects before directory removal. Keep b5f1 and all other saved worktrees during this review.

Removed saved worktree b615 after parent and independent review of all 356 states. Both preservation branches remain. Seven saved worktrees remain. See `saved-b615-final-cleanup-review.md`.

G55 final alignment scope remains under parent review. A proposed blanket removal of G-MG.A.1 requires a source-level check of the contextual distance and perimeter tasks. Do not treat an unverified alignment as demonstrably false. No G55 graph changes are authorized until that disposition is resolved.

G55 final graph scope is accepted after parent correction. Keep the Example 4 and contextual-distance skill G-MG.A.1 edges. Remove the other ten reviewed alignments. A yes/no segment-congruence answer does not show the algebraic proof required by G-GPE.B.4. Remove six exact placeholder activities and their empty specifications. Preserve approved source and skill identities. See `im1-lesson104-final-graph-scope.md` and `im1-lesson104-alignment-disposition.md`.

- [x] Task G55 graph: Implement the accepted four-atom inventory and exact approved response-stage reuse. Preserve two supported modeling alignments and remove ten unsupported alignments. Remove edge 1194 and six reviewed placeholder activities. Use real projectors with changes limited to affected rows. Preserve edge 1195, unrelated content, row order, and approval states. Reuse the current IM1 candidate. Add behavioral graph and projection regressions before implementation.

- [x] Task b5f1 preservation: Preserve the eleven unique saved Lesson 1.4 candidate files in a separate recovery commit. Compare exact bytes and modes. Verify all 362 states and final process status before directory removal. This snapshot does not integrate or approve the candidate.

Removed b5f1 after exact preservation of eleven unique files in recovery commit `e99a846fb` and parent plus independent review of all 362 states. Six saved worktrees remain. See `saved-b5f1-final-cleanup-review.md`.

QF server scope is accepted with parent corrections. Reuse private practice-variant metadata and the existing activity relation. Use Guided seed 1 and Independent seed 2 for the first draft records. Reject QF writes through both legacy client-graded submission paths. Keep the original request attempt number as telemetry; allocate the authoritative ordinal in the existing indexed field. No protected QF attempt exists before submission. See `im3-quadratic-formula-server-integration-scope.md`.

- [x] Task IM3-QF server integration: Implement the accepted five-file backend scope and behavioral tests in the current IM3 candidate. Regenerate private canonical answers, validate the complete stored relation, persist one server grade, and preserve exact retries. Reject alternate client-graded writes and all progression effects for these draft records. Keep source placement, Guided step checks, later attempt diversity, approval, and learner-flow verification open. Do not deploy or seed a live database.

- [x] Task IM3-QF phase submission: Preserve the asynchronous submission result through the existing PhaseRenderer. Do not supply a save callback when no parent handler exists. Verify pending, rejection, exact retry, and successful completion through the real quadratic activity. This corrects the rendering boundary without changing lesson placement or source approval.

The PhaseRenderer correction is implemented in the current IM3 candidate. Before repair, the two new tests reproduced false saved state and enabled submission without a handler. The corrected real phase/renderer/component chain passes all 17 selected tests. App lint passes. Independent review accepts the two-path change. Build and separate TypeScript remain before source integration. See `im3-quadratic-formula-phase-independent-review.md`.

PhaseRenderer repair is committed as `9a49744b8`. Both staged paths matched the accepted candidate. All 17 selected tests, app lint, build, and separate post-build TypeScript passed. The new test is materialized in main. The mixed PhaseRenderer working file remains intact. Backend integration remains open.

The first QF backend implementation passes build and TypeScript but fails parent acceptance. Replay omits accepted telemetry and does not normalize part order. Alternate submission guards miss the physical activity-to-variant link. Draft approval and stored-relation checks are incomplete. The author must add failing behavioral tests and correct these boundaries before integration. See `im3-quadratic-formula-server-first-review.md`.

G55 parent artifact review corrects one scope count. The standard-edge catalog contains all twelve reviewed Lesson 10-4 alignments, including source examples. Remove the same ten rows from both edge catalogs and retain the same two modeling rows. The earlier four-skill-row description was incomplete. Existing node order and unrelated node records remain intact in the candidate comparison.

Parent review rejects the second frozen QF backend batch. The actual Convex value serializer changes key order and makes an unchanged stored receipt retry fail. The memory-clone test missed this failure. Build and separate TypeScript pass, but replay remains incorrect. The author must use the existing serializer and add the real storage round-trip regression. See `im3-quadratic-formula-server-serialization-review.md`.

G55 full parent app tests pass 73 files and 425 cases. Independent semantic checks pass, but source integration remains held for unrelated Unicode serialization and coverage-row order changes. Restore the baseline representation before refreezing.

The backend independent review confirms the storage replay failure and identifies missing executed seed, public-consumer privacy, and zero-progression tests. It also finds inconsistent-content overwrite and ambiguous publication acceptance. These findings remain open. See `im3-quadratic-formula-server-independent-review.md`.

Removed the completed G55 native extraction after all 44 files matched the committed DOCX archive. All fifteen extracted images also matched the committed public assets. Removed two generated contact sheets. The original worksheet, restored lesson, and public figures remain committed.

- [x] Task b73d and bc11 cleanup review: Compare each saved working state with retained copies and Git history. Identify unique content, file modes, links, ignored files, and active use. Keep both directories until independent preservation review permits removal.

The corrected QF backend passes the real Convex serialization replay test, final build, and separate TypeScript. The focused suite has 42 passing cases. Parent review found that the new lesson and teacher privacy fixtures return empty results. Add relevant records and positive result assertions before acceptance. No backend source is committed yet.

The next cleanup comparison found 11 unique whole files in b73d and 12 in bc11. None has an exact whole-file copy in the eleven checked recovery branches. Keep both saved directories while independent review determines the required preservation snapshots.

G55 graph repair is committed as `cd3966d85`. Four new capabilities remain draft and source-only. Six placeholder activities are removed. The final fourteen staged files match the accepted candidate. App tests passed 425 cases. Lint, build, and separate TypeScript passed. The existing coverage order failure also reproduces on committed HEAD before G55. See `im1-lesson104-graph-final-review.md`.

- [x] Task b73d and bc11 preservation: Save the eleven unique b73d files and twelve unique bc11 files in separate recovery commits on their exact saved base. Verify bytes and modes. These snapshots preserve historical candidates without integrating or approving them. Keep both directories until independent final state review passes.

- [x] Task IM1 coverage order: Correct the demonstrated stored matrix order defect in one separate change. Use the existing coverage builder order. Preserve all 499 records and all aggregate values. Change only the stored coverage matrix and do not change the builder or test contract. The existing parity test fails on committed HEAD before this repair. Verify parity and audit tests after repair.

QF backend integration is committed as `91e71dd6d`. All nine staged files matched the accepted candidate. Parent and independent checks passed 42 tests. Lint, build, and separate TypeScript passed. Source placement, Guided step checks, varied later attempts, approval, and learner-flow verification remain open. See `im3-quadratic-formula-server-final-review.md`.

Removed b73d and bc11 after exact preservation and independent review. Recovery commits `9b8064d8d` and `1a0de0c90` preserve their 23 unique files. The other 701 states have retained copies. Four saved worktrees remain. See `saved-b73d-bc11-final-cleanup-review.md`.

- [x] Task bda5 and d243 cleanup review: Inspect the last two duplicate saved candidates before the retained reference worktrees. Compare every working state with retained copies and reachable history. Identify unique files, modes, links, ignored content, and active processes. Keep both directories until exact preservation and independent checks pass.

The IM1 stored coverage order defect is corrected in `02954d9d6`. All 499 record bodies and all aggregate values are unchanged. Parent and independent checks passed all 37 audit and coverage tests. Builder parity now passes. See `im1-coverage-order-final-review.md`.

- [x] Task IM3-QF learner integration scope: Trace the committed LessonRenderer submission flow and Lesson 1.6 source placements after the draft backend commit. Define the smallest source-based Worked, Guided, and Independent integration that uses the existing server receipt path. Identify required Guided step checks and later-attempt variation. Preserve draft approval and no-progression behavior. Reuse the current IM3 candidate. Do not add a pilot, storage system, or live seed.

- [x] Task completed IM1 candidate cleanup: Remove the completed G53 through G55 candidate after final process checks. All 8,576 regular tracked files have reachable Git copies. Independent review found no unique authored content or mode changes. The remaining dependency links and build output are disposable. Preserve the current IM3 candidate.

Removed the completed IM1 candidate after parent and independent content checks. All accepted source, graph, and coverage changes remain committed. See `im1-completed-candidate-cleanup-review.md`. The current IM3 candidate remains active.

- [x] Task bda5 and d243 preservation: Save ten unique bda5 files and eleven unique d243 files in separate recovery commits on their exact saved base. Preserve bytes and modes. The older graph proposals remain unreviewed. Remove the directories only after independent snapshot checks and final process checks.

Removed bda5 and d243 after parent and independent preservation checks. Recovery commits `e1f0b8b87` and `727d2bf22` preserve their 21 unique files. Only two saved worktrees remain: `02d6` and `18ee`. They retain shared working states and require separate review. See `saved-bda5-d243-final-cleanup-review.md`.

The learner integration scope is accepted with a two-path source Worked batch first. The current seed publishes its lesson version and skips existing phases. Keep draft generated modes outside that published lesson. Strict receipt wiring, Guided checks, and immutable later attempts remain separate required contracts. See `im3-quadratic-formula-learner-integration-scope.md`.

- [x] Task IM3-QF source Worked seed: Replace the invented quadratic-solving Worked content in phases 4 through 6 with exact source examples .036 through .038. Use inline text and remove the broken solver activity sections. Preserve all other phases and the two separate draft generated records. Change only the seed and its test. This repairs new seeds only; existing deployed lesson versions require later reviewed migration. Do not deploy or run a live seed.

- [x] Task retained reference cleanup review: Review saved worktrees 02d6 and 18ee against main and reachable Git history. Do not use one retained worktree as the only preservation proof for deleting the other. Identify each unique byte and mode state, links, ignored content, and active use. Keep both directories until exact independent preservation checks pass.

- [x] Task retained reference preservation: Save the four unique 02d6 files and twelve unique 18ee files on their respective saved bases. Preserve the deleted Precalculus route test in each historical snapshot. Verify all path, byte, mode, and deletion states independently. Do not remove either directory until its other states have preservation outside both directories.

The source Worked seed repair is committed as `6b6f07375`. Exact examples .036 through .038 replace the invented phase 4 through 6 content. Both staged files match the accepted candidate. Parent and independent seed tests passed all 12 cases. Lint, build, and separate TypeScript passed. Existing deployed versions, exact graph source restoration, Guided checks, receipt placement, and later-attempt variation remain open.

The final reference cleanup found 130 additional contents preserved only in Codex snapshot references. Two durable branches now retain the required existing snapshots: `codex/preserve-shared-reference-files` at `67522b0d0` and `codex/preserve-im3-lesson13-page24` at `1c5696482`. No source content was copied. Final directory removal still requires independent verification and a final state check.

Removed the last saved worktrees, 02d6 and 18ee, after final verification of all 711 states. Recovery commits `99b3c2e74` and `d70c797d6` preserve sixteen unique files and two deletion states. Two additional durable branches preserve shared snapshot content. The 02d6 recovery branch retains its detached two-commit history. Only the main checkout remains registered. The active IM3 candidate remains. See `saved-02d6-18ee-final-cleanup-review.md`.

- [x] Task IM3-L16 source catalog restoration: Restore exact source records .036 through .038 from the reviewed native PDF pages 43 and 44 in the five existing node catalogs. Preserve stable IDs, draft status, unrelated metadata, row order, and serialization. Add one app-discovered source regression. Change no blueprint, edge relation, projection, readiness, or approval. Reuse the active IM3 candidate.

- [x] Task IM3-QF strict lesson receipt scope: Inspect the real LessonRenderer section and submission contracts. Define the minimum routing change and behavioral tests for QF draft fixtures through the existing server-owned receipt path. Preserve exact retry and no-progression behavior. Do not place draft activities in the published lesson or add a route or storage system.

- [x] Task IM3-QF strict lesson receipts: Implement the accepted four-path renderer and test scope. Resolve trusted active-section identity and mode. Preserve timestamp, body, and retry key. Reject mismatched IDs and incomplete QF metadata before writes. Complete QF and directly affected generic submissions only after a positive receipt. Reuse the existing server-owned helper and keep draft activities outside published lessons. See `im3-quadratic-formula-strict-lesson-receipt-scope.md`.

Source catalog restoration is committed as `508b59c40`. All six staged files match the accepted candidate. Parent and independent checks passed seven source tests. App lint, build, and separate TypeScript passed. All fifteen restored records remain draft. See `im3-lesson16-source-catalog-final-review.md`.

Parent review rejects the first strict receipt batch. It preserves a retry key but rebuilds the request body. It lacks an in-flight request guard and a nonempty receipt ID check. Required behavioral tests are incomplete. The author must correct these defects before integration.

- [x] Task IM3-L16 remaining Worked sources: Restore .039 and .040 from native PDF page 46 in five existing catalogs and extend the existing source test. Preserve .036 through .038, draft status, identities, ordering, and unrelated data. Keep the five printed Checks as review notes until a separate source representation decision. See `im3-lesson16-remaining-source-scope.md`.

Strict lesson receipts are committed as `3293568f5`. All four staged paths match the accepted candidate. Parent and independent tests passed all 34 cases. The nested mutation test fails without the deep copy. Lint, build, and separate TypeScript passed. Exact QF requests use the strict writer and retain one body and key across failures. Strict and generic completion require a valid receipt. Draft placement, Guided step checks, later-attempt variation, and learner approval remain open. See `im3-quadratic-formula-strict-lesson-receipt-final-review.md`.

- [x] Task IM3-QF Guided check scope: Trace the existing private QF grading authority, authenticated internal-query route patterns, and component callbacks. Define the smallest implementation for a discriminant check that returns only correctness and does not insert submissions or apply progression. Reuse existing relation validation and exact answer comparison.

Remaining discriminant sources are implemented in `5dce1bd3c`. Parent tests passed seven cases. Lint, build, and separate TypeScript passed. All unrelated catalog bytes are unchanged. Final independent acceptance remains open because the reviewer stopped at the account usage limit. Keep the task in progress. See `im3-lesson16-discriminant-source-implementation-review.md`.

The parent completed Guided check source tracing after the assigned subagent stopped at the same usage limit. The seven-production-path proposal reuses existing authority and parser code. It covers Guided gating and stale responses. Independent scope review remains open. See `im3-quadratic-formula-guided-check-scope.md`.

- [x] Task IM3-QF Guided check backend: Implement the server authority and authenticated route from the Guided check scope first. Change server-grading.ts, convex/activities.ts, the new check route, and focused tests. Reuse the existing final-writer relation checks and exact parser. Keep the component callback and learner gating as the next required part. No live seed or deployment.

Independent review now accepts source commit `5dce1bd3c`. The reviewer checked native page 46, exact source text, references, draft state, order, and all unchanged records. The app-discovered source test passes. Independent review also accepts the Guided check scope. The backend implementation has 111 passing focused and regression tests plus lint, build, and separate TypeScript; final backend review is active.

- [x] Task IM3-QF Guided check client: Implement the remaining component callback, exact Guided selection wiring, HTTP helper, and behavioral tests from the accepted Guided check scope. Keep root fields and final submission unavailable until the current discriminant receives a correct server check. Reject stale responses after edits or activity changes. Preserve Worked, Independent, and strict final receipt behavior. No draft publication.

Guided check backend is committed as `02f1f36b1`. All five staged files match the accepted candidate. Parent tests passed 111 cases. Independent tests passed 48 cases. Lint, build, and separate TypeScript passed. The route returns only correctness and the query is read-only. Component gating remains active. See `im3-quadratic-formula-guided-backend-final-review.md`.

- [x] Task IM3-L16 discriminant Worked seed: Replace invented phase 8 and 9 examples with exact .039 and .040 from native page 46. Keep each Worked phase text-only and remove its broken discriminant-analyzer activity section. Change only seed_lesson_1_6.ts and its existing seed test. Preserve all other phases, draft generated activities, and existing version behavior. This repairs new seeds only. Do not run a live seed or migration.

- [x] Task IM3-L16 graph binding correction: Correct the QF renderer binding and add its missing source-bound draft blueprint through the existing contract. Verify default server publication accepts the intended draft authority. Correct distinct discriminant source bindings and review unsupported sequence prerequisites. Rebuild relevant existing projections without publishing draft activities or exposing private answers. Exact implementation scope is under review. See `im3-lesson16-binding-gap-review.md`.

The missing canonical QF blueprint means current default server calls reject seeded QF drafts. Earlier backend tests use an explicit draft publication fixture. Do not report current graph integration or learner readiness from those passing tests. Preserve the guard and close the graph binding gap.

Discriminant Worked seed repair is committed as `a06b265c2`. The two staged files match the accepted candidate. Parent and independent seed tests passed 13 cases. Lint, build, and separate TypeScript passed. Only phase 8 and 9 production bytes changed. Existing deployed versions and graph binding remain open. See `im3-discriminant-worked-seed-final-review.md`.

The first Guided client freeze failed parent and independent review. It cleared Independent roots on discriminant edits, blocked new checks behind an obsolete pending request, and kept fields unlocked if the callback disappeared. Required failure, stale-response, and HTTP helper tests were missing. The author is correcting the client before integration.

Guided client integration is committed as `c6867aaa1`. All seven staged paths match the accepted candidate. Parent tests passed 46 app cases and 16 shared component cases. Independent tests passed 12 app cases and 16 shared cases. Both lints, package TypeScript, app build, and separate post-build app TypeScript passed. Obsolete responses cannot unlock newer answers. Independent edits preserve root answers. Missing callbacks lock the controls and remove the success instruction. Default graph integration remains unavailable until the missing canonical QF blueprint is corrected. See `im3-quadratic-formula-guided-client-final-review.md`.

The graph binding scope is active. Parent corrections use truthful any_seed replay policy, omit a fixed passing score, and distinguish generatorReady from learner eligibility. Source Worked modes remain inline. The parent owns default-publication backend regressions. See `im3-lesson16-binding-implementation-scope.md`.

Independent scope review adds the existing canonical SRS projection to the graph batch. The graph author owns fifteen paths. The parent owns the existing writer test. Five new parent cases call the default canonical publication and preserve invalid-publication rejection. They fail before the missing blueprint is added.

- [x] Task IM3-QF later-attempt allocation scope: Define the smallest immutable later-attempt allocation using existing activities, practice_items, and practice_variants. Trace reload, concurrency, ownership, stable activity selection, and exact replay constraints. Keep prior stored variants immutable and server grading authoritative. This is read-only scope work. Do not add tables, schema fields, routes, or allocation code before the existing contracts are checked.

Parent and independent allocation review found legacy replay, public equation, reload, pending-row consumer, and seed rerun gaps. The first proposal is not accepted. A proposed optional variant reference still needs schema and consumer review. No allocation code is authorized by this scope review. See `im3-quadratic-formula-allocation-review-findings.md`.

- [x] Task IM3-QF pending consumer correction: Exclude draft submission rows before teacher latest-evidence selection and from submission exports. Use the existing teacher and export handlers. Add tests with an older final QF row and a newer draft row. Preserve final evidence and export pagination. The exact pending contract has no score or timing; other readers need regression coverage, not speculative production changes. See `im3-quadratic-formula-pending-consumer-audit.md`.

Graph binding correction is committed as `a85d31f16`. Parent and independent review accepted all sixteen paths. Default canonical authority now passes both draft modes. Teacher readiness and SRS eligibility remain false. See `im3-lesson16-binding-final-review.md`.

The allocation implementation scope now defines the minimum private variant reference, shared scheduled variants, canonical first attempt, immutable legacy replay, explicit Start, reload, exact public output, and seed rerun behavior. See `im3-quadratic-formula-allocation-implementation-scope.md`.

- [x] Task IM3-QF immutable allocation backend: Implement the seven backend paths and focused tests in the allocation implementation scope. Keep the teacher/export correction separate. Client integration, real transaction verification, browser use, and draft publication remain open.

Pending consumer correction is committed as `f3f17b4be`. Three filters preserve finalized teacher evidence and exclude pending export rows. All four paths passed parent and independent review. See `im3-quadratic-formula-pending-consumer-final-review.md`.

- [x] Task IM3-L16 discriminant practice scope: Inspect the existing discriminant component, schema, generator, and grading paths. Define source-based Guided and Independent responses for the separate classification skill. Keep source Worked examples distinct from unanswered checks. Prefer existing contracts and components. This is read-only scope work while QF allocation proceeds.

Discriminant scope review confirms four-case source authority on native page 45 and two-part unanswered demands on page 48. It identifies missing classification grading, unsafe client completion, and a stale ALEKS readiness flag. Source references can use existing capability identities. No new provenance node is required. See `im3-discriminant-practice-contract-scope.md`.

- [x] Task IM3-L16 discriminant source correction: Add the native page 45 rule and page 48 Problems 24-35 references to the existing classification skill in its five node-bearing catalogs. Set the ALEKS discriminant concept independentPracticeReady flag to false in applicable copies. Preserve IDs, kinds, other fields, record order, and unrelated bytes. Do not add a source node, executable blueprint, or prerequisite. Add one app-discovered regression. Check projector consequences before changing any projection; report an additional required path before editing it.

The discriminant source correction also owns the existing module-1/projection/practice-v1-activity-map.json row for the ALEKS concept. Final projector tracing corrected the initial finding: projectTeacherEvidence excludes concept nodes. Remove this stale concept row from teacherEvidence.skills. Do not substitute a false readiness value and claim projector parity. Preserve the concept node identity and all unrelated projection bytes.

- [x] Task IM3-QF allocation client scope: Trace the existing lesson, phase, activity, and submission helper flow. Define the minimum client integration for explicit Start, pending reload, saved final results, exact retry, and later attempts. Keep this work read-only until the backend response contract passes review. Do not add a client registry or change draft placement.

Discriminant source correction is committed as `7e5cc04ec`. All seven staged paths match the accepted candidate. Parent and independent review passed eight focused tests. App lint, build, and separate post-build TypeScript passed. The stale concept row is removed from the teacher skill projection. Practice implementation and source approval remain open. See `im3-discriminant-source-correction-final-review.md`.

- [x] Task IM2-L12 source taxonomy scope: Verify Lesson 1.2 source examples against the committed lesson and native Module 1 source. Define exact angle-measure and incenter-distance response boundaries. Trace occupied graph identities and propose the minimum draft correction. Preserve Lesson 1.1 pilot identity and all existing evidence. This is read-only scope work under Task 3.2. Do not infer skill readiness from a title or source reference.

The allocation client scope passes parent and independent review. It defines five production paths and six existing test paths. A saved receipt remains visible if grading details fail to load. Backend acceptance is required before implementation. See `im3-quadratic-formula-allocation-client-scope.md`.

The first allocation backend freeze is rejected. Parent and independent tests passed 134 cases, but the final-row validator rejects valid timing metadata from the real activity renderer. Parent review also found that accepting a wrong allocated attemptNumber can make exact retry fail after the writer replaces it with the server ordinal. The author must add regressions and correct both cases. The unbounded legacy-history read also needs a bounded existing-index strategy. This strategy must preserve legitimate legacy learners and state its validation limits. No backend code is committed from this freeze.

Parent and independent review accept a bounded descending read through the existing learner/activity ordinal index. Read six rows for the four-position allocated schedule, legacy anchor, and excess detection. Keep exact legacy replay on its existing retry-key index. Require a contiguous allocated tail; older legacy ordinals need not be contiguous. This read relies on the server writer keeping all legacy receipts before allocation. It does not claim complete validation of arbitrary older database corruption. The implementation scope records the exact rules and tests.

- [x] Task IM2-L12 source graph correction: Implement the seven-path Lesson 1.2 source taxonomy scope. Add separate draft whole-angle and inradius capabilities with exact source-example mappings. Keep occupied IDs and evidence intact. Do not claim the algebraic examples came from the native ALEKS PDF. Use failing source regressions, exact byte preservation, and independent review. No runtime readiness or approval.

- [x] Task IM3-QF local transaction verification scope: Define the minimum disposable local Convex fixture and runner for concurrent Start, shared variant allocation, exact final retry, rollback, and absence of learning effects. Use the cached local backend and existing handler exports. Keep default draft graph authority. Identify local seed and browser prerequisites. This is read-only preparation; do not start a server or push code before the backend freeze passes review.

- [x] Task IM3-QF real local transaction verification: Prepare the temporary fixture and runner from the local transaction scope. Run them on the next frozen candidate after parent structural review and focused checks pass. Verify real concurrency, rollback, seed preservation, and zero learning effects before backend source integration. Keep all services on loopback. Preserve draft graph authority. Remove fixture and generated changes before source integration.

Further seed review found eager creation of all future variants and order-sensitive metadata comparison. The memory tests did not prove canonical-only initial storage. The author must correct those cases. Real local verification now precedes backend integration. See `im3-quadratic-formula-local-transaction-scope.md`.

IM2 Lesson 1.2 source correction is committed as `c13efbc34`. Both projections match 207 canonical skill IDs. The teacher projection reports 57 standards gaps and one implemented generator. SRS eligibility remains zero. Parent and independent source checks passed seven tests. Parent lint, build, and separate post-build TypeScript passed. All seven previously clean main files match the accepted candidate. These counts describe inventory records, including broad legacy records. They do not prove assessable capability coverage. See `im2-lesson12-source-taxonomy-final-review.md`.

The immutable allocation backend is committed as `e4c9f6889`. Parent and independent checks passed 146 focused tests. App lint, build, and separate post-build TypeScript passed. Real local Convex checks prove concurrent Start, same-row final retry, shared relation creation, rollback, immutable seed rerun, finite schedules, and zero learning effects. Independent review accepts the source and real transaction proof. The original runner stopped only while parsing a successful null CLI result. A recorded continuation completed the same database without reseeding. See `im3-quadratic-formula-allocation-backend-final-review.md` and `evidence/im3-qf-local/`.

The existing Convex-specific TypeScript configuration lacks Node types and the app alias needed by three existing modules. The local test used a temporary configuration with installed types and the same app alias. The original configuration and all generated files are restored. The app-level TypeScript check passes. This configuration gap remains open for a separate bounded repair.

- [x] Task IM3-QF allocation client implementation: Implement the accepted five-production-path and six-test-path client scope against backend commit e4c9f6889. Use explicit Start, authoritative pending identity, saved receipts, exact retry, later attempts, and timing reset by pending identity. Preserve draft placement. Use failing regressions and independent review. Complete browser verification separately before learner rollout.

- [x] Task IM2-L14 native source review: Compare the committed Lesson 1.4 examples with its original document and all 19 figures. The first read finds synthetic example substitutions. Establish exact source groups before restoring source text or mapping atomic skills. Preserve occupied example IDs, broad skill IDs, and Lesson 1.1 pilot authority. No graph or source implementation is authorized by this review task alone; define the bounded repair from the evidence.

Allocation verification cleanup is complete. The local backend process is stopped. Its administrator key, SQLite database, storage, and fixture preparation directory are removed after evidence preservation in `4e7f32f1e`. Eleven completed backend baseline and review directories are removed. Completed patches, path lists, review reports, and gate logs are removed after their findings are recorded. Only the main checkout remains registered with Git. The shared candidate remains for active client work. The client worker verified all 11 scoped client paths against `4e7f32f1e` before editing.

Parent and worker review accept the Lesson 1.4 source repair scope. The parent inspected all four rendered pages and all 19 native images. The existing public assets match the embedded image bytes. The source has three example headings, including the combined Examples 2 and 3 heading, and 39 numbered prompts. Figure order differs from XML media order. The scope records exact problem-to-figure mappings and mathematical terms omitted by plain text extraction. See `im2-lesson14-source-repair-scope.md`.

- [x] Task IM2-L14 source restoration: Restore the original 39 prompts, three example headings, shared instructions, and native figure links in the lesson source. Add a source regression before repair. Use the accepted six-path scope, including the required generated lesson and calendar outputs. Remove synthetic problems, supplied solutions, and the unrelated sum-of-two-sides theorem claim. Keep all graph records and pilot authority unchanged. Use parent gates and independent review before commit.

- [x] Task IM3-QF client browser verification scope: Define the local authenticated learner fixture and real browser scenarios for the accepted allocation client. Trace the actual student projection and draft section fields. The first scope incorrectly assumes that the student query adds QF props and identity. It only adds those fields for the selected Worked path. Correct the local fixture from stored fixed activity fields. Include all four attempts in both modes, exact retry, saved-result recovery, timing reset, and stale responses within the same activity. Do not start a server or alter approval until the scope and client source pass review.

The revised browser fixture scope is not accepted. It proposes a temporary activity section schema extension to store public QF identity fields. That would test a different application schema. Keep the production section schema unchanged. The application must read the fixed public fields from its stored activity through a reviewed student-query projection.

- [x] Task IM3-QF student projection scope: Trace the existing student section projection and define the minimum production correction for exact unreviewed QF activities. Derive mode from the fixed activity mapping. Return only required public identity and props. Keep activity section storage, selected Worked authority, approval, and evidence behavior unchanged. Define malformed identity rejection and private-field exclusion tests. This is read-only scope work. Complete a separate reviewed correction before real client browser verification.

The IM2 source repair build rejected a stale generated lesson bundle. The existing prebuild script requires `curriculum/lessons.json` to match source. Extend the batch to that one required file. Regenerate with the existing script. Verify only Lesson 1.4 changes and the activity map remains byte-identical. The original two-path freeze awaits this correction.

Parent review accepts the real student projection scope and the corrected browser scope. The projection derives exact public QF identity from the fixed unreviewed activity. It keeps section storage unchanged and preserves the selected Worked branch. The browser fixture stores only activityId and componentKey. Both modes require all four attempts, repeated-root timing reset, exhaustion, exact retry, saved-result recovery, and stale-response checks. See `im3-qf-student-projection-scope.md` and `im3-qf-client-browser-verification-scope.md`.

- [x] Task IM3-QF student projection implementation: Implement the accepted three-path read-boundary correction in student.ts, the existing QF writer test, and the selected Worked database fixture. Validate exact physical QF identity, derive mode, return only required public fields, and reject malformed claims. Keep the schema, stored sections, selected Worked protection, approvals, and learning effects unchanged. Use failing tests, parent gates, and independent review before integration.

- [~] Task IM3-QF client browser verification: After client and student projection acceptance, run the corrected browser scope on a disposable loopback database. Use the real authentication, routes, section schema, and query. Preserve draft authority. Verify all four attempts in both modes and the specified failure recovery cases. Save evidence and remove the local environment after review.

The next IM2 prebuild check found the existing calendar dependency. Its generator requires a first lesson goal and updates the calendar, Unit 1 period package, and Module 1 plan. Preserve the three supported original goals and remove only the incorrect theorem goal. Extend the batch to these three required outputs. Preserve all 180 period identities, unrelated records, and other unit output bytes. No generator or scheduling rule changes. The three-path freeze is superseded.

Independent client review rejects the first 11-path freeze despite 69 app tests and 21 shared tests passing. Start deduplication is global, starting another activity clears a prior pending request body, and a queued reset can clear a newer QF identity. The author must add reproducing regressions and correct all three cases within the accepted client paths.

Independent student-query review rejects the first two-path freeze despite 60 focused tests and app gates passing. The stored section ID is a string. Passing a syntactically invalid ID directly to db.get can fail the full lesson query. Validate the activity ID with the existing database API before reading. A malformed QF section must become unavailable. Preserve the selected Worked protection and unrelated activity behavior.

The final six-path IM2 source restoration passes parent eight tests, lint, build, and separate post-build TypeScript. Only Lesson 1.4 and calendar period m1-p06 change. All 180 period identities and unrelated outputs remain intact. Independent final dependency review is active. The original source transcription already passed independent review.

The second QF projection freeze is rejected because it makes normalizeId optional in production to support a legacy test fixture. Call the required Convex API directly. Extend the scope only to add normalizeId to the selected Worked database fixture. Preserve all existing test expectations. The final projection batch has three paths.

IM2 Lesson 1.4 restoration is committed as `4b858feac`. All six staged files match the accepted candidate. The 39 native prompts and 19 figures are restored. Three supported goals remain. Only Lesson 1.4 and calendar period m1-p06 change. Parent eight tests, lint, build, and separate post-build TypeScript pass. Independent source review and independent review of the parent dependency correction accept the final result. All six main paths were clean before integration and now match the commit. See `im2-lesson14-source-restoration-final-review.md`. The old draft graph phase metadata and combined Example 2/3 identity remain open.

IM2 Lesson 1.4 source-review cleanup is complete. The native rendering directory and both completed baseline directories are removed after acceptance in `44803d515`. Git lists only the main worktree. Recovery branches remain intact. The shared candidate remains because the IM3 client and student projection still need final review and integration.

Final IM3 reviews found four remaining cases. The client must prevent an entry GET from replacing a newer Start result for the same activity and mode. Its Start message must also belong to the selected identity. The student projection must reject a stored QF mastery-node claim with unrelated physical authority. A successful QF projection must construct only its required public content fields. Add reproducing tests and correct these cases within the existing client and projection scopes. The prior client lifecycle fixes and direct normalizeId correction pass review. Neither batch is accepted for integration yet.

The next IM2 Lesson 1.4 graph review must address a source-kind mismatch. SPECIFICATION.md defines worked_example as a demonstrated solution. The restored worksheet supplies unanswered prompts, but occupied IDs .013 through .016 still use worked_example. The native source also combines Examples 2 and 3. Do not count these four legacy records as four verified Worked components. Preserve their identities while reviewing their source claims and relationships. Define actual Worked solutions separately from the native unanswered prompts. The 1g and 1h canonical skill records still have approved status and require source review. No graph record changes are accepted by this finding alone.

The QF student projection is committed as `97cf15aee`. The allocation client is committed as `db7af318d`. All 14 staged paths match the accepted candidate. Parent combined verification passes 137 application tests and 21 shared tests, lint, build, and separate post-build TypeScript. Independent projection review passes 63 focused tests. Independent final client review passes 58 regression-heavy tests and accepts all five lifecycle corrections. Six previously clean main paths match the commits. Eight mixed main paths remain intact. See `im3-qf-student-projection-final-review.md` and `im3-qf-allocation-client-final-review.md`. Real browser verification and learner rollout remain open.

Client and projection integration cleanup is complete. The completed reconstruction directory and 16 patch, review, and check files are removed after acceptance in `6e50fc05a`. Git lists only the main worktree. The shared candidate remains for the real browser run. The installed Node Playwright package can launch the installed Chrome in an isolated headless session. No package or browser installation is needed. The temporary browser fixture uses the production section schema. Complete its read-only final inspection before local setup.

The real browser setup reached a seed defect. The local backend accepted the source push with type checking enabled. The existing demo seed passed. seed_lesson_1_6:seedLesson6 failed because its quiz props use question and correctIndex fields that the current activity schema does not accept. The lesson seed transaction rolled back. The browser wrapper fixture and frontend have not started. The temporary TypeScript configuration is restored. Keep the local database for the corrected retry; do not rerun the completed demo seed.

- [x] Task IM3-L16 quiz seed repair scope: Trace the two legacy quiz questions in the existing Lesson 1.6 seed against the current schema and real quiz consumer. Define the minimum seed and regression repair. Preserve question meaning, answers, all other phases, QF draft authority, and the production schema. Do not bypass the failed lesson seed in the browser fixture.

Parent review accepts the two-file Lesson 1.6 quiz seed scope. The old correctIndex=1 values map to the unchanged second option text. The active local demo seed has already completed and must not run again. See `im3-lesson16-seed-quiz-repair-scope.md`.

- [x] Task IM3-L16 quiz seed repair: Convert only the two Phase 10 quiz objects to the current schema. Add a failing actual-seed regression. Preserve all other phases and QF authority. Require source gates and independent review before the real local retry.

Parent and independent review accept the seven-file IM2 Lesson 1.4 source taxonomy scope with counts derived from actual arrays. Keep occupied example IDs intact. Add atomic draft side-to-angle and angle-to-side ordering capabilities from the combined native group. See `im2-lesson14-source-taxonomy-scope.md`.

- [x] Task IM2-L14 source taxonomy correction: Implement the accepted 15-file scope with failing source and parity regressions. Correct unsupported approved broad rows and stale counts. Preserve unrelated identities, edges, and bytes. Keep new practice projections unavailable until authored components are implemented and verified.

The quiz object correction is committed as `1acf76bdc`. Parent and independent seed tests pass 14 cases. Author related tests pass 71 cases. Lint, build, and separate post-build TypeScript pass. The real local retry passed the activity-props validator and then exposed a second existing seed defect: the activity section write copies props into content, but the production section schema permits only activityId and componentKey. The seed transaction failed again. Keep the seed repair task active. Extend the same two-file repair to construct exact minimal activity section content. Keep the props on the activity record. Add an actual-seed regression before repair. Inspect generic quiz props retrieval separately; do not widen the schema or student query in this patch.

Lesson 1.6 seed repairs are committed as `1acf76bdc` and `9ba9c5f49`. Both passed parent and independent review, 14 actual-handler tests, lint, build, and separate post-build TypeScript. Author related tests pass 71 cases. The real local retry now passes the complete lesson seed and the two minimal browser wrappers. The baseline has two fixed QF activities, two items, two variants, no submissions, and zero learning effects. The original Convex TypeScript configuration is restored. The loopback frontend returns HTTP 200 and real browser verification is active. See `im3-lesson16-seed-contract-final-review.md`.

- [ ] Task IM3-L16 generic quiz projection scope: Trace why the current student query omits ordinary activity props and the lesson quiz displays component defaults. Define a bounded source-backed learner correction with the required grading and evidence boundary. Do not count successful seeding as proof of correct learner questions.

Additional parent IM2 graph tests expose two existing consequences of the restored source: the Lesson 1.4 graph title is stale, and the test counts unanswered native example headings as demonstrated Worked components. The seven-file taxonomy freeze remains uncommitted. Review the exact additional title copies and source-aware test boundary before extending the patch. Preserve occupied legacy IDs. Do not turn the combined native group into fabricated Worked nodes.

The user accidentally deleted the entire remote IM3 Convex project. The user confirmed that it contained only seed/test data and had not rolled out. Advanced data recovery is not required. The authenticated team inventory confirms that integrated-math-3 is absent. Recreate a development backend under the existing bodangren team from committed source, then restore seed/test content and reconnect the application. Exclude the disposable local browser fixture. Preserve the separate local database and current source work.

- [x] Task IM3 remote development backend rebuild: Recreate the deleted test project, deploy committed backend source to a development target, verify its schema and seed results, and update the relevant application configuration. Do not deploy the local test fixture or claim recovery of deleted records. Keep any seed or learner-flow failures explicit.

The replacement project is integrated-math-3 (2960816), under bodangren. Committed backend source and schema are deployed to development deployment accurate-labrador-817. The local browser fixture was excluded. Connection configuration is committed as b965a5756. Lint, build, and separate post-build TypeScript pass. No frontend deployment has run. The seed orchestrator has incorrect function references hidden by an any cast. Its caught errors can hide an empty bootstrap.

- [x] Task IM3 seed orchestrator references: Apply the accepted two-file scope in im3-seed-orchestrator-repair-scope.md. Test the real seedAll handler against all 67 registered mutation names before the repair. Replace only the reference mapping. Preserve seed order and result behavior. Exclude uncommitted pilot logic. Verify the remote seed results after source acceptance.

Seed reference repair is committed as `1cde40221` and deployed to development deployment accurate-labrador-817. The first deployment helper stopped before any remote call because it parsed a commented TypeScript configuration as JSON. The corrected helper completed the push and restored the original configuration. The remote seed command exited successfully but loaded only Lesson 1.6. All 44 standards loaded. The other 51 lesson mutations failed: 49 rejected activity props and two rejected phase-section content. Only one of 79 lesson-standard relations loaded. The demo created test accounts and a class. It created no student progress. Do not treat the command exit or demo progress success flag as complete bootstrap evidence.

- [x] Task IM3 legacy lesson seed repair scope: Classify the 51 real schema failures from committed seed modules. Trace current activity and section contracts. Define the smallest source repair and actual-seed regression tests. Do not broaden validators to accept arbitrary legacy content. Preserve source pedagogy and unrelated main changes.

Independent remote review confirms the seven seeded profiles include the expected deactivated test student. The progress helper writes activity_completions, not student_progress. It returns an empty result when Lesson 1.1 is absent. A direct query confirms zero activity_completions. The generic practice-item helper also creates an unresolved composite variant key. Keep this helper defect separate from the two valid quadratic-formula allocation items. Completed seed-reference freeze files and gate logs were removed after acceptance.

- [x] Task IM3 generic seed item variant reference: Scope and test the generic practice-item helper reference defect. Preserve unique item identity, bind each item to an existing variant, and verify the actual stored relation. Do not change the reviewed quadratic-formula allocation contract.

The IM2 taxonomy dependency scope is accepted after independent review. Extend the seven-file freeze to exactly 15 paths in im2-lesson14-taxonomy-dependency-scope.md. The existing generator must classify an Example section as worked_example only when it has an exact Solution heading. Preserve all four legacy draft IDs. Correct only Lesson 1.4 and its direct generated dependencies. The other 95 lessons, 179 calendar records, activity map, and unrelated unit outputs must remain unchanged. Continue the active IM2-L14 taxonomy task under this scope.

The two-file generic seed item scope is accepted in im3-generic-seed-variant-repair-scope.md. Preserve composite item identity and existing label allocation. Repair the parent variant reference in both selection branches and on same-family legacy reruns. Preserve different-family items. Run the helper directly after acceptance; do not reset the demo environment.

Parent review rejects the first 53-file legacy seed proposal. It adds a runtime conversion layer and relabels imaginary-number, inequality, and system activities as unrelated problem types. These changes would make schema success weaker than content correctness. Revise the scope to direct seed-data corrections for unambiguous fields. Review unsupported domain tags and system presentation against the real shared component contract. Preserve source formulas, steps, prompts, options, and answers. Do not claim complete bootstrap until all 52 real lesson transactions pass with accurate content.

The revised direct seed-data scope is accepted for Batch A in im3-legacy-seed-repair-scope.md. It changes the 51 failed seed files and the existing handler test. Preserve Lesson 1.6. Apply exact graph, quiz, step, and section fields without a runtime converter. Keep four lessons with unsupported solver contracts explicit. Batch B remains under review for accurate domain tags and two-equation system display/submission. Full local schema proof is required after both batches.

IM2 Lesson 1.4 taxonomy and its generator dependencies are committed as `1b63e8274`. Parent and independent review passed all 115 focused tests. Curriculum checks, lint, build, and separate post-build TypeScript passed. Only Lesson 1.4 and period m1-p06 changed in the generated records. All four legacy draft IDs remain intact. See im2-lesson14-taxonomy-final-review.md. Actual Worked, Guided, and Independent components for the two new atomic skills remain open.

The generic IM3 seed item reference correction is committed as `d8035d25f`. Parent and independent focused tests passed three cases; 868 related tests and required gates passed. See im3-generic-seed-variant-final-review.md. Keep the task active for the targeted remote helper rerun and stored-reference check after the next accepted backend deployment.

The completed IM2 taxonomy freeze, superseded seven-file patch, generic variant patch files, and IM2 reconstruction directory were removed after acceptance. The active candidate and actual local and remote database evidence remain. Only the main checkout remains registered with Git.

- [x] Task IM3 solver system contract: Implement the accepted eleven-file scope in im3-solver-system-contract-scope.md after Batch A integration. Preserve exact domain tags and the current step contract. Represent a system with strict first and second equation fields. Render both equations in the active IM3 app wrapper and preserve both in practice.v1 submission metadata. Preserve ordinary non-system defaults. Do not add a seed parse, default-prop framework, or solver algorithm. Use actual shared schema, app component, and lesson-handler tests.

A scope review accidentally used the dirty main schema refactor. Parent comparison with HEAD and the isolated candidate rejected that evidence. The accepted owner remains packages/math-content/src/schemas/step-by-step-solver.schema.ts, with five existing public types and seven exact additions. The activity-components schema is a re-export in committed source. All subsequent review must use absolute candidate paths or Git HEAD source.

Batch A direct seed-data repair is committed as `687cf843e`. Parent and independent review accepted exact source preservation and all 52 handler checks. The 11 focused tests, 841 related tests, lint, build, and separate post-build TypeScript passed. See im3-legacy-seed-batch-a-final-review.md. Preserve the 51 mixed main seed files. The isolated candidate holds the committed repair.

Extend Batch B from eight to nine paths for the direct aggregate-test dependency introduced by Batch A. The test must now require exact system objects and parse every solver record through the real shared schema. Preserve the exact source-domain counts. No production scope expansion is required.

- [x] Task IM2-L14 atomic practice scope: Trace existing IM2 components, grading, allocation, and exact-node evidence for the two new triangle-ordering skills. Define source-based Worked, Guided, and Independent content from native Problems 6 through 11. Distinguish newly authored solutions from native unanswered prompts. Reuse the existing practice contract. Preserve legacy IDs and inactive readiness until actual implementation and learner verification pass.

A fresh disposable local backend is prepared for the full IM3 seed proof. It has zero lessons, standards, and activities. The CLI rejects mixed cloud deployment and self-hosted variables. Use its supported --env-file option with the private local environment file to select the local target. The existing browser-test database remains separate.

- [x] Task IM3 demo progress seed contract: Trace and correct the demo helper that casts a lesson-version ID to an activity ID for text-only phases. Use the existing phase-progress model for phase state. Preserve real activity IDs for activity completions. Verify the declared not-started, in-progress, and completed demo states without changing credentials. Scope the existing helper and its actual-handler test before implementation.

Extend the solver-system batch to eleven paths for the actual shared stepper prompt dependency. Add the existing StepByStepper source and direct test. An optional display flag preserves all existing consumers and lets the IM3 system wrapper suppress the duplicate first-step Problem block. Preserve all source solution steps and grading. This is required to show the two real equations as the system prompt.

The two-file demo progress seed scope is accepted in im3-demo-progress-seed-scope.md. Use the existing student_progress table and real activity references. Skip phases with any existing progress row. Preserve learner state and credentials. Keep the existing result shape. Test all declared demo boundaries, real ID resolution, text-only phases, and exact rerun preservation.

Solver-system source repair is committed as `a3235c125`. Parent and independent review accepted all eleven paths. All 119 focused tests and 841 seed tests passed. Affected lint, TypeScript, build, and post-build TypeScript checks passed. Five clean main files were updated. Six mixed main files were preserved. Native local Convex storage proof remains open.

Demo progress repair is committed as `fc5ef02cb`. Parent and independent review accepted the two-file patch. The helper preserves existing phase state and uses only real activity IDs. All 23 related tests, lint, build, and separate post-build TypeScript passed. Both clean main files were updated. Full local seed verification is in progress on the separate backend at port 43150.

- [x] Task IM3 generic practice seed read limit: Correct the repeated bounded activity read in the existing generic helper. The real local full seed stored all 52 lessons, 44 standards, and 79 relations. It stored 30 valid phase-progress rows and 18 valid activity completions. However, seedAll suppressed the generic helper failure. A direct helper call failed at the 16 MiB read limit. Review a minimal two-file correction that reuses the same first 200 fallback activities within one invocation. Preserve selection order and existing item ownership. Require native local proof before remote retry.

The first local verification query failed because the CLI received a plain default function export. The corrected read-only query body passed. Stored references, five system equation pairs, and all five demo boundaries passed. This partial proof does not establish complete bootstrap or practice coverage.

The two-file read-limit scope is accepted in `im3-practice-seed-read-scope.md`. Reuse the existing first-200 fallback result within one invocation. The verified local counts are 388 activities and 91 variants. The catalog contains 87 problem families. The other four variants belong to the quadratic-formula seed. Standards (44) and mappings (79) must not be used as activity or family counts. The preexisting first-200 selection limit remains explicit.

IM2 Lesson 1.4 practice scope remains under review. Independent review found missing reload answer-prefix state, hint-counter preservation, a distinction between the final part and successful completion, and teacher display for staged submissions. The existing attempt-ordinal index supports a bounded newest-row lookup. Revise the scope before implementation.

The read-limit source repair is committed as `4294ebb72`. Parent and independent review accepted two paths. Both reviewers passed all five focused tests. All 36 related tests, 833 seed tests, lint, build, and separate post-build TypeScript passed. Both clean main paths were updated. The native helper retry is in progress.

Native local verification accepted the repaired helper after commit `4294ebb72`. The helper returned 7,838 successful family/activity outcomes and no failures. The database contains 200 unique practice items with valid references. All 52 lessons, 44 standards, 79 mappings, five source systems, and five demo progress boundaries remain valid. These categories do not establish graph-node practice coverage. The first-200 fallback boundary remains unchanged. Independent review accepted this bounded bootstrap. Targeted remote retries may now proceed without resetting demo accounts. Accepted patch copies and temporary reconstruction directories were removed after integration. Only the main Git worktree is registered.

Remote development rebuild verification is complete. Committed source through `4294ebb72` was deployed to accurate-labrador-817. All 62 targeted calls passed. Remote state contains 52 lessons, 44 standards, 79 mappings, 200 unique valid practice items, and the declared demo states. Parent and independent review accepted the bounded bootstrap. No demo account reset, frontend deployment, or production deployment ran. The temporary seed backend (PID 42585), private database, storage, keys, environment files, and runner were removed after evidence review. The separate QF browser database remains for its open task. No phase or full program completion is claimed.

- [~] Task IM2-L14 atomic practice implementation: Implement the accepted fifteen-path scope. Deliver six source-based Worked, Guided, and Independent activities for the two triangle-ordering atoms. Use staged graded parts, exact retries, reload state, cumulative hint counts, and teacher attempt display. Preserve the perpendicular pilot and all draft authority. Require source tests, full IM2 tests, lint, build, standalone types, independent review, and later real learner verification before activation.

The revised IM2 scope passed parent and independent review. Browser verification resumed on the existing IM3 local backend with zero submissions. A temporary worker environment resolves the earlier missing-credential failure. The first login attempt reached the form before hydration. Waiting for the initial session request produced a valid login. The existing login page does not navigate after authentication; the harness must verify the authenticated session and then open the scoped lesson. Keep the login navigation behavior as a separate usability follow-up.

- [x] Task IM3 active credential guard repair: Correct the source mismatch found by the real browser check. The login and session routes authenticate the local learner. The QF attempt route then returns 401 because verifyActiveCredential checks isActive on a payload that omits that field. Reuse the existing internal credential query that returns active state. Preserve rejection of inactive and missing accounts and service failures. Scope and test the actual payload before implementation. Do not bypass authentication for browser verification.

The three-file active-credential scope is accepted. Reuse getCredentialByUsernameIncludingInactive and retain the explicit active-state check. Tests must use actual query-handler payloads. The local frontend was stopped and its temporary worker credentials moved outside the candidate before builds. The existing deactivated demo account supports the inactive-account check without changing credential data.

The active-credential source repair is committed as `4bdd5b91f`. Parent and independent review accepted all three paths. All 67 focused tests, lint, build, and separate post-build TypeScript passed. Parent auth tests passed 41 cases. All three mixed main files were preserved. The local frontend restarted for active and deactivated account checks. No Convex production function changed.


Native local authentication proof passed for source repair `4bdd5b91f`. The real login and session flow reached the Guided attempt route with status 200. The existing inactive account received 401 with a valid locally signed session. No credential changed. Independent review accepted the proof.

The QF browser run passed all eight physical attempts across Guided and Independent modes. Ten submission requests include two exact retries. Saved-result recovery, delayed Start, stale responses, repeated roots, timing reset, and exhaustion passed. The database retains two activities and has eight items, variants, and submissions. All five learning-effect counts remain zero. Independent review accepted this transaction scope. The displayed and saved quadratic omit `= 0`; learner presentation and readiness remain open. Evidence is in `evidence/im3-qf-browser-local/`. Keep the local database for the bounded presentation follow-up. Remove it after that proof.

The first IM2 fifteen-path practice patch is rejected. Its 49 focused tests do not cover the accepted contract. The independent report records routing, stored-state validation, exact retry, publication, evidence, client, Worked solution, and seed repeat defects. Rework remains in progress. No rejected source is committed.

- [x] Task IM2-L14 calendar source gate: Correct only the existing calendar test under the accepted one-path scope. Require Worked entries when the source lesson has demonstrated Worked phases. Require zero when it has none. Preserve all coverage, identity, title, and maximum checks. Run the full IM2 suite and required build checks.

- [x] Task IM3-QF equation presentation scope: Trace the minimum change that publishes a complete equation in pending, editable, and saved views. Check stored draft compatibility. Preserve grading authority and existing browser evidence. Define exact paths before implementation.


- [~] Task IM3-QF complete equation presentation: Implement the accepted four-path scope. Publish complete equations. Reconcile only exact legacy unreviewed drafts. Preserve all eight verified submissions and their relations. Verify pending, saved-awaiting-details, and final responses. Run focused tests, renderer compatibility tests, lint, build, standalone types, independent review, and bounded native display checks.

The equation presentation scope passed parent and independent review. The temporary frontend is stopped. Its worker credentials are outside the candidate. The saved development environment is restored. Keep the original local backend and database for the bounded reconciliation and display proof.


The one-file IM2 calendar source gate is committed as `3eb28fd80`. Parent isolated verification passed all 291 tests, lint, build, and separate post-build TypeScript. Independent review accepted the patch. The main scoped file was clean and now matches the commit. The temporary archive was removed. The separate fifteen-path practice rework remains open.

A fresh read-only IM3 local snapshot confirms two complete QF activity documents, eight item documents, eight variant documents, and eight final submission documents. The second active demo learner has no QF attempts. All effect tables are empty. Retain this private snapshot for exact before-and-after reconciliation checks. No database write ran.
