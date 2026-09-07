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
- [ ] Task 3.3: Correct IM3 and Precalculus capabilities and relationships from sources.
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

- [~] Task Q5: Add the Precalculus Topic 1.1 teacher confirmation control. Show source context, lock pending requests, retain retry selection, and accept durable confirmation state. Standalone control and four tests committed as `3459b282`. Two existing-page integration tests pass. Durable query integration and accurate student acknowledgement text remain in the shared working tree for integration.

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

- [~] Task G30: Review AP Precalculus Topic 1.1 source capability boundaries. Compare the current interval-classification pilot with the original source. Identify assessable capabilities, source mappings, and graph classification errors before changing the inventory. Parent inspection of original pages 3 through 12 supports three distinct new actions. Two proposals need removal or stronger source evidence. Correct variable-versus-set vocabulary and authored-material attribution. See `precalc-topic11-capabilities-independent-review.md`. The corrected three-candidate proposal is accepted for draft authoring. The official graph-construction objective remains a coverage gap.

- [x] Task Q15: Reconcile the committed selected IM3 evidence and teacher interface fixes with the shared worktree. Preserve pending later-node changes. Snapshot owned files. Apply only missing selected behavior. Verify the actual shared worktree with focused regressions. The worker reports 153 passing tests, lint, and standalone TypeScript. Parent diff review, 11 general provider tests, and app build pass. See `im3-selected-main-reconciliation.md`.

- [~] Task Q16: Repair the selected IM3 Worked lesson path. Join the actual seeded activity in the student query. Require its stored acknowledgement before phase completion. Remove student-created teacher exposure. Test the seed, query, renderer, and phase mutation together. Keep teacher attestation and Independent eligibility separate. See `im3-selected-lesson-consumer-review.md`.

- [~] Task G31: Reconcile the Precalculus Topic 1.1 draft repair with the committed graph. Account for the pending replacement of the covariation skill. Preserve stable identities and isolate Topic 1.1 changes from other pending topics. Verify the resulting node, blueprint, relationship, and projection state before integration. Keep source approval open.
