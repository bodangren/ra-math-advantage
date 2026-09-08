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

- [~] Task G53 source: Restore all 50 original Lesson 10-2 prompts and all 14 native figures in the extensionless lesson source. Preserve the five existing Example groups and Mixed Exercises. Add exact source regressions. Do not add answers, extra response requirements, source approval, or graph changes. The corrected source inventory is in final independent review.

G53 corrected inventory is accepted. It preserves 50 prompts, five existing Example identities, and 14 native figures. It proposes one inactive maximum-count atom with separate line and plane evidence variants. No new prerequisite is accepted. Problem 49 remains task-local manual evidence. Exact source restoration is in progress in one isolated candidate. See `im1-lesson102-inventory-independent-review.md`.

Removed saved worktree 4e21 after parent and independent checks of all 355 states. All states are preserved in main, 02d6, or 18ee. Branch `codex/preserve-saved-4e21-im3-lesson11` preserves its two detached commits. The other 18 saved worktrees remain intact. See `saved-4e21-full-preservation-review.md`.

G53 graph preparation found draft standard placeholders in the existing alignment fields. Review the exact standard scope for the two Lesson 10-2 skills and the reused Lesson 12-4 postulate skill before graph implementation. Do not copy those alignments to the new maximum-count atom without evidence. This review does not change the source-restoration scope.

Removed saved worktrees 4f74 and 54ed after full parent and independent review of 712 states. The superseded source candidates need no integration. Branch `codex/preserve-saved-54ed-im3-projection-repair` preserves two detached commits. The other 16 saved worktrees remain intact. See `saved-4f74-54ed-preservation-review.md`.
