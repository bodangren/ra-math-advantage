# Execution record

Implementation authorized: 2026-09-07.

## Baseline

Base commit: `c813afa8905d127cfbe23b85417a9bee349527ae`. Work uses the current working tree because it contains current course corrections. Preserve all pending changes. Do not copy an older checkout over this state.

## Ownership

The parent owns this program, shared integration, and central Measure files. Existing course correction tracks retain their application fixes. The semantic repair track remains the checklist for series graph repairs. All workers receive explicit file ownership before edits.

Initial parallel work: shared runtime contract review; IM1 and IM2 source inventory; IM3, Precalculus, and Business Math source inventory. These tasks read existing implementation. They write only their assigned review notes.

## Baseline checks

- Shared practice: 450 tests passed.
- Shared core: 698 tests passed; 3 failed. All three invoke current repository boundary or Doctor checks. No source change preceded these checks.
- Logs: `/tmp/graph-program-practice-baseline.log` and `/tmp/graph-program-core-baseline.log`.

## First implementation assignment

The runtime worker owns `packages/knowledge-space-practice/src/projections/activity-map.ts` and a new `activity-map-identity.test.ts`. It must preserve pending edits. Contract: validate mode specs with existing schemas; do not project concept work into child evidence; select the renderer for the actual mode with the blueprint renderer as fallback. Do not strengthen unrelated authoring schema constraints.

This repair can proceed while source review continues. It does not approve graph rows, change the upstream graph endpoint contract, or activate new mastery targets.

## Equivalence boundary decision

The parent owns `projections/srs.ts`, `projections/teacher-evidence.ts`, and a new equivalence acceptance test. Draft equivalence suggestions may remain available for source review. They must not appear as accepted SRS identity links or teacher equivalence groups. Accept a relationship in these outputs only when the edge and both skill endpoints are approved. Keep the generic suggestion and component-analysis functions available for review. No new schema, field, or registry is required.

## First repair verification

- Projector and equivalence package: 469 tests passed after the mode-key compatibility correction.
- Equivalence regression: 8 failures before the repair; 8 passed after it.
- Renderer compatibility regression: 2 failures and 1 pass before the repair; all pass after it.
- Full package lint passed. Standalone TypeScript passed for shared practice and math content.
- Wider build stopped at the existing lesson-renderer CSS import typing error. The stylesheet exists and KaTeX is already declared.
- Core baseline failures are the existing undeclared `knowledge-space-practice` import in the Precalculus sync script.
- Full math-content tests had 864 passes and one timeout in the existing 10,000-seed polynomial-extrema test. A separate rerun is pending.

The broad course program and manual review gates remain open. No graph row is approved by these results.

## Committed integration correction

`97b46bfc`: declared the existing KaTeX stylesheet module. Standalone lesson-renderer TypeScript, lint, and both tests pass. No dependency was added.

The polynomial-extrema test passes in isolation: 5 tests, including all 10,000 seeds. The earlier full-suite timeout occurred during concurrent verification.

IM1 full-suite result: 38 passed, one assertion failed, and one suite failed to load. The two failures concern an obsolete CI job name and a source-text assertion about the Convex provider. Neither is in the graph source batch.

`ecedf2b1`: fixed objective extraction and table-cell parsing. All 55 extraction tests, package lint, and standalone TypeScript pass. Catalog integration is a separate task.

## Current continuation

The parent integrates the completed shared boundaries and IM1 Module 1 source repair. The runtime worker reviews the source repair. The inventory worker implements expression input for the IM1 translation pilot. The readiness worker resolves the parent nearly-ready state defect and adds a behavioral test. Each worker has separate file ownership. Other course correction commits continue in the shared checkout.

`b11b5032`: committed the approved-equivalence boundary. All eight focused tests pass. Current standalone shared-practice TypeScript, root lint, and all package builds pass. Earlier shared-practice full-suite result: 469 passed. Other pending SRS generator-readiness changes remain outside this commit.

`8c9bef54`: committed renderer compatibility for all mode overrides. Three focused tests pass. Existing schema changes remain outside the commit.

`67d972dc`: restored six IM1 Module 1 draft capabilities and exact available example links. Independent source review found no source error or accidental activation. Three focused tests and IM1 standalone TypeScript pass. The test uses a partial-object assertion because the JSON type has no readiness field. Module 2 source restoration is now in progress.

`ac4a6a4f`: committed exact-capability activity projection, existing-schema validation, and per-mode renderer choice. The architecture document now states the same identity rule. All 35 focused projection tests, lint, and standalone TypeScript pass. Existing renderer-props, rubric, and SRS changes remain unstaged.

## IM1 application integration finding

The current `PracticeSessionProvider` displays only session and objective IDs. It does not render an activity or submit a response. The queue copies stored activity props. It does not generate the translation prompt or hold private expected answers. The current route test replaces the provider with another identifier-only component. It cannot prove student practice. Task 4.4 must implement the actual activity, server submission, and evidence flow before the pilot is complete. The existing route test remains useful only as a route wiring check.

The parent readiness omission is resolved in the working tree. Independent integration review confirmed state preservation. Both new readiness suites pass, with 14 tests. The readiness changes overlap earlier parent evidence-source corrections. They remain uncommitted while the integration owner separates their scope. No file was restored or overwritten.

The IM1 source additions expose frozen inventory assertions in existing coverage tests. Task G5 will correct the reports and tests. Registered generators do not prove complete practice or approved curriculum scope.

`6011c71d`: committed six Module 2 draft capabilities, source-only blueprints, and corrected 2i text on its original ID. The corrected tests check source numbers and capability-specific titles. Ambiguous occurrence links are excluded pending G4. Four tests and IM1 standalone TypeScript pass.

`7d6b7c61`: deduplicated repeated lesson examples in extraction. Two new regressions failed before the change. All 57 extraction tests pass after the change. Math-content lint and standalone TypeScript pass. The occurrence counter still advances for repeated references. Later identifiers therefore remain unchanged for the same input. Saved catalogs were not regenerated. G4 still must restore missing source nodes and reconcile saved duplicate references.

## Active follow-up ownership

The runtime worker implements the single-node IM1 server submission and client flow. The inventory worker reconciles saved Module 1 and Module 2 source examples. The readiness worker corrects the existing IM1 inventory audit and tests. The parent retains integration ownership. The practice component now has explicit Worked reasoning and Guided Check, Hint, and Reveal behavior. The app must use an awaited durable submission callback. Draft rows remain outside ordinary adaptive recommendations.

`6ac498a6`: committed the expression-capable blank renderer and its required contract fields. Worked mode shows reasoning. Guided mode checks before hints and reveals. Independent mode submits raw answers. Save failures preserve the response. Review tests exposed lost reveal assistance after an edit and missing Guided error output. Both are corrected. Eleven interaction tests, component lint, standalone TypeScript, root lint, and all package builds pass. The earlier schema ownership migration remains unstaged.

`64f04ffb`: committed the IM1 expression generator, graph registry binding, mode projector, and private finite-form grader. Ten focused tests, package lint, and standalone TypeScript pass. Independent props have an exact public shape. Source evaluation remains separate from translation evidence.

`3df086f6`: committed all 67 actual Module 1 and Module 2 example identities. Four missing draft examples use source-number IDs. Four confirmed duplicate occurrences redirect to retained identities. Full lesson-body review corrected unsupported shared mappings. The inverse graph-to-equation example remains a distinct source awaiting capability inventory. Ten source tests and IM1 TypeScript pass. No node outside the two modules changed.

`6f595dd4`: committed the current IM1 inventory correction. Current totals are 150 skill candidates and six generator bindings. The 146 blueprint rows contain six schema-valid mode bundles, 132 empty bundles, and eight source-only rows. Four capabilities have no blueprint. None of these counts proves a complete production practice path. All 42 inventory tests and math-content TypeScript pass.

## Continued pilot and source work

The previous goal turn recorded the existing objective. It did not change the implementation. This turn rechecked current files and resumed live workers. The Precalculus review found incomplete Worked instruction, no positive constant interval, and an approval bypass. Task 4.3 now covers these fixes. G6 continues with IM2 Lesson 1.1 source distinctions. G7 corrects the IM1 translation catalog, which still asks for numeric evaluation although the new adapter grades expressions. The existing debt registry still presents historical 138-node counts as current. Those statements require correction.

`72eee707`: the shared projector now requires approved exact node and blueprint states plus explicit readiness for SRS eligibility. It retains mode-specific renderer props. The approval regression failed before the repair. All 59 focused tests, package lint, TypeScript, and package build pass.

`fae19087`: IM1 authentication links now use the existing Next Link component. Full app lint, standalone TypeScript, and build pass.

`bf57ae6a`: IM2 now has distinct draft coordinate-circumcenter and coordinate-centroid capabilities. The source review preserves the perpendicular-bisector pilot and both legacy identities. Independent review found no blocking defect. The worker ran 14 focused tests. The parent repeated the four new source tests, app lint, and TypeScript. Whole-course taxonomy remains open.

The IM1 legacy blueprint test still claimed that all Module 1 source candidates had generators. It also treated generic prompt and answerSchema fields as proof of renderer usability. Five assertions failed after the source and renderer fixes. G7 updates that test to distinguish registered bindings from source-only gaps. Exact renderer behavior remains covered by the new catalog and student-flow tests.

`43c0ac98`: the IM1 translation catalog now uses expression-only grading and actual mode props. Guided seed 1110 assesses grouping. Both unsupported direct standard edges are rejected. All three projection consumers discard rejected edges. The saved activity and SRS copies agree. The selected graph node remains draft. Three catalog tests, 46 inventory tests, and 59 shared tests pass.

The IM1 app pilot has 28 passing focused tests. These tests use the actual generated mode props and renderer, the server grading handler, a durable in-memory store, and separate real seed tests. They cover Worked retry, final completion, incorrect-answer correction, current publication, exact readiness, queue preservation, and repeated-visit first exposure. These tests do not prove a deployed Convex or browser session. No process listens on local port 3210.

The boundary check found four IM1 undeclared-import paths and one Precalculus sync-script path. They require three existing workspace dependency declarations. The parent prepared `/tmp/graph-program-workspace-dependencies.patch` and requested explicit approval under AGENTS.md:104. No dependency file has changed. No install or upgrade is proposed. App integration remains open while independent course work continues.

The IM2 three-mode app draft is implemented and awaits independent review. The Precalculus pilot now includes a positive constant segment and current graph publication checks. Its author reports 137 focused tests, lint, TypeScript, and build passing. The parent has not yet integrated or accepted that patch. The IM3 worker selected `math.im3.skill.1.1.graph-quadratic-functions`. The Business Math worker selected `math.bm2.skill.1.1.apply-accounting-equation`. Both workers are tracing the current source and app boundaries.

## Next integration boundary

The parent found that the Precalculus approved-pilot query had no production caller. The dashboard still rendered the selected practice. The author is now connecting the query to the real consumer and regenerating public Independent props. A callable query test cannot prove the student route.

The constant-interval generator initially used a special case for seed 2 only. A new regression tested fresh seeds beyond the pilot. It failed. Constant segments now appear for a recurring set of seeds. All six generator tests pass. Seed 0 and the fixed Independent seed 2 retain their exact expected geometry.

Independent IM2 review found missing teacher-first evidence policy, incomplete Guided interaction, repeat entry, and missing return validators. The author is repairing these findings. The canonical rule is `evaluateLearningEvidenceV1` in practice-core. Student acknowledgement does not establish teacher-led exposure. IM1 currently stores selected graded evidence but does not update SRS or mastery. Its full historical-evidence and teacher-first bridge remains open under Tasks 2.3, 3.6, and 4.4. Incorrect grades must remain available for later learning decisions.

IM3 canonical seed and direct-submission publication checks are now implemented by the worker. The worker is resolving seed TypeScript errors caused by the shared optional-answer display schema. The Convex private-answer requirement must remain intact. Business Math implementation is awaiting independent integration review.

## Durable interval submission and current review findings

The previous goal turn stated the active goal. It did not change implementation. This continuation resumed bounded workers and verified the current files.

`b9e7cb21`: the interval component now awaits its submission callback. It disables input during the save and retains answers after failure. Its accessible graph description lists the actual coordinates. It no longer exposes a fixed classification pattern. Two regressions failed before the repair. All 13 focused component and schema tests pass. Coverage is 100 percent for lines and 91.17 percent for branches. Package lint, standalone TypeScript, and build pass.

The affected Precalculus app checks found two stale dashboard query mocks. They now use actual saved mode props for a hypothetical approved query result. The unavailable publication test remains separate. All 16 affected app tests pass. App integration and live verification remain open.

IM1 now stores every graded Guided and Independent attempt as history. It applies the canonical teacher-first decision to mastery eligibility. The worker added a teacher dashboard action, a trusted exposure route, and an exact-node SRS bridge. The author reports 22 backend tests and 25 backend/route tests passing. Independent review is in progress. This report does not approve the implementation or curriculum.

The Business Math review found two release blockers. The generated three-mode path conflicts with the reviewed blueprint. The Independent component reveals the expected answer before the server grade is saved. The author is repairing publication checks and answer disclosure. Task 4.6 remains open.

G8 found six omitted Module 3 objectives and one omitted source example. The worker restored draft identities and exact source references. Several objectives still combine separate capabilities. Source image review and capability splitting remain open. The parent has not yet accepted G8.

`7b9b4993`: committed the bounded Module 3 source restoration and current inventory reports. There are now 156 skill candidates, six generator bindings, 150 generator gaps, and 152 blueprint rows. Six rows have schema-valid mode specifications. There are 126 empty bundles and 20 source-only rows. Four candidates have no blueprint. The current approved skill count is 137; this status count does not prove source review. The parent checked the source bodies and repeated seven source/pilot tests and 42 inventory tests. IM1 lint and standalone TypeScript pass. Math-content lint, standalone TypeScript, and build pass. G8 remains open for atomic capability splitting and image review.

Independent IM1 review rejected the first teacher-exposure implementation. It lacks the current catalog publication check and verified source class linkage. The teacher form requires raw IDs and does not preserve a retry key. The author is repairing these defects in IM1 and checking the equivalent IM2 flow. No pilot release or source approval is recorded.

The Business Math author has disabled the generated path for the current source blueprint and delayed expected-answer feedback until durable submission. The full goal still requires the source-based artifact practice and teacher-review flow. The author is now tracing that path.

## Function evaluation and trusted teacher actions

The previous goal turn made verified progress through the committed interval and Module 3 source repairs. This continuation checked live agents and current files before further work.

`4c29f791`: split IM1 objective 3d into numerical evaluation, algebraic evaluation, and interpretation in context. The legacy identity remains an inactive draft aggregate. The new rows cite exact source examples. They have only draft containment edges and no active projection rows. Independent source review passed. All 10 source/pilot tests and 42 inventory tests pass. IM1 and math-content lint, standalone TypeScript, and builds pass. The inventory now has 159 skill candidates, six generator bindings, and 153 generator gaps. These are candidate counts.

The Precalculus review confirmed that a student Worked acknowledgement creates teacher-led exposure. Its lesson write path also bypasses current draft publication. The author is replacing this with an explicit acknowledgement and a trusted teacher action. The same Business Math source reconstruction uses a student Guided submission as teacher-led exposure. That origin requires repair even though the event itself has no mastery score. It can affect later eligibility.

IM1 and IM2 now have usable teacher selection controls instead of raw ID forms. The author added tests for visible source context, hidden selected identities, empty states, and retry keys. The parent is checking the complete affected suite before integration. The workspace dependency request remains unanswered. No dependency files, deployments, or live records have changed.

The parent found another actual-flow failure in the IM1 teacher action. Every real Guided attempt already has a historical evidence row. The candidate query excludes that row, and the teacher mutation rejects its origin. Positive fixtures omitted the historical row. The author is adding a complete student-to-teacher-to-Independent handler test and preserving both distinct events. The parent also requested actual rejected-network and candidate-change retry tests. The teacher path remains unaccepted.

## Teacher confirmation verification

The previous goal turn committed the IM1 function split and recorded a real teacher-history defect. This turn verified the current worker state and repaired the teacher UI.

`7860fc43`: the IM1 teacher form shows the selected class, student, lesson, answer, score, and time. It asks the teacher to confirm instruction. It freezes selection during the save, retains the exact request key after failure, and removes confirmed work from the choices. Two regressions failed before the repair. Four component tests pass with 100 percent line coverage and 92.85 percent branch coverage. Full IM1 lint, standalone TypeScript, and build pass.

A new parent test executes the actual Guided handler, candidate query, teacher mutation, and Independent handler in order. It confirms that both historical events remain and that replay does not repeat SRS updates. Three new candidate-identity cases failed. The query now checks the exact node, mode, and component. The combined seven-file suite passes 40 tests. Three separate teacher-route tests also pass. These app backend changes remain uncommitted while the dependency declaration request is pending.

The Precalculus worker attempted a broad patch in repeated writer code. It restored its owned files to the saved baseline. This rollback removed its uncommitted Topic 1.1 repair as well. The earlier passing repair tests do not describe the current implementation. The worker is recovering Topic 1.1 only with changes limited to named functions. Topic 1.2 and the remaining equivalent routes are still open.

The IM3 review found the same student Worked-to-teacher-origin error and a missing publication check in the evidence loader. The worker now owns the exact graph pilot trust-boundary repair. The Business Math worker is completing the real teacher UI and lesson/time checks. No course pilot is accepted.

## Lesson 4-1 identity and independent teacher review

The previous goal turn only restated the active objective. This turn continued source repair and independent review.

`f86a265b`: G10 corrects the three Lesson 4-1 example titles against the lesson body. It removes duplicate Example 2 identity `math.im1.example.4.1.003`. The retained identity is `math.im1.example.4.1.002`. All four duplicate edges have equivalent edges at the retained identity. The activity and teacher projections no longer count the duplicate source. Examples 1 and 3 retain IDs ending in `001` and `004`. No skill status, capability count, or practice mode changed. Two tests failed before the repair. All 13 related source tests pass. Full IM1 lint, standalone TypeScript, and build pass.

The source has a separate objective 4b for contextual intercept interpretation and equivalent equation forms. The graph still lacks that distinction. This remains Task 3.2 work. The embedded node catalogs also omit prior source repairs. G10 does not establish full catalog agreement. Historical alignment counters remain for Task 3.1 review.

The recovered Precalculus Topic 1.1 flow passed its author's tests. Independent review found two authorization gaps in the hypothetical approved path: missing organization equality and missing published lesson-to-activity validation. The current draft catalog still prevents activation. The reviewer now owns the bounded repair. Student wording and teacher context and interaction tests also remain open. See `precalc-topic11-independent-review.md`.

The Business Math teacher action and IM3 graph teacher action are available for independent review. Their author test results do not establish pilot acceptance. No source approval, dependency approval, deployment, or live database write occurred.

Independent Business Math review found missing evidence publication checks, archived-class authorization, and replay timestamp changes. Its assignment check uses student progress, which does not itself prove class assignment. The repair must first trace the Business Math access policy. It must not import another course's assignment model without source support. The reviewer now owns these repairs. See `bm2-teacher-independent-review.md`.

G11 now covers the source-supported Lesson 4-1 capability distinction. The source worker owns the bounded IM1 catalog edits. The parent owns count integration and independent acceptance.


## Lesson 4-1 capability inventory and IM3 boundary review

The previous goal turn committed G10 and independent teacher-flow findings. This turn completed G11 inventory restoration as `76e7654c`.

The contextual-intercept draft cites source Example 3. Independent review rejected the rewrite blueprint's links to Examples 1 and 2. Those examples use rearrangement only as a supporting step. The explicit rewrite objective remains a draft candidate with no worked-example links. Its full worked example and separate assessment remain missing. No practice readiness or curriculum approval changed.

The existing reports now record 161 skill candidates, six generator bindings, 155 gaps, and 157 blueprint rows. There are 25 source-only rows, 126 empty bundles, six schema-valid bundles, and four candidates with no blueprint. Three report regressions failed before the update. Twenty inventory tests pass. Eleven related source tests pass. IM1 and math-content lint, standalone TypeScript, and builds pass.

The parent IM3 review added five failing regressions. The teacher writer now checks learner and teacher organizations. The candidate query checks component and SRS policy. A reused key for another source now conflicts before same-source replay. Fifteen teacher tests pass. The two broader seed-2 failures came from a positive test fixture using the current draft seed, which sets SRS eligibility false. The fixture now explicitly supplies hypothetical approved publication. All 144 combined tests pass. The real catalog remains draft.

The IM3 author added published lesson-phase linkage and a positive teacher-to-Independent test. Independent review is checking whether that test proves the complete production flow. No IM3 pilot acceptance is recorded.

The Precalculus author repaired organization and published-source checks. Independent review is active. Its student wording and teacher UI state coverage remain open. Business Math now separates manual source publication from generated adaptive publication. Its product gives access to the full published curriculum and does not define class lesson assignments. The author reports 32 affected tests, full lint, TypeScript, and build passing. Integration and live verification remain open.


## Precalculus teacher confirmation interface

The previous goal turn committed G11 and verified bounded IM3 repairs. This turn implements Q5.

`3459b282` adds the standalone Topic 1.1 teacher confirmation control and four component tests. It shows the learner, lesson, activity, acknowledgement state, and source time. It locks controls during a request, retains selection after failure, and shows confirmed state from server data after a reload. Coverage is 95.45 percent for statements, 86.66 percent for branches, and 100 percent for lines and functions.

The existing teacher page now filters class choices by exact lesson assignment, active enrollment, and both source-time checks. Two integration tests pass. The student success message now states that the acknowledgement was saved. An obsolete test expected fabricated classification answers; it now requires the empty acknowledgement. Ten initial student/teacher UI tests pass. The coverage run and preserved physical-context handler tests pass 24 tests. Full Precalculus lint, standalone TypeScript, and build pass. Five unused test fixtures left by earlier Topic 1.1 changes were removed to restore full lint.

Independent review found a missing durable confirmed projection and missing time filters. The time filters and component reload behavior are repaired. The backend projection is in progress. The parent rejected a truncated 200-event lookup because it can miss recent confirmations. The worker is using exact visible source-submission indexes and adding a regression with more than 200 historical events. The existing page and backend integration remain uncommitted; no live acceptance is claimed.

G12 source edits are available for independent review. They add draft capabilities and missing source example identities. The author is updating the existing current-count reports. The parent has not accepted the G12 source mappings or expanded any activity projection from the candidate counts.

## Lesson 4-2 inventory and embedded graph consistency

The previous goal turn committed the Precalculus confirmation control and verified its interface integration. This turn completed G12 as `cadf514e`.

G12 adds six draft source capabilities and three missing source-example identities. It preserves the occupied example IDs. Independent review found no blocking source defect. The real-world-data capability has no direct example link. Source Examples 7 and 8 share an aggregate source section; distinct numerical practice still needs source prompts or reviewed replacements. The current inventory contains 167 skill candidates, six generator bindings, 161 gaps, and 163 blueprint rows. There are 31 source-only rows, 126 empty bundles, six schema-valid bundles, and four missing blueprints. Twelve source tests and 20 inventory tests pass. IM1 and math-content lint, standalone TypeScript, and builds pass.

`001b410b`: G13 repairs stale embedded node copies. The draft catalog matches the canonical nonstandard content, with intentional review-status differences. The course edge artifact lacked 10 current draft nodes and contained 32 stale source descriptions. The standard-alignment artifact also contained stale descriptions and missing draft nodes. Both now use current draft nodes and the 77 canonical standard nodes. This resolves 17 dangling endpoint references. Both edge arrays remain unchanged. No node or edge approval changed. Existing current alignment counters now reflect 931 alignment edges. Historical merge counters and timestamps remain unchanged.

Four regressions failed before G13. Five focused source-contract tests and 15 related source tests pass after the repair. Full IM1 lint, standalone TypeScript, and build pass. The final independent review passed.

The IM3 real production-flow test exposed a graph answer-key mismatch between the component and server grader. The author repaired the exact `table_values` and `placed_points` mappings. The test now calls actual student writers, the teacher mutation, the grading path, and the production evidence/SRS wrapper. Independent review is checking its mathematical oracle and replay coverage. The author is now applying the same production-flow verification to Precalculus. No signed-in browser journey or course pilot acceptance is recorded.

Precalculus now has a real production-flow test from Worked acknowledgement through teacher attestation, Guided grading, and Independent evidence/SRS. It tests incorrect answers, changed-answer conflicts, exact-node card updates, and replay. The author reports 122 focused tests passing. Independent review remains required. IM3 independent review found a missing composed replay test and insufficient same-source teacher replay identity checks. The reviewer now owns that bounded repair.

## G14 source correction and production-flow repairs

Lesson 4-3 source restoration is committed as `73280b7b`. Four draft capabilities match the explicit source goals. Examples 5 and 6 retain separate IDs and cite their shared section. The inventory now has 171 candidates, six generator bindings, and 165 binding gaps. Eight source tests and twenty inventory tests passed. App lint, standalone TypeScript, and build passed. Existing node identities and edges remain intact.

The IM2 production-flow review exposed invalid replay state, missing organization and component checks, and insufficient canonical teacher replay validation. The local repairs now preserve the actual Worked, Guided, teacher, and Independent sequence. Conflicting keys and malformed teacher receipts fail. Eighteen focused tests and app lint, TypeScript, curriculum checks, and build passed. These app changes remain pending integration.

The Precalculus final evidence writer now rejects stored Topic 1.1 Guided or Independent work after node or blueprint publication withdrawal. The flow tests use independently solved literal answers. Replays preserve one card and two review records after two Independent attempts. The final 247 focused tests, lint, and TypeScript passed. The build passed before the final test-quality and formatting changes. These app changes remain pending integration.

G15 starts the Lesson 4-4 source review. Shared IM3 renderer extraction continues. Source approval, browser acceptance, and all-course practice completion remain open.

## Shared IM3 graph save and answer contract

The parent reproduced three premature-save failures. The local shared renderer now waits for storage, blocks repeated pending clicks, and exposes a retry message. Independent review found incompatible answer keys between the rendered activity and the production writer. The renderer now uses the required snake_case keys. The table remains available after completion, so a student can correct it. Clearing a cell invalidates the stored table response.

Seven app graph tests and 31 shared graph tests passed. Shared and app lint, standalone TypeScript, and build passed. The rendered-UI-to-production-writer test and isolated commit extraction remain in progress. See `im3-shared-graph-durable-review.md`. No source approval or deployment occurred.

## G15 provisional source inventory

Commit `fe6476d9` records six provisional Lesson 4-4 goal candidates and corrects eight retained example titles. The extracted parent-function notation is ambiguous. The commit records that limit and grants no capability approval. Eight source tests, 36 coverage and audit tests, app lint, standalone TypeScript, and build passed. All previous IDs and edges remain intact. The current inventory has 177 provisional candidates, six generator bindings, and 171 gaps. G16 checks for the original worksheet.

## Shared renderer integration and G16 verification

Commit `4146100a` integrates the shared table-and-graph response contract. The extracted patch passed seven tests, lint, standalone TypeScript, and build in a HEAD source snapshot. A real app UI-to-server test verifies literal quadratic response scores of 1/2 and 2/2. App integration remains pending. Worked renderer extraction is next.

Commit `501c5952` corrects the Lesson 4-4 extraction note from the original DOCX. The parent reviewed the rendered fourth page. The worksheet confirms `f(x) = x` and asks students to reason about horizontal and vertical equivalence. Nine source checks, lint, standalone TypeScript, and build passed. The six goal candidates remain draft.

The BM2 review confirms that classification and totals do not prove complete accounting-equation event application. The next local component composes current controls with before-and-after response fields. It keeps explanation review manual and leaves publication disabled.

## Worked graph and IM2 student save integration

Commit `bca8c9e6` prevents repeated pending clicks from skipping a practice phase. Unchanged retries keep their request key. Edited answers get a new key. Five UI tests and 18 backend flow tests pass. IM2 lint, standalone TypeScript, and build pass. The backend changes remain pending integration.

Commit `1128aef8` repairs malformed SVG function paths. The curve now uses the same pixel coordinates as plotted points. Commit `83d0710d` adds the complete Worked quadratic view with steps, table, plotted points, domain, and range. Independent isolated checks and current-workspace checks pass. The current check covers one graph-core test and 12 activity-component tests. Both packages pass lint, standalone TypeScript, and build. These changes do not approve source content or complete the app pilot.

## G17 arithmetic sequence source review

Commit `de78dbca` restores seven provisional source capabilities and corrects four retained example descriptions. Independent review confirms the source mapping and the cooler model correction. Existing node IDs, edge arrays, and gap queue entries remain intact. The current inventory has 184 candidates, six bindings, and 178 gaps. Nine source tests and 40 inventory tests pass. IM1 lint, standalone TypeScript, and build pass. G18 continues the source review. Curriculum approval remains open.
